# Atlas maps and floor navigation — v0.25.43

The encounter milestone (v0.25.42) was accepted by the user. This next milestone
expands maps across all 69 existing non-Safari locations, excluding Safari Zone
itself and adding no new Kanto locations.

## Implemented coverage

- 150 labelled area/floor views using 148 unique verified local PNGs.
- All numbered routes already in Atlas, towns, outdoor areas and planned dungeon floors.
- Floor/area selector and Previous/Next buttons with 44px touch targets,
  native keyboard controls, focus preservation and accessible status announcements.
- Image, caption, full-size link and source update together on selection.
- Floor selection does not alter encounter information or infer physical movement
  between floors. Compass links remain available at every floor.
- Image failures retain navigation and allow recovery by choosing another map.
- Directory thumbnails load lazily; explicitly selected views load eagerly.
  Alternate floors are not all downloaded when opening a location.
- No encounter datasets, Safari Zone data, Reader or Planner implementation changed.

## Source verification

The archive-domain network addition is now enforced and actual HTTPS requests
succeed. All 33 missing originals were retrieved and checked for PNG validity,
dimensions, source identity and visual applicability. Their source URLs and
checksums are retained in `atlas-map-originals.json`. The complete build succeeds
without the preparation-only `--available-only` flag. The generated coverage
report, `atlas-map-coverage.json`, contains no missing views.

The provisional `Battle_Frontier_GenIV.png` was rejected: it is promotional artwork.
The replacement `Battle_Frontier_Pt.png` shows the shared grounds layout, explicitly
labelled in the UI. Bulbapedia's Generation IV Battle Frontier geography reference
confirms identical facilities and appearance in Johto and Sinnoh. The HGSS Frontier
Access map remains separate. Whirl Islands includes the full Lugia chamber plan
and a separately labelled B3F chamber reference screenshot. Day Care and Magnet
Train Station explicitly show their surroundings rather than claimed interior plans.
Ruins of Alph puzzle and secret rooms are labelled as shared room layouts.

Serebii was checked as an alternative during the access outage; its cropped
Union Cave B2F and Battle Frontier screenshots were not substituted for full maps.
See `assets/maps/README.md` and `scripts/atlas-map-sources.json` for complete
provenance, pinned source archives, reproduction and artwork rights.

## Validation

All 58 automated checks pass, with no failures or skips (`npm test`).
The full catalogue build and `git diff --check` also pass.
Checks cover PNG hashes/dimensions, actual browser decoding of every image,
all 69 locations and 150 map choices, floor switching, source/full-size links,
keyboard focus, image-error recovery, mobile/desktop geometry, encounter preservation
and Reader/Planner regressions. The six opening map images remain byte-for-byte
unchanged. Original map contact sheets and mobile/desktop floor controls are
visually reviewed. No real-save or in-game validation is implied by these checks.

## Acceptance boundary

Publish only after all required checks pass. Verify the deployed version and
changed asset hashes against the existing GitHub Pages site. User outcome
acceptance remains pending; the next milestone is structured location details.
