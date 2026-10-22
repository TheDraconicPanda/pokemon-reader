# Platinum expansion completion report — v0.26.6

The existing Pokémon Reader now supports SoulSilver (Johto/Kanto) and Platinum
(Sinnoh) through shared Generation IV interfaces. The original application,
navigation, visual design, deployment and version convention are retained.
This report records technical completion; it does not claim a new emulator or
real-player-save playthrough.

Final release gate: **290/290 tests pass**, zero failures/skips/cancellations,
zero mandatory audit failures and 100% reviewed coverage for both games. The
release report fingerprints the final application and test sources. Publication
uses the existing main/Pages workflow; its exact final commit/run references are
provided in the publication result. The preceding v0.26.5 milestone has successful
[CI](https://github.com/TheDraconicPanda/pokemon-reader/actions/runs/39843990977)
and [Pages](https://github.com/TheDraconicPanda/pokemon-reader/actions/runs/39843989955).

## Implemented behavior

- Content-based game detection, profile-specific general/PC layouts, backup
  selection, counters, footers and CRCs; shared PK4 decoding/encoding and stats.
- Platinum trainer identity/IDs, gender, money, playtime, eight badges and supported
  progress; party and all 540 PC slots; names/forms, nature, ability, item,
  experience/level, HP/status, moves/PP/PP Ups, IVs/EVs, Hidden Power, met/egg data,
  gender, shiny and Egg flags. Unknown/unavailable fields stay explicit.
- Transactional simulation of 47 native trade, item, location, move, companion,
  friendship, time and Beauty evolution paths. Prerequisites, logical attributes,
  registrations, checksums, unrelated bytes, input immutability and reload are
  verified before a separate download. Raw/recognized DeSmuME containers and
  original extensions are retained; no actual communication is invented.
- Shared Pokédex with 210 Sinnoh / 493 National entries, 505 species/form records,
  246 evolution edges, native move/item/ability data and game-scoped Seen, Caught
  and party/PC ownership. Active-profile replacements refresh an open Pokédex;
  unrelated notifications preserve its current list, dialog and focus.
- Complete reviewed Sinnoh Atlas, searchable encounters, native map/floor/warp
  references, special systems, travel/access notes and shared EV recommendations.
- A separate six-area Great Marsh engine/planner, both 32-entry daily pools,
  time/water/rod rules and validated saved daily selection. Unknown daily grass
  slots remain 10% unknown; hypothetical controls preserve source/profile data.
- Unsupported game URLs and wrong-game mechanic URLs cannot inherit another
  game's reference or Safari rules. Checksum-valid semantic corruption is
  rejected before Platinum results, snapshots or exports become available.
- The separately published SoulSilver PID-based ability fix and conservative,
  confirmed ability-repair tool are preserved in full.

Implementation details and verified scope: [Reader](platinum-reader.md),
[writing](platinum-writing.md), [Pokédex](platinum-pokedex.md),
[Atlas](platinum-atlas.md) and [Great Marsh](platinum-great-marsh.md).

## Executable validation

The mandatory release command is `npm run validate:atlas`. It executes the full
repository suite, including Chromium/CDP desktop/phone journeys, both Atlas audits,
negative completeness tests and all original SoulSilver/Safari/Planner checks.
The report fingerprints application, test, generator and relevant evidence inputs;
CI reruns it with `--check-committed` and rejects stale reports or skipped checks.
See [aggregate evidence](atlas-coverage.json), [Sinnoh coverage](platinum-atlas-coverage.json)
and the CI test-log artifact.

Fresh independent execution uses pinned PKHeX
`a9ff30657073b26825929a65ef58e61f99a1fe6f`:

- All three synthetic early/middle/postgame saves reproduce their independently
  expected trainer, party, PC and checksum results; fresh `dex` reads reproduce
  every Seen/Caught bit.
- All 114 complete evolution exports (party/PC, including DSV) are independently
  read by PKHeX and then verified against the current writer's complete bytes,
  selected Pokémon attributes, registration bits, gender flags and block CRCs.
  The committed [oracle report](platinum-evolution-independent.json) binds those
  observations to the current writer dependencies. There are 56 positive vectors,
  12 blocked vectors and 47 supported rules.
- Fresh `derived` reads establish levels and Hidden Power for all 12 occupied
  party/PC records in the three fixtures. Fixture hashes/provenance are committed;
  tests assert experience-derived PC levels and actual displayed levels/Hidden
  Power. The independent development harness is `scripts/pkhex-reference/Program.cs`.

Other checks cover all 32 shuffle values, legitimate PID zero, encrypted empty PC
slots, accented/native names, forms, eggs, shiny/status/fainted states, PP Ups,
backup corruption/counter disagreement, transactional preservation, source-file
immutability, extensions/container footers, game/profile switching, unknown URLs,
corrupt metadata and 320–1440px layouts. No personal save is committed.

## Data coverage and accuracy

| Evidence | Result |
| --- | --- |
| Reviewed Sinnoh location groups | 125/125; all 30 routes 201–230 |
| Native header census | 593 accounted: 501 included, 92 explained exclusions |
| Native terrain plans | 501; every included area |
| Assigned encounter tables / formatted records | 154 / 5,724 |
| Directed native/script/geographic edges | 1,062 |
| Within-location literal warp references | 488 |
| Special systems | 21 fixed script commands, 4 NPC trades, 5 activated roamers, 21 Honey Trees, 16 Trophy Garden visitors |
| Independent ordinary-area comparison | 142/144 exact; 7,920 slot/time/method comparisons |
| Remaining two comparison differences | Resolved from native Turnback Cave assignments and room selector |
| Independent move-list comparisons | 1,972; zero differences; all Sinnoh positions match |
| Offline rebuild reproducibility | 511 checked data/report/PNG outputs; zero byte differences |
| Existing SoulSilver Atlas | 122/122 groups; Johto 63/63 and Kanto 59/59 |

Primary data is pinned pret/pokeplatinum
`49f78f35ccd8c6880e189d23a630eef2976c44ac`; independent CSV data is pinned
PokeAPI/pokeapi `6fd69dfe90465ba96534f6816fc817737d1f97f6`. Every input records
source URLs/hashes. Guide disagreements, unused/debug/system exclusions and
unreleased event distinctions are explicit in the [source decisions](platinum-source-decisions.json),
[census](platinum-atlas-inventory.json) and [comparison](platinum-encounter-comparison.json).
No unassigned encounter bank is turned into an invented location.

The reusable [schema](schemas/gen4-atlas.schema.json), separate reviewed inventory,
source generators and executable negative audits validate location/area membership,
identifiers, methods, levels, rates, conditions, requirements, sources, assets,
links, orphan groups, special systems and resolved discrepancies. Existing
SoulSilver v1 files retain shared adapters. Generators require a clean pinned
primary checkout. Rebuild commands are in the linked feature documents.

## SoulSilver regression status

The complete original pre-refactor parser output remains equal for all four
captured trainer/party/540-slot-PC/Pokédex/Safari baseline cases. Reader, Planner,
Pokédex, Johto/Kanto Atlas, EV finder, Safari, evolution and container checks run
in the same gate as Platinum. The incoming urgent ability repair adds its own
preservation and cancel/confirm UI tests. Its intentional writer ability correction
supersedes the historical buggy export hash; unrelated logical bytes and full
parser equivalence remain protected. See [ability evidence](hgss-ability-repair.md).

## Limits and known issues

There are no known critical expansion defects after the final passing gate.
The following supported-scope limits remain explicit in the application/docs:

- Evidence uses synthetic fixtures, native source data, executable independent
  comparisons and PKHeX; no new real-player-save/emulator playthrough is claimed.
- Terrain plans are static references, not screenshots or full collision, ledge,
  gravity, ice/boulder or story-puzzle simulations. HM/progress notes do not claim
  automatic filtering from every quest flag.
- Great Marsh scope is encounters/daily selection and hypothetical planning;
  capture/bait/mud battles and remaining entry balls/steps are not simulated.
- Hall of Fame, Battle Frontier and Underground records are not decoded. Custom
  Mystery Gift contents and migrated Pal Park Pokémon depend on external data.
- Ordinary level/Bag-stone evolutions, including Nincada's additional Shedinja
  creation, remain in-game operations. The 47 supported simulation paths are
  enumerated rather than claiming every possible save edit or complete legality.
- Platinum does not inherit the SoulSilver Team Planner or new trainer/item Atlas
  catalogues. Existing SoulSilver tools remain available and unchanged in scope.

Unrelated legacy recovery/packaging debt is recorded [separately](platinum-unrelated-debt.md).
No user-testing or manual-approval pause is required by this release workflow.

## Publication and commit references

Feature branch: `feature/platinum-expansion`; established deployment branch: `main`.
All pushes are normal, preserving the urgent SoulSilver update `1db68a9`.

| Milestone | Commit | Published version |
| --- | --- | --- |
| Shared Gen IV foundation | `bb6bf5c` | 0.26.0 |
| Platinum reading | `7d8f7cf` | 0.26.1 |
| Platinum evolution/export | `81399ec` | 0.26.2 |
| Platinum Pokédex | `d753b05` | 0.26.3 |
| Complete Atlas / Great Marsh, integrated ability repair | `cb69298` | 0.26.5 |
| Final regression and release | See final release commit and Actions links in publication result | 0.26.6 |

Published application: https://thedraconicpanda.github.io/pokemon-reader/

- [Sinnoh](https://thedraconicpanda.github.io/pokemon-reader/pokedex-earth/#sinnoh)
- [Platinum Pokédex](https://thedraconicpanda.github.io/pokemon-reader/pokedex/#scope=regional&game=platinum)
- [Great Marsh](https://thedraconicpanda.github.io/pokemon-reader/pokedex-earth/#great-marsh&game=platinum)
- [Workflow evidence](https://github.com/TheDraconicPanda/pokemon-reader/actions)

The final publication result provides the exact release commit and successful
CI/Pages run links; a push alone is not treated as proof of live deployment.
