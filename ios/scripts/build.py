#!/usr/bin/env python3
"""Build unsigned iOS device/simulator E1 artifacts; all output stays in work/."""
import argparse
import json
import os
from pathlib import Path
import platform
import shutil
import subprocess
import sys
import zipfile

ROOT = Path(__file__).resolve().parents[2]
LOCK = json.loads((ROOT / "ios/core.lock.json").read_text())


def run(args, env):
    print("+", " ".join(map(str, args)), flush=True)
    subprocess.run(list(map(str, args)), cwd=ROOT, env=env, check=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--sdk", choices=["iphoneos", "iphonesimulator"], default="iphoneos")
    args = parser.parse_args()
    if platform.system() != "Darwin":
        parser.error("iOS builds require macOS with Xcode; use the Emulator E1 GitHub workflow.")
    for tool in ("cmake", "xcrun", "xcodebuild", "git"):
        if not shutil.which(tool):
            parser.error(f"Missing {tool}; no external tools are installed by this script.")
    work = ROOT / "work/e1"
    build = work / f"build-{args.sdk}"
    artifacts = work / "artifacts"
    for path in (work / "tmp", work / "clang-cache", work / "swift-cache", artifacts):
        path.mkdir(parents=True, exist_ok=True)
    env = os.environ.copy()
    env.update({"TMPDIR": str(work / "tmp") + "/", "CLANG_MODULE_CACHE_PATH": str(work / "clang-cache"),
                "SWIFT_MODULECACHE_PATH": str(work / "swift-cache"),
                "XDG_CACHE_HOME": str(work / "cache")})
    sdk = subprocess.check_output(["xcrun", "--sdk", args.sdk, "--show-sdk-path"], text=True, env=env).strip()
    arch = "arm64" if args.sdk == "iphoneos" or platform.machine() == "arm64" else "x86_64"
    run(["cmake", "-S", "ios", "-B", build, "-G", "Xcode", "-DCMAKE_SYSTEM_NAME=iOS",
         f"-DCMAKE_OSX_SYSROOT={sdk}", f"-DCMAKE_OSX_ARCHITECTURES={arch}",
         "-DCMAKE_OSX_DEPLOYMENT_TARGET=17.0", "-DCMAKE_XCODE_ATTRIBUTE_CODE_SIGNING_ALLOWED=NO",
         f"-DCMAKE_XCODE_ATTRIBUTE_CLANG_MODULE_CACHE_PATH={work / 'clang-cache'}",
         f"-DCMAKE_XCODE_ATTRIBUTE_SWIFT_MODULE_CACHE_PATH={work / 'swift-cache'}"], env)
    run(["cmake", "--build", build, "--config", "Release", "--target", "ReaderEmulator", "--parallel", "4"], env)
    apps = [p for p in build.rglob("ReaderEmulator.app") if (p / "Info.plist").is_file()]
    if len(apps) != 1:
        raise RuntimeError(f"Expected one built application, found {apps}")
    app = apps[0]
    source = subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=ROOT, text=True).strip()
    info = {"appVersion": "0.1.0", "sourceCommit": source, "core": LOCK,
            "sdk": args.sdk, "architecture": arch, "signed": False,
            "iPhoneAcceptance": "not yet tested", "xcode": subprocess.check_output(["xcodebuild", "-version"], text=True).strip()}
    (app / "BuildInfo.json").write_text(json.dumps(info, indent=2) + "\n")
    (app / "Source.txt").write_text(
        f"Reader Emulator E1 0.1.0 — GPL-3.0-or-later\n"
        f"Corresponding application source: https://github.com/TheDraconicPanda/pokemon-reader/tree/{source}/ios\n"
        f"melonDS source: https://github.com/melonDS-emu/melonDS/tree/{LOCK['revision']}\n"
        "Includes FreeBIOS and upstream third-party components; see bundled COPYING and THIRD-PARTY.txt.\n")
    # License/copyright source files travel with every binary artifact.
    core_source = build / "_deps/melonds-src"
    license_path = core_source / "LICENSE"
    if not license_path.is_file():
        raise RuntimeError("Pinned core license was not found; refusing to package a binary.")
    shutil.copyfile(license_path, app / "COPYING")
    shutil.copyfile(ROOT / "ios/THIRD-PARTY.txt", app / "THIRD-PARTY.txt")
    archive = artifacts / f"ReaderEmulator-E1-{args.sdk}-unsigned.{'ipa' if args.sdk == 'iphoneos' else 'zip'}"
    with zipfile.ZipFile(archive, "w", zipfile.ZIP_DEFLATED) as package:
        prefix = Path("Payload") if args.sdk == "iphoneos" else Path()
        for file in sorted(app.rglob("*")):
            if file.is_file():
                package.write(file, prefix / app.name / file.relative_to(app))
    (artifacts / f"build-{args.sdk}.json").write_text(json.dumps(info, indent=2) + "\n")
    print(f"Built {archive.relative_to(ROOT)} (unsigned; signing is required for iPhone installation).")


if __name__ == "__main__":
    main()
