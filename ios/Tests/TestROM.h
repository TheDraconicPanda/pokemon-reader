// SPDX-License-Identifier: GPL-3.0-or-later
// Original, tiny ARM program; contains no Nintendo game or BIOS data.
#pragma once
#include <cstdint>
#include <cstring>
#include <vector>
namespace reader::test {
inline std::vector<uint8_t> rom() {
    std::vector<uint8_t> bytes(0x4000,0);
    auto set=[&](unsigned at,uint32_t value){for(unsigned i=0;i<4;++i)bytes[at+i]=uint8_t(value>>(8*i));};
    memcpy(bytes.data(),"READER TEST",11);memcpy(bytes.data()+12,"####",4);
    set(0x20,0x1000);set(0x24,0x02000000);set(0x28,0x02000000);
    set(0x30,0x2000);set(0x34,0x03800000);set(0x38,0x03800000);set(0x3C,4);
    std::vector<uint32_t> code;
    struct Literal { unsigned at,reg; uint32_t value; };std::vector<Literal> literals;
    auto ldr=[&](unsigned reg,uint32_t value){literals.push_back({unsigned(code.size()),reg,value});code.push_back(0);};
    // Set up actual VRAM display (red top), a green sub-screen backdrop, then
    // write a CPU fingerprint and continuously mirror KEYINPUT into main RAM.
    ldr(4,0x04000240);code.push_back(0xE3A01080);code.push_back(0xE5C41000); // VRAM A -> LCDC
    ldr(4,0x04000000);ldr(1,0x00020000);code.push_back(0xE5841000);
    ldr(4,0x06800000);code.push_back(0xE3A0101F);ldr(2,256*192);
    unsigned fill=unsigned(code.size());
    code.push_back(0xE1C410B0);code.push_back(0xE2844002);code.push_back(0xE2522001);
    code.push_back(0x1A000000 | ((int(fill)-int(code.size())-2)&0xFFFFFF));
    ldr(4,0x04001000);ldr(1,0x00010000);code.push_back(0xE5841000);
    ldr(4,0x05000400);ldr(1,0x03E0);code.push_back(0xE1C410B0);
    ldr(0,0x02001000);code.push_back(0xE3A0102A);code.push_back(0xE5801000);
    ldr(2,0x04000130);unsigned input=unsigned(code.size());
    code.push_back(0xE1D230B0);code.push_back(0xE5803004);
    code.push_back(0xEA000000 | ((int(input)-int(code.size())-2)&0xFFFFFF));
    for(auto literal:literals){
        int displacement=int(code.size()*4)-int(literal.at*4+8);
        code[literal.at]=0xE59F0000 | (literal.reg<<12) | unsigned(displacement);
        code.push_back(literal.value);
    }
    set(0x2C,uint32_t(code.size()*4));
    for(unsigned i=0;i<code.size();++i)set(0x1000+4*i,code[i]);
    set(0x2000,0xEAFFFFFE); // ARM7: b .
    return bytes;
}
}
