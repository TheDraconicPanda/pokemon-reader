# Johto interiors and travel conditions — v0.25.67

This release advances the two requested areas: interior reference maps and HM/story
information on travel buttons. It does not add Kanto locations, audit/change Safari,
expand battle mechanics or filter reference content by saved progression.

## Maps added

There are **42 additional choices across 14 existing location groups**, bringing
the non-Safari catalogue to **192 views / 175 distinct PNG files**:

- All eight Johto Gyms, using the verified HGSS archive's original map layers.
- Elm's lab on both floors, the player's house/bedroom and the neighbouring
  character's matching house layouts.
- Violet's Pokémon School; Goldenrod's Bicycle Shop, Name Rater, international/
  Korean and Japanese Game Corners, and the three Global Terminal floors.
- The standard Pokémon Center main floor in the nine applicable Johto towns and
  the standard Poké Mart in the seven applicable towns. Goldenrod uses its
  Department Store; Cianwood's pharmacy and Mahogany's shop are not mislabeled as
  standard Marts.
- Mahogany's shop, the Rocket HQ shop entrance, the Day Care interior/yard, the
  already-scoped League lobby, and a Magnet Train platform reference.

Full floor plans and reference screenshots are distinguished in labels and
metadata. The Game Corner versions are separate. The shared Global Terminal plans
are labelled Platinum/HGSS. The primary HGSS map headers establish identical room
matrices for the reused Centers/Marts and the neighbouring New Bark house floors;
NPCs/furniture shown in the source screenshot are not asserted to be the town's
current occupants or story state. Shared references retain those caveats.

The selector, previous/next controls, full-size link and source links work for
these views. Interior names are searchable. Choosing an interior keeps the town's
compass links and location-level encounter/reference tables; a note explains that
context so a town's Surf table is not presented as a Gym encounter table.

### Remaining artwork gaps

**This is not every building interior in Johto.** No released-game floor plan has
been added for Kurt's house, the Cianwood Pharmacy, Ecruteak Dance Theater and
other ordinary houses/service rooms without verified artwork. The Kurt-house HGSS
image found in the reviewed sources is marked *prerelease* and was rejected.
Generation II images, anime illustrations and invented layouts were not used as
substitutes. The train platform remains a screenshot reference, not a complete
station floor plan. These gaps remain open; this release does not declare the
whole Johto map inventory complete.

## Directed travel data

All **154 existing directed non-Safari connections** have a game-scoped review;
**80** carry additional requirements or path notes. Safari Zone Gate remains a
normal location, but its link into Safari has no new travel-data rule.
`js/data/games/soulsilver/travel.js` holds the SoulSilver records;
`js/data/atlas-travel.js` rejects unsupported games and unknown pairs. The shared
renderer in `js/atlas-travel.js` does not read save flags or disable destinations.

Buttons retain their destination name and display small original SVG symbols:
solid-bordered HM symbols for passage requirements, dashed symbols for
through-route/alternative requirements, a lock for a story condition and an
information symbol for path notes. Names/badges and precise requirements appear
in each button's accessible description and tooltip, and in the collapsible
**Travel conditions** section for touch/keyboard use. Optional deeper-area HMs are
explained there without being made universal entry symbols.

The HM permissions are SoulSilver-specific: Cut/Hive, Surf/Fog,
Strength/Plain, Whirlpool/Glacier, Waterfall/Rising, Rock Smash/Zephyr and
Rock Climb/Earth (all 16 Badges). Fly is not an ordinary adjacency path and is not
added as a destination route.

Important distinctions retained in the reviewed rules:

- New Bark's eastern water needs Surf; its departure story check is separate.
- The direct Route 35/36 shortcut needs Cut; travelling via National Park does not.
- Route 42 can be crossed by Surf **or** the Mt. Mortar walking passage.
- Ilex Forest's through-path needs Cut/Hive; merely visiting its entrance differs.
- Ice Path's boulder puzzle needs Strength and the NPC requires HM07 to be picked
  up. Field use/teaching of Waterfall is not required for its exit.
- Whirl Island approaches need Surf/Whirlpool. Flash improves visibility; the
  Silver Wing/Tidal Bell chamber story is a separate condition.
- Slowpoke Well/Mt. Mortar deeper areas are not the same as their entrance paths.
- Route 45/46 and Dark Cave ledges do not provide an unrestricted uphill shortcut
  to Blackthorn. The relevant direction/section restrictions are explicit.
- Tohjo Falls' through-route uses Surf/Waterfall; optional whirlpool islands on
  Route 27 are not part of that requirement.
- Amphy's cure opens the Route 47 corridor; the Radio Tower resolution opens
  Mahogany's eastern road; Hall of Fame opens Frontier Access.
- Eight Johto Badges gate Victory Road; Oak's all-16-Badge authorization gates the
  existing Route 28/Mt. Silver approach. No new Kanto node is added.
- Station visits versus boarding, and ordinary lobbies versus story-restricted
  upper floors, are distinguished. The app remains a reference, not a movement
  simulator or automatic saved-progression filter.

## Evidence and preservation

The [machine-readable ledger](atlas-johto-interiors-travel-audit.json) includes the
new view inventory, original source URLs/dimensions/SHA-256 hashes, primary shared
room matrix evidence and travel reference URLs. The complete reproducible map
recipe remains in `scripts/atlas-map-sources.json`; direct originals now total 52
in `docs/atlas-map-originals.json`. Existing source archives remain pinned and
checksum-verified. New images are stored byte-for-byte or as lossless archive-layer
exports, not modified screenshots or AI-generated game maps.

Travel wording is based on the existing location-specific Serebii/Bulbapedia
references, refreshed in the 20 October integrated audit, and the previously
pinned primary entrance/event/text audit. Primary room evidence uses
`pret/pokeheartgold` revision `d2355244ac42b3c6e40d8c36aa3564ee8706dea4`.
Requirements are explicitly directed and qualified where grouped locations or
alternative paths prevent one universal field-move list.

Existing encounter data, EV yields, gifts/trades/items, trainer records and Safari
files are unchanged. Reader/Planner changes are release metadata only.

## Validation and acceptance

The full map build succeeds with **no missing required catalogue view**. New
coverage tests exercise all eight Gyms, references/shared-room notices, game
isolation, all 154 reviewed pairs and known alternate/one-way/HM cases. Browser
checks cover every map choice and image, source/full-size links, location-level
encounter preservation, travel descriptions, interior search and 320/390/1440px
layouts. The full application regression suite has **154 passing tests**, with no
failures or skips. Phone/desktop screenshots of the Gym selector and travel
symbols are reviewed. No new real-save/in-game validation is claimed.

Publish using the existing Pages workflow and compare deployed files/assets with
the tested checkout. User visual acceptance and the source-dependent remaining
interior maps stay open.
