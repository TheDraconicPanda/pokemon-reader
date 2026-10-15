# SoulSilver Atlas EV training finder — v0.25.45

The user accepted the existing encounter, map and structured-reference milestones
and requested a stat-based EV training finder, with priority for Surfing. Safari
now has its own development track and is excluded from this feature.

## User workflow

Select **EV Training** in Atlas, or open
`/pokemon-reader/pokedex-earth/#ev-training` directly. Choose HP, Attack, Defense,
Special Attack, Special Defense or Speed; in-game time; and encounter method.
The default shows only tables in which every encounter awards the chosen stat
and no other stat. Surfing is ranked first. Turn off **No unwanted EVs** to inspect
mixed tables, their useful species and the encounters to avoid defeating.

Each result shows the location and area/floor, method, useful percentage, species
and discrete levels, complete base EV yields, average chosen EVs per encounter,
and expandable access/condition notes. There are 12 results per page; Show More
moves keyboard focus to the next group. Open in Atlas selects exactly the named
location, clears the location-type filter and focuses its heading. The finder
link and browser Back return to the finder with selected controls retained.
Locations also support `#location=Violet%20City` links. Malformed or unknown location
fragments fall back to New Bark Town without executing untrusted input.

There is no save-file dependency, new application package or runtime API request.
The first release does not calculate held-item/Pokérus bonuses, EV caps, travel or
battle time, and does not filter by player story progression. Open requirements
before choosing an area; recommendations can include the late-game locations
already in Atlas. The reader/parser and Planner are unchanged.

## Data and probability rules

`js/data/games/soulsilver/ev-yields.js` contains all 493 species' Generation IV EV
vectors, extracted from the pinned `pret/pokeheartgold` revision
`d2355244ac42b3c6e40d8c36aa3564ee8706dea4`, file
`files/poketool/personal/personal.json`. The generated file retains its source URL
and SHA-256. `scripts/build-soulsilver-ev-yields.py` requires that exact revision,
validates the six-stat mapping and exports only the 493 National-Dex species.
Unown's punctuation encounter labels explicitly resolve to its single base yield.
This avoids substituting modern-generation EV data or confusing Speed with the
Special Attack/Special Defense fields in the original record layout.

Reproduce with:

```sh
python3 scripts/build-soulsilver-ev-yields.py /path/to/pokeheartgold
```

`js/data/atlas-ev-training.js` explicitly selects SoulSilver and consumes the
existing audited route/location encounter datasets, without changing their bytes.
Unsupported games return no recommendations or yields. Repeatable walking, Surf,
rod, Headbutt and Rock Smash encounters are grouped by location, floor/area,
method, actual in-game time and applicable tree/Unown condition.

Every scored table must total exactly 100%; missing yields or incomplete tables
fail rather than normalizing or inventing probabilities. Headbutt groups stay
separate. Ordinary tables omit radio/outbreak replacement rows, which are partial
slot replacements rather than independent tables. The UI explicitly assumes radio
off, no outbreak, no Repel and no encounter-altering lead ability. Roamers, one-time
interactions, gifts and the Bug-Catching Contest are not training recommendations.

For a chosen stat:

- **Useful percentage** is the sum of probabilities for species yielding that stat.
- **Clean percentage** is the probability of species yielding only that stat.
  The default filter requires 100% clean, not just one clean species in a mixed table.
- **Expected base EVs per encounter** is the sum of probability × chosen-stat yield,
  assuming the useful Pokémon are defeated. An unwanted encounter contributes zero
  to the chosen-stat average if fled from. A target species yielding multiple stats
  is explicitly labelled as also awarding unwanted EVs.
- **100% useful** describes the encounter distribution, not encounter frequency per
  step, guaranteed species identity, rod bite rate or Pokémon appearance per rock.

Sorting uses Surfing first, then clean-table status, useful percentage, expected
base EV yield and lower minimum level, with deterministic location/area/method ties.
It is not an estimate of EVs per minute or a claim every location is accessible.

Verified examples include:

| Location/method | Relevant encounters | Result |
| --- | --- | --- |
| Violet City Surf | Poliwag 90% (1 Speed), Poliwhirl 10% (2 Speed) | 100% clean Speed; 1.1 base Speed EVs/encounter |
| Cherrygrove Surf | Tentacool 90% (1 Sp. Def), Tentacruel 10% (2 Sp. Def) | 100% clean Sp. Def; 1.1 base EVs/encounter |
| Route 42 Surf | Goldeen and Seaking | 100% clean Attack |
| Lake of Rage Surf | Magikarp 90% (1 Speed), Gyarados 10% (2 Attack) | 90% useful Speed; excluded by default |
| Ruins of Alph Unown | 1 Attack + 1 Sp. Atk per Unown | Useful for either stat but never a clean single-stat table |

## Validation and scope

All **72 checks pass**, with no failures or skips. Visual review covers phone
and desktop layouts; browser geometry covers 320, 390 and 1440px.

The automated suite verifies known Gen-IV yields and field order, every complete
baseline table at morning/day/night, condition isolation, pure/mixed examples,
Surf-first sorting, filtering and explicit rejection of missing/incomplete data.
Browser checks cover all six stats, mixed and empty results, pagination, direct
links, Atlas navigation, keyboard focus, control preservation, mobile geometry,
existing map/reference behavior and Reader/Planner regressions. Final results and
reference-fetch evidence are recorded in `atlas-ev-training-audit.json`.

User outcome acceptance remains pending after publication to the existing Pages
site. Automated results do not establish real-save or independent in-game validation.
Safari's separate reference/simulator and broader Atlas visual work remain distinct.
