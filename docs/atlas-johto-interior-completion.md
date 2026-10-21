# Johto building references — v0.25.68

The remaining building choices are now available in the existing Atlas selector.
Kurt’s house, Cianwood Pharmacy and Ecruteak Dance Theater have **game-data terrain
plans**, alongside ordinary houses, gatehouses, Pokémon Center basements, the
station floors, ship cabins and facility rooms. Existing artwork remains first.
The catalogue has **295 views / 278 PNG assets** across the same 69 non-Safari
location groups. No new Kanto location or Safari area has been added.

## What the new plans mean

These are labelled diagrams of the released HGSS game’s static tile attributes
and warp coordinates, **not screenshots, decorative game artwork or full movement
simulations**. Pale cells have no static terrain collision flag; dark cells have
that flag; E marks a recorded warp (an exit or stairs). An unflagged cell does not
promise a walkable surface: object collision, model height, script-controlled
transfers and puzzles can restrict it. Blank/unmodelled terrain may also lack the
flag. No NPC, item, train, puzzle state or current story state is invented.
Scripted rooms such as the train-present station can have no recorded E markers.

The image legend, selector label, accessible image description and visible note
identify this distinction. Full-size and Source links follow the selected plan.
Town-level encounters and compass connections remain town-level, with the existing
context note. These plans close the missing **room-reference** inventory; they do
not supply missing rendered artwork or simulate interior travel.

## Complete scoped census

[scripts/soulsilver-interior-rooms.json](../scripts/soulsilver-interior-rooms.json)
accounts for every primary `MAP_TYPE_INTERIOR` header in Johto, plus the already
included Route 26–28 / League border buildings and international Goldenrod Game
Corner (whose internal region flag is Kanto). There are **208 candidate headers**:

- **173 covered room headers**: 70 retain existing artwork/reference views;
  103 gain a terrain plan. A composite image can cover several headers, such as
  Mahogany Gym’s three rooms. Azalea’s small entrance is separate from its maze.
- **35 explicit exclusions**: unused/debug maps, shared online/battle-session
  rooms, the unscoped Sinjoh event cabin, and the Safari entrance interior reserved
  for its separate tool. Safari Zone Gate’s normal Pokémon Center is included.

The [generated coverage ledger](atlas-johto-interior-coverage.json) records every
included/excluded header, parent Atlas location, existing view or new plan,
matrix/event paths, input SHA-256 hashes, terrain-member IDs, cropped tile grids
and every warp coordinate/destination. Its `missing` list is empty. The generator
fails if a candidate header is unaccounted for, duplicated, or its reviewed format
changes. Previously mapped cave/tower floors retain their existing catalogue;
this census specifically closes building headers, not another region or battle
mechanics. The Olivine port gatehouse is under S.S. Aqua; ordinary route houses
remain under their route. Services are labelled from primary text: Olivine’s north
house is the Voltorb trade, while the northwest house supplies the Good Rod.

## Reproduction and evidence

Primary source: [pret/pokeheartgold at d2355244ac42b3c6e40d8c36aa3564ee8706dea4](https://github.com/pret/pokeheartgold/tree/d2355244ac42b3c6e40d8c36aa3564ee8706dea4).
This is the established HGSS map-layout source; it is not used to copy HeartGold
encounters into SoulSilver. The generator requires that exact clean revision and
records the actual input hashes as well as the Git revision.

- `src/map_matrix.c`, `MapMatrix_MapMatrixData_Load`, documents matrix dimensions,
  optional header/altitude arrays and model IDs.
- `src/terrain_attributes.c` / `include/terrain_attributes.h` load 32×32 little-endian
  u16 cells from `files/a/0/6/5` NARC members, at **HGSS offset 0x14**, size 0x800.
- `asm/unk_02054648.s`, `sub_020548C0`, reads bit 15 for static collision;
  `GetMetatileBehavior` reads the low byte. The diagram does not infer furniture
  type or movement permission from unknown attribute bits.
- `files/fielddata/eventdata/zone_event/*.json` supplies exact warp coordinates.
  NPC positions are intentionally not plotted because their visibility/movement
  depends on story and scripts.

With Python 3, ImageMagick and DejaVu Sans installed:

```sh
python scripts/build-soulsilver-interiors.py /path/to/pokeheartgold
python scripts/build-atlas-maps.py /path/to/atlas-source-archives
```

The first command reproduces the plans, updates the catalogue and writes the
coverage ledger. The second retains the existing archive/original checksum checks,
verifies the generated PNG checksums and produces the single game-scoped map
manifest. The released asset bytes and original embedded credits remain intact.
The diagram style is original; the tile and warp facts come from the cited game
data. Existing Pokémon rights/credits in assets/maps/README.md still apply.

## Validation and acceptance

Coverage checks verify all 173 room assignments, every generated warp marker,
source/checksum/dimension integrity, known Kurt/Theater/Pharmacy geometry, Azalea’s
entrance, Mahogany’s composite, script-only transfers and game/Safari isolation.
Browser checks cover every catalogue choice plus actual image loads for the named
gaps and ordinary rooms at 320, 390 and 1440 pixels, matching sources/full-size
links, returning to the overview and unchanged encounter text. Reader, Planner,
shared theme and existing Atlas/Safari regression checks are included in the full
suite: **157 tests passed, with no failures or skips**. Reproduction also produced
byte-identical catalogue, coverage and all 103 PNGs. Captured phone/desktop layouts
were reviewed. Publication status is reported separately after live-file checks.
User visual acceptance and actual in-game/save validation remain separate; no new
real-save validation is claimed.
