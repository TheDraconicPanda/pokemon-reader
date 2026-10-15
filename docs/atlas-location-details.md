# SoulSilver Atlas location details — v0.25.44

This milestone extends the accepted encounters and maps work with structured
reference information for all **69 existing non-Safari locations**. It does not
add another region, another game, or Safari Zone's area mechanics.

## Coverage and presentation

The game-scoped dataset contains:

| Category | Records | Coverage |
| --- | ---: | --- |
| Items and rewards | 686 | Ground/hidden items, Apricorns, TMs/HMs, held trade items, named gifts, contest/lottery rewards and savings purchases |
| Gifts and trades | 22 | Starter choices, fixed gifts and Eggs, NPC trades, SoulSilver prize Pokémon and the historical Spiky-eared Pichu event |
| Shop/exchange offers | 371 | Listed HGSS stock, prices, badge/National-Dex restrictions and weekday offers |
| NPC/service interactions | 156 | Audited route interactions and named town/dungeon services, story and access conditions |
| Trainer records | 370 | Initial parties, playable rematch stages and starter variants, allies and fixed Frontier Brain milestones |

Each entry has a stable ID, source URL and explicit conditions. Repeated item
names remain separate when their location, floor, reward or requirement differs.
Aggregated source pickups such as `Potion ×6` retain all described pickup sites;
they are not treated as one six-Potion item ball. Trainer records are battle/team
variants, not a count of unique people. Parties display species, levels and any
held-item text supplied by the compact trainer tables; they are not a complete
move/EV/AI database. Gym details are grouped with their current town. The Day Care
is a breeding service rather than a list of fixed-species gifts. Generated
Frontier opponents/rentals are linked facility references, not a fixed route roster.

Atlas uses five collapsed reference sections: Items & Apricorns, TMs & HMs,
Gifts & trades, Shops & exchanges, and NPCs & trainers. Source links remain available
and details participate in search. An empty category says no fixed record was
listed in the reviewed sources rather than silently implying missing data.
Map selection, compass navigation and encounter tables retain their behavior.

## Evidence and corrections

[Machine-readable evidence](atlas-location-details-audit.json) records reference
URLs, successful HTTP status, downloaded-page SHA-256 hashes, per-location counts,
review date and decisions. Serebii and Bulbapedia were retrieved for every existing
non-Safari location. Supplementary gym, character, service and facility pages fill
gaps in the main location articles. Evidence is restricted to HGSS/SoulSilver;
references to other versions or broader parent locations are not imported blindly.

Primary evidence uses pret/pokeheartgold revision
`d2355244ac42b3c6e40d8c36aa3564ee8706dea4`, including:

- `src/overlay_bug_contest.c` and `include/constants/items.h`: the post-National-Dex
  first-prize pool has ten items, **including Oval Stone**; second, third and
  consolation rewards are Everstone, Sitrus Berry and Shed Shell.
- `files/fielddata/script/scr_seq/scr_seq_0878_T24PC0101.s`: safety Tentacool is
  Lv. 15 and checks exactly one party member and all 540 PC slots empty. No
  unsupported Day-Care restriction was added.
- `files/fielddata/script/scr_seq/scr_seq_0112_D44R0103.s`: Dratini gift and
  ExtremeSpeed distinction; a free party slot is required.
- Previously audited route scripts and corrections remain attached to the routes,
  including Route 26's Max Elixir and the farm's seven-Oran-Berry requirement.

Specific safeguards include:

- Exclude explicitly unused and demo-only trainer parties. Keep starter-dependent
  rival variants and rematch/time restrictions distinct.
- Keep battles at their actual locations; importing Lance's page does not place
  his Rocket HQ ally team or Dragon's Den battle at Indigo Plateau. Silver/Lance
  ally roles and combined opponent sides are labelled.
- SoulSilver Game Corner offers Sandshrew rather than Ekans. Japanese Captivate /
  Coin Case pickup differences and western/Korean Voltorb Flip are conditional.
- Keep Silver Wing and Tidal Bell for SoulSilver's Rocket/Kimono progression;
  Rainbow Wing comes from Pewter. Do not replace these with HeartGold rewards.
- Resolve mixed Crystal/HGSS item descriptions: Violet's hidden Hyper Potion
  requires Rock Smash, Mt. Mortar's location uses the eastern position, and
  Crystal-only rooftop merchandise is excluded.
- Ruins of Alph: Kabuto uses Escape Rope; Aerodactyl uses Flash; Ho-Oh may be
  anywhere in the party; Omanyte uses Water Stone at the wall. HGSS does not
  consume the Escape Rope/Water Stone. Hidden-room items retain chamber context.
- Return/Frustration is a **one-time Sunday choice** in HGSS, not a renewable
  weekly gift. Department Store lottery rewards retain their weekday.
- Mom's purchases are paid deliveries, not free ground items. Her Gen-II dolls
  are excluded. Buena's HGSS prizes are point milestones, not Gen-II purchases.
- Historical Celebi/Pichu/Arceus conditions are explicit. These records neither
  provide event unlocks nor promise an active distribution. Sinjoh Ruins and the
  remaining Kanto locations are not added by this milestone.

The dataset is an explicit reviewed reference, not a runtime scraper. Future
updates should inspect the applicable game section, preserve rowspans and version
cells, read tooltip conditions (especially `Unused`), resolve discrepancies and
update the evidence/counts with the data. The app has no new package dependency.

## Validation and acceptance

All **64 tests pass**, with no skipped or failing checks. They cover every scoped
location and record schema, game isolation, representative primary corrections,
trade/gift conditions, unused-team exclusion, weekday stock, source references,
mobile/desktop expansion and search, unchanged encounters, map/floor behavior and
Reader/Planner regressions. Reference sections were visually reviewed at 390px
and 1440px; browser geometry also checks 320px. This does not substitute for
independent in-game or real-save validation.

Publish through the existing GitHub Pages workflow after the final checks. Verify
live release files against the tested checkout before reporting deployment.
User outcome acceptance of v0.25.44 remains pending. Safari Zone mechanics/data
is the next milestone after this outcome is accepted.
