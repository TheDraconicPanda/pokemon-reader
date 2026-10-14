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
- The actual feature is available in a practical preview for review.
- Any required manual testing is completed, or clearly identified as a remaining blocker.
- Documentation and the roadmap accurately reflect the state of the work.

Prefer correctness and completeness over visual polish. Do not guess at game data or mechanics. Investigate discrepancies, document uncertainty, and resolve it before declaring the relevant feature complete. Keep changes focused and avoid unnecessary dependencies or unrelated refactoring.

## Git workflow: feature branch and preview before merge

- Never work directly on `main`.
- Before editing, inspect the working tree and preserve all existing user changes. Never discard, reset, or overwrite uncommitted work.
- Create a dedicated feature branch (or isolated worktree) from the appropriate up-to-date base before implementation.
- Implement and test on that branch.
- Do not push, merge to `main`, or deploy without the user's authorization.
- Before asking for approval, inspect the diff and run relevant tests/checks. Explain what changed, what was tested, and any known limitations.
- Provide a practical preview of the running application where possible. For this browser app, prefer the local development server or an appropriate branch preview. A branch alone is not a browser preview. Never claim that something was previewed or tested if it was not.
- Keep the production GitHub Pages deployment unchanged until the user approves integration and deployment.
- Ask for approval at meaningful checkpoints, not for every routine coding choice.

If the environment cannot provide a live browser preview, state that clearly and give the best available alternative and exact local steps.

## Atlas roadmap and required order

The Atlas is a PokéEarth-inspired world reference for SoulSilver. Build and validate it in the following order; do not skip ahead:

1. **Complete static Atlas coverage.** Inspect the current route/location inventory and finish every required route and location with its relevant static information. A page existing does not mean its content is complete.
2. **Audit the static Atlas.** Systematically compare the full scope against established references, including Serebii (https://www.serebii.net/) and Bulbapedia (https://bulbapedia.bulbagarden.net/). Verify route/location names, connections, landmarks, features, and other applicable static facts. Track coverage and discrepancies; correct them before proceeding. Use SoulSilver-specific information for the initial target.
3. **Complete Safari Zone mechanics and data.** Verify and implement all required encounter methods and conditions, including walking, surfing, fishing, block placement/attraction, area-specific species, and any relevant time, duration, level, or other game conditions. Inspect the repository first to establish the real current status. Share validated encounter data between the Atlas and simulator rather than maintaining inconsistent duplicates.
4. **Build the separate Safari Zone simulator.** The intended path is `safari-zone/index.html`, unless the existing architecture indicates a better compatible location. Link to it from the Safari Zone Atlas entry. Implement the agreed simulator functionality using validated data and actual game rules; do not make a merely decorative or incomplete calculator.
5. **Audit the complete Safari Zone experience.** Check the Atlas, encounter data, block mechanics, simulator calculations, and displayed results against reliable references and known game behavior. Resolve discrepancies before advancing.
6. **Proceed to subsequent Atlas features only after the above stages are complete.** Apply the same cycle—scope, full implementation, complete data, reference audit, testing, preview, approval, documentation—to every subsequent feature.

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
- How to preview and manually test the implementation.
- What approval is needed.

## First task when resuming work

Before feature implementation, inspect the current Git state, README.md, ROADMAP.md, project instructions, Atlas routes/locations, Safari Zone implementation, and available tests. Report a concise status separating verified completed work, incomplete work, defects, and future work. Then identify the next focused milestone with explicit acceptance criteria and begin it on a feature branch. Do not rewrite existing code or advance phases based on assumptions.
