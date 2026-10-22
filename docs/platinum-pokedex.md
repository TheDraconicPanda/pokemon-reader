# Platinum Pokédex — milestone 4

Milestone 5 completes the linked [Sinnoh Atlas and Great Marsh](platinum-atlas.md).
The [final report](platinum-completion.md) supersedes historical pending work below.

The existing reference view now selects SoulSilver or Platinum. Explicit `game=platinum`
URL parameters take precedence over the active Adventure Profile; legacy SoulSilver
URLs stay unchanged. Save registrations and possession indicators are used only for
the selected game. Regional and National views, searches, filters, list position,
forms, evolutionary branches and the existing appearance are shared.

Platinum has 210 regional entries, 493 National entries, 12 additional stat-bearing
forms, 246 evolution edges, 123 abilities, 100 TM/HM assignments and native level,
egg, machine and tutor learnsets. HM05 is Defog. Shard tutors and the separate
Route 210/228 friendship tutors retain their native costs/requirements. Platinum
location evolution text refers directly to Sinnoh rather than HGSS trade-back.
Existing HGSS sprite illustrations and the audited Generation IV type chart are
shared; no contemporary move/ability data are inferred.

## Repeatable evidence

```
python scripts/build-platinum-pokedex.py /path/to/pokeplatinum /path/to/pinned-csv
python scripts/build-platinum-atlas.py /path/to/pokeplatinum
node --test tests/platinum-pokedex.test.cjs
npm run validate:atlas
```

Primary: pret/pokeplatinum `49f78f35ccd8c6880e189d23a630eef2976c44ac`.
Independent aggregation: PokeAPI/pokeapi `6fd69dfe90465ba96534f6816fc817737d1f97f6`,
`version_group_id=9`, `pokedex_id=6`. The [machine-readable audit](platinum-pokedex-audit.json)
contains every input hash/URL. All **1,972** base-species learnset comparisons
(level, egg, tutor and machine move sets) match, as does every regional position.
Primary form records are validated for identifiers, stats, types and moves.
No build or runtime scraping is performed. Clean-room game facts are generated
without redistributing a ROM; upstream code/art ownership and existing credits
remain intact. Primary JSON schema transformations are our own code.

PKHeX's separately executable `dex SAVE` reference mode reads all 493 Seen/Caught
flags from the three synthetic saves. Committed `.dex.json` files and their hashes
are independent expected results, checked alongside game-scoped adapters.
Browser coverage checks 320/1440 px, native learnsets, list selection, Atlas round
trips, party plus PC counts, and other-game flag isolation.

## Atlas dependency and remaining scope

Working species links require Sinnoh IDs before the complete Atlas milestone.
The native inventory groups **529 of 593 headers into 123 locations**; each excluded
system/unused/Diamond-Pearl legacy header has an explicit reason in the
[inventory](platinum-atlas-inventory.json). It includes 154 header-assigned random
encounter tables and their morning/day/night, outbreak, Radar, dual-slot and
Great Marsh pool replacements. Connection provenance distinguishes event warps
from geographic adjacency; adjacency does not certify passability.

This is the location dependency for the Pokédex, **not completion of milestone 5**.
Special/gift/event encounters, source discrepancy resolution, independently audited
coverage, detailed progression constraints and the Great Marsh simulator are still
required. Missing random encounter records are explicitly distinguished from
unavailability: evolution, gifts, distributions and transfers can provide species.
No capture or encounter-per-step chance is inferred from slot percentages.

Synthetic-fixture/independent-code verification does not claim a new emulator or
real-player-save playthrough.
