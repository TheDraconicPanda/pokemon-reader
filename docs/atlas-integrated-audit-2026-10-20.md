# Non-Safari Atlas audit — 20 October 2026

Audited application **v0.25.66**, commit `787da708139a7e43e98dbc61136133351dbc1a22`.
Scope: the 69 existing non-Safari Johto and League/Mt. Silver approach groups.
Safari Zone itself, its mini Atlas, area dataset, mechanics and calculator are
excluded. Safari Zone Gate remains included as a normal world location.

## Outcome

**No confirmed content discrepancy was found in the checks performed.** No
application or game-data changes were necessary. The current scoped reference is
well covered; this does **not** make Atlas a complete SoulSilver world reference.
The limitations below remain material. This audit is evidence of specific checks,
not a guarantee of every possible game interaction or NPC dialogue.

The [machine-readable ledger](atlas-integrated-audit-2026-10-20.json) records each
location's counts, current dataset hashes, source-page hashes and HTTP results,
primary trainer matches, known limits and the public-site comparison.

## Verified coverage

| Area | Verified result |
| --- | --- |
| Location inventory | All 69 non-Safari groups accounted for; no unknown destinations or disconnected groups |
| Encounters | 1,384 records; 53 groups with encounters and 16 explicit no-fixed-wild statuses |
| Display coverage | Every scoped encounter record is represented in the method/time disclosures |
| Maps | All 150 catalogued views, using 148 PNG assets; no missing required view in the current catalogue |
| Items/rewards | 686 source-listed records, including Apricorns, machines, hidden pickups and named rewards |
| Gifts/trades | 22 records with explicit gift, trade, Egg, event or prize conditions |
| Shops/exchanges | 371 source-listed offers |
| NPC/services | 156 named service/interaction records |
| Trainer records | 370: 365 fixed/combined party records and five Frontier facility milestones |
| EV finder | All 493 Gen IV yields reproduced; 328 ordinary complete tables for each time period; six-stat scoring and Surf priority pass |
| Application checks | 150 tests pass, no failures or skips; includes Reader/Planner regressions |
| Public site | All 16 selected Atlas runtime/data files match the audited checkout byte-for-byte |

## Content verification

The 23 route encounter tables, 46 non-route encounter references (including
explicit empty statuses) and all 493 EV yields reproduce **without any changes**
from pinned primary game revision
[`d2355244ac42b3c6e40d8c36aa3564ee8706dea4`](https://github.com/pret/pokeheartgold/tree/d2355244ac42b3c6e40d8c36aa3564ee8706dea4).
The complete map export also reproduces unchanged from the verified source
archives/originals; hashes and browser image decoding cover every current asset.

Fresh requests succeeded for **162 distinct reference pages: 97 Bulbapedia and 65
Serebii**. All 65 Serebii location-content comparisons are unchanged. Eight
Bulbapedia articles have changed article text since the previous capture, but a
fresh extraction of the applicable HGSS item, gift, shop and trainer rows shows
**zero row changes**. Existing manual/primary corrections remain intentional;
source disagreements must not overwrite those corrections automatically.
The source recheck refreshes prior evidence; it does not replace it with HTTP
status checks alone. Some references cover a broader parent location or multiple
games, so their entire contents must not be copied into the scoped entry.

An additional independent primary-data check matches **all 365 party rosters**
by species and level. The 363 ordinary rosters match individual game trainer
records. Dragon's Den's Clair/Lance team matches game records 733/734, and Rocket
HQ's Ariana/Grunt team matches records 479/499. The five generated-facility
milestones intentionally have no fixed roster. This check does not claim to
validate every held item, move, trainer placement or availability condition.
Those fields retain the earlier source-specific reference audit and its limits.

## Functional checks

The existing browser suite exercises location search/type filters, compass travel,
route and deep links, map/floor changes, source/full-size links, error recovery,
encounter disclosures, EV filtering/pagination, game isolation, caught markers,
shared themes/navigation, adventure context and species links. It also checks
phone/desktop geometry and Reader/Planner regressions. Safari tests run only as
existing regression checks; their data/mechanics are not certified by this audit.

## What is still missing or deliberately limited

1. **Full Kanto and Sinjoh coverage.** Kanto's cities, Routes 1–25 and remaining
   dungeons are absent. The existing League/Mt. Silver approaches are included;
   they are not a substitute for the second region. Sinjoh Ruins is also absent.
2. **Every building/Gym interior map.** Towns have overview maps; dungeons have
   their catalogued floors/areas. Most individual houses, Gyms and service rooms
   have no separate floor plan. Day Care/Station surroundings and shared facility
   layouts are explicitly labelled reference views.
3. **HM/story requirements on individual travel buttons.** The compass does not
   display per-edge HM icons or enforce ledges, direction-specific access or save
   progression. Current access notes remain searchable and in EV requirements.
4. **Complete battle mechanics.** The trainer reference is not a complete moves,
   EVs, AI or battle-strategy database. Frontier generated opponent/rental pools
   and facility simulations remain outside it.
5. **Automatic progression filtering.** Time/National-Dex/radio/outbreak/event
   conditions are labelled. Loading an adventure does not automatically hide all
   currently unavailable encounters or training spots; caught markers are separate.
6. **Every NPC conversation and in-game confirmation.** The inventory covers
   reviewed named interactions/source-listed records, not every line of game
   dialogue. No new real-save or manual in-game traversal is claimed here.

These are coverage limits or future enhancements, not newly discovered incorrect
encounter rates. Safari work remains separate, as requested. For the next focused
Johto improvement, verified per-connection HM/story requirements are the clearest
remaining travel enhancement; completing SoulSilver as a whole requires Kanto.

## Reproduction

Use the pinned primary checkout and the retained, checksum-verified map archives:

```sh
python scripts/build-soulsilver-route-encounters.py /path/to/pokeheartgold
python scripts/build-soulsilver-location-encounters.py /path/to/pokeheartgold
python scripts/build-soulsilver-ev-yields.py /path/to/pokeheartgold
python scripts/audit-soulsilver-trainers.py /path/to/pokeheartgold /tmp/trainer-audit.json
python scripts/build-atlas-maps.py /path/to/map-sources
npm test
git diff --exit-code -- js/data/games/soulsilver assets/maps docs/atlas-map-coverage.json
```

The trainer audit needs only Python and Node.js, checks the pinned source revision
and rejects local changes to its primary trainer file. Encounter/EV generators
likewise require the pinned revision. Source originals/cached web pages stay
outside the repository; the ledger retains URLs, hashes and comparison outcomes.
No new runtime dependency, Safari change or application version bump is required
for this documentation/audit-tool update. User acceptance of the result remains
separate from the automated and source-based evidence.
