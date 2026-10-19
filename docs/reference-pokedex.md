# SoulSilver reference Pokédex — v0.25.58

This independent reference at `pokedex/` works without a save. Reader's registration
Pokédex, Collection, profile persistence and Planner goals retain their existing
responsibilities. The shared menu labels this tool **Pokédex**; its page heading is
**Reference Pokédex**. Only SoulSilver is supported.

## Behavior

- Johto HGSS order has 256 species; National order has 493. Compact numbered rows
  show bundled HGSS sprites, names and historical types.
- Menu and search share a stationary top block. The separate species list is the
  only scrolling page block; the introductory banner/title/description are omitted
  visually (the page retains a screen-reader heading and versioned browser title).
  Search jumps to a name or **National** number, preserving all neighbors.
  Partial-name matches have a Next button. Searching a species outside the regional
  list switches to National order explicitly. Search never filters rows away.
- Atlas/direct species links position and highlight their species in the list
  before opening the card. Closing or pressing Escape reveals that row and focuses
  its button. Alternate-form links reveal the base species; an out-of-regional
  target switches to National order. Ordinary in-list cards and their saved history
  continue restoring the original browse offset.
- Search highlights and keyboard outlines stay clipped inside the list. Native
  modal details preserve the list pane’s scroll offset and focus. Close/Escape/Back returns
  to the list; Forward reopens a card. Direct `#species=147&scope=national` links
  work under the repository's Pages path. Evolution/form changes reuse the current
  modal history entry. Closing a direct link stays in the reference tool.
- Details include HGSS available abilities/descriptions, EV yields, all 17 incoming
  type multipliers, wild held items with optional Compound Eyes odds, evolution
  family and conditions, covered Atlas locations, level-up moves, evolution-wide
  TM/HM compatibility, tutor moves/costs, Egg moves, base stats and level 1–100 ranges.
- Evolution paths use one horizontal line per branch, with the requirement above
  each arrow. Long paths scroll inside their own detail region on narrow screens.
  Matchup cells are green below ×1 (including immunity), yellow above ×1, red at
  ×4, and neutral at ×1; numeric multipliers remain visible in both themes.
- Machine columns identify **direct** compatibility per stage; retained moves from
  earlier stages are not mislabeled as machine compatibility. Dratini/Dragonair
  cannot use HM02 Fly; Dragonite can. Alternative Wormadam cloaks get separate
  machine columns where their compatibility differs.
- Twelve alternate personal-data records cover Deoxys, Wormadam, Giratina, Shaymin
  and Rotom. Castform weather and Arceus Plate selectors inspect type matchups;
  their unchanged base stats use the same personal record. Other cosmetic forms
  use the standard sprite with an explicit note. Rotom appliance typing remains
  Electric/Ghost in Gen IV; form-change moves are described separately.
- Atlas encounter names link to the corresponding National reference card.
  Location entries use exact existing `#location=...` IDs. No approximate-name
  destinations or generic location-search detours are introduced.

Shared `js/species-presentation.js` owns HGSS sprite URLs and type badges. Reader
uses these same helpers while keeping individual metadata/hidden values and binary
editing separate. Shared badge CSS was extracted without changing its values.
Normal Reader sprites now use the bundled files; shiny sprites retain their remote
HGSS path, pinned to the same source revision. Reader's parsing/enrichment behavior
is unchanged. No save schema or planner migration is added.

## Verified source boundaries

Primary source: [pret/pokeheartgold at d2355244](https://github.com/pret/pokeheartgold/tree/d2355244ac42b3c6e40d8c36aa3564ee8706dea4).

| HGSS source | Used for |
| --- | --- |
| `files/poketool/personal/personal.json` | All 493 species and 12 alternate forms: base stats, Gen IV types, abilities, EV yields, item slots and TM/HM compatibility |
| `files/poketool/personal/wotbl.narc` | Complete native level-up lists, decoded from the NARC (9-bit move ID / 7-bit level) |
| `files/fielddata/sodateya/kowaza_list.narc` | Native Egg move lists, species sentinels at 20000 + species ID |
| `files/fielddata/wazaoshie/waza_oshie.json` | BP and Headbutt tutor compatibility |
| `src/field/scrcmd_move_tutor.c` | Tutor costs and NPC groups |
| `files/fielddata/script/scr_seq/scr_seq_0948_T30R0601.s` | Blackthorn final-starter and Draco Meteor eligibility; friendship 255 |
| `files/poketool/personal/evo.json`, `src/pokemon.c` | 246 unique evolution edges, friendship 220, time/gender/move/party/PID predicates, stat floors, held-item odds |
| `src/item.c` | All 92 TM and 8 HM move assignments |
| `include/constants/{species,moves,abilities}.h` | Native identifier mappings |

Secondary/text source: [PokéAPI at 6fd69dfe](https://github.com/PokeAPI/pokeapi/tree/6fd69dfe90465ba96534f6816fc817737d1f97f6/data/v2/csv).
Uses English species/move/ability/item names; **HGSS version-group 10** ability
flavor text and move cross-checks; HGSS Pokédex 7 ordering; type efficacy with past
entries restored for Generation IV. Modern ability effect prose and modern
personal stats/hidden abilities are not used. The historical Ghost/Dark → Steel
resistances are restored; Fairy is excluded. Item Stick retains its HGSS name
instead of modern Leek.

`js/data/games/soulsilver/pokedex-reference.js` records every input URL and SHA-256.
The generator `scripts/build-pokedex-reference.py` reads downloaded inputs only;
no network or live API is used at runtime. It decodes primary learnsets, generates
records and compares every one of the 493 species' level-up, Egg, tutor and machine
sets against HGSS PokéAPI records: **1,972 comparisons, zero differences**. The
checked-in [comparison result](pokedex-move-comparison.json) is reproducible using
the source inputs and generator. Alternate-form records use primary data; the
all-species cross-check counts do not claim separate form comparisons.

Wild items follow `WildMonSetRandomHeldItem`: common/rare/no-item 50/5/45%; with
Compound Eyes 60/20/20%. Identical nonempty slots give 100%. Missing slots merge
into the no-item result. These describe normal random wild rolls, not every gift
or scripted encounter, and do not prove wild availability.

Gen IV evolution limitations are explicit: no Moss Rock, Ice Rock or magnetic
area in HGSS; the relevant evolutions require D/P/Pt and trading back. Shedinja
requires an empty party slot and regular Poké Ball when Nincada evolves. Wurmple
uses the upper personality half modulo 10, not a player-selectable branch.
Phione/Manaphy breeding is distinguished from evolution. Stat ranges use native
integer floors and distinguish individual maxima from the 510 total EV limit.
Type multipliers intentionally precede abilities/items/weather and other battle
effects; these are not a battle damage calculator.

## Location limits retained

Locations reuse audited Atlas encounter and gift/trade records, retaining method,
floor/area, time, level, rate and conditions. The reference adapter explicitly scopes
special narrative notes by species, while preserving shared access/method notes.
It never blanket-copies a location's story to every species: Horsea’s six Whirl
Islands rows exclude Lugia's conditions; Lugia retains them. Unown form rules,
Lapras’s Friday encounter, roaming requirements and shared Rock Climb access
remain. Mixed legendary notes (Embedded Tower) are split by species. Atlas’s own
location notes and all underlying encounter records are unchanged. Moving Raikou/Entei/Latios entries
are labeled roaming with story requirements, not added to normal walking tables.
Safari reuses its existing 269 records with an explicit pending-audit label; this
release does not claim that its mechanics are complete.

The Atlas covers Johto and its existing League/Mt. Silver approaches, **not full
Kanto**. Pokéwalker/event distributions are not an exhaustive location source here.
Every species card states this boundary. A missing record says no location is
recorded **within current coverage**, never “unavailable in SoulSilver.” The card
links the external HGSS species reference for broader information. Full Kanto
remains the existing separate Atlas milestone.

## Validation and publication

Automated checks use constructed/synthetic saves for Reader/Planner regressions;
no new real-save or in-game correctness is claimed. Reference data itself does not
require a save. New tests cover the dataset/asset invariants and known historical
mechanics, list/search/history/focus, form/type/item/stat controls, exact Atlas
links, denied profile storage, local sprites, repository paths and both themes
at 320/390/768/1440px. Phone and desktop card screenshots were inspected.

`npm test`: **129 passed, 0 failed, 0 skipped** on Node 24 / Chromium 154.
`git diff --check` passed. Publication is to the existing main/Pages deployment
branch; the live result requires online confirmation.
The user accepted the v0.25.57 visual changes. Online acceptance of the v0.25.58
link-position fix remains pending; pushing alone does not prove Pages is live.

## Focused online checklist

For v0.25.58, repeat just the reported round trip:

1. Search **Horsea** in Pokédex and open its card.
2. Follow **SoulSilver locations → Whirl Islands → Open in Atlas**.
3. Select **Horsea** in an Atlas encounter table, then close its reference card.
4. The list should show and highlight **Horsea**, with its neighboring species
   still present. The menu/search stays stationary.

Browser regressions cover this full journey at phone width under the Pages base
path, direct links without an explicit scope, alternate forms, the final species
in the list, Close/Escape, and preservation of ordinary browse/Back/Forward offsets.
No broader profile/Planner/Atlas retest is requested unless a regression appears.
Safari mini Atlas remains the next milestone after this fix is validated.
