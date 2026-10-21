# Safari v1 — Milestone 2: verified data and mechanics (v0.25.76)

Safari Atlas now uses the same primary encounter tables and rules exposed by
`js/safari-engine.js`. It remains an **unfiltered reference**: no saved layout,
blocks, age or progress is inferred. Scenario initialization and the interactive
simulator/optimizer remain Milestones 3 and 4.

## Data and reproduction

The pinned primary is [pret/pokeheartgold d2355244](https://github.com/pret/pokeheartgold/tree/d2355244ac42b3c6e40d8c36aa3564ee8706dea4).
The shared HGSS Safari archive (`files/arc/safari_enc.json` and its build template)
and encounter loader have no HeartGold/SoulSilver substitution. This application
exposes the implementation only for `gameId: soulsilver`; no other game fallback.

The generated data contains all **12 areas**, **32 reachable area/method tables**,
**960 base time-slots** and **495 object time-slots**, preserving exact species,
levels, order and score requirements. Five methods are supported: Walking,
Surfing, Old Rod, Good Rod and Super Rod. Every method retains separate morning,
day and night tables, including differences in water/object encounter levels.

The Atlas catalogue merges identical rows across times into **339 reference
records**. The earlier 269 rows are replaced, not retained as a competing source.
[Change ledger](safari-encounter-changes.json) records added/removed
area/method/species combinations; row totals also reflect time/level splitting.
Examples include missing Desert object encounters, Peak Magmar, Forest Haunter,
Rocky Beach Lapras/Corphish, and incorrect Swamp/Marshland water species.

Run:

```sh
python scripts/build-safari-mechanics.py work/safari-primary
npm test
```

The checkout must be at the pinned revision with all consumed tracked inputs
unchanged. [Source ledger](safari-mechanics-sources.json) records URLs, SHA-256
hashes, generated-output hash and terrain evidence. No personal saves or original
map artwork are needed to generate the encounter data. The generator reuses the
existing NARC reader, not a competing map pipeline.

## Verified rules

- The 3×2 grid has six distinct active areas. Before Area Customizer unlock,
  only the actual six starting areas are available. There are ten possible
  starting arrangements; Peak occupies the entrance in all ten. Desert and Rocky
  Beach are never initial areas. The full list is generated from primary source;
  no starting arrangement is assigned to a loaded trainer by this milestone.
- Baoba's logical stage 4 enables Area Customizer for the second challenge.
  Stage 6 has completed that challenge; National Dex is also required for object
  unlock calls. Stage numbers are documented logical inputs, **not decoded save
  offsets**. An eligible call does not mean it has been received: actual object
  unlock level remains an independent input. Three hours of game time feed the
  phone system, with a later catch-up branch; the engine does not promise an
  exact real-world call time.
- There are 24 object types. Four scoring categories each have three objects;
  twelve decorations contribute zero points. Every object consumes one of the
  **30 placements per area**, regardless of its 1×1/2×2/other footprint.
  Generated metadata includes footprints and Fountain's water-only placement.
  Category quantity calculations do not assert collision-valid tile placement.
- Objects arrive as four six-object groups, each with three scoring objects and
  three decorations. Their order depends on the full 32-bit trainer ID modulo
  10, as used by `PlayerProfile_GetTrainerID`; it is not universally Plains,
  then Forest, then Peak, then Water. Levels 1–3 without that ID stay unknown;
  level 0 has no objects and level 4 has all 24. Manual configuration later must
  not invent received calls.
- Area age is stored by **area identity**, not grid position. Only active areas
  accrue credited days, and aging starts once object unlock level is nonzero.
  The counter saturates at 255. Inactive ages and earned upgrades persist.
  The daily update skips Safari aging during a clock penalty. If the player is
  inside Safari, game code defers the update until leaving; engine callers pass
  verified credited days, not a calendar estimate or unobserved pending updates.
- Swapping areas moves their object configurations. Replacing an area initializes
  its object list empty; it does not erase the identity-bound age counter.
  All engine changes return new values and leave supplied state unchanged.
- Scores are placed object counts multiplied by the category's age multiplier.
  Both categories of a two-category requirement must qualify. There is **no
  separate minimum-day field in the encounter archive**. The earliest day is
  derived from points, capacity and available categories. A guide's suggested
  count plus waiting period is one solution, not a second eligibility gate.
- Ten equally weighted slots start from the method/time base table. Qualifying
  object rows are scanned in archive order and replace slots from index 0 up.
  Multiple rows for one species occupy separate slots and their shares add.
  Remaining base entries stay in place; base percentages can therefore change.
- Base species rates in Atlas are explicitly **with no objects**. Object rows
  describe qualifying slot shares. The engine returns individual slots so the
  simulator can aggregate actual shares for a fully supplied configuration.

Upgrade days (a multiplier changes **at** the listed credited day):

| Category | ×2 | ×3 | ×4 | ×5 | ×6 | ×7 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Plains | 10 | 50 | 100 | 150 | 200 | 250 |
| Forest | 20 | 60 | 110 | 160 | 210 | 250 |
| Peak | 30 | 70 | 120 | 170 | 220 | 250 |
| Waterside | 40 | 80 | 130 | 180 | 230 | 250 |

## Cross-checks and source disagreements

Research on 2026-10-21 used the primary code plus
[Serebii's Safari guide](https://www.serebii.net/heartgoldsoulsilver/safarizone.shtml),
[Bulbapedia's indexed Safari documentation](https://bulbapedia.bulbagarden.net/wiki/Johto_Safari_Zone)
and [The Shining Stash's encounter slots](https://shinyfinder.github.io/encounter-slots/safari-zone/Land.html).
Bulbapedia's direct page returned a maintenance notice; indexed passages were
available through search. It was not treated as a freshly downloaded full page.

- Serebii's fifth multiplier starts ten days earlier than the primary table.
  The primary thresholds, also independently listed by
  [The Shining Stash](https://shinyfinder.github.io/encounter-slots/safari-zone/Block%20Scores.html),
  establish the implemented 150/160/170/180 boundaries. Tests check the day before,
  at and after every category boundary through day 250.
- Serebii's Lairon example supplies an independent 24-points/12-objects-at-day-30
  fixture. It is a multiplier example, not a general fixed wait requirement.
- Bulbapedia's Bagon example independently supplies 56 Peak plus 35 Forest
  points and a day-110 setup of 19 Peak and 9 Forest objects. Tests verify the
  earliest feasible age, insufficient earlier capacity, a second valid setup,
  and unavailable-category/impossible cases.
- Bulbapedia's Wetland example independently checks combined Plains/Forest
  replacement order: Furret, Farfetch’d, Pachirisu, then remaining base slots.
- Hand-transcribed expected tables from The Shining Stash cover no-object land,
  night land, Surf and all three rods. These fixed expectations are kept in
  `tests/fixtures/safari/reference-cases.json`, separately from generated data.
- The primary archive and external slot references include placeholder Surf/rod
  entries even for dry areas. Merely importing them would invent accessible
  encounters. The primary matrix places area models at `652 + areaId`; their
  original terrain attributes identify water in **Meadow, Rocky Beach, Wetland,
  Swamp and Marshland only**. Dry-area water tables are omitted. Tile-count and
  attribute hashes are in the source ledger; maps are not guessed from names.

## Engine contract and explicit limits

`resolveSafariSlots` accepts a fully specified hypothetical area/method/time,
four category counts and credited age. `evaluateSafariEncounters` additionally
checks Safari entry, active layout, explicit Surf/rod access and unlocked object
categories; it returns
`available`, `unavailable`, `unknown`, `invalid` or `unsupported` with reasons.
Missing fields do not silently become zero or unlocked progress. Water methods
need an explicit `methodAccess` boolean for the selected method; unknown rod or
Surf availability stays unknown. A known absent
area or dry water method is unavailable even if unrelated fields are unknown.

`minimumSafariBlocks` and `minimumSafariDays` calculate theoretical score/capacity
bounds; they do not claim the player's progress is known or provide the complete
target-change optimizer. `safariAvailableAreas`, `safariCustomizationAccess`,
`reconfigureSafariAreas` and `advanceSafariAges` supply the corresponding pure
layout/progression rules. Object-less scenarios must explicitly supply four zero
counts. Optional omitted decoration count means zero for a manually constructed
quantity scenario; a future save adapter must mark unknown counts separately.

Percentages are uniform **encounter-slot shares before lead abilities and Repel**,
not catch odds or probability per step/cast. Primary encounter code separately
applies Magnet Pull/Static slot selection, land level effects and encounter
suppression. This milestone does not calculate those lead-dependent changes,
bite rates, RNG modulo bias, Safari capture behavior, exact object tile packing,
linked Safari exchange state or DS clock manipulation. The Atlas labels the rate
basis; callers must not present it as a final modified chance.

No save-file offsets, loader changes, binary writes, storage migrations or new
frameworks are introduced. Loading a save still does not initialize Safari blocks,
ages or unlocks; this remains explicit until Milestone 3. Browser image checks use
the existing fixture/failure harness because original image-host access remains
restricted. No fresh real-save or in-game playthrough validation is claimed.

## Validation and publication

`npm test`: **186 passed, 0 failed, 0 skipped** on Node 24 / Chromium 154.
This includes all existing Reader/Planner/Pokédex/Atlas regressions, all twelve
Safari area views, corrected catalogue conditions, persistence/cross-tab behavior,
map load/failure fixtures and phone/tablet/desktop themes. Thirteen engine tests
cover the independent reference cases, all upgrade boundaries, capacity/unknown/
unlock restrictions, area changes and full catalogue/slot coverage.

The generator and source ledger reproduced byte-for-byte on two successive runs.
`git diff --check`, JavaScript syntax and Python compilation checks passed. No
save-reader code or personal save bytes were changed.

Release commit `6296381` was pushed successfully to the existing `main` deployment
branch on 2026-10-21 after a safe remote fetch and a normal fast-forward push.
Live Pages verification remains blocked by the known API/production-host HTTP
policy restriction; the browser-source connector also cannot access production.
A push is not proof of a successful Pages deployment. Milestone 2 implementation
and automated acceptance are complete; live publication confirmation is pending.
