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

The user prefers small, manageable milestones but expects each feature to be fully implemented before the next begins. Once a task is sufficiently specified, make routine technical decisions independently. Ask questions when a decision materially affects scope, architecture, user experience, or correctness, and do not ask again for decisions already documented in the repository or project context.

At meaningful checkpoints, report:
- What was completed.
- What tests/checks were run and their results.
- What remains before the current phase is complete.
- The existing site links, deployed version/status, and what to test online.
- Any remaining user validation or concrete blocker.

## First task when resuming work

Before feature implementation, inspect the current Git state, README.md, ROADMAP.md, project instructions, Atlas routes/locations, Safari Zone implementation, and available tests. Report a concise status separating verified completed work, incomplete work, defects, and future work. Then identify the next focused milestone with explicit acceptance criteria and begin it on a feature branch. Do not rewrite existing code or advance phases based on assumptions.
