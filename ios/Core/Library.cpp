// SPDX-License-Identifier: GPL-3.0-or-later
#include "Library.h"
#include <algorithm>
#include <array>
#include <cerrno>
#include <cstring>
#include <fcntl.h>
#include <fstream>
#include <stdexcept>
#include <system_error>
#include <unistd.h>

namespace reader {
namespace fs = std::filesystem;
namespace {
uint32_t ror(uint32_t x, unsigned n) { return (x >> n) | (x << (32-n)); }
uint32_t le32(const uint8_t* p) { return p[0]|uint32_t(p[1])<<8|uint32_t(p[2])<<16|uint32_t(p[3])<<24; }
Bytes read(const fs::path& path, size_t limit) {
    auto size=fs::file_size(path);
    if(size>limit) throw std::runtime_error("Stored file exceeds its size limit: "+path.filename().string());
    std::ifstream f(path,std::ios::binary);Bytes result(size);
    if(!f || (size && !f.read(reinterpret_cast<char*>(result.data()),size)))
        throw std::runtime_error("Could not read stored file: "+path.filename().string());
    return result;
}
Bytes encoded(const std::string& text) { return {text.begin(),text.end()}; }
void ioError(const char* action) { throw std::system_error(errno,std::generic_category(),action); }
void syncDirectory(const fs::path& path) {
    int fd=open(path.c_str(),O_RDONLY|O_DIRECTORY);
    if(fd<0)ioError("Open storage directory");
    int status=fsync(fd),code=errno;close(fd);errno=code;
    if(status)ioError("Synchronize storage directory");
}
bool identity(const std::string& id) {
    return id.size()==64 && std::all_of(id.begin(),id.end(),[](char c){return (c>='0'&&c<='9')||(c>='a'&&c<='f');});
}
std::string systemName(const std::string& kind) {
    if(kind!="bios7"&&kind!="bios9"&&kind!="firmware")throw std::runtime_error("Unknown system file.");
    return kind+".bin";
}
bool systemSize(const std::string& kind,size_t n) {
    return kind=="bios7"?n==0x4000:kind=="bios9"?n==0x1000:n==0x20000||n==0x40000||n==0x80000;
}
Bytes envelope(const std::string& id,const Bytes& bytes) {
    auto result=encoded("RDSAVE2\n"+id+"\n"+sha256(bytes)+"\n");
    result.insert(result.end(),bytes.begin(),bytes.end());return result;
}
Bytes decode(const fs::path& path,const std::string& id) {
    auto data=read(path,8*1024*1024+138);
    if(data.size()<=138 || std::string(data.begin(),data.begin()+73)!="RDSAVE2\n"+id+"\n" || data[137]!='\n')
        throw std::runtime_error("Save identity or format is invalid.");
    Bytes payload(data.begin()+138,data.end());
    if(sha256(payload)!=std::string(data.begin()+73,data.begin()+137))throw std::runtime_error("Save integrity check failed.");
    return payload;
}
}
// FIPS 180-4 SHA-256; used for content identities and on-disk integrity, not
// authentication. Kept portable so the exact storage path can be fault-tested.
std::string sha256(const uint8_t* input,size_t length) {
    static constexpr uint32_t k[]={
      0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
      0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
      0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
      0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
      0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
      0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
      0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
      0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2};
    uint32_t h[]={0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19};
    const size_t blocks=(length+9+63)/64;
    for(size_t block=0;block<blocks;++block){
        uint32_t w[64]{};
        for(size_t i=0;i<64;++i){
            size_t at=block*64+i;uint8_t b=at<length?input[at]:at==length?0x80:0;
            if(at>=blocks*64-8)b=uint8_t(uint64_t(length)*8 >> ((blocks*64-1-at)*8));
            w[i/4]|=uint32_t(b)<<(24-(i%4)*8);
        }
        for(int i=16;i<64;++i)w[i]=w[i-16]+(ror(w[i-15],7)^ror(w[i-15],18)^(w[i-15]>>3))+w[i-7]+(ror(w[i-2],17)^ror(w[i-2],19)^(w[i-2]>>10));
        uint32_t a=h[0],b=h[1],c=h[2],d=h[3],e=h[4],f=h[5],g=h[6],v=h[7];
        for(int i=0;i<64;++i){uint32_t t=v+(ror(e,6)^ror(e,11)^ror(e,25))+((e&f)^(~e&g))+k[i]+w[i];
            uint32_t s=(ror(a,2)^ror(a,13)^ror(a,22))+((a&b)^(a&c)^(b&c));v=g;g=f;f=e;e=d+t;d=c;c=b;b=a;a=t+s;}
        h[0]+=a;h[1]+=b;h[2]+=c;h[3]+=d;h[4]+=e;h[5]+=f;h[6]+=g;h[7]+=v;
    }
    std::string result;const char* hex="0123456789abcdef";
    for(auto word:h)for(int shift=28;shift>=0;shift-=4)result+=hex[(word>>shift)&15];return result;
}
bool validROM(const uint8_t* rom,size_t size,std::string& error) {
    error.clear();
    if(!rom||size<4096||size>512ull*1024*1024){error="Choose an uncompressed DS ROM (4 KB to 512 MB).";return false;}
    if(rom[0x12]!=0){error="Original DS mode is supported; DSi titles are unavailable.";return false;}
    for(unsigned offset:{0x20u,0x30u}){auto at=le32(rom+offset),n=le32(rom+offset+12);
        if(at<0x200||n<4||(at&3)||(n&3)||at>size||n>size-at){error="Invalid or truncated ROM CPU program.";return false;}}
    return true;
}
bool validImport(const Bytes& data,const std::string& code,std::string& error) {
    error.clear();if(data.size()!=0x80000){error="Choose a raw 512 KB cartridge save; states and .dsv containers are not accepted.";return false;}
    bool ss=code=="IPGE",pt=code=="CPUE";
    if(!ss&&!pt){error="Save import currently supports original English SoulSilver and Platinum ROM codes only.";return false;}
    size_t general=ss?0xF628:0xCF2C,storageAt=ss?0xF700:0xCF2C,storage=ss?0x12310:0x121E4,footer=ss?16:20;
    auto valid=[&](size_t at,size_t n,int block){size_t end=at+n;uint16_t crc=0xFFFF;
        for(size_t i=at;i<end-footer;++i){crc^=uint16_t(data[i])<<8;for(int b=0;b<8;++b)crc=uint16_t((crc<<1)^((crc&0x8000)?0x1021:0));}
        auto magic=le32(data.data()+end-8);
        return le32(data.data()+end-12)==n && (magic==0x20060623||magic==0x20070903) &&
          (ss||data[end-4]==block) && crc==(data[end-2]|uint16_t(data[end-1])<<8);};
    for(size_t g:{0u,0x40000u})for(size_t s:{0u,0x40000u}){
        if(ss&&g!=s)continue;
        if(valid(g,general,0)&&valid(s+storageAt,storage,1)&&data[g+(ss?0x80:0x84)]==(ss?8:12)&&
           (ss||le32(data.data()+g+general-20)==le32(data.data()+s+storageAt+storage-20)))return true;
    }
    error="No coherent, checksum-valid save for this game was found. The current save has not been replaced.";return false;
}
Library::Library(fs::path path):root(fs::absolute(std::move(path))) {
    fs::create_directories(root/"games");fs::create_directories(root/"system");syncDirectory(root);syncDirectory(root.parent_path());
}
fs::path Library::game(const std::string& id) const {
    if(!identity(id))throw std::runtime_error("Invalid game identity.");return root/"games"/id;
}
void Library::atomicWrite(const fs::path& path,const Bytes& data) {
    if(fault)fault("before-create",path);
    auto staging=path;staging+=".staging";
    // A serial queue owns this directory; a leftover staging file is discarded.
    int fd=open(staging.c_str(),O_WRONLY|O_CREAT|O_TRUNC,0600);if(fd<0)ioError("Create save staging file");
    try {
        size_t at=0;while(at<data.size()){
            ssize_t n=write(fd,data.data()+at,std::min(size_t(65536),data.size()-at));
            if(n<0&&errno==EINTR)continue;if(n<=0){if(!n)errno=EIO;ioError("Write save staging file");}
            at+=size_t(n);if(fault)fault("after-write",path);
        }
        if(fsync(fd))ioError("Synchronize save staging file");
        if(fault)fault("after-sync",path);
        int result=close(fd);fd=-1;if(result)ioError("Close save staging file");
        if(fault)fault("before-rename",path);
        if(rename(staging.c_str(),path.c_str()))ioError("Commit save file");
        if(fault)fault("after-rename",path);
        syncDirectory(path.parent_path());
    } catch(...) { if(fd>=0)close(fd);std::error_code ignored;fs::remove(staging,ignored);throw; }
}
std::vector<GameEntry> Library::list() const {
    std::vector<GameEntry> result;
    for(auto& item:fs::directory_iterator(root/"games")){
        std::string id=item.path().filename().string();if(!identity(id)||!item.is_directory())continue;
        if(!fs::exists(item.path()/"name.txt")||!fs::exists(item.path()/"rom.nds"))continue;
        Bytes name;try{name=read(item.path()/"name.txt",1024);}catch(const std::exception&){name=encoded("DS game (name unavailable)");}
        std::ifstream f(item.path()/"rom.nds",std::ios::binary);char header[16]{};if(!f.read(header,16))continue;
        result.push_back({id,std::string(name.begin(),name.end()),std::string(header+12,4)});
    }
    std::sort(result.begin(),result.end(),[](const auto& a,const auto& b){return a.name<b.name;});return result;
}
GameEntry Library::importROM(const Bytes& data,const std::string& name) {
    std::string error;if(!validROM(data.data(),data.size(),error))throw std::runtime_error(error);
    auto id=sha256(data);auto folder=game(id);fs::create_directories(folder);syncDirectory(folder.parent_path());
    if(!fs::exists(folder/"rom.nds")||sha256(read(folder/"rom.nds",512ull*1024*1024))!=id)atomicWrite(folder/"rom.nds",data);
    auto display=name.empty()||name.size()>1024?"DS game.nds":name;
    if(!fs::exists(folder/"name.txt"))atomicWrite(folder/"name.txt",encoded(display));
    return {id,display,std::string(data.begin()+12,data.begin()+16)};
}
Bytes Library::rom(const std::string& id) const {
    auto data=read(game(id)/"rom.nds",512ull*1024*1024);
    if(sha256(data)!=id)throw std::runtime_error("Stored ROM integrity check failed. Import the same ROM again to repair its copy; saves are preserved.");return data;
}
SavedGame Library::save(const std::string& id) const {
    auto folder=game(id);bool current=fs::exists(folder/"save.current"),previous=fs::exists(folder/"save.previous");
    if(!current&&!previous)return {};
    if(current)try{return {decode(folder/"save.current",id),false};}catch(const std::exception&){}
    if(previous)try{return {decode(folder/"save.previous",id),true};}catch(const std::exception&){}
    throw std::runtime_error("The stored save and backup could not be verified. Files are preserved; import a known-good game save to recover.");
}
void Library::writeSave(const std::string& id,const Bytes& data) {
    if(data.empty()||data.size()>8*1024*1024)throw std::runtime_error("Invalid cartridge save size.");
    auto folder=game(id);if(!fs::exists(folder/"rom.nds"))throw std::runtime_error("This game is not in the library.");
    Bytes old;
    if(fs::exists(folder/"save.current"))try{old=decode(folder/"save.current",id);}catch(const std::exception&){}
    if(old==data)return;
    if(!old.empty())atomicWrite(folder/"save.previous",envelope(id,old));
    atomicWrite(folder/"save.current",envelope(id,data));
}
void Library::writeSystem(const std::string& kind,const Bytes& data) {
    auto name=systemName(kind);if(!systemSize(kind,data.size()))throw std::runtime_error("Incorrect BIOS/firmware size.");
    atomicWrite(root/"system"/name,data);
}
Bytes Library::system(const std::string& kind) const {
    auto path=root/"system"/systemName(kind);if(!fs::exists(path))return {};
    auto data=read(path,0x80000);if(!systemSize(kind,data.size()))throw std::runtime_error("Stored BIOS/firmware has an invalid size.");return data;
}
void Library::clearSystem() {
    for(auto kind:{"bios7","bios9","firmware"})fs::remove(root/"system"/systemName(kind));syncDirectory(root/"system");
}
void Library::backupBeforeState(const std::string& id) {
    SavedGame prior;
    try{prior=save(id);}catch(const std::exception&){
        // A good checkpoint can recover a game even when both cartridge files
        // are damaged. Preserve those raw files before any later normal save.
        for(const auto& name:{"save.current","save.previous"})if(std::filesystem::exists(game(id)/name))
            atomicWrite(game(id)/(std::string(name)+".before-state-damaged"),read(game(id)/name,8*1024*1024+138));
        return;
    }
    if(!prior.bytes.empty())atomicWrite(game(id)/"save.before-state",envelope(id,prior.bytes));
}
Bytes Library::saveBeforeState(const std::string& id) const {
    return decode(game(id)/"save.before-state",id);
}
}
