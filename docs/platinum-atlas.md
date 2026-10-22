# Platinum Sinnoh Atlas — milestone 5

Sinnoh uses the existing Atlas renderer, search, floor selector, map viewer,
travel disclosures, caught markers, Pokédex links and EV finder. SoulSilver keeps
its own datasets, imagery and Safari rules. Explicit game/area URLs preserve
Sinnoh destinations; legacy SoulSilver links keep their meaning.

## Coverage and source decisions

The independently reviewed inventory has **125 location groups**, including all
30 routes (201–230), towns/cities, forests, lakes, caves, mountains, major
facilities, Battle Zone and event areas. Lost Tower is a distinct dungeon even
though its native met-location label is Route 209. Underground reference access
is included without inventing a fixed entrance or wild table.

All **593 native headers** are accounted for: **501 included areas** and **92
explained exclusions** (unused/legacy/system/network headers). Unnamed empty
headers are excluded only after a native C/event/script/matrix reference scan.
Unused encounter banks never become invented locations. Every location has
navigation and is reachable from Twinleaf in the reference graph.

The dataset contains **154 header-assigned encounter tables**, **5,724 formatted
encounter records**, **1,062 directed native warp/script/geographic edges** and
**488 within-location warp references**. Walking time tables, Surf, all rods,
verified outbreaks, usable Radar habitats, GBA dual-slot replacements, daily
Trophy Garden visitors, all 21 Honey Trees, Feebas tiles, fixed battles, gifts,
fossil revival, four NPC trades and five activated roamers are represented.
Roamer release points are explicitly not stationary wild-table slots. Pal Park
contents depend on transferred Pokémon; no native catch list is invented.

An independent PokéAPI Platinum comparison checks **144 ordinary area tables**:
**142 match exactly**, comprising **7,920 slot/time/method checks**. Two Turnback
Cave differences are resolved from native header assignments and
`ScrCmd_InitTurnbackCave`: retain native level-38 slots and reject an unassigned
"after pillar 3" wild bank. Its level-47 conditional Giratina remains separate.
Serebii's later room-band labels also differ from the native selector; this is
recorded rather than silently overriding game data. See
[source decisions](platinum-source-decisions.json) and
[independent comparison](platinum-encounter-comparison.json).

The complete [coverage report](platinum-atlas-coverage.json) is derived from the
runtime data plus a separate reviewed census, not just a runtime location count.
It is mandatory in the existing `npm run validate:atlas` release gate and CI.
Negative tests remove locations, floors, encounters, prerequisites, sources and
links, corrupt assets, introduce invalid identifiers/rates and remove discrepancy
decisions to prove those defects cannot pass.

## Maps, navigation and progression

Every included area has a generated **native terrain reference plan** (501
views), using 32×32 tile attributes at native binary offset 0x10 and event warp
coordinates. These are numeric projections using our palette, not screenshots or
new redistributed ROM artwork. Existing shared map controls and full-size warp
navigation are reused; image hashes, dimensions, inputs and offsets are in the
[map audit](platinum-map-audit.json).

Terrain flags alone do not define complete walkability: height, objects, story
scripts, ledges, gravity and puzzles can change traversal. Distortion World flat
plans carry that specific caveat. Turnback Cave room selection is dynamic and is
not presented as a guaranteed fixed maze solution. Literal non-reciprocal warps
are marked one-way; script-driven travel is separately recorded. Geographic
adjacency does not assert a clear path across every border.

Structured access notes retain HM, item, story, distribution and unreleased
requirements. Field-move badge checks come from native code: Fly uses the Cobble
Badge and Defog the Relic Badge. Reference browsing stays available before
requirements are met; the app does not invent automatic quest-progress locks.
Historical Member Card/Oak's Letter/Secret Key and fateful Regigigas restrictions
remain explicit. Azure Flute was never officially distributed in Generation IV;
Hall of Origin is labelled an unreleased reference encounter.

EV recommendations reuse complete ordinary tables and native Generation IV
named-stat yields. They exclude Great Marsh/Pal Park capture-only areas and
conditional replacement fragments. Reference conditions explicitly exclude
outbreak/Radar/GBA replacements, selected Trophy Garden visitors and Feebas
tiles. Surfing uses Platinum's Fen Badge. Recommendations link to the native area
in Atlas and never infer current rod/HM/story access.

Great Marsh is a distinct six-area, save-initialized encounter planner. Its
[daily rules, evidence and limits](platinum-great-marsh.md) are separate from the
Johto Safari simulator; unknown daily slots remain unknown.

## Repeatable builds

Primary: pret/pokeplatinum `49f78f35ccd8c6880e189d23a630eef2976c44ac` (matching
US Platinum source). Independent CSVs: PokeAPI/pokeapi
`6fd69dfe90465ba96534f6816fc817737d1f97f6`, version 14 / version group 9.
Use clean pinned sources. These commands perform no network access:

```
python scripts/build-platinum-atlas.py /path/to/pokeplatinum
python scripts/build-platinum-maps.py /path/to/pokeplatinum
python scripts/compare-platinum-encounters.py /path/to/pinned-pokeapi-csv
node scripts/audit-platinum-atlas.mjs
npm run validate:atlas
```

The generator records per-input hashes/URLs in the
[primary inventory](platinum-atlas-inventory.json). The
[version-2 schema](schemas/gen4-atlas.schema.json) describes the reusable location,
area, requirements, encounter and provenance contract. Established SoulSilver v1
manifests remain behind the same shared adapters.

Numeric facts are transformed by our scripts; original game/code/art ownership is
retained. No ROM, copied source implementation, screenshots or newly scraped art
are shipped. PokéAPI receives attribution; guide prose and complete tables are
not copied. Existing HGSS sprite/image credits remain intact.

Limits: these are reference and encounter-planning features, not collision/path
or capture-battle simulation. Custom Mystery Gift contents and migrated Pal Park
Pokémon depend on external distributions/transfers. Complete new trainer/item
catalogues and a Platinum Team Planner are outside this requested milestone.
Synthetic saves, primary evidence and executable independent comparisons do not
constitute a new emulator or real-player-save playthrough. The final integrated
release audit follows as milestone 6.

Milestone gate (0.26.5, including the separately published SoulSilver ability repair): **285/285 automated tests pass**, zero mandatory
failures, 100% reviewed Sinnoh catalogue coverage and unchanged 100% existing
Johto/Kanto coverage. Rebuilding the Atlas, maps and independent comparison
reproduces all **507 checked outputs byte for byte**.
