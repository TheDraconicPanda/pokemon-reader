# SoulSilver Team Planner

A standalone, plain HTML/CSS/JavaScript feature hosted inside the Pokémon Reader repository at `/team-planner/`.

- Does not depend on or change the save-file reader's JavaScript.
- Tracks party readiness, final move goals, exploration HMs, EV targets, and optional postgame candidates.
- Saves progress to browser local storage.
- Supports JSON export/import for backup or moving progress to another browser.
- Reads SoulSilver saves locally to refresh EVs; never uploads or modifies them.
- Reuses the Reader EV snapshot in the current tab, or accepts a save in EV training.
- Matches evolution families in party/PC; duplicate matches require selection.
- Shows all current EVs and remaining targets; unmatched Pokémon keep manual progress.

## Open

On GitHub Pages: `https://thedraconicpanda.github.io/pokemon-reader/team-planner/`

The page links back to the existing Pokémon Reader. A link from the main landing page can be added as a small navigation enhancement after the feature is verified.

## Notes

The tracker deliberately marks Typhlosion's fourth move and Machamp's fourth move as undecided because those slots were not finalized in planning. It does not silently turn tentative suggestions into locked decisions.
