# Install Reader Emulator E4 using Windows

This guide applies to **Reader Emulator 0.4.0 (E4)**. Windows signs/installs the
unsigned iPhone app; the IPA is not a Windows executable. No Mac or emulator-JIT
activation is required by this application. Installation on the user's iPhone
16 Plus/user-reported iOS 26.6.1 is still to be validated.

## Download the iPhone package

1. Open the [verified E4 build](https://github.com/TheDraconicPanda/pokemon-reader/actions/runs/41512278571).
   Download the **ReaderEmulator-E4-unsigned** artifact at the bottom of the run.
   GitHub may require sign-in.
2. Extract the outer ZIP on Windows. Select
   **ReaderEmulator-E4-iphoneos-unsigned.ipa** for installation.
   The `iphonesimulator` ZIP is for macOS development.
3. The [download pointer](emulator-e4-download.txt) records the source revision,
   artifact checksum and expiration. If the artifact has expired, rebuild its
   pinned source revision rather than downloading a failed/unverified build.

The same download instructions are in the project's
[Emulator Drive folder](https://drive.google.com/drive/folders/1065tfo0qpmwMqhTH12TfORae0rFivN91),
under **DOWNLOAD-E4-0.4.0.txt**.

## Sign and install with AltServer

1. Follow AltStore's [official Windows setup guide](https://faq.altstore.io/altstore-classic/how-to-install-altstore-windows)
   to install AltServer and its required Apple Windows software.
2. Connect and unlock the iPhone by USB. Complete Apple's **Trust This Computer**
   prompt on the phone.
3. Hold **Shift** while clicking AltServer's Windows system-tray icon.
   Choose **Sideload .ipa…**, select your iPhone, and choose
   **ReaderEmulator-E4-iphoneos-unsigned.ipa**.
   Direct IPA installation is documented in the
   [official AltServer release notes](https://faq.altstore.io/release-notes/altserver).
4. Complete Apple Account authentication in AltServer itself. Do not send
   passwords, verification codes or signing certificates to this chat or Drive.
5. If prompted, trust the developer entry under iPhone **Settings → General →
   VPN & Device Management**. Enable **Developer Mode** under **Settings →
   Privacy & Security** if required, following the phone's prompts.
6. Open **Reader Emulator** and confirm the visible version is **0.4.0**.

Free-account builds normally expire after seven days and need refresh/reinstallation
through the signing method. Keep the same app identity and export backups first;
do not delete the app to refresh it. AltStore Classic is an alternative for managed
refresh; see its [getting-started guide](https://faq.altstore.io/altstore-classic/your-altstore).

This is a documented route, not a claim that signing already succeeded on the
user's computer/phone. If it fails, report the exact AltServer/iPhone error text.
Signing failures and app launch failures are separate from emulator performance.

## First session: about ten minutes after installation

1. Open **More → Diagnostic**. Expect a red top screen and green bottom screen.
2. Use **Import ROM** for an uncompressed `.nds`, then **Library** to reopen it.
   Optionally use **Game save** to import a copy of a raw 512 KiB save.
   Initial save/Reader support is original English SoulSilver (`IPGE`) and
   Platinum (`CPUE`). Other regions, hacks and revisions are not certified.
3. At normal speed, check buttons, touch, audio, walking and one battle.
   Fast-forward is excluded from v1. Note obvious slowdowns or audio crackling.
4. Save normally inside Pokémon. Open **Reader**: play should pause and the banner
   should show the ROM identity and save capture time. Check trainer, party and
   PC boxes against the game. Reader metadata and supported encounter tools work
   offline; Safari's optional area screenshots remain online references.
5. Use **Game**, then **Resume**, to return to play. Use **More → Export cartridge
   save** to keep a separate raw save backup in Files/share.
6. Close/reopen the library game and check that progress/recovery is available.
   **States** provides manual slots and automatic recovery. Restoring a state
   does not refresh Reader data; the next completed normal in-game save does.

The first feedback needed is whether installation/launch succeeds and whether
controls, normal-speed play, ordinary saving and Reader work. Exact error messages
or the relevant screen help identify failures. A short check cannot establish
battery efficiency or full game compatibility.

After the basic session works, follow [E4's remaining phone checklist](emulator-e4.md)
for recovery, Files/share, app-local profile persistence, offline startup and
lifecycle/offload/update checks, then the [matched Delta benchmark](emulator-e1-benchmark.md).
**Record test** and **More → Performance report** provide the measurement tools;
reports are exported explicitly, never uploaded automatically.

E1–E4 phone/core acceptance remains open. E5 is the integrated release/device
acceptance milestone; successful compilation or host tests do not pass it.
