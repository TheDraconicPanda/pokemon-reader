# Machine-readable HGSS Atlas coverage

Run from the repository root with Node 22+, installed npm dependencies, and a local
Chromium/Chrome executable able to start a local HTTP server:

```sh
npm ci
npm run validate:atlas
```

Set `CHROMIUM_PATH` if the browser is not named `chromium`. Validation regenerates
`docs/atlas-coverage.json`, runs the complete automated suite, writes the TAP log
to ignored `work/atlas-validation.tap`, and exits nonzero on any mandatory failure.
It does not need network access or a real save. A missing browser/server capability
is a failed validation, never a skipped pass. `--report-only` provides diagnostic
data but intentionally cannot satisfy the automated-test completion condition.

Commit the regenerated report whenever Atlas data, relevant code, test inputs or
reference authorities change. CI uses `--check-committed`: it regenerates and runs
tests, then rejects stale committed coverage/input fingerprints. Test timestamps
and TAP hashes may differ between environments; they are excluded from the stale
comparison. Both the report and test evidence are uploaded as a CI artifact on
success or failure. CI bounds dependency installation to three minutes and the
whole job to ten minutes; an installer/network failure is not an Atlas pass.
The existing GitHub Pages workflow/hosting are retained.

## Independent inventory and denominators

`scripts/soulsilver-atlas-reference-inventory.json` is separate from the live Atlas.
It is derived from the pinned HGSS headers, the already audited Johto recipes and
reference ledger, the Kanto reference inventory, and the separate Safari audit.
Its builder never reads the current Atlas location list or compiled encounter
files. Coverage cannot rise because an unimplemented location disappeared from
the runtime array: the expected denominator remains fixed in the inventory.

The report inventories 122 named geographic/facility groups: 63 Johto and 59 Kanto.
The Kanto total includes the seven existing League/border groups as well as the
52 new groups. S.S. Aqua counts once under Johto and has cross-region connections;
Mt. Silver follows the primary Johto flag. All 540 primary headers and 123 distinct
region/section entries are accounted for, including explicit unused, online and
out-of-region exclusions. Building rooms and floors remain grouped under their
location; Safari’s twelve areas are explicit sublocations with method coverage.

This is location-group coverage, not a claim that 540 separate interior screenshots
or complete movement simulations exist. `primaryMaps[].dedicatedMapView` exposes
whether a primary header has a separately attributed map choice; a city overview
and grouped room references are not relabelled as individual room screenshots.
The combined map catalogue has 382 views / 365 assets. The 26 new terrain plans
are labelled as game-data diagrams with static collision/warp information.

Updating the reference inventory requires an intentional source review:

```sh
python scripts/build-atlas-reference-inventory.py /path/to/pinned/pokeheartgold
npm run validate:atlas
```

Use the clean revision recorded in the inventory. Do not regenerate the inventory
merely to make a failed check pass. Johto expectations are recomputed from primary
encounter recipes and independently audited names/connections. Kanto expectations
retain reviewed primary-map/method accounting, per-location hashes, source input
hashes and independent encounter fixtures. No completion percentage is hand-entered.

## Report fields and mandatory checks

- `coverage`: expected, implemented and ready counts plus computed percentages for
  each region and the overall unique group inventory.
- `locations`: implementation status, primary identities, map/floor counts,
  encounter status/methods/areas, records, complete distribution checks and reference
  verification status. Empty wild tables require an explicit verified absence.
- `navigation`: every directed edge, HM/story notes, missing/broken edges and
  orphaned groups. The expected graph and Kanto compass orientation are validated.
- `primaryMaps` / `namedSections`: full primary census, group ownership, dedicated
  map-view flags and explained exclusions.
- `referenceVerification`: per-location source status, discrepancies and explicit
  uncertainty records; retrieval is never treated as complete verification.
- `automatedTests`: actual command, times, pass/fail/skip counts, exit status and
  TAP fingerprint. `inputSha256` identifies the application, data, generators and
  tests that were checked.
- `mandatoryFailures`, `integrityPassed`, `completionPassed`: structural/data
  findings and the final gate. Completion additionally requires all tests to run
  and pass. Diagnostic report-only output cannot pass completion.

Mandatory failures include missing/duplicate locations, stale source evidence,
unknown/self/nonreciprocal/unreviewed navigation, orphans, invalid compass data,
missing or changed map assets/floor links, missing encounter rows, invalid species,
levels/times/rates, incomplete distributions, omitted special continuations,
undisplayed rows, undocumented uncertainties and Safari compatibility regressions.
The validator includes negative tests for these cases.

## Reference verification and remaining limits

Existing Johto records retain their prior Serebii/Bulbapedia audit evidence, with
runtime encounter data checked against independently reproduced primary rows.
New Kanto data is fully reproduced from the pinned SoulSilver tables, with
independent secondary examples. All Kanto rows have **not** been freshly compared
one by one against both websites. Page maintenance/errors, partial retrievals,
Headbutt guide omissions, scene-specific Mt. Moon water differences, NPC schedules
and the historical Enigma Stone requirement remain explicit in
`atlas-kanto-reference-checks.json` and the generated report. The report does not
claim full current secondary verification.

Serebii’s Diglett’s Cave exit label conflicts with its own HGSS narrative and the
primary Route 11 warp. The Atlas uses Route 11. Discrete primary encounter levels
are retained instead of filling every level inside a guide’s min/max range.
Suicune’s conditional Burned Tower return is not a second capture. Latios is the
SoulSilver roamer; the historical stationary Enigma Stone encounter is Latias.

The existing Safari audit remains separate and unchanged. Its known primary/guide
multiplier discrepancy and Bulbapedia maintenance limitation are carried forward;
this validator does not replace or reopen its mechanics audit. Real-save outcomes,
user acceptance and an in-game playthrough remain separate from automated tests.
