// SPDX-License-Identifier: GPL-3.0-or-later
#include "ReaderServer.h"
#include <sys/socket.h>
#include <netinet/in.h>
#include <unistd.h>
#include <fstream>
#include <sstream>
#include <stdexcept>
#include <cerrno>
namespace reader {
namespace fs=std::filesystem;
namespace {
void sendAll(int fd,const char* p,size_t n){while(n){
#ifdef MSG_NOSIGNAL
    auto result=send(fd,p,n,MSG_NOSIGNAL);
#else
    auto result=send(fd,p,n,0);
#endif
    if(result<0&&errno==EINTR)continue;if(result<=0)return;p+=result;n-=size_t(result);}}
std::string mime(const fs::path& p){auto e=p.extension().string();
    if(e==".html")return "text/html; charset=utf-8";if(e==".js"||e==".mjs")return "text/javascript; charset=utf-8";
    if(e==".css")return "text/css; charset=utf-8";if(e==".json")return "application/json";if(e==".svg")return "image/svg+xml";
    if(e==".md"||e==".txt")return "text/plain; charset=utf-8";
    if(e==".png")return "image/png";if(e==".gif")return "image/gif";if(e==".webp")return "image/webp";return "application/octet-stream";}
std::string decode(std::string path){std::string result;for(size_t i=0;i<path.size();++i){unsigned c=uint8_t(path[i]);
    if(c=='%'){if(i+2>=path.size())throw std::runtime_error("Bad URL");auto hex=[](char h)->int{return h>='0'&&h<='9'?h-'0':h>='a'&&h<='f'?h-'a'+10:h>='A'&&h<='F'?h-'A'+10:-1;};
        int a=hex(path[++i]),b=hex(path[++i]);if(a<0||b<0)throw std::runtime_error("Bad URL");c=a*16+b;}
    if(c==0||c=='\\'||c<32)throw std::runtime_error("Bad URL");result+=char(c);}return result;}
}
ReaderServer::ReaderServer(fs::path path,uint16_t port):root(fs::canonical(std::move(path))){
    listener=socket(AF_INET,SOCK_STREAM,0);if(listener<0)throw std::runtime_error("Cannot create the local Reader server.");
    int reuse=1;setsockopt(listener,SOL_SOCKET,SO_REUSEADDR,&reuse,sizeof(reuse));
    sockaddr_in address{};address.sin_family=AF_INET;address.sin_addr.s_addr=htonl(INADDR_LOOPBACK);address.sin_port=htons(port);
    if(bind(listener,reinterpret_cast<sockaddr*>(&address),sizeof(address))||listen(listener,128)){close(listener);listener=-1;throw std::runtime_error("Reader's local port is unavailable. Close the other app using it and retry; stored profiles are preserved.");}
    socklen_t size=sizeof(address);getsockname(listener,reinterpret_cast<sockaddr*>(&address),&size);boundPort=ntohs(address.sin_port);
    worker=std::thread([this]{serve();});
}
ReaderServer::~ReaderServer(){stopping=true;if(listener>=0)shutdown(listener,SHUT_RDWR);if(worker.joinable())worker.join();if(listener>=0)close(listener);}
void ReaderServer::serve(){while(!stopping.load()){int client=accept(listener,nullptr,nullptr);if(client<0){if(errno==EINTR)continue;break;}
    timeval timeout{2,0};setsockopt(client,SOL_SOCKET,SO_RCVTIMEO,&timeout,sizeof(timeout));setsockopt(client,SOL_SOCKET,SO_SNDTIMEO,&timeout,sizeof(timeout));
#ifdef SO_NOSIGPIPE
    int yes=1;setsockopt(client,SOL_SOCKET,SO_NOSIGPIPE,&yes,sizeof(yes));
#endif
    try{request(client);}catch(const std::exception&){}close(client);
}}
void ReaderServer::request(int client){
    std::string header;char buffer[4096];while(header.find("\r\n\r\n")==header.npos){auto n=recv(client,buffer,sizeof(buffer),0);if(n<=0)return;header.append(buffer,size_t(n));if(header.size()>16384)return;}
    std::istringstream lines(header);std::string method,target,protocol;lines>>method>>target>>protocol;
    int status=200;std::string type="text/plain",body;
    try{
        if((method!="GET"&&method!="HEAD")||target.empty()||target[0]!='/')throw std::runtime_error("Unsupported request");
        target=decode(target.substr(0,target.find('?')));fs::path relative=target.substr(1);
        for(const auto& component:relative){auto text=component.string();if(component==".."||(!text.empty()&&text.front()=='.'))throw std::runtime_error("Invalid path");}
        auto path=root/relative;if(fs::is_directory(path))path/="index.html";path=fs::canonical(path);
        auto rel=path.lexically_relative(root);if(rel.empty()||*rel.begin()==".."||!fs::is_regular_file(path)||fs::file_size(path)>64*1024*1024)throw std::runtime_error("Invalid path");
        std::ifstream f(path,std::ios::binary);if(!f)throw std::runtime_error("Unavailable");body.assign(std::istreambuf_iterator<char>(f),{});type=mime(path);
    }catch(const std::exception&){status=404;body="Reader asset unavailable.";}
    std::string response="HTTP/1.1 "+std::to_string(status)+(status==200?" OK":" Not Found")+"\r\nContent-Type: "+type+"\r\nContent-Length: "+std::to_string(body.size())+
      "\r\nConnection: close\r\nX-Content-Type-Options: nosniff\r\nCache-Control: no-cache\r\nContent-Security-Policy: default-src 'self' data: blob:; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://archives.bulbagarden.net; connect-src 'self' blob:; object-src 'none'; frame-src 'none'; base-uri 'self'\r\n\r\n";
    sendAll(client,response.data(),response.size());if(method!="HEAD")sendAll(client,body.data(),body.size());
}
}
