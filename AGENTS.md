# AGENTS.md — Pokémon Reader project instructions

## Project purpose

This repository contains Pokémon Reader, a personal browser-based tool for reading Pokémon save files and providing a game-world reference. The first target game is Pokémon SoulSilver. The production site is https://thedraconicpanda.github.io/pokemon-reader/.

Treat the existing repository as the source of truth. Inspect the current code, README.md, ROADMAP.md, Git status, and existing tests before making changes. Historical notes in this file are context, not proof that a feature is currently complete.

## Core development rule: finish a phase before advancing

Implement one feature or phase end to end before beginning the next. Do not leave required functionality, data coverage, auditing, or testing for “later” merely to show progress.

A phase is complete only when:
- Its agreed requirements and acceptance criteria are implemented.
- Required routes, records, encounter methods, and edge cases are covered.
- Game-specific data and mechanics have been checked against reliable references.
- Relevant automated checks pass and regressions are resolved.
- The actual feature has been published to the existing site for user validation.
- Any required manual testing is completed, or clearly identified as a remaining blocker.
- Documentation and the roadmap accurately reflect the state of the work.

Prefer correctness and completeness over visual polish. Do not guess at game data or mechanics. Investigate discrepancies, document uncertainty, and resolve it before declaring the relevant feature complete. Keep changes focused and avoid unnecessary dependencies or unrelated refactoring.

## Git workflow: validate, publish, then user test

- Never implement directly on `main`. Inspect status and preserve existing changes before editing.
- Use a dedicated feature branch in the existing isolated checkout; do not create a worktree unless explicitly requested.
- Complete the agreed milestone, inspect the diff, and run meaningful automated checks before publication. Check the changed feature and relevant regressions in Reader, Team Planner, and Atlas. Report missing real-save validation accurately.
- Standing user authorization (2026-10-14): after a milestone is developed and validated, commit it, integrate it into the existing deployment branch, and push to GitHub so the existing Pages workflow can publish it. No additional routine approval is required for these steps. Do not publish unfinished or failing work.
- Reconfirmed by the user on 2026-10-21: changes requested to `TheDraconicPanda/pokemon-reader` authorize commits, pushes and GitHub deployment without additional routine approval.
- Fetch the deployment branch before integration, preserve remote changes, and use normal non-force pushes. Respect branch protections; report any concrete blocker.
- Keep the existing repository and GitHub Pages site. Do not introduce separate preview hosting, repositories, or ZIP-based review as the normal workflow.
- After pushing, tell the user what changed, which checks passed, the version, deployment status, and the existing URLs to test. A pushed commit is not proof the deployment is live.
- The user validates the outcome online when available; they are not expected to review code. Keep user acceptance and real-game validation distinct from automated checks and do not mark a phase fully accepted before required validation finishes.

## Atlas roadmap and required order

The Atlas is a PokéEarth-inspired world reference for SoulSilver. The user revised the required order on 2026-10-15; this supersedes the earlier Safari-first order:

1. **Complete and audit encounters across the existing Atlas, excluding Safari Zone itself.** Cover every existing non-Safari location, including towns, routes, caves, floors, method/time/version conditions, stationary encounters and applicable special encounter systems. Check SoulSilver-specific data against Serebii, Bulbapedia and reliable primary evidence. Explicitly distinguish verified absence of wild encounters from missing data. Safari Zone Gate remains a normal location in this pass; Safari Zone's 12-area data/mechanics remain untouched.
2. **Expand maps.** Add verified remaining outdoor maps and dungeon floors, with floor navigation where appropriate.
3. **Complete location reference details.** Add structured items, TMs/HMs, gifts, trades, trainers and relevant conditions beyond static summaries. Existing route details remain supported.
4. **Complete Safari Zone mechanics and data.** Audit all 12 areas, methods, levels, times, rates, blocks and area aging. Share validated data between Atlas and simulator.
5. **Build and audit the separate Safari Zone simulator.** Use `safari-zone/index.html` unless a better compatible path is established, link it from Atlas, and verify actual rules and known game examples end to end.
6. **Add Kanto for full SoulSilver coverage.** Retain the existing border/endgame locations while expanding the second region.
7. **Run the final integrated audit.** Verify accuracy, navigation, mobile usability and Reader/Planner regressions across the complete result.

Subsequent user steering (2026-10-15): the published encounters, maps and structured
location-reference milestones were accepted. Safari is to have its own chat and
development track, with eventual Atlas entry/return through Safari Zone Gate and
direct tool access; it must not block the remaining Atlas features or visual work.
The current authorized Atlas milestone is an EV training finder: choose a stat,
prioritize Surfing and 100%-useful encounter tables, show species EV yields,
unwanted EVs and access conditions, and open the location directly in Atlas.
Safari is excluded from this finder. Base yields come from Generation IV data;
held-item/Pokérus calculators are later work, not part of this first version.

Complete each agreed milestone before advancing. Publish validated milestones to the existing site for user outcome testing. Keep SoulSilver data/rules explicitly game-scoped and shared presentation separate, so future games do not silently inherit its locations, encounters or mechanics. Do not implement another game's support or refactor unrelated save logic as part of this work.

Historical checkpoint from project planning: Atlas v0.25.16 was reported to have Safari Zone walking coverage complete, with water/fishing encounters and block-attraction requirements still pending; a later audit and simulator were planned, browser testing had not yet been completed, and some encounter levels still needed verification. Treat this as a lead to investigate, not as current verified repository state.

## Save reader and regression awareness

Existing/historically implemented areas include the HTML/CSS/JavaScript foundation, SoulSilver save detection, save/trainer information, party Pokémon details, moves and held items, and Pokédex information. Preserve working functionality while developing the Atlas.

Historical bug reports include nature mapping, ability and held-item display, move PP versus PP Up display, Pokédex seen/caught/owned discrepancies, evolved Pokémon and daycare/traded Pokémon classification. These reports are context, not a request to interrupt unrelated Atlas work. Maintain or consult a bug list, fix issues when relevant to the current task or when a regression is found, and avoid repeatedly retesting completed areas without a reason.

## Versioning and documentation

The README defines the application version as `0.<phase>.<iteration>`:
- The first number remains `0` before a stable release.
- The middle number identifies the development phase.
- The final number identifies a meaningful application iteration within that phase.

Inspect existing metadata and follow the repository's established convention. Keep the visible application title/version and any other version metadata consistent when application code changes. Documentation-only changes do not require an application version bump. Keep README.md and ROADMAP.md accurate; mark work complete only when the completion criteria above are met.

## Collaboration and reporting

### iPhone emulator planning and authorization (2026-10-27)

The agreed native iPhone emulator v1 scope, finite milestone IDs E1–E5, acceptance
criteria and delivery rules are in `docs/iphone-emulator-v1-plan.md`. This is a
separate development track from LeafGreen and Atlas work. Implement only the
requested milestone; preserve the existing website. Native app delivery requires
a real iOS build/install route, not a Pages deployment. Device/performance tests
cannot be claimed from simulator tests or successful compilation.

The user authorizes project-related investigation, commands and Git operations
without routine conversational approval. Clarified explicitly: any files inside
the project repository, including new source files and build output, may be
created or modified. Commands that write outside the repository or the user's
Google Drive folder require approval first. The Drive folder path is not known;
do not infer it. Keep scratch files in repository-local `work/`; redirect caches,
temporary output and tool state locally where supported. External toolchain,
cache or signing-file writes need a bounded approval before the command runs.
Follow normal non-force Git workflow and preserve user changes. Runtime/platform
approval requirements still apply; report actual blockers and their source.

User device: iPhone 16 Plus; iOS version and Mac/signing access still unknown.
melonDS is the initial candidate, pending measured performance/battery evidence.
v1 includes normal-speed play, durable game saves, manual states, automatic
recovery and Reader integration from completed in-game saves. Blanket emulator
fast-forward is excluded; granular acceleration belongs to the separate ROM
project. Live Reader memory access, desktop/browser/GBA emulation and cloud sync
are future work. Never promise zero progress loss after an abrupt termination.

LeafGreen expansion authorization (2026-10-25): the user authorizes commands for
project research and validation, and all Git repository actions. Proceed with
routine work without additional user confirmation. Ask about material
implementation choices. If a platform approval is still required, first summarize
what the command/action will do. The agreed expansion matches Platinum through
complete milestones and initially targets original English LeafGreen. The user
approved confirming LeafGreen once per Adventure Profile because FRLG saves lack
a reliable host-version field. Preserve existing work and use non-force Git
integration/publication under the established workflow.

The user prefers small, manageable milestones but expects each feature to be fully implemented before the next begins. Once a task is sufficiently specified, make routine technical decisions independently. Ask questions when a decision materially affects scope, architecture, user experience, or correctness, and do not ask again for decisions already documented in the repository or project context.

At meaningful checkpoints, report:
- What was completed.
- What tests/checks were run and their results.
- What remains before the current phase is complete.
- The existing site links, deployed version/status, and what to test online.
- Any remaining user validation or concrete blocker.

## First task when resuming work

Before feature implementation, inspect the current Git state, README.md, ROADMAP.md, project instructions, Atlas routes/locations, Safari Zone implementation, and available tests. Report a concise status separating verified completed work, incomplete work, defects, and future work. Then identify the next focused milestone with explicit acceptance criteria and begin it on a feature branch. Do not rewrite existing code or advance phases based on assumptions.


## Atlas navigation presentation (2026-10-16)

The root Atlas URL opens the region landing, ordered by region debut generation
(Kanto, Johto, Hoenn, Sinnoh, Unova, Kalos, Alola). Only Johto/SoulSilver is enabled;
future region/game cards must not fall back to its dataset. The Johto landing owns
the summary and feature cards (Navigation, EV Training, future Safari). Keep
Navigation compact; general introductions do not belong above each route.
Preserve `#atlas`, `#ev-training` and `#location=...` direct links. Clock ranges live
in walking section titles; legendary requirements and contextual notes remain
inside relevant disclosures. Do not remove conditions or alter game data for a
presentation change. Safari remains its own development track.

## Shared application shell

Reader, Team Planner and Atlas use `<app-menu tool="reader|planner|atlas">` from
`js/app-shell.js` and shared theme/menu styling in `css/app-shell.css`. Keep this
one implementation; do not duplicate tool menus or add per-tool theme storage.
Load the shell script in the head so Reader's existing Load Save listener can
attach to its button. Preserve `pokemon-reader-theme`, pre-render theme selection,
cross-tab updates, and Reader's reset behaviour. Other tools link Load Save to
Reader `#overview`. Region selection must stay two columns even at 320px.

Atlas v0.25.49: region cards omit game names; Johto feature cards are ordered
Navigation, Safari, EV Training. Navigation search/type controls and location
count live inside the closed-by-default Search locations disclosure. Route
connections remain the primary travel controls outside that disclosure.

Atlas v0.25.50: location cards omit the repeated region/summary line, the separate
Access & progression block, and map location-name captions. Keep Landmarks &
features, accessible map labels, floor controls, reference/encounter conditions,
and the underlying searchable summary/access data.

Atlas v0.25.51 reserves all four compass slots around the map, with decorative
arrows behind destination-only buttons. Retain directional accessible labels.
Keep floor controls above the compass and unclassified links under Other
connections. Do not infer HM requirements from compass direction or map imagery.

The 2026-10-20 non-Safari audit and its evidence are recorded in
`docs/atlas-integrated-audit-2026-10-20.md` and the companion JSON ledger. It audits
v0.25.66's existing scope; it does not certify full Kanto, every building interior,
per-connection HM/story gates, complete battle mechanics or Safari content.

Atlas v0.25.67 adds verified Johto Gym/named/shared interior choices; the catalogue
has 192 views / 175 assets. Keep `kind`/`notice` metadata and interior-vs-location
context visible. Remaining rooms without verified released-HGSS artwork are listed
in `docs/atlas-johto-interiors-travel.md`; do not claim every interior is complete.
Directed HM/story/path rules live in `games/soulsilver/travel.js`, selected by
`atlas-travel.js`. Preserve distinctions between passage, through-route,
alternative and optional use; do not turn annotations into saved-progression
locks. Safari links/data and new Kanto coverage are outside this milestone.

Atlas v0.25.68 closes the scoped building-reference inventory with 103 explicitly
labelled `kind: terrain-plan` choices, not rendered screenshots or full movement
maps. Catalogue: 295 views / 278 assets. `scripts/soulsilver-interior-rooms.json`
accounts for 208 primary INTERIOR headers (173 room assignments / 35 exclusions).
`build-soulsilver-interiors.py` reproduces plans from the pinned clean HGSS primary
revision, terrain attributes at offset 0x14, and event warps; the regular map build
verifies `generated_sha256`. Keep the game-data caveat, source links and
interior-vs-location note; unflagged tiles are not guaranteed walkable because
objects, height and scripts also matter. See `docs/atlas-johto-interior-completion.md`
and its coverage ledger. No new Kanto locations or Safari area content is included;
user visual acceptance and real-game validation remain separate from automation.

Atlas v0.25.69 adds Whirl Islands A–F ladder overlays for the six 1F/B1F pairs.
Game data is in `games/soulsilver/map-links.js`, selected via `atlas-map-links.js`;
the renderer is `js/atlas-map-links.js`. Keep original PNGs/credits intact and align
markers with object-fit's actual painted rectangle, not its letterboxed element.
The full-size dialog retains interactive letters, map selection, panning to the
arrival, accessible text links, Escape/close and focus return. Two adjacent B1F
warp tiles represent one ladder. B1F/B2F stairs and cave exits have no A–F labels.
Evidence/primary indices and image hashes: `docs/whirl-islands-stair-links.json`.
Do not infer a walkable whole-floor route or override HM/story requirements from
these paired links. Other locations/games must not inherit Whirl's connections.

Atlas v0.25.70 adds 50 verified paired map-changing stairs/passages in ten other
caves (56 pairs / 11 locations including accepted Whirl). Explicit recipe:
`scripts/soulsilver-cave-links.json`; build with `build-cave-links.py` against the
pinned clean HGSS checkout, then the regular map builder. Four supplementary plans
bring the catalogue to 299 views / 282 PNGs. Interior/cave generators own separate
ID prefixes and preserve view order. Source evidence/crops/warp indices:
`docs/cave-map-links.json`. Assign displayed floor per endpoint: Cliff Cave shares
one header across floors; Union has separate connector/exit rooms inside existing
primary scenes. Do not infer floor or pixel positions from header names alone.
In-floor steps, scripted one-way falls and puzzles are not reversible warp pairs;
Embedded Tower variants are not connected floors. Existing Whirl lower-floor,
tower, Safari and Kanto expansion scopes remain separate.
Travel badge strips now open/focus the exact entry in Travel conditions on pointer
activation, stopping propagation to the navigation button; names still navigate.
Keep the existing native disclosure/aria descriptions for keyboard/screen-reader
access and avoid nested interactive controls. The full-size map header is sticky
so Close map stays reachable after panning to deeper room markers.

Atlas v0.25.71 adds 27 reciprocal pairs in the three towers/lower Whirl Islands
and nine script-driven one-way holes in Ice Path/Victory Road. Recipe/generator:
`soulsilver-dungeon-links.json` / `build-dungeon-links.py`; evidence:
`docs/dungeon-map-links.json`. The game adapter merges this extension with existing
cave data, preserving Whirl A–F and old cave pairs. Runtime `pairs` can now contain
`oneWay: true`; end 0 is departure and end 1 is landing-only. Never offer reverse
travel from that landing. Same-map pairs use endpoint-specific internal focus
keys but display the shared letter and endpoint side names. Keep all current
images, credits, floor choices and game scoping. The pinned primary verifies
complete internal warps and explicit coordinate-trigger/script hole destinations;
ordinary ledges, ice/boulder puzzles and story events are not fabricated stairs.

Johto Atlas v0.25.72 closes the agreed current reference/navigation/EV milestone.
See `docs/atlas-johto-completion.md` and its ledger; the static inventory is
reproducible with `scripts/audit-johto-atlas.mjs`. Earlier notes about missing room
references and per-edge travel indicators are superseded by v0.25.67–71. Keep
Safari and new Kanto/Sinjoh work separate. Completion means the documented scope,
not automatic progression filtering, complete battle simulation or a new in-game
playthrough. Full-size arrival panning must scroll only the image pane; do not
restore `scrollIntoView` on marker arrivals because it moves the containing dialog
and can hide floor controls on phones. User outcome acceptance remains separate.

Safari v1 Milestone 2 (v0.25.76) replaces the legacy 269-row reference with a
339-row catalogue derived from the shared primary slot dataset and Safari engine.
See `docs/safari-mechanics.md`, its source ledger and hand-transcribed fixtures.
Do not restore guide block counts as fixed day gates, expose placeholder water
tables in dry areas, or use ordinary overworld slot weights. Area age is keyed by
identity; replacing an area clears its objects, swapping retains them. Object
unlock group order depends on the full trainer ID. Partial unknown state must
remain unknown. Atlas is still an unfiltered reference; save initialization and
the interactive simulator belong to Milestones 3 and 4.

Safari Milestone 3 (v0.25.77) adds read-only local Safari decoding and the
`safari-zone/` starting-configuration page. Exact evidence and unknown fields are
in `docs/safari-save-initialization.md` and `safari-save-sources.json`. Use the
existing Reader's validated partition and optional canonical snapshot subrecord.
Never use the conflicting PKSM 0xC148 day-counter location, apply wall-clock
elapsed/pending days automatically, or turn unknown linked/entry/Surf/rod/clock
state into progress. Old profiles remain compatible without a database migration.
Starting corrections are manual; proposed changes are hypothetical; original
state is preserved. Scenario edits are session-only and reset on save revision.

Safari Milestone 4 (v0.25.78) adds live starting/proposed tables and target plans.
See `docs/safari-simulator.md`. Plans must pass the shared ten-slot engine,
including base-slot displacement, explicit unknown decoration counts, access,
object groups and capacity. Keep credited waiting separate from calendar time;
preview changes only visit-local state, preserving original/manual baselines.
Recompute targets after edits and reject stale plan signatures. Do not describe
hypothetical eligibility as actual in-game progress. Milestone 5 remains separate.

Safari v1 Milestone 5 (v0.25.79) records the final integrated technical audit in
`docs/safari-v1-release.md` and `safari-v1-audit.json`. Reproduce raw-source and
all-target replay coverage with `scripts/audit-safari-v1.mjs`; its no-source path
runs in `npm test`. Keep object-free encounter dependencies separate from object
unlock identity, and send missing-field recovery to the correct starting/current
edit mode. All 12 areas / 32 methods / 96 times and 153 target species are scoped
to SoulSilver. Preserve explicit limits for tile packing, modified/capture odds,
linked setups, credited clock aging and synthetic save fixtures. Release audit
records are version-specific; never convert a push into proof of live publication
or mark pending user/real-save acceptance complete without evidence.
