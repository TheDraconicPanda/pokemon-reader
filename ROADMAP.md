# Pokémon Reader Roadmap

## Team Planner navigation — v0.25.66

- [x] Remove duplicate HM plan / EV training tabs; preserve member-popup sections
- [x] Main team fallback for old HM/EV URLs and two-tab keyboard navigation
- [x] All 150 automated checks pass, including keyboard navigation and legacy links
- [ ] Online acceptance

## Team Planner current details — v0.25.65

- [x] Verified HGSS growth rates and local experience-to-level calculation for PC Pokémon
- [x] Current nonpreferred nature option/description without changing favorite goals
- [x] Main-team HM note removal and new-popup scroll/queued-close fixes
- [x] All 150 automated checks pass; current-nature phone screenshot reviewed
- [ ] Online acceptance with the user's save

## Team Planner popup refinement — v0.25.64

- [x] Sprite/type/name/level cards and Party-style modal details with Close/Escape
- [x] Collapsed saved-Pokémon selector, compact ability and priority-nature info overlay
- [x] Concise HM explanations/checks and EV totals without repeated Target/Current rows
- [x] All 148 automated checks and final focused popup/layout checks pass; both-theme screenshots reviewed
- [ ] Online acceptance with the user's current save

## Team Planner UX — v0.25.63

- [x] Shared gear settings, single Planner title and accessible app-purpose hint
- [x] Compact cards with current-stage sprites and combined team/HM/EV details
- [x] Ability/nature checks, exclusive manual nature choices and no-candidate manual fallback
- [x] All 147 merged automated checks pass; phone/desktop screenshots reviewed
- [ ] Online acceptance with the user's current save

## Application integration — current track (2026-10-19)

This user-requested integration supersedes the historical "Safari next" ordering
below. Preserve existing features; finish integration before Safari calculators.
See [architecture and acceptance gates](docs/application-integration.md).

- [x] Inspect architecture, Reader/Planner storage, Atlas/Safari data and tests
- [x] Establish clean baseline: all 78 existing automated checks passed
- [x] Create dedicated `feature/adventure-integration` branch
- [x] Milestone 1 implementation (v0.25.53): decoded IndexedDB Adventure Profiles,
  atomic validated replacement, refresh/manual restoration, duplicate identity
  selection and separate-adventure creation, lossless legacy Planner migration copy
- [x] Keep original binaries transient; separate evolution exports from loaded progress
- [x] Pass all 88 automated checks, including browser transactions and Pages path
- [x] Milestone 1 live version confirmed by user; next milestone authorized
- [x] Milestone 2 implementation (v0.25.54): multiple planners, migration activation, durable Pokémon identity,
  party-first/manual-PC association and actual move/nature/evolution/EV progress
- [x] Milestone 2: all 104 automated checks pass; linked phone/desktop views reviewed
- [x] Milestone 2: user reported it looks good and authorized the next milestone
- [x] Milestone 3 implementation (v0.25.55): shared game-specific identifiers/yields,
  full caught flags, in-place Atlas/Safari-reference/EV-result caught indicators
- [x] Milestone 3: all 113 checks pass; phone/desktop marker layouts reviewed
- [x] Milestone 3: user reported “All working well” and authorized advancing
- [x] Milestone 4 implementation (v0.25.56): standalone Gen IV reference Pokédex,
  primary HGSS data, shared presentation and exact Atlas species/location links
- [x] Milestone 4: all 124 checks pass; phone/desktop cards reviewed; 1,972 move-list
  comparisons match primary HGSS records
- [x] Milestone 4 refinements (v0.25.57): list-only scrolling, inline evolution
  paths, matchup colors and species-scoped location notes; all 127 checks pass
- [x] Milestone 4 visual refinements accepted by user; Atlas return-position bug reported
- [x] v0.25.58: linked cards reveal their species when closed; ordinary browse
  positions remain preserved; all 129 checks pass
- [x] Milestone 4: user reported navigation is perfect and authorized advancing
- [x] Milestone 5 implementation (v0.25.59): verified 3×2 navigation, per-adventure
  manual layouts, shared encounters/caught markers and Gate return
- [x] Milestone 5: all 140 checks pass; phone/desktop layouts reviewed; original
  269 encounter records and all twelve area partitions verified unchanged
- [x] Milestone 5: user accepted Safari navigation and requested individual area maps
- [x] v0.25.60: twelve online original HGSS area maps, full-size/source links and failure fallback
- [x] v0.25.60: all 142 automated checks pass; image-fixture phone/desktop and error-state layouts inspected
- [x] v0.25.60: user reported maps look great; requested minor navigation refinements
- [x] v0.25.61: short Safari title, map-first layout, context inside manual editor and preserved navigation scroll
- [x] v0.25.61: all 143 automated checks pass; repeated phone/desktop arrow scroll and failed-image space verified
- [ ] v0.25.61: explicit online scroll confirmation not separately reported; user authorized the final integration review
- [x] Milestone 6 implementation (v0.25.62): Reader restore/history routing, Planner URL/keyboard semantics and named reset dialog
- [x] Milestone 6: cross-tool Pages-path journey preserves two adventures across themes and phone/tablet/desktop layouts
- [x] Milestone 6: all 146 automated checks pass; reviewed layouts and published v0.25.62 to the existing deployment branch
- [ ] Milestone 6: live confirmation and two focused online acceptance checks

Do not mark later milestones complete based on the profile foundation. Existing
Planner v1 browser data remains preserved; schema-2 IndexedDB plans are authoritative
after migration activation. No personal save has been used for automated validation
in this chat. Reader, Atlas and Planner display the same v0.25.66 release label.
See [the final integration review](docs/integration-review.md). The separate
Safari mechanics audit/calculator remains subsequent work.

## Phase 0 — Project foundation
- [x] Create GitHub repository
- [x] Initialize README
- [x] Initialize roadmap
- [ ] Establish initial application structure
- [ ] Establish basic development/testing conventions

## Phase 1 — Basic web application
- [x] HTML application shell
- [x] CSS layout and styling
- [x] JavaScript application entry point
- [x] File picker
- [x] Drag-and-drop save file input
- [x] File metadata/status display
- [x] Clear error and success states

## Phase 2 — SoulSilver save reader
- [ ] Detect SoulSilver save files
- [ ] Validate save structure
- [ ] Identify relevant save blocks
- [ ] Implement reusable binary-reading helpers
- [ ] Document discovered offsets and structures

## Phase 3 — Save and trainer information
- [ ] Trainer name
- [ ] Trainer ID
- [ ] Secret ID
- [ ] Trainer gender
- [ ] Play time
- [ ] Money
- [ ] Badges
- [ ] Additional useful save data

## Phase 4 — Party Pokémon
- [ ] Read party slots
- [ ] Decode Pokémon data
- [ ] Species
- [ ] Nickname
- [ ] Level
- [ ] Nature
- [ ] Ability
- [ ] Held item
- [ ] Moves
- [ ] IVs / EVs
- [ ] PID / encryption-related data
- [ ] Other useful hidden values

## Phase 5 — PC boxes
- [ ] Read all box slots
- [ ] Display box layout
- [ ] Display Pokémon sprites
- [ ] Select individual Pokémon
- [ ] Detailed Pokémon view

## Phase 6 — Custom PokéEarth
- [x] Fix exact connected-location selection and Safari Zone Gate return navigation (v0.25.27)
- [x] Add Chromium regression checks for all existing connection buttons and search/filter behavior
- [x] Record the current 58-location inventory and unresolved coverage in [the Atlas assessment](docs/atlas-assessment.md)
- [x] Implement static landmarks/access content for 70 grouped Johto and border locations (v0.25.36); full static audit completed in v0.25.37; user validation remains pending
- [x] Audit all 70 static location groups against Serebii/Bulbapedia and record evidence (v0.25.37)
- [x] Define initial location data model
- [x] Build searchable directory foundation
- [ ] Expand and verify Johto locations
- [x] Add connected-location navigation
- [ ] Routes and areas
- [x] Add first verified wild-encounter dataset (Route 32)
- [x] Add Union Cave wild encounters by floor and method
- [x] Add Route 33 wild encounters by time, Radio, and Headbutt group
- [x] Add Azalea Town Headbutt encounters
- [x] Add Route 34 wild encounters by method and condition
- [x] Add Route 35 wild encounters by time, method, and condition
- [x] Add Route 36 wild encounters by time, Radio, Headbutt, and special interaction
- [x] Add Route 37 wild encounters by time, Headbutt group, and Radio
- [x] Add Route 38 encounter reference
- [x] Add Route 39 encounter reference
- [x] Add Route 40 encounter reference
- [x] Add Route 41 encounter reference
- [x] Add Route 42 encounter reference
- [x] Add Route 43 encounter reference
- [x] Add Route 44 encounter reference
- [x] Add Route 45 encounter reference
- [x] Add Route 46 encounter reference
- [x] Add Route 47 encounter reference
- [x] Add Route 48 encounter reference
- [x] Add Cliff Edge Gate encounter reference
- [x] Add Cliff Cave encounter reference
- [x] Add Embedded Tower special-encounter reference
- [x] Add Safari Zone Gate SoulSilver Headbutt encounter reference
- [x] Expand standard walking encounter coverage across all 12 Safari Zone areas
- [x] Add standard Safari Zone Surfing encounters and fishing tables for Meadow, Wetland, Marshland, and Rocky Beach (full coverage and level-range audit still pending)
- [ ] Verify remaining Safari Zone water/fishing tables against the SoulSilver reference
- [x] Add block-attracted Pokémon for Plains and Meadow, with object counts and unlock-day requirements
- [x] Add block-attracted Pokémon for Savannah and Peak, with object counts and unlock-day requirements
- [x] Add block-attracted Pokémon for Rocky Beach, with object counts and unlock-day requirements
- [x] Add block-attracted Pokémon for Wetland, with object counts and unlock-day requirements
- [x] Add block-attracted Pokémon for Forest, with object counts and unlock-day requirements
- [x] Add block-attracted Pokémon for Swamp, including walking, surfing, and fishing requirements
- [x] Add block-attracted Pokémon for Marshland, including walking, surfing, and fishing requirements
- [x] Add Wasteland block-attracted Pokémon, including mixed block requirements and delayed unlocks
- [x] Add Mountain block-attracted Pokémon, including mixed block requirements and delayed unlocks
- [ ] Add Desert block-attracted Pokémon and complete the block reference
- [ ] Audit all Safari Zone encounter tables against SoulSilver-specific references
- [x] Add Whirl Islands wild encounters by floor and method
- [x] Complete encounter coverage across existing non-Safari locations (v0.25.42)
- [ ] Trainers
- [ ] Items
- [ ] Other useful location data

## Phase 7 — Expansion
- [ ] Define game-specific parser interface
- [ ] Add next game based on actual play needs
- [ ] Reuse shared Pokémon/UI/data components
- [ ] Keep game-specific save logic isolated

## Development principles
1. SoulSilver first.
2. Correctness before polish.
3. Keep save processing local where practical.
4. Avoid unnecessary dependencies.
5. Implement and test one small feature at a time.
6. Do not generalize for other games until SoulSilver gives us a proven foundation.


## Phase 8 — Targeted evolution save editing
- [x] Define a restricted evolution-only editing scope
- [x] Add trade and unavailable-location evolution rules for Generation IV
- [x] Add eligibility-based Evolve controls for party and PC Pokémon
- [x] Preserve the original upload and export a separate evolved save
- [ ] Validate encrypted Pokémon record writing and save checksums against real SoulSilver test saves
- [ ] Test trade-item consumption and party stat recalculation in-game or in an emulator
- [ ] Expand only after the first writes are validated

## Reader UI redesign — implemented; Atlas work resumed

- [x] A: implement dashboard shell, five-view routing, responsive navigation, and persistent themes (Reader v0.25.28); automated checks pass
- [x] A: visual direction accepted by the user; real-save validation remains part of final acceptance
- [x] B: Overview upload experience, trainer cards, badges, and summary statistics
- [x] C: Party cards and complete unified Pokémon details
- [x] D: PC box navigation, 30-slot layouts, search, and inspection
- [x] E: dedicated Pokédex and organized Collection
- [x] F: integration, responsive/accessibility checks, and visual polish

B–F implementation is complete in Reader v0.25.29 with 18 passing browser checks.
The user authorized completing B–F and publishing one integrated release before
final user testing, superseding intermediate user-review gates for this redesign.

- [ ] Final user acceptance and real SoulSilver save/replacement validation
- [x] Confirm the v0.25.29 release is live on the existing Pages site (user confirmed)

Parser/game mechanics, Atlas internals, and Team Planner internals are unchanged.
Automated UI checks use synthetic parsed records and do not validate binary parsing
or the known historical gameplay-data issues. No parser defects were resolved as
part of the redesign; real-save correctness and evolution validation remain pending.

## Reader ribbon and Overview refinements — v0.25.30

- [x] Move Load Save, Planner, Atlas, and theme into the top ribbon
- [x] Place Reader view navigation above the companion heading and make it sticky
- [x] Remove diagnostic Save Information and redundant header status/shortcut links
- [x] Hide upload area after loading; Load Save clears all Reader state and returns to upload
- [x] Make six summary statistics buttons with real Party/PC/owned/shiny/Seen/Caught destinations
- [x] Validate with 21 browser tests, including reset/reload, sticky navigation, and summary destinations
- [ ] User acceptance of v0.25.30 and confirmation it is live

## Reader top ribbon refinement — v0.25.31

- [x] Restore subtle text styling for Load Save, Planner, Atlas, and theme controls
- [x] Preserve touch targets, focus indicators, and existing behavior
- [ ] User acceptance of v0.25.31; Party refinements are next

## Compact Party and detail refinement — v0.25.32

- [x] Six whole-card buttons in a compact three-column/two-row grid with unchanged 96px sprites
- [x] Nickname, type badges, and five-band HP bars; full stats/status/items remain in details
- [x] One dialog name, right-side shiny/Egg icons, and two-row nature modifiers
- [x] Borderless Moves and Training tables, IV/EV totals, and retained Hidden Power
- [x] Conditional egg/form history, Friendship / 255, and expanded sourced Gen IV location labels
- [x] Validate with 24 browser tests and phone/desktop visual review
- [ ] User acceptance and real-save review of v0.25.32

## Party detail spacing — v0.25.33

- [x] Remove Current Party subtitle and right-align the nature modifier block
- [x] Remove move slot column and use 70%/15%/15% columns for Moves and Training
- [x] Validate with the 24 browser regressions
- [ ] User acceptance of v0.25.33

## Detail number alignment — v0.25.34

- [x] Put nature percentages before stat names, keeping arrow colors and alignment
- [x] Right-align numeric Moves and Training headers and values
- [x] Validate with the 24 browser regressions
- [ ] User acceptance of v0.25.34

## Ribbon alignment and save gating — v0.25.35

- [x] Align top ribbon link/action text vertically
- [x] Keep only Overview available until a valid save has finished loading
- [x] Guard direct view/section links and relock on reset or invalid replacement
- [x] Validate with 26 browser checks
- [ ] User acceptance of v0.25.35


## Atlas static guide — v0.25.36

- [x] Preserve Reader updates through v0.25.35 and resume Atlas on a feature branch
- [x] Add static features, access conditions, and pinned game-data sources for all 70 location groups
- [x] Add the missing League/Mt. Silver approaches and major facilities, and correct named connections
- [x] Extend search to static features/access and test all 154 connected-location buttons
- [x] Keep all existing encounter tables unchanged; Reader/Planner regressions pass
- [x] Complete the separate per-location Serebii/Bulbapedia static-content audit (v0.25.37)
- [ ] User tests the published v0.25.36 result when available

See [static coverage](docs/atlas-static-coverage.md) for the explicit scope, complete
inventory, source revision, and remaining audit boundary. This does not complete
Phase 6 or authorize advancing to Safari mechanics/simulation before the audit.


## Atlas static audit — v0.25.37

- [x] Confirm live reference-site access after environment republication
- [x] Review all 70 groups against Serebii and Bulbapedia using HGSS-specific sections
- [x] Record corrections/clarifications for 59 groups and confirm 11 without content changes
- [x] Add the Cut shortcut (156 connection buttons) and preserve the Tunnel search alias
- [x] Add reference links and [complete per-location audit evidence](docs/atlas-static-audit.md)
- [x] Preserve all 25 encounter tables and current Reader/Planner behavior
- [ ] User validates the published v0.25.37 outcome when available
- [ ] Complete and validate Safari Zone encounter data and block mechanics next

This completes the scoped static-content audit, not the encounter/mechanics audit,
full Kanto coverage, or all of Phase 6. No simulator work has begun.

## Atlas navigation first milestone — v0.25.38

- [x] Open New Bark Town on each fresh Atlas visit
- [x] Arrange overland links by compass direction above static information and encounters
- [x] Preserve other connections, all 70 records, search/type filters, and encounter tables
- [x] Focus and scroll to the destination heading after navigation
- [x] Validate mobile/desktop geometry, exact destinations, and Reader/Planner regressions
- [x] Publish validated Atlas v0.25.38 to the existing deployment branch (`2c09073`)
- [ ] Confirm the deployed Atlas version (status API and public-site checks returned 403)
- [x] User accepted the navigation improvement on the existing Pages site

Map artwork and a separate encounter block are deferred. No encounter filters are
needed for this milestone. See [assessment and acceptance criteria](docs/atlas-navigation.md).

## Atlas overview and encounters — v0.25.39

- [x] Separate the overview and encounters into distinct blocks for all 70 locations
- [x] Keep compass controls and compact static information together above encounters
- [x] Preserve encounter records and identify locations with data not yet added
- [x] Validate responsive separation and all Reader/Planner/Atlas regressions (35 checks)
- [x] User confirmed v0.25.39 looks good on the existing site

Publication uses the existing deployment branch and Pages site. Map artwork is a
later milestone; encounter filtering remains deferred. Reader and Team Planner
implementation files are unchanged. Real-save and game-data validation are not
part of these layout checks.

## Atlas opening-area maps — v0.25.40

- [x] Add six outdoor maps from New Bark through Violet inside the compass layout
- [x] Provide full-size local image links, source credits, and failed-image fallback
- [x] Preserve all 70 locations and every existing connection/encounter record
- [x] Validate assets, six-step navigation, mobile/desktop layout, and regressions (37 checks)
- [ ] Confirm live deployment and user acceptance of v0.25.40
- [ ] Expand verified map coverage beyond the six opening locations in a later milestone

This is the first map milestone; remaining locations retain their text compass.
No interior/floor selector, encounter filter, Reader, or Planner changes are included.


## Atlas existing-route audit — v0.25.41

User priority: complete the encounters and useful route features already present
in Atlas before resuming Safari Zone mechanics. This supersedes the immediate
next-step order for this milestone.

- [x] Audit all 23 existing numbered routes (26–48) against both reference sites
- [x] Resolve encounter discrepancies using pinned SoulSilver game data/rules
- [x] Add missing tables for Routes 26–31 and replace older route tables
- [x] Cover applicable walking, Surf, rods, Headbutt groups, radio and outbreaks
- [x] Include Kenya/Sudowoodo gifts/interactions and their conditions
- [x] Add route items, Apricorns, useful NPC interactions and trainer identities
- [x] Keep new reference data game-scoped for future multi-game support
- [x] Validate method/time distributions, content, mobile layout and regressions (43 checks)
- [ ] User confirms the deployed v0.25.41 outcome; real-game validation remains pending

See [route audit and scope](docs/atlas-route-audit.md). Other location encounter
tables, full Kanto coverage, remaining maps and trainer party/strategy data are
not completed by this milestone. Safari Zone data/mechanics remain the next
planned technical milestone after this route work is accepted.


## Current Atlas order — revised 2026-10-15

This user-approved order supersedes the historical Safari-first sequence and the
previous "Safari next" notes above. The 25-table count in earlier planning was
historical: v0.25.41 has 31 populated location sections after its route audit.

1. **Complete encounters across the existing Atlas except Safari Zone.** Audit all
   69 non-Safari location groups, including city water, cave floors, special
   encounters, version/time conditions and verified no-wild-encounter locations.
   Include Safari Zone Gate; preserve Safari Zone's separate dataset.
2. **Expand maps**, including remaining outdoor maps, dungeon floors and navigation.
3. **Complete structured location details**: items, TMs/HMs, gifts, trades, trainers
   and applicable conditions; retain existing route details.
4. **Complete Safari Zone data/mechanics** for all 12 areas and all conditions.
5. **Build and audit the Safari simulator** using the same validated dataset.
6. **Expand Kanto** to complete SoulSilver's second region.
7. **Run the final integrated audit** of accuracy, navigation, mobile and regressions.

All new data/rules must stay game-scoped for future support, without prematurely
adding other games or changing the SoulSilver-first scope.


## Whole-Atlas encounter milestone — v0.25.42

- [x] Inventory/audit all 69 existing non-Safari groups and actual cave floors
- [x] Complete town water/tree/rock encounters, including Cherrygrove
- [x] Add missing cave/floor tables and correct existing non-route tables
- [x] Audit SoulSilver methods, times, levels, rates and version conditions
- [x] Cover contest sets, Unown gates, stationary/weekly/story encounters and roamers
- [x] Distinguish verified no-fixed-wild areas from missing data (16 groups)
- [x] Keep data game-scoped and share extraction rules with the route generator
- [x] Preserve audited route data and all Safari Zone records unchanged
- [x] Record [full source evidence and coverage](docs/atlas-encounter-audit.md)
- [x] Complete automated checks and phone/desktop visual review (53 checks)
- [x] User accepted the published v0.25.42 outcome
- [ ] Independent in-game validation remains distinct from automated/reference checks

Next: verified map expansion and floor navigation. Structured gift/egg/trade,
item and Trainer reference details are milestone 3, not wild encounter gaps.
Safari Zone data/mechanics and simulator remain milestones 4/5.


## Maps and floor navigation — v0.25.43

- [x] Cover all 69 existing non-Safari locations with 150 labelled map/area views
- [x] Verify 148 unique PNGs, pinned archive layers and 33 direct source originals
- [x] Add game-scoped lookup, floor/area selection, full-size/source updates and recovery
- [x] Apply archive-host network change and verify actual HTTPS access
- [x] Pass complete coverage and all 58 automated checks, including Reader/Planner regressions
- [x] Review original images and mobile/desktop floor controls
- [x] User accepted the published v0.25.43 outcome

Publication follows the existing GitHub Pages workflow; verify the live version and
artifact hashes before reporting deployment. See [coverage and evidence](docs/atlas-map-expansion.md).
Next: structured location reference details (milestone 3); Safari Zone remains separate.


## Structured location reference — v0.25.44

- [x] Account for all 69 existing non-Safari locations with explicit game-scoped records
- [x] Add item locations, hidden pickups, Apricorns, TMs/HMs and named/conditional rewards
- [x] Add fixed gifts, Eggs, trades and SoulSilver prize Pokémon with eligibility conditions
- [x] Add local playable trainer parties/variants and distinguish allies and facility pools
- [x] Add NPC services and HGSS shop/exchange stock, including weekday/unlock restrictions
- [x] Preserve existing route corrections, encounters, maps and Safari Zone data
- [x] Record references, primary discrepancy resolutions and per-location coverage
- [x] Pass 64 checks, including mobile/desktop UI and Reader/Planner regressions
- [x] User accepted the published v0.25.44 outcome

See [coverage, evidence and limitations](docs/atlas-location-details.md). Publish via
the existing Pages workflow and verify live release files before reporting deployment.
Next after user validation: Safari Zone data/mechanics, followed by its simulator.


## Updated Atlas/Safari tracks — 2026-10-15

Safari Zone reference, progression switches and calculator will have their own
chat and development track. Planned integration: north from Safari Zone Gate,
direct tool access, and return to Atlas at the Gate. Separate Regional/National
Pokédex and Baoba progression controls must reflect verified game unlocks.
Safari work does not block the Atlas feature/visual work. No Safari extraction,
mechanics changes, standalone tool or simulator is included in the EV finder.

## EV training finder — v0.25.45

- [x] Extract the pinned Generation IV base EV yields for all 493 species
- [x] Score complete ordinary encounter tables by in-game time, floor/area and method
- [x] Prioritize Surfing; show useful encounter percentages and expected base EV yield
- [x] Default to 100% clean tables and expose mixed/unwanted encounters on request
- [x] Add stat/time/method controls, requirements, species levels/yields and pagination
- [x] Open exact Atlas destinations and preserve finder controls on return
- [x] Pass all 72 source, browser/mobile and Reader/Planner regression checks
- [x] User accepted the published EV finder

The first release uses base yields, with no held-item/Pokérus calculator or
progression filter. See [mechanics and validation](docs/atlas-ev-training.md).

## Atlas encounter sections — v0.25.46

- [x] User accepted the EV training finder (v0.25.45)
- [x] Separate walking encounters into collapsible Morning / Day / Night views
- [x] Separate Surfing, Fishing, Headbutt and other encounter methods
- [x] Retain all source records, floor/area labels, probabilities and conditions
- [x] Keep current encounter placement; layout decisions are the next visual step
- [x] Pass all 73 checks and review mobile/desktop presentation
- [ ] User acceptance of the published outcome

## Region and tool landings — v0.25.47

- [x] Region cards ordered by debut generation, with only Johto/SoulSilver enabled
- [x] Johto landing with summary, Navigation, EV Training and planned Safari entry
- [x] Compact Navigation header with direct links and browser history retained
- [x] Move walking clock ranges into section titles; remove repeated walking-row times
- [x] Keep legendary/roaming requirements inside their dedicated encounter disclosure
- [x] Preserve other contextual encounter notes without repeating tool-wide prose
- [x] Keep all game datasets unchanged and verify all 74 tests plus mobile/desktop views
- [ ] User acceptance of the published outcome

Other region cards are placeholders, not implemented games or complete regional
coverage. Safari remains a separate project. Further Atlas placement/visual choices
will follow user review of these landings.

## Shared application menu and themes — Atlas v0.25.48

- [x] Share one menu implementation between Reader, Team Planner and Atlas
- [x] Preserve Reader's Load Save reset and link other tools to Reader Overview
- [x] Reuse the saved theme across all tools and synchronise open tabs
- [x] Theme Atlas and Planner surfaces, controls and text in light/dark palettes
- [x] Keep region selection in two generation-ordered columns, including phones
- [x] Pass 75 automated checks and review light/dark phone/desktop screenshots
- [ ] User outcome acceptance on the existing Pages site

No encounter, map, reference, EV or Safari datasets change in this milestone.

## Compact Atlas navigation — v0.25.49

- [x] Remove game names from region cards and shorten the Johto shortcut
- [x] Order Johto feature cards Navigation, Safari, EV Training
- [x] Collapse Navigation search/type controls and location count by default
- [x] Preserve route travel, search results, themes and Reader/Planner behaviour
- [x] Validate 76 automated checks, including phone/desktop navigation
- [ ] User outcome acceptance on the existing Pages site

## Atlas location presentation cleanup — v0.25.50

- [x] Remove repeated summary and Access & progression blocks across all locations
- [x] Remove duplicate map captions while preserving accessible names and floor controls
- [x] Preserve game data, searchable access notes, references and encounter conditions
- [ ] User outcome acceptance on the existing Pages site

## Atlas compass navigation — v0.25.51

- [x] Reserve north/west/east/south slots around the map, including empty directions
- [x] Use theme-aware arrow backgrounds and destination-only button text
- [x] Keep accessible direction labels, floor navigation and other connections
- [x] Place floor controls above the compass to keep side buttons aligned with the map
- [ ] User outcome acceptance of the compass layout

HM travel indicators are a separate verified connection-data task.


## Team Planner save EV refresh — v0.25.52

Reader shares a minimal EV snapshot with Planner in session storage for the current
tab. Planner also accepts SoulSilver saves directly. Matching party/PC Pokémon,
including earlier evolutions and excluding eggs, show all current EVs, totals,
remaining target values and automatic completion. Duplicate matches require a
selection; unmatched members retain manual progress. Planned targets stay fixed.
Invalid Planner uploads preserve previous values. Raw saves are never persisted
or uploaded. Reload the latest save after training.

All 78 automated checks pass, including Reader/Atlas/Planner regressions and
EV snapshot refresh, duplicate selection and invalid replacement. Publication
pending; real-save and user validation pending.

## Non-Safari integrated audit — 20 October 2026

- [x] Audit current v0.25.66 and account for all 69 scoped locations
- [x] Reproduce encounters, EV yields and the full map catalogue unchanged
- [x] Refresh 162 reference pages and compare applicable source content/rows
- [x] Match all 365 fixed/combined trainer rosters to primary species/levels
- [x] Pass 150 tests and verify live Atlas runtime/data files against the checkout
- [x] Record [evidence and remaining coverage limits](docs/atlas-integrated-audit-2026-10-20.md)
- [ ] Full SoulSilver final audit after Kanto and the separately developed Safari project

No application/data defect was confirmed by this pass. Building interior maps,
travel HM/story indicators and deeper battle/progression features remain explicit
scope choices; this audit does not claim those are implemented.

## Johto interior maps and travel conditions — v0.25.67

- [x] Add all eight Johto Gym maps and available verified named/shared interiors
- [x] Label references, regional Game Corner differences and shared room evidence
- [x] Expand the catalogue to 192 views / 175 assets with 42 new choices
- [x] Add directed HM/story/path annotations for all 154 non-Safari connections
- [x] Distinguish passage, through-route, alternate path and optional exploration
- [x] Preserve fixed compass slots, accessible text and unrestricted reference navigation
- [x] Pass 154 tests and review phone/desktop screenshots
- [x] Account for remaining building interiors with verified artwork or labelled primary terrain plans (v0.25.68; see below)
- [ ] User outcome acceptance on the existing Pages site

See [explicit remaining artwork gaps](docs/atlas-johto-interiors-travel.md).
Kanto, Safari data/mechanics and deeper battle/progression features are excluded.

## Remaining Johto building references — v0.25.68

- [x] Census all 208 candidate geographic interior headers in the existing scope:
  173 assigned room references and 35 explained exclusions.
- [x] Supply Kurt’s house, Pharmacy, Dance Theater and the other 100 missing room
  choices using labelled, reproducible static game-data terrain plans.
- [x] Keep existing rendered artwork, sources, floor selectors, compass travel and
  encounter data; catalogue is 295 views / 278 PNG assets.
- [x] Record primary inputs, checksums, tile grids and exits; distinguish diagrams
  from screenshots and complete movement simulations.
- [ ] User acceptance of the published room-reference choices.

The v0.25.67 missing-room inventory is resolved for reference coverage. High-detail
rendered artwork can still replace a labelled plan later if verified artwork
becomes available. Kanto expansion, Safari and deeper battle/progression features
remain separate. See [coverage and limitations](docs/atlas-johto-interior-completion.md).

## Whirl Islands stair connections — v0.25.69

- [x] Pair all six entrance/B1F ladders against primary game warps, including both
  adjacent B1F event tiles per ladder.
- [x] Add matching A–F markers and touch-friendly text links to the existing maps.
- [x] Follow links in both directions and highlight/focus the destination.
- [x] Keep markers in a full-size scrollable viewer with theme and keyboard support.
- [x] Preserve original map bytes, floor choices, compass and encounter tables.
- [x] Pass 161 tests and review phone/desktop layouts in both themes.
- [ ] User outcome acceptance of the published stair-link overlay.

This covers the requested four entrance maps ↔ B1F connections; B2F/deeper paths,
Safari and Kanto expansion remain separate. See [evidence and scope](docs/whirl-islands-stair-links.md).

## More cave links and mobile travel help — v0.25.70

- [x] Verify and add all 50 paired map-changing stairs/passages across the ten
  additional scoped caves; retain the accepted six Whirl pairs.
- [x] Cover unmapped connector/entrance rooms with four labelled terrain plans.
- [x] Preserve original map bytes/order, floor selectors, compass and encounters.
- [x] Make travel symbols open/highlight their requirement entry on touch while
  destination names continue to navigate; retain keyboard/disclosure access.
- [x] Keep Close map visible while scrolling the full-size viewer.
- [x] Pass 166 tests, review phone/desktop layouts and reproduce all map assets.
- [ ] User outcome acceptance on the existing Pages site.

The [coverage ledger and scope](docs/cave-map-links.md) distinguish paired stairs
from in-floor steps, one-way drops and puzzles. Towers, Whirl’s lower-floor
extension, Safari and new Kanto locations remain separate.
