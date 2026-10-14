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

Run `npm test` for the Reader, Atlas, and Planner browser regression checks. Tests require Chromium on
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

## Reader dashboard redesign

Reader **v0.25.30** completes the implementation of milestones B–F on the dashboard
foundation. Atlas remains v0.25.27; Team Planner and the binary parser are unchanged.
The user requested one integrated release followed by final user testing.

- Overview: raw-save upload guidance, trainer cards, badge artwork, parsed summaries,
  and interactive summary buttons. Load Save in the top ribbon clears the session
  and returns to the initial upload screen. The upload area is hidden once loaded;
  the old diagnostic Save Information block has been removed.
- Party: six original slots, empty slots, SoulSilver-era sprites, shiny labels,
  Generation IV types, HP bars, status, and held items. Inspect a card by clicking it or using its
  keyboard-accessible Inspect button.
- Details: one modal for Party and PC with Summary, Stats, all four Moves, Training,
  and History. Escape closes it; Tab stays inside; closing restores focus. Existing
  evolution export controls remain available here. PC records do not store current
  HP/battle stats/status; the UI identifies unavailable fields rather than inventing them.
- PC Storage: all 18 boxes and 30 original slots, previous/next buttons, box selector,
  occupancy, and search by nickname/species/number. Search highlights in place and
  provides results that navigate to each original box and slot.
- Pokédex: readable species cards, search and registration/ownership filters, and
  pagination. Regional/national scope comes from the existing parser. Seen, Caught,
  and Currently Owned remain independent; ownership excludes Eggs, Day Care, and
  traded-away Pokémon.
- Collection: all existing summaries, duplicate/caught/missing lists, search, sorting,
  and pagination, with expandable occupancy, gender, and form details. New owned-species and shiny
  individual lists provide destinations for the corresponding summary buttons.

Desktop and mobile use two horizontal ribbons: Load Save/Planner/Atlas/theme at the
top, then Reader views above the companion heading. The Reader ribbon sticks to the
top while scrolling. Mobile retains a compact box selector.
Dark mode is the default, with a locally saved light/dark preference and reduced-motion
support. Uploaded saves are held in memory only. Rapid save replacement clears dialogs
and prevents old asynchronous results from overwriting the current save.

Species metadata and sprites still come from PokéAPI and its public sprite repository.
Only species/item/move identifiers are requested; save contents are never uploaded.
Type badges use PokéAPI historical typing for Generation IV, including species whose
modern type changed to Fairy (see [historical type records](https://github.com/PokeAPI/pokeapi/blob/master/data/v2/csv/pokemon_types_past.csv)).
Metadata requests time out after eight seconds and fall back to explicit unavailable
labels. Binary decoding, ability/item/nature identification, PP/PP Ups, Hidden Power,
regional registration logic, and evolution mechanics remain unchanged.

`npm test` runs 21 browser tests covering Atlas and Planner regressions, Reader
invalid-save handling, routing/themes, synthetic parsed-save rendering/replacement,
six-slot Party order, modal keyboard behavior, PC order/search, registration versus
ownership, collection controls/pagination, metadata outages, theme contrast, loaded layouts at 320/390/768/1440px, reset/reload behavior, sticky ribbons, and
summary destinations. Synthetic fixtures are injected by the test
harness only; they do not validate the real binary parser or game-data accuracy.

For optional screenshot review, create a local output directory and set
`READER_SCREENSHOT_DIR` when running tests. Cloud environments with a proxy CA can
set `CHROMIUM_CA_CERT` to their trusted CA certificate; the test harness imports it
into an isolated temporary Chromium trust database using `certutil`, retaining TLS
verification. Neither variable is required for the normal regression suite.

Final user acceptance and real-save validation remain pending. On the existing
GitHub Pages site, confirm v0.25.30, load a known SoulSilver save, compare trainer,
Party, PC, registrations, and collection counts against the game, then replace the
save and verify every view refreshes. Check both themes, mobile navigation, dialog
scrolling/keyboard controls, PC search, and existing evolution export behavior.
Evolution writing still requires the real-game validation listed in the roadmap.

Overview summary buttons open Party, PC Storage, the unique-species owned list,
individual shiny Pokémon (including Eggs when counted), and Seen/Caught Pokédex
filters. Owned-species browsing includes species outside the currently active
regional Pokédex, matching the existing unique-species statistic. Shiny entries
show their nickname, original Party/box slot, and an Inspect button.
