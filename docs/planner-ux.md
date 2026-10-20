# Team Planner UX

## Navigation refinement — v0.25.66

The visible tabs are Main team and Postgame options. HM plan and EV training
remain together in each member's popup; their duplicate tab buttons are removed.
Old `#hms` and `#evs` links select Main team. Arrow/Home/End navigation follows
the two remaining tabs. No goals, links, backups or manual progress are changed.
All **150 automated checks pass**, including the two-tab layout, keyboard/history,
legacy-link fallback and retained HM/EV popup progress. Live/user acceptance is pending.

## Current-detail corrections — v0.25.65

PC records store experience, but do not include the party-only level field.
Planner now derives missing levels from experience using all 493 HGSS species'
growth rates, extracted from the same pinned pret/pokeheartgold personal.json
used by the reference Pokédex. The input SHA-256 is verified by
`scripts/build-soulsilver-growth-rates.py`; generation is reproducible with that
file. `js/pokemon-level.js` uses the six Gen IV growth curves and preserves valid
party levels. Missing/invalid experience or unknown species still show unavailable;
Adventure snapshots and desired goals are not rewritten.

If a linked individual's current nature is outside the preferred list, an extra
checked, read-only option says “Current nature; not on the preferred list.” Its
stat description joins the info overlay. This option follows the latest save and
disappears when the current nature matches a preference or the individual is no
longer present. It does not add a favorite or rewrite manual checklists.

Main-team note presentation omits HM-related sentences, preserving other notes;
HM assignments/explanations remain in HM plan and the saved goals are unchanged.
Opening/reopening any popup explicitly resets its scroll to zero. In-place edits
and save refreshes continue to preserve scroll. Queued close events from a previous
popup cannot clear another member that has already opened.

Focused checks cover a boxed level-50 Typhlosion, Bold outside Timid/Modest,
unchanged preferences, current-nature refresh, preserved non-HM notes, and opening
another/reopened member after scrolling to EV training. Online: confirm v0.25.65,
check your boxed Pokémon's level and Typhlosion's extra nature/description, then
close a detail near EV training and open another to confirm it begins at the top.

Validation: **150 automated checks passed, 0 failed, 0 skipped**. Level coverage
includes fixed growth-curve thresholds, level 1/100, missing data, saved party
levels and snapshot immutability. The current-nature phone overlay screenshot was
reviewed. `git diff --check` passes; real-save acceptance remains pending.

## Popup refinement — v0.25.64

This supersedes the inline-card presentation described for v0.25.63 below.
Cards retain the planned species name below the sprite, alongside current type
badges (planned typing when unlinked), followed by
name/nickname or Planned, and level or No linked Pokémon. Linked PC records with
no level show Level unavailable rather than implying they are unlinked.

Selecting a card opens a named native modal with a sticky Close button, Escape,
keyboard-contained focus and focus restoration to the card. Edits and newer-save
notifications update the same open member. Switching to a different planner
closes the old member details. Choose saved Pokémon begins collapsed; its current
and missing/ambiguous-link evidence remains available inside the disclosure.

Planned ability has one checkbox and label. Nature options retain priority order;
the info button displays only those natures' stat modifiers on hover, focus or
tap. The existing Gen IV PID-nature mapping supplies the descriptions. No new
ability or nature mechanics are introduced.

Member HM sections show move, Temporary/Final set status, explanation and an
accessible learned checkbox. Repeated owner/currently-known sentences and the
separate Temporary HMs list are omitted. PC and unavailable-link warnings remain.
The aggregate HM tab keeps owner names so assignments remain clear.

EV sections show total current EVs / 510 under the name. Missing current data is
labelled unavailable; historical totals remain explicitly last-known. Individual
checkbox rows retain current/goal values, remaining amounts and over-target
warnings. The redundant Target and Current paragraphs are removed.

### Focused online check

Confirm v0.25.64, select a saved member and an unlinked target, check the four
card rows, then open their popups. Confirm the saved selector starts collapsed,
nature info works on hover and tap, HM checks match the save and EV totals match
Reader. Close with the button and Escape; verify the card receives focus.
Existing matching, manual exclusivity, backups and saved progress are preserved.

### Validation

All **148 automated checks pass**. Final focused layout/popup checks also pass
with the retained species labels. Browser coverage includes Enter activation,
Close/Escape focus restoration, focus containment, collapsed saved selection,
priority-nature descriptions, current EV totals and live updates in the open
popup. Layouts fit 320/390/768/1440px; phone and desktop screenshots were reviewed
in both themes. `git diff --check` passes. The existing Pages deployment remains
the release target; live confirmation and real-save acceptance remain pending.

## Initial UX release — v0.25.63

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
