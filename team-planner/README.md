# SoulSilver Team Planner — v0.25.54

Plain HTML/CSS/JavaScript Planner at `/team-planner/`, integrated with optional
Adventure Profiles from Reader. Main team, HM plan and EV training use the same
linked Pokémon and latest decoded save; no second upload is needed in Planner.

Desired moves/natures/evolution/EV targets stay separate from observed progress.
A unique party evolution-family match can be selected automatically. PC-only and
ambiguous matches require selection. Persistent PID/OT identity links follow
party/PC transfers and evolution, and preserve labelled last-known values when a
Pokémon is missing. Without a save, reference plans keep manual checklists.

Supports multiple named planners per adventure, separate adventures, and v1/v2
JSON backup import. Original v1 browser data is retained; migration activates the
latest copy once. Imported backups become separate reference plans and require
explicit adventure association. Export a backup before clearing browser/site data.

Open: https://thedraconicpanda.github.io/pokemon-reader/team-planner/

See [implementation, migration and exact user checks](../docs/planner-integration.md).
The existing undecided fourth moves remain undecided. No save binary is uploaded,
persisted or edited by Planner. Atlas caught indicators are a later milestone.
