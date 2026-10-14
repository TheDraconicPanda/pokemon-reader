# Pokémon Reader Roadmap

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
- [ ] Complete static location details and access/landmark coverage for the agreed Atlas inventory
- [ ] Audit every static location against SoulSilver references and record source evidence
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
- [ ] Expand wild encounters to other areas
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

## Reader UI redesign — Atlas development temporarily paused

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
