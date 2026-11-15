// SPDX-License-Identifier: GPL-3.0-or-later
// Browser adapter patterned after ios/Core/Core.cpp; no state or Reader API.
#include "session.h"
#include "Args.h"
#include "NDS.h"
#include "GPU3D_Soft.h"
#include "../../ios/Tests/TestROM.h"
#include <memory>
#include <algorithm>
#include <ctime>
static Session session;
static std::unique_ptr<melonDS::NDS> nds;
static uint32_t video[256*192*2];
static int16_t audio[4096*2];
static bool diagnostic=false;
extern "C" {
int b1_load(const uint8_t* rom,unsigned size,const uint8_t* save,unsigned length) {
    diagnostic=false;
    if(size<512||size>512*1024*1024||length>8*1024*1024||rom[0x12]!=0)return 0;
    auto word=[&](unsigned at){return uint32_t(rom[at])|(uint32_t(rom[at+1])<<8)|(uint32_t(rom[at+2])<<16)|(uint32_t(rom[at+3])<<24);};
    for(unsigned at:{0x20u,0x30u}){auto start=word(at),len=word(at+12);if(start<512||start>size||!len||len>size-start)return 0;}
    melonDS::NDSCart::NDSCartArgs cartArgs;
    if(length){cartArgs.SRAM=std::make_unique<uint8_t[]>(length);std::copy_n(save,length,cartArgs.SRAM.get());cartArgs.SRAMLength=length;}
    auto cart=melonDS::NDSCart::ParseROM(rom,size,&session,std::move(cartArgs));
    if(!cart)return 0;
    melonDS::NDSArgs args;
    args.OutputSampleRate=48000;
    auto next=std::make_unique<melonDS::NDS>(std::move(args),&session);
    next->SetNDSCart(std::move(cart));next->Reset();next->SetupDirectBoot("reader-browser.nds");
    static_cast<melonDS::SoftRenderer&>(next->GetRenderer3D()).SetThreaded(false,next->GPU);
    std::time_t now=std::time(nullptr);auto local=*std::localtime(&now);
    next->RTC.SetDateTime(local.tm_year+1900,local.tm_mon+1,local.tm_mday,local.tm_hour,local.tm_min,local.tm_sec);
    next->Start();nds=std::move(next);session={};return 1;
}
double b1_step(unsigned keys,int x,int y) {
    if(!nds||session.stopped||!nds->IsRunning())return 0;
    nds->SetKeyMask((~keys)&0xFFF);
    if(x>=0&&x<256&&y>=0&&y<192)nds->TouchScreen(x,y);else nds->ReleaseScreen();
    auto before=nds->GetSysClockCycles(0);nds->RunFrame();
    return double(nds->GetSysClockCycles(0)-before)/33513982.0;
}
uint32_t* b1_video(){
    if(nds)for(unsigned s=0;s<2;++s)std::copy_n(nds->GPU.Framebuffer[nds->GPU.FrontBuffer][s].get(),256*192,video+s*256*192);
    return video;
}
int16_t* b1_audio(){return audio;}
unsigned b1_audio_read(){return nds?nds->SPU.ReadOutput(audio,4096):0;}
const uint8_t* b1_save(){return nds?nds->GetNDSSave():nullptr;}
unsigned b1_save_size(){return nds?nds->GetNDSSaveLength():0;}
unsigned b1_revision(){return session.revision;}
const uint8_t* b1_diagnostic_rom(){return diagnostic&&nds?nds->GetNDSCart()->GetROM():nullptr;}
unsigned b1_diagnostic_rom_size(){return diagnostic&&nds?nds->GetNDSCart()->GetROMLength():0;}
unsigned b1_word(unsigned offset){return nds&&offset<=0x3FFFFC?*reinterpret_cast<uint32_t*>(nds->MainRAM+offset):0;}
int b1_diagnostic(const uint8_t* save,unsigned length,int hgss){
    auto rom=reader::test::rom();auto tiny=rom;rom.resize(0x10000);
    std::copy_n(tiny.data()+0x1000,0x1000,rom.data()+0x8000);
    std::copy_n(tiny.data()+0x2000,0x1000,rom.data()+0x9000);
    rom[0x21]=0x80;rom[0x31]=0x90; // retail cartridge layout with original ARM code
    memcpy(rom.data()+12,hgss?"IPGE":"CPUE",4);
    int result=b1_load(rom.data(),rom.size(),save,length);diagnostic=result;return result;
}
int b1_diagnostic_write(unsigned address,unsigned value){
    if(!diagnostic||!nds||address>=nds->GetNDSSaveLength())return 0;
    auto cart=nds->GetNDSCart();bool ir=cart->GetROM()[12]=='I';
    auto cmd=[&](std::initializer_list<uint8_t> data){unsigned pos=0;if(ir)cart->SPIWrite(0,pos++,false);for(auto b:data){cart->SPIWrite(b,pos,pos==data.size()+unsigned(ir)-1);++pos;}};
    cmd({6});cmd({0x0A,uint8_t(address>>16),uint8_t(address>>8),uint8_t(address),uint8_t(value)});return 1;
}
}
