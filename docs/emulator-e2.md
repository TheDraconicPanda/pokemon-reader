# E2 — Offline library and durable cartridge saves

Native test build **0.2.0**, 2 November 2026. Engineering implementation and
unsigned release delivery are complete.
[Successful device/simulator build](https://github.com/TheDraconicPanda/pokemon-reader/actions/runs/41473961486),
source `3a994d5`; [download details](emulator-e2-download.txt) and
[machine-readable verification](emulator-e2-evidence.json). Actual iPhone testing is deferred
by user direction. melonDS remains provisional; E1 performance/battery acceptance
and E2 phone acceptance are open. This is not a signed or accepted v1 release.

## Included behavior

- **Import ROM** retains a local copy. **Library** lists stored games offline.
  SHA-256 content identity separates different games and patched variants.
  Importing the same ROM under another name reuses its existing entry/saves.
- Normal cartridge-save writes trigger persistence independently of save states.
  The emulation queue copies memory; a separate serial storage queue validates
  and writes it. No filesystem work runs on the real-time audio callback.
- Save writes settle for 250 ms, with a two-second active-play retry/rate limit.
  Continuing writes request a snapshot after two seconds. Pause, app switching,
  lock and audio interruptions request a flush; iOS background completion time
  is requested and ended. Playback remains paused until explicitly resumed.
- Each save contains its ROM identity and payload SHA-256. A staged file is
  synchronized before atomic rename; directory metadata is synchronized too.
  A previous verified generation remains available. Interrupted staging files
  are not loaded. A corrupt newest copy falls back visibly to the previous copy.
- For English SoulSilver (`IPGE`) and Platinum (`CPUE`), import checks raw 512 KB
  size, block layout, CRCs, game marker, footer identity/magic and coherent block
  generations. This is structural validation, not full Pokémon-record decoding.
  Runtime persistence uses the same structural checks to avoid committing a
  snapshot with no recoverable save pair. E4 still needs completed-save detection
  and full Reader validation; an old valid partition is not proof of a new save.
- Import asks which current library entry to replace and restarts it only after
  successful core loading and disk commit. A game save cannot prove which ROM
  patch produced it, so association is explicit even when the game matches.
  Original imported files are unchanged. **Export save** shares raw cartridge
  bytes, never the app's internal storage envelope.
- If both stored copies are bad, the library offers an explicit ROM-only launch
  so a known-good backup can be imported. Existing files remain until replacement
  or a new in-game save. A corrupted ROM can be repaired by reimporting identical
  ROM contents without resetting its save identity.
- Optional BIOS/firmware copies survive relaunch. Reports describe the system
  files used by the active session, even when next-launch settings change.

App data lives in **Application Support/ReaderEmulator**, not a temporary/cache
directory. Exported backups/reports live in **Documents/Exports**. Ordinary iOS
offloading is intended to retain app data; deletion can remove it. Actual update,
offload and sideload-retention behavior still needs the later phone checks.

## Controls

Portrait stacks the screens; a wide screen area places them side by side. Touch
maps to the bottom/right DS screen and excludes the other screen and letterbox.
Rotation, pauses, disconnects and interruptions clear input. Touch coordinates
are transferred atomically; touch buttons, controller and keyboard use independent
masks so one source's release does not erase another source's held button.

Extended gamepad positions: bottom/right → DS B/A, top/left → DS X/Y,
shoulders → L/R, D-pad or left stick → directions, Menu/Options → Start/Select.
Keyboard: Z/X → A/B, S/A → X/Y, Q/W → L/R, arrows → directions,
Return → Start, right Shift → Select. Controller/keyboard hardware availability
and simultaneous real touch input remain phone checks.

## Verification and limits

Host checks cover the pinned core's actual SoulSilver IR and Platinum cartridge
SPI write paths, persistence, fresh-core reload, and raw exports independently
parsed by the existing JavaScript Reader. Synthetic SoulSilver and independently
PKHeX-generated synthetic Platinum fixtures preserve trainer, party and PC data.
No commercial ROM, personal save, or actual gameplay evidence is included.

Storage tests inject ENOSPC at creation/partial-write/sync/pre-rename boundaries
and kill a real process during both current and backup transactions. They verify
old-or-completed-new recovery, wrong-ROM/corrupt-save fallback, distinct ROM
isolation, interrupted imports, ROM repair, system-file persistence and touch
geometry. A failure after rename can leave the completed new copy visible while
durability confirmation fails; the verified predecessor remains available.
These are filesystem fault tests, not an iPhone power-loss experiment.

Local results: **4/4 native CTest checks pass**, and **306/306 existing website
regressions pass**. Hosted macOS storage checks and unsigned iPhone/simulator
release builds also pass. The app has not been launched in a simulator or on a phone;
compilation is separate from runtime acceptance. See [build instructions](../ios/README.md).

Saving normally in-game is still required. Abrupt termination can lose changes
since the last completed disk commit; no zero-loss guarantee is made. E3 manual
states and rotating recovery checkpoints are not implemented. E4 in-app Reader
integration is not implemented. Other DS games/regions and modified ROM behavior
are unverified; external save import is limited to the two English target codes.

## Deferred phone checks

Carry these into the later combined device test session; keep E2 unaccepted:

- Sign/install on iPhone 16 Plus; run both games with sound and touch/buttons.
- Import a save, make a new normal save, close/relaunch offline, and verify progress.
  Export each save and independently open it in the Reader.
- Switch games and patched variants; check that saves remain separate and wrong
  game/invalid imports preserve the current save.
- Check portrait/landscape, multitouch, held input through rotation/backgrounding,
  controller/keyboard connections, app switching, lock and audio interruptions.
- Check a real low-storage failure and recovery without losing the prior copy.
- Retain E1's matched Delta performance/thermal/energy checks. Measure E2 storage
  overhead with real save-write sequences before accepting battery behavior.
- Retain later update/offload/reinstall retention checks for the actual signing
  route. Export backups before installation changes; do not delete app data.
