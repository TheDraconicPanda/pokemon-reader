# Application integration review — v0.25.62

Milestone 6 covers the Reader, Team Planner, Atlas/Safari and reference Pokédex as
one application. The user authorized this review after the Safari navigation/map
work. Implementation and automated review are complete when the checks below
pass; online acceptance remains separate. Safari's mechanics audit/calculator and
full Kanto coverage remain subsequent work, not requirements hidden in this review.

## Defects reproduced and fixed

### Reader return links lost their section

Opening `#party`, `#storage`, `#pokedex` or a Collection section with an existing
Adventure Profile used to replace the URL with `#overview` before the asynchronous
profile restoration completed. This also affected reload and browser Back after
visiting another tool. A browser reproduction returned `#overview` for `#party`.

Reader now keeps the requested route during its initial profile lookup, then
resolves it against the restored state. Empty/unavailable storage still falls back
to Overview. Load Save still opens the empty upload view, and canceled/superseded
restores cannot replay a captured old route: routing reads the current URL.
The startup completion flag is presentation state, not a persisted schema field.

### Planner route changes did not update the visible panel

Planner initialized a section from its URL, but later `hashchange`/Back/Forward
navigation could leave another panel visible. The browser reproduction changed
the URL to `#hms` while the Main team panel stayed open.

Planner now renders its section on URL/history changes. Mouse selection retains
the existing history-replacement policy. Tabs expose their selected state and
panel relationship, with one tab in the Tab order. Left/Right wrap among tabs;
Home/End select the first/last. Alt/Ctrl/Meta shortcuts are left to the browser.
The native reset-confirmation dialog now has an accessible name; Escape/cancel
leaves all Planner records unchanged.

## Integrated evidence

| Area | Automated coverage |
| --- | --- |
| Reader | Direct section links, restoration/reload, cross-tool Back, empty/denied storage, invalid replacement, stale loads, six Party slots, PC and Collection, separate evolution export previews |
| Planner | URL/keyboard selection, named cancelable reset dialog, party-first/manual-PC matching, missing/ambiguous links, plans/adventure isolation, legacy backup preservation, storage failures/concurrent edits |
| Atlas | Scoped caught flags, floor/navigation/history, preserved encounter conditions, EV finder, reference links and all existing local map decoding |
| Pokédex | Generic reference with/without a save, exact Atlas links, list return position, keyboard-contained species dialog, all 493 species and pinned data checks |
| Safari | Six-position compass/history, scoped manual layouts, all 269 unchanged records, twelve map identities, loading/error layout and repeated arrow viewport preservation |
| Shared shell | All four tools under `/pokemon-reader/`, 320/768/1440px cross-tool journeys in both themes, selected menu state, cross-page Back/Forward and return to Reader |

The new journey creates two distinct synthetic adventures, navigates Reader →
Planner → Atlas → Pokédex → Reader, and verifies that both complete profile records
and the active selection are unchanged. Atlas catches match the same profile;
reference browsing does not mutate it. The existing suite separately tests
profile updates, multiple plans, cross-tab changes, denied storage and transaction
failures. Existing responsive cases also cover 390px and Safari's four widths.

Screenshots of all four tools were inspected at phone/desktop sizes in both
palettes. Keyboard checks use Chromium input events; the reset dialog's name is
checked in Chromium's accessibility tree. This is targeted accessibility evidence,
not a claim of a complete assistive-technology certification.

No save parser, game dataset, adventure/Planner storage model, schema version,
migration policy or binary editing rule changes in this release. The original
loaded-save/export separation and existing game-data audit limits remain intact.
Reader's existing live metadata/sprite dependencies remain; unavailable metadata
uses existing fallback labels. Live Reader sprites were not independently verified
in the restricted cloud browser. Reference Pokédex sprites/data
and regular Atlas maps remain local; Safari images remain online originals.

## Validation and acceptance

The browser harness disables its back/forward cache to isolate IndexedDB-reset
cases. Cross-page history tests exercise restored documents; they do not establish
behavior in every browser's frozen-page cache.

The preceding release had 143 passing automated checks. This milestone adds three
integration cases (Reader routes, Planner URL/keyboard/dialog, cross-tool journey).
`npm test`: **146 passed, 0 failed, 0 skipped**, on Node 24 / Chromium 154.
`git diff --check` passed. Published to the existing deployment branch for the
Pages workflow; the push does not establish that the live build is ready. Live
v0.25.62 confirmation and the two focused online checks remain pending.
No personal save was supplied for this review. Existing user acceptance of prior
features remains evidence of those releases; these synthetic tests do not claim
new in-game validation or a completed Safari encounter-mechanics audit.

Only these focused online checks are requested for v0.25.62:

1. In Reader, open **Party**, visit **Team Planner**, then use browser **Back**.
   Expect **Party** again. Refresh once: the same restored Party view should stay.
2. In Planner, select **HM plan**, leave focus on that tab, then use **Right** and
   **Left**. Expect EV training and HM plan respectively, with the URL matching.

The previously requested Safari scroll behavior remains covered by automation;
this milestone does not ask the user to repeat the entire application checklist.
