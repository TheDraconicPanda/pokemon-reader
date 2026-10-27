# Reader Emulator E1 — native prototype 0.1.0

This is the first implementation milestone, not a finished emulator release.
It runs a pinned native melonDS 1.1 candidate, with JIT and OpenGL disabled,
threaded software DS rendering, Metal screen presentation and a 48 kHz native
audio pipeline. No Delta application/framework code is incorporated.

The target acceptance device is iPhone 16 Plus on user-reported iOS 26.6.1.
Original English SoulSilver and Platinum are the initial test matrix. The app
also includes an original tiny diagnostic ROM; this is not evidence that either
commercial game runs correctly. Other DS games are not certified by E1.

## Build and install

The [Emulator E1 workflow](../.github/workflows/emulator-e1.yml) builds the portable
core integration test on Linux and release device/simulator apps on macOS.
It runs on `Emulator` source pushes and can also be dispatched from GitHub.
Download the `ReaderEmulator-E1-unsigned` artifact from the matching successful
run. It contains an **unsigned .ipa**, simulator archive and exact build metadata.

An unsigned IPA cannot be installed by simply opening it on an iPhone. It must
be signed using an agreed sideloading/development distribution method. No Apple
account, signing certificate, keychain modification or TestFlight submission is
configured by this prototype. No signing secrets belong in Git or the Drive folder.
There is no requirement for the user to own a Mac for the hosted compilation.

On a Mac with preinstalled Xcode, Git and CMake 3.25+:

```sh
python3 ios/scripts/build.py --sdk iphoneos
python3 ios/scripts/build.py --sdk iphonesimulator
```

Builds, downloaded sources, module caches and archives stay under repository-local
`work/e1/`. The build script does not install tools or change signing settings.
Native compilation is not possible on this Linux workspace. A successful build
does not establish installed-device, playback or energy acceptance.

## Use the prototype

1. Run **Diagnostic**. It displays a red top screen and green bottom screen,
   executes both emulated CPUs and exercises input/audio-buffer plumbing.
2. Choose **Open ROM** for an uncompressed `.nds` file, then **Game save** to
   restart with a copy of the game's raw 512 KB `.sav`. E1 rejects save states
   and DeSmuME containers as game-save input. Original files are unchanged.
3. Optional **System files** imports your DS ARM7 BIOS (16 KB), ARM9 BIOS (4 KB)
   and firmware (128/256/512 KB). Defaults use upstream FreeBIOS/generated
   firmware; record which configuration you benchmark. Imports take effect on
   the next ROM launch. Do not mix configurations in a paired comparison.
4. Use touch controls and the lower screen; **Pause/Resume** controls playback.
   Leaving the app, locking the phone or an audio interruption pauses it.
   Emulation does not continue in the background.
5. Save normally inside Pokémon, then **Export save** to keep the cartridge
   save in Files. Export pauses the game. This E1 test build does **not** yet
   persist sessions automatically. E2 adds durable library/saves; E3 adds states
   and automatic recovery. Export before replacing a session or ending testing.
6. **Record test** starts a 30-active-minute sample log. Mark overworld, battle
   entry, battle and menu scenes as they occur; use **Report** to export JSON.
   No reports, ROMs or saves are uploaded automatically. A pause is recorded and
   makes a continuous energy comparison unsuitable unless explicitly controlled.

Keep normal speed in both this prototype and Delta. Emulator fast-forward is
outside v1. Granular acceleration stays with the independent ROM project.

## Validation and remaining gates

The local C++ integration test builds and links the actual pinned core. Its
original ARM ROM writes a fingerprint, renders known red/green pixels and mirrors
KEYINPUT into RAM. Tests check these effects, emulated-time advancement, audio
buffer production, invalid import preservation, the concurrent audio ring,
semaphore behavior and non-truncating file access. These are host tests, not
claims about iPhone GPU/audio behavior or Pokémon compatibility.

```sh
cmake -S ios -B work/e1/build-linux -DCMAKE_BUILD_TYPE=Release
cmake --build work/e1/build-linux --parallel 4
ctest --test-dir work/e1/build-linux --output-on-failure
```

Follow [the device benchmark protocol](../docs/emulator-e1-benchmark.md). The core
is **not accepted** until the signed build runs on the target phone, both target
games pass the scene matrix and repeated Delta comparisons meet the agreed
performance/battery gate. Simulator and host results cannot replace these checks.

## Licensing

New `ios/` code is GPL-3.0-or-later, alongside the linked GPL core. Binary archives
include GPL COPYING, a third-party notice and source/build revision links.
See [THIRD-PARTY.txt](THIRD-PARTY.txt) and [the lock file](core.lock.json).
Existing browser Reader license/version metadata is unchanged.
