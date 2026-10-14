# Atlas assessment and coverage checklist

Assessment: 2026-10-14. Baseline: `b2dee6c6d40a9f6e58a0aef2f5009345dbbd6b52`, matching remote `main` at inspection. Working tree was clean on branch `work`; implementation branch: `feat/atlas-navigation-integrity`.

## Verified repository state

- `js/world.js` renders a searchable directory with type filters, connection buttons, and inline encounter sections. There are no individual route pages or map navigation.
- 58 locations: 10 towns/cities, all 20 Johto Routes 29–48, 19 landmarks, 9 facilities. Some border locations are included; a comprehensive Kanto directory is absent. Final SoulSilver-wide scope must be settled before declaring the entire Atlas complete.
- Every entry has a name, type, region, one-sentence description, and connections. These are directory records, not proof of complete static content.
- Encounter sections exist for Routes 32–48, Azalea Town, Union Cave, Whirl Islands, Cliff Edge Gate, Cliff Cave, Embedded Tower, Safari Zone Gate, and Safari Zone. Routes 29–31 have no encounter section. Encounter omissions are recorded separately from static-content acceptance.
- The latest named data milestone in Git history is Mountain block encounters (v0.25.26). Baseline `index.html` says v0.25.26, but `js/app.js` overwrites the running title/version to v0.25.20 and the Atlas also says v0.25.20. The v0.25.16 handover is historical.
- No existing test files or CI workflows were found; baseline `npm test` was an intentional failing placeholder. No build step exists. `npm run dev` serves the existing app on port 8080.

## Static coverage: what remains

All 20 route records lack dedicated access/progression conditions, a complete landmarks/features list, and source citations. Some of these facts appear in the short descriptions or encounter notes, but there is no per-location static-content checklist or full reference audit. None of the 58 locations can yet be marked fully audited.

Stage A needs a defined inventory of relevant locations and a content checklist per location; stage B needs evidence for every checklist item. In particular, the existing border entries do not form a complete journey: Routes 26–28 and their intervening connections are not represented. Other candidates for inventory review include additional named Johto facilities and interior landmarks. Their exact inclusion and facts require source verification, not inference from an existing card.

The following connection discrepancies need source review. Asymmetry alone does not prove an error, because traversal may be conditional or one-way:

- Route 30 ↔ Ruins of Alph is listed; verify whether this is a genuine connection.
- Ilex Forest only links to Azalea; investigate the missing Route 34 side and its description's direction.
- Cianwood links to Route 47 directly, while Cliff Edge Gate links to Cianwood without a reverse link.
- Violet has no Sprout Tower return link although the tower links to Violet.
- Route 35 / National Park / Pokéathlon Dome adjacency needs gate-level verification.
- Route 36's Ruins of Alph access needs checking.
- Route 47 still links directly to Safari Zone, while Safari Zone's restored connection is its Gate; verify direct versus indirect links throughout this corridor.
- Day Care links to Goldenrod in addition to Route 34, without a reverse Goldenrod link; verify whether connected locations are intended to mean direct adjacency.
- Mt. Silver links directly to Indigo Plateau with no return link; review the omitted border routes and gates before correcting it.

Serebii and Bulbapedia requests returned proxy CONNECT HTTP 403 during this assessment. No source content was retrieved. The statements above about data presence are verified from the repository; geography and completeness are **not** externally verified. Network additions for `serebii.net`, `www.serebii.net`, and `bulbapedia.bulbagarden.net` were saved in the environment draft, preserving the existing `pokeapi.co` addition. Saving does not apply the policy.

### Full existing-location checklist

Every row needs static details, access/conditions, relevant landmarks/features, and citation review. “Present” means only that the current directory record and its links were inspected. “Pending” means the game-specific content has not been checked against references. Update this table with source URLs and specific discrepancies as the audit proceeds.

| Location | Kind | Current connected locations | Directory inspection | Reference audit |
| --- | --- | --- | --- | --- |
| New Bark Town | town | Route 29 | Present | Pending |
| Cherrygrove City | town | Route 29, Route 30 | Present | Pending |
| Violet City | town | Route 31, Route 32, Route 36 | Present | Pending |
| Azalea Town | town | Route 33, Ilex Forest, Slowpoke Well | Present | Pending |
| Goldenrod City | town | Route 34, Route 35, Goldenrod Department Store, Goldenrod Radio Tower | Present | Pending |
| Ecruteak City | town | Route 37, Route 38, Route 42, Burned Tower, Bell Tower | Present | Pending |
| Olivine City | town | Route 39, Route 40, Olivine Lighthouse, S.S. Aqua | Present | Pending |
| Cianwood City | town | Route 41, Route 47 | Present | Pending |
| Mahogany Town | town | Route 42, Route 43, Route 44 | Present | Pending |
| Blackthorn City | town | Route 45, Ice Path, Dragon's Den | Present | Pending |
| Route 29 | route | New Bark Town, Cherrygrove City, Route 46 | Present | Pending |
| Route 30 | route | Cherrygrove City, Route 31, Ruins of Alph | Present | Pending |
| Route 31 | route | Route 30, Violet City, Dark Cave | Present | Pending |
| Route 32 | route | Violet City, Union Cave, Ruins of Alph | Present | Pending |
| Route 33 | route | Union Cave, Azalea Town | Present | Pending |
| Route 34 | route | Goldenrod City, Pokémon Day Care | Present | Pending |
| Route 35 | route | Goldenrod City, National Park, Pokéathlon Dome | Present | Pending |
| Route 36 | route | Violet City, National Park, Route 37 | Present | Pending |
| Route 37 | route | Route 36, Ecruteak City | Present | Pending |
| Route 38 | route | Ecruteak City, Route 39 | Present | Pending |
| Route 39 | route | Route 38, Olivine City | Present | Pending |
| Route 40 | route | Olivine City, Route 41 | Present | Pending |
| Route 41 | route | Route 40, Whirl Islands, Cianwood City | Present | Pending |
| Route 42 | route | Ecruteak City, Mt. Mortar, Mahogany Town | Present | Pending |
| Route 43 | route | Mahogany Town, Lake of Rage | Present | Pending |
| Route 44 | route | Mahogany Town, Ice Path | Present | Pending |
| Route 45 | route | Blackthorn City, Dark Cave, Route 46 | Present | Pending |
| Route 46 | route | Route 29, Route 45, Dark Cave | Present | Pending |
| Route 47 | route | Cliff Edge Gate, Cliff Cave, Embedded Tower, Route 48, Safari Zone | Present | Pending |
| Route 48 | route | Route 47, Safari Zone Gate | Present | Pending |
| Cliff Edge Gate | landmark | Cianwood City, Route 47 | Present | Pending |
| Cliff Cave | landmark | Route 47 | Present | Pending |
| Embedded Tower | landmark | Route 47 | Present | Pending |
| Dark Cave | landmark | Route 31, Route 45, Route 46 | Present | Pending |
| Sprout Tower | landmark | Violet City | Present | Pending |
| Ruins of Alph | landmark | Route 30, Route 32 | Present | Pending |
| Union Cave | landmark | Route 32, Route 33 | Present | Pending |
| Slowpoke Well | landmark | Azalea Town | Present | Pending |
| Ilex Forest | landmark | Azalea Town | Present | Pending |
| National Park | landmark | Route 35, Route 36, Pokéathlon Dome | Present | Pending |
| Burned Tower | landmark | Ecruteak City | Present | Pending |
| Bell Tower | landmark | Ecruteak City | Present | Pending |
| Mt. Mortar | landmark | Route 42 | Present | Pending |
| Whirl Islands | landmark | Route 41 | Present | Pending |
| Lake of Rage | landmark | Route 43 | Present | Pending |
| Ice Path | landmark | Route 44, Blackthorn City | Present | Pending |
| Dragon's Den | landmark | Blackthorn City | Present | Pending |
| Safari Zone Gate | facility | Route 48, Safari Zone | Present | Pending |
| Safari Zone | facility | Safari Zone Gate | Present | Pending |
| Pokéathlon Dome | facility | National Park, Route 35 | Present | Pending |
| Goldenrod Department Store | facility | Goldenrod City | Present | Pending |
| Goldenrod Radio Tower | facility | Goldenrod City | Present | Pending |
| Olivine Lighthouse | facility | Olivine City | Present | Pending |
| Pokémon Day Care | facility | Route 34, Goldenrod City | Present | Pending |
| S.S. Aqua | facility | Olivine City | Present | Pending |
| Victory Road | landmark | Indigo Plateau | Present | Pending |
| Indigo Plateau | facility | Victory Road | Present | Pending |
| Mt. Silver | landmark | Indigo Plateau | Present | Pending |

## Safari Zone inventory

Counts below are displayed records, not unique species, encounter slots, or proof of correct time/level coverage. Zero means no corresponding record was found; it does not establish that the game requires that method in the area. Block counts include walking and any block-based water/fishing records.

| Area | Standard walking | Standard Surfing | Standard fishing (all rods) | Block-attracted |
| --- | ---: | ---: | ---: | ---: |
| Plains | 8 | 0 | 0 | 11 |
| Meadow | 11 | 3 | 7 | 11 |
| Savannah | 8 | 0 | 0 | 10 |
| Peak | 9 | 0 | 0 | 11 |
| Rocky Beach | 8 | 0 | 9 | 10 |
| Wetland | 8 | 4 | 6 | 15 |
| Marshland | 9 | 4 | 7 | 16 |
| Wasteland | 5 | 0 | 0 | 10 |
| Forest | 6 | 0 | 0 | 10 |
| Swamp | 8 | 0 | 0 | 19 |
| Mountain | 9 | 0 | 0 | 10 |
| Desert | 7 | 0 | 0 | 0 |

There are 269 Safari records in total. Walking records are present in all 12 areas, but Wasteland has only a Morning/Day group; verify the correct night behavior. Desert has no block records. Standard Surfing is listed only for Meadow, Wetland, and Marshland. Standard fishing appears only in Meadow, Wetland, Marshland, and Rocky Beach. Swamp has block-based water/fishing records without standard water/fishing groups. These are concrete coverage gaps to investigate against the game's tables; they do not prove absence of encounters elsewhere.

Block counts, unlock-day conditions, time restrictions, levels, and full species coverage remain unaudited. Requirements are prose strings in `rarity`, not a validated mechanics model. No block aging/point calculation or Safari simulator exists. There is no shared Atlas/simulator data module yet. Complete static stages A/B before continuing Safari mechanics, data, or simulator implementation.

## Confirmed defects and this milestone

The focused milestone is **Atlas connection navigation integrity**, a contribution to stage A, not completion of that stage.

Acceptance criteria:

- [x] Connected-location buttons display exactly the named destination, even when its name also matches other descriptions or location names.
- [x] Manual case-insensitive substring search, whitespace trimming, type filters, empty state, and resetting still work.
- [x] Remove the duplicate `Safari Zone` connection key that overwrote its existing Gate connection. Restore that already-declared link without inventing geography.
- [x] Exercise all 122 existing connection buttons in a real browser; ensure each destination exists and the type filter resets.
- [x] Preserve encounter tables: Route 32 still renders 38 records and Safari Zone still renders 269.
- [x] Align main-page HTML, JavaScript title/version, and Atlas labels at v0.25.27. The package's historical npm version is not the application release label.
- [x] Record the full inventory and unresolved content audit; correct the Atlas introduction's outdated five-area block-coverage wording.
- [x] Provide a repeatable browser test command and inspect the diff.
- [ ] User validates the published result at the existing Atlas URL when available.
- [x] Standing authorization recorded: commit, integrate, and publish completed validated milestones, then notify the user.

Validation: `npm test` runs six Chromium browser tests. It verifies the 58-location inventory, existing route coverage, all connection destinations, all 122 connection clicks, search/filter/reset behavior, representative encounter rendering, consistent version labels, main save-reader initialization and invalid-save rejection, Planner checklist persistence and tab switching, and absence of uncaught JavaScript exceptions during these flows. These checks do not validate encounter accuracy or real-save parsing/evolution.

## Remaining phases and defects

Static Atlas stages A and B remain incomplete. After access is available, confirm the full inventory, complete per-location static content, and audit every row above with game-specific citations. Only then resume Safari data/mechanics, the simulator, and complete Safari validation, in that order.

Historical nature, ability, held-item, move PP, Pokédex, and evolution issues remain unconfirmed reports; no save-reader logic was changed in this milestone. Real-save fixtures and in-game checks are still needed for parsing/evolution validation. No unrelated save-reader bug investigation was started.

## Publication and user validation

The user selected the existing GitHub Pages workflow: develop and test in the cloud,
commit and publish completed milestones, then notify them to test online when available.
Separate preview hosting and source ZIP review are not needed. Standing authorization
covers routine commit, integration, and publishing after checks pass.

After publication, check the displayed v0.25.27 at:
https://thedraconicpanda.github.io/pokemon-reader/pokedex-earth/

Search for “Safari Zone Gate”, click Safari Zone, and confirm exactly the Safari
Zone card appears with a return link to the Gate. Manually searching “Safari Zone”
should still return both entries and matching routes. Try route-only filtering,
an unmatched search, and clearing the controls. Reader and Planner regression checks
must pass before publication. Real-save parsing/evolution and game-data accuracy
remain outside these browser checks. User acceptance remains pending until testing.
