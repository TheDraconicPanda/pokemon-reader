# Static Atlas coverage — v0.25.36

> Historical step 1 snapshot. The subsequent full static audit is recorded in
> [v0.25.37 audit results](atlas-static-audit.md), which supersede this snapshot's
> pending statuses and its original adjacency wording.

## Scope and acceptance

Step 1 implements a static guide for the existing Johto Atlas and the League/Mt.
Silver approaches. There are **70 named location groups**, including all Routes
26–48. Floors and minor houses are grouped into their parent location rather than
making every game map a separate card. This is not a comprehensive Kanto directory:
Route 22, Saffron, and Vermilion are described as onward destinations where relevant,
but do not have cards. Event-only regions and full item/trainer catalogues are not
part of this static-location layer. Encounter tables and Safari mechanics were not
expanded or certified by this change.

Each group now has its summary, at least two landmarks/features, at least two access
or progression notes, adjacent named groups, and source links. Search covers the new
landmark/access text. Connection buttons still open exactly one named destination.
Connections express adjacency through short gate passages; ledges and story gates
can limit actual travel. The city records group their Gyms and ordinary local
services; separate cards are reserved for major locations and travel junctions.

Added groups: Routes 26, 27, and 28, Tohjo Falls, Pokémon League Reception Gate,
Bellchime Trail, Goldenrod Underground, Team Rocket HQ, Frontier Access,
Battle Frontier, MooMoo Farm, and Magnet Train Station.

## Sources and verification boundary

The implementation uses the publicly available **pret/pokeheartgold game
reconstruction**, pinned to revision
`e3f671ad1d060140c587f925f4ab8ec3596f62b9`. This is a community reconstruction,
not an official Nintendo documentation release. Its named maps, entrance/warp data,
event scripts, and English in-game messages provide primary game evidence. The
source map identifiers are retained in `js/data/atlas-locations.js`; each card exposes
its pinned entrance, event, and available message links under Sources. Supporting
scripts are linked for multi-map locations and progression facts, including Oak's
Mt. Silver authorization and the Safari opening call.

All linked files were checked against the exact cloned revision. Sources were used
to build the static content and resolve the junction errors listed below. This is
not the separate, systematic secondary-source audit in step 2. Serebii and Bulbapedia
requests still returned proxy CONNECT HTTP 403 on this task, even though their
hostnames are present in saved configuration. No claim is made that their pages were
read. Full per-location cross-checking against SoulSilver reference sites remains
pending, including checking for missing important facts and confirming movement
requirements. User validation of this release is also pending.

## Corrected connections and descriptions

- Ruins of Alph connects to Routes 32 and 36 and the Union Cave branch, not Route 30.
- Ilex Forest is west of Azalea and connects onward to Route 34.
- Violet City links back to Sprout Tower.
- Cianwood reaches Route 47 through Cliff Edge Gate.
- Ecruteak reaches Bell Tower through Bellchime Trail and its Barrier Station.
- Safari Zone is reached through Safari Zone Gate; Route 47 no longer bypasses it.
- The Day Care connects to Route 34, not directly to Goldenrod City.
- The League approach now includes New Bark → Route 27 → Route 26 → Reception Gate
  → Victory Road → Indigo Plateau, with Tohjo Falls on Route 27.
- Mt. Silver is reached from Route 28 via the Reception Gate, not Indigo Plateau.
- Route 40 reaches Battle Frontier through Frontier Access.

## Complete implementation checklist

“Implemented” means the static fields and source links are present and their UI is
tested. Every row's independent Serebii/Bulbapedia audit is still pending; presence
alone must not be interpreted as audited completeness.

| Location | Kind | Static information | Primary game map(s) | Secondary-source audit |
| --- | --- | --- | --- | --- |
| New Bark Town | town | Implemented | `MAP_NEW_BARK`, `MAP_ROUTE_27` | Pending |
| Cherrygrove City | town | Implemented | `MAP_CHERRYGROVE`, `MAP_CHERRYGROVE_GUIDE_GENT_HOUSE` | Pending |
| Violet City | town | Implemented | `MAP_VIOLET`, `MAP_VIOLET_GYM` | Pending |
| Azalea Town | town | Implemented | `MAP_AZALEA`, `MAP_AZALEA_KURT_HOUSE` | Pending |
| Goldenrod City | town | Implemented | `MAP_GOLDENROD`, `MAP_GOLDENROD_FLOWER_SHOP`, `MAP_GOLDENROD_MAGNET_TRAIN_STATION_1F` | Pending |
| Ecruteak City | town | Implemented | `MAP_ECRUTEAK`, `MAP_ECRUTEAK_BELL_TOWER_BARRIER_STATION`, `MAP_ECRUTEAK_DANCE_THEATER` | Pending |
| Olivine City | town | Implemented | `MAP_OLIVINE`, `MAP_OLIVINE_LIGHTHOUSE_LIGHT_ROOM` | Pending |
| Cianwood City | town | Implemented | `MAP_CIANWOOD`, `MAP_CIANWOOD_PHARMACY` | Pending |
| Mahogany Town | town | Implemented | `MAP_MAHOGANY`, `MAP_MAHOGANY_SOUVENIR_SHOP` | Pending |
| Blackthorn City | town | Implemented | `MAP_BLACKTHORN` | Pending |
| Route 29 | route | Implemented | `MAP_ROUTE_29` | Pending |
| Route 30 | route | Implemented | `MAP_ROUTE_30` | Pending |
| Route 31 | route | Implemented | `MAP_ROUTE_31` | Pending |
| Route 32 | route | Implemented | `MAP_ROUTE_32`, `MAP_ROUTE_32_POKECENTER_1F` | Pending |
| Route 33 | route | Implemented | `MAP_ROUTE_33` | Pending |
| Route 34 | route | Implemented | `MAP_ROUTE_34` | Pending |
| Route 35 | route | Implemented | `MAP_ROUTE_35` | Pending |
| Route 36 | route | Implemented | `MAP_ROUTE_36`, `MAP_GOLDENROD_FLOWER_SHOP` | Pending |
| Route 37 | route | Implemented | `MAP_ROUTE_37` | Pending |
| Route 38 | route | Implemented | `MAP_ROUTE_38` | Pending |
| Route 39 | route | Implemented | `MAP_ROUTE_39`, `MAP_ROUTE_39_MOOMOO_FARM_HOUSE` | Pending |
| Route 40 | route | Implemented | `MAP_ROUTE_40`, `MAP_ROUTE_40_BATTLE_FRONTIER_GATEHOUSE` | Pending |
| Route 41 | route | Implemented | `MAP_ROUTE_41` | Pending |
| Route 42 | route | Implemented | `MAP_ROUTE_42` | Pending |
| Route 43 | route | Implemented | `MAP_ROUTE_43` | Pending |
| Route 44 | route | Implemented | `MAP_ROUTE_44` | Pending |
| Route 45 | route | Implemented | `MAP_ROUTE_45` | Pending |
| Route 46 | route | Implemented | `MAP_ROUTE_46` | Pending |
| Route 47 | route | Implemented | `MAP_ROUTE_47`, `MAP_CLIFF_EDGE_GATE` | Pending |
| Route 48 | route | Implemented | `MAP_ROUTE_48` | Pending |
| Cliff Edge Gate | landmark | Implemented | `MAP_CLIFF_EDGE_GATE`, `MAP_ROUTE_47` | Pending |
| Cliff Cave | landmark | Implemented | `MAP_CLIFF_CAVE` | Pending |
| Embedded Tower | landmark | Implemented | `MAP_EMBEDDED_TOWER_GROUDON_ROOM` | Pending |
| Dark Cave | landmark | Implemented | `MAP_DARK_CAVE_ROUTE_31_SIDE`, `MAP_DARK_CAVE_ROUTE_45_SIDE` | Pending |
| Sprout Tower | landmark | Implemented | `MAP_SPROUT_TOWER_1F`, `MAP_SPROUT_TOWER_3F`, `MAP_VIOLET_GYM` | Pending |
| Ruins of Alph | landmark | Implemented | `MAP_RUINS_OF_ALPH`, `MAP_RUINS_OF_ALPH_RESEARCH_CENTER`, `MAP_UNION_CAVE_1F` | Pending |
| Union Cave | landmark | Implemented | `MAP_UNION_CAVE_1F`, `MAP_UNION_CAVE_B1F`, `MAP_UNION_CAVE_B2F` | Pending |
| Slowpoke Well | landmark | Implemented | `MAP_SLOWPOKE_WELL_ENTRANCE`, `MAP_SLOWPOKE_WELL_B1F`, `MAP_SLOWPOKE_WELL_B2F` | Pending |
| Ilex Forest | landmark | Implemented | `MAP_ILEX_FOREST` | Pending |
| National Park | landmark | Implemented | `MAP_NATIONAL_PARK`, `MAP_ROUTE_35_NATIONAL_PARK_POKEATHALON_GATEHOUSE` | Pending |
| Burned Tower | landmark | Implemented | `MAP_BURNED_TOWER_1F`, `MAP_BURNED_TOWER_B1F` | Pending |
| Bell Tower | landmark | Implemented | `MAP_BELL_TOWER_1F`, `MAP_BELL_TOWER_10F` | Pending |
| Mt. Mortar | landmark | Implemented | `MAP_MOUNT_MORTAR_1F_ENTRANCE`, `MAP_MOUNT_MORTAR_1F_BACK`, `MAP_MOUNT_MORTAR_B1F` | Pending |
| Whirl Islands | landmark | Implemented | `MAP_WHIRL_ISLANDS_1F`, `MAP_WHIRL_ISLANDS_B3F_LUGIA_CAVE` | Pending |
| Lake of Rage | landmark | Implemented | `MAP_LAKE_OF_RAGE` | Pending |
| Ice Path | landmark | Implemented | `MAP_ICE_PATH_1F`, `MAP_ICE_PATH_B1F` | Pending |
| Dragon's Den | landmark | Implemented | `MAP_DRAGONS_DEN`, `MAP_DRAGONS_DEN_SHRINE` | Pending |
| Safari Zone Gate | facility | Implemented | `MAP_SAFARI_ZONE_GATE` | Pending |
| Safari Zone | facility | Implemented | `MAP_SAFARI_ZONE_ENTRANCE_INTERIOR`, `MAP_SAFARI_ZONE_01` | Pending |
| Pokéathlon Dome | facility | Implemented | `MAP_POKEATHLON_DOME` | Pending |
| Goldenrod Department Store | facility | Implemented | `MAP_GOLDENROD_DEPARTMENT_STORE_1F`, `MAP_GOLDENROD_TUNNEL_WAREHOUSE` | Pending |
| Goldenrod Radio Tower | facility | Implemented | `MAP_GOLDENROD_RADIO_TOWER_1F`, `MAP_GOLDENROD_RADIO_TOWER_5F` | Pending |
| Olivine Lighthouse | facility | Implemented | `MAP_OLIVINE_LIGHTHOUSE_1F`, `MAP_OLIVINE_LIGHTHOUSE_LIGHT_ROOM` | Pending |
| Pokémon Day Care | facility | Implemented | `MAP_ROUTE_34_DAYCARE` | Pending |
| S.S. Aqua | facility | Implemented | `MAP_SS_AQUA_1F`, `MAP_SS_AQUA_OLIVINE_PORT_INTERIOR`, `MAP_SS_AQUA_VERMILION_PORT_INTERIOR` | Pending |
| Victory Road | landmark | Implemented | `MAP_VICTORY_ROAD_1F` | Pending |
| Indigo Plateau | facility | Implemented | `MAP_INDIGO_PLATEAU` | Pending |
| Mt. Silver | landmark | Implemented | `MAP_MOUNT_SILVER`, `MAP_MOUNT_SILVER_CAVE_1F`, `MAP_MOUNT_SILVER_CAVE_SUMMIT`, `MAP_PALLET_TOWN_OAKS_LAB` | Pending |
| Route 26 | route | Implemented | `MAP_ROUTE_26` | Pending |
| Route 27 | route | Implemented | `MAP_ROUTE_27` | Pending |
| Route 28 | route | Implemented | `MAP_ROUTE_28` | Pending |
| Tohjo Falls | landmark | Implemented | `MAP_TOHJO_FALLS` | Pending |
| Pokémon League Reception Gate | facility | Implemented | `MAP_ROUTE_22_POKEMON_LEAGUE_RECEPTION_GATE`, `MAP_PALLET_TOWN_OAKS_LAB` | Pending |
| Bellchime Trail | landmark | Implemented | `MAP_BELLCHIME_TOWER` | Pending |
| Goldenrod Underground | facility | Implemented | `MAP_GOLDENROD_TUNNEL_B1F`, `MAP_GOLDENROD_TUNNEL_B2F`, `MAP_GOLDENROD_TUNNEL_WAREHOUSE` | Pending |
| Team Rocket HQ | facility | Implemented | `MAP_TEAM_ROCKET_HEADQUARTERS_B1F`, `MAP_TEAM_ROCKET_HEADQUARTERS_B2F`, `MAP_TEAM_ROCKET_HEADQUARTERS_B3F` | Pending |
| Frontier Access | facility | Implemented | `MAP_BATTLE_FRONTIER_FRONTIER_ACCESS`, `MAP_ROUTE_40_BATTLE_FRONTIER_GATEHOUSE` | Pending |
| Battle Frontier | facility | Implemented | `MAP_BATTLE_FRONTIER` | Pending |
| MooMoo Farm | facility | Implemented | `MAP_ROUTE_39_MOOMOO_FARM_STABLE`, `MAP_ROUTE_39_MOOMOO_FARM_HOUSE` | Pending |
| Magnet Train Station | facility | Implemented | `MAP_GOLDENROD_MAGNET_TRAIN_STATION_1F` | Pending |

## Validation and online testing

`npm test`: 30 checks (27 real Chromium browser checks and 3 static-data checks).
They cover all 70 groups, all 154 connection buttons, navigation graph reachability,
corrected junctions, nonempty static content, pinned source URL structure, rendered
sources, landmark/access search, mobile width, version labels, unchanged encounter
rendering, and the existing Reader/Planner regression suite. The latter includes
synthetic parsed-save data; it does not replace user real-save or in-game testing.

All 25 existing encounter arrays were compared with the fetched base and remain
unchanged. No Reader parsing, evolution, or Planner logic was changed. Reader's
existing v0.25.35 work was retained; only its release label is synchronized at
v0.25.36.

After publication, open the existing Atlas link and confirm v0.25.36:
https://thedraconicpanda.github.io/pokemon-reader/pokedex-earth/

Try New Bark Town's League approach, the Ruins of Alph junction, Ilex Forest,
Cianwood/Cliff Edge Gate, and the Route 28/Mt. Silver approach. Search “Waterfall”
or “Apricorn” to check the new content search. Open Sources on a location and try
normal connection navigation on desktop/mobile. User outcome testing remains
pending until the user has time; do not wait for another approval to publish a
validated milestone under the established workflow.

Next required work is the full static-content audit (step 2). Do not proceed to
Safari mechanics or the simulator while that audit remains unfinished.
