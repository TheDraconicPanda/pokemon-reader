# iPhone emulator v1 implementation plan

Agreed scope and execution rules, 27 October 2026. E1 implementation is underway:
native prototype 0.1.0 and unsigned hosted release builds exist; signed iPhone
installation, game/battery benchmarks and core acceptance are still pending.
Recovery implementation belongs to E3. Request milestones by stable ID, for example:
"Implement Emulator E1."

## Product scope

- Native iPhone app first; acceptance device: iPhone 16 Plus. iOS version is
  user-reported as 26.6.1. Delta runs acceptably on this device, but its blanket
  fast-forward and extra battery use are not the desired model.
- Native melonDS is the first candidate, not an established performance winner.
  Pin the actual core/adapter revision after checking buildability, licensing,
  game compatibility and device performance. Keep the adapter replaceable.
- Initial certified game matrix: original English SoulSilver and Platinum.
  These are the Reader's supported DS games. Document tested revisions; do not
  turn successful ROM import into a claim of compatibility with every DS game.
- Two DS screens, touch/buttons, sound, local ROM import, durable in-game saves,
  manual save states, automatic recovery and an integrated Reader are in v1.
- Reader input is a validated copy of the completed in-game save. Save states
  restore gameplay only. No live-memory Reader integration in v1.
- Normal emulation speed is the v1 target. Blanket or selective emulator
  fast-forward is outside v1. Granular movement/battle/transition acceleration
  belongs to the separate ROM project. Test a modified ROM as an additional,
  explicitly identified variant when available; its absence does not block the
  original-ROM milestones. Never assume save/state compatibility after a patch.
- Desktop, browser emulation, GBA emulation, new Reader game codecs, cloud sync,
  network play, cheats, rewind and App Store launch are separate future work.
  Existing LeafGreen web support is preserved; melonDS does not play GBA games.

## Existing evidence and architectural boundaries

The inspected baseline is Reader v0.27.0, commit `cb2025d`, with explicit
SoulSilver/Platinum/LeafGreen dispatch in `js/saves/index.js`, Gen IV container
handling in `js/saves/gen4-container.js`, and decoded Adventure Profiles in
`js/adventures.js`. The README reports 306 checks for its last Reader release;
that is historical evidence, not a fresh test run or emulator validation.

Reuse the JavaScript parser and Reader presentation inside the native app where
practical. Run the emulator natively, not inside a web view. Bundle the Reader's
required local assets for offline use; audit its imports and storage assumptions
before promising complete native embedding. Pause emulation while Reader is open.
The installed app and Safari have separate storage; do not promise automatic
sharing of Adventure Profiles with the existing website.

Keep existing save-export/evolution/repair functions separate from the emulator's
active save. This integration is read-only: it must not silently apply a Reader
export to the running game. Existing website behavior remains supported.

Sources to recheck and pin during E1:

- [Delta's cores and iOS build setup](https://github.com/rileytestut/Delta)
- [melonDS iOS integration and game-save hooks](https://github.com/rileytestut/MelonDSDeltaCore)
- [Upstream melonDS](https://github.com/melonDS-emu/melonDS)
- [Apple background lifecycle](https://developer.apple.com/documentation/uikit/uiapplicationdelegate/applicationdidenterbackground(_:))
- [Apple offloading and retained app data](https://support.apple.com/guide/iphone/manage-storage-on-iphone-iph47c931112/ios)
- [TestFlight distribution](https://developer.apple.com/testflight/)

## Execution and completion contract

Implement one requested milestone at a time, including its relevant fixes,
tests, documentation and reviewable delivery. Do not begin the next milestone
without a new implementation request. Routine technical choices within the
milestone are delegated. Ask only about missing essential inputs, material scope
changes, external file writes, or an actual platform authorization blocker.

The user's latest explicit working locations are the `Emulator` branch in this
repository and the verified [Emulator Google Drive folder](https://drive.google.com/drive/folders/1065tfo0qpmwMqhTH12TfORae0rFivN91)
(ID: `1065tfo0qpmwMqhTH12TfORae0rFivN91`). File work in these locations,
including new source, ignored scratch files and build output, needs no routine
approval. Use connected Drive tools; a local Drive sync path is not known.
Use repository-local `work/` for scratch material.

Project-related research, investigation and commands are authorized within those
file-write boundaries. Any modification to other files requires approval first.
This includes external toolchain installs, caches, signing files and temporary
outputs; redirect these into the repository where supported. For a required
approval, briefly explain what the command will do, its target and its purpose.
Do not request permission again for authorized research or work in these two
locations. Authorization to run a Git command does not authorize unrelated writes.

Work on and push to `Emulator` by default in the existing checkout. This latest
direction supersedes older feature-branch/main-publication defaults for this
emulator track; integration into another branch needs explicit direction.
Preserve user/remote changes and use non-force pushes. Actual tool/platform
approval requirements still apply; explain concrete blockers and their source.
No new repository, hosting service or paid service is implied by this plan.

For native milestones, delivery means reproducible source/build instructions and
an identified build artifact through the agreed signing/distribution route;
publishing the website cannot install an iPhone app. Use the existing Pages site
for actual web changes. Documentation-only changes need no app version bump.
Track native build/core/state-format versions separately from the website version.

Each milestone report must identify its commit, checks actually run, artifact
and delivery status, known limits and the exact remaining user/device test.
Use distinct states: not started, in progress, blocked, ready for device testing,
and accepted. Compilation, a push, synthetic saves and simulator tests cannot
substitute for actual phone, player-save or battery validation. An investigation
that concludes "blocked" is finite and useful, but is not an accepted release.

## E1 — Installable prototype and performance decision

**Outcome:** an iPhone prototype and measured decision on the core before full
app development. This is the next implementation milestone.

Work:

- Inspect current upstream core/adapter options; choose and pin one buildable
  native melonDS route and record applicable reuse/distribution requirements.
  Do not copy the complete Delta app unless justified by this investigation.
- Establish a macOS/Xcode build route and signing/distribution route. This
  workspace is Linux and currently has no Xcode or signing setup. A hosted
  macOS runner is an option to investigate, not an assumed configured service.
- Build a minimal prototype that imports a user-provided ROM and a copy of an
  in-game save, displays both screens, accepts touch/buttons and plays sound.
  Keep original inputs unchanged; provide save export if the prototype can write
  progress. Label the prototype as a test build.
- Capture timing/audio diagnostics and a reproducible benchmark protocol with
  the exact phone/iOS, ROM hash, core revision, build settings and render options.
  Normal installation must not depend on enabling emulator JIT externally.
- On the iPhone 16 Plus, test SoulSilver and Platinum in overworld travel,
  battle entry, battles and menus. Compare matched 30-minute sessions against
  Delta at normal speed, fixed brightness/audio settings and similar starting
  temperature, without charging. Repeat paired runs before drawing battery
  conclusions; record battery health and measurement uncertainty.

Acceptance:

- [ ] A reproducible release build installs and runs on the target phone.
- [ ] Both target games complete the scene matrix with sound and working input.
- [ ] Sustained normal-speed emulation targets at least 99% of real time after
  warmup, with no recurring audio breakup or heat-driven slowdown. Measure
  emulated time; rendered FPS alone is not sufficient.
- [ ] Battery/thermal results are no materially worse than matched Delta runs.
  Record an explicit numeric energy budget from the baseline before accepting
  the candidate. Treat noisy or unavailable measurements as unresolved; do not
  invent an efficiency win or silently relax a failed budget.
- [ ] Record the core decision and evidence. If it fails, report the failure and
  one bounded alternative evaluation; further core search is a separate request.

Confirmed user setup: iPhone 16 Plus, user-reported iOS 26.6.1, no Mac, Windows
computer available. Hosted macOS release compilation is implemented. The
[Windows install route](emulator-e1-windows.md) is documented but not yet tested
on the user's phone; ROM/save access and device results remain user-side gates.
Never commit ROMs, personal saves or signing credentials.
Complete independent investigation while waiting; report an exact blocker if a
signed build or phone test cannot be produced. E2 depends on the E1 decision.

## E2 — Game library and durable in-game saves

**Outcome:** the approved core becomes a usable offline player whose normal
Pokémon saves survive closing and reopening the app.

- Import and retain local ROMs; identify games/variants by content hash, provide
  clear per-game entries, and keep saves separate across distinct ROMs.
- Finish portrait/landscape layouts, touchscreen coordinates, hardware buttons
  and pause/resume. Prevent stuck input after interruptions or layout changes.
- Persist game-save writes safely in durable app storage rather than cache/temp
  directories; keep a previous valid copy. Persist ordinary game saves promptly,
  independently of the recovery-state feature in E3.
- Support in-game save import/export, explicit replacement and failure messages.
  No silent replacement of another game's save. File extensions alone do not
  establish game identity; ambiguous valid saves need explicit association.
- Test low-storage/write failure, interrupted writes, invalid imports, two-game
  isolation, backgrounding, relaunch and offline startup. Build on the E1 core.

Acceptance:

- [ ] Both games can import a save, make a new in-game save, close, relaunch and
  continue from that progress; exported saves are independently readable.
- [ ] Failed/interrupted writes and invalid replacement preserve the last valid
  save and explain the failure. Original imported files are unchanged.
- [ ] Layout/input and persistent-save tests pass; target-phone save round trips
  and offline startup are recorded. Existing Reader regressions remain passing.

## E3 — Manual states and automatic session recovery

**Outcome:** interrupted play can resume without requiring a recent in-game save.

- Provide three labelled manual slots per ROM with timestamps; require an
  explicit action to overwrite a manual slot or load a state.
- Keep three rotating automatic recovery generations separate from manual
  slots. Capture safely when leaving gameplay, backgrounding or locking the
  phone; request permitted background completion time where needed.
- Add periodic active-play checkpoints. Start by evaluating a two-minute
  interval; measure capture stutter, storage and battery cost before fixing the
  release default. Checkpoint capture must pause/synchronise the core safely,
  then finish the disk write without racing resumed emulation.
- Commit each checkpoint atomically with integrity metadata: ROM hash, core and
  state-format versions, timestamp and associated game-save data where needed.
  Keep the previous completed checkpoint until the new one is committed.
- Offer Resume last session with its time, plus Continue from in-game save.
  Reject corrupt/incompatible states visibly and preserve their files. Keep a
  backup before state restoration can roll back ordinary game-save data; define
  and test the chosen core's SRAM/state behavior rather than assuming it.
- Preserve user-created saves and states across app updates/offloading by using
  durable storage. Gate core/ROM updates on state compatibility or a documented
  migration/fallback; never silently discard incompatible recovery history.
- Test foreground/background, phone lock, app switching, force termination,
  restart, interrupted write, corrupted newest generation, full storage, wrong
  ROM/core and restoration followed by a normal in-game save.

Acceptance:

- [ ] Both games restore a manual state and the newest valid automatic state
  after relaunch; corrupt newest checkpoints fall back to a valid predecessor.
- [ ] Automatic recovery never overwrites manual slots or destroys the previous
  valid save on failure. Core/save/state restoration stays consistent.
- [ ] Lifecycle and fault tests pass, with target-phone recovery, update and
  offload/reinstall checks through the selected installation route recorded.
- [ ] Checkpoint overhead stays within the E1 performance/energy budget, or the
  interval is adjusted and revalidated before acceptance.

iOS may terminate a suspended app without a final saving opportunity. A crash or
power loss can lose progress since the last completed checkpoint. Do not promise
zero-loss recovery or keep the emulator running while suspended to save later.
Deleting the app is different from offloading and can remove local data.

## E4 — Integrated Reader from completed game saves

**Outcome:** open Reader inside the app with the latest validated in-game save,
without a manual export/upload cycle.

- Bundle and open the existing Reader and its local dependencies in-app; reuse
  the shared save detection/parsers and Adventure Profile model.
- Pause emulation when entering Reader. Copy the latest stable game-save bytes,
  run checksum/game validation, and load through the existing Reader workflow.
  A save-write callback can represent partial writes: do not publish an
  unvalidated intermediate buffer or mistake an older valid partition for a
  newly completed save. Test actual native save-write sequences for both games.
- Show save age and game identity. When no new valid save exists, explain that
  the user needs to save in-game; preserve the last valid Reader profile.
- Test rapid switching, repeated/partial writes, stale requests, invalid data,
  multiple ROMs/trainers, cancelled profile choices and unsupported games.
- Recovery-state restoration does not itself update Reader data. After the next
  normal in-game save, refresh the corresponding adventure even if its gameplay
  progress moved backward; do not silently associate it with another profile.
- Make bundled native-app file import/export and local storage work; retain
  Reader, Planner, Atlas and Safari/Great Marsh navigation within their existing
  supported scope. No automatic app-to-Safari or cross-device synchronisation.

Acceptance:

- [ ] For both target games, a new normal save updates the correct Reader party,
  boxes and trainer/profile without export/upload; both operate offline.
- [ ] Invalid/incomplete/stale inputs preserve the prior valid adventure. State
  restoration followed by in-game saving refreshes the correct profile.
- [ ] Read-only integration never writes a Reader export into the active game.
- [ ] Meaningful integration checks and existing web regressions pass; actual
  phone/player-save checks and app-local profile behavior are recorded.

## E5 — Integrated release and device acceptance

**Outcome:** a reproducible v1 test release that meets all preceding criteria.

- Freeze and record the app build, bundled Reader version, core and state format.
  Run clean native release builds, relevant automated fault/integration tests,
  existing web regressions and the full two-game compatibility matrix.
- Repeat matched Delta performance/energy sessions with E2–E4 enabled and run a
  one-hour app session including battles, saving, Reader visits and recovery.
  Measure checkpoint and Reader overhead against the E1 baseline.
- Verify fresh installation, offline use, update retention, save/state exports,
  lifecycle recovery and the supported offload/reinstall route on the phone.
- Deliver the signed build through the agreed route with installation, backup,
  recovery and compatibility instructions; record the precise artifact/commit.

Acceptance:

- [ ] E1–E4 evidence and required device checks are complete with no unresolved
  progress-loss defect or performance/energy-budget failure.
- [ ] The final artifact installs, retains progress and passes the full target
  matrix on iPhone 16 Plus; user outcome acceptance is explicitly recorded.
- [ ] Known limits and remaining untested games/ROM variants are listed. Desktop,
  live data and granular ROM acceleration remain separate follow-up projects.

## Progress

| ID | Milestone | Current status |
| --- | --- | --- |
| Plan | Scope, permissions and acceptance criteria | Documented; no implementation claimed |
| E1 | Installable prototype and performance decision | Native prototype/unsigned builds implemented; signing, device tests and core decision pending |
| E2 | Library and durable in-game saves | Not started; depends on E1 |
| E3 | Save states and automatic recovery | Not started; depends on E2 |
| E4 | Completed-save Reader integration | Not started; depends on E3 |
| E5 | Integrated release and device acceptance | Not started; depends on E4 |
