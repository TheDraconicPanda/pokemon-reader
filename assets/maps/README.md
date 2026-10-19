# HeartGold/SoulSilver map assets

The catalogue supplies 150 area/floor views across the 69 existing non-Safari
locations, using 148 unique PNG files. Safari Zone itself remains a separate
project. See `docs/atlas-map-coverage.json` for the generated coverage report.

## Sources and reproduction

Original image layers are exported losslessly from the pinned
[HGSSIronmonMap](https://github.com/kelseyyoung/HGSSIronmonMap/tree/7840506be21bc5636f8d3d92b93266e202e6d63b)
archives at revision `7840506be21bc5636f8d3d92b93266e202e6d63b`:

- `src/assets/mapFiles/Johto.zip` → `Johto/Johto.xcf`
- `src/assets/mapFiles/Kanto.zip` → `Kanto/Kanto.xcf`

The Kanto archive supplies the already-scoped Route 28, Mt. Silver and S.S. Aqua
maps; this does not add Kanto locations or encounters to the Atlas.

`scripts/atlas-map-sources.json` records archive checksums, original source image
names, selected layers, labels and required originals. The generated, game-scoped
manifest is `js/data/games/soulsilver/maps.js`; it records file-page source URLs,
PNG hashes and dimensions for every exported view. Ecruteak's original-image layer
is named "Ecruteak City" in the archive and is explicitly matched to the
`Ecruteak_City_HGSS.png` reference. Dark Cave's side labels and Mt. Mortar's floor
labels are checked against the HGSS layout tables on their Bulbapedia articles.

The 33 direct originals are recorded with source URLs, dimensions and SHA-256
hashes in `docs/atlas-map-originals.json`. The provisional Battle Frontier artwork
was rejected after inspection. Its replacement is `Battle_Frontier_Pt.png`,
explicitly labelled as the shared Platinum/HGSS grounds layout: the
[Generation IV Battle Frontier reference](https://bulbapedia.bulbagarden.net/wiki/Battle_Frontier_(Generation_IV)#Geography)
confirms both regions' facilities and appearance are identical. The separate
HGSS Frontier Access map is retained. Whirl Islands includes the full Lugia
chamber plan plus a labelled B3F chamber reference view.

Using Python 3 and ImageMagick 6, with the two archives downloaded into a directory:

```sh
python scripts/build-atlas-maps.py /path/to/archive-directory
```

The complete build requires verified original PNGs in `originals/` and their
recorded checksums. It fails if required images or provenance are absent. The
`--available-only` option is for unfinished local preparation and reports all
omitted views; it is not a complete/releasable build.

Archive exports use only individual original-image layers. Trainer/item/portal overlays,
combined atlas layouts and unrelated games are not substituted. Export preserves
complete images, aspect ratios and embedded credits. Map plans retain north-up
orientation; the additional B3F chamber screenshot is explicitly labelled as a
reference view. New
exports omit volatile PNG date/time chunks. The six previously published opening
maps retain their exact bytes and hashes.

The Day Care and Magnet Train Station use explicitly labelled Route 34/Goldenrod
surroundings maps rather than pretending those are interior floor plans. Multi-area
locations use labelled floor/area choices. Images are hosted locally on the existing
Pages site; the application does not fetch remote images at runtime.

## Rights and credits

The upstream software's MIT license remains in `SOURCE-LICENSE.txt`. Pokémon
artwork remains copyrighted by Nintendo, The Pokémon Company and Game Freak;
the software license does not transfer ownership of game artwork. Bulbagarden
identifies these game images as fair use. Original file-page links remain available
in Atlas Sources and follow the selected floor. Embedded image credits are retained.

## Safari area maps (v0.25.60)

The twelve Safari mini Atlas maps are online original-image references in
`js/data/games/soulsilver/safari-maps.js`, not files in this archive. Their linked
Bulbagarden file pages carry source credits. See `docs/safari-mini-atlas.md` for
availability/testing limits. Existing local asset counts and checksums are unchanged.
