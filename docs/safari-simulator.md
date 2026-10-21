# Safari simulator and target optimizer — Milestone 4

Version **0.25.78**, 21 October 2026. Open the existing
[Safari simulator](https://thedraconicpanda.github.io/pokemon-reader/safari-zone/)
or follow Safari Atlas → Open Safari simulator. This milestone implements the
interactive feature; Milestone 5 remains the final integrated Safari audit.

## Use the simulator

1. Load a SoulSilver save in the existing Reader, or start without a save.
   No-save values are explicitly hypothetical defaults, not inferred progress.
2. Under **Configure your starting values**, supply unavailable fields and correct
   your baseline. Baoba stages and object-call levels have named choices. Entry,
   Surf/rod access, clock penalty and time require manual input for loaded saves.
   The advanced trainer identity is normally loaded; partial object-call groups
   require the full trainer ID, not just the visible five-digit ID.
3. Choose one of the six active areas, an encounter method and time. The starting
   and proposed tables show species, exact levels and encounter-slot shares.
   Dry-area methods, locked access and unknown data show reasons instead of a
   fabricated encounter list. These percentages precede lead abilities and Repel;
   they are not capture chances.
4. Choose **Hypothetical changes** to experiment with area placement, quantities
   and stored area ages. Point totals and encounters update immediately. Ages
   belong to area identities; swapping moves objects, replacement clears them.
5. Enter a target such as Bagon and choose **Find requirements**. Plans identify
   area/position, method/time, object quantities and score requirements, category
   multipliers, minimum relevant age, additional credited days and changes needed.
   Locked alternative paths retain their missing prerequisites.
6. **Preview this plan** applies the suggestion only to the proposed state and
   opens its live table. The starting table and the change list remain available.
   **Reset hypothetical changes** restores the manually corrected baseline;
   **Restore loaded/default start** also removes manual corrections.

Every result labels save, manual, default, hypothetical or unavailable inputs.
An “already qualifies” result refers to the proposed scenario; hypothetical
waiting is never presented as elapsed game time. Edits last for this visit.
A new save revision or adventure reinitializes the scenario. Nothing writes save
bytes, modifies Adventure Profiles or persists a proposed layout.

## How plans are calculated

`js/safari-optimizer.js` uses the same raw tables and eligibility engine as the
live simulator and audited Atlas catalogue. For each target area/method/time it
considers the active position, or all six possible replacement positions when
Area Customizer is confirmed. Unknown layout, age, object quantities (including
decorations), access or required unlock identity prevents a confirmed plan.

At the current age and each later multiplier threshold, score cutoffs partition
the four category counts into cells with identical qualifying bonus rows. The
optimizer projects existing quantities into each feasible cell, retaining objects
where possible and removing only what is needed to respect 30 placements.
Every candidate runs through actual ten-slot replacement and progression checks:
normal encounters can disappear when bonuses replace their slots.

It keeps the earliest feasible age per area/method/time and ranks plans by:

1. Already qualifying, then same-time solutions requiring no additional days.
2. Fewest additional credited area days, then avoiding a time change.
3. Fewest object additions/removals plus area/time changes, discarded objects,
   changed categories, then total placements, with deterministic tie-breaking.

The interface shows up to six alternatives, merging equivalent time results
while preserving different encounter levels. These are earliest-age plans under
the supplied unlocks, not an enumeration of every valid allocation or every later
tradeoff between waiting and fewer objects. A locked progression stage is
explained rather than automatically advanced. Preview ages all known areas in
the proposed active layout, preserving unrelated unknown counters. Stale plans
are rejected if scenario values or provenance changed.

## Evidence and limits

Mechanics, raw encounter extraction and independent hand-transcribed fixtures:
[mechanics audit](safari-mechanics.md),
[reference fixtures](../tests/fixtures/safari/reference-cases.json).
Save evidence and fallback: [save initialization](safari-save-initialization.md).
No new species tables or guessed save offsets are introduced by this milestone.

Reference optimizer cases include Bagon (56 Peak + 35 Forest points: earliest
110 days, 19 Peak + 9 Forest objects at age zero), Lairon (24 Peak points: 24
objects immediately, 12 at age 30). Additional regression cases include Gible
(100 days, 13 Plains + 17 Peak), Riolu
(70 days, 10 Forest + 14 Peak), and Beldum (70 days, 21 Peak). Tests also cover
capacity-preserving edits, displaced base slots, access/unlock restrictions,
unknown fields, clock warnings, inactive-area replacement, comparison/reset,
provenance and save immutability.

Counts describe category allocations, not tile-by-tile object packing or a
movement route. The guide lists equivalent object names. Clock penalties and
actual credited day updates can delay waiting; no calendar deadline is promised.
Linked Safari setups need manual fallback. No real-save/in-game acceptance is
claimed. All 12 areas and five reachable encounter methods use the audited shared
data; this milestone does not add battle/capture simulation or another game.

## Validation and publication

The full regression suite and targeted simulator checks cover Reader, Planner,
Pokédex and Atlas alongside Safari. Browser scenarios exercise target preview,
comparison/reset, all five methods, locked/unknown access, unsupported targets,
both themes and widths 320/390/768/1440px beneath the GitHub Pages prefix.
Phone and desktop target/comparison screenshots were inspected. Syntax checks
and `git diff --check` pass.

Final `npm test`: **215 passed, 0 failed, 0 skipped** on Node 24 / Chromium 154.
Eleven optimizer tests include independent Bagon/Lairon examples and the distinct
time-rate regression. Three new browser tests exercise the interactive feature;
existing save/profile, Reader, Planner, Pokédex and Atlas regressions also pass.
This is automated/source-based validation, not real-save acceptance.

The existing deployment branch is `main`; live confirmation remains pending
because the GitHub Pages API returns Forbidden from this environment.

Release commit `049510c` was pushed successfully to existing `main` on
2026-10-21 after a fresh fetch and normal fast-forward push. The post-push Pages
API check still returned Forbidden. Live deployment is unconfirmed; a successful
push does not establish publication. User outcome and real-save validation remain
pending, and the final Milestone 5 audit has not been started.
