# E3 — Manual states and automatic recovery

Native test build **0.3.0**, 2 November 2026. Engineering implementation and host
checks pass; hosted unsigned release builds are being verified. E1–E3 phone
acceptance remains deferred. No phone performance/battery result is claimed.

## Using recovery

- **States** shows three manual slots for the selected ROM and available
  automatic checkpoints with local timestamps. Select a slot, then explicitly
  save, overwrite or load. Loading warns that gameplay/cartridge memory rolls back.
- Reopening a library game offers **Resume checkpoint**, its timestamp, and
  **Continue from in-game save**. Corrupt/incompatible entries are skipped visibly;
  the newest usable automatic predecessor is offered. **States** shows unavailable
  entries and reasons; their files remain stored.
- Automatic captures occur when pausing/leaving gameplay, switching apps, locking
  the phone or receiving an audio interruption. Periodic captures initially use
  two active minutes. **More → Recovery interval** selects two minutes, five
  minutes, or pause-only. The two-minute setting is a **test default**, pending
  actual phone stutter/energy measurement before release acceptance.
- **More → Export pre-restore cartridge backup** exports the most recent verified
  game-save backup made before loading a state. If both cartridge files were
  already damaged, raw copies are preserved separately; a prior verified backup
  may still be available. Normal **Export save** exports current cartridge memory.
- Keep saving normally in-game, and export backups before installation changes.
  Recovery states restore gameplay; they are not Reader input. E4 still needs
  the integrated Reader and completed-save detection.

## Storage and restoration policy

Checkpoints reside under Application Support/ReaderEmulator/games/<ROM SHA-256>/states.
Three fixed manual slots are separate from rotating automatic files. At steady
state there are three usable automatic generations per compatibility identity.
Write failures may leave additional committed files; the next successful rotation
prunes only verified compatible predecessors. Corrupt and incompatible history is
preserved, so unavailable files can increase storage use. No state-import feature
is exposed in this milestone.

A checkpoint commits a single compressed envelope containing the complete native
state and associated SRAM bytes. It includes ROM SHA-256, compatibility identity,
core/state/ABI description, timestamp and generation. SHA-256 covers metadata and
compressed payload. Size bounds apply before allocation/decompression. System
zlib level 1 compression runs on the storage queue; a staging file is synchronized
before atomic rename and directory synchronization. Retention occurs afterward.
An interrupted staging file is never offered for restoration.

Compatibility includes the exact melonDS revision, state version 13.0, adapter
state contract 1, CPU architecture and BIOS/firmware content. Different ROM hashes
have separate folders. Future incompatible cores/system files keep prior history;
return to the matching configuration or continue from a normal game save. No
automatic migration or cross-architecture state portability is promised. App
version changes alone do not erase states or ordinary saves.

Capture runs between frames on the serial emulation queue. The software renderer
is joined while serializing. State/SRAM bytes are detached before gameplay may
resume; compression, hashing and disk writes use the separate storage queue.
If play stops while another checkpoint is being written, a follow-up snapshot of
the paused position is requested before lifecycle waiters finish. iOS background
completion time is requested and ended, with an expiration handler.

Restoration first loads a separate candidate core with the matching ROM/system
configuration. The envelope is checked before the native parser; the native
section chain/version/length are checked before calling upstream state loading.
Candidate SRAM must match the envelope's associated bytes. The current durable
cartridge save is backed up, then the restored timeline gets a new automatic
checkpoint before the candidate replaces the active console. Failed validation
or writes preserve the active console and earlier completed checkpoints.

The pinned core serializes and restores SRAM, and calls its cartridge-write hook
during restoration. That callback is suppressed as a persistence event: **loading
a state alone does not replace the on-disk cartridge save**. The next real
cartridge write can persist the restored timeline, while the pre-restore backup
remains available. Corrupt current/previous cartridge files are copied before
restoration so a good checkpoint can recover them without discarding evidence.

iOS may terminate an app without another callback, or stop unfinished background
work. A crash/power loss can lose changes after the last completed checkpoint.
Offloading is intended to retain app data; deletion can remove it. Actual update,
offload/reinstall retention through the signing route is still a phone check.

## Checks and measurements

Local CTest checks: **5/5 pass**. Existing website regressions: **306/306 pass**,
zero skips/failures. Host tests use original ARM programs with SoulSilver IR and
Platinum cartridge types, synthetic SoulSilver saves, and independently PKHeX-
generated synthetic Platinum saves. No commercial gameplay/phone evidence is
included. Native tests verify RAM/input continuation, SRAM rollback, a fresh-core
restore, restoration callbacks, pre-restore backup retention, subsequent real SPI
writes and independent JavaScript Reader parsing of exported cartridge saves.

Checkpoint fault tests cover three manual/three automatic generations, newest
corruption fallback, incompatible history, ROM mismatch, ENOSPC at creation,
partial write, sync and pre-rename, and real process death at write/sync/rename
boundaries. Both the native and storage paths are exercised; hosted macOS storage
checks and unsigned device/simulator release compilation remain to be verified.

Reports include last capture milliseconds, storage milliseconds, raw state/SRAM
bytes and committed compressed bytes. Periodic capture gaps count toward measured
active time rather than inflating the emulated-time ratio. Automatic pauses also
appear in the event/pause log. Treat these controlled checkpoint pauses separately
from user interruptions when applying the E1 benchmark protocol, and include their
overhead in both normal-speed and matched energy comparisons. Host timings are
diagnostic measurements of original test programs, not phone/game energy results.

## Deferred phone acceptance

- Sign/install, then restore all three manual slots and the newest usable automatic
  checkpoint in SoulSilver and Platinum after app relaunch.
- Verify gameplay, sound/input, pause/resume, lock, switching apps, force termination,
  restart, audio interruptions and paused-only/five-minute/two-minute intervals.
- Confirm corrupt-newest fallback and ordinary-save/backup consistency after
  restoration followed by a complete normal in-game save; test real low storage.
- Test fresh install, update retention and the selected route's offload/reinstall
  behavior without deleting app data. Export backups first.
- Record checkpoint stutter, compressed size and capture/write overhead during real
  gameplay. Repeat the E1 matched Delta energy/thermal test with recovery enabled;
  adjust the interval and revalidate if the agreed budget fails. No energy gate is
  waived by delivering this test default.
