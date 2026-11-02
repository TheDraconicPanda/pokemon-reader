// SPDX-License-Identifier: GPL-3.0-or-later
#include "Core.h"
#include "Library.h"
#include "Args.h"
#include "NDS.h"
#include "GPU3D_Soft.h"
#include "Savestate.h"
#include <stdexcept>
#include <chrono>
#include <algorithm>
#include <cstring>
#include <ctime>

namespace reader {
Core::Core() = default;
Core::~Core() = default;
static uint32_t word(const uint8_t* p) {
    return uint32_t(p[0]) | uint32_t(p[1])<<8 | uint32_t(p[2])<<16 | uint32_t(p[3])<<24;
}
bool Core::load(const uint8_t* rom, size_t size, const uint8_t* save, size_t saveSize,
                std::string& error, const std::vector<uint8_t>& bios7,
                const std::vector<uint8_t>& bios9, const std::vector<uint8_t>& firmware) {
    error.clear();
    if(!validROM(rom,size,error))return false;
    if(saveSize && (!save || saveSize<512 || saveSize>8*1024*1024 || (saveSize&(saveSize-1)))) {
        error = "Invalid raw cartridge save size."; return false;
    }
    if((!bios7.empty() && bios7.size()!=0x4000) || (!bios9.empty() && bios9.size()!=0x1000) ||
       (!firmware.empty() && firmware.size()!=0x20000 && firmware.size()!=0x40000 && firmware.size()!=0x80000)) {
        error = "Invalid DS BIOS/firmware size. ARM7: 16 KB; ARM9: 4 KB; firmware: 128/256/512 KB."; return false;
    }
    melonDS::NDSArgs args;
    args.JIT = std::nullopt;
    args.OutputSampleRate = SampleRate;
    if(!bios7.empty()) std::copy(bios7.begin(), bios7.end(), args.ARM7BIOS->begin());
    if(!bios9.empty()) std::copy(bios9.begin(), bios9.end(), args.ARM9BIOS->begin());
    if(!firmware.empty()) args.Firmware = melonDS::Firmware(firmware.data(), uint32_t(firmware.size()));
    melonDS::NDSCart::NDSCartArgs cartArgs;
    if(saveSize) {
        cartArgs.SRAM = std::make_unique<uint8_t[]>(saveSize);
        std::copy(save, save+saveSize, cartArgs.SRAM.get());
        cartArgs.SRAMLength = uint32_t(saveSize);
    }
    auto cart = melonDS::NDSCart::ParseROM(rom, uint32_t(size), this, std::move(cartArgs));
    if(!cart) { error = "melonDS could not load this cartridge."; return false; }
    auto next = std::make_unique<melonDS::NDS>(std::move(args), this);
    next->SetNDSCart(std::move(cart));
    next->Reset();
    next->SetupDirectBoot("reader-game.nds");
    auto& renderer = static_cast<melonDS::SoftRenderer&>(next->GetRenderer3D());
    renderer.SetThreaded(true, next->GPU);
    std::time_t now = std::time(nullptr);
    std::tm local{};
#ifdef _WIN32
    localtime_s(&local, &now);
#else
    localtime_r(&now, &local);
#endif
    next->RTC.SetDateTime(local.tm_year+1900, local.tm_mon+1, local.tm_mday,
                          local.tm_hour, local.tm_min, local.tm_sec);
    next->Start();
    nds = std::move(next);
    stopped.store(false);
    gameCode.assign(reinterpret_cast<const char*>(rom+0x0C), 4);
    saveRevision=0;
    auto identity=stateFormat()+"\n"+sha256(bios7)+"\n"+sha256(bios9)+"\n"+sha256(firmware);
    stateCompatibility=sha256(reinterpret_cast<const uint8_t*>(identity.data()),identity.size());
    readerBaseline(copySave(),uint64_t(std::chrono::duration_cast<std::chrono::milliseconds>(std::chrono::system_clock::now().time_since_epoch()).count()),"loaded-save");
    return true;
}
std::string Core::stateFormat() {
#if defined(__aarch64__) || defined(__arm64__)
    const char* arch="arm64";
#elif defined(__x86_64__)
    const char* arch="x86_64";
#else
    const char* arch="unsupported";
#endif
    return std::string("reader-state-1/melonDS-")+READER_CORE_REVISION+"/13.0/"+arch+"/le64/software-nojit";
}
std::vector<uint8_t> Core::captureState() {
    if(!running())throw std::runtime_error("No running console to checkpoint.");
    auto& renderer=static_cast<melonDS::SoftRenderer&>(nds->GetRenderer3D());
    renderer.SetThreaded(false,nds->GPU); // join rendering before serializing
    melonDS::Savestate state;
    bool ok=nds->DoSavestate(&state)&&!state.Error;
    renderer.SetThreaded(true,nds->GPU);
    if(!ok)throw std::runtime_error("The core could not capture a complete state.");
    auto begin=static_cast<const uint8_t*>(state.Buffer());return {begin,begin+state.Length()};
}
bool Core::restoreState(std::vector<uint8_t> state,std::string& error) {
    // Upstream FindSection does not reject zero-length sections. Validate the
    // complete section chain before it can read or loop on a malformed buffer.
    error="Invalid or incompatible state structure.";
    if(!nds||state.size()<32||state.size()>64*1024*1024||memcmp(state.data(),"MELN",4)||
       state[4]!=SAVESTATE_MAJOR||state[5]||state[6]!=SAVESTATE_MINOR||state[7]||word(state.data()+8)!=state.size())return false;
    size_t at=16;
    while(at<state.size()){
        if(state.size()-at<16)return false;size_t n=word(state.data()+at+4);
        if(n<16||n>state.size()-at)return false;at+=n;
    }
    auto& renderer=static_cast<melonDS::SoftRenderer&>(nds->GetRenderer3D());renderer.SetThreaded(false,nds->GPU);
    melonDS::Savestate file(state.data(),uint32_t(state.size()),false);
    bool ok=!file.Error&&nds->DoSavestate(&file)&&!file.Error;
    renderer.SetThreaded(true,nds->GPU);
    if(!ok)return false;
    nds->SetKeyMask(0xFFF);nds->ReleaseScreen();
    // Loading SRAM invokes WriteNDSSave. Suppress that restoration callback:
    // only a later real cartridge write may replace the durable game save.
    saveRevision=0;readerBaseline({},0,"restored-state");stopped=false;error.clear();return true;
}
void Core::readerBaseline(const Bytes& source,uint64_t capturedAt,const std::string& origin){saveObserver.initialize(gameCode,copySave(),source,capturedAt,origin);}
void Core::diagnosticSaveByte(unsigned address,uint8_t value) {
    if(!nds||!nds->GetNDSCart()||address>=nds->GetNDSSaveLength())return;
    auto cart=nds->GetNDSCart();
    auto command=[&](std::initializer_list<uint8_t> data){
        unsigned pos=0;if(gameCode=="IPGE")cart->SPIWrite(0,pos++,false);
        for(auto b:data){cart->SPIWrite(b,pos,pos==(data.size()+(gameCode=="IPGE"?1:0)-1));++pos;}
    };
    command({0x06});command({0x0A,uint8_t(address>>16),uint8_t(address>>8),uint8_t(address),value});
}
bool Core::running() const { return nds && nds->IsRunning() && !stopped.load(); }
double Core::step(uint16_t pressed, int x, int y) {
    if(!running()) return 0;
    nds->SetKeyMask((~pressed) & 0xFFF);
    if(x>=0 && x<256 && y>=0 && y<192) nds->TouchScreen(uint16_t(x), uint16_t(y));
    else nds->ReleaseScreen();
    auto before = nds->GetSysClockCycles(0);
    nds->RunFrame();
    saveObserver.poll(nds->GetNDSSave(),nds->GetNDSSaveLength(),uint64_t(std::chrono::duration_cast<std::chrono::milliseconds>(std::chrono::system_clock::now().time_since_epoch()).count()));
    auto after = nds->GetSysClockCycles(0);
    return double(after-before)/ClockHz;
}
void Core::diagnosticSaveRange(unsigned address,const Bytes& values){
    if(!nds||!nds->GetNDSCart()||address+values.size()>nds->GetNDSSaveLength())return;
    auto cart=nds->GetNDSCart();bool ir=gameCode=="IPGE";
    auto command=[&](const Bytes& data){unsigned pos=0;if(ir)cart->SPIWrite(0,pos++,false);for(auto byte:data){cart->SPIWrite(byte,pos,pos==data.size()+unsigned(ir)-1);++pos;}};
    for(size_t at=0;at<values.size();){size_t n=std::min(values.size()-at,size_t(256-((address+at)&255)));
        command({6});Bytes page={0x0A,uint8_t((address+at)>>16),uint8_t((address+at)>>8),uint8_t(address+at)};
        page.insert(page.end(),values.begin()+at,values.begin()+at+n);command(page);at+=n;}
}
void Core::copyVideo(uint32_t* destination) const {
    if(!nds) { std::fill(destination, destination+Pixels*2, 0xFF000000); return; }
    for(unsigned screen=0; screen<2; ++screen)
        std::copy_n(nds->GPU.Framebuffer[nds->GPU.FrontBuffer][screen].get(), Pixels, destination+Pixels*screen);
}
size_t Core::readAudio(int16_t* destination, size_t frames) {
    return nds ? size_t(nds->SPU.ReadOutput(destination, int(std::min(frames,size_t(4096))))) : 0;
}
std::vector<uint8_t> Core::copySave() const {
    if(!nds || !nds->GetNDSSaveLength()) return {};
    return {nds->GetNDSSave(), nds->GetNDSSave()+nds->GetNDSSaveLength()};
}
uint32_t Core::diagnosticWord(unsigned offset) const {
    if(!nds || offset > 0x3FFFFC) return 0;
    return word(nds->MainRAM+offset);
}
}
