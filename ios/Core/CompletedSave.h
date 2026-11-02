// SPDX-License-Identifier: GPL-3.0-or-later
#pragma once
#include "Library.h"
#include <array>
namespace reader {
struct CompletedSave {
    Bytes bytes;
    unsigned general=0,storage=0;
    uint64_t capturedAt=0,serial=0;
    std::string origin;
};
// Observes cartridge writes, never game RAM. Footer coverage is required after
// initialization/restoration; a parser falling back to an old valid copy is not
// a new save. Layout/write order follow the pinned HGSS/Platinum save routines.
class SaveObserver {
public:
    void initialize(const std::string& game,const Bytes& current,const Bytes& baseline,uint64_t timestamp,const std::string& origin);
    void wrote(unsigned offset,unsigned length);
    void poll(const uint8_t* data,size_t size,uint64_t timestamp);
    const CompletedSave& latest() const { return completed; }
private:
    std::string code;
    std::array<uint32_t,4> coverage{};
    std::array<bool,4> bodyDirty{};
    std::array<Bytes,4> seen;
    CompletedSave completed;
    bool dirty=false;
};
}
