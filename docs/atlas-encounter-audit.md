# SoulSilver Atlas encounter audit — v0.25.42

## Agreed scope

The user reordered Atlas work on 2026-10-15: encounters across the existing Atlas,
then maps/floors, structured reference details, Safari mechanics, Safari simulator,
Kanto expansion and the final integrated audit. This milestone completes the
**wild/stationary encounter reference for all 69 existing non-Safari location
groups**, including the existing League/Mt. Silver approaches. Safari Zone Gate
is included; Safari Zone itself is excluded and its 269 records are unchanged.

This does not claim all of SoulSilver or the Atlas roadmap is complete. New Kanto
locations are later work. Gifts, eggs, trades, items, Trainer parties and their
structured conditions belong to milestone 3; the previously implemented route
features and Kenya gift remain supported. No map images or floor selectors were
added. Real-game validation and user acceptance remain pending.

## Outcome

- All 69 groups have explicit coverage: 53 contain encounter records and 16 have
  **verified no fixed wild encounters**. Missing data is never presented as a
  verified empty area.
- 1,384 non-Safari records: the unchanged 519 audited route records plus 865
  records for towns, caves, facilities, floors and special encounters.
- 23 previously empty non-route locations now have encounters, including
  Cherrygrove's coast, the other city water/tree/rock tables, Dark Cave, Ilex Forest,
  Mt. Mortar, Ice Path, Slowpoke Well, National Park and Mt. Silver.
- All actual floors are inventoried, including Sprout Tower 2F/3F, Bell Tower
  2F–10F, Victory Road 1F/2F/3F, Ice Path 1F/B1F/B2F/B3F, four Mt. Mortar sections,
  Whirl Islands' floors/chamber and Mt. Silver's outdoor/cave sections.
- Method/time/version conditions cover rods, nighttime fishing, Surf, Rock Smash,
  Headbutt groups/special trees, radio, outbreaks, contest sets, Unown, stationary
  encounters and eligible roaming species notes. Precise level sets retain gaps.

## Evidence and resolution policy

The [machine-readable audit](atlas-encounter-audit.json) contains all 69 groups,
141 successful reference fetches (Serebii and Bulbapedia, with supplemental pages),
page hashes, exact map/bank inventory, primary script hashes, counts and scope
resolutions. Reference pages were read as HGSS/SoulSilver sections, not Generation
II or HeartGold-exclusive data. Fresh route comparisons reproduce the v0.25.41
[route audit](atlas-route-audit.md) findings; route data is byte-for-byte unchanged.

The authoritative extraction uses pret/pokeheartgold revision
[`d2355244ac42b3c6e40d8c36aa3564ee8706dea4`](https://github.com/pret/pokeheartgold/tree/d2355244ac42b3c6e40d8c36aa3564ee8706dea4).
Actual map headers, encounter tables, Headbutt arrays, selection/replacement rules,
contest CSV/selection code, roaming tables and stationary-event scripts resolve
reference disagreements. The scope manifest includes map IDs and banks; a missing
or misspelled bank now fails generation rather than silently generating an empty
location. No random encounters are invented from a supporting source's adjacent
route table.

Examples and important boundaries:

- **Cherrygrove:** Surf Tentacool 90% (10–25) / Tentacruel 10% (15–25), all rods,
  Corsola by morning/day versus Staryu at night, both ordinary tree groups and
  the Taillow special tree. The special trees require Surf and Rock Climb.
- **Violet:** the outbreak is Whiscash through fishing, not Poliwag or Surf.
  Dark Cave's Dunsparce outbreak belongs to its Route 31/46 side; Mt. Mortar's
  Marill outbreak belongs to the 1F entrance area.
- **Victory Road:** the previous Atlas had only 1F in its static map list. 2F and
  3F are actual separate banks; 3F has Geodude/Graveler Rock Smash encounters.
  Cliff Cave uses a shared walking table but Rock Smash belongs on B1F.
- **Bug-Catching Contest:** four distinct tables (pre-National Dex plus Tuesday,
  Thursday and Saturday post-Dex) are extracted from the real cumulative
  thresholds. Each totals 100%. For example, the pre-Dex code yields Butterfree
  and Beedrill at 10% each, Venonat and Paras at 5% each; the commonly reproduced
  reference ordering instead lists 5%, 5%, 10%, 10%. Thursday Silcoon is 20% and
  Nincada 10% in the game data, despite the opposite shares in some references.
- **Unown:** at least one puzzle gates the underground hall. Kabuto unlocks A–J,
  Omanyte K–Q, Aerodactyl R–V and Ho-Oh W–Z. The entrance's !/? forms are separately
  gated by all letters/puzzles/secret rooms and the report/panel sequence. The map
  constant called `MAP_RUINS_OF_ALPH_HALL_ENTRANCE_SINJOH_EVENT` is the actual
  punctuation-form encounter map in the selection code; its misleading historical
  name is not grounds for omitting it. Two hall variants share the ordinary hall's
  exact encounter bank contents and are recorded as aliases, not duplicate tables.
  Unown Radio influences form selection; it is not a separate species encounter.
- **Special encounters:** Lapras is weekly (Friday, B2F, Surf); Lugia is level 45
  in SoulSilver, Ho-Oh level 70, Moltres/Groudon/Rayquaza level 50, and the red
  Gyarados is guaranteed shiny at level 30. Groudon requires the Red Orb;
  Rayquaza requires the Jade Orb after showing Oak the two HGSS-origin orb Pokémon.
- **Rocket HQ:** fixed trap-tile Geodude 21, Koffing 21 and Voltorb 23 are distinct
  from its three story Electrode 23. These are not random cave slot percentages.
- **Roamers:** level-40 Raikou/Entei are explained on the 16 eligible Johto routes;
  level-35 SoulSilver Latios is explained on existing eligible Kanto Routes 26/28.
  Route 27 is not in the roamer map list. The beasts' Burned Tower sprites and
  Suicune sightings are not falsely represented as catchable stationary battles.
- **Location ownership:** the Day Care, MooMoo Farm buildings and League Reception
  Gate have no fixed wild encounters. Their broad/adjacent reference links also
  show Route 34, Route 39 or Route 22 tables; these must not be copied into the
  interior entries. Existing outdoor route tables remain on their own entries.
- **Deferred gifts/trades:** the audit explicitly records starter gifts, Bill's
  Eevee, Primo/Elm eggs, Onix/Voltorb/Dodrio/Machop trades, gift Tyrogue and the
  event gift Pichu as milestone-3 records, not missing wild encounter species.

Percentages are species shares conditional on the listed method, area, time and
special condition after an encounter begins. They are not walking-step, bite or
tree-activation rates, and do not imply uniform probability for every displayed
level. Conditional rows describe replacement species; this reference is not a
simulator of simultaneous radio/outbreak/ability/Repel combinations.

## Architecture and reproduction

New data stays in `js/data/games/soulsilver/`. Shared rendering selects by explicit
game ID and refuses fallback to SoulSilver for unsupported games. Floor ownership,
notes and special cases are maintained in `encounter-scope.json`; ordinary tables
are generated from the pinned game data. The two generators share one
SoulSilver-specific extraction implementation rather than duplicating its rules.

```sh
python scripts/build-soulsilver-route-encounters.py /path/to/pokeheartgold
python scripts/build-soulsilver-location-encounters.py /path/to/pokeheartgold
npm test
```

Python's standard library suffices. Generators verify the source Git revision;
source fetching/audit used lxml locally but adds no application/test dependency.
Runtime is static JavaScript and requires no API calls for encounter information.

**53 automated checks passed**, with no failures or skips. Validation covers all 69 statuses, every floor/method/time distribution,
city water, exact special levels/conditions, contest sets, Unown gates, unknown-game
isolation, route and Safari preservation, mobile/desktop rendering, navigation,
and Reader/Planner regressions. These checks do not test real-save parsing or
replace in-game verification. User outcome acceptance of v0.25.42 is pending.

## Coverage inventory

| Location | State | Encounter records |
| --- | --- | ---: |
| New Bark Town | Verified | 18 |
| Cherrygrove City | Verified | 20 |
| Violet City | Verified | 16 |
| Azalea Town | Verified | 5 |
| Goldenrod City | No fixed wild encounters | 0 |
| Ecruteak City | Verified | 14 |
| Olivine City | Verified | 12 |
| Cianwood City | Verified | 14 |
| Mahogany Town | No fixed wild encounters | 0 |
| Blackthorn City | Verified | 7 |
| Route 29 | Verified | 16 |
| Route 30 | Verified | 27 |
| Route 31 | Verified | 28 |
| Route 32 | Verified | 33 |
| Route 33 | Verified | 16 |
| Route 34 | Verified | 27 |
| Route 35 | Verified | 28 |
| Route 36 | Verified | 20 |
| Route 37 | Verified | 17 |
| Route 38 | Verified | 20 |
| Route 39 | Verified | 16 |
| Route 40 | Verified | 12 |
| Route 41 | Verified | 12 |
| Route 42 | Verified | 22 |
| Route 43 | Verified | 27 |
| Route 44 | Verified | 26 |
| Route 45 | Verified | 21 |
| Route 46 | Verified | 13 |
| Route 47 | Verified | 35 |
| Route 48 | Verified | 18 |
| Cliff Edge Gate | Verified | 9 |
| Cliff Cave | Verified | 20 |
| Embedded Tower | Verified | 2 |
| Dark Cave | Verified | 35 |
| Sprout Tower | Verified | 14 |
| Ruins of Alph | Verified | 18 |
| Union Cave | Verified | 58 |
| Slowpoke Well | Verified | 30 |
| Ilex Forest | Verified | 28 |
| National Park | Verified | 58 |
| Burned Tower | Verified | 18 |
| Bell Tower | Verified | 64 |
| Mt. Mortar | Verified | 64 |
| Whirl Islands | Verified | 57 |
| Lake of Rage | Verified | 14 |
| Ice Path | Verified | 40 |
| Dragon's Den | Verified | 8 |
| Safari Zone Gate | Verified | 6 |
| Pokéathlon Dome | No fixed wild encounters | 0 |
| Goldenrod Department Store | No fixed wild encounters | 0 |
| Goldenrod Radio Tower | No fixed wild encounters | 0 |
| Olivine Lighthouse | No fixed wild encounters | 0 |
| Pokémon Day Care | No fixed wild encounters | 0 |
| S.S. Aqua | No fixed wild encounters | 0 |
| Victory Road | Verified | 29 |
| Indigo Plateau | No fixed wild encounters | 0 |
| Mt. Silver | Verified | 164 |
| Route 26 | Verified | 29 |
| Route 27 | Verified | 30 |
| Route 28 | Verified | 26 |
| Tohjo Falls | Verified | 19 |
| Pokémon League Reception Gate | No fixed wild encounters | 0 |
| Bellchime Trail | No fixed wild encounters | 0 |
| Goldenrod Tunnel | No fixed wild encounters | 0 |
| Team Rocket HQ | Verified | 4 |
| Frontier Access | No fixed wild encounters | 0 |
| Battle Frontier | No fixed wild encounters | 0 |
| MooMoo Farm | No fixed wild encounters | 0 |
| Magnet Train Station | No fixed wild encounters | 0 |
