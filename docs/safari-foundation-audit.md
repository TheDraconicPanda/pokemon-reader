# Safari v1 — Milestone 1 foundation audit (2026-10-21)

Release candidate: **v0.25.75**. Base: `f8b77f9` (v0.25.74), including the
latest published Reader/Pokédex changes. This milestone covers the existing
Safari Atlas foundation, not the later simulator or encounter-mechanics audit.

## Inventory and evidence

| Component | Audit result |
| --- | --- |
| Area identities | All 12 IDs 0–11 match pinned primary constants: Plains, Meadow, Savannah, Peak, Rocky Beach, Wetland, Forest, Swamp, Marshland, Wasteland, Mountain, Desert. |
| Topology | Three columns, two rows, row-major order; 14 directed internal edges, reciprocal neighbors, no wraparound; only south-center exits south to Gate. |
| Entry/return | Gate north, Johto feature card and direct hashes enter the existing panel; Gate return and browser history are regression-covered. |
| Maps | Twelve distinct original HGSS URLs keyed by area ID; switching areas changes maps and encounters together. Image failure retains navigation, credits and reserved space. |
| Manual layout | Six distinct areas; existing-area selection swaps positions; unused-area selection replaces one position. Per-adventure/reference persistence, stale writes, cross-tab refresh and session fallback remain covered. |
| Encounter presentation | Existing shared Atlas renderer, time/method disclosures, conditions, species links and caught markers; all 269 source records preserved. This does not certify their accuracy or eligibility. |
| Save state | Safari snapshot remains explicitly unsupported. No verified decoded layout, blocks, aging or Baoba progression. No new offsets or save writes. |
| Duplication | Legacy all-area reference and mini Atlas consume the same game-scoped encounter array. No competing simulator rules or dataset added. |

The five primary files in `js/data/games/soulsilver/safari-reference.js` were
retrieved again from pret/pokeheartgold revision
`d2355244ac42b3c6e40d8c36aa3564ee8706dea4`; every SHA-256 matched the recorded
value. Running `scripts/build-safari-reference.py` against those files reproduced
the committed reference byte-for-byte. Source URLs and hashes remain in that file;
[existing source interpretation](safari-mini-atlas.md#verified-navigation-evidence)
explains matrix coordinates, entrance warps and the example arrangement.

## Foundation correction

Sparse six-slot arrays could pass validation because `Array.some` skips holes.
IndexedDB structured cloning preserves these missing entries; the renderer then
cannot resolve the missing area. Validation now examines every slot, rejecting
incomplete layouts through the existing safe storage fallback. A regression checks
layout validation, stored-record validation and swaps against a structured-cloned
incomplete array. Valid layouts and existing browser records require no migration.

## Known gaps for the remaining milestones

- Milestone 2: independently audit all encounters, methods, rates, levels,
  time restrictions, blocks, initial-area availability, unlocks and aging rules.
  The 269-record preservation hash is not a completeness or correctness claim.
- Milestone 3: research save fields and provenance; keep unavailable fields
  explicit and support a clean manually configured simulation without a save.
- Milestone 4: build hypothetical changes, original-state comparison/reset and
  target optimization using the verified engine.
- Milestone 5: integrated simulator audit and final release.

The current example `[0,7,1,5,3,6]` is one possible initial layout, not the loaded
trainer's configuration or a progression-aware new-game simulator default.
The layout editor is unrestricted reference configuration, not proof of unlocked
areas. Its UI already labels the example, manual state and unfiltered encounters.

## Verification and publication

The original image host is blocked by this environment's HTTP policy (403 tunnel
denial on 2026-10-21). Browser map checks use the existing clearly labeled local
fixture; they verify rendering/failure behavior, not fresh downloads of HGSS
images. Previous user acceptance of those maps remains recorded in README.
No new real-game playthrough or personal-save validation is claimed.

`npm test`: **172 passed, 0 failed, 0 skipped** on Node 24 / Chromium 154.
This includes Gate/history, all twelve area views, manual layout storage/isolation,
cross-tab updates, image fixtures/errors, 320/390/768/1440px theme checks and
Reader/Planner/Pokédex/Atlas regressions. `git diff --check` passed.

Release commit `a8bcf78` was pushed successfully to the existing `main` deployment
branch on 2026-10-21 using a normal fast-forward push. Live deployment
verification is blocked: the Pages API and production URL return HTTP 403 from
this environment. A successful push must not be represented as confirmed live
publication. Milestone 1 technical checks are complete; its publication acceptance
remains pending until the existing Pages deployment can be observed.
