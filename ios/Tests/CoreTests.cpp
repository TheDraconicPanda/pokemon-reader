// SPDX-License-Identifier: GPL-3.0-or-later
#include "Core.h"
#include "TestROM.h"
#include "Platform.h"
#include <cstdlib>
#include <iostream>
#include <thread>
#include <stdexcept>
#include <cmath>
#define CHECK(x) do { if(!(x)) throw std::runtime_error("Failed: " #x); } while(0)
int main() {
    using namespace reader;
    Core core;std::string error;auto rom=test::rom();
    CHECK(!core.load(nullptr,0,nullptr,0,error));CHECK(!error.empty());
    auto truncated=rom;truncated[0x2F]=0xFF;
    CHECK(!core.load(truncated.data(),truncated.size(),nullptr,0,error));
    CHECK(!core.load(rom.data(),rom.size(),rom.data(),17,error));
    CHECK(core.load(rom.data(),rom.size(),nullptr,0,error));CHECK(error.empty());
    CHECK(core.gameCode=="####");
    double time=0;std::array<int16_t,4096> audio{};size_t sound=0;
    for(int i=0;i<8;++i){time+=core.step(1,20,30);sound+=core.readAudio(audio.data(),2048);}
    CHECK(core.diagnosticWord(0x1000)==42);CHECK(core.running());
    CHECK((core.diagnosticWord(0x1004)&1)==0);
    CHECK(time>0.10 && time<0.15);CHECK(sound>4000);
    std::array<uint32_t,Pixels*2> video{};core.copyVideo(video.data());
    std::cerr<<"Diagnostic screen colors: "<<std::hex<<video[0]<<" / "<<video[Pixels]<<std::dec<<"\n";
    // Native DS 5->6->8-bit conversion: 31 -> 62 -> 251, as implemented by
    // the software renderer, in BGRA memory order.
    CHECK(video[0]==0xFFFB0000);CHECK(video[Pixels]==0xFF00FB00);CHECK(core.copySave().empty());
    // Bad replacement must preserve the running instance.
    CHECK(!core.load(nullptr,0,nullptr,0,error));CHECK(core.running());
    CHECK(core.diagnosticWord(0x1000)==42);
    core.step(0);CHECK(core.diagnosticWord(0x1000)==42);CHECK((core.diagnosticWord(0x1004)&1)==1);
    AudioRing<8> ring;int16_t input[24],output[24];
    for(int i=0;i<24;++i)input[i]=int16_t(i+1);
    CHECK(ring.write(input,6)==6);CHECK(ring.read(output,4)==4);
    for(int i=0;i<8;++i)CHECK(output[i]==input[i]);
    CHECK(ring.write(input+12,6)==6);CHECK(ring.read(output,10)==8);
    for(int i=0;i<16;++i)CHECK(output[i]==input[i+8]);
    for(int i=16;i<20;++i)CHECK(output[i]==0);
    AudioRing<64> concurrent;std::atomic<bool> bad{false};
    std::thread producer([&]{for(int i=0;i<20000;++i){int16_t pair[]={int16_t(i%30000),int16_t(i%30000)};while(!concurrent.write(pair,1))std::this_thread::yield();}});
    for(int i=0;i<20000;++i){int16_t pair[2];while(!concurrent.read(pair,1))std::this_thread::yield();if(pair[0]!=i%30000||pair[1]!=pair[0])bad=true;}
    producer.join();CHECK(!bad.load());
    namespace P=melonDS::Platform;
    auto sem=P::Semaphore_Create();CHECK(!P::Semaphore_TryWait(sem,0));P::Semaphore_Post(sem,2);
    CHECK(P::Semaphore_TryWait(sem,0));P::Semaphore_Reset(sem);CHECK(!P::Semaphore_TryWait(sem,0));P::Semaphore_Free(sem);
    // File mode Preserve must never truncate an existing save.
    auto file=P::OpenFile("platform-test.bin",P::Write);CHECK(file);CHECK(P::FileWrite("save",1,4,file)==4);P::CloseFile(file);
    CHECK(P::CheckFileWritable("platform-test.bin"));file=P::OpenFile("platform-test.bin",P::Read);CHECK(P::FileLength(file)==4);
    char data[4];CHECK(P::FileRead(data,1,4,file)==4);CHECK(std::string(data,4)=="save");P::CloseFile(file);std::remove("platform-test.bin");
    std::cout<<"PASS: real melonDS ARM execution, frame timing, video, audio, input path, rejected imports, SPSC audio, semaphore and file preservation.\n";
}
