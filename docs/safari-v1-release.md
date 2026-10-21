# Safari v1 final integration audit — v0.25.79

Audit date: 21 October 2026. This closes the implementation and automated audit
work for the agreed Safari v1 scope. Live Pages confirmation and user/real-save
acceptance remain outstanding; a push alone does not satisfy those checks.

Use the existing [Safari simulator](https://thedraconicpanda.github.io/pokemon-reader/safari-zone/).
The [feature guide](safari-simulator.md) explains loading, manual completion,
exploring encounters, finding targets, previewing and resetting. Enter from
Atlas → Johto → Safari → Open Safari simulator, or use the direct URL.
Safari Atlas retains maps and Gate travel; its manual layout remains separate
from the simulator's visit-local proposed state.

## Audited coverage

| Area | Walking | Surf / Old Rod / Good Rod / Super Rod |
| --- | --- | --- |
| Plains | Yes | No water encounter terrain |
| Meadow | Yes | Yes |
| Savannah | Yes | No water encounter terrain |
| Peak | Yes | No water encounter terrain |
| Rocky Beach | Yes | Yes |
| Wetland | Yes | Yes |
| Forest | Yes | No water encounter terrain |
| Swamp | Yes | Yes |
| Marshland | Yes | Yes |
| Wasteland | Yes | No water encounter terrain |
| Mountain | Yes | No water encounter terrain |
| Desert | Yes | No water encounter terrain |

All **32 reachable method tables / 96 area-method-time combinations** use the
shared primary dataset: **960 base time slots and 495 bonus time slots**. The
Atlas's 339-row catalogue and simulator use the same game-scoped rules. Dry-area
archive placeholders are excluded, supported absence is explicit, and other games
receive no SoulSilver fallback. Six positions retain the verified 3×2 row-major
topology and south-center Gate exit. Maps follow area identity after swaps.

All **153 target species** were optimized with all unlocks and zero stored age.
The audit replayed **2,822 plans / 6,447 advertised time results**, covering all
96 reachable combinations. Each preview produced its promised target, exact
levels and percentage, respected capacity, and preserved original/manual state.
The [machine-readable ledger](safari-v1-audit.json) records those counts and the
mechanics hash. These are deterministic scenario checks, not actual game saves.

Additional exhaustive integer allocation checks independently compare optimizer
edit costs for displaced Rattata, capacity-limited Lairon, decorated Bagon,
Riolu, Magmar and Surfing Lapras. Hand-transcribed external fixtures cover walking,
night differences, Surf and every rod through the complete scenario/live path;
Lairon and Bagon examples verify object points versus credited-day multipliers.

The audit also covers all category threshold boundaries, decorations and the
30-object cap, staged object groups/full trainer identity, Baoba and National Dex,
entry/method access, unknown data, inactive-area replacement, swaps, identity-bound
ages, saturation at 255, clock warnings and stale-plan rejection. Known locks
remain separate from unknown inputs. Plans do not advance unreceived calls or
claim that hypothetical waiting has occurred.

## Corrections found in this audit

- Known dry-area or locked-method results no longer suggest completing unrelated
  missing fields. Completion is offered only when a relevant value is unknown.
- Completion opens the actual missing field and the correct edit mode. Fixing a
  hypothetical blank keeps the manual baseline intact; a missing baseline opens
  manual completion. Object-related missing progress/identity is included.
- Object-free normal encounters remain eligible when trainer identity or
  unrelated object progress is unknown. Object-based targets still require their
  relevant verified/manual prerequisites. Result provenance now lists inputs the
  table or plan actually uses.

## Save support and preservation

Load only through the existing Reader. The validated SoulSilver partition supplies
local area identities, object records (with category counts rebuilt from IDs),
stored days for all twelve identities, object unlock level, Baoba stage and active
set/pending-day metadata. Existing trainer and Pokédex fields supply full trainer
identity and National Dex state. The canonical optional subrecord is whitelisted;
old profiles and partial invalid fields retain manual fallback without migration.

Entry, Surf/rod availability, time and clock penalty require manual configuration.
Linked Safari setups require manual fallback; they are not initialized using local
trainer timers. Stored pending days and device elapsed time are never added
automatically. Original fields, profile snapshots and save bytes remain unchanged.
A new save/adventure revision reinitializes the visit; unrelated notifications do
not clear it. Storage denial keeps a labeled configurable default scenario usable.

Exact offsets, corroboration and the rejected conflicting PKSM offset are in
[save evidence](safari-save-initialization.md) and its
[source ledger](safari-save-sources.json). Fixtures are synthetic checksummed
binaries; **no real-save validation is claimed**.

## Reproduce the evidence

The pinned clean primary revision is
`pret/pokeheartgold@d2355244ac42b3c6e40d8c36aa3564ee8706dea4`.
The existing [mechanics audit](safari-mechanics.md) records sources and guide
conflicts. All three existing source/evidence generators reproduced unchanged:

```sh
python3 scripts/build-safari-reference.py work/safari-primary
python3 scripts/build-safari-mechanics.py work/safari-primary
python3 scripts/audit-safari-save-evidence.py
node scripts/audit-safari-v1.mjs work/safari-primary docs/safari-v1-audit.json
npm test
```

The save evidence command additionally requires its documented pinned PKHeX,
dedicated-editor and PKSM research checkouts. The new audit directly compares
every imported base/bonus slot with the primary JSON/species constants rather
than trusting runtime self-consistency alone. Without a checkout argument it
still replays all targets; that path is part of the normal automated suite.

## Browser and regression validation

`npm test`: **222 passed, 0 failed, 0 skipped** on Node 24 / Chromium 154.
The audit ledger reproduced byte for byte after the full suite. JavaScript syntax,
local page-link checks and `git diff --check` pass. Browser coverage
includes both themes, 320/390/768/1440px, all twelve areas/methods/times, named
progression controls, both resets, unknown-field focus, keyboard plan activation,
Gate → Atlas → simulator → Pokédex → Back beneath the repository prefix, and an
unchanged constructed Adventure Profile after preview/navigation. Existing Reader,
Planner, Pokédex, Atlas, map navigation/image-error and cross-tab regressions run
alongside the Safari audit. Final phone/desktop comparison and target-plan
screenshots were inspected; the focused controls, point totals and stacked/wide
layouts remain usable.

## Supported limits and remaining acceptance

- SoulSilver only. Rates are ten-slot shares before lead abilities/Repel, not
  capture chances, bite rates or probability per step. Battle/capture simulation,
  RNG details and another game's support are outside v1.
- Counts describe category allocations. Tile packing, object placement routes and
  map-based movement simulation are not calculated. Equivalent object names are
  listed in the help disclosure.
- Waiting means credited active-area days. Clock penalties and game updates can
  delay them; no real calendar deadline is promised. The optimizer reports earliest
  feasible ages under supplied unlocks, with up to six ranked alternatives; it
  does not enumerate every later waiting-versus-placement tradeoff.
- Safari Atlas maps are externally hosted originals with source credits and an
  explicit failure state. Browser image fixtures verify rendering/error handling;
  they do not establish fresh remote image availability under the current policy.
- User visual/outcome acceptance and comparison with an actual in-game save remain
  pending. A useful check is to load the current save, confirm decoded areas and
  counters against the game, supply entry/method/time fields, compare an available
  encounter and preview/reset one target. Save bytes must remain untouched.
- The environment still excludes the Pages API/production host from its enforced
  network allowlist. Deployment and actual production assets cannot be certified
  from a local test or successful Git push. Publication status follows below.

## Publication checkpoint

Release commit `d3a6454` was pushed successfully to the existing `main` deployment
branch on 21 October 2026 after a fresh fetch and normal fast-forward integration.
The post-push Pages API request remained Forbidden, and the production Safari
URL returned **HTTP 403 at the proxy CONNECT tunnel**. These are environment
access failures; they do not demonstrate a broken deployment or establish that
v0.25.79 is live. The code, guide and technical audit are pushed; actual production
publication, remote-image availability and user/real-save acceptance remain
unconfirmed. No separate hosting or repository was introduced.
