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

## Versioning

During development, the application uses the format **0.<phase>.<iteration>**:

- The first number stays at `0` until the project reaches its first stable release.
- The second number identifies the current development phase from [ROADMAP.md](ROADMAP.md).
- The third number identifies a meaningful application iteration within that phase.

The iteration number is intended to make deployed builds easy to identify while testing. Documentation-only changes do not require an application version change.
