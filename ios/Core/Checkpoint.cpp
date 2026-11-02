// SPDX-License-Identifier: GPL-3.0-or-later
#include "Library.h"
#include <algorithm>
#include <fstream>
#include <limits>
#include <sstream>
#include <stdexcept>
#include <fcntl.h>
#include <unistd.h>
#include <zlib.h>
namespace reader {
namespace fs=std::filesystem;
namespace {
constexpr size_t MaxState=64*1024*1024,MaxSave=8*1024*1024;
bool hex(const std::string& s){return s.size()==64&&std::all_of(s.begin(),s.end(),[](char c){return (c>='0'&&c<='9')||(c>='a'&&c<='f');});}
uint64_t number(const std::string& s){
    if(s.empty()||s.size()>20||s.find_first_not_of("0123456789")!=s.npos)throw std::runtime_error("Invalid checkpoint number.");
    size_t used=0;auto n=std::stoull(s,&used);if(used!=s.size())throw std::runtime_error("Invalid checkpoint number.");return n;
}
bool filename(const std::string& s){return !s.empty()&&s.size()<128&&s.find_first_not_of("abcdefghijklmnopqrstuvwxyz0123456789-.")==s.npos&&s.find("..") == s.npos;}
bool manual(const std::string& s){return s=="manual-1"||s=="manual-2"||s=="manual-3";}
StateRecord decode(const fs::path& file,const std::string& rom,const std::string& compatibility,bool expand=true){
    auto length=fs::file_size(file);if(length<32||length>compressBound(MaxState+MaxSave)+1024)throw std::runtime_error("Invalid checkpoint size.");
    std::ifstream f(file,std::ios::binary);std::vector<std::string> fields;std::string line,header;
    // Nine bounded metadata lines, then a SHA-256 covering metadata + payload.
    for(int i=0;i<10;++i){line.clear();char c;while(f.get(c)&&c!='\n'){if(line.size()>=256)throw std::runtime_error("Invalid checkpoint header.");line+=c;}
        if(!f)throw std::runtime_error("Truncated checkpoint header.");fields.push_back(line);if(i<9)header+=line+"\n";}
    if(fields[0]!="RDSTATE1Z"||fields[1]!=rom||!hex(fields[2])||!hex(fields[9]))throw std::runtime_error("Checkpoint ROM identity or format is invalid.");
    uint64_t stamp=number(fields[4]),seq=number(fields[5]),saveSize=number(fields[6]),stateSize=number(fields[7]);
    if(!stamp||stateSize<16||stateSize>MaxState||saveSize>MaxSave||(!manual(fields[8])&&fields[8]!="auto"))throw std::runtime_error("Invalid checkpoint metadata.");
    auto start=f.tellg();if(start<0||uint64_t(start)+8>length)throw std::runtime_error("Incomplete checkpoint payload.");
    Bytes compressed(length-uint64_t(start));if(!f.read(reinterpret_cast<char*>(compressed.data()),compressed.size()))throw std::runtime_error("Checkpoint could not be read.");
    Bytes authenticated(header.begin(),header.end());authenticated.insert(authenticated.end(),compressed.begin(),compressed.end());
    if(sha256(authenticated)!=fields[9])throw std::runtime_error("Checkpoint integrity check failed.");
    if(fields[2]!=compatibility)throw std::runtime_error("Different core, state format, architecture or DS system files. Checkpoint preserved.");
    StateInfo info{file.filename().string(),fields[8],fields[2],fields[3],"",stamp,seq,true,length};
    if(!expand)return {info,{},{}};
    Bytes payload(saveSize+stateSize);uLongf expanded=payload.size();
    if(uncompress(payload.data(),&expanded,compressed.data(),compressed.size())!=Z_OK||expanded!=payload.size())throw std::runtime_error("Checkpoint decompression failed.");
    return {info,
      Bytes(payload.begin()+saveSize,payload.end()),Bytes(payload.begin(),payload.begin()+saveSize)};
}
}
std::vector<StateInfo> Library::states(const std::string& id,const std::string& compatibility) const {
    auto folder=game(id)/"states";std::vector<StateInfo> result;if(!fs::exists(folder))return result;
    for(const auto& item:fs::directory_iterator(folder)){
        auto name=item.path().filename().string();if(item.path().extension()!=".chk"||!filename(name))continue;
        try{result.push_back(decode(item.path(),id,compatibility,false).info);}
        catch(const std::exception& error){StateInfo info;info.file=name;info.reason=error.what();
            info.slot=name.substr(0,8)=="manual-"?name.substr(0,8):"auto";result.push_back(std::move(info));}
    }
    std::sort(result.begin(),result.end(),[](const auto& a,const auto& b){if(a.usable!=b.usable)return a.usable>b.usable;
        if(a.sequence!=b.sequence)return a.sequence>b.sequence;return a.file>b.file;});return result;
}
StateRecord Library::state(const std::string& id,const std::string& file,const std::string& compatibility) const {
    if(!filename(file)||fs::path(file).extension()!=".chk")throw std::runtime_error("Invalid checkpoint filename.");
    return decode(game(id)/"states"/file,id,compatibility);
}
StateInfo Library::writeState(const std::string& id,const std::string& slot,const std::string& compatibility,
                            const std::string& format,const Bytes& stateBytes,const Bytes& saveBytes,uint64_t timestamp){
    if((!manual(slot)&&slot!="auto")||!hex(compatibility)||format.empty()||format.size()>200||format.find('\n')!=format.npos||
       stateBytes.size()<16||stateBytes.size()>MaxState||saveBytes.size()>MaxSave||!timestamp)throw std::runtime_error("Invalid checkpoint capture.");
    auto folder=game(id)/"states";if(!fs::exists(game(id)/"rom.nds"))throw std::runtime_error("Game is not in the library.");
    fs::create_directories(folder);uint64_t sequence=0;std::string prefix="auto-"+compatibility+"-";
    for(const auto& file:fs::directory_iterator(folder)){
        auto name=file.path().filename().string();if(name.rfind(prefix,0)!=0||file.path().extension()!=".chk")continue;
        try{sequence=std::max(sequence,number(name.substr(prefix.size(),name.size()-prefix.size()-4)));}catch(const std::exception&){}
    }
    if(sequence==std::numeric_limits<uint64_t>::max())throw std::runtime_error("Checkpoint sequence exhausted.");++sequence;
    std::string file=manual(slot)?slot+".chk":prefix+std::to_string(sequence)+".chk";
    std::string header="RDSTATE1Z\n"+id+"\n"+compatibility+"\n"+format+"\n"+std::to_string(timestamp)+"\n"+
      std::to_string(sequence)+"\n"+std::to_string(saveBytes.size())+"\n"+std::to_string(stateBytes.size())+"\n"+slot+"\n";
    Bytes payload=saveBytes;payload.insert(payload.end(),stateBytes.begin(),stateBytes.end());
    Bytes compressed(compressBound(payload.size()));uLongf compressedSize=compressed.size();
    if(compress2(compressed.data(),&compressedSize,payload.data(),payload.size(),1)!=Z_OK)throw std::runtime_error("Checkpoint compression failed.");
    compressed.resize(compressedSize);
    Bytes authenticated(header.begin(),header.end());authenticated.insert(authenticated.end(),compressed.begin(),compressed.end());
    auto checksum=sha256(authenticated);Bytes bytes(header.begin(),header.end());bytes.insert(bytes.end(),checksum.begin(),checksum.end());bytes.push_back('\n');bytes.insert(bytes.end(),compressed.begin(),compressed.end());
    atomicWrite(folder/file,bytes); // commit first, prune only verified predecessors
    if(slot=="auto"){
        unsigned kept=0;for(const auto& prior:states(id,compatibility))if(prior.usable&&prior.slot=="auto"&&++kept>3)fs::remove(folder/prior.file);
    }
    // atomicWrite synced states; also persist creation/deletion in its parent.
    for(const auto& directory:{folder,folder.parent_path()}){
        int fd=open(directory.c_str(),O_RDONLY|O_DIRECTORY);if(fd<0)throw std::runtime_error("Could not synchronize checkpoint directory.");
        int status=fsync(fd);close(fd);if(status)throw std::runtime_error("Could not synchronize checkpoint directory.");
    }
    return {file,slot,compatibility,format,"",timestamp,sequence,true,bytes.size()};
}
}
