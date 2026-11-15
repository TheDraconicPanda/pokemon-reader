// SPDX-License-Identifier: GPL-3.0-or-later
// Portable melonDS platform implementation. Networking, DSi peripherals and
// dynamic modules are deliberately unavailable in this original-DS prototype.
#include "Platform.h"
#include "session.h"
#include <chrono>
#include <condition_variable>
#include <cstdarg>
#include <cstdio>
#include <cstring>
#include <mutex>
#include <thread>
#include <sys/stat.h>

namespace melonDS::Platform {
struct Thread {};
struct Mutex { std::mutex value; };
struct Semaphore { std::mutex mutex; std::condition_variable ready; unsigned count=0; };
static FILE* stream(FileHandle* f) { return reinterpret_cast<FILE*>(f); }
void SignalStop(StopReason, void* user) { if(user) static_cast<Session*>(user)->stopped=true; }
std::string GetLocalFilePath(const std::string& path) { return path; }
bool FileExists(const std::string& name) { struct stat s{}; return stat(name.c_str(), &s)==0 && S_ISREG(s.st_mode); }
bool LocalFileExists(const std::string& name) { return FileExists(name); }
FileHandle* OpenFile(const std::string& path, FileMode mode) {
    const bool write = mode & Write, read = mode & Read;
    if(!write && !read) return nullptr;
    const bool exists = FileExists(path);
    if((mode & NoCreate) && !exists) return nullptr;
    const char* flag = !write ? "rb" : mode & Append ? (read ? "a+b" : "ab") :
        (mode & Preserve) && exists ? "r+b" : (read ? "w+b" : "wb");
    return reinterpret_cast<FileHandle*>(fopen(path.c_str(), flag));
}
FileHandle* OpenLocalFile(const std::string& path, FileMode mode) { return OpenFile(path, mode); }
bool CheckFileWritable(const std::string& path) {
    auto f=OpenFile(path, FileMode(ReadWrite|Preserve)); return f && CloseFile(f);
}
bool CheckLocalFileWritable(const std::string& path) { return CheckFileWritable(path); }
bool CloseFile(FileHandle* f) { return f && fclose(stream(f))==0; }
bool IsEndOfFile(FileHandle* f) { return !f || feof(stream(f)); }
bool FileReadLine(char* p,int count,FileHandle* f) { return f && fgets(p,count,stream(f)); }
u64 FilePosition(FileHandle* f) { return f ? uint64_t(ftello(stream(f))) : 0; }
bool FileSeek(FileHandle* f,s64 offset,FileSeekOrigin origin) {
    int whence=origin==FileSeekOrigin::Start?SEEK_SET:origin==FileSeekOrigin::Current?SEEK_CUR:SEEK_END;
    return f && fseeko(stream(f),offset,whence)==0;
}
void FileRewind(FileHandle* f) { if(f) rewind(stream(f)); }
u64 FileRead(void* p,u64 size,u64 count,FileHandle* f) { return f ? fread(p,size,count,stream(f)) : 0; }
bool FileFlush(FileHandle* f) { return f && fflush(stream(f))==0; }
u64 FileWrite(const void* p,u64 size,u64 count,FileHandle* f) { return f ? fwrite(p,size,count,stream(f)) : 0; }
u64 FileWriteFormatted(FileHandle* f,const char* fmt,...) {
    if(!f) return 0; va_list args; va_start(args,fmt); int n=vfprintf(stream(f),fmt,args);va_end(args);return n<0?0:n;
}
u64 FileLength(FileHandle* f) {
    if(!f) return 0; auto at=ftello(stream(f)); if(at<0 || fseeko(stream(f),0,SEEK_END)) return 0;
    auto end=ftello(stream(f)); fseeko(stream(f),at,SEEK_SET); return end<0?0:uint64_t(end);
}
void Log(LogLevel level,const char* fmt,...) {
    return; // Core logs can contain ROM metadata; do not expose it. va_list args; va_start(args,fmt);vfprintf(stderr,fmt,args);va_end(args);
}
// The single-threaded renderer must never request a background thread.
Thread* Thread_Create(std::function<void()>) { std::abort(); }
void Thread_Wait(Thread*) {} void Thread_Free(Thread*) {}
Mutex* Mutex_Create() { return new Mutex; }
void Mutex_Free(Mutex* m) { delete m; }
void Mutex_Lock(Mutex*) {} void Mutex_Unlock(Mutex*) {}
bool Mutex_TryLock(Mutex*) { return true; }
Semaphore* Semaphore_Create() { return new Semaphore; }
void Semaphore_Free(Semaphore* s) { delete s; }
void Semaphore_Reset(Semaphore* s) { s->count=0; }
void Semaphore_Wait(Semaphore*) { std::abort(); }
bool Semaphore_TryWait(Semaphore* s,int) { if(!s->count)return false;--s->count;return true; }
void Semaphore_Post(Semaphore* s,int count) { s->count+=count; }
void Sleep(u64) {}u64 GetUSCount() { return std::chrono::duration_cast<std::chrono::microseconds>(std::chrono::steady_clock::now().time_since_epoch()).count(); }
u64 GetMSCount() { return GetUSCount()/1000; }
void WriteNDSSave(const u8*,u32,u32 offset,u32 length,void* user) { if(user)++static_cast<Session*>(user)->revision; }
void WriteGBASave(const u8*,u32,u32,u32,void*) {}
void WriteFirmware(const Firmware&,u32,u32,void*) {}
void WriteDateTime(int,int,int,int,int,int,void*) {}
void MP_Begin(void*) {} void MP_End(void*) {}
int MP_SendPacket(u8*,int,u64,void*) {return 0;}
int MP_RecvPacket(u8*,u64*,void*) {return 0;}
int MP_SendCmd(u8*,int,u64,void*) {return 0;}
int MP_SendReply(u8*,int,u64,u16,void*) {return 0;}
int MP_SendAck(u8*,int,u64,void*) {return 0;}
int MP_RecvHostPacket(u8*,u64*,void*) {return 0;}
u16 MP_RecvReplies(u8*,u64,u16,void*) {return 0;}
int Net_SendPacket(u8*,int,void*) {return 0;}
int Net_RecvPacket(u8*,void*) {return 0;}
void Camera_Start(int,void*) {} void Camera_Stop(int,void*) {}
void Camera_CaptureFrame(int,u32*,int,int,bool,void*) {}
void Mic_Start(void*) {} void Mic_Stop(void*) {}
int Mic_ReadInput(s16*,int,void*) {return 0;}
AACDecoder* AAC_Init() {return nullptr;}
void AAC_DeInit(AACDecoder*) {}
bool AAC_Configure(AACDecoder*,int,int) {return false;}
bool AAC_DecodeFrame(AACDecoder*,const void*,int,void*,int) {return false;}
bool Addon_KeyDown(KeyType,void*) {return false;}
void Addon_RumbleStart(u32,void*) {} void Addon_RumbleStop(void*) {}
float Addon_MotionQuery(MotionQueryType,void*) {return 0;}
DynamicLibrary* DynamicLibrary_Load(const char*) {return nullptr;}
void DynamicLibrary_Unload(DynamicLibrary*) {}
void* DynamicLibrary_LoadFunction(DynamicLibrary*,const char*) {return nullptr;}
}
