# E4 — completed-save Reader integration, native 0.4.0

E4 adds an in-app copy of Reader 0.27.0 to the native emulator. Play, save
normally inside Pokémon, then tap **Reader**. Emulation and audio pause; the
Reader receives the latest completed cartridge save without export/upload.
Use **Game** to return, then **Resume** explicitly. Save states restore play;
they never supply Reader input. Phone testing remains deferred.

## Supported behavior

- The initial cartridge matrix is original English SoulSilver (`IPGE`) and
  Platinum (`CPUE`), raw 512 KiB saves. Other regional/game codes, hacks and
  revisions have not been certified. An imported ROM is not evidence of Reader
  compatibility. No retail game program or personal save was used by these tests.
- The banner identifies the ROM name/content hash, capture time, age and source.
  No completed save means an instruction to save in-game. An invalid candidate
  keeps the last decoded adventure. Capture time is host time, independent of
  the restored DS clock; changing the phone clock can affect the displayed age.
- Reader, Planner, Pokédex, Atlas and Safari/Great Marsh share this app's local
  Adventure Profiles. **Tools** offers direct navigation. Metadata, ordinary and
  shiny species sprites, existing local Atlas maps and simulator rules are
  bundled. Safari's twelve area screenshots retain their existing optional
  online Bulbagarden sources and unavailable-image fallback; encounter planning
  remains usable offline. External reference links offer an explicit Safari action.
  The Team Planner and Johto Safari retain their existing SoulSilver scope;
  Platinum uses its supported Pokédex, Atlas and Great Marsh reference/planner.
- Different ROM contents have separate bindings, even with the same trainer
  IDs. The first association with an existing trainer asks whether to create a
  separate adventure or use a selected one. Cancel preserves stored profiles.
  The subsequent completed save updates that binding. Trainer changes receive
  a new association rather than silently replacing a different trainer.
- After state restoration, Reader retains the last completed ordinary save.
  The next completed in-game save can update the same adventure even when
  gameplay progress/counters have moved backward. The restored SRAM alone is
  never published as fresh Reader data.
- Automatic copies are read-only. Reader's file input still imports a separate
  file, including supported browser-only games within their existing scope.
  Modified exports go to **Files/share**, never to the running cartridge.
  To export the actual cartridge save, use **More → Export cartridge save**.

## Storage and implementation

The native emulator still runs outside the web view. `SaveObserver` watches
actual melonDS cartridge-write callbacks. Full relevant footer coverage, block
CRC, game/layout checks and matching save generations are required. Body writes
reset old coverage, so an interrupted attempt's footer cannot commit a retry.
Quiet time alone is insufficient; an older valid fallback is not a new save.

HGSS uses two matching 16-byte footers. Platinum uses 20-byte footers with
independent global/block counters and a secondary/primary commit sequence;
normal-only saves can retain the previous PC block. The pinned primary routines,
headers and SHA-256 values are in
[the source ledger](../ios/Web/save-observer-sources.json).
Tests replay these phases through actual pinned melonDS retail and IR SPI.
They do not execute Pokémon's retail saving code.

`reader.completed` is an atomic, SHA-256-protected, ROM-bound cache containing
the completed raw save and capture time. It is separate from cartridge and
checkpoint generations. Failure preserves the earlier cache; further completed
saves retry retention. Loading/explicit import seeds this cache; state restoration
seeds from the retained ordinary save. Original user files are never edited.

The existing shared Reader validates trainer, party and all PC records before
an atomic profile/binding transaction. Native-only canonical decoding duplicates
the selected committed blocks into both partitions of a temporary copy, avoiding
the shared Reader's historical HGSS footer-counter heuristic. This copy is not
exportable. Source cartridge bytes and normal file imports remain unchanged.
The profile database stores decoded snapshots and digest/binding metadata only.
Each presentation has a token; superseded asynchronous work aborts its transaction.

A static HTTP server binds only `127.0.0.1:49621`. It serves the bundled public
assets and exposes no private save, filesystem-write or emulator-control API.
Private bytes travel through the main-frame WebKit bridge. Navigation is confined
to that exact origin; the app uses persistent WKWebsiteDataStore. A fixed origin
keeps app-local IndexedDB stable. If the port is unavailable, Reader reports an
error and preserves profiles rather than switching to an empty storage origin.
No cloud/Safari/cross-device sync is implemented. App deletion can remove data;
offload/reinstall/update persistence and low-storage WebKit behavior require
device validation. Keep exported backups.

The bundle generator leaves the production website unchanged, applies exact
audited overlays and records per-file hashes. Offline HGSS types/growth/gender,
move PP and item identifiers are generated from pinned primary files; see
[the facts ledger](../ios/Web/hgss-offline-sources.json). Normal Reader remains
0.27.0; the native adapter/application is 0.4.0. Licenses/credits and source links
travel with both unsigned binary packages.

## Checks and delivery

[Machine-readable verification](emulator-e4-evidence.json) records exact source,
workflow, artifact and check results. [Download/install pointer](emulator-e4-download.txt)
identifies the unsigned iPhone and simulator packages. Signing is still required;
use the existing [Windows runbook](emulator-e1-windows.md).

Nine CTest groups cover the actual core, save/state storage faults, independent
Reader export decoding, real SPI completion/partial/retry/state rollback sequences,
bundle integrity and the native HTTP/browser connection. The browser check uses
real parsers, IndexedDB and Chromium with external requests blocked. It exercises
both games, repeated/invalid/stale deliveries, same-trainer ROM isolation,
cancelled profile choices, backward progress, explicit file import, native export
messages and tool navigation. macOS additionally runs storage/checkpoint faults
and a real WKWebView smoke check before artifact upload. These are host/runtime
checks, not iPhone acceptance. The unchanged website's full regression suite
is checked separately.

## Remaining device acceptance

On the signed iPhone build, check both target games with player saves: party,
boxes, trainer and save age after repeated normal saving; opening Reader during
saving; repeated game/Reader/tool switching; cancelling matching profile choices;
state restore followed by a backward-progress normal save; force quit/relaunch;
offline startup; Files import/share/export and independent exported-save reload.
Confirm app-local profiles across relaunch, offload/reinstall and update without
assuming Safari shares storage. Check WebKit process termination and low storage.

Carry E1–E3 installation, controls, clock/lifecycle, recovery, game compatibility,
checkpoint stutter and battery checks forward. Measure Reader entry, retained
copy writes and return-to-game overhead on the iPhone 16 Plus against matched
normal-speed Delta sessions. The core remains provisional. E5 is the finite
integrated release/device-acceptance milestone and requires a new implementation
request. No fast-forward, live memory, desktop/web emulation or cloud sync is added.
