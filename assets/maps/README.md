# Opening-area HeartGold/SoulSilver maps

Six original location-image layers, exported losslessly as PNG without resizing,
redrawing, or compositing the Ironmon trainer/item/portal overlays. North is up.
The complete images retain their original aspect ratios and any embedded credits.

Source archive: [HGSSIronmonMap](https://github.com/kelseyyoung/HGSSIronmonMap/blob/7840506be21bc5636f8d3d92b93266e202e6d63b/src/assets/mapFiles/Johto.zip),
pinned to `7840506be21bc5636f8d3d92b93266e202e6d63b`.
The archive contains `Johto/Johto.xcf`; named layers identify the Bulbagarden images.
The asset manifest in `js/data/atlas-maps.js` records original file-page references,
layer indices, dimensions, and exported-file hashes. The New Bark source page
identifies its image as a HeartGold/SoulSilver game screenshot.

The upstream software is MIT licensed; its license is retained in
`SOURCE-LICENSE.txt`. Pokémon artwork remains copyrighted by Nintendo, The Pokémon
Company, and Game Freak. The upstream software license does not transfer ownership
of game artwork. Bulbagarden describes these game screenshots as fair-use images.
These maps are used as location references in this personal, non-commercial tool,
consistent with the existing badge-artwork treatment.

Reproduction: ImageMagick 6 `convert 'Johto.xcf[LAYER]' +repage OUTPUT.png`.
Export only the six named original-image layers, not combined layout/overlay layers.
The six-file total is approximately 0.85 MiB. Images are served locally from the
existing Pages site; rendering does not depend on remote image hosts.

| Location | Source image | XCF layer |
| --- | --- | ---: |
| New Bark Town | [New_Bark_Town_HGSS.png](https://archives.bulbagarden.net/wiki/File:New_Bark_Town_HGSS.png) | 1 |
| Route 29 | [Johto_Route_29_HGSS.png](https://archives.bulbagarden.net/wiki/File:Johto_Route_29_HGSS.png) | 2 |
| Cherrygrove City | [Cherrygrove_City_HGSS.png](https://archives.bulbagarden.net/wiki/File:Cherrygrove_City_HGSS.png) | 6 |
| Route 30 | [Johto_Route_30_HGSS.png](https://archives.bulbagarden.net/wiki/File:Johto_Route_30_HGSS.png) | 7 |
| Route 31 | [Johto_Route_31_HGSS.png](https://archives.bulbagarden.net/wiki/File:Johto_Route_31_HGSS.png) | 15 |
| Violet City | [Violet_City_HGSS.png](https://archives.bulbagarden.net/wiki/File:Violet_City_HGSS.png) | 24 |
