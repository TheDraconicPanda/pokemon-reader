// SPDX-License-Identifier: GPL-3.0-or-later
#pragma once
#include <cstdint>
#include <filesystem>
#include <functional>
#include <string>
#include <vector>

namespace reader {
using Bytes = std::vector<uint8_t>;
std::string sha256(const uint8_t* data, size_t size);
inline std::string sha256(const Bytes& data) { return sha256(data.data(), data.size()); }
bool validROM(const uint8_t* data, size_t size, std::string& error);
// Structural import validation, not the Reader's full Pokémon-record validation.
bool validImport(const Bytes& data, const std::string& gameCode, std::string& error);
struct GameEntry { std::string id, name, code; };
struct SavedGame { Bytes bytes; bool recovered = false; };
struct StateInfo {
    std::string file,slot,compatibility,format,reason;
    uint64_t timestamp=0,sequence=0;
    bool usable=false;
    uint64_t storedBytes=0;
};
struct StateRecord { StateInfo info;Bytes state,save; };

// Confined to one storage queue. No dependency on an emulator or UIKit. Files
// are durable, local app data. An entry becomes visible only after its ROM and
// metadata have been committed. Save generations include the ROM identity and
// payload SHA-256; an interrupted staging file is never a committed save.
class Library {
public:
    explicit Library(std::filesystem::path root);
    std::vector<GameEntry> list() const;
    GameEntry importROM(const Bytes& rom, const std::string& name);
    Bytes rom(const std::string& id) const;
    SavedGame save(const std::string& id) const; // throws if both copies are bad
    void writeSave(const std::string& id, const Bytes& data);
    void writeSystem(const std::string& kind, const Bytes& data);
    Bytes system(const std::string& kind) const;
    void clearSystem();
    StateInfo writeState(const std::string& id,const std::string& slot,const std::string& compatibility,
                         const std::string& format,const Bytes& state,const Bytes& save,uint64_t timestamp);
    std::vector<StateInfo> states(const std::string& id,const std::string& compatibility) const;
    StateRecord state(const std::string& id,const std::string& file,const std::string& compatibility) const;
    void backupBeforeState(const std::string& id);
    Bytes saveBeforeState(const std::string& id) const;
    // Deterministic ENOSPC/I/O/interruption injection, also used on macOS CI.
    std::function<void(const std::string&, const std::filesystem::path&)> fault;
private:
    std::filesystem::path root;
    std::filesystem::path game(const std::string& id) const;
    void atomicWrite(const std::filesystem::path& path, const Bytes& data);
};
}
