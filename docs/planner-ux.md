# Team Planner UX — v0.25.63

The shared menu remains first. Its Settings gear opens a keyboard-contained native
dialog; theme storage and cross-tab synchronization keep their existing shared
implementation. Planner settings include adventure/planner selection, association,
creation, rename, export/import and manual reset. Nested name/reset dialogs retain
their existing behavior. Save/error messages remain visible on the page.

One title and an info hint precede Party, Move goals and EV targets. Six compact
cards use local HGSS sprites for the linked saved species, including earlier
stages; unlinked goals use grey target sprites. Opening a card shows Main team,
its assigned HM plan and its EV training section. Existing aggregate tabs and URL /
keyboard navigation are preserved. Edits retain expanded cards during rerender. Focus is captured at the DOM update,
so background refresh cannot restore a stale control during keyboard navigation.

Ability completion uses the linked individual's current Gen IV ability name;
nature checks use the individual's current nature. With manual progress, ability
is a checkbox and choosing a nature clears that member's other nature checks.
These new manual checklist groups survive reload, export/import and reset alongside
existing progress. Goals remain unchanged.

An empty eligible-family list disables Choose saved Pokémon with “No eligible
Pokémon found” and enables manual checklists. A previously linked identity and its
last-known evidence remain stored, labelled as historical. Returning Pokémon
resume live progress; manual observations never overwrite observed save values.
Ambiguous identities with eligible candidates still require an explicit choice.

## Online acceptance

1. Open the existing Team Planner site and confirm v0.25.63. Use the gear to select
   the correct plan/adventure and associate a reference plan if needed.
2. Confirm linked Dragonair appears for planned Dragonite; absent Kingdra has a
   grey sprite. Open each card and compare moves, ability, nature, HMs and EVs
   with the current save. An eligible PC Pokémon still requires explicit selection.
3. For an absent family, confirm the disabled selector and editable manual checks.
   Switch nature alternatives, refresh and verify only the last choice remains.
4. Check gear settings, backups and planner switching on a phone. Reset still asks
   for confirmation and clears only that selected plan's manual progress.

Automated validation uses synthetic saves; user-save and in-game acceptance remain
separate. Publication and final test results are recorded in README/ROADMAP.

## Validation evidence

`npm test`: **147 passed, 0 failed, 0 skipped**. The new browser case verifies
current-stage and grey sprites, local image decoding, exclusive manual nature
choices and ability persistence, combined detail sections, unique control IDs,
contextual settings and layouts at 320/390/768/1440px in both themes. Existing
party-family auto-linking, manual PC choices, evolution, missing identities,
backups, cross-tab updates, URL/keyboard tabs and other tools also pass.
Phone and desktop screenshots were inspected; `git diff --check` passes.

Direct live-site and GitHub Pages API verification are blocked by this workspace's
network proxy (HTTP 403). A successful push alone does not confirm a live build.
