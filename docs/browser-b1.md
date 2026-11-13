# Browser B1 — feasibility prototype 0.1.0

B1 is an engineering prototype, with **iPhone acceptance pending**. It runs
melonDS locally in WebAssembly. No Apple membership, Developer Mode, signing
refresh, account enrollment or streamed gameplay is involved. Sustained game
performance, thermal behavior and battery use are unproven. Stop the browser
port if matched phone measurements fail the requirements below.

The native 0.4.0 implementation and the existing website are preserved. The
`Emulator` baseline was `721f5b1`; fetched `main` was `ec02da5` (Reader 0.27.5).
B1 packages the Emulator branch's 0.27.0 parser closure in its own directory;
it does not replace newer Reader work or import Adventure Profiles. Browser and
native states are not portable. Full Reader integration, states/recovery,
fast-forward, DSi, GBA, multiplayer and an Android port are outside B1.

## Run on this Windows PC

The checked-in WASM and static assets are runnable without compiling. In
PowerShell, from `C:\Users\willm\OneDrive\Documents\ChatGPT\Pokemon Reader`:

```powershell
node browser-emulator/scripts/serve.mjs
```

Use [the PC preview](http://127.0.0.1:8080/browser-emulator/). Installed Node
20.11.0 runs this server; Node 22 is used for verification/builds. Port 8080 can
be changed with `$env:PORT='8081'`. The server binds loopback and serves only
the explicit app asset inventory plus its source archive. It rejects uploads
and paths into `work/`, source directories and arbitrary repository files.
Do not replace it with a public server rooted at the entire checkout.

## Real iPhone HTTPS route

**A PC LAN HTTP URL is not the iPhone's localhost.** It does not satisfy the
secure-context requirement for offline workers/audio. This build uses no
pthreads or SharedArrayBuffer, so COOP/COEP headers are not required.

The chosen hosting route is **GitHub Pages**, alongside the existing Reader at
`/pokemon-reader/browser-emulator/`. This prototype is static HTML/JS/WASM and
does not require server-side execution or special cross-origin isolation headers.
The app is compatible with a repository subdirectory and has a scoped service
worker and manifest. GitHub hosts only the app and corresponding source; selected
ROMs and saves remain on the phone.

User direction on 13 November 2026 authorizes publishing B1 source and binaries
to `Emulator`. Pages activation will be handled afterward. The existing Pages
site and `main` are preserved; the B1 workflow verifies/packages assets and does
not deploy Pages. A published Git branch does not mean the emulator URL is live.

After Pages is configured to include the B1 directory, open its HTTPS URL in
Safari and follow the steps below. Your PC does not need to stay running for
GitHub-hosted setup or later local emulation. A stable hostname also avoids the
storage separation caused by temporary tunnel URLs.

No Cloudflare tunnel was started. The experimental `iphone-test.ps1` helper is
retained as an unused alternative, not the default route. Discuss a real GitHub
limitation before choosing a different hosting service or tunnel. Export saves
before any future change of origin.

1. Wait for **Offline app ready**. On first load the service worker caches the
   entire app, core, parser closure and license. A cache-install failure is not
   an offline-ready result.
2. Share → **Add to Home Screen** → enable **Open as Web App** when offered.
   Launch that icon before importing a personal ROM/save. Safari and Home Screen
   storage may be separate; do not assume an automatic transfer.
3. Choose your `.nds` from Files. It is hashed and retained in this app's local
   IndexedDB. Import a copy of a raw 512 KiB `.sav` for the matching original
   English Platinum (`CPUE`) or SoulSilver (`IPGE`) ROM, if desired.
4. Tap **Resume + audio**. Both screens, bottom-screen touch and simultaneous
   direction/action buttons are available. Gameplay compacts setup controls;
   Pause restores them. Keyboard: Z/A, X/B, S/X, A/Y, Q/L, W/R, arrows, Enter,
   Shift. Silent Mode and Safari audio interruptions must be checked on phone.
5. Finish an ordinary in-game save. Wait for **Persisted browser snapshot**,
   then **Export raw .sav** to Files. Export pauses and runs the existing Reader
   parser; invalid/unfinished snapshots are labeled. Inspect the exported save
   independently in the existing Reader before relying on it.
6. Enable airplane mode, close/reopen the Home Screen app and choose **Reopen
   local ROM**. Confirm game progress and audio/input. The PC/tunnel is not
   needed for cached offline play. Verify this on the phone before a long run.
7. Export before removing the icon, clearing data or changing origins. A failed
   export/download in iOS Files is a failed backup check, even if a desktop
   download worked. Do not delete the original native app or its saves.

## Core investigation and reuse

| Candidate, inspected pin | Actual evidence | B1 decision |
| --- | --- | --- |
| [melonDS 1.1](https://github.com/melonDS-emu/melonDS/tree/b86390e4428bf38ce4c1ce0e9ca446d6d25955e8), `b86390e4428bf38ce4c1ce0e9ca446d6d25955e8` | Complete source, GPL-3.0-or-later; existing native adapter/diagnostic uses it. New browser build compiles and executes original ARM programs and actual SRAM SPI writes. | Chosen provisionally. Emscripten 4.0.10, interpreter, native-resolution single-threaded software renderer, no SIMD/JIT. One dedicated web worker owns the core. |
| [44670/desmume-wasm](https://github.com/44670/desmume-wasm/tree/1015846aa90741d22bd0e93286a7921e607685c2), `1015846aa90741d22bd0e93286a7921e607685c2` | GPL-2.0 repository; `desmume/wasm-port/main.cpp` exposes frame, framebuffer, save and audio APIs. Its README places the HTML/JS frontend on a separate hosted site. This checkout does not provide a complete pinned frontend/build recipe. The API's frame result is audio production, not measured emulated clock time. | Bounded alternative examined, not incorporated or benchmarked. Rebuilding/adapting its older core and full host would cost more than retaining the already integrated melonDS revision. README phone/FPS claims are not evidence for our games/device. |
| [josepilas/pilas-melonds](https://github.com/josepilas/pilas-melonds/tree/4aee467df214df7f2f346bcba2219dd7bfafc4b2), `4aee467df214df7f2f346bcba2219dd7bfafc4b2` | Checked-out tree has JS/CSS, compiled core JS/WASM and top-level MPL-2.0 license. The README describes C++ `web_api.cpp`, `web_platform.cpp` and a CMake build which are absent from this tree. JS calls `_pilas_*` exports; raw save export is absent from the advertised UI. | No binary/code copied. Missing corresponding core/build inputs and the top-level license vs melonDS GPL provenance are unresolved. Useful architecture lead, not a reproducible source pin for B1. |

Reused concepts/code: `ios/Core/Core.cpp`'s direct boot, input masks, 48 kHz
audio and emulated-cycle clock; adapted `ios/Core/Platform.cpp` stubs;
`ios/Tests/TestROM.h`'s original ARM program; unchanged Reader parsers and synthetic
fixtures. Native `Library`, UIKit/Metal, checkpoint envelopes and native threaded
render/audio storage are not browser storage implementations. E4's completed-save
observer remains available for later read-only Reader integration; B1 does not
claim its quiet-time cartridge snapshots prove a completed Pokémon transaction.

The compiled core uses FreeBIOS/generated firmware. No proprietary system or
game files are shipped. See `browser-emulator/THIRD-PARTY.txt`, pinned lock and
GPL text. `source.zip` supplies exact upstream files, component notices, adapter,
diagnostic and parser/build sources alongside the WASM binary.

## Measurements and failure behavior

- **Speed:** actual DS system-clock delta / 33,513,982 Hz, divided by active wall
  time. `RunFrame` timing is approximately 59.826 frames/second; a game's 30 FPS
  animation is not half emulator speed. Slow frames remain visible as a speed
  deficit. The pacer caps catch-up at two frames/tick; there is no fast-forward.
- **Frame timing:** recent 600 core-call durations, mean and p95; mean interval
  between completed emulation frames. **Presentation rate** separately counts
  canvas uploads acknowledged by the main page. Rendering is BGRA→RGBA at native
  resolution; not a WebGL or hardware DS renderer.
- **Audio:** AudioWorklet resamples 48 kHz PCM to the actual AudioContext rate;
  reports missing output sample frames, overflow-discarded input frames and
  buffered milliseconds. Intentional paused silence does not count as underrun.
  These counts describe the pipeline, not perceived sound quality or battery.
- **Saves:** cartridge-write revision marks a detached snapshot dirty. After
  500 ms without another write, or at most two seconds of continuous writes, a
  serial queue atomically commits current/previous bytes, SHA-256 and timestamp
  in IndexedDB. Displayed persistence time includes hashing and transaction
  completion. Acknowledgment is a browser transaction result, not a guarantee
  against future eviction, device loss or an interrupted game's save sequence.
- A failed write preserves pending bytes for retry, increments failures and
  pauses emulation. RAM export remains available. Checksum-invalid current data
  falls back to a valid previous record; corruption of both is reported. ROM
  hashes isolate saves. Web Locks prevent simultaneous sessions; transaction
  fencing and a 20-second lease protect the fallback on browsers without Locks.
- Persistent storage is requested when selecting a ROM and by the explicit
  button. The app displays grant status and estimated use/quota; a denied grant
  is supported and write failures remain possible. Browser policy can change.
  [WebKit's storage policy](https://webkit.org/blog/14403/updates-to-storage-policy/)
  explains persistence heuristics and eviction. Export remains the backup route.
- Hiding the page or losing focus pauses and clears input. An extra snapshot may
  be requested, but periodic writes during active play are the primary retention
  mechanism. No unload handler or last-second termination save is relied upon.
  iOS may kill a page/worker without another callback. Resume starts a new active
  measurement window; export a report before pausing if you need that interval.
- The capability report records secure context, WASM/worker/audio/storage/
  service-worker support, Home Screen mode, Web Locks and isolation. Diagnostic
  reports contain metrics and browser identity, not ROM/save bytes, filenames,
  trainer data or ROM hashes. Nothing is automatically uploaded.

## Matched phone protocol — both games separately

Use iPhone 16 Plus; record actual Settings iOS version (reported: 26.6.1), battery
health, starting battery percentage, ambient temperature, brightness, volume,
Low Power Mode and case. No charging. Start from a comparable cool temperature.
Keep all emulators at normal speed. Use copies of the same legally held ROM and
raw save, same location/party, and record their identity privately.

First do a short correctness pass in Platinum, then SoulSilver: walk/run in a
busy area (2 min), enter a building/menu (1 min), enter/complete battles (3 min),
exercise bottom-screen menus and simultaneous movement/action/shoulders (2 min),
then save normally (1–2 min). Listen for recurring pops/gaps/desync. Wait for
Persisted, export to Files, load the export in Reader and check trainer, party
and boxes. Reopen offline and confirm the same progress; repeat a normal save
and export. Lock/unlock and switch apps during separate runs; resume explicitly.
Do not overwrite the only original backup. Browser imports only raw normal saves.

For a viable short pass, run matched **30-minute** B1 and native/Delta sessions
for each game: about 10 min walking, 10 min repeated battles and 10 min mixed
menus/travel/saving. Repeat each pair in reverse order after cooling. Match
brightness, sound, starting conditions and ordinary saves. Use airplane mode
after B1 setup; keep network conditions matched in the comparator. At 5, 15 and
30 min record speed, frame p95, presentation rate, audio counters, battery % and
heat observations. Export reports before pausing (pause/export interruptions
must be recorded); battery readings come from the phone, not the report.

The provisional performance target carries the existing plan's **at least 99%
real-time sustained speed after warmup**, without recurring audio breakup or
heat-driven deterioration. Before comparing, write down an acceptable numeric
battery budget from repeated matched native/Delta baselines; do not invent one
after seeing B1's result. Percentage-point battery readings are coarse; record
uncertainty and repeat noisy comparisons. If speed, audio, heat or your agreed
battery budget fails, **stop the browser port**. A further core search or Android
evaluation requires a separate request. Passing this pass only permits a later
milestone; it does not certify all lifecycle/storage/migration behavior.

## Build and verification

All downloaded toolchains/caches/output used here are ignored under `work/`.
No global installs or HOME/USERPROFILE changes are needed. Existing Windows
setup now includes Emscripten 4.0.10, its Node 22.16.0/Python 3.13.3, CMake 3.31.6
and Ninja 1.11.1.3. Rebuild on this PC:

```powershell
& .\work\tools\emsdk\node\22.16.0_64bit\bin\node.exe browser-emulator/scripts/build-core.mjs
& .\work\tools\emsdk\node\22.16.0_64bit\bin\node.exe browser-emulator/scripts/prepare.mjs
& .\work\tools\emsdk\node\22.16.0_64bit\bin\node.exe --test browser-emulator/tests/*.test.mjs
```

For a fresh checkout, use `git -c core.autocrlf=false clone --branch Emulator
--single-branch https://github.com/TheDraconicPanda/pokemon-reader.git`, then
clone the core tag `1.1` into `work/research/melonds` and emsdk tag `4.0.10` into
`work/tools/emsdk`. The build script verifies the exact core SHA. With an existing
Python 3 executable, run `emsdk.py install 4.0.10`, then `emsdk.py activate 4.0.10`
(no `--global`, `--system` or `--permanent`). Use pip with `--target
work/tools/python-packages --cache-dir work/cache/pip` for `cmake==3.31.6
ninja==1.11.1.3`; redirect TEMP/TMP to `work/tmp` first. The Codex-bundled Python
used for initial setup is at
`C:\Users\willm\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
For other installed tool paths, set `EMSDK`, `EMSDK_PYTHON`, `CMAKE_BIN`,
`NINJA_BIN`, `MELONDS_SOURCE`. Linux supports the same build script with existing
CMake/Ninja/Python and a repository-local emsdk. No tool installer is run by the
normal preview server.

`prepare.mjs` deterministically refreshes the offline inventory and parser
closure and builds a corresponding-source ZIP. New icons are code-generated.
No test ROM or synthetic save is included in the public asset inventory. The
CI workflow verifies shipped binaries and the real browser flow, and uploads an
explicit public-assets artifact; it does not publish or replace GitHub Pages.

The root `.gitattributes` preserves LF bytes for pre-existing hash-evidence
tests on Windows. For an older CRLF checkout, run
`node browser-emulator/scripts/canonical-checkout.mjs` once. It restores only
files whose sole difference from HEAD is CRLF conversion, preserving actual
edits. Existing website/native source contents are unchanged.

See `docs/browser-b1-evidence.json` for checks actually completed and delivery
status. Desktop Chromium, synthetic saves, compilation and PCM production do
not establish iPhone WebKit, commercial-game, audible quality, performance or
energy acceptance. No player ROMs/saves were available in this environment.

Primary browser/setup references: [service-worker secure contexts](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API),
[WebKit storage](https://webkit.org/blog/14403/updates-to-storage-policy/),
[Cloudflare Quick Tunnels](https://developers.cloudflare.com/tunnel/get-started/quick-tunnels/),
[pinned cloudflared checksums](https://github.com/cloudflare/cloudflared/releases/tag/2026.11.0).
