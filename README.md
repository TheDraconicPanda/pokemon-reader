# Pokémon Reader

A personal, browser-based tool for reading Pokémon game save files and exposing information that is normally hidden from the player.

## Current target

The first supported game is **Pokémon SoulSilver**.

The application is intended to process save files locally in the browser whenever practical, without requiring them to be uploaded to a server.

## Planned features

- SoulSilver save-file detection and validation
- Save and trainer information
- Party Pokémon information
- PC box Pokémon information
- Detailed Pokémon data and hidden values
- A custom PokéEarth-style game world reference
- Support for additional Pokémon games after SoulSilver is complete

## Development approach

The project starts with plain HTML, CSS, and JavaScript. Features will be implemented incrementally and verified against real save data before expanding the scope.

See [ROADMAP.md](ROADMAP.md) for the development plan.

## Run and test locally

Use Node.js 22 or later:

```sh
npm ci
npm run dev
```

Open the address printed by the server, then visit `pokedex-earth/` for the Atlas.
No build step is needed. Save files are selected in the browser; do not commit personal saves.

Run `npm test` for the Atlas browser regression checks. Tests require Chromium on
your PATH, or `CHROMIUM_PATH` set to its executable. They launch their own temporary
server and browser, test every existing connection button plus search/filter
behavior, Reader invalid-save handling, and Planner persistence/tabs, and clean up afterward. They do not verify game data or real-save parsing.

## Development and online validation

Implement focused milestones on feature branches in the cloud environment. Test
the changed feature and relevant Reader, Planner, and Atlas regressions before
committing, integrating, and pushing to the existing GitHub repository. The user
has authorized publishing completed, validated milestones without another approval
checkpoint. Keep unfinished work off the deployment branch.

Use the existing GitHub Pages site for user testing. Report the version, changes,
automated checks, deployment status, and what to try online. User acceptance is
pending until they test when available; a successful push alone does not prove the
new version is live. No separate preview host or repository is required.

## Current Atlas checkpoint

**v0.25.27:** connection navigation fixes and browser regression checks. The Atlas
contains 58 location entries and all Johto Routes 29–48, but static content and
reference audits remain incomplete. Safari data includes walking records in all
12 areas and block records in 11; encounter accuracy is still under review.

See the [Atlas assessment and coverage checklist](docs/atlas-assessment.md) for
the full location inventory, known gaps, validation results, and review steps.

## Versioning

During development, the application uses the format **0.<phase>.<iteration>**:

- The first number stays at `0` until the project reaches its first stable release.
- The second number identifies the current development phase from [ROADMAP.md](ROADMAP.md).
- The third number identifies a meaningful application iteration within that phase.

The iteration number is intended to make deployed builds easy to identify while testing. Documentation-only changes do not require an application version change.
