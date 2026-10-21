# Cave connections and mobile travel help — v0.25.70

The accepted Whirl Islands overlay is extended to **50 additional paired
connections across ten other caves**, making 56 pairs across eleven locations.
Letters are local to each cave. Select a marker or its text link to open the other
map and highlight/focus the matching end. The full-size viewer retains the
markers, scrolls to arrivals and keeps its Close map button visible while scrolling.

| Cave | New pairs | Coverage |
| --- | ---: | --- |
| Cliff Cave | 2 | 1F ↔ 2F/B1F |
| Union Cave | 7 | Main floors, northern connecting passages and Ruins exit alcoves |
| Slowpoke Well | 2 | Entrance ↔ B1F ↔ B2F |
| Mt. Mortar | 9 | Entrance/back cave, upper cave and basement |
| Ice Path | 6 | Paired ladders across all four floors |
| Victory Road | 5 | Paired ladders across all three floors |
| Mt. Silver | 15 | Main entrance, cave floors, chamber/mountainside passages and summit |
| Dark Cave | 1 | Passage connecting the Route 31/46 and Route 45 sides |
| Dragon’s Den | 2 | Entrance passage, main cavern and shrine |
| Tohjo Falls | 1 | Passage behind the west waterfall to the hidden room |

Four supplementary **terrain plans** cover rooms not pictured in the existing
maps: Union Cave’s two sets of connecting/exit passages, Dragon’s Den’s small
entrance room and Tohjo Falls’ hidden room. They use the same pinned game-data
renderer as the previously accepted building references, with visible caveats.
The hidden-room note distinguishes visiting the room from Giovanni’s Celebi-event
appearance. The original 295 choices, PNG bytes and embedded credits remain
unchanged and in their original relative order. Total catalogue: **299 views /
282 PNG assets**, in the same 69 non-Safari location groups.

## Touch and keyboard travel help

On a route/destination button, **tap its symbols** to open Travel conditions,
highlight its exact destination entry and scroll/focus that entry. **Tap the
name** to travel. The icon strip has a minimum 44×28px touch area. Desktop hover
hints remain available; keyboard and screen-reader users can open the existing
44px Travel conditions disclosure and read the same descriptions. Requirements
remain associated with navigation buttons through `aria-describedby`.

Solid versus outlined HM symbols retain their meanings, as do locks and path
notes. No HM/story rule or saved-progression restriction has been changed.

## Primary verification and image anchors

The [generated evidence ledger](cave-map-links.json) contains every source event
snapshot/hash, all paired warp indices, image pixel anchors/hashes, terrain plan
models/crops and a completeness check for each cave. Primary source remains
`pret/pokeheartgold` revision `d2355244ac42b3c6e40d8c36aa3564ee8706dea4`.
Both directions of every pair are checked. Adjacent warp tiles belonging to one
ladder are grouped, rather than displayed as duplicate connections. Every
internal event warp between the included primary scenes is accounted for.

Displayed floors are assigned **per endpoint**, not inferred from a game-header
name. Cliff Cave’s three floors share one game map. Union Cave’s northern
passages/exit alcoves occupy separate portions of the same primary scenes as the
main floors; they must not be silently redirected to the Lapras floor image.
Terrain crops explicitly include the relevant matrix cells/rows. Physical image
anchors mark stairs, cave doors or their landing area; they are visually located
on the rendered images, not obtained by assuming a direct projection from game
coordinates. Terrain-plan anchors use the renderer’s tile grid exactly.

The supplementary plans show **static terrain collision flags and event warps**,
not full rendered artwork or movement simulations. Pale tiles can include unused
space and can still be restricted by object collision, height, scripts or puzzles.
No NPC, object or connecting walking path is invented from those flags. The markers
identify where a connection leads, not whether the player can currently walk to it.

## Reproduction

The explicit recipe is `scripts/soulsilver-cave-links.json`; the generated runtime
pairs remain in `js/data/games/soulsilver/map-links.js`, selected by the existing
game adapter and shared map-link renderer. Unsupported games/locations have no
fallback. With the pinned clean primary checkout, Python 3, ImageMagick and DejaVu
Sans, plus the existing verified map-source archives:

```sh
python scripts/build-soulsilver-interiors.py /path/to/pokeheartgold
python scripts/build-cave-links.py /path/to/pokeheartgold
python scripts/build-atlas-maps.py /path/to/atlas-source-archives
```

Each generator replaces only its own plans and preserves the catalogue’s existing
view order. The cave generator verifies reciprocity, complete internal warp
coverage, duplicate endpoints and pixel/crop bounds before writing the runtime
and evidence. The map build verifies all generated PNG checksums. Re-running both
plan generators reproduces the catalogue, runtime links, evidence and PNG bytes.
The accepted Whirl A–F pairs are retained from their original evidence ledger.

## Scope and validation

These are **map-changing stairs and passages**. Ordinary steps within one image,
ledges, boulder/player drops, scripted one-way falls and HM/story puzzles are not
represented as reversible pairs. Exterior region/route exits use the existing
Atlas compass. Embedded Tower’s two images are story variants, not connected
floors, so no connection is invented. Whirl’s accepted six-pair coverage remains;
its lower-floor extension, towers, Safari and new Kanto locations are separate.

Checks exercise the primary warp graph, all source image hashes/dimensions,
terrain provenance, game isolation, every new pair in both directions at
320/390/1440px, marker alignment, full-size room links in both themes, focus return,
unchanged encounter text and genuine touch input for Surf, Strength, Whirlpool and
story help. Native keyboard disclosure access and destination-name touch
navigation are also checked. Phone/desktop screenshots are reviewed. The full suite passes **166 tests**,
with no failures or skips, including Reader, Planner and existing Atlas/Safari
regressions. Both generators reproduce the same catalogue, runtime links, evidence
and all 282 PNGs byte-for-byte. Deployment is verified separately after publication;
no new real-save/in-game validation is claimed.
