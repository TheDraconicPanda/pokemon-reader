// SPDX-License-Identifier: GPL-3.0-or-later
#pragma once
#include <filesystem>
#include <atomic>
#include <thread>
#include <cstdint>
namespace reader {
// Static bundled assets only. No saves, profiles, filesystem uploads or emulator
// control routes are exposed over HTTP. Stable loopback origin retains app-local
// WebKit storage; private save bytes travel through the WK bridge instead.
class ReaderServer {
public:
    explicit ReaderServer(std::filesystem::path root,uint16_t port=49621);
    ~ReaderServer();
    ReaderServer(const ReaderServer&)=delete;
    uint16_t port() const {return boundPort;}
private:
    std::filesystem::path root;
    int listener=-1;
    int wake[2]={-1,-1};
    uint16_t boundPort=0;
    std::atomic<bool> stopping{false};
    std::thread worker;
    void serve();
    void request(int client);
};
}
