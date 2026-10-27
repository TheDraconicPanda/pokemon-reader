// SPDX-License-Identifier: GPL-3.0-or-later
#include "Core.h"
#include "Args.h"
#include "NDS.h"
#include "GPU3D_Soft.h"
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
    if(!rom || size < 4096 || size > 512ull*1024*1024) {
        error = "Choose an uncompressed Nintendo DS ROM (4 KB to 512 MB)."; return false;
    }
    if(rom[0x12] != 0) { error = "This E1 build supports original DS mode, not DSi titles."; return false; }
    for(unsigned offset : {0x20u, 0x30u}) {
        uint32_t at = word(rom+offset), length = word(rom+offset+12);
        if(at < 0x200 || length < 4 || (at & 3) || (length & 3) ||
            at > size || length > size-at) {
            error = "The ROM has an invalid or truncated CPU program."; return false;
        }
    }
    if(saveSize && (!save || saveSize != 0x80000)) {
        error = "E1 accepts raw 512 KB SoulSilver/Platinum game saves, not save states."; return false;
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
    return true;
}
bool Core::running() const { return nds && nds->IsRunning() && !stopped.load(); }
double Core::step(uint16_t pressed, int x, int y) {
    if(!running()) return 0;
    nds->SetKeyMask((~pressed) & 0xFFF);
    if(x>=0 && x<256 && y>=0 && y<192) nds->TouchScreen(uint16_t(x), uint16_t(y));
    else nds->ReleaseScreen();
    auto before = nds->GetSysClockCycles(0);
    nds->RunFrame();
    auto after = nds->GetSysClockCycles(0);
    return double(after-before)/ClockHz;
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
