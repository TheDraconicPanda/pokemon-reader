# Static Atlas audit — v0.25.37

Reviewed on **2026-10-14 (America/Toronto)** against Serebii and Bulbapedia, with
pinned game data used for version-specific details and conflicts.

## Result and scope

**70 of 70 location groups reviewed.** Names, summaries, landmarks, access/story
conditions, and adjacent named groups were checked for every row below. Corrections
or clarifications affect 59 groups; 11 were confirmed without content changes. All
cards now expose both reference sites under Sources. References to the Kanto League
approach use HGSS/Generation IV pages instead of newer-game default pages.

This audit covers the grouped Johto static guide and the League/Mt. Silver approaches
already defined in the [step 1 scope](atlas-static-coverage.md). It is not a complete
Kanto guide, an audit of every item/trainer inventory, or validation of encounter
rates, encounter levels, Safari block calculations, or simulator behavior. Those
remain separate roadmap work. User outcome validation of this release is pending.

The site network settings took effect after the user republished the environment:
actual requests to Serebii, Bulbapedia, and the deployed Atlas returned HTTP 200.
Article titles/body content were checked; an HTTP response alone was not treated as
a completed audit. Generic disambiguation pages for Victory Road and Battle Frontier
were replaced with the Kanto/Generation IV articles, and the separate Mt. Silver Cave
article was included for the grouped mountain entry.

## Important corrections

- Added the missing Route 35 ↔ Route 36 Cut shortcut; there are now **156** directed
  connection buttons. Connections still express adjacency, not unrestricted travel.
- Added the Route 30 Mystery Egg gate, the Route 27 Master Ball/mascot story gate,
  Route 47/Cliff Edge Gate lighthouse requirement, and the Pokéathlon Whitney gate.
- Added Strength in Dark Cave and its one-way restriction toward Route 45.
- Corrected the north-facing Route 40/Frontier Access gate and the southern shared
  National Park gate; clarified optional Cut, Surf, Rock Climb and ledge paths.
- Distinguished Ice Path's mandatory HM07 pickup from teaching/using Waterfall.
- Added the post-transmitter Wednesday low-water condition at Lake of Rage.
- Clarified SoulSilver's Rainbow Wing, Red Orb and Jade Orb requirements without
  copying HeartGold-only Clear Bell requirements.
- Canonical HGSS name is **Goldenrod Tunnel**; “Goldenrod Underground” remains a
  searchable alias, so the previous familiar search still works.
- Completed useful local service notes such as Frontier Access tutors, store floors,
  the train Pass quest, and first/subsequent S.S. Aqua voyage completion.

## Source discrepancies and generation traps

1. **Moomoo Farm:** Serebii's Route 39 prose says five Oran Berries, while Bulbapedia
   says seven. The [pinned game script](https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0251_R39R0201.s)
   consumes one berry and advances flags 0A9, 0AC, 0AD, 0AE, 0AF and 0B0 on feeds
   1–6, then sets healed flag 0AA on feed 7. The guide uses **seven**.
2. **Whirl Islands:** Serebii's prose names the southeastern approach, contrary to
   Bulbapedia's northeastern chamber approach. The guide follows Bulbapedia's
   northeastern route and separately states the verified Surf/Whirlpool and
   SoulSilver Silver Wing/Tidal Bell requirements.
3. **Ice Path:** Serebii's prose calls it three-levelled. Bulbapedia and the pinned
   game maps distinguish **1F, B1F, B2F, B3F**. The guide describes all four floors.
4. **Lighting:** Generation II Flash descriptions for Mt. Mortar/Mt. Silver were not
   carried into the already-lit HGSS caves. Flash remains a visibility aid in Dark
   Cave and Whirl Islands, not an item-based gate to entering the cave.
5. **Game editions:** Serebii's default Victory Road/Indigo Plateau/Route 22 pages
   cover Let's Go; the audit explicitly uses `/4th/` references. Moltres belongs
   to Mt. Silver in HGSS, not Kanto Victory Road. Bulbapedia's generic Battle Frontier
   and Victory Road pages were not counted as substantive location evidence.
6. **Out-of-scope schedules:** Conflicting Morty rematch/photography prose was not
   imported into Bellchime Trail, which currently describes its static path/features.
   The guide does not claim a completed NPC schedule or encounter-mechanics audit.

## Full coverage record

Every row's Sources links were retrieved successfully and its current static facts
were compared with the appropriate HGSS sections. The machine-readable
[audit ledger](atlas-static-audit.json) records reviewed fields, changed fields,
per-location notes, reference titles, retrieval hashes, and available Bulbapedia
revision IDs. Hashes identify the fetched evidence, not proof that later website
versions are identical. Raw page copies are temporary research files, not bundled
into the application.

| Location | Result | Checks/corrections | References |
| --- | --- | --- | --- |
| New Bark Town | Confirmed | Confirmed Elm's lab/home, western Route 29, and eastern Surf approach to Route 27. | [Serebii](https://www.serebii.net/pokearth/johto/newbarktown.shtml) · [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/New_Bark_Town) |
| Cherrygrove City | Corrected | Confirmed the HGSS Running Shoes reward; added Rock Climb for the optional cliff beyond the offshore island. | [Serebii](https://www.serebii.net/pokearth/johto/cherrygrovecity.shtml) · [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Cherrygrove_City) |
| Violet City | Corrected | Confirmed all three route exits, school/trade house, and Sprout Tower; clarified Elder Li gate and Zephyr/Rock Smash permission. | [Serebii](https://www.serebii.net/pokearth/johto/violetcity.shtml) · [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Violet_City) |
| Azalea Town | Corrected | Confirmed Kurt, kiln, Gym, Well and west/east exits; made Bugsy/rival/Cut progression explicit. | [Serebii](https://www.serebii.net/pokearth/johto/azaleatown.shtml) · [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Azalea_Town) |
| Goldenrod City | Corrected | Confirmed major facilities, Route 34/35 and train service; added Name Rater, friendship checker, Bill and Plain Badge/SquirtBottle access. | [Serebii](https://www.serebii.net/pokearth/johto/goldenrodcity.shtml) · [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Goldenrod_City) |
| Ecruteak City | Corrected | Confirmed tower approach and three route exits; added the HGSS Surf reward and Burned Tower/Morty progression. | [Serebii](https://www.serebii.net/pokearth/johto/ecruteakcity.shtml) · [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Ecruteak_City) |
| Olivine City | Confirmed | Confirmed lighthouse, port, café, route exits and Jasmine's return after treating Amphy; no content change needed. | [Serebii](https://www.serebii.net/pokearth/johto/olivinecity.shtml) · [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Olivine_City) |
| Cianwood City | Corrected | Confirmed pharmacy, Chuck, Cameron and Cliff Edge Gate; added Suicune/Eusine and Fist Badge/optional shore notes. | [Serebii](https://www.serebii.net/pokearth/johto/cianwoodcity.shtml) · [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Cianwood_City) |
| Mahogany Town | Corrected | Replaced a vague eastern story gate with the HGSS Radio Tower requirement; confirmed HQ/Gym/Whirlpool progression. | [Serebii](https://www.serebii.net/pokearth/johto/mahoganytown.shtml) · [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Mahogany_Town) |
| Blackthorn City | Corrected | Confirmed Den, Ice Path and Route 45; added the other house tutors and the elder/Rising Badge requirement. | [Serebii](https://www.serebii.net/pokearth/johto/blackthorncity.shtml) · [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Blackthorn_City) |
| Route 29 | Corrected | Confirmed three adjacencies and one-way ledges; added optional Cut shortcuts without making Cut mandatory. | [Serebii](https://www.serebii.net/pokearth/johto/route29.shtml) · [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Johto_Route_29) |
| Route 30 | Corrected | Confirmed branches and houses; added the Mystery Egg delivery gate and optional Cut/Surf. Ruins of Alph is not adjacent. | [Serebii](https://www.serebii.net/pokearth/johto/route30.shtml) · [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Johto_Route_30) |
| Route 31 | Corrected | Confirmed Violet/Dark Cave/Route 30; added Kenya Mail delivery and optional Cut/Surf shortcuts. | [Serebii](https://www.serebii.net/pokearth/johto/route31.shtml) · [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Johto_Route_31) |
| Route 32 | Corrected | Confirmed Ruins/Union Cave gates, Old Rod and Egg gate; retained game-script Badge evidence and added optional move access. | [Serebii](https://www.serebii.net/pokearth/johto/route32.shtml) · [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Johto_Route_32) |
| Route 33 | Confirmed | Confirmed both endpoints and always-raining HGSS conditions; no change needed. | [Serebii](https://www.serebii.net/pokearth/johto/route33.shtml) · [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Johto_Route_33) |
| Route 34 | Confirmed | Confirmed Ilex/Goldenrod/Day Care and the Surf-only coastal side area; no change needed. | [Serebii](https://www.serebii.net/pokearth/johto/route34.shtml) · [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Johto_Route_34) |
| Route 35 | Corrected | Added the omitted Cut shortcut to Route 36, Kenya Mail event and pond access; confirmed shared park/Dome gate. | [Serebii](https://www.serebii.net/pokearth/johto/route35.shtml) · [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Johto_Route_35) |
| Route 36 | Corrected | Added the reciprocal Route 35 shortcut with Cut; confirmed Sudowoodo/SquirtBottle/Plain Badge and other junctions. | [Serebii](https://www.serebii.net/pokearth/johto/route36.shtml) · [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Johto_Route_36) |
| Route 37 | Corrected | Confirmed Route 36/Ecruteak; added the north-to-south restriction on the eastern Apricorn path. | [Serebii](https://www.serebii.net/pokearth/johto/route37.shtml) · [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Johto_Route_37) |
| Route 38 | Corrected | Confirmed east-west alignment and Route 39; added the raised section reached with Rock Climb from Route 39. | [Serebii](https://www.serebii.net/pokearth/johto/route38.shtml) · [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Johto_Route_38) |
| Route 39 | Corrected | Corrected Route 38's junction direction to east; added optional Rock Climb connection to the raised Route 38 area. | [Serebii](https://www.serebii.net/pokearth/johto/route39.shtml) · [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Johto_Route_39) |
| Route 40 | Corrected | Corrected Frontier Access gate direction to north; confirmed Surf crossing and Hall of Fame access. | [Serebii](https://www.serebii.net/pokearth/johto/route40.shtml) · [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Johto_Route_40) |
| Route 41 | Confirmed | Confirmed Surf crossing and Whirlpool island approaches; neither the main Cianwood crossing nor the card requires a Lugia event. | [Serebii](https://www.serebii.net/pokearth/johto/route41.shtml) · [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Johto_Route_41) |
| Route 42 | Corrected | Confirmed three Mt. Mortar entrances; clarified the cave alternative to Surf, Cut grove and optional Rock Climb; added Suicune. | [Serebii](https://www.serebii.net/pokearth/johto/route42.shtml) · [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Johto_Route_42) |
| Route 43 | Corrected | Confirmed alternative grass/toll paths; specified the 1,000-Pokédollar toll and optional Surf approach. | [Serebii](https://www.serebii.net/pokearth/johto/route43.shtml) · [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Johto_Route_43) |
| Route 44 | Corrected | Specified the HGSS Radio Tower gate and Surf-only grass area; retained Ice Path adjacency. | [Serebii](https://www.serebii.net/pokearth/johto/route44.shtml) · [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Johto_Route_44) |
| Route 45 | Corrected | Confirmed southbound-only descent; distinguished the non-Surfable river from the southern pond. | [Serebii](https://www.serebii.net/pokearth/johto/route45.shtml) · [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Johto_Route_45) |
| Route 46 | Corrected | Confirmed early lower access and ledges; added the HGSS Strength condition for reaching the upper part via Dark Cave. | [Serebii](https://www.serebii.net/pokearth/johto/route46.shtml) · [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Johto_Route_46) |
| Route 47 | Corrected | Added the lighthouse opening condition and Surf/Waterfall grass access; confirmed cave and Embedded Tower routes. | [Serebii](https://www.serebii.net/pokearth/johto/route47.shtml) · [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Johto_Route_47) |
| Route 48 | Confirmed | Confirmed linear Route 47/Safari Gate connection and grass; no change needed. | [Serebii](https://www.serebii.net/pokearth/johto/route48.shtml) · [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Johto_Route_48) |
| Cliff Edge Gate | Corrected | Added the Amphy construction gate and clarified that Rock Climb/Surf concern optional lower pond exploration. | [Serebii](https://www.serebii.net/pokearth/johto/cliffedgegate.shtml) · [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Cliff_Edge_Gate) |
| Cliff Cave | Corrected | Confirmed three-level Route 47 exits; added National Pokédex requirement for lower-floor breakable rocks. | [Serebii](https://www.serebii.net/pokearth/johto/cliffcave.shtml) · [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Cliff_Cave) |
| Embedded Tower | Corrected | Expanded SoulSilver Red Orb requirements and restricted Jade Orb eligibility to both Embedded Tower-origin legendaries. | [Serebii](https://www.serebii.net/pokearth/johto/embeddedtower.shtml) · [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Embedded_Tower) |
| Dark Cave | Corrected | Added the missing HGSS Strength requirement and south-to-Route-45 ledge restriction; Flash is visibility aid, not a programmatic entry gate. | [Serebii](https://www.serebii.net/pokearth/johto/darkcave.shtml) · [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Dark_Cave) |
| Sprout Tower | Corrected | Made Elder Li/Falkner progression explicit and kept the HGSS reward TM70 distinct from Generation II HM05. | [Serebii](https://www.serebii.net/pokearth/johto/sprouttower.shtml) · [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Sprout_Tower) |
| Ruins of Alph | Corrected | Confirmed Routes 32/36 and Union Cave; spelled out Surf/Strength approaches and version-correct hidden-room triggers. | [Serebii](https://www.serebii.net/pokearth/johto/ruinsofalph.shtml) · [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Ruins_of_Alph) |
| Union Cave | Corrected | Confirmed main passage and Alph branches; added the Friday B2F Lapras landmark without changing encounter tables. | [Serebii](https://www.serebii.net/pokearth/johto/unioncave.shtml) · [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Union_Cave) |
| Slowpoke Well | Confirmed | Confirmed Kurt/Rocket incident, Azalea entrance and Surf/Strength lower-floor access; no change needed. | [Serebii](https://www.serebii.net/pokearth/johto/slowpokewell.shtml) · [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Slowpoke_Well) |
| Ilex Forest | Confirmed | Confirmed two Farfetch'd event, Headbutt tutor, shrine, Cut/Hive Badge and endpoints; no change needed. | [Serebii](https://www.serebii.net/pokearth/johto/ilexforest.shtml) · [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Ilex_Forest) |
| National Park | Corrected | Corrected shared gate wording from north to south; confirmed contest days and added optional Rock Climb area. | [Serebii](https://www.serebii.net/pokearth/johto/nationalpark.shtml) · [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/National_Park) |
| Burned Tower | Corrected | Confirmed two floors and beast event; clarified rival/Morty progression and optional Strength/Rock Smash. | [Serebii](https://www.serebii.net/pokearth/johto/burnedtower.shtml) · [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Burned_Tower) |
| Bell Tower | Corrected | Kept SoulSilver's Rainbow Wing and specified Pewter source; excluded HeartGold-only Clear Bell requirement. | [Serebii](https://www.serebii.net/pokearth/johto/belltower.shtml) · [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Bell_Tower) |
| Mt. Mortar | Corrected | Confirmed entrances, cave sections and Kiyo; specified Tyrogue/empty slot and optional Rock Climb; excluded Generation II Flash requirement. | [Serebii](https://www.serebii.net/pokearth/johto/mt.mortar.shtml) · [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Mt._Mortar) |
| Whirl Islands | Corrected | Confirmed Surf/Whirlpool/visibility and SoulSilver Silver Wing/Tidal Bell; used the northeastern chamber approach from Bulbapedia, not Serebii's contradictory southeastern sentence. | [Serebii](https://www.serebii.net/pokearth/johto/whirlislands.shtml) · [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Whirl_Islands) |
| Lake of Rage | Corrected | Added the post-transmitter Wednesday low-water condition and outer Cut maze to verified Gyarados/Lance landmarks. | [Serebii](https://www.serebii.net/pokearth/johto/lakeofrage.shtml) · [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Lake_of_Rage) |
| Ice Path | Corrected | Clarified mandatory HM07 pickup versus learning/using Waterfall, retained Strength puzzle and all four floors, and noted optional Rock Smash. | [Serebii](https://www.serebii.net/pokearth/johto/icepath.shtml) · [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Ice_Path) |
| Dragon's Den | Corrected | Confirmed Clair entry and Surf/Whirlpool; clarified elder quiz/Rising Badge and first-answer ExtremeSpeed reward. | [Serebii](https://www.serebii.net/pokearth/johto/dragon'sden.shtml) · [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Dragon's_Den) |
| Safari Zone Gate | Confirmed | Confirmed Route 48, reception, bazaar and Pokémon Center; no change needed. | [Serebii](https://www.serebii.net/pokearth/johto/safarizonegate.shtml) · [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Safari_Zone_Gate) |
| Safari Zone | Corrected | Confirmed Amphy opening, fee, 30 Balls, six-of-twelve layout and no step limit; added National Dex block-unlock condition only. Encounter/block calculations remain unaudited. | [Serebii](https://www.serebii.net/pokearth/johto/safarizone.shtml) · [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Johto_Safari_Zone) |
| Pokéathlon Dome | Corrected | Added missing Whitney gate and Apricorn Box condition; confirmed shared gate and sports/reward services. | [Serebii](https://www.serebii.net/pokearth/johto/pokeathlondome.shtml) · [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9athlon_Dome) |
| Goldenrod Department Store | Corrected | Confirmed entrance and warehouse linkage; added floor service categories and HGSS sixth-floor raffle without copying Gen II-only Mystery Gift details. | [Serebii](https://www.serebii.net/pokearth/johto/goldenrodcity.shtml) · [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Goldenrod_Department_Store) |
| Goldenrod Radio Tower | Corrected | Expanded Basement Key/Director/Card Key chain and SoulSilver Silver Wing award; confirmed post-seventh-Badge takeover. | [Serebii](https://www.serebii.net/pokearth/johto/radiotower.shtml) · [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Goldenrod_Radio_Tower) |
| Olivine Lighthouse | Corrected | Confirmed SecretPotion/Jasmine incident; added the elevator shortcut unlocked after first speaking to Jasmine. | [Serebii](https://www.serebii.net/pokearth/johto/shininglighthouse.shtml) · [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Glitter_Lighthouse) |
| Pokémon Day Care | Corrected | Confirmed Route 34 and Johto couple contact; specified two slots and compatible-pair Egg service using Johto Route 34 reference in addition to the generic Day Care article. | [Serebii](https://www.serebii.net/pokearth/johto/route34.shtml) · [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9mon_Day_Care) |
| S.S. Aqua | Corrected | Confirmed Ticket and directional sailing days; added initial granddaughter quest versus later cabin-bed arrival. | [Serebii](https://www.serebii.net/pokearth/johto/ssaqua.shtml) · [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/S.S._Aqua) |
| Victory Road | Corrected | Used Kanto and HGSS-specific pages rather than disambiguation/Let's Go; confirmed Strength and rival, excluded ordinary trainers and Moltres. | [Serebii](https://www.serebii.net/pokearth/kanto/4th/victoryroad.shtml) · [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Victory_Road_(Kanto)) |
| Indigo Plateau | Corrected | Used the HGSS Serebii page; confirmed Victory Road entry, lobby services and consecutive Elite Four/Champion challenge. | [Serebii](https://www.serebii.net/pokearth/kanto/4th/indigoplateau.shtml) · [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Indigo_Plateau) |
| Mt. Silver | Corrected | Kept grouped exterior/cave scope and all-16-Badge access; checked the separate cave article and excluded Gen II Flash requirement. | [Serebii](https://www.serebii.net/pokearth/johto/mt.silver.shtml) · [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Mt._Silver) |
| Route 26 | Corrected | Confirmed houses and Reception Gate; added healing and the one-way return shortcuts. | [Serebii](https://www.serebii.net/pokearth/kanto/route26.shtml) · [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Kanto_Route_26) |
| Route 27 | Corrected | Added HGSS Elm Master Ball and mascot-story departure gates plus optional Whirlpool islands; retained Surf/Tohjo Waterfall distinction. | [Serebii](https://www.serebii.net/pokearth/kanto/route27.shtml) · [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Kanto_Route_27) |
| Route 28 | Corrected | Confirmed Reception Gate/Mt. Silver and all-16-Badge access; added optional Cut celebrity path and Surf. | [Serebii](https://www.serebii.net/pokearth/kanto/route28.shtml) · [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Kanto_Route_28) |
| Tohjo Falls | Corrected | Confirmed Surf/Waterfall and both Route 27 portals; added the explicitly event-only Giovanni room context. | [Serebii](https://www.serebii.net/pokearth/kanto/tohjofalls.shtml) · [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Tohjo_Falls) |
| Pokémon League Reception Gate | Corrected | Confirmed four-way junction and Badge gates; added HGSS Viridian-visit eastern unlock instead of Gen II Snorlax rule. | [Serebii](https://www.serebii.net/pokearth/kanto/4th/route22.shtml) · [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9mon_League_Reception_Gate) |
| Bellchime Trail | Confirmed | Confirmed Barrier Station/Bell Tower endpoints and autumn trees; no change needed. Rematch schedules were not added from conflicting source prose. | [Serebii](https://www.serebii.net/pokearth/johto/bellchimetrail.shtml) · [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Bellchime_Trail) |
| Goldenrod Tunnel | Corrected | Changed canonical name to HGSS Goldenrod Tunnel with the former name searchable; confirmed shops, photo activity and basement/warehouse connection. | [Serebii](https://www.serebii.net/pokearth/johto/goldenrodunderground.shtml) · [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Goldenrod_Underground) |
| Team Rocket HQ | Corrected | Confirmed three basements, passwords and Lance; added HM05 Whirlpool reward and Glacier Badge permission. | [Serebii](https://www.serebii.net/pokearth/johto/rockethideout.shtml) · [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Team_Rocket_HQ) |
| Frontier Access | Corrected | Corrected its Route 40 gate direction to north; confirmed Hall of Fame gate and added BP move-tutor house. | [Serebii](https://www.serebii.net/pokearth/johto/frontieraccess.shtml) · [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Frontier_Access) |
| Battle Frontier | Confirmed | Used the Generation IV article instead of disambiguation; confirmed all five Johto facilities and Frontier Access/Hall of Fame scope. | [Serebii](https://www.serebii.net/pokearth/johto/battlefrontier.shtml) · [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Battle_Frontier_(Generation_IV)) |
| MooMoo Farm | Corrected | Confirmed Route 39, Milk and healing event; resolved five-versus-seven source discrepancy using pinned game script's seven-feed flag chain and added Seal Case. | [Serebii](https://www.serebii.net/pokearth/johto/route39.shtml) · [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Moomoo_Farm) |
| Magnet Train Station | Corrected | Confirmed stations, restored Power Plant and Pass; added Copycat Lost Item source and independence from ship sailing days. | [Serebii](https://www.serebii.net/pokearth/johto/goldenrodcity.shtml) · [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Magnet_Train) |

## Validation and publication

`npm test` runs 33 checks, including 28 real Chromium browser checks and 5 static-data/
audit-ledger checks. Tests cover all 70 groups, all 156 connection buttons, graph
reachability, the Cut shortcut, the Tunnel alias, reference links, scoped audit
coverage, mobile width, and the current Reader/Planner regressions. A Reader reload
poll now waits for the document and theme controls to exist; its actual theme and
persistence assertions are retained.

All 25 encounter arrays were compared byte-for-byte with the baseline and remain
unchanged. Reader/Planner application logic is unchanged apart from the Reader
release label; parsing/evolution and real-save behavior are not certified by this
static audit. No Safari simulator or encounter mechanics were added.

After deployment, check **v0.25.37** at the usual Atlas URL:
https://thedraconicpanda.github.io/pokemon-reader/pokedex-earth/

Try the Route 35 → Route 36 connection and its Cut note, search “Goldenrod
Underground”, open Sources on any location, and inspect the Route 27/47, Dark Cave,
Ice Path, Pokéathlon and Lake of Rage access notes. The next ordered task is Safari
Zone data/mechanics; this audit does not declare that later work complete.
