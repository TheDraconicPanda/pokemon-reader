# Reader Emulator E4 — native test build 0.4.0

This adds the integrated completed-save Reader to the library, game saves and recovery; device acceptance remains pending.
It runs a pinned native melonDS 1.1 candidate, with JIT and OpenGL disabled,
threaded software DS rendering, Metal screen presentation and a 48 kHz native
audio pipeline. No Delta application/framework code is incorporated.

The target acceptance device is iPhone 16 Plus on user-reported iOS 26.6.1.
Original English SoulSilver and Platinum are the initial test matrix. The app
also includes an original tiny diagnostic ROM; this is not evidence that either
commercial game runs correctly. Other DS games are not certified; save import is scoped to the two English games.

## Build and install

The [native build workflow](../.github/workflows/emulator-e1.yml) builds the portable
core integration test on Linux and release device/simulator apps on macOS.
It runs on `Emulator` source pushes; rerun an existing run to rebuild its revision.
Download the `ReaderEmulator-E4-unsigned` artifact from the matching successful
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

## Use the E4 test build

1. **Import ROM** copies an uncompressed `.nds` into the offline library. Use
   **Library** to reopen it. Identical contents reuse the entry; patched or
   different ROM contents receive separate saves, even when filenames match.
2. **Game save** imports a copy of a raw 512 KB SoulSilver (`IPGE`) or Platinum
   (`CPUE`) save after structural checksum/game checks and explicit association.
   Confirm replacement to restart the selected game; a previous copy is retained.
   States and `.dsv` containers are not accepted as cartridge saves in this build.
3. Save normally inside Pokémon. Cartridge writes are copied to durable app
   storage automatically, with a checksum-protected backup. Pause/backgrounding
   also requests a flush. **More → Export cartridge save** makes a raw `.sav` backup in Files.
   Saving may take a short time to reach disk; sudden termination can still lose
   recent progress. Use **States** for three manual slots and rotating automatic recovery.
   On reopening a library game, choose its recovery checkpoint or in-game save.
   **More → Recovery interval** offers two/five minutes or pause-only checkpoints.
   See [E3 behavior, storage and remaining tests](../docs/emulator-e3.md).
4. **Reader** pauses play and opens the latest completed in-game save. **Tools** opens
   Planner, Pokédex, Atlas and Safari/Great Marsh. Automatic copies are read-only;
   Files imports and modified exports remain separate from the active cartridge.
   **Game** returns to play; tap **Resume** explicitly. See [E4 details](../docs/emulator-e4.md).
5. Portrait stacks the screens; landscape places them side by side when space
   permits. Touch the bottom/right screen. Virtual buttons, extended gamepads
   and keyboards are supported. See [E2 controls and storage](../docs/emulator-e2.md).
6. **More → DS system files** retains optional ARM7 BIOS (16 KB), ARM9 BIOS
   (4 KB) and firmware (128/256/512 KB) dumps for future launches. Built-in
   FreeBIOS/generated firmware remain the default. **More → Diagnostic** runs
   the original red/green test program without storing a personal game session.
7. Leaving the app, locking the phone or an audio interruption pauses play.
   Resume explicitly. **Record test** and **More → Performance report** retain the E1
   measurement tools and add checkpoint capture/write/size diagnostics. No ROMs, saves or reports are automatically uploaded.

Keep normal speed in both this prototype and Delta. Emulator fast-forward is
outside v1. Granular acceleration stays with the independent ROM project.

## Validation and remaining gates

The local C++ integration tests build and link the actual pinned core. Its
original ARM ROM writes a fingerprint, renders known red/green pixels and mirrors
KEYINPUT into RAM. Tests check these effects, emulated-time advancement, audio
buffer production, invalid import preservation, the concurrent audio ring,
semaphore behavior and non-truncating file access. These are host tests, not
claims about iPhone GPU/audio behavior or Pokémon compatibility. E2 additionally
tests actual cartridge SPI writes through durable storage/reload and independently
checks both raw exports using the existing Reader. Storage fault tests cover
ENOSPC, partial writes, process termination, integrity fallback, import recovery,
ROM isolation and portrait/landscape input geometry. The storage tests also run
on the hosted macOS filesystem before iOS compilation. E3 adds actual-core state
restoration and SRAM rollback/backup tests, three-slot/three-generation rotation,
corrupt-newest fallback, compatibility rejection and checkpoint write/crash faults.
E4 adds footer-completion/retry/state-barrier tests and a real offline native-server/
Chromium/IndexedDB connection check. Hosted macOS also exercises real WKWebView.
The host checks require CMake, a C++17 compiler, system zlib development headers
Python 3, Node.js 22+ and Chromium (or CHROMIUM_PATH); iOS uses SDK/system zlib without a bundled extra library.

```sh
cmake -S ios -B work/e1/build-linux -DCMAKE_BUILD_TYPE=Release
cmake --build work/e1/build-linux --parallel 4
ctest --test-dir work/e1/build-linux --output-on-failure
```

Follow [the device benchmark protocol](../docs/emulator-e1-benchmark.md). The core
is **not accepted** until the signed build runs on the target phone, both target
games pass the scene matrix and repeated Delta comparisons meet the agreed
performance/battery gate. Simulator and host results cannot replace these checks.
Per the user's 2 November 2026 direction, these phone checks may be deferred while
E2–E4 are implemented and checked sequentially using the provisional core. See
the [deferred device-testing policy](../docs/iphone-emulator-v1-plan.md#deferred-device-testing-policy--2-november-2026).
Every outstanding acceptance check remains required before v1 is accepted.

## Licensing

New `ios/` code is GPL-3.0-or-later, alongside the linked GPL core. Binary archives
include GPL COPYING, a third-party notice and source/build revision links.
See [THIRD-PARTY.txt](THIRD-PARTY.txt) and [the lock file](core.lock.json).
Existing browser Reader license/version metadata is unchanged.
