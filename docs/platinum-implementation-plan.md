# Pokémon Platinum expansion — implementation and evidence plan

Status: in progress; no Platinum release or completion claimed.
Baseline: `0075bb51800fa4036b9ef79eaa10a466716c5dc5`, application 0.25.83.
Branch: `feature/platinum-expansion`. Remote main verified against GitHub 2026-10-22.
The user's Platinum request supersedes the older Atlas-only scope restriction in AGENTS.md.

## Repository audit

The repository is a static browser application: ES modules, HTML/CSS, no bundler.
GitHub Pages publishes main; `.github/workflows/atlas-validation.yml` checks
Atlas integrity on main/PR. The existing app menu, theme, routes, dialog/focus
behavior and reference navigation are shared and must remain intact.

- Reader: `js/app.js` loads a raw 512 KiB save through
  `js/saves/soulsilver.js`. That module embeds HGSS layout, trainer offsets,
  18 padded PC boxes, a 256-species regional order and Gen IV Pokémon decoding.
  General blocks choose a partition using two counters; storage currently assumes
  the same partition. DSV suffix/container handling is absent.
- PK4 decoding includes shuffled/encrypted 136-byte stored records and 236-byte
  party records, moves/PP/PP Ups, IVs/EVs, forms, met history and party battle stats.
  These structures, the LCG, checksum and stat math are shared Gen IV behavior.
- Writer: `soulsilver-evolution.js` duplicates crypto, shuffle, integer access,
  CRC and stat calculations. It embeds HGSS block boundaries. Existing trade and
  simulated location evolutions must retain their current UI and semantics.
  Independent validation must additionally check record identity/checksum,
  boundary membership, abilities/names, held-item consumption and untouched bytes.
- `adventures.js` persists decoded snapshots in IndexedDB (never source bytes).
  Validation, restoration labels and identity currently hardcode SoulSilver.
  Preserve old profiles/schema compatibility. Trainer keys already include game.
- Planner: the curated SoulSilver plan and legacy migration are game specific.
  Do not apply them to Platinum profiles. Shared current-Pokémon matching/stat
  utilities can be reused; Platinum must never inherit HGSS goals or state.
- Pokédex: `data/pokedex-reference.js` is an adapter over generated HGSS data;
  `pokedex.js` hardcodes its game, labels and locations. Keep one renderer and
  use explicit game datasets. Reader enriches display from metadata; audit all
  historical type/stat/form fallbacks. Platinum moves/HMs/tutors cannot inherit HGSS.
- Atlas: runtime adapters already take game IDs, but `world.js` and location
  inventory are HGSS-specific. Reuse encounter sections, map/floor/navigation,
  caught indicators and search. Separate Sinnoh locations, methods, topology and
  access records. No fallback from unsupported game to SoulSilver data.
- Atlas generation: Python scripts consume pinned pret/pokeheartgold and
  independently checked secondary data. Existing report independently inventories
  540 headers / 122 location groups, maps, encounters, travel and exclusions.
  Keep this audit intact; add a separate primary Sinnoh census and reusable schema.
- Safari: complete existing Johto engine, read-only save initialization, scenarios,
  optimizer and simulator are SoulSilver-specific. Great Marsh needs a separate
  mechanic adapter and data (six areas, daily selection), with common display only.
- Tests: Node fixture/unit tests and a Chromium/CDP integration suite; synthetic
  SoulSilver fixtures only. No real Platinum save fixtures are present. Do not
  describe generated test data as real saves or self-roundtrips as independent proof.
- Version: `0.<phase>.<iteration>`, synchronized across package/lock, page titles,
  visible versions and README. New expansion phase uses 0.26.x.

## Execution milestones and release gates

1. Shared foundation: immutable game profiles and explicit registry; extract
   binary, CRC, PK4 decode/encode and stat math once, preserving compatibility
   exports. Capture original parser outputs and writer byte results as regression
   evidence before edits. Run existing Reader/Planner/Atlas/Safari tests and new
   fixture-driven equivalence tests. Publish only a passing complete foundation.
2. Platinum Reader: pin PKHeX and pret/pokeplatinum evidence; independently select
   valid general/storage copies; validate layout, footer IDs/counters/checksums,
   trainer/progress, party, contiguous storage, dex flags and PK4 history.
   Add early/mid/postgame, corrupt, backup, forms, egg/shiny/status/PP cases.
   Integrate profiles, labels, badges and local snapshots. Explicit unknown fields.
3. Platinum writer: shared transaction over validated current record/block,
   game-scoped evolution predicates (trade/item/location/move/special), attributes
   and party stats, checksum/reload validation; preserve original extension and
   verified DeSmuME container suffix; download a new file only. Verify unrelated
   bytes and compare independent PKHeX/primary reference outputs.
4. Platinum Pokédex: generate 210-entry Sinnoh order and 493 National records,
   Platinum learnsets/HMs/tutors/items/forms/evolutions, save registration and
   ownership. Share list/filter/details renderer and game-scoped Atlas links.
5. Sinnoh Atlas and Great Marsh: primary full-header inventory with explained
   exclusions, all towns/routes/dungeons/floors/postgame/special encounters;
   typed schema with stable IDs, region, links, access, slot rates/levels/methods,
   conditions, sources and validation status. Offline repeatable import/build/
   audit scripts. Great Marsh rules verified independently of Johto Safari.
   Coverage and audit reports must fail on omissions, invalid species/moves,
   unresolved links, impossible rates or unexplained census gaps.
6. Release: both-game fixture and browser suite, corrupt/missing files, switching
   and persistence isolation, mobile/desktop, editing/reload/container/checksum,
   regenerated reports; accurate completion report with known limits and commit/
   deployment evidence. No automatic production merge while critical gates fail.

For every completed milestone: inspect diff, run acceptance checks, update
README/ROADMAP/version, commit, push non-forcibly, fetch current main and follow
existing Pages publication workflow. Confirm workflow/deployed assets separately.
No user confirmation is required between normal steps. Incomplete work stays on
the development branch. Preserve remote changes; never reset/force-push to bypass.

## Evidence and source policy

Prefer primary decompilation data and PKHeX layout/algorithm documentation,
cross-check encounters/mechanics with independent references (Serebii,
Bulbapedia, Project Pokémon, PokéAPI where suitable). Pin revisions and hashes,
record licensing/attribution and transform factual records rather than copy guide
prose. Research disagreements explicitly; unknown data remains unknown.
Expected values must be hand-transcribed or independently computed, not generated
by the parser under test. Keep real-save validation separate from synthetic tests.

## Baseline verification / environment

Initial default-sandbox `npm test`: 18 test files pass; browser/Safari audit files
fail. Direct execution identifies browser loopback `listen EPERM`; test runner
output also needs investigation before accepting aggregate counts. Rerun with
network permission for local Chromium/CDP, without altering product behavior.
Git network needs sandbox network permission; authenticated GitHub connector is
also available. Remote main and local HEAD match; working tree was initially clean.

## Milestone 1 implementation evidence

Shared modules: `gen4-binary.js`, `gen4-pokemon.js`, `gen4-stats.js`,
`gen4-save.js`, `gen4-evolution.js`, immutable `profiles.js` and reader registry
`index.js`. The old SoulSilver imports are compatibility facades. Reader uses
the registry; the only enabled reader remains SoulSilver until milestone 2.
No alternate game can inherit HGSS encounters, Safari or Pokédex reference data.

`tests/fixtures/gen4/soulsilver-baseline.json` was captured from the original
0075bb5 parser/writer before extraction: four PC-species cases preserve full
trainer/party/540-slot storage/dex/Safari output and a trade export SHA-256.
These are synthetic regression fixtures, not independent game-save evidence.
`tests/gen4-foundation.test.cjs` compares complete decoded results, original
export bytes, successful reload and input immutability.

Baseline rerun with sandbox network permission: **238/238 tests pass** including
Chromium/CDP, Reader/Planner/Atlas/Pokédex/Safari. The original default sandbox
failures were environmental (loopback denied; child output unavailable there).

Foundation release gate: `npm run validate:atlas` passes **241/241** tests,
zero mandatory integrity failures, 100% existing Johto/Kanto location coverage.
The only first-pass failure was a stale escaped version assertion; fixed before
publication. The regenerated report fingerprints all application/test inputs.

## Milestones 2 and 3 evidence

Milestone 2: 249/249 tests, independent PKHeX synthetic early/middle/postgame
fixtures, all 32 PK4 shuffle values, profile isolation and mobile Reader journey.
Released as 0.26.1 / `7d8f7cf`; Pages 39793080174 and CI 39793079708 succeeded.

Milestone 3: 47 sourced trade/special evolution rules, 114 complete exports
independently inspected by PKHeX, complete logical PK4 comparisons, 12 blocked
vectors, all 3451 default names, original-byte/profile immutability and DSV
preservation. Shared native attribute transaction also serves SoulSilver.
259/259 tests pass; 0.26.2 release evidence is in `platinum-writing.md` and
`platinum-evolution-independent.json`. No real-game playthrough is claimed.

Final-regression leads retained for milestone 6: review SoulSilver's legacy
same-partition storage policy against primary HGSS save recovery; extend semantic
corruption cases (empty declared party slots and invalid trainer fields). These
are separate from a claim of Pokémon legality or real-save outcome validation.

## Milestone 4 evidence

Platinum's shared reference view has 210 Sinnoh / 493 National entries, 505
species/form records, native learnsets/abilities/items/tutors and 246 evolution
edges. All 1972 move-list comparisons and regional positions match pinned PokéAPI
Platinum data. Independent PKHeX `dex` output covers all registration bits in
three synthetic fixtures. Browser checks cover desktop/phone, matching-save
ownership versus registrations, selection, and native/legacy game-scoped links.

The initial Sinnoh location dependency adds 123 groups, a full 593-header census
with 64 reasoned exclusions, 154 header-assigned random tables and native warps /
geographic adjacency. Unreachable placeholder Radar/swarm conditions are excluded.
This is not the complete Atlas milestone: scripted travel, special encounters,
full independent coverage and Great Marsh simulation remain required in phase 5.

Release gate: **264/264 tests**, zero mandatory failures; original Johto/Kanto
coverage remains 100%. Version 0.26.3. Details and repeatable source commands:
`platinum-pokedex.md`, `platinum-pokedex-audit.json`, `platinum-atlas-inventory.json`.
