# Atlas navigation first milestone

Date: 2026-10-15. Baseline: `f83c21d` (fetched `origin/main`). Release: Atlas
v0.25.38. Reader v0.25.37 and Team Planner files remain unchanged from this baseline.

## Assessment

The initial local checkout was two Atlas commits behind the deployment branch.
Fetched releases v0.25.36–37 add 70 static location groups and a reference audit;
these changes were integrated before completing this milestone. The earlier
58-location assessment is historical. Static audit evidence is in
`atlas-static-audit.md` and `atlas-static-audit.json`; encounter and Safari mechanics
completion remains outside this task.

Verified navigation defects: the initial view renders the entire directory,
connections follow long encounter tables, and clicking a connection replaces the
cards without restoring focus or scroll. Button list order communicates no spatial
orientation. Long static information now also precedes navigation in the baseline.

## Scope and acceptance

- Fresh visits show exactly New Bark Town; west is Route 29, east is Route 27.
- Explicit overland compass pairs place links north/top, east/right, south/bottom,
  west/left around the current location. Pair directions describe orientation;
  links do not assert unrestricted bidirectional travel. Existing access notes and
  ledge/story restrictions remain intact.
- Navigation precedes static information and encounters. No map artwork or new
  encounter block/filter is introduced. Interior, multi-entrance cave, and other
  unassigned links remain under Other connections rather than receiving a guessed
  compass direction. Existing adjacency data is unchanged.
- Exact destination selection resets the type filter, focuses the new heading,
  and scrolls to it. Manual substring/alias search and location filters still work;
  clearing search and filters displays all 70 groups.
- Preserve 38 Route 32 and 269 Safari encounter records and all existing connections.
- Keep Reader and Team Planner implementation files unchanged.

Orientation follows the existing audited access notes and Johto route layout,
with explicit pairs rather than automatic coordinates or connection list order.
Reference evidence remains attached to each location and in the existing static
audit. The Ice Path header in the game metadata locates it north of Blackthorn;
compass labels do not model the twists or elevation within routes/caves.
Supplementary source: https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/src/data/map_headers.h
Bulbapedia retrieval in this session returned HTTP 403; existing audited source
evidence was preserved, not represented as a new complete geography audit.

## Validation and publication

`npm test`: 34 passing data/browser checks in this milestone. Full suite, including Reader/Planner regressions, inventory,
all connection clicks, search/filters/aliases, static content/sources, and unchanged
encounter counts. New checks cover fresh-entry/revisit behavior, default east/west
links, Route 29 compass geometry, focus, no horizontal overflow, and navigation
visibility before Safari content at 320/390/768/1440px. Real-save and gameplay
validation are not claimed by these UI checks.

Published commit `2c09073` to `origin/main` using a normal fast-forward push.
The GitHub Pages status API and public-site fetch both returned HTTP 403 from
this environment, so live deployment is unconfirmed. User acceptance remains pending. On the existing
site, confirm Atlas v0.25.38, follow Route 29 west toward Cherrygrove, check the north
branch to Route 46, and search Safari Zone Gate then enter Safari Zone. Confirm
navigation appears before content, with no scroll through encounters needed to
leave. Next candidate: map artwork within the navigation block, encounters below.
