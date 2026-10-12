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
- [x] Define initial location data model
- [x] Build searchable directory foundation
- [ ] Expand and verify Johto locations
- [x] Add connected-location navigation
- [ ] Routes and areas
- [x] Add first verified wild-encounter dataset (Route 32)
- [x] Add Union Cave wild encounters by floor and method
- [x] Add Route 33 wild encounters by time, Radio, and Headbutt group
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
