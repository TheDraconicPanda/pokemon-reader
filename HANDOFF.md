# Pokémon Reader — Shared Handoff

This file is the shared working notebook for ChatGPT and Codex. Keep it concise, factual, and current so either agent can resume work without rediscovering project context.

## Working agreement

### General rules for all agents
- Read `AGENTS.md` and this file before starting a substantial task.
- Treat the repository's existing implementation and conventions as the source of truth. Inspect relevant code before proposing or changing architecture.
- Work in small, finite, clearly scoped increments. Avoid unrelated refactors, speculative improvements, and unnecessary file churn.
- Preserve existing UI colors, visual identity, and established interaction patterns unless the user explicitly requests a change. In particular, the user likes the current Pokémon Reader colors; do not change them as part of unrelated work.
- Protect save-file integrity. Never silently change a source save's extension, format, or contents beyond the explicitly requested operation. Preserve originals and make modified outputs explicit.
- Do not invent game data or compatibility rules. Verify against project data or reliable references and document uncertainty.
- Keep generated assets, service-worker manifests, and offline caches synchronized whenever their source files change; use the repository's established scripts rather than hand-editing generated output.
- Run the narrowest relevant automated checks. Report what was actually run and distinguish verified results from assumptions or work not performed.
- Do not merge pull requests unless the user explicitly asks. Leave reviewable changes in a branch/PR and report its URL.
- Do not ask the user to repeat information already recorded here or in project documentation. Ask only when a missing decision materially blocks safe progress.

### Codex-specific guidelines
- Use this file as the handoff point for work delegated by the user or ChatGPT. Read the current task section before acting.
- Do not spend tokens rediscovering project purpose, repository structure, decisions, or prior work already documented here. Inspect only the files needed for the assigned task.
- Follow the task scope literally. Do not expand into desktop validation, broad refactoring, unrelated bug hunts, or extra features unless requested or a blocking defect requires it.
- Before editing, identify the exact files and behavior in scope. Prefer the smallest safe patch.
- After completing work, update the relevant task entry below with: files changed, commands/tests run and results, manual validation performed and device/orientation, issues found, and remaining work.
- If a new finding changes an existing decision, explain the evidence and update the decision rather than silently contradicting it.
- Avoid duplicating ChatGPT's implementation. Check the active PR and branch before changing files; build on the existing work.
- Never claim a test or device check passed unless it was actually executed.

## Project context
- Repository: https://github.com/TheDraconicPanda/pokemon-reader
- Live site: https://thedraconicpanda.github.io/pokemon-reader/
- Default branch: `main`
- Project purpose: browser-based Pokémon save reader and companion suite, including Reader, Team Planner, Atlas, Pokédex, Trade, Safari tools, and the browser emulator.
- `AGENTS.md` contains the detailed agent/development instructions. `ROADMAP.md` contains broader project milestones.
- The user prefers finite, purposeful tasks and efficient use of Codex. Delegate to Codex for work requiring the local development environment, builds, automated tests, emulator runtime internals, or physical-device validation. ChatGPT can handle bounded repository inspection, documentation, and supported GitHub edits directly.
- The user primarily wants mobile validation for the current emulator work. Do not add desktop manual testing unless specifically requested.

## Active work

### PR #9 — Emulator 0.2: immersive gameplay UI
- PR: https://github.com/TheDraconicPanda/pokemon-reader/pull/9
- Branch: `emulator-0.2-immersive-ui`
- Base: `main`
- Status at handoff creation: open, draft, not merged.
- Latest known head: `9b495acbe2c01950a6cd34682293e26bb785fbd6`
- ChatGPT implemented UI-only changes in:
  - `browser-emulator/index.html`: shared suite navigation; Pause moved into the handheld control row beside Quick Save.
  - `browser-emulator/style.css`: shared navigation integration and immersive full-screen gameplay layout, retaining the existing green emulator palette.
- No emulator worker, cartridge save, checkpoint, or persistence logic was intentionally changed by ChatGPT.
- PR description contains the task list and remains the authoritative scope for this task.

#### Codex follow-up — complete only these items
1. Regenerate offline assets and the service worker so updated HTML/CSS are included in the installed PWA. Use the repository's existing preparation script/process.
2. Run the existing automated regression suite.
3. Validate on an iPhone only, in portrait and landscape.
4. Verify touch controls, Pause and return-to-menu behavior, Quick Save, and save/checkpoint persistence.
5. Report results, exact tests/commands run, device/orientation checks actually performed, and any remaining issues.

**Explicit exclusions:** no desktop manual validation; no unrelated refactoring or feature work; do not change the existing colors; do not merge PR #9. If a blocking defect is found, make the smallest relevant fix on the PR branch and document why it was necessary. If validation requires the user's device or action, provide concise steps rather than claiming it was tested.

#### Codex completion report
- Status: pending.
- Files changed: pending.
- Offline asset/service-worker regeneration: pending.
- Automated tests: pending.
- iPhone portrait validation: pending.
- iPhone landscape validation: pending.
- Persistence checks: pending.
- Outstanding issues: pending.

## Handoff update format
For each new task, add a short section under **Active work** with:
- Goal and scope
- Relevant branch/PR and status
- Decisions/constraints
- Work performed
- Validation and results
- Remaining work / next owner

When a task is complete and no longer active, move its concise outcome into a **Completed work** section rather than leaving stale pending instructions active.
