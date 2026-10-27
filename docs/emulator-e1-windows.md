# Install the E1 test build using Windows

The E1 package is an **unsigned iPhone app**, not an executable for Windows.
Windows is used to sign/install it onto your iPhone 16 Plus. The target iOS
version supplied by the user is 26.6.1; installation on that exact version is
still to be validated. No Mac, jailbreak or emulator-JIT activation is required
by the application.

## Get the correct file

Open `DOWNLOAD-E1-0.1.0.txt` in the project's **Emulator** Google Drive folder and
follow its link to the successful GitHub build. Download the
`ReaderEmulator-E1-unsigned` artifact. Extract the outer ZIP on Windows. The phone
package inside is `ReaderEmulator-E1-iphoneos-unsigned.ipa`; the simulator ZIP is
for macOS development and will not run on an iPhone or Windows.

## Sign and install with AltServer

1. Follow AltStore's current [official Windows setup guide](https://faq.altstore.io/altstore-classic/how-to-install-altstore-windows)
   for AltServer and the required Apple Windows software. Connect/unlock the
   iPhone by USB and complete Apple's computer-trust prompt.
2. AltServer supports direct IPA installation: hold **Shift** while clicking its
   Windows system-tray icon, choose **Sideload .ipa…**, select your iPhone and
   choose `ReaderEmulator-E1-iphoneos-unsigned.ipa`. This option is documented in
   the [official AltServer release notes](https://faq.altstore.io/release-notes/altserver).
3. Complete the Apple Account authentication in AltServer itself. Do not send
   passwords, signing certificates or verification codes to this chat or Drive.
4. If prompted, trust the developer entry in iPhone Settings → General →
   VPN & Device Management. Enable Developer Mode under Settings → Privacy &
   Security if required, following the phone's prompts.
5. Open **Reader Emulator E1**. Directly sideloaded free-account builds expire
   after seven days and need reinstallation/refresh through the signing method.
   Keep the same app identity and export your test saves first. Do not delete
   the app to refresh it. AltStore Classic is an alternative for managed refresh;
   see its [official getting-started guide](https://faq.altstore.io/altstore-classic/your-altstore).

This is a documented installation route, not a claim that signing has already
succeeded on your computer or phone. If installation fails, record the exact
AltServer/iPhone error. Signing/authentication failures and application launch
failures are different checks; neither is a measured core-performance result.

## First test: about five minutes

1. Tap **Diagnostic**: expect a red top screen and green bottom screen.
2. Open your uncompressed SoulSilver ROM; import a **copy** of its normal raw
   512 KB game save with **Game save**. Save states are not Reader input.
3. Check touch input, buttons, music, walking and a battle at normal speed.
4. Save normally inside Pokémon, then tap **Export save** to keep progress in
   Files. This E1 prototype does not yet persist gameplay sessions automatically.
5. Tap **Report** and save the JSON. This pauses the game. You can put that report
   into the Emulator Drive folder and tell the assistant to inspect it.
6. Repeat the smoke test with Platinum before beginning the longer matched
   [Delta comparison](emulator-e1-benchmark.md).

The first feedback needed is whether installation, launch, the diagnostic and
both games work. Battery/core acceptance remains pending until the controlled
comparisons are recorded. E2 and E3 are not part of this E1 test build.
