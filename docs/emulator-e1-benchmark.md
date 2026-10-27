# E1 device benchmark and acceptance record

Status: protocol prepared; iPhone installation, game playback, battery and
thermal measurements are **pending**. Candidate: melonDS 1.1, exact revision in
`ios/core.lock.json`. Device: iPhone 16 Plus; user-reported iOS 26.6.1.

## Fixed comparison conditions

- Use a Release build and record its source SHA, core SHA and signing route.
  Record the installed Delta version/core version where available.
- Use the exact same ROM hash, copied starting game save, BIOS configuration,
  game settings, sound volume, screen brightness and network conditions.
  Keep auto-brightness, Low Power Mode and background activity controlled.
- Do not charge while measuring. Start at comparable charge and temperature;
  let the phone cool between runs. Record battery health and room conditions.
- Use original English SoulSilver and Platinum separately. Normal speed only;
  no fast-forward, cheats, save-state shortcuts or ROM acceleration. A modified
  ROM is a separate optional matrix, identified by its own hash.
- Complete at least three paired 30-minute continuous runs per game, alternating
  which app runs first. Use a repeatable journey from the same copied save.
  Include overworld travel, battle entry/transitions, battles and menus in each
  run, marking the scene transitions. Record interruptions and restart an
  interrupted comparison rather than silently excluding them.

## Playback and save checks

For each game verify both screens, colour/order, touch mapping, each DS button,
music/effects, text/menus, battle entry and a full battle. Make a normal in-game
save; export, close the prototype, reopen ROM/import the exported save and check
the expected party, location and progress. Preserve the original player save.
Only synthetic/original diagnostic data belongs in Git. Player files and test
reports may be placed in the authorized Emulator Drive folder at the user's
direction; do not change its sharing configuration.

The original diagnostic's red/green output is a separate smoke test. It does
not exercise commercial ROM protections, battle graphics or music correctness.
Real microphone input, networking, DSi peripherals and GBA gameplay are outside
this E1 frontend's supported matrix.

## Report fields and thresholds

Use **Record test**, mark scenes, then export **Report** after 30 active minutes.
The JSON records exact ROM/core/system-file hashes, device/iOS, source sample
rate, hardware audio rate, per-second battery/thermal/brightness/Low Power Mode,
emulated time, wall time, frame costs and audio underflow/overflow counts.

- **Speed:** target at least 99% emulated seconds per active wall second after
  warmup; also inspect scene windows so an overall average cannot hide battle
  slowdowns. This is not the displayed frame rate. Export/pauses are excluded
  from active time and listed as interruptions.
- **Audio:** no recurring audible breakup. Inspect missing/overflow sample counts
  and note route changes; startup is not a commercial audio-quality test.
- **Thermals:** no sustained thermal escalation or heat-driven slowdown compared
  with the matched Delta run. Investigate differences before accepting the core.
- **Energy:** provisional ceiling is a 10% relative increase over matched Delta
  energy use, subject to repeatability/measurement uncertainty. Establish and
  record the actual Delta baseline before accepting this budget. Do not widen
  it to excuse a failing candidate.
- **Measurement limit:** iOS battery percentages are coarse and the app cannot
  measure its own power draw accurately. A 1% change is not precise energy data.
  If repeated runs cannot resolve the energy budget, mark it inconclusive and
  use a suitably instrumented measurement route before claiming acceptance.

`meanFrameMs` and the frame-cost histogram measure the emulation callback plus
video/audio publication wall time, not total process CPU time or GPU energy.
`p95FrameMsUpperBound` uses 0.1 ms buckets, with overflow in the last bucket;
`maxFrameMs` remains the uncapped observed maximum. Use first/last per-second
counter differences to evaluate a scene/recording window instead of treating the
whole-session summary as a fresh benchmark baseline.

## Evidence ledger

| Gate | Evidence | Status |
| --- | --- | --- |
| Pinned source + no-JIT host build | CMake/native integration test | Host validation in progress |
| iOS device + simulator release compile | Exact GitHub run + artifacts | Pending |
| Signing and target-phone installation | Install route + build SHA | Pending; no Mac/signing setup supplied |
| SoulSilver scene/save matrix | Phone observations + report | Pending |
| Platinum scene/save matrix | Phone observations + report | Pending |
| Sustained speed and audio | Scene reports from both games | Pending |
| Repeated Delta battery/thermal comparison | Three matched pairs per game | Pending |
| Core accepted | All preceding gates | Not accepted |

If the candidate fails, identify the concrete failure and one bounded alternative
evaluation. Do not start E2 or search indefinitely for new cores under E1.
