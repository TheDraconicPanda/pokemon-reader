// SPDX-License-Identifier: GPL-3.0-or-later
#include "Library.h"
#include "Input.h"
#include "TestROM.h"
#include "SaveFixture.h"
#include <fstream>
#include <cerrno>
#include <iostream>
#include <stdexcept>
#include <sys/wait.h>
#include <unistd.h>
#define CHECK(x) do { if(!(x)) throw std::runtime_error("Failed: " #x); } while(0)
template<class F> void rejects(F f) { bool failed=false;try{f();}catch(const std::exception&){failed=true;}CHECK(failed); }
int main(int argc,char** argv) {
    using namespace reader;namespace fs=std::filesystem;
    fs::path root="library-test-"+std::to_string(getpid());fs::remove_all(root);
    try {
        CHECK(sha256(nullptr,0)=="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
        CHECK(sha256(reinterpret_cast<const uint8_t*>("abc"),3)=="ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
        Bytes million(1000000,'a');CHECK(sha256(million)=="cdc76e5c9914fb9281a1c7e284d73e67f1809a48a497200e046d39ccc7112cd0");
        auto source=test::rom();std::copy_n("CPUE",4,source.data()+12);
        Library library(root);auto first=library.importROM(source,"Platinum.nds");
        CHECK(library.list().size()==1);CHECK(library.rom(first.id)==source);
        CHECK(library.importROM(source,"Renamed.nds").id==first.id);CHECK(library.list().size()==1);
        auto variant=source;variant.back()^=1;auto second=library.importROM(variant,"Platinum patched.nds");
        CHECK(first.id!=second.id);CHECK(library.list().size()==2);
        auto ssROM=source;std::copy_n("IPGE",4,ssROM.data()+12);auto silver=library.importROM(ssROM,"SoulSilver.nds");
        auto pt=test::save(true),ss=test::save(false);std::string error;
        CHECK(validImport(pt,"CPUE",error));CHECK(validImport(ss,"IPGE",error));
        CHECK(!validImport(pt,"IPGE",error));CHECK(!validImport(ss,"CPUE",error));
        CHECK(!validImport(Bytes(0x80000),"CPUE",error));CHECK(!validImport(Bytes(17),"IPGE",error));
        auto bad=pt;bad[0x40000+0x100]^=1;bad[0x100]^=1;CHECK(!validImport(bad,"CPUE",error));
        bad=pt;bad[0x40000+0x100]^=1;CHECK(validImport(bad,"CPUE",error));
        bad=pt;bad[0xCF2C+0x121E4-20]=99;bad[0x40000+0xCF2C+0x121E4-20]=99;CHECK(!validImport(bad,"CPUE",error));
        library.writeSave(first.id,pt);library.writeSave(silver.id,ss);CHECK(library.save(second.id).bytes.empty());
        auto newer=pt;newer[0x30000]=7;library.writeSave(first.id,newer);
        CHECK(Library(root).save(first.id).bytes==newer);CHECK(Library(root).save(silver.id).bytes==ss);
        // ENOSPC at creation, after an actual partial write, sync failure, and
        // interruption before rename leave a committed old save available.
        auto latest=newer;latest[0x30000]=8;
        for(const char* target:{"save.previous","save.current"})for(const char* stage:{"before-create","after-write","after-sync","before-rename"}){
            library.fault=[&](const auto& at,const auto& path){if(at==stage&&path.filename()==target)throw std::system_error(ENOSPC,std::generic_category());};
            rejects([&]{library.writeSave(first.id,latest);});CHECK(Library(root).save(first.id).bytes==newer);
        }
        library.fault={};
        // Real process termination at each transaction boundary, including
        // after rename, bypasses cleanup. Relaunch sees old OR completed new.
        for(const char* target:{"save.previous","save.current"})for(const char* stage:{"after-write","after-sync","before-rename","after-rename"}){
            library.writeSave(first.id,newer);
            pid_t child=fork();CHECK(child>=0);
            if(child==0){Library crashed(root);crashed.fault=[&](const auto& at,const auto& path){if(at==stage&&path.filename()==target)_exit(73);};crashed.writeSave(first.id,latest);_exit(74);}
            int status=0;waitpid(child,&status,0);CHECK(WIFEXITED(status)&&WEXITSTATUS(status)==73);
            auto saved=Library(root).save(first.id).bytes;CHECK(saved==newer||saved==latest);
        }
        library.writeSave(first.id,newer);library.writeSave(first.id,latest);
        auto current=root/"games"/first.id/"save.current";
        {std::ofstream f(current,std::ios::binary|std::ios::trunc);f<<"corrupt";}
        auto fallback=Library(root).save(first.id);CHECK(fallback.recovered);CHECK(fallback.bytes==newer);
        // Do not overwrite the valid fallback while repairing a bad current.
        library.writeSave(first.id,latest);CHECK(!library.save(first.id).recovered);
        fs::copy_file(root/"games"/silver.id/"save.current",current,fs::copy_options::overwrite_existing);
        CHECK(library.save(first.id).recovered);CHECK(library.save(first.id).bytes==newer);
        fs::remove(root/"games"/first.id/"save.previous");rejects([&]{library.save(first.id);});
        library.writeSave(first.id,pt);CHECK(library.save(first.id).bytes==pt);
        rejects([&]{library.rom("../../outside");});rejects([&]{library.writeSave(second.id,{});});
        rejects([&]{library.importROM(Bytes(4096),"bad.nds");});CHECK(library.list().size()==3);
        auto interrupted=source;interrupted.back()^=2;
        library.fault=[](const auto& at,const auto& path){if(at=="before-rename"&&path.filename()=="name.txt")throw std::system_error(ENOSPC,std::generic_category());};
        rejects([&]{library.importROM(interrupted,"Interrupted.nds");});CHECK(Library(root).list().size()==3);
        library.fault={};library.importROM(interrupted,"Interrupted.nds");CHECK(Library(root).list().size()==4);
        {std::ofstream f(root/"games"/second.id/"rom.nds",std::ios::binary|std::ios::trunc);f<<"truncated";}
        rejects([&]{library.rom(second.id);});CHECK(library.importROM(variant,"Repair.nds").id==second.id);CHECK(library.rom(second.id)==variant);
        library.writeSystem("bios7",Bytes(0x4000,42));CHECK(Library(root).system("bios7")==Bytes(0x4000,42));
        rejects([&]{library.writeSystem("bios7",Bytes(3));});CHECK(library.system("bios7").size()==0x4000);
        library.clearSystem();CHECK(library.system("bios7").empty());
        // Core-independent same-code variants must not share cartridge saves.
        CHECK(library.save(second.id).bytes.empty());
        if(argc>1){
            // Independent PKHeX-created fixture, then exact raw export for a
            // separate invocation of the existing JavaScript Reader parser.
            std::ifstream f(argv[1],std::ios::binary);Bytes fixture((std::istreambuf_iterator<char>(f)),{});
            CHECK(validImport(fixture,"CPUE",error));library.writeSave(first.id,fixture);
            auto exported=Library(root).save(first.id).bytes;CHECK(exported==fixture);
            std::ofstream out("e2-exported-platinum.sav",std::ios::binary);out.write(reinterpret_cast<const char*>(exported.data()),exported.size());
        }
        InputState input;input.touchKeys=1;input.controllerKeys=2;input.keyboardKeys=4;CHECK(input.keys()==7);
        input.touchKeys=0;CHECK(input.keys()==6);input.setTouch(255,191);CHECK(input.touch.load()==(255|(191<<8)));
        input.clear();CHECK(input.keys()==0);CHECK(input.touch.load()==0xFFFFFFFF);
        for(auto size:{std::pair<double,double>{256,384},{512,768},{800,400},{390,600}}){
            auto r=screenLayout(size.first,size.second);
            auto p=mapTouch(size.first,size.second,r.left+(20.5+(r.wide?256:0))*r.scale,r.top+(30.5+(r.wide?0:192))*r.scale);CHECK(p.x==20&&p.y==30);
            CHECK(mapTouch(size.first,size.second,r.left,r.top).x==-1);
            CHECK(mapTouch(size.first,size.second,r.left+r.width,r.top+20*r.scale).x==-1);
        }
        CHECK(mapTouch(0,0,0,0).x==-1);
        fs::remove_all(root);
        std::cout<<"PASS: content identity, isolation, integrity, ENOSPC, partial writes, process death, backup fallback, system persistence, raw export and input/layout mapping.\n";
    }catch(...){fs::remove_all(root);throw;}
}
