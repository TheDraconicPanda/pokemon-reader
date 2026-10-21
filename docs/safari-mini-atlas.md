# SoulSilver Safari mini Atlas — historical integration notes

The encounter-preservation counts and pending-audit statements below describe
v0.25.59–61. Milestone 2 supersedes them with the verified shared slot dataset
and 339-row catalogue. See [current mechanics and limitations](safari-mechanics.md).

This milestone integrates the Safari reference into Atlas without the separate
calculator or new binary-save research. Reader/Pokédex navigation was accepted by
the user before this milestone began. Safari remains within Atlas, not another
main-menu destination.

## Navigation refinements (v0.25.61)

The user accepted the maps and requested a compact heading and stable travel.
The visible section title is **Safari Zone**. The map/compass appears first, then
the six area buttons. Example/manual context and active-adventure details remain
available inside the closed-by-default manual layout editor.

Travel within the open Safari panel focuses the new area heading without
scrolling, then restores the existing viewport. Entering from another Atlas view
brings the Safari title into view. The map frame reserves a constant aspect ratio
for loading, successful and failed images, avoiding late layout shifts. The
scroll regression uses repeated cardinal moves on phone and desktop and checks
both viewport/map position and failed-image space. Its failure request uses a
unique test-only URL so a cached successful PNG cannot mask the error case.

Full v0.25.61 regression: **143 passed, 0 failed, 0 skipped**. Phone/desktop
fixture and error-state screenshots were inspected. The update is pushed for
Pages deployment; live confirmation and focused scroll acceptance remain pending.

Manual layout remains appropriate: the in-game Area Customizer unlocks with
Baoba’s second challenge and supports rearranging/replacing the active areas;
there are ten possible initial layouts. The app does not yet decode this state.
Source: [Johto Safari Zone — areas and challenges](https://bulbapedia.bulbagarden.net/wiki/Johto_Safari_Zone#Challenges).

## Area maps (v0.25.60)

The user accepted the v0.25.59 navigation and requested maps for every area.
`js/data/games/soulsilver/safari-maps.js` identifies twelve distinct original HGSS
images on Bulbagarden Archives. The game-scoped `safariAreaMap` lookup uses area
ID, not grid position; swapping/replacing a manual area updates its map and
encounters together. Other games receive no Safari map fallback.

The preview sits between the existing compass controls and opens the original
PNG in a new tab. A linked source credit remains below it. Image loads send no
referrer. There is a loading message and an error fallback; failed images never
remove navigation, encounters or the source link. Revisiting an area retries.
The maps are reference terrain, not overlays of player position or placed blocks.

These twelve images are **online dependencies**, unlike the existing 148 local
Atlas PNGs. Web references resolved all twelve original image URLs, and eleven
file-description pages identified HGSS area imagery by Jdthebud (2014). Marshland's
original image resolved, but its description page was inaccessible to the research
tool. Pokémon game-image rights remain with their respective owners; accessible
source pages mark these screenshots as fair use, not an open asset license.
No copyrighted images are newly bundled in this release.

The workspace's enforced HTTP allowlist excludes `archives.bulbagarden.net`.
Granting general network permission did not change that policy: the download
returned HTTP 403. The browser tests therefore use a clearly identified existing
local PNG fixture to check loading, sizing and failure recovery. They do not
establish live original-image decoding, offline availability, or permission from
the source to redistribute. Original image availability must be checked online.
The existing local Atlas map manifest, counts and source audits remain unchanged.

The v0.25.60 full suite passes **142 tests, 0 failures, 0 skipped**. Map fixture
rendering and error-state screenshots were inspected on phone and desktop. These
are presentation checks, not screenshots of downloaded Safari originals. The
update is pushed for Pages deployment; live confirmation remains pending.

## Entry, navigation and reference behavior

- From the regular **Safari Zone Gate**, the north connection enters the mini
  Atlas at the entrance position. Atlas’s Johto **Safari** card and contextual
  Safari link open it directly at `pokedex-earth/#safari`.
- Six positions are shown as **three columns × two rows**, north up. The grid
  is a schematic directory, not a claim to new game-map imagery. A position can
  be selected directly; compass buttons move only to its immediate neighbors.
- The entrance is south of the **south-center** position, index 4. Only that
  south compass exit returns to **Safari Zone Gate**. Other boundary slots have
  no invented exit or wraparound. Back/Forward and `#safari=0` through `#safari=5`
  retain the selected position; malformed positions fall back to the entrance.
- The current area uses the same shared encounter renderer as the main Atlas:
  collapsed morning/day/night/method sections, existing levels and conditions,
  caught Poké Ball markers and exact species links into the reference Pokédex.
- The old `#location=Safari%20Zone` reference is preserved with all twelve areas
  and all 269 original records, plus an entry link to the mini Atlas. Existing
  Pokédex location links continue working. Safari Zone Gate stays a normal Atlas
  location, with its maps, Headbutt records, services and return connections.
- Shared menus/themes remain unchanged. Safari is linked within Atlas’s Johto
  tools; there is no independent top-level Safari menu, calculator or new hosting.

## Manual layouts and supported save state

**The SoulSilver parser does not decode Safari arrangement, Baoba progression,
blocks or area aging.** Adventure snapshots still report `safari.supported=false`.
No new offsets, parser fields or inferred progress are introduced. There are no
supported area/progression values to consume from the current profile producer.

The initial arrangement is clearly labeled **Example layout · edit to match your
game**. It is the first of ten possible starting arrangements in the game source,
not a decoded or inferred arrangement for the active trainer. Its positions are:

| Northwest | North center | Northeast |
| --- | --- | --- |
| Plains | Swamp | Meadow |
| Wetland | Peak (entrance south) | Forest |

Use **Set manual area layout** to mirror the game’s current six areas. Selecting
an area already placed swaps its two positions; replacing an area with an unused
one leaves the other five positions unchanged. Six distinct area IDs are required.
**Save manual layout** records this browser preference; it does not alter a save
file, unlock areas or change the in-game Safari arrangement.

Manual records are stored in the existing IndexedDB **settings** store under
`safariManualLayout:soulsilver:<adventure-id>` or a separate `...:reference` key.
Each record has its own schema version, game/adventure scope and revision.

- Each adventure, including separate adventures sharing TID/SID, has an independent
  layout. Reference mode has its own layout. Selecting another profile loads its
  record, or its labeled example if it has no manual record.
- Saving checks the active adventure and the prior record revision inside the
  same read/write transaction. Stale or wrong-profile edits abort rather than
  overwrite a newer layout or target another adventure.
- Shared cross-tab notifications and focus/pageshow refreshes update context and
  layout. If another tab/profile changes the layout while its editor is open,
  the editor closes with an explicit unsaved-edits message; its draft is not saved.
- Same-profile save/registration updates preserve the selected area and existing
  encounter disclosure nodes; caught markers update in place.
- Denied storage keeps reference navigation usable and allows a session-only
  manual arrangement. Quota/write failures retain the last committed record and
  label the temporary arrangement **session only**. Reload cannot promise to keep
  these temporary edits. Original profile, Planner and legacy browser data remain
  intact.

Database/snapshot schema versions stay at 1. There is no migration of Reader or
Planner data, no overwrite of snapshots, and no binary editing. Clearing browser
site data also clears these local layouts; original save files remain separate.

## Verified navigation evidence

Pinned primary source: [pret/pokeheartgold at d2355244](https://github.com/pret/pokeheartgold/tree/d2355244ac42b3c6e40d8c36aa3564ee8706dea4).
Every input URL and SHA-256 is recorded in
`js/data/games/soulsilver/safari-reference.js`.

| Source | Verified result |
| --- | --- |
| `include/constants/safari.h` | Twelve area IDs/names; 3 columns and 2 rows |
| `src/map_matrix.c`, `PlaceSafariZoneAreas` | Row-major `areas[y * 3 + x]`, placed at matrix cells `(x+1,y+1)` |
| `src/safari_zone.c`, `sSafariZoneDefaultAreaSets` | First possible example arrangement `[0,7,1,5,3,6]`; no assumption that it belongs to this trainer |
| `files/fielddata/eventdata/zone_event/314_D47R0102.json` | Exit warps at `(79,100)` and `(80,100)` |
| `files/fielddata/script/scr_seq/scr_seq_0119_D47R0101.s` | Entry warp `(79,100)`, facing north; reception return via the dynamic warp |

The active models occupy matrix columns 1–3 and rows 1–2. With 32-tile cells,
entry `(79,100)` is in column 2/row 3, immediately below bottom-center active
position 4. This establishes the entrance side without guessing from a drawing.

The generator `scripts/build-safari-reference.py` reads an extracted copy of the
pinned repository, checks these predicates, and emits identifiers/topology and
source hashes. It neither accesses a personal save nor claims to validate offsets.

## Encounter coverage limits

`js/data/games/soulsilver/safari-encounters.js` remains unchanged. All **269** records
partition into the same twelve named areas and retain every method, time, level,
rarity and block/day requirement. The normalized source array SHA-256 remains:

`769f131cc6148882931d4e5ddf4ce614fca9494389f6cafe5d73d229d3228246`

This is a preservation check, **not a new Safari encounter/mechanics audit**.
The visible reference count states that audit is pending and records are not
filtered by current blocks, aging or progression. Block/day text is displayed
as supplied by the existing reference; it is not a calculated eligibility result.
Walking records spanning multiple times appear in each matching time disclosure,
so display-row counts can exceed unique source-record counts, as in the main Atlas.

Object placement/optimization, progression simulation, encounter recalculation,
area-aging calculations, capture mechanics and the full calculator are excluded
from this integration milestone. They remain on the separate Safari track after
the application integration is finished.

## Validation and publication

Automated tests check source/game isolation, topology and all reciprocal edges,
unique manual layouts/swaps, unchanged 269-record coverage, Gate entry/exit/history,
all twelve area displays, refresh persistence, independent profile/reference
layouts, unchanged snapshots/legacy Planner data, same-profile caught refresh,
stale/wrong-profile transactions, quota rollback, denied-storage sessions, real
cross-tab updates, both themes and 320/390/768/1440px Pages-path layouts. Phone and
desktop mini Atlas screenshots were inspected.

The browser harness disables its back/forward cache for isolated cases that delete
IndexedDB between documents: a frozen previous document can otherwise retain an
in-flight close and block the reset. Application caching is unchanged. Same-document
history and real cross-page navigation are still exercised. Safari test navigations
use distinct query strings and reload markers to wait for the fresh document.

`npm test`: **140 passed, 0 failed, 0 skipped** on Node 24 / Chromium 154.
`git diff --check` passed. No real personal save or in-game
Safari layout has been independently validated. Pushing to the existing deployment
branch is not proof the live Pages build is ready; online user acceptance follows.

## Previous navigation checklist (accepted by user)

1. Confirm **v0.25.59** in Atlas. Open **Safari Zone Gate** and go north. Expect a
   six-area mini Atlas, with **Peak** at the entrance in the labeled example.
2. Open **Set manual area layout**, match your game’s six areas and save. Select
   areas or use the compass to move between neighbors. From the south-center area,
   **south → Safari Zone Gate** should return to the regular Atlas.
3. Refresh and re-enter Safari: the same manual layout should remain for this
   adventure. If you use multiple adventures, their layouts should stay separate.
4. Expand an encounter section. Caught markers should match the active adventure,
   and Pokémon names should open their reference Pokédex card. Expect existing
   time/block/day requirements, including the clear pending-audit/unfiltered label.

The layout is manual in this version; loading a save does not auto-fill it. No
calculator, object planning or automatic progression filtering is expected yet.
Only this Safari integration needs focused acceptance; existing tools already ran
through automated regressions.

## Focused user checklist (v0.25.61)

1. Confirm **v0.25.61**. Safari should show **Safari Zone**, the map/compass, then
   the area buttons. Example/adventure context is inside **Set manual area layout**.
2. Scroll to a comfortable map position, then use several arrows in succession.
   The map and arrows should stay in the same viewport position, including while
   an image loads. There should be no repeated scroll back to the area buttons.

The previous map/navigation acceptance remains recorded; no broad retest is needed.

## Safari v1 foundation re-audit

See [Milestone 1 audit](safari-foundation-audit.md) for the v0.25.75 baseline,
primary-source recheck, incomplete-layout correction and remaining mechanics scope.
