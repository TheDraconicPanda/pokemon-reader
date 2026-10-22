# Platinum Reader — milestone 2

Platinum uses the existing Reader, party/PC details, collection, search, themes,
menus and local Adventure Profiles. Detection uses save contents, never filenames.
The shared foundation was released as 0.26.0 in `bb6bf5c`; Pages run
[39786973436](https://github.com/TheDraconicPanda/pokemon-reader/actions/runs/39786973436)
succeeded. Platinum Reader targets 0.26.1; release checks/publication follow below.

## Layout and primary evidence

Pinned pret/pokeplatinum: `49f78f35ccd8c6880e189d23a630eef2976c44ac`.
Pinned kwsch/PKHeX: `a9ff30657073b26825929a65ef58e61f99a1fe6f`.
Primary file URLs and hashes are in [the source ledger](platinum-reader-sources.json).
The optional independent harness calls PKHeX directly; no PKHeX binaries or library
source are bundled into the web application (PKHeX: GPL-3.0-or-later).
Generated tables contain factual game records; source copyright remains upstream.

| Field | Platinum |
| --- | --- |
| Raw size / backup stride | 0x80000 / 0x40000 |
| General size | 0xCF2C |
| Storage start / size | 0xCF2C / 0x121E4 |
| Footer | 0x14 bytes, excludes footer from CRC16-CCITT |
| Footer positions from end | save counter -20, block counter -16, size -12, signature -8, block ID -4, CRC -2 |
| Trainer / party count / first PK4 | 0x68 / 0x9C / 0xA0 |
| Box records | Storage +4, 18 boxes × 30 records ×136 bytes, no HGSS padding |
| Box names | Storage +0x11EE4, 40 bytes per name |
| Pokédex | 0x1328, caught/seen regions +4/+0x44 |
| Trainer game code / progress | 0x84 / 0x85 |

Reference implementations:
[SAV4Pt](https://github.com/kwsch/PKHeX/blob/a9ff30657073b26825929a65ef58e61f99a1fe6f/PKHeX.Core/Saves/SAV4Pt.cs),
[SAV4Sinnoh](https://github.com/kwsch/PKHeX/blob/a9ff30657073b26825929a65ef58e61f99a1fe6f/PKHeX.Core/Saves/SAV4Sinnoh.cs),
[SAV4](https://github.com/kwsch/PKHeX/blob/a9ff30657073b26825929a65ef58e61f99a1fe6f/PKHeX.Core/Saves/SAV4.cs),
[Zukan4](https://github.com/kwsch/PKHeX/blob/a9ff30657073b26825929a65ef58e61f99a1fe6f/PKHeX.Core/Saves/Substructures/PokeDex/Zukan4.cs),
[PK4](https://github.com/kwsch/PKHeX/blob/a9ff30657073b26825929a65ef58e61f99a1fe6f/PKHeX.Core/PKM/PK4.cs),
[G4PKM](https://github.com/kwsch/PKHeX/blob/a9ff30657073b26825929a65ef58e61f99a1fe6f/PKHeX.Core/PKM/Shared/G4PKM.cs).

Both block copies are checked. Platinum verifies selected game code, signature,
size, block identity, outer CRC, party count and every occupied PK4 checksum and
species ID. General and PC copies may differ. The newest coherent pair must share
a global save counter; if the newest copy is incomplete, a coherent backup pair
is selected. No match is an explicit error. This follows cartridge
`SaveData_LoadCheck` recovery constraints rather than blindly combining unrelated
copies; PKHeX independently selects each block and presumes a coherent source.
Extra Hall of Fame/frontier/video block bytes are not interpreted.

Shared PK4 handling now also corrects shiny XOR (both PID halves), legacy met/
egg location fallbacks, ball field fallback and the first four ball labels. Year
zero is 2000, not a missing date. Existing captured SoulSilver fixture outputs
remain identical. Character mapping comes from the primary Platinum charmap;
unrecognized code points display `�`, without invented text.

## Repeatable data and independent tests

Rebuild offline from the pinned clean primary checkout:

```sh
python scripts/build-platinum-reader.py /path/to/pokeplatinum
node --test tests/platinum-reader.test.cjs tests/gen4-foundation.test.cjs
```

The data generator asserts all 210 unique Sinnoh IDs, all 493 base species and
467 moves. Its committed local records give Platinum Gen IV types/stats/abilities,
growth curves, item names and move PP independently of current online metadata.
Species labels reuse the existing verified universal identifiers only.

All 32 shuffled PK4 permutations (including legitimate PID zero) are also
compared against independent PKHeX outputs. Empty PC records use the cartridge’s
encrypted zero payload, distinct from an occupied PID-zero Pokémon.

The three fixtures in `tests/fixtures/gen4/platinum/` were generated with PKHeX,
then read by PKHeX to establish committed expected results. They are synthetic,
not real player saves. Hashes/source revision are in `provenance.json`.
All three independently report `checksumsValid: true`. Normal tests use those
committed files and do not require .NET, networking or PKHeX.

To reproduce the optional independent oracle with .NET 10 and the pinned PKHeX
checkout (no app runtime dependency):

```sh
dotnet build scripts/pkhex-reference/Reference.csproj -c Release -p:PKHeXProject=/path/to/PKHeX/PKHeX.Core/PKHeX.Core.csproj
dotnet scripts/pkhex-reference/bin/Release/net10.0/Reference.dll generate /tmp/platinum-fixtures
dotnet scripts/pkhex-reference/bin/Release/net10.0/Reference.dll read /tmp/platinum-fixtures/postgame.sav
```

Assertions compare independent trainer identity/IDs, money/gender/playtime/badges,
party/PC records, forms, shiny/egg flags, names, experience, HP/status, nature,
ability/items, moves/PP/PP Ups, IVs/EVs, met locations and balls. Additional cases
exercise alternate copies, bad block IDs/signatures/game codes, mismatched global
counters, corrupt PK4s, invalid party size, truncation and profile roundtrips.
The browser journey loads actual fixture bytes with a deliberately misleading
filename, checks 320/390/1440px layouts, details, restoration and switching back
to SoulSilver without deleting the Platinum adventure.

## Explicit scope limits

Milestone 2 enables raw `.sav` reading and profile persistence. DSV/container
preservation and Platinum editing belong to milestone 3; the existing SoulSilver
writer is never invoked on Platinum. The reference Pokédex and Sinnoh Atlas remain
pending their own milestones. Johto Safari and the curated SoulSilver Team Planner
remain game scoped. Hall of Fame, Frontier/Underground records, linked systems
and real-game playthrough/real player-save outcomes are not certified here.

## Release gate

`npm run validate:atlas`: **249/249 tests pass**, zero mandatory failures,
100% existing Johto/Kanto location coverage. This includes the full existing
SoulSilver browser regressions and the new Platinum journey. The original
SoulSilver output/export fixtures remain equivalent.

Cartridge encrypted-empty evidence: [BoxPokemon_Init](https://github.com/pret/pokeplatinum/blob/49f78f35ccd8c6880e189d23a630eef2976c44ac/src/pokemon.c#L299)
and [PCBoxes_InitInternal](https://github.com/pret/pokeplatinum/blob/49f78f35ccd8c6880e189d23a630eef2976c44ac/src/pc_boxes.c#L28).
