# Johto Atlas completion audit — 21 October 2026

Application **v0.25.72**. This closes the agreed implementation and technical audit
for the existing **69 non-Safari Johto and League/Mt. Silver approach groups**.
Safari Zone Gate remains included. Online user acceptance is separate from this
technical checkpoint; the existing deployment remains the place to test outcomes.

## Verified scope

| Feature | Coverage |
| --- | --- |
| Navigation | All 69 groups reachable from New Bark Town; 154 directed connections have travel annotations |
| Encounters | All 1,384 records represented in method/time sections; 16 explicit no-fixed-wild statuses |
| Maps | 299 views / 282 verified PNGs, with no missing catalogue view |
| Dungeon links | 83 reciprocal stair/passage/teleport pairs and nine one-way holes across 14 locations |
| Location details | 686 items/rewards, 22 gifts/trades, 371 shop/exchange offers, 156 service/interaction records |
| Trainers | 370 reference records; all 365 fixed/combined species-and-level rosters match primary data; five facility milestones intentionally have no fixed roster |
| EV Training | 493 Generation IV yields; 328 complete tables for each time period, scored for all six stats; Surf and clean-table priority retained |
| Application integration | Shared theme/menu, species links, caught indicators, navigation history, saved-adventure context and Reader/Planner regressions |

`node scripts/audit-johto-atlas.mjs /tmp/johto-coverage.json` reproduces the static
inventory and coverage checks. The [completion ledger](atlas-johto-completion.json)
records counts, per-location coverage, original image hashes, reproduction and
source-audit continuity. The script deliberately fails if the content datasets
change after the source-page audit, requiring that content to be reviewed again.

## Issue found and fixed

Following a full-size dungeon marker used `scrollIntoView`, which panned the
image **and scrolled the surrounding dialog**. On a 320px phone, the reproduced
Ice Path transition moved the dialog by 106px and displaced its floor selector.
The viewer now centers the arrival by scrolling only its image pane, keeping the
surrounding controls in place. Arrival focus, highlighting, one-way restrictions,
Close/Escape and focus return are retained. A regression test covers 320px and
390px phones, an 844×390 landscape viewport and a 1440px desktop.

## Content and source verification

All five content datasets checked against the 20 October source audit are
byte-for-byte unchanged: locations, route encounters, non-route encounters,
location details and EV yields. That audit freshly compared 162 Bulbapedia and
Serebii pages. This completion pass **reuses that source-page evidence**; it does
not claim another fresh fetch or independent review of all those pages.

This pass reruns all three encounter/EV generators, the interior/cave/dungeon
connection generators, the full map exporter and the trainer-roster audit against
clean pinned HGSS revision `d2355244ac42b3c6e40d8c36aa3564ee8706dea4` and the
verified original map archives. Rebuilds leave all **301 checked files**, including
all 282 map PNGs, byte-for-byte unchanged. All 365 fixed/combined rosters match again.
The newer map/interior/travel ledgers supersede the older audit's missing-interior
and missing-travel-indicator limitations.

## Functional validation

**All 170 automated tests pass, with no failures or skips.** The full application suite checks search/filtering, compass travel, deep links,
every scoped map choice, source/image failure fallback, encounter disclosures,
EV filters/pagination/location return, interior caveats, HM/story touch help,
all dungeon links, same-floor pads, one-way landings, themes, phone/desktop layouts,
focus, saved-adventure context and Reader/Planner/Pokédex regressions. Existing
Safari tests run as regressions only. The browser harness also now tolerates only
transient CDP context-loss errors while polling through expected page navigations;
all destination, persistence, theme and error assertions remain enforced. Screenshots are reviewed for the final
phone/desktop EV, navigation and dungeon-viewer layouts in both themes.

## Remaining scope

Safari's detailed audit/calculator and full Kanto expansion remain separate
projects. Sinjoh Ruins is not included. Static terrain plans are labelled diagrams,
not rendered screenshots or complete movement simulations. Reference conditions
remain visible rather than automatically filtering everything against save
progression. Complete battle moves/AI/facility simulation and a census of every
NPC dialogue are outside the agreed Johto reference milestone. No new real-save
or in-game playthrough validation is claimed.

For user validation, open the existing [Atlas](https://thedraconicpanda.github.io/pokemon-reader/pokedex-earth/),
browse Johto, try Surf-focused EV Training, and follow dungeon links in the
full-size viewer. Report corrections as they appear; a new hosting/review flow is
not required.
