# Whirl Islands stair links — v0.25.69

The four existing 1F entrance images and B1F now have matching **A–F** markers.
Selecting a marker (or its text link below the compass) changes to the matching
floor and highlights/focuses the other end. The existing floor selector, sources,
encounters and town compass remain available.

| Letter | 1F entrance ladder | B1F ladder |
| --- | --- | --- |
| A | NW | Northwest |
| B | NE · north | Far northeast |
| C | NE · south | Northeast, west/south of B |
| D | SW · west | Southwest |
| E | SW · east | South, east of D |
| F | SE | Southeast |

Use **Open full-size map with stair links** to retain the letters on a large,
scrollable map. The viewer has a map selector, matching text links and an original
image link. Following a stair pans to its destination marker. Close map or Escape
returns focus to the selected stair in Atlas. Light/dark mode follows the shared
application theme. Main-map text links provide 44px touch targets when the map is
small. The original PNGs and their credits are unchanged; the markers are HTML
overlays aligned to each image's painted area, including any letterboxing.

## Verification and scope

The [evidence ledger](whirl-islands-stair-links.json) records the original PNG
hashes/pixel anchors, primary event snapshots/hashes, zero-based warp indices and
the six paired routes. Primary source is `pret/pokeheartgold` at
`d2355244ac42b3c6e40d8c36aa3564ee8706dea4`:

- [1F event warps](https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/files/fielddata/eventdata/zone_event/118_D40R0101.json)
- [B1F event warps](https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/files/fielddata/eventdata/zone_event/228_D40R0102.json)

Every 1F→B1F warp is covered, and every B1F→1F event points back to the matching 1F
warp. Each upward ladder on B1F has **two adjacent warp tiles**; those are one
ladder, not two connections. Pixel anchors were visually checked against the
actual ladder sprites, with the game's quadrant/coordinate ordering used to
identify each pair. Game coordinates are not assumed to be image pixels.

This focused overlay covers the six entrance/B1F ladders requested by the user.
B1F's two descending ladders to B2F, the Route 41 cave exits and lower-floor cave
passages do not receive A–F markers. Their existing images are retained. Letters
identify paired stairs, not an automatic route through ledges/water/story gates.
No encounter, Safari, Reader-save or Planner logic changes are included.

Runtime pairs live in `js/data/games/soulsilver/map-links.js`, selected through
`js/data/atlas-map-links.js`; unsupported games/locations return no connections.
`js/atlas-map-links.js` renders the shared markers, list and full-size viewer.

Automated checks cover warp reciprocity/completeness, all original image hashes,
pixel bounds, game isolation, six forward/return connections at 320/390/1440px,
marker alignment under object-fit scaling, unchanged encounters, full-size map
panning, both themes, modal focus/Escape/close and image-failure fallback. Captured
phone/desktop layouts are reviewed. The full application suite passes **161 tests**
with no failures or skips, including Reader/Planner/Atlas/Safari regressions.
Deployment is verified separately after publication; no new real-save or in-game
validation is claimed.
