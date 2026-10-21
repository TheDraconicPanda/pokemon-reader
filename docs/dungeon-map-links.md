# Remaining Johto dungeon connections — v0.25.71

The map overlays now cover Sprout Tower, Burned Tower, Bell Tower, all existing
Whirl Islands floor choices, and the scripted holes in Ice Path and Victory Road.
The same map controls and full-size viewer work with mouse, touch and keyboard.
Original map images, credits, map choices and encounter/reference datasets are unchanged.

| Location | Added reciprocal connections | Added one-way holes |
| --- | ---: | ---: |
| Sprout Tower | 4 ladders | 0 |
| Burned Tower | 1 basement ladder | 0 |
| Bell Tower | 10 stairs and 8 teleport-pad pairs | 0 |
| Whirl Islands | 2 lower ladders and 2 chamber passages | 0 |
| Ice Path | Existing 6 ladders retained | 4 |
| Victory Road | Existing 5 ladders retained | 5 |

This adds **27 reciprocal pairs and nine one-way holes**. Together with the
previous 56 pairs, there are **83 reciprocal connections across 14 locations**.
The map catalogue remains **299 views / 282 PNG assets**.

## Using the connections

Matching letters lead to the other end, which receives focus and a highlight.
Bell Tower includes a pair of pads within 7F: east and northwest. Both are labelled
K; their text links identify the departure and arrival sides. Selecting one keeps
7F open and moves focus to its other pad, including inside the full-size viewer.
Whirl Islands retains its accepted A–F markers and adds G–J down through B2F to
the upper side chamber and Lugia chamber. The waterfall and story requirements
still apply; map links are references, not a route solver or save-progression lock.

**D1↓, D2↓, …** identify one-way holes. Their dotted landing markers say “Landing
only” and offer no reverse travel. Return by another route. Ice Path's markers
refer to unfilled holes; boulders pushed with Strength can plug them. No boulder,
ice-slide, ledge or teleport-route puzzle is automatically solved.

Burned Tower's central damaged floor is not added as a playable drop. Its HGSS
coordinate scripts are the Eusine/rival story events, not a falling warp. Its
verified basement ladder is the usable floor connection. Exterior exits continue
to use the Atlas compass; ordinary in-floor steps and ledges have no invented
reciprocal floor link. Safari and new Kanto locations remain separate.

## Evidence and reproduction

The recipe is `scripts/soulsilver-dungeon-links.json`. Run:

```sh
python scripts/build-dungeon-links.py /path/to/pokeheartgold
```

The primary checkout must be clean at
`d2355244ac42b3c6e40d8c36aa3564ee8706dea4`. The generator checks every internal
warp in the three towers and all five Whirl map headers (including the existing
six entrance pairs), coalesces adjacent stair tiles and verifies reciprocity.
Bell Tower's same-floor pair is included in that inventory.

Holes are verified separately through coordinate triggers and their script
entries: Ice Path B1F scripts 000–003 and Victory Road 3F scripts 002–006. Those
scripts set the landing coordinates, play the falling sound and explicitly warp
the player to the lower floor. The ledger records trigger conditions, exact
landing coordinates, script paths and input hashes. Image markers indicate the
hole or its landing area; pixel anchors are visually reviewed on the original
artwork, not inferred from header names or a universal 3D projection.

Generated runtime data lives in `js/data/games/soulsilver/dungeon-links.js` and is
merged by the existing game adapter. The original cave generator retains its
owned data; rebuild this extension after changing its recipe or primary evidence.
`docs/dungeon-map-links.json` records source snapshots, checksums, warp indices,
script provenance and unchanged image hashes. Unsupported games inherit no data.

## Validation

Automated checks cover primary warp completeness, all nine scripted landing
records, unchanged image hashes, game isolation, both directions of every new
pair, disabled reverse travel from holes, same-floor teleport focus, encounters
remaining unchanged, and 320/390/1440px layouts in both themes. Full-size same-floor
travel and close/focus return are tested. Phone and desktop screenshots are
reviewed. The full suite passes 169 tests with no failures or skips; a focused
viewer/landing recheck also passes after the marker sizing refinement. The
generator reproduces both output files byte-for-byte. Publication and user outcome acceptance are recorded separately; no
new real-save or in-game playthrough is claimed.
