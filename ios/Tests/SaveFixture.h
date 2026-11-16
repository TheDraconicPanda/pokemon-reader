// SPDX-License-Identifier: GPL-3.0-or-later
// Synthetic block envelopes only; not a playable Pokémon save.
#pragma once
#include "Library.h"
namespace reader::test {
inline Bytes save(bool platinum) {
    Bytes data(0x80000);auto word=[&](size_t at,uint32_t value){for(int i=0;i<4;++i)data[at+i]=uint8_t(value>>(i*8));};
    size_t general=platinum?0xCF2C:0xF628,offset=platinum?0xCF2C:0xF700,storage=platinum?0x121E4:0x12310;
    for(size_t partition:{0u,0x40000u}){
        data[partition+(platinum?0x84:0x80)]=platinum?12:8;
        for(int block=0;block<2;++block){size_t start=partition+(block?offset:0),size=block?storage:general,end=start+size;
            if(platinum)word(end-20,1);word(end-12,uint32_t(size));word(end-8,0x20060623);if(platinum)data[end-4]=uint8_t(block);
            uint16_t crc=0xFFFF;for(size_t i=start;i<end-(platinum?20:16);++i){crc^=uint16_t(data[i])<<8;for(int b=0;b<8;++b)crc=uint16_t((crc<<1)^((crc&0x8000)?0x1021:0));}
            data[end-2]=uint8_t(crc);data[end-1]=uint8_t(crc>>8);
        }
    }return data;
}
}
