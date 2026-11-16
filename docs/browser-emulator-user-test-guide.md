# Browser Emulator User Test Guide

Use this guide when helping the user test the Browser B1 emulator. The goal is
to guide them through one small check at a time, capture clear results, and avoid
risk to their only game/save copy. The emulator is an early browser prototype;
iPhone performance, battery use, and real-game save handling still need user
validation.

## Instructions for the guiding assistant

- Start by asking which device and browser they are using, and whether they are
  testing the [hosted emulator](https://thedraconicpanda.github.io/pokemon-reader/browser-emulator/)
  or a local PC preview. Do not ask for ROMs or save files.
- Guide one test at a time. Explain what to do, what result to look for, then
  wait for the user's observation before moving on.
- If a step fails, pause the checklist and help record the issue before trying
  workarounds. Ask for the exact on-screen message and a screenshot if useful.
- Keep ROMs and saves on the user's device. Never ask them to upload either to
  ChatGPT, GitHub, or another service. Ask them to keep a separate backup of
  important saves.
- Distinguish what they observed from what the test proves. In particular,
  “Persisted” confirms a browser storage transaction, not that the game's save
  sequence completed or that storage can never be evicted.
- Save the device/browser, test step, expected result, observed result, and any
  error text in the final notes. Do not claim iPhone acceptance from desktop
  checks or long-term safety from one successful save.

## Test sequence

### 1. Open and initialize

Open the hosted emulator over HTTPS. Wait for **Offline app ready** and confirm
the page reports that it is ready without an error. On the first visit, the app
needs time to cache its offline assets. Record any other startup or capability
message.

### 2. Load a game and check controls

Use **Choose .nds** to select a legally obtained local ROM. The file should be
kept in the browser's local storage; it is not uploaded by the app. Check that
the game starts, both DS screens draw, and the displayed game responds to the
direction and A/B buttons. Try the touchscreen if the game uses it. On a phone,
check that the controls are comfortable and do not hide important screen areas.

Tap **Resume + audio** after a user gesture and check whether sound plays. Note
the browser's mute/silent mode and any recurring gaps, pops, or audio delay.
Pause, resume, and verify that controls respond again. If something hangs,
record the last action and status message before reloading.

### 3. Check one ordinary save safely

Do this only with a backup or a test save the user can afford to lose. Save from
inside the game and wait for **Persisted browser snapshot**. Use **Export raw
.sav** to save a backup to the device. If practical, open that export in the
existing Reader and confirm the expected trainer and party information. Keep the
original save untouched. Do not test or promise portable save states: B1 uses
cartridge saves, and save states are not portable.

### 4. Check offline reopen

After setup and a successful save export, disconnect the device from the
network. Close and reopen the same browser app, then choose **Reopen local ROM**.
Check that it launches and retains the expected progress. Record whether the
device is using Safari directly or its Home Screen web app, since their storage
may be separate. Reconnect afterward. Never clear website data or remove the
Home Screen icon as a test when the user has unexported saves.

### 5. Optional longer phone check

Only after the basic checks work, try a short normal-speed session on the target
phone. Note the phone model, OS version, browser/app mode, starting battery,
brightness, volume, Low Power Mode, and whether the device gets noticeably warm.
Check the emulator's speed, frame timing, presentation rate, and audio counters
before and after a few minutes of walking, menus, and battles. Use **Export
diagnostic report** if the user wants to share measurements; the report is
designed to contain browser/metrics information, not ROM or save bytes. Do not
run a long session or compare battery performance until the user has agreed on a
safe test duration and has exported a save.

## Notes template

```text
Device/model:
OS version:
Browser and version:
Hosted HTTPS or local preview:
Home Screen app or browser tab:
Game tested (title only; no ROM file):

Step:
Expected:
Observed:
Error text / screenshot:
Diagnostic report exported (yes/no):
Save exported and kept as backup (yes/no/not tested):
```

## Reference

The detailed technical protocol and current prototype limitations are in
[`docs/browser-b1.md`](browser-b1.md). The user-facing page also has an
**Offline setup & test instructions** disclosure. This guide focuses on a safe,
guided first pass rather than the full matched performance study.
