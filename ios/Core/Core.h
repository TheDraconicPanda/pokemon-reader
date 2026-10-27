// SPDX-License-Identifier: GPL-3.0-or-later
#pragma once
#include <algorithm>
#include <array>
#include <atomic>
#include <cstddef>
#include <cstdint>
#include <memory>
#include <string>
#include <vector>

namespace melonDS { class NDS; }
namespace reader {
constexpr unsigned Width = 256, Height = 192;
constexpr unsigned Pixels = Width * Height;
constexpr double ClockHz = 33513982.0;
constexpr double FrameSeconds = (263.0 * 2130.0) / ClockHz;
constexpr unsigned SampleRate = 48000;

// All Core methods are confined to one emulation queue. Callers transfer copies
// of video/audio/save data to other threads; no core pointers escape to the UI.
class Core {
public:
    Core();
    ~Core();
    Core(const Core&) = delete;
    Core& operator=(const Core&) = delete;
    bool load(const uint8_t* rom, size_t size, const uint8_t* save, size_t saveSize,
              std::string& error, const std::vector<uint8_t>& bios7 = {},
              const std::vector<uint8_t>& bios9 = {}, const std::vector<uint8_t>& firmware = {});
    double step(uint16_t pressed, int touchX = -1, int touchY = -1);
    void copyVideo(uint32_t* destination) const;
    size_t readAudio(int16_t* destination, size_t frames);
    std::vector<uint8_t> copySave() const;
    bool running() const;
    std::atomic<bool> stopped{false};
    std::string gameCode;
    uint32_t diagnosticWord(unsigned offset) const;
private:
    std::unique_ptr<melonDS::NDS> nds;
};

// One producer (emulation), one consumer (audio render callback). No allocations,
// waits or locks on the audio thread. Lifetime/reset occur after audio is stopped.
template<size_t Capacity> class AudioRing {
    static_assert((Capacity & (Capacity - 1)) == 0, "Capacity must be a power of two");
    std::array<int16_t, Capacity * 2> samples{};
    std::atomic<uint64_t> readIndex{0}, writeIndex{0};
public:
    size_t write(const int16_t* source, size_t frames) {
        auto w = writeIndex.load(std::memory_order_relaxed);
        auto r = readIndex.load(std::memory_order_acquire);
        size_t count = std::min(frames, Capacity - static_cast<size_t>(w - r));
        for(size_t i=0; i<count; ++i) {
            size_t at = ((w+i) & (Capacity-1))*2;
            samples[at] = source[i*2]; samples[at+1] = source[i*2+1];
        }
        writeIndex.store(w+count, std::memory_order_release);
        return count;
    }
    size_t read(int16_t* destination, size_t frames) {
        auto r = readIndex.load(std::memory_order_relaxed);
        auto w = writeIndex.load(std::memory_order_acquire);
        size_t count = std::min(frames, static_cast<size_t>(w-r));
        for(size_t i=0; i<count; ++i) {
            size_t at = ((r+i) & (Capacity-1))*2;
            destination[i*2] = samples[at]; destination[i*2+1] = samples[at+1];
        }
        std::fill(destination+count*2, destination+frames*2, 0);
        readIndex.store(r+count, std::memory_order_release);
        return count;
    }
};
}
