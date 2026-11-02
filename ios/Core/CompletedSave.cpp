// SPDX-License-Identifier: GPL-3.0-or-later
#include "CompletedSave.h"
#include <algorithm>
#include <cstring>
namespace reader {
namespace {
uint32_t word(const uint8_t* p){return p[0]|uint32_t(p[1])<<8|uint32_t(p[2])<<16|uint32_t(p[3])<<24;}
struct Block {unsigned at,size,footer;bool valid=false;uint32_t major=0,minor=0;Bytes stamp;};
std::array<Block,4> blocks(const std::string& code,const uint8_t* data,size_t size){
    bool ss=code=="IPGE";std::array<Block,4> result{};
    for(unsigned i=0;i<4;++i){unsigned partition=i/2,type=i%2;
        auto& b=result[i];b.at=partition*0x40000+(type?(ss?0xF700:0xCF2C):0);b.size=type?(ss?0x12310:0x121E4):(ss?0xF628:0xCF2C);b.footer=ss?16:20;
        if(!data||size!=0x80000)continue;auto end=b.at+b.size;const auto* footer=data+end-b.footer;
        b.stamp.assign(footer,footer+b.footer);b.major=word(footer);b.minor=ss?0:word(footer+4);
        auto magic=word(data+end-8);
        if(word(data+end-12)!=b.size||(magic!=0x20060623&&magic!=0x20070903)||data[end-4]!=type||(ss&&data[end-3]!=0))continue;
        uint16_t crc=0xFFFF;for(unsigned at=b.at;at<end-b.footer;++at){crc^=uint16_t(data[at])<<8;for(int n=0;n<8;++n)crc=uint16_t((crc<<1)^((crc&0x8000)?0x1021:0));}
        b.valid=crc==(data[end-2]|uint16_t(data[end-1])<<8);
        if(!type&&data[partition*0x40000+(ss?0x80:0x84)]!=(ss?8:12))b.valid=false;
    }return result;
}
int compare(uint32_t a,uint32_t b){if(a==0xFFFFFFFF&&b==0)return -1;if(a==0&&b==0xFFFFFFFF)return 1;return a>b?1:a<b?-1:0;}
bool newer(const Block& a,const Block& b){int c=compare(a.major,b.major);return c?c>0:compare(a.minor,b.minor)>0;}
bool select(const std::string& code,const std::array<Block,4>& b,unsigned& general,unsigned& storage,bool fallback){
    unsigned order[2]={0,2};if(!b[0].valid||(b[2].valid&&newer(b[2],b[0])))std::swap(order[0],order[1]);
    for(auto g:order){if(!b[g].valid)continue;
        if(code=="IPGE"){auto s=g+1;if(b[s].valid&&b[s].major==b[g].major){general=g;storage=s;return true;}}
        else{unsigned s=1;bool found=false;for(unsigned candidate:{1u,3u})if(b[candidate].valid&&b[candidate].major==b[g].major&&(!found||newer(b[candidate],b[s]))){s=candidate;found=true;}
            if(found){general=g;storage=s;return true;}}
        if(!fallback)return false; // newest general is unfinished: no old-pair publication
    }return false;
}
}
void SaveObserver::initialize(const std::string& game,const Bytes& current,const Bytes& baseline,uint64_t timestamp,const std::string& origin){
    code=game;coverage={};bodyDirty={};dirty=false;completed={};
    auto present=blocks(code,current.data(),current.size());for(unsigned i=0;i<4;++i)seen[i]=present[i].stamp;
    if(code!="IPGE"&&code!="CPUE")return;
    auto initial=blocks(code,baseline.data(),baseline.size());unsigned general=0,storage=0;
    if(select(code,initial,general,storage,true))completed={baseline,general/2,storage/2,timestamp,1,origin};
}
void SaveObserver::wrote(unsigned offset,unsigned length){
    if(code!="IPGE"&&code!="CPUE")return;
    auto layout=blocks(code,nullptr,0);
    for(unsigned i=0;i<4;++i){auto at=layout[i].at+layout[i].size-layout[i].footer;
        // A new body/delta write starts a new attempt. Footer coverage from an
        // interrupted earlier attempt must not satisfy this attempt's commit.
        auto begin=offset%0x80000;uint64_t end=uint64_t(begin)+length;
        auto intersects=[&](uint64_t a,uint64_t b){return a<at&&b>layout[i].at;};
        if(length>=0x80000||intersects(begin,std::min<uint64_t>(end,0x80000))||(end>0x80000&&intersects(0,end-0x80000))){coverage[i]=0;bodyDirty[i]=true;}
        for(unsigned bit=0;bit<layout[i].footer;++bit)if(((at+bit+0x80000-(offset%0x80000))%0x80000)<length){coverage[i]|=1u<<bit;dirty=true;}}
}
void SaveObserver::poll(const uint8_t* data,size_t size,uint64_t timestamp){
    if(!dirty)return;dirty=false;
    auto b=blocks(code,data,size);unsigned g=0,s=0;if(!select(code,b,g,s,false))return;
    for(unsigned selected:{g,s})if(bodyDirty[selected]&&coverage[selected]!=((1u<<b[selected].footer)-1))return;
    auto changed=[&](unsigned i){return coverage[i]==((1u<<b[i].footer)-1)&&b[i].stamp!=seen[i];};
    if(code=="IPGE"?!(changed(g)&&changed(s)):!(changed(g)||changed(s)))return;
    completed={Bytes(data,data+size),g/2,s/2,timestamp,completed.serial+1,"completed-write"};
    for(unsigned i=0;i<4;++i)seen[i]=b[i].stamp;coverage={};bodyDirty={};
}
}
