// SPDX-License-Identifier: GPL-3.0-or-later
#include "Core.h"
#include "TestROM.h"
#include <fstream>
#include <iostream>
#include <stdexcept>
#define CHECK(x) do {if(!(x))throw std::runtime_error("Failed: " #x);}while(0)
reader::Bytes read(const std::string& path){std::ifstream f(path,std::ios::binary);return {std::istreambuf_iterator<char>(f),{}};}
void write(const std::string& path,const reader::Bytes& data){std::ofstream f(path,std::ios::binary);f.write(reinterpret_cast<const char*>(data.data()),data.size());}
int main(int argc,char** argv){
    using namespace reader;CHECK(argc==2);std::string folder=argv[1],error;
    auto rom=test::rom();rom.resize(0x10000);auto tiny=test::rom();std::copy_n(tiny.data()+0x1000,0x1000,rom.data()+0x8000);std::copy_n(tiny.data()+0x2000,0x1000,rom.data()+0x9000);rom[0x21]=0x80;rom[0x31]=0x90;
    for(const std::string game:{"soulsilver","platinum"}){
        bool ss=game=="soulsilver";const char* code=ss?"IPGE":"CPUE";std::copy_n(code,4,rom.data()+12);
        auto before=read(folder+"/reader-"+game+"-before.sav"),after=read(folder+"/reader-"+game+"-after.sav");CHECK(before.size()==0x80000&&after.size()==0x80000);
        Core core;CHECK(core.load(rom.data(),rom.size(),before.data(),before.size(),error));CHECK(!core.readerSave().bytes.empty());
        auto original=core.readerSave();auto oldState=core.captureState();unsigned general=ss?0xF628:0xCF2C,storageAt=ss?0xF700:0xCF2C,storage=ss?0x12310:0x121E4,footer=ss?16:20;
        auto transfer=[&](unsigned address,const Bytes& source,unsigned start,unsigned count){core.diagnosticSaveRange(address,Bytes(source.begin()+start,source.begin()+start+count));core.step(0);};
        if(!ss){
            // A failed attempt's primary-footer coverage cannot commit the next
            // attempt when only its secondary footer and PC have been written.
            transfer(0x40000+general-footer,after,0x40000+general-footer,10);
            transfer(0x40000,after,0x40000,general-footer);
            transfer(0x40000+general-10,after,0x40000+general-10,10);
            transfer(0x40000+storageAt,after,0x40000+storageAt,storage);
            CHECK(core.readerSave().serial==original.serial);
            CHECK(core.restoreState(oldState,error));core.readerBaseline(before,original.capturedAt,"retry-test-reset");original=core.readerSave();
        }
        // Replay the pinned routines' body/secondary-footer/final-footer order
        // through real Platinum and IR cartridge SPI commands and callbacks.
        transfer(0x40000,after,0x40000,general-footer);CHECK(core.readerSave().serial==original.serial);
        if(!ss){transfer(0x40000+general-10,after,0x40000+general-10,10);CHECK(core.readerSave().serial==original.serial);}
        transfer(0x40000+general-footer,after,0x40000+general-footer,ss?footer:10);CHECK(core.readerSave().serial==original.serial);
        for(int i=0;i<5;++i)core.step(0);CHECK(core.readerSave().serial==original.serial); // quiet does not mean complete
        transfer(0x40000+storageAt,after,0x40000+storageAt,storage-footer);CHECK(core.readerSave().serial==original.serial);
        unsigned first=ss?8:10;transfer(0x40000+storageAt+storage-first,after,0x40000+storageAt+storage-first,first);CHECK(core.readerSave().serial==original.serial);
        transfer(0x40000+storageAt+storage-footer,after,0x40000+storageAt+storage-footer,footer-first);
        auto completed=core.readerSave();CHECK(completed.serial>original.serial);CHECK(completed.general==1&&completed.storage==1);CHECK(completed.origin=="completed-write");
        transfer(0x40000+storageAt+storage-footer,after,0x40000+storageAt+storage-footer,footer);CHECK(core.readerSave().serial==completed.serial);
        write(folder+"/reader-"+game+"-completed.sav",completed.bytes);
        auto state=core.captureState();CHECK(core.restoreState(state,error));CHECK(core.readerSave().bytes.empty());
        core.readerBaseline(completed.bytes,completed.capturedAt,"retained-after-state");CHECK(core.readerSave().bytes==completed.bytes);
        CHECK(core.restoreState(oldState,error));CHECK(core.readerSave().bytes.empty());
        core.readerBaseline(completed.bytes,completed.capturedAt,"retained-before-rollback");
        auto rollback=before;for(unsigned type=0;type<2;++type){unsigned at=0x40000+(type?storageAt:0),size=type?storage:general;rollback[at+size-footer]=2;if(!ss)rollback[at+size-footer+4]=2;}
        transfer(0x40000,rollback,0x40000,general);CHECK(core.readerSave().bytes==completed.bytes);
        transfer(0x40000+storageAt,rollback,0x40000+storageAt,storage);CHECK(core.readerSave().origin=="completed-write");CHECK(core.readerSave().bytes!=completed.bytes);
        // Return to the later state to exercise Platinum's normal-only update.
        CHECK(core.restoreState(state,error));core.readerBaseline(completed.bytes,completed.capturedAt,"retained-after-state");
        if(!ss){
            // Normal-only Platinum saves keep the global generation and the
            // existing PC block, but advance the general block counter.
            Bytes normal=after;std::copy_n(after.data()+0x40000,general,normal.data());normal[general-16]=3;
            auto baseline=core.readerSave().serial;
            transfer(0,normal,0,general-footer);transfer(general-10,normal,general-10,10);CHECK(core.readerSave().serial==baseline);
            transfer(general-footer,normal,general-footer,10);CHECK(core.readerSave().serial>baseline);CHECK(core.readerSave().general==0&&core.readerSave().storage==1);
        }
    }
    std::cout<<"PASS: native HGSS/Platinum SPI completion sequences, partial/secondary footers, stale backup rejection, repeated writes, normal-only saves and state barriers.\n";
}
