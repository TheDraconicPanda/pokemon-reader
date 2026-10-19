# Planner / Adventure integration — v0.25.54

## What this release changes

Reader's successfully stored Adventure Profile supplies every Planner tab. The
Planner no longer asks for a second save upload in EV training. It works without a
save in reference mode, retaining the existing manual checklists and Mando goals.

Choose **Use this plan for [trainer]** once to associate the migrated Mando plan
with the correct adventure. That explicit step prevents a generic or legacy plan
from being silently assigned to the wrong trainer. New planners created with an
adventure selected are associated with that adventure. Adventure and Planner IDs
remain independent. Multiple plans can share an adventure; one associated plan is
automatically selected, while multiple plans use a remembered choice or ask for
selection. Other adventures' plans are preserved.

Initial matching selects a unique non-Egg party Pokémon from the planned evolution
family, including earlier stages. Ambiguous party matches and every unlinked PC
candidate require **Choose saved Pokémon**. A manual override remains manual on
refresh. The same association is used by Main team, HM plan and EV training.

A link stores PID plus original-trainer TID/SID and immutable consistency evidence:
IVs, OT name, met date/location/level. Species, nickname, level and party/PC position
are not identity keys. Linked Pokémon are found after evolution and party/PC
transfers. Missing Pokémon retain the association and clearly labelled last-known
values; these values never count as current move or EV completion. Cloned identical
identities require an explicit choice, which resolves their position for the
current snapshot only; the next ambiguous snapshot asks again.

Planned moves, nature alternatives, evolution targets and EV goals remain stored
separately from observed values. Move/HM checks reflect moves *currently known* by
the designated linked Pokémon, including forgetting a previously learned move.
An HM known by a Pokémon in a box is labelled as in the PC, outside the travelling
party; a learned check does not claim that badges or other travel conditions are
satisfied. Unassigned Flash retains manual confirmation. All six current EV values,
total EVs and remaining/over-target values are shown. Nature and evolution progress
are explicit. Final-team readiness remains a manual decision.

## Storage and migration

- IndexedDB uses the existing database/store layout with Planner record schema 2.
- `js/planner-model.js` owns goals, identity, matching and progress derivation;
  `js/planner-store.js` owns migration, revisions and transactions. Presentation
  remains in the existing plain JavaScript Planner.
- The original localStorage key is never removed or rewritten by the new Planner.
- If v0.25.53 made an early migration copy, activation reads the **latest** valid
  v1 browser data, preserving both the original raw copy and activation raw JSON.
  This includes manual checklist state and additional legacy JSON fields.
- Once activated, stale v1 storage never overwrites newer Planner edits.
- New plans copy desired goals with fresh manual checklists and links. Reset clears
  only the selected plan's manual checklists; it preserves goals, links, actual
  progress and other plans. There is no automatic deletion of plans.
- v1 JSON backups remain importable. v2 exports include the complete selected plan.
  Import creates a separate reference plan with desired goals/manual progress;
  foreign profile IDs and Pokémon associations are not silently applied. The
  original plan and complete exported associations remain intact. Associate the
  imported plan explicitly and select any PC Pokémon again.
- Revision checks reject stale cross-tab writes. A failed transaction cannot commit
  plan changes without its selection setting. Profile notifications use
  BroadcastChannel, with focus/pageshow refresh as a fallback.
- Storage-denied sessions retain manual planning/export and show a recovery warning;
  stored records and original legacy data remain untouched.

## Reference verification

`js/data/games/soulsilver/planner-reference.js` contains identifier/name data only:
493 species, 467 Generation IV moves and 25 natures. Names are English labels from
PokéAPI CSVs pinned at `6fd69dfe90465ba96534f6816fc817737d1f97f6`; per-file SHA-256 and
source URLs are embedded in the dataset. No learnsets, modern abilities or newer
mechanics are imported. Nature mapping uses the CSV's **game_index**, which matches
the parser's PID modulo 25; PokéAPI's API nature IDs use a different order.

All existing Mando move names were resolved to verified numeric IDs. The two
undecided fourth moves remain undecided. Reproduce with downloaded files from the
embedded source URLs and:

```sh
python scripts/build-planner-reference.py work/planner-reference
```

## Focused user acceptance checklist

This release is specifically **Planner integration**. Atlas caught indicators,
the standalone reference Pokédex and Safari mini Atlas are subsequent milestones.

1. Confirm **v0.25.54**, load your latest SoulSilver save in Reader, then open
   **Team Planner**. Choose your existing Mando plan and click **Use this plan for
   [trainer]** once if offered. Your old manual checks and goals should remain.
2. **Main team:** a unique party Machamp should be selected automatically. Earlier
   stages should match too. Mordecai/Dragonair should show Dragonite as the remaining
   evolution target and Fly incomplete if he does not currently know it. Gengar's
   Shadow Ball should be checked only if the linked Gengar currently knows it.
   Compare the displayed current nature with the unchanged planned nature.
3. **HM plan:** verify HMs against their designated linked Pokémon's current moves.
   For example, Strength/Rock Climb should check if the linked Machamp knows them.
   HMs assigned to a different Pokémon should not silently change owners.
4. **EV training:** expect the same linked individual, all six current EVs, totals,
   targets and remaining amounts. There should be **no second save-upload control**.
5. Refresh Planner. Links and selected plan should remain. With a newer save,
   confirm a linked Pokémon follows party/PC transfers or evolution. If absent,
   expect **Not found in latest save** and labelled last-known values, with current
   completion unavailable. Use the selector to reassign manually when wanted.
6. Optional: create a second named planner, change a manual readiness check, and
   switch back. The first plan should retain its separate progress. Export/import
   should create a separate reference copy, preserving existing plans.

Automated tests use synthetic parsed Pokémon and constructed binary saves. Actual
user-save correctness and in-game validation remain distinct and are not claimed.

## Automated release checks

`npm test`: **104 passed, 0 failed, 0 skipped**, including Reader and Atlas
regressions. Planner coverage includes stable goals, verified name/ID mapping,
party-first/manual-PC selection, evolution/transfers, missing and cloned
identities, manual overrides, latest-v1 migration activation, v1/v2 imports,
multiple adventures/planners, optimistic write conflicts, transaction rollback,
real cross-tab notifications, denied IndexedDB/BroadcastChannel recovery and
section persistence. Linked layouts passed at 320/390/768/1440px in both themes;
390px and 1440px screenshots were reviewed. `git diff --check` passed.

This version is a review checkpoint; live-version confirmation and the focused
real-save checklist above remain pending user validation.
