// SPDX-License-Identifier: GPL-3.0-or-later
#include "Library.h"
#include "TestROM.h"
#include <fstream>
#include <iostream>
#include <stdexcept>
#include <cerrno>
#include <sys/wait.h>
#include <unistd.h>
#define CHECK(x) do { if(!(x))throw std::runtime_error("Failed: " #x); } while(0)
template<class F> void rejects(F f){bool failed=false;try{f();}catch(const std::exception&){failed=true;}CHECK(failed);}
int main(){
    using namespace reader;namespace fs=std::filesystem;
    auto root=fs::path("checkpoint-test-"+std::to_string(getpid()));fs::remove_all(root);
    try{
        Library store(root);auto rom=test::rom();auto game=store.importROM(rom,"First.nds");rom.back()=1;auto second=store.importROM(rom,"Second.nds");
        std::string compat(64,'a'),other(64,'b');Bytes state(200000,42),save(0x80000,11);
        uint32_t random=17;for(auto& byte:state){random=random*1664525+1013904223;byte=uint8_t(random>>24);}
        for(int i=1;i<=3;++i)store.writeState(game.id,"manual-"+std::to_string(i),compat,"test-state-1",state,save,100+i);
        for(int i=0;i<5;++i)store.writeState(game.id,"auto",compat,"test-state-1",state,save,200+i);
        auto list=store.states(game.id,compat);unsigned autos=0,manuals=0;for(auto& info:list){if(info.slot=="auto")++autos;else ++manuals;CHECK(info.usable);}
        CHECK(autos==3&&manuals==3);
        auto first=list.front();CHECK(first.timestamp==204);CHECK(first.slot=="auto");
        {std::fstream f(root/"games"/game.id/"states"/first.file,std::ios::binary|std::ios::in|std::ios::out);f.seekp(-1,std::ios::end);f.put(3);}
        rejects([&]{store.state(game.id,first.file,compat);});
        list=Library(root).states(game.id,compat);CHECK(list.front().timestamp==203);CHECK(list.front().usable);
        CHECK(fs::exists(root/"games"/game.id/"states"/first.file));
        auto incompatible=store.writeState(game.id,"auto",other,"different-core",state,save,300);
        rejects([&]{store.state(game.id,incompatible.file,compat);});
        store.writeState(game.id,"auto",compat,"test-state-1",state,save,400);
        CHECK(fs::exists(root/"games"/game.id/"states"/incompatible.file)); // preserved across upgrades
        for(const char* stage:{"before-create","after-write","after-sync","before-rename"}){
            store.fault=[&](auto at,auto path){if(at==stage&&path.filename()=="manual-1.chk")throw std::system_error(ENOSPC,std::generic_category());};
            rejects([&]{store.writeState(game.id,"manual-1",compat,"test-state-1",state,save,500);});
            CHECK(store.state(game.id,"manual-1.chk",compat).info.timestamp==101);
        }store.fault={};
        for(const char* stage:{"after-write","after-sync","before-rename","after-rename"}){
            pid_t child=fork();CHECK(child>=0);
            if(!child){Library killed(root);killed.fault=[&](auto at,auto path){if(at==stage&&path.extension()==".chk")_exit(73);};killed.writeState(game.id,"auto",compat,"test-state-1",state,save,600);_exit(74);}
            int status;waitpid(child,&status,0);CHECK(WIFEXITED(status)&&WEXITSTATUS(status)==73);
            auto recovered=Library(root).states(game.id,compat);CHECK(recovered.front().usable);CHECK(recovered.front().timestamp==400||recovered.front().timestamp==600);
            CHECK(store.state(game.id,"manual-2.chk",compat).info.timestamp==102);
        }
        fs::create_directories(root/"games"/second.id/"states");
        fs::copy_file(root/"games"/game.id/"states"/"manual-1.chk",root/"games"/second.id/"states"/"manual-1.chk");
        CHECK(!store.states(second.id,compat).front().usable);rejects([&]{store.state(second.id,"manual-1.chk",compat);});
        rejects([&]{store.state(game.id,"../../outside",compat);});rejects([&]{store.writeState(game.id,"manual-4",compat,"test",state,save,100);});
        store.writeSave(game.id,save);store.backupBeforeState(game.id);save[0]=12;store.writeSave(game.id,save);CHECK(store.saveBeforeState(game.id)[0]==11);
        {std::ofstream f(root/"games"/game.id/"save.current",std::ios::trunc);f<<"bad current";}
        {std::ofstream f(root/"games"/game.id/"save.previous",std::ios::trunc);f<<"bad previous";}
        store.backupBeforeState(game.id);CHECK(fs::exists(root/"games"/game.id/"save.current.before-state-damaged"));
        CHECK(store.saveBeforeState(game.id)[0]==11);
        std::cout<<"PASS: three manual slots, three automatic generations, independent histories, corruption fallback, incompatibility preservation, ENOSPC, process death and pre-restore backup.\n";
        fs::remove_all(root);
    }catch(...){fs::remove_all(root);throw;}
}
