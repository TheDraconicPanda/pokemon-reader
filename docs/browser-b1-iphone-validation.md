# Browser B1 iPhone validation handoff

## Current status

B1.0 received an initial iPhone 16 Plus test in the Home Screen web app. The user
reported smooth gameplay during a short session and successful offline
operation. Switching to another app and returning preserved the live session
while it remained resident. After a long background period and full app close,
the session did not return at the same gameplay point. This was expected before
B1.1 because the old version persisted cartridge `.sav` bytes, not the full
emulator machine state.

The user reported that raw `.sav` export succeeded but importing that file into
the existing Reader did not work. This is a separate unresolved compatibility
issue. Do not assume whether the export or Reader import is at fault; compare the
exact bytes against a known-good save and inspect the Reader validation reason.

The user does not want full-session recovery to depend on Pokémon's in-game Save
command. Cartridge-save persistence and full-emulator-state persistence are
separate mechanisms. The native iOS emulator is outside this browser milestone
and must not be modified.

## B1.1 behavior to validate

- During gameplay, wait for the status to report an automatic full-state
  checkpoint. The initial cadence is 30 seconds. The checkpoint status reports
  size, capture duration and storage duration separately from `.sav` status.
- Use **Quick Save** (disk icon between L and R) and confirm the separate Quick
  Save slot reports success. It is one replaceable on-device emergency slot; it
  survives app close/reopen while browser storage remains available.
- Without using Pokémon's in-game Save, background the Home Screen app for a
  while, fully close it, relaunch, use **Reopen local ROM**, and choose the latest
  checkpoint. Compare gameplay position and current UI state with the saved
  checkpoint. The background checkpoint is an extra attempt; periodic capture is
  the recovery mechanism.
- Repeat with airplane mode enabled after the app and ROM have been cached. Test
  restoring both the latest automatic checkpoint and Quick Save. Also choose
  **Start from cartridge save** and confirm it still boots normally.
- Test the `.sav` path separately: make a normal in-game save only when the user
  is comfortable doing so, check its own persistence status, export it, and
  investigate the Reader import failure. Do not conflate this with full-state
  restore.
- Exercise unavailable storage/quota and a corrupt newest state generation in a
  safe test profile. Confirm the previous valid state is offered, the failure is
  explicit, and `.sav` records are not overwritten by restoring an emulator
  checkpoint.
- Record iPhone model and iOS version, browser/Home Screen mode, checkpoint
  duration/size, visible stutter, speed/audio counters, heat and battery. The
  serialization runs in the emulation worker and can briefly pause frames.

Do not claim iPhone acceptance until these real-device checks pass. The prior
short smooth session is not sustained speed, battery or thermal evidence. Keep
the longer B1-versus-native/Delta battery comparison deferred until the
state-recovery behavior and raw `.sav` Reader-import issue are understood.

ROMs, saves, and states remain local to the browser. Never request the user's
ROM, `.sav`, or state file as an upload. Diagnostic reports contain metrics and
browser details only.
