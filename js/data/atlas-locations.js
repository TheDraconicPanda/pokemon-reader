// Johto and Kanto HGSS location groups. Kanto reproduction: scripts/build-kanto-atlas.py.
export const ATLAS_LOCATIONS = Object.freeze([
  {
    "name": "New Bark Town",
    "type": "town",
    "region": "Johto",
    "details": "Starting town; home of Professor Elm's laboratory.",
    "landmarks": [
      "Professor Elm's laboratory and the player's home",
      "Starting point of the Johto journey"
    ],
    "access": [
      "Route 29 leads west to Cherrygrove",
      "Surf east to Route 27 for the Pokémon League approach"
    ],
    "connections": [
      "Route 29",
      "Route 27"
    ],
    "sources": [
      {
        "label": "Serebii location reference",
        "url": "https://www.serebii.net/pokearth/johto/newbarktown.shtml"
      },
      {
        "label": "Bulbapedia location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/New_Bark_Town"
      },
      {
        "label": "Map entrances",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/eventdata/zone_event/057_T20.json"
      },
      {
        "label": "Game events",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0842_T20.s"
      },
      {
        "label": "In-game text",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/msgdata/msg/msg_0542_T20.json"
      },
      {
        "label": "Supporting game events 1",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0221_R27.s"
      }
    ],
    "mapIds": [
      "MAP_NEW_BARK",
      "MAP_ROUTE_27"
    ],
    "audit": {
      "scope": "static location information",
      "reviewed_on": "2026-10-14"
    }
  },
  {
    "name": "Cherrygrove City",
    "type": "town",
    "region": "Johto",
    "details": "Coastal town reached by Route 29.",
    "landmarks": [
      "Guide Gent introduces the town and provides Running Shoes",
      "Pokémon Center, Poké Mart, and coastal shoreline"
    ],
    "access": [
      "Route 29 is east and Route 30 leads north",
      "Surf opens the offshore part of the coast",
      "Rock Climb reaches the cliff beyond the offshore island; it is not needed to visit the city"
    ],
    "connections": [
      "Route 29",
      "Route 30"
    ],
    "sources": [
      {
        "label": "Serebii location reference",
        "url": "https://www.serebii.net/pokearth/johto/cherrygrovecity.shtml"
      },
      {
        "label": "Bulbapedia location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Cherrygrove_City"
      },
      {
        "label": "Map entrances",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/eventdata/zone_event/064_T21.json"
      },
      {
        "label": "Game events",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0850_T21.s"
      },
      {
        "label": "In-game text",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/msgdata/msg/msg_0550_T21.json"
      },
      {
        "label": "Supporting game events 1",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0855_T21R0401.s"
      }
    ],
    "mapIds": [
      "MAP_CHERRYGROVE",
      "MAP_CHERRYGROVE_GUIDE_GENT_HOUSE"
    ],
    "audit": {
      "scope": "static location information",
      "reviewed_on": "2026-10-14"
    }
  },
  {
    "name": "Violet City",
    "type": "town",
    "region": "Johto",
    "details": "Home of the Violet Gym and Sprout Tower.",
    "landmarks": [
      "Falkner's Flying-type Gym and Sprout Tower",
      "Pokémon School and the Bellsprout-for-Onix trade house"
    ],
    "access": [
      "Routes 31, 32, and 36 connect through the city and its gates",
      "Sprout Tower is reached from within the city",
      "Defeat Elder Li in Sprout Tower before challenging Falkner; the Zephyr Badge permits Rock Smash outside battle"
    ],
    "connections": [
      "Route 31",
      "Route 32",
      "Route 36",
      "Sprout Tower"
    ],
    "sources": [
      {
        "label": "Serebii location reference",
        "url": "https://www.serebii.net/pokearth/johto/violetcity.shtml"
      },
      {
        "label": "Bulbapedia location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Violet_City"
      },
      {
        "label": "Map entrances",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/eventdata/zone_event/070_T22.json"
      },
      {
        "label": "Game events",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0857_T22.s"
      },
      {
        "label": "In-game text",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/msgdata/msg/msg_0556_T22.json"
      },
      {
        "label": "Supporting game events 1",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0859_T22GYM0101.s"
      }
    ],
    "mapIds": [
      "MAP_VIOLET",
      "MAP_VIOLET_GYM"
    ],
    "audit": {
      "scope": "static location information",
      "reviewed_on": "2026-10-14"
    }
  },
  {
    "name": "Azalea Town",
    "type": "town",
    "region": "Johto",
    "details": "Home of the Azalea Gym and Slowpoke Well.",
    "landmarks": [
      "Bugsy's Bug-type Gym, Kurt's Apricorn workshop, and the charcoal kiln",
      "Slowpoke Well and the gate to Ilex Forest"
    ],
    "access": [
      "Arrive from Route 33",
      "Resolve the Slowpoke Well incident before challenging the Gym and continuing the story west",
      "Defeat Bugsy and the rival before the Ilex Forest progression; the Hive Badge permits Cut outside battle"
    ],
    "connections": [
      "Route 33",
      "Ilex Forest",
      "Slowpoke Well"
    ],
    "sources": [
      {
        "label": "Serebii location reference",
        "url": "https://www.serebii.net/pokearth/johto/azaleatown.shtml"
      },
      {
        "label": "Bulbapedia location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Azalea_Town"
      },
      {
        "label": "Map entrances",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/eventdata/zone_event/071_T23.json"
      },
      {
        "label": "Game events",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0866_T23.s"
      },
      {
        "label": "In-game text",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/msgdata/msg/msg_0564_T23.json"
      },
      {
        "label": "Supporting game events 1",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0874_T23R0501.s"
      }
    ],
    "mapIds": [
      "MAP_AZALEA",
      "MAP_AZALEA_KURT_HOUSE"
    ],
    "audit": {
      "scope": "static location information",
      "reviewed_on": "2026-10-14"
    }
  },
  {
    "name": "Goldenrod City",
    "type": "town",
    "region": "Johto",
    "details": "Large city with the Goldenrod Gym, Department Store, and Radio Tower.",
    "landmarks": [
      "Whitney's Normal-type Gym, Department Store, Radio Tower, and Underground",
      "Bike Shop, Flower Shop, Game Corner, Global Terminal, and Magnet Train station",
      "Name Rater, friendship checker, and Bill's house provide additional Pokémon services"
    ],
    "access": [
      "Route 34 is south and Route 35 is north",
      "Train travel is a separate service requiring the restored service and a Pass",
      "Whitney's Plain Badge permits Strength outside battle and is required to obtain the SquirtBottle"
    ],
    "connections": [
      "Route 34",
      "Route 35",
      "Goldenrod Department Store",
      "Goldenrod Radio Tower",
      "Goldenrod Tunnel",
      "Magnet Train Station"
    ],
    "sources": [
      {
        "label": "Serebii location reference",
        "url": "https://www.serebii.net/pokearth/johto/goldenrodcity.shtml"
      },
      {
        "label": "Bulbapedia location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Goldenrod_City"
      },
      {
        "label": "Map entrances",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/eventdata/zone_event/073_T25.json"
      },
      {
        "label": "Game events",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0885_T25.s"
      },
      {
        "label": "In-game text",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/msgdata/msg/msg_0581_T25.json"
      },
      {
        "label": "Supporting game events 1",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0896_T25R0601.s"
      },
      {
        "label": "Supporting game events 2",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0893_T25R0501.s"
      }
    ],
    "mapIds": [
      "MAP_GOLDENROD",
      "MAP_GOLDENROD_FLOWER_SHOP",
      "MAP_GOLDENROD_MAGNET_TRAIN_STATION_1F"
    ],
    "audit": {
      "scope": "static location information",
      "reviewed_on": "2026-10-14"
    }
  },
  {
    "name": "Ecruteak City",
    "type": "town",
    "region": "Johto",
    "details": "Home of the Ecruteak Gym and the towers tied to Johto's legends.",
    "landmarks": [
      "Morty's Ghost-type Gym, Burned Tower, and Dance Theater",
      "Barrier Station leads toward Bellchime Trail and Bell Tower",
      "Rescuing the Kimono Girl from the Rocket Grunt in the Dance Theater earns HM03 Surf"
    ],
    "access": [
      "Routes 37, 38, and 42 lead south, west, and east",
      "The Barrier Station checks the Fog Badge before letting the player toward the tower",
      "Awaken the legendary beasts in Burned Tower before challenging Morty; the Fog Badge permits Surf outside battle"
    ],
    "connections": [
      "Route 37",
      "Route 38",
      "Route 42",
      "Burned Tower",
      "Bellchime Trail"
    ],
    "sources": [
      {
        "label": "Serebii location reference",
        "url": "https://www.serebii.net/pokearth/johto/ecruteakcity.shtml"
      },
      {
        "label": "Bulbapedia location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Ecruteak_City"
      },
      {
        "label": "Map entrances",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/eventdata/zone_event/075_T27.json"
      },
      {
        "label": "Game events",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0920_T27.s"
      },
      {
        "label": "In-game text",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/msgdata/msg/msg_0612_T27.json"
      },
      {
        "label": "Supporting game events 1",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0926_T27R0201.s"
      },
      {
        "label": "Supporting game events 2",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0928_T27R0501.s"
      }
    ],
    "mapIds": [
      "MAP_ECRUTEAK",
      "MAP_ECRUTEAK_BELL_TOWER_BARRIER_STATION",
      "MAP_ECRUTEAK_DANCE_THEATER"
    ],
    "audit": {
      "scope": "static location information",
      "reviewed_on": "2026-10-14"
    }
  },
  {
    "name": "Olivine City",
    "type": "town",
    "region": "Johto",
    "details": "Port city with a lighthouse and the Olivine Gym.",
    "landmarks": [
      "Jasmine's Steel-type Gym, Glitter Lighthouse, and the café",
      "Port serving the S.S. Aqua"
    ],
    "access": [
      "Route 39 is north and Route 40 is west",
      "Jasmine returns to the Gym after the lighthouse's sick Ampharos is treated"
    ],
    "connections": [
      "Route 39",
      "Route 40",
      "Olivine Lighthouse",
      "S.S. Aqua"
    ],
    "sources": [
      {
        "label": "Serebii location reference",
        "url": "https://www.serebii.net/pokearth/johto/olivinecity.shtml"
      },
      {
        "label": "Bulbapedia location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Olivine_City"
      },
      {
        "label": "Map entrances",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/eventdata/zone_event/074_T26.json"
      },
      {
        "label": "Game events",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0911_T26.s"
      },
      {
        "label": "In-game text",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/msgdata/msg/msg_0604_T26.json"
      },
      {
        "label": "Supporting game events 1",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0066_D27R0107.s"
      }
    ],
    "mapIds": [
      "MAP_OLIVINE",
      "MAP_OLIVINE_LIGHTHOUSE_LIGHT_ROOM"
    ],
    "audit": {
      "scope": "static location information",
      "reviewed_on": "2026-10-14"
    }
  },
  {
    "name": "Cianwood City",
    "type": "town",
    "region": "Johto",
    "details": "Coastal town reached by crossing the sea west of Olivine.",
    "landmarks": [
      "Chuck's Fighting-type Gym, the pharmacy, and Cameron's house",
      "Chuck's wife gives HM02 Fly after the Gym victory",
      "Suicune and Eusine appear in the northern part of town after the Burned Tower event"
    ],
    "access": [
      "Cross Route 41 using Surf",
      "Cliff Edge Gate is the entrance to the Route 47 corridor",
      "The Fist Badge permits Fly outside battle; Rock Smash is used for optional shore exploration"
    ],
    "connections": [
      "Route 41",
      "Cliff Edge Gate"
    ],
    "sources": [
      {
        "label": "Serebii location reference",
        "url": "https://www.serebii.net/pokearth/johto/cianwoodcity.shtml"
      },
      {
        "label": "Bulbapedia location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Cianwood_City"
      },
      {
        "label": "Map entrances",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/eventdata/zone_event/072_T24.json"
      },
      {
        "label": "Game events",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0875_T24.s"
      },
      {
        "label": "In-game text",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/msgdata/msg/msg_0572_T24.json"
      },
      {
        "label": "Supporting game events 1",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0881_T24R0501.s"
      }
    ],
    "mapIds": [
      "MAP_CIANWOOD",
      "MAP_CIANWOOD_PHARMACY"
    ],
    "audit": {
      "scope": "static location information",
      "reviewed_on": "2026-10-14"
    }
  },
  {
    "name": "Mahogany Town",
    "type": "town",
    "region": "Johto",
    "details": "Small town near the Lake of Rage.",
    "landmarks": [
      "Pryce's Ice-type Gym and the souvenir shop hiding Team Rocket HQ",
      "Lake of Rage investigation begins north of town"
    ],
    "access": [
      "Routes 42, 43, and 44 connect west, north, and east",
      "Clear the local Team Rocket HQ to challenge Pryce; the Glacier Badge permits Whirlpool outside battle",
      "The eastern road opens after the Goldenrod Radio Tower takeover is resolved, not merely after buying a RageCandyBar"
    ],
    "connections": [
      "Route 42",
      "Route 43",
      "Route 44",
      "Team Rocket HQ"
    ],
    "sources": [
      {
        "label": "Serebii location reference",
        "url": "https://www.serebii.net/pokearth/johto/mahoganytown.shtml"
      },
      {
        "label": "Bulbapedia location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Mahogany_Town"
      },
      {
        "label": "Map entrances",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/eventdata/zone_event/084_T28.json"
      },
      {
        "label": "Game events",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0930_T28.s"
      },
      {
        "label": "In-game text",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/msgdata/msg/msg_0620_T28.json"
      },
      {
        "label": "Supporting game events 1",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0088_D35R0101.s"
      }
    ],
    "mapIds": [
      "MAP_MAHOGANY",
      "MAP_MAHOGANY_SOUVENIR_SHOP"
    ],
    "audit": {
      "scope": "static location information",
      "reviewed_on": "2026-10-14"
    }
  },
  {
    "name": "Blackthorn City",
    "type": "town",
    "region": "Johto",
    "details": "Northern Johto city with the Blackthorn Gym and Dragon's Den.",
    "landmarks": [
      "Clair's Dragon-type Gym and Dragon's Den",
      "Move Deleter and Move Reminder share a house",
      "The Move Deleter/Reminder house also contains Draco Meteor and first-partner Pokémon move tutors"
    ],
    "access": [
      "Ice Path is the approach from Route 44",
      "Route 45 descends south, while the Den entrance is behind the Gym",
      "Defeat Clair and complete the Dragon's Den elder's test to receive the Rising Badge and use Waterfall outside battle"
    ],
    "connections": [
      "Route 45",
      "Ice Path",
      "Dragon's Den"
    ],
    "sources": [
      {
        "label": "Serebii location reference",
        "url": "https://www.serebii.net/pokearth/johto/blackthorncity.shtml"
      },
      {
        "label": "Bulbapedia location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Blackthorn_City"
      },
      {
        "label": "Map entrances",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/eventdata/zone_event/086_T30.json"
      },
      {
        "label": "Game events",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0941_T30.s"
      },
      {
        "label": "In-game text",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/msgdata/msg/msg_0629_T30.json"
      }
    ],
    "mapIds": [
      "MAP_BLACKTHORN"
    ],
    "audit": {
      "scope": "static location information",
      "reviewed_on": "2026-10-14"
    }
  },
  {
    "name": "Route 29",
    "type": "route",
    "region": "Johto",
    "details": "Connects New Bark Town and Cherrygrove City.",
    "landmarks": [
      "First route between New Bark Town and Cherrygrove City",
      "Gatehouse branches north to Route 46"
    ],
    "access": [
      "Travel west from New Bark or east from Cherrygrove",
      "Ledges affect which paths can be taken in each direction",
      "Cut opens optional shortcuts; the main route remains walkable without it"
    ],
    "connections": [
      "New Bark Town",
      "Cherrygrove City",
      "Route 46"
    ],
    "sources": [
      {
        "label": "Serebii location reference",
        "url": "https://www.serebii.net/pokearth/johto/route29.shtml"
      },
      {
        "label": "Bulbapedia location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_29"
      },
      {
        "label": "Map entrances",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/eventdata/zone_event/030_R29.json"
      },
      {
        "label": "Game events",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0225_R29.s"
      },
      {
        "label": "In-game text",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/msgdata/msg/msg_0373_R29.json"
      }
    ],
    "mapIds": [
      "MAP_ROUTE_29"
    ],
    "audit": {
      "scope": "static location information",
      "reviewed_on": "2026-10-14"
    }
  },
  {
    "name": "Route 30",
    "type": "route",
    "region": "Johto",
    "details": "North of Cherrygrove City; leads toward Mr. Pokémon's house.",
    "landmarks": [
      "Mr. Pokémon's house on the eastern branch",
      "Apricorn Box house and Apricorn trees"
    ],
    "access": [
      "Cherrygrove is south and Route 31 continues toward Violet",
      "The western path is initially blocked until the Mystery Egg has been delivered to Professor Elm",
      "Cut links the two branches; Surf opens pond exploration. There is no Ruins of Alph entrance here"
    ],
    "connections": [
      "Cherrygrove City",
      "Route 31"
    ],
    "sources": [
      {
        "label": "Serebii location reference",
        "url": "https://www.serebii.net/pokearth/johto/route30.shtml"
      },
      {
        "label": "Bulbapedia location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_30"
      },
      {
        "label": "Map entrances",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/eventdata/zone_event/031_R30.json"
      },
      {
        "label": "Game events",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0227_R30.s"
      },
      {
        "label": "In-game text",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/msgdata/msg/msg_0375_R30.json"
      }
    ],
    "mapIds": [
      "MAP_ROUTE_30"
    ],
    "audit": {
      "scope": "static location information",
      "reviewed_on": "2026-10-14"
    }
  },
  {
    "name": "Route 31",
    "type": "route",
    "region": "Johto",
    "details": "Connects Route 30 with Violet City.",
    "landmarks": [
      "Western entrance to Dark Cave",
      "Gatehouse leading into Violet City",
      "Destination for the Kenya/Spearow Mail delivery from the Route 35 gate"
    ],
    "access": [
      "Continue from Route 30 to Violet",
      "Dark Cave is a separate optional branch rather than the required route through to the city",
      "Cut opens shortcuts and Surf permits pond exploration; neither is needed for the main route to Violet"
    ],
    "connections": [
      "Violet City",
      "Route 30",
      "Dark Cave"
    ],
    "sources": [
      {
        "label": "Serebii location reference",
        "url": "https://www.serebii.net/pokearth/johto/route31.shtml"
      },
      {
        "label": "Bulbapedia location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_31"
      },
      {
        "label": "Map entrances",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/eventdata/zone_event/032_R31.json"
      },
      {
        "label": "Game events",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0230_R31.s"
      },
      {
        "label": "In-game text",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/msgdata/msg/msg_0378_R31.json"
      }
    ],
    "mapIds": [
      "MAP_ROUTE_31"
    ],
    "audit": {
      "scope": "static location information",
      "reviewed_on": "2026-10-14"
    }
  },
  {
    "name": "Route 32",
    "type": "route",
    "region": "Johto",
    "details": "Runs south from Violet City toward Union Cave.",
    "landmarks": [
      "Ruins of Alph gate, Pokémon Center, and Union Cave entrance",
      "Fishing shoreline and the Old Rod gift in the Pokémon Center"
    ],
    "access": [
      "The southern route is gated by the Zephyr Badge and receiving Elm's Egg",
      "Union Cave is the onward route to Route 33 and Azalea",
      "Cut, Surf, and Rock Smash open optional exploration beyond the main walking route"
    ],
    "connections": [
      "Violet City",
      "Union Cave",
      "Ruins of Alph"
    ],
    "sources": [
      {
        "label": "Serebii location reference",
        "url": "https://www.serebii.net/pokearth/johto/route32.shtml"
      },
      {
        "label": "Bulbapedia location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_32"
      },
      {
        "label": "Map entrances",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/eventdata/zone_event/033_R32.json"
      },
      {
        "label": "Game events",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0232_R32.s"
      },
      {
        "label": "In-game text",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/msgdata/msg/msg_0380_R32.json"
      },
      {
        "label": "Supporting game events 1",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0233_R32PC0101.s"
      }
    ],
    "mapIds": [
      "MAP_ROUTE_32",
      "MAP_ROUTE_32_POKECENTER_1F"
    ],
    "audit": {
      "scope": "static location information",
      "reviewed_on": "2026-10-14"
    }
  },
  {
    "name": "Route 33",
    "type": "route",
    "region": "Johto",
    "details": "Short route connecting Union Cave and Azalea Town.",
    "landmarks": [
      "Short rainy route outside Union Cave",
      "Apricorn trees along the southern Johto approach"
    ],
    "access": [
      "Connects Union Cave with Azalea Town",
      "Rain is part of this route's outdoor conditions"
    ],
    "connections": [
      "Azalea Town",
      "Union Cave"
    ],
    "sources": [
      {
        "label": "Serebii location reference",
        "url": "https://www.serebii.net/pokearth/johto/route33.shtml"
      },
      {
        "label": "Bulbapedia location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_33"
      },
      {
        "label": "Map entrances",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/eventdata/zone_event/034_R33.json"
      },
      {
        "label": "Game events",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0236_R33.s"
      },
      {
        "label": "In-game text",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/msgdata/msg/msg_0383_R33.json"
      }
    ],
    "mapIds": [
      "MAP_ROUTE_33"
    ],
    "audit": {
      "scope": "static location information",
      "reviewed_on": "2026-10-14"
    }
  },
  {
    "name": "Route 34",
    "type": "route",
    "region": "Johto",
    "details": "South of Goldenrod City; the Day Care is along this route.",
    "landmarks": [
      "Pokémon Day Care and its Egg service",
      "Coastal water and the gate to Ilex Forest"
    ],
    "access": [
      "Goldenrod is north and Ilex Forest is south",
      "Surf is needed to explore the coastal side area"
    ],
    "connections": [
      "Goldenrod City",
      "Ilex Forest",
      "Pokémon Day Care"
    ],
    "sources": [
      {
        "label": "Serebii location reference",
        "url": "https://www.serebii.net/pokearth/johto/route34.shtml"
      },
      {
        "label": "Bulbapedia location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_34"
      },
      {
        "label": "Map entrances",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/eventdata/zone_event/035_R34.json"
      },
      {
        "label": "Game events",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0237_R34.s"
      },
      {
        "label": "In-game text",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/msgdata/msg/msg_0384_R34.json"
      }
    ],
    "mapIds": [
      "MAP_ROUTE_34"
    ],
    "audit": {
      "scope": "static location information",
      "reviewed_on": "2026-10-14"
    }
  },
  {
    "name": "Route 35",
    "type": "route",
    "region": "Johto",
    "details": "North of Goldenrod City, leading toward the National Park area.",
    "landmarks": [
      "Gatehouse shared with National Park and Pokéathlon Dome",
      "Grass and a pond beside the main path",
      "Webster at the Goldenrod gate entrusts Kenya with Mail for delivery on Route 31"
    ],
    "access": [
      "Goldenrod is reached through the southern gate",
      "The northern gate branches toward the park and the Dome",
      "A separate northeastern shortcut connects directly to Route 36 and requires Cut; Surf opens the pond"
    ],
    "connections": [
      "Goldenrod City",
      "National Park",
      "Pokéathlon Dome",
      "Route 36"
    ],
    "sources": [
      {
        "label": "Serebii location reference",
        "url": "https://www.serebii.net/pokearth/johto/route35.shtml"
      },
      {
        "label": "Bulbapedia location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_35"
      },
      {
        "label": "Map entrances",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/eventdata/zone_event/036_R35.json"
      },
      {
        "label": "Game events",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0240_R35.s"
      },
      {
        "label": "In-game text",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/msgdata/msg/msg_0387_R35.json"
      }
    ],
    "mapIds": [
      "MAP_ROUTE_35"
    ],
    "audit": {
      "scope": "static location information",
      "reviewed_on": "2026-10-14"
    }
  },
  {
    "name": "Route 36",
    "type": "route",
    "region": "Johto",
    "details": "Connects the Violet City area with the National Park and Route 37.",
    "landmarks": [
      "Sudowoodo blocks the road junction",
      "Gates to National Park, Violet City, and Ruins of Alph"
    ],
    "access": [
      "After earning Whitney's Plain Badge, obtain the SquirtBottle from Goldenrod's Flower Shop to resolve the Sudowoodo blockage",
      "Route 37 continues north toward Ecruteak",
      "The southwestern path connects directly to Route 35; Cut is required on that shortcut"
    ],
    "connections": [
      "Violet City",
      "National Park",
      "Route 37",
      "Ruins of Alph",
      "Route 35"
    ],
    "sources": [
      {
        "label": "Serebii location reference",
        "url": "https://www.serebii.net/pokearth/johto/route36.shtml"
      },
      {
        "label": "Bulbapedia location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_36"
      },
      {
        "label": "Map entrances",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/eventdata/zone_event/037_R36.json"
      },
      {
        "label": "Game events",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0243_R36.s"
      },
      {
        "label": "In-game text",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/msgdata/msg/msg_0390_R36.json"
      },
      {
        "label": "Supporting game events 1",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0896_T25R0601.s"
      }
    ],
    "mapIds": [
      "MAP_ROUTE_36",
      "MAP_GOLDENROD_FLOWER_SHOP"
    ],
    "audit": {
      "scope": "static location information",
      "reviewed_on": "2026-10-14"
    }
  },
  {
    "name": "Route 37",
    "type": "route",
    "region": "Johto",
    "details": "Wooded route south of Ecruteak City.",
    "landmarks": [
      "Short wooded route with an Apricorn grove",
      "Southern approach to Ecruteak City"
    ],
    "access": [
      "Connects Route 36 and Ecruteak",
      "The Route 36 Sudowoodo event controls the earlier through-route",
      "The eastern Apricorn-tree path is traversed north to south because of a ledge"
    ],
    "connections": [
      "Ecruteak City",
      "Route 36"
    ],
    "sources": [
      {
        "label": "Serebii location reference",
        "url": "https://www.serebii.net/pokearth/johto/route37.shtml"
      },
      {
        "label": "Bulbapedia location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_37"
      },
      {
        "label": "Map entrances",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/eventdata/zone_event/038_R37.json"
      },
      {
        "label": "Game events",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0246_R37.s"
      },
      {
        "label": "In-game text",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/msgdata/msg/msg_0393_R37.json"
      }
    ],
    "mapIds": [
      "MAP_ROUTE_37"
    ],
    "audit": {
      "scope": "static location information",
      "reviewed_on": "2026-10-14"
    }
  },
  {
    "name": "Route 38",
    "type": "route",
    "region": "Johto",
    "details": "Connects Ecruteak City and the Olivine area.",
    "landmarks": [
      "Westward road from Ecruteak's gate",
      "Grassland leading to the MooMoo Farm area"
    ],
    "access": [
      "Connects Ecruteak with Route 39",
      "Olivine is reached by continuing south along Route 39",
      "A separate raised area is reached by using Rock Climb from Route 39; lower ledges also restrict travel direction"
    ],
    "connections": [
      "Ecruteak City",
      "Route 39"
    ],
    "sources": [
      {
        "label": "Serebii location reference",
        "url": "https://www.serebii.net/pokearth/johto/route38.shtml"
      },
      {
        "label": "Bulbapedia location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_38"
      },
      {
        "label": "Map entrances",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/eventdata/zone_event/039_R38.json"
      },
      {
        "label": "Game events",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0247_R38.s"
      },
      {
        "label": "In-game text",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/msgdata/msg/msg_0394_R38.json"
      }
    ],
    "mapIds": [
      "MAP_ROUTE_38"
    ],
    "audit": {
      "scope": "static location information",
      "reviewed_on": "2026-10-14"
    }
  },
  {
    "name": "Route 39",
    "type": "route",
    "region": "Johto",
    "details": "Runs south toward Olivine City and MooMoo Farm.",
    "landmarks": [
      "MooMoo Farm house and stable",
      "Baoba introduces the Safari Zone project here"
    ],
    "access": [
      "Route 38 joins from the east and Olivine is south",
      "Rock Climb reaches the raised Route 38 side area; the farm itself is reached normally from Route 39"
    ],
    "connections": [
      "Olivine City",
      "Route 38",
      "MooMoo Farm"
    ],
    "sources": [
      {
        "label": "Serebii location reference",
        "url": "https://www.serebii.net/pokearth/johto/route39.shtml"
      },
      {
        "label": "Bulbapedia location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_39"
      },
      {
        "label": "Map entrances",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/eventdata/zone_event/040_R39.json"
      },
      {
        "label": "Game events",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0249_R39.s"
      },
      {
        "label": "In-game text",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/msgdata/msg/msg_0396_R39.json"
      },
      {
        "label": "Supporting game events 1",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0250_R39R0101.s"
      }
    ],
    "mapIds": [
      "MAP_ROUTE_39",
      "MAP_ROUTE_39_MOOMOO_FARM_HOUSE"
    ],
    "audit": {
      "scope": "static location information",
      "reviewed_on": "2026-10-14"
    }
  },
  {
    "name": "Route 40",
    "type": "route",
    "region": "Johto",
    "details": "Sea route west of Olivine City toward Route 41.",
    "landmarks": [
      "Olivine shoreline and the Battle Frontier gate",
      "Sea route toward Cianwood"
    ],
    "access": [
      "Surf is required to continue south into Route 41",
      "The northern gate leads through Frontier Access after entering the Hall of Fame, not directly into a battle facility"
    ],
    "connections": [
      "Olivine City",
      "Route 41",
      "Frontier Access"
    ],
    "sources": [
      {
        "label": "Serebii location reference",
        "url": "https://www.serebii.net/pokearth/johto/route40.shtml"
      },
      {
        "label": "Bulbapedia location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_40"
      },
      {
        "label": "Map entrances",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/eventdata/zone_event/091_W40.json"
      },
      {
        "label": "Game events",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0962_W40.s"
      },
      {
        "label": "In-game text",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/msgdata/msg/msg_0744_W40.json"
      },
      {
        "label": "Supporting game events 1",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0963_W40R0101.s"
      }
    ],
    "mapIds": [
      "MAP_ROUTE_40",
      "MAP_ROUTE_40_BATTLE_FRONTIER_GATEHOUSE"
    ],
    "audit": {
      "scope": "static location information",
      "reviewed_on": "2026-10-14"
    }
  },
  {
    "name": "Route 41",
    "type": "route",
    "region": "Johto",
    "details": "Sea route surrounding the Whirl Islands.",
    "landmarks": [
      "Four Whirl Islands entrances",
      "Sea crossing between Olivine's Route 40 and Cianwood"
    ],
    "access": [
      "Surf is required for the sea crossing",
      "Whirlpool opens the island approaches and is separate from ordinary travel to Cianwood"
    ],
    "connections": [
      "Cianwood City",
      "Route 40",
      "Whirl Islands"
    ],
    "sources": [
      {
        "label": "Serebii location reference",
        "url": "https://www.serebii.net/pokearth/johto/route41.shtml"
      },
      {
        "label": "Bulbapedia location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_41"
      },
      {
        "label": "Map entrances",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/eventdata/zone_event/092_W41.json"
      },
      {
        "label": "Game events",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0964_W41.s"
      },
      {
        "label": "In-game text",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/msgdata/msg/msg_0746_W41.json"
      }
    ],
    "mapIds": [
      "MAP_ROUTE_41"
    ],
    "audit": {
      "scope": "static location information",
      "reviewed_on": "2026-10-14"
    }
  },
  {
    "name": "Route 42",
    "type": "route",
    "region": "Johto",
    "details": "Connects Ecruteak City, Mt. Mortar, and the Mahogany area.",
    "landmarks": [
      "Three entrances to the Mt. Mortar cave system",
      "Water and an Apricorn grove along the road",
      "Suicune can be encountered near the Apricorn grove after its Cianwood appearance"
    ],
    "access": [
      "Connects Ecruteak and Mahogany; use Surf across the lakes or the Mt. Mortar passage",
      "Cut opens the Apricorn grove and Rock Climb is used for optional cliff exploration"
    ],
    "connections": [
      "Ecruteak City",
      "Mahogany Town",
      "Mt. Mortar"
    ],
    "sources": [
      {
        "label": "Serebii location reference",
        "url": "https://www.serebii.net/pokearth/johto/route42.shtml"
      },
      {
        "label": "Bulbapedia location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_42"
      },
      {
        "label": "Map entrances",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/eventdata/zone_event/041_R42.json"
      },
      {
        "label": "Game events",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0252_R42.s"
      },
      {
        "label": "In-game text",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/msgdata/msg/msg_0399_R42.json"
      }
    ],
    "mapIds": [
      "MAP_ROUTE_42"
    ],
    "audit": {
      "scope": "static location information",
      "reviewed_on": "2026-10-14"
    }
  },
  {
    "name": "Route 43",
    "type": "route",
    "region": "Johto",
    "details": "Route north from Mahogany Town to the Lake of Rage.",
    "landmarks": [
      "Road from Mahogany to Lake of Rage",
      "Gatehouse associated with Team Rocket's toll during the incident"
    ],
    "access": [
      "The grass route avoids Team Rocket's 1,000-Pokédollar gate toll during the incident",
      "Continue north to reach the lake; Surf opens an optional path toward its western side"
    ],
    "connections": [
      "Mahogany Town",
      "Lake of Rage"
    ],
    "sources": [
      {
        "label": "Serebii location reference",
        "url": "https://www.serebii.net/pokearth/johto/route43.shtml"
      },
      {
        "label": "Bulbapedia location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_43"
      },
      {
        "label": "Map entrances",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/eventdata/zone_event/042_R43.json"
      },
      {
        "label": "Game events",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0254_R43.s"
      },
      {
        "label": "In-game text",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/msgdata/msg/msg_0401_R43.json"
      }
    ],
    "mapIds": [
      "MAP_ROUTE_43"
    ],
    "audit": {
      "scope": "static location information",
      "reviewed_on": "2026-10-14"
    }
  },
  {
    "name": "Route 44",
    "type": "route",
    "region": "Johto",
    "details": "Eastern route from Mahogany Town toward Ice Path.",
    "landmarks": [
      "Ponds, grass, and the Ice Path entrance",
      "Eastern approach from Mahogany toward Blackthorn"
    ],
    "access": [
      "The road from Mahogany opens after Team Rocket is defeated at Goldenrod Radio Tower",
      "Enter Ice Path to continue to Blackthorn; Surf is required to reach the isolated grass between the ponds"
    ],
    "connections": [
      "Mahogany Town",
      "Ice Path"
    ],
    "sources": [
      {
        "label": "Serebii location reference",
        "url": "https://www.serebii.net/pokearth/johto/route44.shtml"
      },
      {
        "label": "Bulbapedia location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_44"
      },
      {
        "label": "Map entrances",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/eventdata/zone_event/043_R44.json"
      },
      {
        "label": "Game events",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0257_R44.s"
      },
      {
        "label": "In-game text",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/msgdata/msg/msg_0404_R44.json"
      }
    ],
    "mapIds": [
      "MAP_ROUTE_44"
    ],
    "audit": {
      "scope": "static location information",
      "reviewed_on": "2026-10-14"
    }
  },
  {
    "name": "Route 45",
    "type": "route",
    "region": "Johto",
    "details": "Mountain route south of Blackthorn City.",
    "landmarks": [
      "Mountain road descending from Blackthorn",
      "Eastern entrance to Dark Cave"
    ],
    "access": [
      "Southbound ledges make the descent one-way along parts of the road",
      "Continue toward Route 46 and the early Johto routes",
      "The central river is not Surfable; the small pond near the southern end is separate"
    ],
    "connections": [
      "Blackthorn City",
      "Dark Cave",
      "Route 46"
    ],
    "sources": [
      {
        "label": "Serebii location reference",
        "url": "https://www.serebii.net/pokearth/johto/route45.shtml"
      },
      {
        "label": "Bulbapedia location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_45"
      },
      {
        "label": "Map entrances",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/eventdata/zone_event/044_R45.json"
      },
      {
        "label": "Game events",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0258_R45.s"
      },
      {
        "label": "In-game text",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/msgdata/msg/msg_0405_R45.json"
      }
    ],
    "mapIds": [
      "MAP_ROUTE_45"
    ],
    "audit": {
      "scope": "static location information",
      "reviewed_on": "2026-10-14"
    }
  },
  {
    "name": "Route 46",
    "type": "route",
    "region": "Johto",
    "details": "Mountain route connecting the Route 29 side of Johto with Route 45.",
    "landmarks": [
      "Lower mountain road and a Dark Cave entrance",
      "Gatehouse to Route 29"
    ],
    "access": [
      "Ledges separate the upper and lower sections",
      "The lower section can be visited early from Route 29, but it is not an unrestricted uphill shortcut to Blackthorn",
      "The upper section can also be reached through Dark Cave, where Strength is required in HeartGold/SoulSilver"
    ],
    "connections": [
      "Route 29",
      "Route 45",
      "Dark Cave"
    ],
    "sources": [
      {
        "label": "Serebii location reference",
        "url": "https://www.serebii.net/pokearth/johto/route46.shtml"
      },
      {
        "label": "Bulbapedia location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_46"
      },
      {
        "label": "Map entrances",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/eventdata/zone_event/045_R46.json"
      },
      {
        "label": "Game events",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0259_R46.s"
      },
      {
        "label": "In-game text",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/msgdata/msg/msg_0406_R46.json"
      }
    ],
    "mapIds": [
      "MAP_ROUTE_46"
    ],
    "audit": {
      "scope": "static location information",
      "reviewed_on": "2026-10-14"
    }
  },
  {
    "name": "Route 47",
    "type": "route",
    "region": "Johto",
    "details": "Route added in HeartGold and SoulSilver, leading toward the Safari Zone.",
    "landmarks": [
      "Multi-level cliffs, waterfalls, Cliff Cave, and the Embedded Tower approach",
      "Road toward Route 48"
    ],
    "access": [
      "Enter through Cliff Edge Gate from Cianwood",
      "Cliff Cave changes elevation, while Surf and Rock Climb are required for the Embedded Tower approach",
      "The corridor opens after the SecretPotion is delivered to Jasmine at the lighthouse",
      "Surf and Waterfall are required to reach the route's tall-grass area from the lower shoreline"
    ],
    "connections": [
      "Cliff Edge Gate",
      "Cliff Cave",
      "Embedded Tower",
      "Route 48"
    ],
    "sources": [
      {
        "label": "Serebii location reference",
        "url": "https://www.serebii.net/pokearth/johto/route47.shtml"
      },
      {
        "label": "Bulbapedia location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_47"
      },
      {
        "label": "Map entrances",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/eventdata/zone_event/146_R47.json"
      },
      {
        "label": "Game events",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0260_R47.s"
      },
      {
        "label": "In-game text",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/msgdata/msg/msg_0407_R47.json"
      },
      {
        "label": "Supporting game events 1",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0121_D48R0101.s"
      }
    ],
    "mapIds": [
      "MAP_ROUTE_47",
      "MAP_CLIFF_EDGE_GATE"
    ],
    "audit": {
      "scope": "static location information",
      "reviewed_on": "2026-10-14"
    }
  },
  {
    "name": "Route 48",
    "type": "route",
    "region": "Johto",
    "details": "Connects Route 47 with the Safari Zone Gate.",
    "landmarks": [
      "Short grassy approach to Safari Zone Gate",
      "Northern end of the Route 47 corridor"
    ],
    "access": [
      "Connects Route 47 with Safari Zone Gate",
      "Enter the Safari Zone through its Gate and reception building, not directly from Route 47"
    ],
    "connections": [
      "Route 47",
      "Safari Zone Gate"
    ],
    "sources": [
      {
        "label": "Serebii location reference",
        "url": "https://www.serebii.net/pokearth/johto/route48.shtml"
      },
      {
        "label": "Bulbapedia location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_48"
      },
      {
        "label": "Map entrances",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/eventdata/zone_event/147_R48.json"
      },
      {
        "label": "Game events",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0261_R48.s"
      },
      {
        "label": "In-game text",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/msgdata/msg/msg_0408_R48.json"
      }
    ],
    "mapIds": [
      "MAP_ROUTE_48"
    ],
    "audit": {
      "scope": "static location information",
      "reviewed_on": "2026-10-14"
    }
  },
  {
    "name": "Cliff Edge Gate",
    "type": "landmark",
    "region": "Johto",
    "details": "Cave passage between Cianwood City and Route 47, with a small Rock Climb-accessible lake.",
    "landmarks": [
      "Passage linking Cianwood and Route 47",
      "Lower lake as an optional exploration area"
    ],
    "access": [
      "Construction blocks passage until Amphy has been healed at Olivine Lighthouse",
      "The main path then connects Cianwood to Route 47; Rock Climb and Surf are used to explore the lower pond"
    ],
    "connections": [
      "Cianwood City",
      "Route 47"
    ],
    "sources": [
      {
        "label": "Serebii location reference",
        "url": "https://www.serebii.net/pokearth/johto/cliffedgegate.shtml"
      },
      {
        "label": "Bulbapedia location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Cliff_Edge_Gate"
      },
      {
        "label": "Map entrances",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/eventdata/zone_event/250_D48R0101.json"
      },
      {
        "label": "Game events",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0121_D48R0101.s"
      },
      {
        "label": "In-game text",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/msgdata/msg/msg_0136_D48R0101.json"
      },
      {
        "label": "Supporting game events 1",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0260_R47.s"
      }
    ],
    "mapIds": [
      "MAP_CLIFF_EDGE_GATE",
      "MAP_ROUTE_47"
    ],
    "audit": {
      "scope": "static location information",
      "reviewed_on": "2026-10-14"
    }
  },
  {
    "name": "Cliff Cave",
    "type": "landmark",
    "region": "Johto",
    "details": "Small multi-level cave connecting the different cliff levels of Route 47.",
    "landmarks": [
      "Multi-level cave inside the Route 47 cliffs",
      "Separate exits onto different elevations of the same route",
      "Breakable rocks on the bottom floor appear after obtaining the National Pokédex"
    ],
    "access": [
      "All outdoor exits return to Route 47",
      "Use the cave to reach the route's lower shoreline"
    ],
    "connections": [
      "Route 47"
    ],
    "sources": [
      {
        "label": "Serebii location reference",
        "url": "https://www.serebii.net/pokearth/johto/cliffcave.shtml"
      },
      {
        "label": "Bulbapedia location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Cliff_Cave"
      },
      {
        "label": "Map entrances",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/eventdata/zone_event/313_D50R0101.json"
      },
      {
        "label": "Game events",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0129_D50R0101.s"
      },
      {
        "label": "In-game text",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/msgdata/msg/msg_0144_D50R0101.json"
      }
    ],
    "mapIds": [
      "MAP_CLIFF_CAVE"
    ],
    "audit": {
      "scope": "static location information",
      "reviewed_on": "2026-10-14"
    }
  },
  {
    "name": "Embedded Tower",
    "type": "landmark",
    "region": "Johto",
    "details": "Ancient tower on Route 47 tied to the legendary Pokémon Groudon and Rayquaza in SoulSilver.",
    "landmarks": [
      "Ancient tower chamber on Route 47",
      "The SoulSilver chamber is associated with Groudon and the Red Orb"
    ],
    "access": [
      "Reach the entrance using Surf and Rock Climb on Route 47",
      "After defeating Red and receiving a Kanto first partner from Oak, Mr. Pokémon gives SoulSilver's Red Orb for Groudon",
      "For Rayquaza, show Oak both a Kyogre and a Groudon originating from Embedded Tower to receive the Jade Orb; this requires trading between versions"
    ],
    "connections": [
      "Route 47"
    ],
    "sources": [
      {
        "label": "Serebii location reference",
        "url": "https://www.serebii.net/pokearth/johto/embeddedtower.shtml"
      },
      {
        "label": "Bulbapedia location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Embedded_Tower"
      },
      {
        "label": "Map entrances",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/eventdata/zone_event/476_D52R0101.json"
      },
      {
        "label": "Game events",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0133_D52R0101.s"
      },
      {
        "label": "In-game text",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/msgdata/msg/msg_0148_D52R0101.json"
      }
    ],
    "mapIds": [
      "MAP_EMBEDDED_TOWER_GROUDON_ROOM"
    ],
    "audit": {
      "scope": "static location information",
      "reviewed_on": "2026-10-14"
    }
  },
  {
    "name": "Dark Cave",
    "type": "landmark",
    "region": "Johto",
    "details": "Cave system with entrances near Routes 31, 45, and 46.",
    "landmarks": [
      "Western and eastern cave sections",
      "Entrances at Routes 31, 45, and 46"
    ],
    "access": [
      "Flash improves visibility; Surf, Strength, and Rock Smash are used in different parts of the cave",
      "Ledges prevent reaching Route 45 from the southern side; the three entrances are not an unrestricted shortcut to Blackthorn"
    ],
    "connections": [
      "Route 31",
      "Route 45",
      "Route 46"
    ],
    "sources": [
      {
        "label": "Serebii location reference",
        "url": "https://www.serebii.net/pokearth/johto/darkcave.shtml"
      },
      {
        "label": "Bulbapedia location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Dark_Cave"
      },
      {
        "label": "Map entrances",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/eventdata/zone_event/169_D42R0102.json"
      },
      {
        "label": "Game events",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0139_EVERYWHERE.s"
      },
      {
        "label": "Supporting game events 1",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0108_D42R0101.s"
      }
    ],
    "mapIds": [
      "MAP_DARK_CAVE_ROUTE_31_SIDE",
      "MAP_DARK_CAVE_ROUTE_45_SIDE"
    ],
    "audit": {
      "scope": "static location information",
      "reviewed_on": "2026-10-14"
    }
  },
  {
    "name": "Sprout Tower",
    "type": "landmark",
    "region": "Johto",
    "details": "Multi-floor tower in Violet City.",
    "landmarks": [
      "Three floors of Sage battles and the central swaying pillar",
      "Elder Li gives TM70 Flash on the top floor"
    ],
    "access": [
      "Enter from Violet City",
      "Defeat Elder Li on the third floor before challenging Falkner; the reward is TM70 Flash, not Generation II's HM05"
    ],
    "connections": [
      "Violet City"
    ],
    "sources": [
      {
        "label": "Serebii location reference",
        "url": "https://www.serebii.net/pokearth/johto/sprouttower.shtml"
      },
      {
        "label": "Bulbapedia location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Sprout_Tower"
      },
      {
        "label": "Map entrances",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/eventdata/zone_event/107_D15R0101.json"
      },
      {
        "label": "Game events",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0016_D15R0101.s"
      },
      {
        "label": "In-game text",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/msgdata/msg/msg_0054_D15R0101.json"
      },
      {
        "label": "Supporting game events 1",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0018_D15R0103.s"
      },
      {
        "label": "Supporting game events 2",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0859_T22GYM0101.s"
      }
    ],
    "mapIds": [
      "MAP_SPROUT_TOWER_1F",
      "MAP_SPROUT_TOWER_3F",
      "MAP_VIOLET_GYM"
    ],
    "audit": {
      "scope": "static location information",
      "reviewed_on": "2026-10-14"
    }
  },
  {
    "name": "Ruins of Alph",
    "type": "landmark",
    "region": "Johto",
    "details": "Ancient ruins with puzzles and Unown.",
    "landmarks": [
      "Four puzzle chambers, hidden rooms, underground hall, and Research Center",
      "Unown research and the Unown Report"
    ],
    "access": [
      "Outdoor gates connect to Routes 32 and 36; Surf reaches the southern chamber and Union Cave approaches",
      "Surf and Strength are needed to reach the southwestern puzzle chamber through Union Cave",
      "Hidden-room triggers are Escape Rope, Flash, Ho-Oh anywhere in the party, and selecting Use on a Water Stone while facing its inscription; these are separate chamber conditions"
    ],
    "connections": [
      "Route 32",
      "Route 36",
      "Union Cave"
    ],
    "sources": [
      {
        "label": "Serebii location reference",
        "url": "https://www.serebii.net/pokearth/johto/ruinsofalph.shtml"
      },
      {
        "label": "Bulbapedia location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Ruins_of_Alph"
      },
      {
        "label": "Map entrances",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/eventdata/zone_event/110_D24R0101.json"
      },
      {
        "label": "Game events",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0037_D24R0101.s"
      },
      {
        "label": "In-game text",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/msgdata/msg/msg_0072_D24R0101.json"
      },
      {
        "label": "Supporting game events 1",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0038_D24R0102.s"
      },
      {
        "label": "Supporting game events 2",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0056_D25R0101.s"
      }
    ],
    "mapIds": [
      "MAP_RUINS_OF_ALPH",
      "MAP_RUINS_OF_ALPH_RESEARCH_CENTER",
      "MAP_UNION_CAVE_1F"
    ],
    "audit": {
      "scope": "static location information",
      "reviewed_on": "2026-10-14"
    }
  },
  {
    "name": "Union Cave",
    "type": "landmark",
    "region": "Johto",
    "details": "Cave between Route 32 and Route 33.",
    "landmarks": [
      "Main 1F passage, B1F, and B2F",
      "Side exits lead toward isolated Ruins of Alph chambers",
      "A special Lapras appears on B2F on Fridays"
    ],
    "access": [
      "The main walking route connects Routes 32 and 33",
      "Surf opens lower exploration and Strength is relevant to side passages"
    ],
    "connections": [
      "Route 32",
      "Route 33",
      "Ruins of Alph"
    ],
    "sources": [
      {
        "label": "Serebii location reference",
        "url": "https://www.serebii.net/pokearth/johto/unioncave.shtml"
      },
      {
        "label": "Bulbapedia location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Union_Cave"
      },
      {
        "label": "Map entrances",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/eventdata/zone_event/096_D25R0101.json"
      },
      {
        "label": "Game events",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0056_D25R0101.s"
      },
      {
        "label": "In-game text",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/msgdata/msg/msg_0087_D25R0101.json"
      },
      {
        "label": "Supporting game events 1",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0057_D25R0102.s"
      },
      {
        "label": "Supporting game events 2",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0058_D25R0103.s"
      }
    ],
    "mapIds": [
      "MAP_UNION_CAVE_1F",
      "MAP_UNION_CAVE_B1F",
      "MAP_UNION_CAVE_B2F"
    ],
    "audit": {
      "scope": "static location information",
      "reviewed_on": "2026-10-14"
    }
  },
  {
    "name": "Slowpoke Well",
    "type": "landmark",
    "region": "Johto",
    "details": "Well in Azalea Town with multiple levels.",
    "landmarks": [
      "Team Rocket's Slowpoke-tail incident in the upper cave",
      "Lower B2F chamber with further exploration rewards"
    ],
    "access": [
      "Enter from Azalea Town after following Kurt into the incident",
      "Surf and Strength are required to explore the lower chamber"
    ],
    "connections": [
      "Azalea Town"
    ],
    "sources": [
      {
        "label": "Serebii location reference",
        "url": "https://www.serebii.net/pokearth/johto/slowpokewell.shtml"
      },
      {
        "label": "Bulbapedia location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Slowpoke_Well"
      },
      {
        "label": "Map entrances",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/eventdata/zone_event/111_D26R0101.json"
      },
      {
        "label": "Game events",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0059_D26R0101.s"
      },
      {
        "label": "In-game text",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/msgdata/msg/msg_0090_D26R0101.json"
      },
      {
        "label": "Supporting game events 1",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0060_D26R0102.s"
      },
      {
        "label": "Supporting game events 2",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0061_D26R0103.s"
      }
    ],
    "mapIds": [
      "MAP_SLOWPOKE_WELL_ENTRANCE",
      "MAP_SLOWPOKE_WELL_B1F",
      "MAP_SLOWPOKE_WELL_B2F"
    ],
    "audit": {
      "scope": "static location information",
      "reviewed_on": "2026-10-14"
    }
  },
  {
    "name": "Ilex Forest",
    "type": "landmark",
    "region": "Johto",
    "details": "Forest west of Azalea Town connecting to Route 34.",
    "landmarks": [
      "Farfetch'd recovery event, shrine, and Headbutt tutor",
      "HM01 Cut is obtained during the forest event"
    ],
    "access": [
      "Connects Azalea Town with Route 34 through gatehouses",
      "Cut and the Hive Badge are needed to clear the tree on the main route"
    ],
    "connections": [
      "Azalea Town",
      "Route 34"
    ],
    "sources": [
      {
        "label": "Serebii location reference",
        "url": "https://www.serebii.net/pokearth/johto/ilexforest.shtml"
      },
      {
        "label": "Bulbapedia location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Ilex_Forest"
      },
      {
        "label": "Map entrances",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/eventdata/zone_event/114_D36R0101.json"
      },
      {
        "label": "Game events",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0092_D36R0101.s"
      },
      {
        "label": "In-game text",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/msgdata/msg/msg_0115_D36R0101.json"
      }
    ],
    "mapIds": [
      "MAP_ILEX_FOREST"
    ],
    "audit": {
      "scope": "static location information",
      "reviewed_on": "2026-10-14"
    }
  },
  {
    "name": "National Park",
    "type": "landmark",
    "region": "Johto",
    "details": "Park between Routes 35 and 36; hosts the Bug-Catching Contest.",
    "landmarks": [
      "Bug-Catching Contest grounds and surrounding paths",
      "Southern gate area shared with the Route 35/Pokéathlon approach"
    ],
    "access": [
      "Connects Routes 35 and 36 through gates; the southern shared gate also leads toward Pokéathlon Dome",
      "The Bug-Catching Contest runs on Tuesday, Thursday, and Saturday",
      "Rock Climb opens the optional northeastern upper area"
    ],
    "connections": [
      "Route 35",
      "Route 36",
      "Pokéathlon Dome"
    ],
    "sources": [
      {
        "label": "Serebii location reference",
        "url": "https://www.serebii.net/pokearth/johto/nationalpark.shtml"
      },
      {
        "label": "Bulbapedia location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/National_Park"
      },
      {
        "label": "Map entrances",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/eventdata/zone_event/093_D22R0101.json"
      },
      {
        "label": "Game events",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0025_D22R0101.s"
      },
      {
        "label": "In-game text",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/msgdata/msg/msg_0062_D22R0101.json"
      },
      {
        "label": "Supporting game events 1",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0242_R35R0201.s"
      }
    ],
    "mapIds": [
      "MAP_NATIONAL_PARK",
      "MAP_ROUTE_35_NATIONAL_PARK_POKEATHALON_GATEHOUSE"
    ],
    "audit": {
      "scope": "static location information",
      "reviewed_on": "2026-10-14"
    }
  },
  {
    "name": "Burned Tower",
    "type": "landmark",
    "region": "Johto",
    "details": "Ruined tower in Ecruteak City.",
    "landmarks": [
      "Ruined 1F and basement",
      "Rival encounter and the Raikou, Entei, and Suicune story event"
    ],
    "access": [
      "Enter from Ecruteak City",
      "The basement event advances the local story and is separate from random wild encounters",
      "Defeat the rival and trigger the basement beast event to return Morty to his Gym; Strength and Rock Smash serve optional exploration"
    ],
    "connections": [
      "Ecruteak City"
    ],
    "sources": [
      {
        "label": "Serebii location reference",
        "url": "https://www.serebii.net/pokearth/johto/burnedtower.shtml"
      },
      {
        "label": "Bulbapedia location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Burned_Tower"
      },
      {
        "label": "Map entrances",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/eventdata/zone_event/005_D18R0101.json"
      },
      {
        "label": "Game events",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0023_D18R0101.s"
      },
      {
        "label": "In-game text",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/msgdata/msg/msg_0060_D18R0101.json"
      },
      {
        "label": "Supporting game events 1",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0024_D18R0102.s"
      }
    ],
    "mapIds": [
      "MAP_BURNED_TOWER_1F",
      "MAP_BURNED_TOWER_B1F"
    ],
    "audit": {
      "scope": "static location information",
      "reviewed_on": "2026-10-14"
    }
  },
  {
    "name": "Bell Tower",
    "type": "landmark",
    "region": "Johto",
    "details": "Tower in Ecruteak City associated with Ho-Oh.",
    "landmarks": [
      "Multi-floor tower with upper-floor warp puzzles and rooftop",
      "Ho-Oh's tower, distinct from the Burned Tower"
    ],
    "access": [
      "Approach through Ecruteak's Barrier Station and Bellchime Trail",
      "In SoulSilver, an old man in Pewter City gives the Rainbow Wing needed to ascend; the Clear Bell requirement belongs to HeartGold"
    ],
    "connections": [
      "Bellchime Trail"
    ],
    "sources": [
      {
        "label": "Serebii location reference",
        "url": "https://www.serebii.net/pokearth/johto/belltower.shtml"
      },
      {
        "label": "Bulbapedia location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Bell_Tower"
      },
      {
        "label": "Supporting location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Pewter_City"
      },
      {
        "label": "Map entrances",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/eventdata/zone_event/108_D17R0101.json"
      },
      {
        "label": "Game events",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0019_D17R0101.s"
      },
      {
        "label": "In-game text",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/msgdata/msg/msg_0057_D17R0101.json"
      },
      {
        "label": "Supporting game events 1",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0139_EVERYWHERE.s"
      }
    ],
    "mapIds": [
      "MAP_BELL_TOWER_1F",
      "MAP_BELL_TOWER_10F"
    ],
    "audit": {
      "scope": "static location information",
      "reviewed_on": "2026-10-14"
    }
  },
  {
    "name": "Mt. Mortar",
    "type": "landmark",
    "region": "Johto",
    "details": "Large cave system along Route 42.",
    "landmarks": [
      "Several entrances on Route 42 and four main cave sections",
      "Kiyo's training area in the deeper cave"
    ],
    "access": [
      "Surf, Waterfall, and Strength open deeper routes; Rock Climb reaches additional areas",
      "Defeating Kiyo earns a Tyrogue, but an empty party slot is required to receive it",
      "Unlike Gold/Silver, this cave is already lit in HeartGold/SoulSilver; Flash is not required"
    ],
    "connections": [
      "Route 42"
    ],
    "sources": [
      {
        "label": "Serebii location reference",
        "url": "https://www.serebii.net/pokearth/johto/mt.mortar.shtml"
      },
      {
        "label": "Bulbapedia location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Mt._Mortar"
      },
      {
        "label": "Map entrances",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/eventdata/zone_event/116_D38R0101.json"
      },
      {
        "label": "Game events",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0139_EVERYWHERE.s"
      },
      {
        "label": "Supporting game events 1",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0098_D38R0104.s"
      }
    ],
    "mapIds": [
      "MAP_MOUNT_MORTAR_1F_ENTRANCE",
      "MAP_MOUNT_MORTAR_1F_BACK",
      "MAP_MOUNT_MORTAR_B1F"
    ],
    "audit": {
      "scope": "static location information",
      "reviewed_on": "2026-10-14"
    }
  },
  {
    "name": "Whirl Islands",
    "type": "landmark",
    "region": "Johto",
    "details": "Four islands reached from Route 41.",
    "landmarks": [
      "Four island entrances with interconnected underground floors",
      "Lugia's chamber below the waterfall basin"
    ],
    "access": [
      "Surf and Whirlpool are needed for the island approaches; Flash improves visibility underground",
      "SoulSilver's Lugia story requires the Silver Wing and Tidal Bell events; the chamber route starts from the northeastern island"
    ],
    "connections": [
      "Route 41"
    ],
    "sources": [
      {
        "label": "Serebii location reference",
        "url": "https://www.serebii.net/pokearth/johto/whirlislands.shtml"
      },
      {
        "label": "Bulbapedia location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Whirl_Islands"
      },
      {
        "label": "Map entrances",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/eventdata/zone_event/118_D40R0101.json"
      },
      {
        "label": "Game events",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0139_EVERYWHERE.s"
      },
      {
        "label": "Supporting game events 1",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0104_D40R0107.s"
      }
    ],
    "mapIds": [
      "MAP_WHIRL_ISLANDS_1F",
      "MAP_WHIRL_ISLANDS_B3F_LUGIA_CAVE"
    ],
    "audit": {
      "scope": "static location information",
      "reviewed_on": "2026-10-14"
    }
  },
  {
    "name": "Lake of Rage",
    "type": "landmark",
    "region": "Johto",
    "details": "Lake north of Mahogany Town.",
    "landmarks": [
      "Red Gyarados story encounter and Lance's investigation",
      "Fishing Guru and Hidden Power houses"
    ],
    "access": [
      "Reach the lake from Route 43",
      "Surf reaches the Gyarados and water areas, while the outer paths have additional tree obstacles",
      "After Team Rocket's transmitter is shut down, Wednesday brings lower water and different accessible paths; Cut is used around the outer maze"
    ],
    "connections": [
      "Route 43"
    ],
    "sources": [
      {
        "label": "Serebii location reference",
        "url": "https://www.serebii.net/pokearth/johto/lakeofrage.shtml"
      },
      {
        "label": "Bulbapedia location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Lake_of_Rage"
      },
      {
        "label": "Map entrances",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/eventdata/zone_event/085_T29.json"
      },
      {
        "label": "Game events",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0938_T29.s"
      },
      {
        "label": "In-game text",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/msgdata/msg/msg_0626_T29.json"
      }
    ],
    "mapIds": [
      "MAP_LAKE_OF_RAGE"
    ],
    "audit": {
      "scope": "static location information",
      "reviewed_on": "2026-10-14"
    }
  },
  {
    "name": "Ice Path",
    "type": "landmark",
    "region": "Johto",
    "details": "Icy cave route leading to Blackthorn City.",
    "landmarks": [
      "Ice-sliding puzzles, Strength boulders, and basement floors",
      "HM07 Waterfall is found on the route through the cave"
    ],
    "access": [
      "Connects Route 44 to Blackthorn City; Strength is needed for the boulder puzzles",
      "In HeartGold/SoulSilver an NPC prevents progress until HM07 Waterfall is picked up, but teaching or using Waterfall is not needed to exit",
      "Rock Smash is used for optional item exploration; the cave has 1F and three basement floors"
    ],
    "connections": [
      "Blackthorn City",
      "Route 44"
    ],
    "sources": [
      {
        "label": "Serebii location reference",
        "url": "https://www.serebii.net/pokearth/johto/icepath.shtml"
      },
      {
        "label": "Bulbapedia location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Ice_Path"
      },
      {
        "label": "Map entrances",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/eventdata/zone_event/117_D39R0101.json"
      },
      {
        "label": "Game events",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0099_D39R0101.s"
      },
      {
        "label": "In-game text",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/msgdata/msg/msg_0122_D39R0101.json"
      },
      {
        "label": "Supporting game events 1",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0100_D39R0102.s"
      }
    ],
    "mapIds": [
      "MAP_ICE_PATH_1F",
      "MAP_ICE_PATH_B1F"
    ],
    "audit": {
      "scope": "static location information",
      "reviewed_on": "2026-10-14"
    }
  },
  {
    "name": "Dragon's Den",
    "type": "landmark",
    "region": "Johto",
    "details": "Sacred dragon location behind Blackthorn City.",
    "landmarks": [
      "Lake, shrine, and the elder's challenge",
      "Clair's post-battle Badge event",
      "The elder can award a Dratini; correct first answers give it ExtremeSpeed"
    ],
    "access": [
      "Enter behind Blackthorn Gym after defeating Clair",
      "Surf and Whirlpool are needed to reach the shrine",
      "Complete the elder's quiz to receive the Rising Badge and unlock Waterfall outside battle"
    ],
    "connections": [
      "Blackthorn City"
    ],
    "sources": [
      {
        "label": "Serebii location reference",
        "url": "https://www.serebii.net/pokearth/johto/dragon'sden.shtml"
      },
      {
        "label": "Bulbapedia location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Dragon's_Den"
      },
      {
        "label": "Map entrances",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/eventdata/zone_event/239_D44R0102.json"
      },
      {
        "label": "Game events",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0111_D44R0102.s"
      },
      {
        "label": "In-game text",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/msgdata/msg/msg_0129_D44R0102.json"
      },
      {
        "label": "Supporting game events 1",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0112_D44R0103.s"
      }
    ],
    "mapIds": [
      "MAP_DRAGONS_DEN",
      "MAP_DRAGONS_DEN_SHRINE"
    ],
    "audit": {
      "scope": "static location information",
      "reviewed_on": "2026-10-14"
    }
  },
  {
    "name": "Safari Zone Gate",
    "type": "facility",
    "region": "Johto",
    "details": "Entrance area for the Johto Safari Zone, north of Route 48.",
    "landmarks": [
      "Reception building, Pokémon Center, and local shops",
      "Staging area before entering the Safari Zone"
    ],
    "access": [
      "Reach it from Route 48",
      "The reception building is the passage into the actual Safari Zone"
    ],
    "connections": [
      "Route 48",
      "Safari Zone"
    ],
    "sources": [
      {
        "label": "Serebii location reference",
        "url": "https://www.serebii.net/pokearth/johto/safarizonegate.shtml"
      },
      {
        "label": "Bulbapedia location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Safari_Zone_Gate"
      },
      {
        "label": "Map entrances",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/eventdata/zone_event/168_D47.json"
      },
      {
        "label": "Game events",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0116_D47.s"
      },
      {
        "label": "In-game text",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/msgdata/msg/msg_0133_D47.json"
      }
    ],
    "mapIds": [
      "MAP_SAFARI_ZONE_GATE"
    ],
    "audit": {
      "scope": "static location information",
      "reviewed_on": "2026-10-14"
    }
  },
  {
    "name": "Safari Zone",
    "type": "facility",
    "region": "Johto",
    "details": "Safari area west of Cianwood, reached through Routes 47 and 48.",
    "landmarks": [
      "Baoba's reception and catching area",
      "Area customization and block placement unlock through Baoba's tests"
    ],
    "access": [
      "After healing the lighthouse Ampharos, Baoba calls to announce the opening; enter from Safari Zone Gate",
      "Catching visits cost 500 Pokédollars and use Safari Balls; customization unlocks through later tests",
      "The entry fee supplies 30 Safari Balls with no step/time limit; six of the twelve areas are active at once",
      "Block arrangement additionally requires the National Pokédex and Baoba's later unlock; this static note does not certify encounter/block tables"
    ],
    "connections": [
      "Safari Zone Gate"
    ],
    "sources": [
      {
        "label": "Serebii location reference",
        "url": "https://www.serebii.net/pokearth/johto/safarizone.shtml"
      },
      {
        "label": "Bulbapedia location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Johto_Safari_Zone"
      },
      {
        "label": "Map entrances",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/eventdata/zone_event/167_D47R0101.json"
      },
      {
        "label": "Game events",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0119_D47R0101.s"
      },
      {
        "label": "In-game text",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/msgdata/msg/msg_0135_D47R0101.json"
      },
      {
        "label": "Supporting game events 1",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0139_EVERYWHERE.s"
      },
      {
        "label": "Safari opening call",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0911_T26.s"
      }
    ],
    "mapIds": [
      "MAP_SAFARI_ZONE_ENTRANCE_INTERIOR",
      "MAP_SAFARI_ZONE_01"
    ],
    "audit": {
      "scope": "static location information",
      "reviewed_on": "2026-10-14"
    }
  },
  {
    "name": "Pokéathlon Dome",
    "type": "facility",
    "region": "Johto",
    "details": "Pokéathlon venue west of the National Park.",
    "landmarks": [
      "Pokémon sports courses, Aprijuice services, and reward exchange",
      "Performance-based activities rather than standard Pokémon battles"
    ],
    "access": [
      "The shared gate north of Route 35 connects this area with National Park",
      "The area is locked until Whitney has been defeated; an Apricorn Box is needed to receive the Apriblender"
    ],
    "connections": [
      "Route 35",
      "National Park"
    ],
    "sources": [
      {
        "label": "Serebii location reference",
        "url": "https://www.serebii.net/pokearth/johto/pokeathlondome.shtml"
      },
      {
        "label": "Bulbapedia location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9athlon_Dome"
      },
      {
        "label": "Map entrances",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/eventdata/zone_event/251_D49.json"
      },
      {
        "label": "Game events",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0122_D49.s"
      },
      {
        "label": "In-game text",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/msgdata/msg/msg_0137_D49.json"
      }
    ],
    "mapIds": [
      "MAP_POKEATHLON_DOME"
    ],
    "audit": {
      "scope": "static location information",
      "reviewed_on": "2026-10-14"
    }
  },
  {
    "name": "Goldenrod Department Store",
    "type": "facility",
    "region": "Johto",
    "details": "Multi-floor shop in Goldenrod City.",
    "landmarks": [
      "Multi-floor shop with stairs, elevator, and basement",
      "Different floors sell different categories of supplies",
      "2F supplies, 3F battle items, 4F vitamins, 5F TMs, and a 6F atrium with a daily raffle"
    ],
    "access": [
      "Main entrance is in Goldenrod City",
      "The basement links to the Underground warehouse during the relevant story progression"
    ],
    "connections": [
      "Goldenrod City",
      "Goldenrod Tunnel"
    ],
    "sources": [
      {
        "label": "Serebii location reference",
        "url": "https://www.serebii.net/pokearth/johto/goldenrodcity.shtml"
      },
      {
        "label": "Bulbapedia location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Goldenrod_Department_Store"
      },
      {
        "label": "Map entrances",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/eventdata/zone_event/184_T25R1001.json"
      },
      {
        "label": "Game events",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0899_T25R1001.s"
      },
      {
        "label": "In-game text",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/msgdata/msg/msg_0592_T25R1001.json"
      },
      {
        "label": "Supporting game events 1",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0097_D37R0105.s"
      }
    ],
    "mapIds": [
      "MAP_GOLDENROD_DEPARTMENT_STORE_1F",
      "MAP_GOLDENROD_TUNNEL_WAREHOUSE"
    ],
    "audit": {
      "scope": "static location information",
      "reviewed_on": "2026-10-14"
    }
  },
  {
    "name": "Goldenrod Radio Tower",
    "type": "facility",
    "region": "Johto",
    "details": "Broadcasting tower in Goldenrod City.",
    "landmarks": [
      "Radio Card quiz, daily lottery, and broadcast studios",
      "Team Rocket takeover and upper-floor story events"
    ],
    "access": [
      "Enter from Goldenrod City",
      "Upper floors are story-restricted, and the Underground rescue is part of resolving the takeover",
      "The takeover follows the seventh Johto Badge: the Basement Key leads to the Director, whose Card Key opens the upper tower",
      "Resolving the takeover awards the Silver Wing in SoulSilver and opens the road east of Mahogany"
    ],
    "connections": [
      "Goldenrod City"
    ],
    "sources": [
      {
        "label": "Serebii location reference",
        "url": "https://www.serebii.net/pokearth/johto/radiotower.shtml"
      },
      {
        "label": "Bulbapedia location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Goldenrod_Radio_Tower"
      },
      {
        "label": "Map entrances",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/eventdata/zone_event/109_D23R0101.json"
      },
      {
        "label": "Game events",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0029_D23R0101.s"
      },
      {
        "label": "In-game text",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/msgdata/msg/msg_0065_D23R0101.json"
      },
      {
        "label": "Supporting game events 1",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0033_D23R0105.s"
      }
    ],
    "mapIds": [
      "MAP_GOLDENROD_RADIO_TOWER_1F",
      "MAP_GOLDENROD_RADIO_TOWER_5F"
    ],
    "audit": {
      "scope": "static location information",
      "reviewed_on": "2026-10-14"
    }
  },
  {
    "name": "Olivine Lighthouse",
    "type": "facility",
    "region": "Johto",
    "details": "Lighthouse overlooking Olivine City.",
    "landmarks": [
      "Glitter Lighthouse floors, elevator, and light room",
      "Jasmine tends the sick Ampharos at the top"
    ],
    "access": [
      "Climb through the lighthouse to reach Jasmine",
      "Bring the SecretPotion from Cianwood's pharmacy to resolve the incident and return Jasmine to her Gym",
      "The elevator shortcut to the light room opens after first speaking with Jasmine"
    ],
    "connections": [
      "Olivine City"
    ],
    "sources": [
      {
        "label": "Serebii location reference",
        "url": "https://www.serebii.net/pokearth/johto/shininglighthouse.shtml"
      },
      {
        "label": "Bulbapedia location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Glitter_Lighthouse"
      },
      {
        "label": "Map entrances",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/eventdata/zone_event/112_D27R0101.json"
      },
      {
        "label": "Game events",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0062_D27R0101.s"
      },
      {
        "label": "In-game text",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/msgdata/msg/msg_0093_D27R0101.json"
      },
      {
        "label": "Supporting game events 1",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0066_D27R0107.s"
      }
    ],
    "mapIds": [
      "MAP_OLIVINE_LIGHTHOUSE_1F",
      "MAP_OLIVINE_LIGHTHOUSE_LIGHT_ROOM"
    ],
    "audit": {
      "scope": "static location information",
      "reviewed_on": "2026-10-14"
    }
  },
  {
    "name": "Pokémon Day Care",
    "type": "facility",
    "region": "Johto",
    "details": "Located on Route 34, south of Goldenrod City.",
    "landmarks": [
      "Pokémon care and compatible-pair Egg service",
      "Day-Care couple and Pokégear contact",
      "Two Pokémon can be deposited for experience gain; a compatible pair can produce an Egg"
    ],
    "access": [
      "The entrance is on Route 34",
      "Goldenrod is reached along Route 34 rather than through a separate Day Care exit"
    ],
    "connections": [
      "Route 34"
    ],
    "sources": [
      {
        "label": "Serebii location reference",
        "url": "https://www.serebii.net/pokearth/johto/route34.shtml"
      },
      {
        "label": "Bulbapedia location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9mon_Day_Care"
      },
      {
        "label": "Supporting location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_34"
      },
      {
        "label": "Map entrances",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/eventdata/zone_event/302_R34R0101.json"
      },
      {
        "label": "Game events",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0238_R34R0101.s"
      },
      {
        "label": "In-game text",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/msgdata/msg/msg_0385_R34R0101.json"
      }
    ],
    "mapIds": [
      "MAP_ROUTE_34_DAYCARE"
    ],
    "audit": {
      "scope": "static location information",
      "reviewed_on": "2026-10-14"
    }
  },
  {
    "name": "S.S. Aqua",
    "type": "facility",
    "region": "Johto / Kanto connection",
    "details": "Ship connecting Olivine City and Vermilion City after the Johto League.",
    "landmarks": [
      "Passenger ship linking Olivine and Vermilion in Kanto",
      "Cabins, engine deck, and captain's room"
    ],
    "access": [
      "The ship is a post-League service and an S.S. Ticket is required for boarding",
      "After the first voyage, departures from Olivine are Monday and Friday, while return departures from Vermilion are Wednesday and Sunday",
      "The first voyage involves finding the missing granddaughter; on later trips, sleep in the cabin bed to complete the crossing",
      "S.S. Ticket and scheduled sailing: Vermilion to Olivine on Wednesday and Sunday; first Kanto arrival follows the initial Olivine voyage."
    ],
    "connections": [
      "Olivine City",
      "Vermilion City"
    ],
    "sources": [
      {
        "label": "Serebii location reference",
        "url": "https://www.serebii.net/pokearth/johto/ssaqua.shtml"
      },
      {
        "label": "Bulbapedia location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/S.S._Aqua"
      },
      {
        "label": "Map entrances",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/eventdata/zone_event/278_P01R0301.json"
      },
      {
        "label": "Game events",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0156_P01R0301.s"
      },
      {
        "label": "In-game text",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/msgdata/msg/msg_0259_P01R0301.json"
      },
      {
        "label": "Supporting game events 1",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0152_P01R0101.s"
      },
      {
        "label": "Supporting game events 2",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0154_P01R0103.s"
      }
    ],
    "mapIds": [
      "MAP_SS_AQUA_1F",
      "MAP_SS_AQUA_OLIVINE_PORT_INTERIOR",
      "MAP_SS_AQUA_VERMILION_PORT_INTERIOR"
    ],
    "audit": {
      "scope": "static location information",
      "reviewed_on": "2026-10-14"
    }
  },
  {
    "name": "Victory Road",
    "type": "landmark",
    "region": "Kanto border",
    "details": "Final route through the caves before the Indigo Plateau.",
    "landmarks": [
      "Multi-floor cave on the approach to Indigo Plateau",
      "Rival battle near the northern exit",
      "No ordinary Trainers remain in the HeartGold/SoulSilver cave; Moltres is at Mt. Silver, not here"
    ],
    "access": [
      "Enter through the Pokémon League Reception Gate after the Johto Badge check",
      "Strength is needed for the route through the cave"
    ],
    "connections": [
      "Pokémon League Reception Gate",
      "Indigo Plateau"
    ],
    "sources": [
      {
        "label": "Serebii location reference",
        "url": "https://www.serebii.net/pokearth/kanto/4th/victoryroad.shtml"
      },
      {
        "label": "Bulbapedia location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Victory_Road_(Kanto)"
      },
      {
        "label": "Map entrances",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/eventdata/zone_event/121_D43R0101.json"
      },
      {
        "label": "Game events",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0139_EVERYWHERE.s"
      }
    ],
    "mapIds": [
      "MAP_VICTORY_ROAD_1F"
    ],
    "audit": {
      "scope": "static location information",
      "reviewed_on": "2026-10-14"
    }
  },
  {
    "name": "Indigo Plateau",
    "type": "facility",
    "region": "Kanto border",
    "details": "Pokémon League headquarters.",
    "landmarks": [
      "Pokémon League lobby, healing, supplies, and the Elite Four challenge",
      "Champion and Hall of Fame"
    ],
    "access": [
      "Reached from Victory Road",
      "The League challenge follows the Elite Four rooms before the Champion",
      "The Elite Four and Champion are a consecutive challenge; returning to the lobby for healing is not possible mid-challenge"
    ],
    "connections": [
      "Victory Road"
    ],
    "sources": [
      {
        "label": "Serebii location reference",
        "url": "https://www.serebii.net/pokearth/kanto/4th/indigoplateau.shtml"
      },
      {
        "label": "Bulbapedia location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Indigo_Plateau"
      },
      {
        "label": "Map entrances",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/eventdata/zone_event/055_T10.json"
      },
      {
        "label": "Game events",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0818_T10.s"
      },
      {
        "label": "In-game text",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/msgdata/msg/msg_0521_T10.json"
      }
    ],
    "mapIds": [
      "MAP_INDIGO_PLATEAU"
    ],
    "audit": {
      "scope": "static location information",
      "reviewed_on": "2026-10-14"
    }
  },
  {
    "name": "Mt. Silver",
    "type": "landmark",
    "region": "Kanto border",
    "details": "Postgame mountain reached from Route 28, with cave routes leading to the summit.",
    "landmarks": [
      "Mountain exterior with a Pokémon Center and extensive cave routes",
      "Summit battle with Red and a separate Moltres chamber"
    ],
    "access": [
      "Reach the exterior west from Route 28 after Oak grants access for earning all 16 Badges",
      "Rock Climb is needed for the summit route, while Surf and Waterfall open water branches",
      "Flash is not needed to light the HeartGold/SoulSilver cave; Mt. Silver here groups the exterior and Mt. Silver Cave"
    ],
    "connections": [
      "Route 28"
    ],
    "sources": [
      {
        "label": "Serebii location reference",
        "url": "https://www.serebii.net/pokearth/johto/mt.silver.shtml"
      },
      {
        "label": "Bulbapedia location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Mt._Silver"
      },
      {
        "label": "Supporting location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Mt._Silver_Cave"
      },
      {
        "label": "Map entrances",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/eventdata/zone_event/087_T31.json"
      },
      {
        "label": "Game events",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0949_T31.s"
      },
      {
        "label": "In-game text",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/msgdata/msg/msg_0636_T31.json"
      },
      {
        "label": "Supporting game events 1",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0105_D41R0101.s"
      },
      {
        "label": "Supporting game events 2",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0107_D41R0108.s"
      },
      {
        "label": "Supporting game events 3",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0740_T01R0301.s"
      }
    ],
    "mapIds": [
      "MAP_MOUNT_SILVER",
      "MAP_MOUNT_SILVER_CAVE_1F",
      "MAP_MOUNT_SILVER_CAVE_SUMMIT",
      "MAP_PALLET_TOWN_OAKS_LAB"
    ],
    "audit": {
      "scope": "static location information",
      "reviewed_on": "2026-10-14"
    }
  },
  {
    "name": "Route 26",
    "type": "route",
    "region": "Kanto border",
    "details": "Northern League approach between Route 27 and the reception gate.",
    "landmarks": [
      "Road north toward the Pokémon League Reception Gate",
      "Rest house and the Week Siblings' house"
    ],
    "access": [
      "Route 27 is south",
      "The northern gate checks the eight Johto Badges before allowing passage toward Victory Road",
      "Southbound ledges provide faster return paths; the rest house heals the party"
    ],
    "connections": [
      "Route 27",
      "Pokémon League Reception Gate"
    ],
    "sources": [
      {
        "label": "Serebii location reference",
        "url": "https://www.serebii.net/pokearth/kanto/route26.shtml"
      },
      {
        "label": "Bulbapedia location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Kanto_Route_26"
      },
      {
        "label": "Map entrances",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/eventdata/zone_event/027_R26.json"
      },
      {
        "label": "Game events",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0218_R26.s"
      },
      {
        "label": "In-game text",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/msgdata/msg/msg_0365_R26.json"
      }
    ],
    "mapIds": [
      "MAP_ROUTE_26"
    ],
    "audit": {
      "scope": "static location information",
      "reviewed_on": "2026-10-14"
    }
  },
  {
    "name": "Route 27",
    "type": "route",
    "region": "Johto / Kanto connection",
    "details": "Water route from New Bark Town through Tohjo Falls toward Route 26.",
    "landmarks": [
      "Johto-to-Kanto water crossing and Tohjo Falls",
      "House on the road toward Route 26"
    ],
    "access": [
      "Surf east from New Bark Town",
      "Waterfall is needed to traverse Tohjo Falls and continue along the League approach",
      "After obtaining eight Johto Badges, receive Elm's Master Ball and complete the Kimono Girls/Lugia story event before leaving New Bark for the League",
      "Whirlpool reaches optional islands; it is separate from Waterfall needed inside Tohjo Falls"
    ],
    "connections": [
      "New Bark Town",
      "Route 26",
      "Tohjo Falls"
    ],
    "sources": [
      {
        "label": "Serebii location reference",
        "url": "https://www.serebii.net/pokearth/kanto/route27.shtml"
      },
      {
        "label": "Bulbapedia location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Kanto_Route_27"
      },
      {
        "label": "Map entrances",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/eventdata/zone_event/028_R27.json"
      },
      {
        "label": "Game events",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0221_R27.s"
      },
      {
        "label": "In-game text",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/msgdata/msg/msg_0369_R27.json"
      }
    ],
    "mapIds": [
      "MAP_ROUTE_27"
    ],
    "audit": {
      "scope": "static location information",
      "reviewed_on": "2026-10-14"
    }
  },
  {
    "name": "Route 28",
    "type": "route",
    "region": "Kanto border",
    "details": "Road from the League reception gate to the Mt. Silver exterior.",
    "landmarks": [
      "Western road from the League gate toward Mt. Silver",
      "Secluded house beside the route"
    ],
    "access": [
      "Reach it through the Pokémon League Reception Gate after the Mt. Silver access event",
      "The route leads to the Mt. Silver exterior rather than directly to Indigo Plateau",
      "Cut opens the path to the secluded celebrity's house; Surf is used for optional water exploration"
    ],
    "connections": [
      "Pokémon League Reception Gate",
      "Mt. Silver"
    ],
    "sources": [
      {
        "label": "Serebii location reference",
        "url": "https://www.serebii.net/pokearth/kanto/route28.shtml"
      },
      {
        "label": "Bulbapedia location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Kanto_Route_28"
      },
      {
        "label": "Map entrances",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/eventdata/zone_event/029_R28.json"
      },
      {
        "label": "Game events",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0223_R28.s"
      },
      {
        "label": "In-game text",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/msgdata/msg/msg_0371_R28.json"
      }
    ],
    "mapIds": [
      "MAP_ROUTE_28"
    ],
    "audit": {
      "scope": "static location information",
      "reviewed_on": "2026-10-14"
    }
  },
  {
    "name": "Tohjo Falls",
    "type": "landmark",
    "region": "Johto / Kanto connection",
    "details": "Waterfall cave forming the passage through Route 27.",
    "landmarks": [
      "Twin waterfalls in a cave on Route 27",
      "Optional hidden room behind a waterfall",
      "The normally empty hidden room is used for the event-Celebi time-travel battle with Giovanni"
    ],
    "access": [
      "Both public entrances return to Route 27",
      "Surf and Waterfall are needed for the passage through the cave"
    ],
    "connections": [
      "Route 27"
    ],
    "sources": [
      {
        "label": "Serebii location reference",
        "url": "https://www.serebii.net/pokearth/kanto/tohjofalls.shtml"
      },
      {
        "label": "Bulbapedia location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Tohjo_Falls"
      },
      {
        "label": "Map entrances",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/eventdata/zone_event/123_D45R0101.json"
      },
      {
        "label": "Game events",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0113_D45R0101.s"
      }
    ],
    "mapIds": [
      "MAP_TOHJO_FALLS"
    ],
    "audit": {
      "scope": "static location information",
      "reviewed_on": "2026-10-14"
    }
  },
  {
    "name": "Pokémon League Reception Gate",
    "type": "facility",
    "region": "Kanto border",
    "details": "Guarded road junction south of Victory Road.",
    "landmarks": [
      "Junction for Victory Road, Routes 26 and 28, and Kanto Route 22",
      "Guards enforce story access"
    ],
    "access": [
      "Eight Johto Badges open the way north to Victory Road",
      "The westward Mt. Silver route opens after Oak's all-16-Badges authorization, and Route 22 is beyond this Johto directory's eastern scope",
      "The eastern Route 22 guard moves after the player first visits Viridian City in HeartGold/SoulSilver, not after the Generation II Snorlax condition"
    ],
    "connections": [
      "Route 26",
      "Route 28",
      "Victory Road",
      "Route 22"
    ],
    "sources": [
      {
        "label": "Serebii location reference",
        "url": "https://www.serebii.net/pokearth/kanto/4th/route22.shtml"
      },
      {
        "label": "Bulbapedia location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9mon_League_Reception_Gate"
      },
      {
        "label": "Map entrances",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/eventdata/zone_event/270_R22R0101.json"
      },
      {
        "label": "Game events",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0213_R22R0101.s"
      },
      {
        "label": "In-game text",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/msgdata/msg/msg_0361_R22R0101.json"
      },
      {
        "label": "Supporting game events 1",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0740_T01R0301.s"
      }
    ],
    "mapIds": [
      "MAP_ROUTE_22_POKEMON_LEAGUE_RECEPTION_GATE",
      "MAP_PALLET_TOWN_OAKS_LAB"
    ],
    "audit": {
      "scope": "static location information",
      "reviewed_on": "2026-10-14"
    }
  },
  {
    "name": "Bellchime Trail",
    "type": "landmark",
    "region": "Johto",
    "details": "Tree-lined outdoor approach to Bell Tower from Ecruteak.",
    "landmarks": [
      "Outdoor path between the Barrier Station and Bell Tower",
      "Autumn-coloured trees surrounding the tower approach"
    ],
    "access": [
      "Enter through the Barrier Station in Ecruteak",
      "Bell Tower is at the far end, with its ascent separately gated by the Rainbow Wing"
    ],
    "connections": [
      "Ecruteak City",
      "Bell Tower"
    ],
    "sources": [
      {
        "label": "Serebii location reference",
        "url": "https://www.serebii.net/pokearth/johto/bellchimetrail.shtml"
      },
      {
        "label": "Bulbapedia location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Bellchime_Trail"
      },
      {
        "label": "Map entrances",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/eventdata/zone_event/004_D17R1101.json"
      },
      {
        "label": "Game events",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0022_D17R1101.s"
      },
      {
        "label": "In-game text",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/msgdata/msg/msg_0059_D17R1101.json"
      }
    ],
    "mapIds": [
      "MAP_BELLCHIME_TOWER"
    ],
    "audit": {
      "scope": "static location information",
      "reviewed_on": "2026-10-14"
    }
  },
  {
    "name": "Goldenrod Tunnel",
    "type": "facility",
    "region": "Johto",
    "details": "Goldenrod Tunnel, also known as the Goldenrod Underground: shopping passage and story basements beneath the city.",
    "landmarks": [
      "Underground passage with Haircut Brothers and rotating services",
      "Dress-up photo activity and basement/warehouse story sections"
    ],
    "access": [
      "Street entrances are in Goldenrod City",
      "Basement keys and switches gate the Team Rocket rescue route and warehouse connection"
    ],
    "connections": [
      "Goldenrod City",
      "Goldenrod Department Store"
    ],
    "sources": [
      {
        "label": "Serebii location reference",
        "url": "https://www.serebii.net/pokearth/johto/goldenrodunderground.shtml"
      },
      {
        "label": "Bulbapedia location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Goldenrod_Underground"
      },
      {
        "label": "Map entrances",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/eventdata/zone_event/192_D37R0102.json"
      },
      {
        "label": "Game events",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0094_D37R0102.s"
      },
      {
        "label": "In-game text",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/msgdata/msg/msg_0117_D37R0102.json"
      },
      {
        "label": "Supporting game events 1",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0096_D37R0104.s"
      },
      {
        "label": "Supporting game events 2",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0097_D37R0105.s"
      }
    ],
    "mapIds": [
      "MAP_GOLDENROD_TUNNEL_B1F",
      "MAP_GOLDENROD_TUNNEL_B2F",
      "MAP_GOLDENROD_TUNNEL_WAREHOUSE"
    ],
    "aliases": [
      "Goldenrod Underground"
    ],
    "audit": {
      "scope": "static location information",
      "reviewed_on": "2026-10-14"
    }
  },
  {
    "name": "Team Rocket HQ",
    "type": "facility",
    "region": "Johto",
    "details": "Hidden headquarters beneath Mahogany Town’s souvenir shop.",
    "landmarks": [
      "Three basement floors beneath Mahogany's souvenir shop",
      "Security statues, password doors, and radio transmitter plot"
    ],
    "access": [
      "Lance reveals the entrance during the Lake of Rage investigation",
      "Clear the headquarters as part of the Mahogany story",
      "Lance awards HM05 Whirlpool after the generator is shut down; Pryce's Glacier Badge is required to use it outside battle"
    ],
    "connections": [
      "Mahogany Town"
    ],
    "sources": [
      {
        "label": "Serebii location reference",
        "url": "https://www.serebii.net/pokearth/johto/rockethideout.shtml"
      },
      {
        "label": "Bulbapedia location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Team_Rocket_HQ"
      },
      {
        "label": "Map entrances",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/eventdata/zone_event/233_D35R0102.json"
      },
      {
        "label": "Game events",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0089_D35R0102.s"
      },
      {
        "label": "In-game text",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/msgdata/msg/msg_0112_D35R0102.json"
      },
      {
        "label": "Supporting game events 1",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0090_D35R0103.s"
      },
      {
        "label": "Supporting game events 2",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0091_D35R0104.s"
      }
    ],
    "mapIds": [
      "MAP_TEAM_ROCKET_HEADQUARTERS_B1F",
      "MAP_TEAM_ROCKET_HEADQUARTERS_B2F",
      "MAP_TEAM_ROCKET_HEADQUARTERS_B3F"
    ],
    "audit": {
      "scope": "static location information",
      "reviewed_on": "2026-10-14"
    }
  },
  {
    "name": "Frontier Access",
    "type": "facility",
    "region": "Johto",
    "details": "Visitor area between Route 40 and the Battle Frontier.",
    "landmarks": [
      "Approach area with services for Battle Frontier visitors",
      "Gate to the five battle facilities",
      "Move Tutors in the southwestern house teach moves in exchange for Battle Points"
    ],
    "access": [
      "Enter through the northern Route 40 gate after entering the Hall of Fame",
      "Continue through the northern gate to the Battle Frontier"
    ],
    "connections": [
      "Route 40",
      "Battle Frontier"
    ],
    "sources": [
      {
        "label": "Serebii location reference",
        "url": "https://www.serebii.net/pokearth/johto/frontieraccess.shtml"
      },
      {
        "label": "Bulbapedia location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Frontier_Access"
      },
      {
        "label": "Map entrances",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/eventdata/zone_event/367_D32R0102.json"
      },
      {
        "label": "Game events",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0081_D32R0102.s"
      },
      {
        "label": "In-game text",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/msgdata/msg/msg_0104_D32R0102.json"
      },
      {
        "label": "Supporting game events 1",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0963_W40R0101.s"
      }
    ],
    "mapIds": [
      "MAP_BATTLE_FRONTIER_FRONTIER_ACCESS",
      "MAP_ROUTE_40_BATTLE_FRONTIER_GATEHOUSE"
    ],
    "audit": {
      "scope": "static location information",
      "reviewed_on": "2026-10-14"
    }
  },
  {
    "name": "Battle Frontier",
    "type": "facility",
    "region": "Johto",
    "details": "Postgame complex with five specialist battle facilities.",
    "landmarks": [
      "Battle Tower, Battle Factory, Battle Hall, Battle Castle, and Battle Arcade",
      "Battle Point services and Frontier Brain challenges"
    ],
    "access": [
      "Reached through Frontier Access from Route 40 after the Hall of Fame",
      "Each facility has its own entry rules, separate from ordinary route battles"
    ],
    "connections": [
      "Frontier Access"
    ],
    "sources": [
      {
        "label": "Serebii location reference",
        "url": "https://www.serebii.net/pokearth/johto/battlefrontier.shtml"
      },
      {
        "label": "Bulbapedia location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Battle_Frontier_(Generation_IV)"
      },
      {
        "label": "Map entrances",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/eventdata/zone_event/243_D32.json"
      },
      {
        "label": "Game events",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0076_D32.s"
      },
      {
        "label": "In-game text",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/msgdata/msg/msg_0100_D32.json"
      }
    ],
    "mapIds": [
      "MAP_BATTLE_FRONTIER"
    ],
    "audit": {
      "scope": "static location information",
      "reviewed_on": "2026-10-14"
    }
  },
  {
    "name": "MooMoo Farm",
    "type": "facility",
    "region": "Johto",
    "details": "Farmhouse and Miltank stable on Route 39.",
    "landmarks": [
      "Farmhouse, stable, and the sick Miltank event",
      "Moomoo Milk becomes available after helping Miltank"
    ],
    "access": [
      "Both the farmhouse and stable are reached from Route 39",
      "After speaking to the owner, feed Moomoo seven Oran Berries to restore her health; speak to the children for the Seal Case"
    ],
    "connections": [
      "Route 39"
    ],
    "sources": [
      {
        "label": "Serebii location reference",
        "url": "https://www.serebii.net/pokearth/johto/route39.shtml"
      },
      {
        "label": "Bulbapedia location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Moomoo_Farm"
      },
      {
        "label": "Map entrances",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/eventdata/zone_event/202_R39R0201.json"
      },
      {
        "label": "Game events",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0251_R39R0201.s"
      },
      {
        "label": "In-game text",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/msgdata/msg/msg_0398_R39R0201.json"
      },
      {
        "label": "Supporting game events 1",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0250_R39R0101.s"
      }
    ],
    "mapIds": [
      "MAP_ROUTE_39_MOOMOO_FARM_STABLE",
      "MAP_ROUTE_39_MOOMOO_FARM_HOUSE"
    ],
    "audit": {
      "scope": "static location information",
      "reviewed_on": "2026-10-14"
    }
  },
  {
    "name": "Magnet Train Station",
    "type": "facility",
    "region": "Johto / Kanto connection",
    "details": "Goldenrod station for the train to Saffron City.",
    "landmarks": [
      "Goldenrod terminal of the Magnet Train to Saffron in Kanto",
      "Automatic Pass check at the platform"
    ],
    "access": [
      "Service must be restored through the Kanto Power Plant story",
      "A Magnet Train Pass is required to board",
      "Return Copycat's Lost Item from Vermilion to obtain the Pass; the restored service runs independently of the S.S. Aqua sailing days",
      "Train travel requires restored Power Plant electricity and Copycat’s Pass; entering the station does not."
    ],
    "connections": [
      "Goldenrod City",
      "Saffron Magnet Train Station"
    ],
    "sources": [
      {
        "label": "Serebii location reference",
        "url": "https://www.serebii.net/pokearth/johto/goldenrodcity.shtml"
      },
      {
        "label": "Bulbapedia location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Magnet_Train"
      },
      {
        "label": "Map entrances",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/eventdata/zone_event/190_T25R0501.json"
      },
      {
        "label": "Game events",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/fielddata/script/scr_seq/scr_seq_0893_T25R0501.s"
      },
      {
        "label": "In-game text",
        "url": "https://github.com/pret/pokeheartgold/blob/e3f671ad1d060140c587f925f4ab8ec3596f62b9/files/msgdata/msg/msg_0587_T25R0501.json"
      }
    ],
    "mapIds": [
      "MAP_GOLDENROD_MAGNET_TRAIN_STATION_1F"
    ],
    "audit": {
      "scope": "static location information",
      "reviewed_on": "2026-10-14"
    }
  },
  {
    "name": "Route 1",
    "type": "route",
    "region": "Kanto",
    "details": "Kanto Route 1 in HeartGold/SoulSilver; Floors, gatehouses and related rooms are grouped with this route",
    "landmarks": [
      "Kanto Route 1 in HeartGold/SoulSilver",
      "Floors, gatehouses and related rooms are grouped with this route"
    ],
    "access": [
      "Postgame Kanto access follows the first Pokémon League victory and S.S. Aqua voyage.",
      "Reference navigation remains available regardless of saved story progress."
    ],
    "connections": [
      "Pallet Town",
      "Viridian City"
    ],
    "sources": [
      {
        "label": "Serebii HGSS location reference",
        "url": "https://www.serebii.net/pokearth/kanto/4th/route1.shtml"
      },
      {
        "label": "Bulbapedia HGSS location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Kanto_Route_1"
      },
      {
        "label": "Pinned HGSS map headers",
        "url": "https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/src/data/map_headers.h"
      }
    ],
    "mapIds": [
      "MAP_ROUTE_1",
      "MAP_VIRIDIAN_ROUTE_1_GATEHOUSE"
    ],
    "audit": {
      "scope": "primary geography; secondary verification tracked separately",
      "primaryRevision": "d2355244ac42b3c6e40d8c36aa3564ee8706dea4"
    }
  },
  {
    "name": "Route 2",
    "type": "route",
    "region": "Kanto",
    "details": "Kanto Route 2 in HeartGold/SoulSilver; Floors, gatehouses and related rooms are grouped with this route",
    "landmarks": [
      "Kanto Route 2 in HeartGold/SoulSilver",
      "Floors, gatehouses and related rooms are grouped with this route"
    ],
    "access": [
      "Postgame Kanto access follows the first Pokémon League victory and S.S. Aqua voyage.",
      "Reference navigation remains available regardless of saved story progress."
    ],
    "connections": [
      "Viridian City",
      "Pewter City",
      "Viridian Forest",
      "Diglett’s Cave"
    ],
    "sources": [
      {
        "label": "Serebii HGSS location reference",
        "url": "https://www.serebii.net/pokearth/kanto/4th/route2.shtml"
      },
      {
        "label": "Bulbapedia HGSS location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Kanto_Route_2"
      },
      {
        "label": "Pinned HGSS map headers",
        "url": "https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/src/data/map_headers.h"
      }
    ],
    "mapIds": [
      "MAP_ROUTE_2",
      "MAP_ROUTE_2_EAST",
      "MAP_ROUTE_2_HOUSE",
      "MAP_ROUTE_2_SOUTHEAST_GATEHOUSE",
      "MAP_ROUTE_2_VIRIDIAN_FOREST_SOUTH_GATEHOUSE",
      "MAP_ROUTE_2_VIRIDIAN_FOREST_NORTH_GATEHOUSE"
    ],
    "audit": {
      "scope": "primary geography; secondary verification tracked separately",
      "primaryRevision": "d2355244ac42b3c6e40d8c36aa3564ee8706dea4"
    }
  },
  {
    "name": "Route 3",
    "type": "route",
    "region": "Kanto",
    "details": "Kanto Route 3 in HeartGold/SoulSilver; Floors, gatehouses and related rooms are grouped with this route",
    "landmarks": [
      "Kanto Route 3 in HeartGold/SoulSilver",
      "Floors, gatehouses and related rooms are grouped with this route"
    ],
    "access": [
      "Postgame Kanto access follows the first Pokémon League victory and S.S. Aqua voyage.",
      "Reference navigation remains available regardless of saved story progress."
    ],
    "connections": [
      "Pewter City",
      "Mt. Moon"
    ],
    "sources": [
      {
        "label": "Serebii HGSS location reference",
        "url": "https://www.serebii.net/pokearth/kanto/4th/route3.shtml"
      },
      {
        "label": "Bulbapedia HGSS location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Kanto_Route_3"
      },
      {
        "label": "Pinned HGSS map headers",
        "url": "https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/src/data/map_headers.h"
      }
    ],
    "mapIds": [
      "MAP_ROUTE_3",
      "MAP_ROUTE_3_POKECENTER_1F",
      "MAP_ROUTE_3_POKECENTER_B1F"
    ],
    "audit": {
      "scope": "primary geography; secondary verification tracked separately",
      "primaryRevision": "d2355244ac42b3c6e40d8c36aa3564ee8706dea4"
    }
  },
  {
    "name": "Route 4",
    "type": "route",
    "region": "Kanto",
    "details": "Kanto Route 4 in HeartGold/SoulSilver; Floors, gatehouses and related rooms are grouped with this route",
    "landmarks": [
      "Kanto Route 4 in HeartGold/SoulSilver",
      "Floors, gatehouses and related rooms are grouped with this route"
    ],
    "access": [
      "Postgame Kanto access follows the first Pokémon League victory and S.S. Aqua voyage.",
      "Reference navigation remains available regardless of saved story progress."
    ],
    "connections": [
      "Mt. Moon",
      "Cerulean City"
    ],
    "sources": [
      {
        "label": "Serebii HGSS location reference",
        "url": "https://www.serebii.net/pokearth/kanto/4th/route4.shtml"
      },
      {
        "label": "Bulbapedia HGSS location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Kanto_Route_4"
      },
      {
        "label": "Pinned HGSS map headers",
        "url": "https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/src/data/map_headers.h"
      }
    ],
    "mapIds": [
      "MAP_ROUTE_4"
    ],
    "audit": {
      "scope": "primary geography; secondary verification tracked separately",
      "primaryRevision": "d2355244ac42b3c6e40d8c36aa3564ee8706dea4"
    }
  },
  {
    "name": "Route 5",
    "type": "route",
    "region": "Kanto",
    "details": "Kanto Route 5 in HeartGold/SoulSilver; Floors, gatehouses and related rooms are grouped with this route",
    "landmarks": [
      "Kanto Route 5 in HeartGold/SoulSilver",
      "Floors, gatehouses and related rooms are grouped with this route"
    ],
    "access": [
      "Postgame Kanto access follows the first Pokémon League victory and S.S. Aqua voyage.",
      "Reference navigation remains available regardless of saved story progress.",
      "The Underground Path reopens after power is restored."
    ],
    "connections": [
      "Cerulean City",
      "Saffron City",
      "Underground Path"
    ],
    "sources": [
      {
        "label": "Serebii HGSS location reference",
        "url": "https://www.serebii.net/pokearth/kanto/4th/route5.shtml"
      },
      {
        "label": "Bulbapedia HGSS location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Kanto_Route_5"
      },
      {
        "label": "Pinned HGSS map headers",
        "url": "https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/src/data/map_headers.h"
      }
    ],
    "mapIds": [
      "MAP_ROUTE_5",
      "MAP_ROUTE_5_SAFFRON_GATEHOUSE",
      "MAP_ROUTE_5_UNDERGROUND_PATH_GATE",
      "MAP_ROUTE_5_HOUSE"
    ],
    "audit": {
      "scope": "primary geography; secondary verification tracked separately",
      "primaryRevision": "d2355244ac42b3c6e40d8c36aa3564ee8706dea4"
    }
  },
  {
    "name": "Route 6",
    "type": "route",
    "region": "Kanto",
    "details": "Kanto Route 6 in HeartGold/SoulSilver; Floors, gatehouses and related rooms are grouped with this route",
    "landmarks": [
      "Kanto Route 6 in HeartGold/SoulSilver",
      "Floors, gatehouses and related rooms are grouped with this route"
    ],
    "access": [
      "Postgame Kanto access follows the first Pokémon League victory and S.S. Aqua voyage.",
      "Reference navigation remains available regardless of saved story progress.",
      "Restore power to reopen the Underground Path."
    ],
    "connections": [
      "Saffron City",
      "Vermilion City",
      "Underground Path"
    ],
    "sources": [
      {
        "label": "Serebii HGSS location reference",
        "url": "https://www.serebii.net/pokearth/kanto/4th/route6.shtml"
      },
      {
        "label": "Bulbapedia HGSS location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Kanto_Route_6"
      },
      {
        "label": "Pinned HGSS map headers",
        "url": "https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/src/data/map_headers.h"
      }
    ],
    "mapIds": [
      "MAP_ROUTE_6",
      "MAP_ROUTE_6_SAFFRON_GATEHOUSE",
      "MAP_ROUTE_6_UNDERGROUND_PATH_GATE"
    ],
    "audit": {
      "scope": "primary geography; secondary verification tracked separately",
      "primaryRevision": "d2355244ac42b3c6e40d8c36aa3564ee8706dea4"
    }
  },
  {
    "name": "Route 7",
    "type": "route",
    "region": "Kanto",
    "details": "Kanto Route 7 in HeartGold/SoulSilver; Floors, gatehouses and related rooms are grouped with this route",
    "landmarks": [
      "Kanto Route 7 in HeartGold/SoulSilver",
      "Floors, gatehouses and related rooms are grouped with this route"
    ],
    "access": [
      "Postgame Kanto access follows the first Pokémon League victory and S.S. Aqua voyage.",
      "Reference navigation remains available regardless of saved story progress."
    ],
    "connections": [
      "Celadon City",
      "Saffron City"
    ],
    "sources": [
      {
        "label": "Serebii HGSS location reference",
        "url": "https://www.serebii.net/pokearth/kanto/4th/route7.shtml"
      },
      {
        "label": "Bulbapedia HGSS location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Kanto_Route_7"
      },
      {
        "label": "Pinned HGSS map headers",
        "url": "https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/src/data/map_headers.h"
      }
    ],
    "mapIds": [
      "MAP_ROUTE_7",
      "MAP_ROUTE_7_SAFFRON_GATEHOUSE"
    ],
    "audit": {
      "scope": "primary geography; secondary verification tracked separately",
      "primaryRevision": "d2355244ac42b3c6e40d8c36aa3564ee8706dea4"
    }
  },
  {
    "name": "Route 8",
    "type": "route",
    "region": "Kanto",
    "details": "Kanto Route 8 in HeartGold/SoulSilver; Floors, gatehouses and related rooms are grouped with this route",
    "landmarks": [
      "Kanto Route 8 in HeartGold/SoulSilver",
      "Floors, gatehouses and related rooms are grouped with this route"
    ],
    "access": [
      "Postgame Kanto access follows the first Pokémon League victory and S.S. Aqua voyage.",
      "Reference navigation remains available regardless of saved story progress."
    ],
    "connections": [
      "Saffron City",
      "Lavender Town"
    ],
    "sources": [
      {
        "label": "Serebii HGSS location reference",
        "url": "https://www.serebii.net/pokearth/kanto/4th/route8.shtml"
      },
      {
        "label": "Bulbapedia HGSS location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Kanto_Route_8"
      },
      {
        "label": "Pinned HGSS map headers",
        "url": "https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/src/data/map_headers.h"
      }
    ],
    "mapIds": [
      "MAP_ROUTE_8",
      "MAP_ROUTE_8_SAFFRON_GATEHOUSE"
    ],
    "audit": {
      "scope": "primary geography; secondary verification tracked separately",
      "primaryRevision": "d2355244ac42b3c6e40d8c36aa3564ee8706dea4"
    }
  },
  {
    "name": "Route 9",
    "type": "route",
    "region": "Kanto",
    "details": "Kanto Route 9 in HeartGold/SoulSilver; Floors, gatehouses and related rooms are grouped with this route",
    "landmarks": [
      "Kanto Route 9 in HeartGold/SoulSilver",
      "Floors, gatehouses and related rooms are grouped with this route"
    ],
    "access": [
      "Postgame Kanto access follows the first Pokémon League victory and S.S. Aqua voyage.",
      "Reference navigation remains available regardless of saved story progress."
    ],
    "connections": [
      "Cerulean City",
      "Route 10"
    ],
    "sources": [
      {
        "label": "Serebii HGSS location reference",
        "url": "https://www.serebii.net/pokearth/kanto/4th/route9.shtml"
      },
      {
        "label": "Bulbapedia HGSS location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Kanto_Route_9"
      },
      {
        "label": "Pinned HGSS map headers",
        "url": "https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/src/data/map_headers.h"
      }
    ],
    "mapIds": [
      "MAP_ROUTE_9"
    ],
    "audit": {
      "scope": "primary geography; secondary verification tracked separately",
      "primaryRevision": "d2355244ac42b3c6e40d8c36aa3564ee8706dea4"
    }
  },
  {
    "name": "Route 10",
    "type": "route",
    "region": "Kanto",
    "details": "Kanto Route 10 in HeartGold/SoulSilver; Floors, gatehouses and related rooms are grouped with this route",
    "landmarks": [
      "Kanto Route 10 in HeartGold/SoulSilver",
      "Floors, gatehouses and related rooms are grouped with this route"
    ],
    "access": [
      "Postgame Kanto access follows the first Pokémon League victory and S.S. Aqua voyage.",
      "Reference navigation remains available regardless of saved story progress.",
      "South Route 10: travel from the northern section requires passing through Rock Tunnel."
    ],
    "connections": [
      "Route 9",
      "Lavender Town",
      "Rock Tunnel",
      "Power Plant"
    ],
    "sources": [
      {
        "label": "Serebii HGSS location reference",
        "url": "https://www.serebii.net/pokearth/kanto/4th/route10.shtml"
      },
      {
        "label": "Bulbapedia HGSS location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Kanto_Route_10"
      },
      {
        "label": "Pinned HGSS map headers",
        "url": "https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/src/data/map_headers.h"
      }
    ],
    "mapIds": [
      "MAP_ROUTE_10",
      "MAP_ROUTE_10_SOUTH",
      "MAP_ROUTE_10_POKECENTER_1F",
      "MAP_ROUTE_10_POKECENTER_B1F"
    ],
    "audit": {
      "scope": "primary geography; secondary verification tracked separately",
      "primaryRevision": "d2355244ac42b3c6e40d8c36aa3564ee8706dea4"
    }
  },
  {
    "name": "Route 11",
    "type": "route",
    "region": "Kanto",
    "details": "Kanto Route 11 in HeartGold/SoulSilver; Floors, gatehouses and related rooms are grouped with this route",
    "landmarks": [
      "Kanto Route 11 in HeartGold/SoulSilver",
      "Floors, gatehouses and related rooms are grouped with this route"
    ],
    "access": [
      "Postgame Kanto access follows the first Pokémon League victory and S.S. Aqua voyage.",
      "Reference navigation remains available regardless of saved story progress.",
      "Restore power, receive the EXPN Card in Lavender, then play the Poké Flute channel beside Snorlax on Route 11."
    ],
    "connections": [
      "Vermilion City",
      "Route 12",
      "Diglett’s Cave"
    ],
    "sources": [
      {
        "label": "Serebii HGSS location reference",
        "url": "https://www.serebii.net/pokearth/kanto/4th/route11.shtml"
      },
      {
        "label": "Bulbapedia HGSS location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Kanto_Route_11"
      },
      {
        "label": "Pinned HGSS map headers",
        "url": "https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/src/data/map_headers.h"
      }
    ],
    "mapIds": [
      "MAP_ROUTE_11",
      "MAP_ROUTE_19_ROUTE_12_GATEHOUSE"
    ],
    "audit": {
      "scope": "primary geography; secondary verification tracked separately",
      "primaryRevision": "d2355244ac42b3c6e40d8c36aa3564ee8706dea4"
    }
  },
  {
    "name": "Route 12",
    "type": "route",
    "region": "Kanto",
    "details": "Kanto Route 12 in HeartGold/SoulSilver; Floors, gatehouses and related rooms are grouped with this route",
    "landmarks": [
      "Kanto Route 12 in HeartGold/SoulSilver",
      "Floors, gatehouses and related rooms are grouped with this route"
    ],
    "access": [
      "Postgame Kanto access follows the first Pokémon League victory and S.S. Aqua voyage.",
      "Reference navigation remains available regardless of saved story progress."
    ],
    "connections": [
      "Route 11",
      "Lavender Town",
      "Route 13"
    ],
    "sources": [
      {
        "label": "Serebii HGSS location reference",
        "url": "https://www.serebii.net/pokearth/kanto/4th/route12.shtml"
      },
      {
        "label": "Bulbapedia HGSS location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Kanto_Route_12"
      },
      {
        "label": "Pinned HGSS map headers",
        "url": "https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/src/data/map_headers.h"
      }
    ],
    "mapIds": [
      "MAP_ROUTE_12",
      "MAP_ROUTE_12_FISHING_BROTHER_HOUSE"
    ],
    "audit": {
      "scope": "primary geography; secondary verification tracked separately",
      "primaryRevision": "d2355244ac42b3c6e40d8c36aa3564ee8706dea4"
    }
  },
  {
    "name": "Route 13",
    "type": "route",
    "region": "Kanto",
    "details": "Kanto Route 13 in HeartGold/SoulSilver; Floors, gatehouses and related rooms are grouped with this route",
    "landmarks": [
      "Kanto Route 13 in HeartGold/SoulSilver",
      "Floors, gatehouses and related rooms are grouped with this route"
    ],
    "access": [
      "Postgame Kanto access follows the first Pokémon League victory and S.S. Aqua voyage.",
      "Reference navigation remains available regardless of saved story progress."
    ],
    "connections": [
      "Route 12",
      "Route 14"
    ],
    "sources": [
      {
        "label": "Serebii HGSS location reference",
        "url": "https://www.serebii.net/pokearth/kanto/4th/route13.shtml"
      },
      {
        "label": "Bulbapedia HGSS location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Kanto_Route_13"
      },
      {
        "label": "Pinned HGSS map headers",
        "url": "https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/src/data/map_headers.h"
      }
    ],
    "mapIds": [
      "MAP_ROUTE_13"
    ],
    "audit": {
      "scope": "primary geography; secondary verification tracked separately",
      "primaryRevision": "d2355244ac42b3c6e40d8c36aa3564ee8706dea4"
    }
  },
  {
    "name": "Route 14",
    "type": "route",
    "region": "Kanto",
    "details": "Kanto Route 14 in HeartGold/SoulSilver; Floors, gatehouses and related rooms are grouped with this route",
    "landmarks": [
      "Kanto Route 14 in HeartGold/SoulSilver",
      "Floors, gatehouses and related rooms are grouped with this route"
    ],
    "access": [
      "Postgame Kanto access follows the first Pokémon League victory and S.S. Aqua voyage.",
      "Reference navigation remains available regardless of saved story progress."
    ],
    "connections": [
      "Route 13",
      "Route 15"
    ],
    "sources": [
      {
        "label": "Serebii HGSS location reference",
        "url": "https://www.serebii.net/pokearth/kanto/4th/route14.shtml"
      },
      {
        "label": "Bulbapedia HGSS location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Kanto_Route_14"
      },
      {
        "label": "Pinned HGSS map headers",
        "url": "https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/src/data/map_headers.h"
      }
    ],
    "mapIds": [
      "MAP_ROUTE_14"
    ],
    "audit": {
      "scope": "primary geography; secondary verification tracked separately",
      "primaryRevision": "d2355244ac42b3c6e40d8c36aa3564ee8706dea4"
    }
  },
  {
    "name": "Route 15",
    "type": "route",
    "region": "Kanto",
    "details": "Kanto Route 15 in HeartGold/SoulSilver; Floors, gatehouses and related rooms are grouped with this route",
    "landmarks": [
      "Kanto Route 15 in HeartGold/SoulSilver",
      "Floors, gatehouses and related rooms are grouped with this route"
    ],
    "access": [
      "Postgame Kanto access follows the first Pokémon League victory and S.S. Aqua voyage.",
      "Reference navigation remains available regardless of saved story progress."
    ],
    "connections": [
      "Route 14",
      "Fuchsia City"
    ],
    "sources": [
      {
        "label": "Serebii HGSS location reference",
        "url": "https://www.serebii.net/pokearth/kanto/4th/route15.shtml"
      },
      {
        "label": "Bulbapedia HGSS location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Kanto_Route_15"
      },
      {
        "label": "Pinned HGSS map headers",
        "url": "https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/src/data/map_headers.h"
      }
    ],
    "mapIds": [
      "MAP_ROUTE_15",
      "MAP_ROUTE_15_FUCHSIA_GATEHOUSE"
    ],
    "audit": {
      "scope": "primary geography; secondary verification tracked separately",
      "primaryRevision": "d2355244ac42b3c6e40d8c36aa3564ee8706dea4"
    }
  },
  {
    "name": "Route 16",
    "type": "route",
    "region": "Kanto",
    "details": "Kanto Route 16 in HeartGold/SoulSilver; Floors, gatehouses and related rooms are grouped with this route",
    "landmarks": [
      "Kanto Route 16 in HeartGold/SoulSilver",
      "Floors, gatehouses and related rooms are grouped with this route"
    ],
    "access": [
      "Postgame Kanto access follows the first Pokémon League victory and S.S. Aqua voyage.",
      "Reference navigation remains available regardless of saved story progress.",
      "A Bicycle is required for Cycling Road; Cut opens the northern Route 16 detour."
    ],
    "connections": [
      "Celadon City",
      "Route 17"
    ],
    "sources": [
      {
        "label": "Serebii HGSS location reference",
        "url": "https://www.serebii.net/pokearth/kanto/4th/route16.shtml"
      },
      {
        "label": "Bulbapedia HGSS location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Kanto_Route_16"
      },
      {
        "label": "Pinned HGSS map headers",
        "url": "https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/src/data/map_headers.h"
      }
    ],
    "mapIds": [
      "MAP_ROUTE_16",
      "MAP_ROUTE_16_HOUSE",
      "MAP_ROUTE_16_GATEHOUSE",
      "MAP_ROUTE_16_EAST"
    ],
    "audit": {
      "scope": "primary geography; secondary verification tracked separately",
      "primaryRevision": "d2355244ac42b3c6e40d8c36aa3564ee8706dea4"
    }
  },
  {
    "name": "Route 17",
    "type": "route",
    "region": "Kanto",
    "details": "Kanto Route 17 in HeartGold/SoulSilver; Floors, gatehouses and related rooms are grouped with this route",
    "landmarks": [
      "Kanto Route 17 in HeartGold/SoulSilver",
      "Floors, gatehouses and related rooms are grouped with this route"
    ],
    "access": [
      "Postgame Kanto access follows the first Pokémon League victory and S.S. Aqua voyage.",
      "Reference navigation remains available regardless of saved story progress.",
      "A Bicycle is required for Cycling Road; Cut opens the northern Route 16 detour."
    ],
    "connections": [
      "Route 16",
      "Route 18"
    ],
    "sources": [
      {
        "label": "Serebii HGSS location reference",
        "url": "https://www.serebii.net/pokearth/kanto/4th/route17.shtml"
      },
      {
        "label": "Bulbapedia HGSS location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Kanto_Route_17"
      },
      {
        "label": "Pinned HGSS map headers",
        "url": "https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/src/data/map_headers.h"
      }
    ],
    "mapIds": [
      "MAP_ROUTE_17"
    ],
    "audit": {
      "scope": "primary geography; secondary verification tracked separately",
      "primaryRevision": "d2355244ac42b3c6e40d8c36aa3564ee8706dea4"
    }
  },
  {
    "name": "Route 18",
    "type": "route",
    "region": "Kanto",
    "details": "Kanto Route 18 in HeartGold/SoulSilver; Floors, gatehouses and related rooms are grouped with this route",
    "landmarks": [
      "Kanto Route 18 in HeartGold/SoulSilver",
      "Floors, gatehouses and related rooms are grouped with this route"
    ],
    "access": [
      "Postgame Kanto access follows the first Pokémon League victory and S.S. Aqua voyage.",
      "Reference navigation remains available regardless of saved story progress.",
      "A Bicycle is required for Cycling Road; Cut opens the northern Route 16 detour."
    ],
    "connections": [
      "Route 17",
      "Fuchsia City"
    ],
    "sources": [
      {
        "label": "Serebii HGSS location reference",
        "url": "https://www.serebii.net/pokearth/kanto/4th/route18.shtml"
      },
      {
        "label": "Bulbapedia HGSS location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Kanto_Route_18"
      },
      {
        "label": "Pinned HGSS map headers",
        "url": "https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/src/data/map_headers.h"
      }
    ],
    "mapIds": [
      "MAP_ROUTE_18",
      "MAP_ROUTE_18_GATEHOUSE"
    ],
    "audit": {
      "scope": "primary geography; secondary verification tracked separately",
      "primaryRevision": "d2355244ac42b3c6e40d8c36aa3564ee8706dea4"
    }
  },
  {
    "name": "Route 19",
    "type": "route",
    "region": "Kanto",
    "details": "Kanto Route 19 in HeartGold/SoulSilver; Floors, gatehouses and related rooms are grouped with this route",
    "landmarks": [
      "Kanto Route 19 in HeartGold/SoulSilver",
      "Floors, gatehouses and related rooms are grouped with this route"
    ],
    "access": [
      "Postgame Kanto access follows the first Pokémon League victory and S.S. Aqua voyage.",
      "Reference navigation remains available regardless of saved story progress.",
      "The southern construction barrier opens after approaching from Route 20 and earning Blaine’s Volcano Badge."
    ],
    "connections": [
      "Fuchsia City",
      "Route 20"
    ],
    "sources": [
      {
        "label": "Serebii HGSS location reference",
        "url": "https://www.serebii.net/pokearth/kanto/4th/route19.shtml"
      },
      {
        "label": "Bulbapedia HGSS location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Kanto_Route_19"
      },
      {
        "label": "Pinned HGSS map headers",
        "url": "https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/src/data/map_headers.h"
      }
    ],
    "mapIds": [
      "MAP_ROUTE_19",
      "MAP_ROUTE_19_FUCHSIA_GATEHOUSE"
    ],
    "audit": {
      "scope": "primary geography; secondary verification tracked separately",
      "primaryRevision": "d2355244ac42b3c6e40d8c36aa3564ee8706dea4"
    }
  },
  {
    "name": "Route 20",
    "type": "route",
    "region": "Kanto",
    "details": "Kanto Route 20 in HeartGold/SoulSilver; Floors, gatehouses and related rooms are grouped with this route",
    "landmarks": [
      "Kanto Route 20 in HeartGold/SoulSilver",
      "Floors, gatehouses and related rooms are grouped with this route"
    ],
    "access": [
      "Postgame Kanto access follows the first Pokémon League victory and S.S. Aqua voyage.",
      "Reference navigation remains available regardless of saved story progress.",
      "Blaine’s Gym is reached upstairs; Articuno is on B4F."
    ],
    "connections": [
      "Route 19",
      "Cinnabar Island",
      "Seafoam Islands"
    ],
    "sources": [
      {
        "label": "Serebii HGSS location reference",
        "url": "https://www.serebii.net/pokearth/kanto/4th/route20.shtml"
      },
      {
        "label": "Bulbapedia HGSS location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Kanto_Route_20"
      },
      {
        "label": "Pinned HGSS map headers",
        "url": "https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/src/data/map_headers.h"
      }
    ],
    "mapIds": [
      "MAP_ROUTE_20"
    ],
    "audit": {
      "scope": "primary geography; secondary verification tracked separately",
      "primaryRevision": "d2355244ac42b3c6e40d8c36aa3564ee8706dea4"
    }
  },
  {
    "name": "Route 21",
    "type": "route",
    "region": "Kanto",
    "details": "Kanto Route 21 in HeartGold/SoulSilver; Floors, gatehouses and related rooms are grouped with this route",
    "landmarks": [
      "Kanto Route 21 in HeartGold/SoulSilver",
      "Floors, gatehouses and related rooms are grouped with this route"
    ],
    "access": [
      "Postgame Kanto access follows the first Pokémon League victory and S.S. Aqua voyage.",
      "Reference navigation remains available regardless of saved story progress."
    ],
    "connections": [
      "Cinnabar Island",
      "Pallet Town"
    ],
    "sources": [
      {
        "label": "Serebii HGSS location reference",
        "url": "https://www.serebii.net/pokearth/kanto/4th/route21.shtml"
      },
      {
        "label": "Bulbapedia HGSS location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Kanto_Route_21"
      },
      {
        "label": "Pinned HGSS map headers",
        "url": "https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/src/data/map_headers.h"
      }
    ],
    "mapIds": [
      "MAP_ROUTE_21"
    ],
    "audit": {
      "scope": "primary geography; secondary verification tracked separately",
      "primaryRevision": "d2355244ac42b3c6e40d8c36aa3564ee8706dea4"
    }
  },
  {
    "name": "Route 22",
    "type": "route",
    "region": "Kanto",
    "details": "Kanto Route 22 in HeartGold/SoulSilver; Floors, gatehouses and related rooms are grouped with this route",
    "landmarks": [
      "Kanto Route 22 in HeartGold/SoulSilver",
      "Floors, gatehouses and related rooms are grouped with this route"
    ],
    "access": [
      "Postgame Kanto access follows the first Pokémon League victory and S.S. Aqua voyage.",
      "Reference navigation remains available regardless of saved story progress."
    ],
    "connections": [
      "Viridian City",
      "Pokémon League Reception Gate"
    ],
    "sources": [
      {
        "label": "Serebii HGSS location reference",
        "url": "https://www.serebii.net/pokearth/kanto/4th/route22.shtml"
      },
      {
        "label": "Bulbapedia HGSS location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Kanto_Route_22"
      },
      {
        "label": "Pinned HGSS map headers",
        "url": "https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/src/data/map_headers.h"
      }
    ],
    "mapIds": [
      "MAP_ROUTE_22"
    ],
    "audit": {
      "scope": "primary geography; secondary verification tracked separately",
      "primaryRevision": "d2355244ac42b3c6e40d8c36aa3564ee8706dea4"
    }
  },
  {
    "name": "Route 24",
    "type": "route",
    "region": "Kanto",
    "details": "Kanto Route 24 in HeartGold/SoulSilver; Floors, gatehouses and related rooms are grouped with this route",
    "landmarks": [
      "Kanto Route 24 in HeartGold/SoulSilver",
      "Floors, gatehouses and related rooms are grouped with this route"
    ],
    "access": [
      "Postgame Kanto access follows the first Pokémon League victory and S.S. Aqua voyage.",
      "Reference navigation remains available regardless of saved story progress."
    ],
    "connections": [
      "Cerulean City",
      "Route 25"
    ],
    "sources": [
      {
        "label": "Serebii HGSS location reference",
        "url": "https://www.serebii.net/pokearth/kanto/4th/route24.shtml"
      },
      {
        "label": "Bulbapedia HGSS location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Kanto_Route_24"
      },
      {
        "label": "Pinned HGSS map headers",
        "url": "https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/src/data/map_headers.h"
      }
    ],
    "mapIds": [
      "MAP_ROUTE_24"
    ],
    "audit": {
      "scope": "primary geography; secondary verification tracked separately",
      "primaryRevision": "d2355244ac42b3c6e40d8c36aa3564ee8706dea4"
    }
  },
  {
    "name": "Route 25",
    "type": "route",
    "region": "Kanto",
    "details": "Kanto Route 25 in HeartGold/SoulSilver; Floors, gatehouses and related rooms are grouped with this route",
    "landmarks": [
      "Kanto Route 25 in HeartGold/SoulSilver",
      "Floors, gatehouses and related rooms are grouped with this route"
    ],
    "access": [
      "Postgame Kanto access follows the first Pokémon League victory and S.S. Aqua voyage.",
      "Reference navigation remains available regardless of saved story progress."
    ],
    "connections": [
      "Route 24"
    ],
    "sources": [
      {
        "label": "Serebii HGSS location reference",
        "url": "https://www.serebii.net/pokearth/kanto/4th/route25.shtml"
      },
      {
        "label": "Bulbapedia HGSS location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Kanto_Route_25"
      },
      {
        "label": "Pinned HGSS map headers",
        "url": "https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/src/data/map_headers.h"
      }
    ],
    "mapIds": [
      "MAP_ROUTE_25",
      "MAP_ROUTE_25_SEA_COTTAGE"
    ],
    "audit": {
      "scope": "primary geography; secondary verification tracked separately",
      "primaryRevision": "d2355244ac42b3c6e40d8c36aa3564ee8706dea4"
    }
  },
  {
    "name": "Pallet Town",
    "type": "town",
    "region": "Kanto",
    "details": "Oak’s laboratory; Red’s and Blue’s houses",
    "landmarks": [
      "Oak’s laboratory",
      "Red’s and Blue’s houses"
    ],
    "access": [
      "Postgame Kanto access follows the first Pokémon League victory and S.S. Aqua voyage.",
      "Reference navigation remains available regardless of saved story progress."
    ],
    "connections": [
      "Route 1",
      "Route 21"
    ],
    "sources": [
      {
        "label": "Serebii HGSS location reference",
        "url": "https://www.serebii.net/pokearth/kanto/4th/pallettown.shtml"
      },
      {
        "label": "Bulbapedia HGSS location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Pallet_Town"
      },
      {
        "label": "Pinned HGSS map headers",
        "url": "https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/src/data/map_headers.h"
      }
    ],
    "mapIds": [
      "MAP_PALLET",
      "MAP_PALLET_TOWN_REDS_HOUSE_1F",
      "MAP_PALLET_TOWN_BLUES_HOUSE_1F",
      "MAP_PALLET_TOWN_OAKS_LAB",
      "MAP_PALLET_TOWN_REDS_HOUSE_2F",
      "MAP_PALLET_TOWN_BLUES_HOUSE_2F"
    ],
    "audit": {
      "scope": "primary geography; secondary verification tracked separately",
      "primaryRevision": "d2355244ac42b3c6e40d8c36aa3564ee8706dea4"
    }
  },
  {
    "name": "Viridian City",
    "type": "town",
    "region": "Kanto",
    "details": "Blue’s Gym; Trainer House",
    "landmarks": [
      "Blue’s Gym",
      "Trainer House"
    ],
    "access": [
      "Postgame Kanto access follows the first Pokémon League victory and S.S. Aqua voyage.",
      "Reference navigation remains available regardless of saved story progress."
    ],
    "connections": [
      "Route 1",
      "Route 2",
      "Route 22",
      "Trainer House"
    ],
    "sources": [
      {
        "label": "Serebii HGSS location reference",
        "url": "https://www.serebii.net/pokearth/kanto/4th/viridiancity.shtml"
      },
      {
        "label": "Bulbapedia HGSS location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Viridian_City"
      },
      {
        "label": "Pinned HGSS map headers",
        "url": "https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/src/data/map_headers.h"
      }
    ],
    "mapIds": [
      "MAP_VIRIDIAN",
      "MAP_VIRIDIAN_GYM",
      "MAP_VIRIDIAN_NORTHEAST_HOUSE",
      "MAP_VIRIDIAN_POKEMART",
      "MAP_VIRIDIAN_POKECENTER_1F",
      "MAP_VIRIDIAN_POKECENTER_B1F"
    ],
    "audit": {
      "scope": "primary geography; secondary verification tracked separately",
      "primaryRevision": "d2355244ac42b3c6e40d8c36aa3564ee8706dea4"
    }
  },
  {
    "name": "Pewter City",
    "type": "town",
    "region": "Kanto",
    "details": "Brock’s Gym; Museum of Science",
    "landmarks": [
      "Brock’s Gym",
      "Museum of Science"
    ],
    "access": [
      "Postgame Kanto access follows the first Pokémon League victory and S.S. Aqua voyage.",
      "Reference navigation remains available regardless of saved story progress."
    ],
    "connections": [
      "Route 2",
      "Route 3",
      "Pewter Museum of Science"
    ],
    "sources": [
      {
        "label": "Serebii HGSS location reference",
        "url": "https://www.serebii.net/pokearth/kanto/4th/pewtercity.shtml"
      },
      {
        "label": "Bulbapedia HGSS location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Pewter_City"
      },
      {
        "label": "Pinned HGSS map headers",
        "url": "https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/src/data/map_headers.h"
      }
    ],
    "mapIds": [
      "MAP_PEWTER",
      "MAP_PEWTER_NORTHEAST_HOUSE",
      "MAP_PEWTER_GYM",
      "MAP_PEWTER_POKEMART",
      "MAP_PEWTER_POKECENTER_1F",
      "MAP_PEWTER_POKECENTER_B1F",
      "MAP_PEWTER_SOUTHWEST_HOUSE"
    ],
    "audit": {
      "scope": "primary geography; secondary verification tracked separately",
      "primaryRevision": "d2355244ac42b3c6e40d8c36aa3564ee8706dea4"
    }
  },
  {
    "name": "Cerulean City",
    "type": "town",
    "region": "Kanto",
    "details": "Misty’s Gym; northern cape and Cerulean Cave approach",
    "landmarks": [
      "Misty’s Gym",
      "northern cape and Cerulean Cave approach"
    ],
    "access": [
      "Postgame Kanto access follows the first Pokémon League victory and S.S. Aqua voyage.",
      "Reference navigation remains available regardless of saved story progress.",
      "All sixteen Badges are required to enter Cerulean Cave."
    ],
    "connections": [
      "Route 4",
      "Route 24",
      "Route 9",
      "Route 5",
      "Cerulean Cave"
    ],
    "sources": [
      {
        "label": "Serebii HGSS location reference",
        "url": "https://www.serebii.net/pokearth/kanto/4th/ceruleancity.shtml"
      },
      {
        "label": "Bulbapedia HGSS location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Cerulean_City"
      },
      {
        "label": "Pinned HGSS map headers",
        "url": "https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/src/data/map_headers.h"
      }
    ],
    "mapIds": [
      "MAP_CERULEAN",
      "MAP_CERULEAN_POKEMART",
      "MAP_CERULEAN_GYM",
      "MAP_CERULEAN_POKECENTER_1F",
      "MAP_CERULEAN_NORTH_HOUSE",
      "MAP_CERULEAN_EAST_HOUSE",
      "MAP_CERULEAN_WEST_HOUSE",
      "MAP_CERULEAN_BIKE_MANIAC_HOUSE",
      "MAP_CERULEAN_POKECENTER_B1F"
    ],
    "audit": {
      "scope": "primary geography; secondary verification tracked separately",
      "primaryRevision": "d2355244ac42b3c6e40d8c36aa3564ee8706dea4"
    }
  },
  {
    "name": "Lavender Town",
    "type": "town",
    "region": "Kanto",
    "details": "Kanto Radio Tower; House of Memories",
    "landmarks": [
      "Kanto Radio Tower",
      "House of Memories"
    ],
    "access": [
      "Postgame Kanto access follows the first Pokémon League victory and S.S. Aqua voyage.",
      "Reference navigation remains available regardless of saved story progress.",
      "South Route 10: travel from the northern section requires passing through Rock Tunnel."
    ],
    "connections": [
      "Route 10",
      "Route 8",
      "Route 12",
      "Kanto Radio Tower"
    ],
    "sources": [
      {
        "label": "Serebii HGSS location reference",
        "url": "https://www.serebii.net/pokearth/kanto/4th/lavendertown.shtml"
      },
      {
        "label": "Bulbapedia HGSS location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Lavender_Town"
      },
      {
        "label": "Pinned HGSS map headers",
        "url": "https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/src/data/map_headers.h"
      }
    ],
    "mapIds": [
      "MAP_LAVENDER",
      "MAP_LAVENDER_POKEMART",
      "MAP_LAVENDER_POKECENTER_1F",
      "MAP_LAVENDER_VOLUNTEER_POKEMON_HOUSE",
      "MAP_LAVENDER_SOUTHWEST_HOUSE",
      "MAP_LAVENDER_NAME_RATER",
      "MAP_LAVENDER_HOUSE_OF_MEMORIES",
      "MAP_LAVENDER_POKECENTER_B1F"
    ],
    "audit": {
      "scope": "primary geography; secondary verification tracked separately",
      "primaryRevision": "d2355244ac42b3c6e40d8c36aa3564ee8706dea4"
    }
  },
  {
    "name": "Vermilion City",
    "type": "town",
    "region": "Kanto",
    "details": "Lt. Surge’s Gym; S.S. Aqua port and Pokémon Fan Club",
    "landmarks": [
      "Lt. Surge’s Gym",
      "S.S. Aqua port and Pokémon Fan Club"
    ],
    "access": [
      "Postgame Kanto access follows the first Pokémon League victory and S.S. Aqua voyage.",
      "Reference navigation remains available regardless of saved story progress.",
      "S.S. Ticket and scheduled sailing: Vermilion to Olivine on Wednesday and Sunday; first Kanto arrival follows the initial Olivine voyage."
    ],
    "connections": [
      "Route 6",
      "Route 11",
      "S.S. Aqua"
    ],
    "sources": [
      {
        "label": "Serebii HGSS location reference",
        "url": "https://www.serebii.net/pokearth/kanto/4th/vermilioncity.shtml"
      },
      {
        "label": "Bulbapedia HGSS location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Vermilion_City"
      },
      {
        "label": "Pinned HGSS map headers",
        "url": "https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/src/data/map_headers.h"
      }
    ],
    "mapIds": [
      "MAP_VERMILION",
      "MAP_VERMILION_POKECENTER_1F",
      "MAP_VERMILION_POKECENTER_B1F",
      "MAP_VERMILION_POKEMART",
      "MAP_VERMILION_FISHING_DUDE_HOUSE",
      "MAP_VERMILION_POKEMON_FAN_CLUB",
      "MAP_VERMILION_CENTRAL_HOUSE",
      "MAP_VERMILION_SOUTH_HOUSE",
      "MAP_VERMILION_GYM",
      "MAP_SS_AQUA_VERMILION_PORT_INTERIOR",
      "MAP_SS_AQUA_VERMILION_PORT_EXTERIOR"
    ],
    "audit": {
      "scope": "primary geography; secondary verification tracked separately",
      "primaryRevision": "d2355244ac42b3c6e40d8c36aa3564ee8706dea4"
    }
  },
  {
    "name": "Celadon City",
    "type": "town",
    "region": "Kanto",
    "details": "Erika’s Gym; Department Store and Game Corner",
    "landmarks": [
      "Erika’s Gym",
      "Department Store and Game Corner"
    ],
    "access": [
      "Postgame Kanto access follows the first Pokémon League victory and S.S. Aqua voyage.",
      "Reference navigation remains available regardless of saved story progress.",
      "A Bicycle is required for Cycling Road; Cut opens the northern Route 16 detour."
    ],
    "connections": [
      "Route 7",
      "Route 16",
      "Celadon Department Store",
      "Celadon Game Corner"
    ],
    "sources": [
      {
        "label": "Serebii HGSS location reference",
        "url": "https://www.serebii.net/pokearth/kanto/4th/celadoncity.shtml"
      },
      {
        "label": "Bulbapedia HGSS location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Celadon_City"
      },
      {
        "label": "Pinned HGSS map headers",
        "url": "https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/src/data/map_headers.h"
      }
    ],
    "mapIds": [
      "MAP_CELADON",
      "MAP_CELADON_CONDOMINIUMS_1F",
      "MAP_CELADON_CONDOMINIUMS_2F",
      "MAP_CELADON_CONDOMINIUMS_3F",
      "MAP_CELADON_CONDOMINIUMS_ROOF",
      "MAP_CELADON_CONDOMINIUMS_ROOF_ROOM",
      "MAP_CELADON_RESTAURANT",
      "MAP_CELADON_POKECENTER_1F",
      "MAP_CELADON_POKECENTER_B1F",
      "MAP_CELADON_GYM",
      "MAP_CELADON_CONDOMINIUMS_LEFT_ELEVATOR",
      "MAP_CELADON_CONDOMINIUMS_RIGHT_ELEVATOR"
    ],
    "audit": {
      "scope": "primary geography; secondary verification tracked separately",
      "primaryRevision": "d2355244ac42b3c6e40d8c36aa3564ee8706dea4"
    }
  },
  {
    "name": "Fuchsia City",
    "type": "town",
    "region": "Kanto",
    "details": "Janine’s Gym; Pal Park",
    "landmarks": [
      "Janine’s Gym",
      "Pal Park"
    ],
    "access": [
      "Postgame Kanto access follows the first Pokémon League victory and S.S. Aqua voyage.",
      "Reference navigation remains available regardless of saved story progress.",
      "A Bicycle is required for Cycling Road; Cut opens the northern Route 16 detour.",
      "The southern construction barrier opens after approaching from Route 20 and earning Blaine’s Volcano Badge."
    ],
    "connections": [
      "Route 15",
      "Route 18",
      "Route 19",
      "Pal Park"
    ],
    "sources": [
      {
        "label": "Serebii HGSS location reference",
        "url": "https://www.serebii.net/pokearth/kanto/4th/fuchsiacity.shtml"
      },
      {
        "label": "Bulbapedia HGSS location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Fuchsia_City"
      },
      {
        "label": "Pinned HGSS map headers",
        "url": "https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/src/data/map_headers.h"
      }
    ],
    "mapIds": [
      "MAP_FUCHSIA",
      "MAP_FUCHSIA_POKEMART",
      "MAP_FUCHSIA_GYM",
      "MAP_FUCHSIA_SOUTHWEST_HOUSE",
      "MAP_FUCHSIA_POKECENTER_1F",
      "MAP_FUCHSIA_SAFARI_ZONE_WARDEN_HOUSE",
      "MAP_FUCHSIA_POKECENTER_B1F"
    ],
    "audit": {
      "scope": "primary geography; secondary verification tracked separately",
      "primaryRevision": "d2355244ac42b3c6e40d8c36aa3564ee8706dea4"
    }
  },
  {
    "name": "Cinnabar Island",
    "type": "town",
    "region": "Kanto",
    "details": "Volcanic ruins; Blue directs challengers to Viridian after the other seven Kanto Badges",
    "landmarks": [
      "Volcanic ruins",
      "Blue directs challengers to Viridian after the other seven Kanto Badges"
    ],
    "access": [
      "Postgame Kanto access follows the first Pokémon League victory and S.S. Aqua voyage.",
      "Reference navigation remains available regardless of saved story progress."
    ],
    "connections": [
      "Route 20",
      "Route 21"
    ],
    "sources": [
      {
        "label": "Serebii HGSS location reference",
        "url": "https://www.serebii.net/pokearth/kanto/4th/cinnabarisland.shtml"
      },
      {
        "label": "Bulbapedia HGSS location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Cinnabar_Island"
      },
      {
        "label": "Pinned HGSS map headers",
        "url": "https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/src/data/map_headers.h"
      }
    ],
    "mapIds": [
      "MAP_CINNABAR_ISLAND",
      "MAP_CINNABAR_ISLAND_POKECENTER_1F",
      "MAP_CINNABAR_ISLAND_POKECENTER_B1F"
    ],
    "audit": {
      "scope": "primary geography; secondary verification tracked separately",
      "primaryRevision": "d2355244ac42b3c6e40d8c36aa3564ee8706dea4"
    }
  },
  {
    "name": "Saffron City",
    "type": "town",
    "region": "Kanto",
    "details": "Sabrina’s Gym; Silph Co., Fighting Dojo and Magnet Train",
    "landmarks": [
      "Sabrina’s Gym",
      "Silph Co., Fighting Dojo and Magnet Train"
    ],
    "access": [
      "Postgame Kanto access follows the first Pokémon League victory and S.S. Aqua voyage.",
      "Reference navigation remains available regardless of saved story progress.",
      "Train travel requires restored Power Plant electricity and Copycat’s Pass; entering the station does not."
    ],
    "connections": [
      "Route 5",
      "Route 6",
      "Route 7",
      "Route 8",
      "Saffron Magnet Train Station",
      "Fighting Dojo",
      "Silph Co."
    ],
    "sources": [
      {
        "label": "Serebii HGSS location reference",
        "url": "https://www.serebii.net/pokearth/kanto/4th/saffroncity.shtml"
      },
      {
        "label": "Bulbapedia HGSS location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Saffron_City"
      },
      {
        "label": "Pinned HGSS map headers",
        "url": "https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/src/data/map_headers.h"
      }
    ],
    "mapIds": [
      "MAP_SAFFRON",
      "MAP_SAFFRON_MR_PSYCHIC_HOUSE",
      "MAP_SAFFRON_COPYCAT_HOUSE_1F",
      "MAP_SAFFRON_COPYCAT_HOUSE_2F",
      "MAP_SAFFRON_POKECENTER_1F",
      "MAP_SAFFRON_POKECENTER_2F",
      "MAP_SAFFRON_POKEMART",
      "MAP_SAFFRON_GYM"
    ],
    "audit": {
      "scope": "primary geography; secondary verification tracked separately",
      "primaryRevision": "d2355244ac42b3c6e40d8c36aa3564ee8706dea4"
    }
  },
  {
    "name": "Diglett’s Cave",
    "type": "landmark",
    "region": "Kanto",
    "details": "Underground passage between Route 2 and Route 11; Snorlax blocks the eastern entrance until the radio event",
    "landmarks": [
      "Underground passage between Route 2 and Route 11",
      "Snorlax blocks the eastern entrance until the radio event"
    ],
    "access": [
      "Postgame Kanto access follows the first Pokémon League victory and S.S. Aqua voyage.",
      "Reference navigation remains available regardless of saved story progress.",
      "Restore power, receive the EXPN Card in Lavender, then play the Poké Flute channel beside Snorlax on Route 11."
    ],
    "connections": [
      "Route 11",
      "Route 2"
    ],
    "sources": [
      {
        "label": "Serebii HGSS location reference",
        "url": "https://www.serebii.net/pokearth/kanto/4th/diglett%27scave.shtml"
      },
      {
        "label": "Bulbapedia HGSS location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Diglett%27s_Cave"
      },
      {
        "label": "Pinned HGSS map headers",
        "url": "https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/src/data/map_headers.h"
      }
    ],
    "mapIds": [
      "MAP_DIGLETT_CAVE"
    ],
    "audit": {
      "scope": "primary geography; secondary verification tracked separately",
      "primaryRevision": "d2355244ac42b3c6e40d8c36aa3564ee8706dea4"
    }
  },
  {
    "name": "Mt. Moon",
    "type": "landmark",
    "region": "Kanto",
    "details": "Cave between Routes 3 and 4; access to Mt. Moon Square",
    "landmarks": [
      "Cave between Routes 3 and 4",
      "access to Mt. Moon Square"
    ],
    "access": [
      "Postgame Kanto access follows the first Pokémon League victory and S.S. Aqua voyage.",
      "Reference navigation remains available regardless of saved story progress."
    ],
    "connections": [
      "Route 3",
      "Route 4",
      "Mt. Moon Square"
    ],
    "sources": [
      {
        "label": "Serebii HGSS location reference",
        "url": "https://www.serebii.net/pokearth/kanto/4th/mt.moon.shtml"
      },
      {
        "label": "Bulbapedia HGSS location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Mt._Moon"
      },
      {
        "label": "Pinned HGSS map headers",
        "url": "https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/src/data/map_headers.h"
      }
    ],
    "mapIds": [
      "MAP_MOUNT_MOON"
    ],
    "audit": {
      "scope": "primary geography; secondary verification tracked separately",
      "primaryRevision": "d2355244ac42b3c6e40d8c36aa3564ee8706dea4"
    }
  },
  {
    "name": "Rock Tunnel",
    "type": "landmark",
    "region": "Kanto",
    "details": "1F and B1F passage; links the north and south portions of Route 10",
    "landmarks": [
      "1F and B1F passage",
      "links the north and south portions of Route 10"
    ],
    "access": [
      "Postgame Kanto access follows the first Pokémon League victory and S.S. Aqua voyage.",
      "Reference navigation remains available regardless of saved story progress."
    ],
    "connections": [
      "Route 10"
    ],
    "sources": [
      {
        "label": "Serebii HGSS location reference",
        "url": "https://www.serebii.net/pokearth/kanto/4th/rocktunnel.shtml"
      },
      {
        "label": "Bulbapedia HGSS location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Rock_Tunnel"
      },
      {
        "label": "Pinned HGSS map headers",
        "url": "https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/src/data/map_headers.h"
      }
    ],
    "mapIds": [
      "MAP_ROCK_TUNNEL_1F",
      "MAP_ROCK_TUNNEL_B1F"
    ],
    "audit": {
      "scope": "primary geography; secondary verification tracked separately",
      "primaryRevision": "d2355244ac42b3c6e40d8c36aa3564ee8706dea4"
    }
  },
  {
    "name": "Seafoam Islands",
    "type": "landmark",
    "region": "Kanto",
    "details": "Five cave floors and Articuno; Blaine’s relocated Cinnabar Gym",
    "landmarks": [
      "Five cave floors and Articuno",
      "Blaine’s relocated Cinnabar Gym"
    ],
    "access": [
      "Postgame Kanto access follows the first Pokémon League victory and S.S. Aqua voyage.",
      "Reference navigation remains available regardless of saved story progress.",
      "Blaine’s Gym is reached upstairs; Articuno is on B4F."
    ],
    "connections": [
      "Route 20"
    ],
    "sources": [
      {
        "label": "Serebii HGSS location reference",
        "url": "https://www.serebii.net/pokearth/kanto/4th/seafoamislands.shtml"
      },
      {
        "label": "Bulbapedia HGSS location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Seafoam_Islands"
      },
      {
        "label": "Pinned HGSS map headers",
        "url": "https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/src/data/map_headers.h"
      }
    ],
    "mapIds": [
      "MAP_SEAFOAM_ISLANDS_1F",
      "MAP_SEAFOAM_ISLANDS_B1F",
      "MAP_SEAFOAM_ISLANDS_B2F",
      "MAP_SEAFOAM_ISLANDS_B3F",
      "MAP_SEAFOAM_ISLANDS_B4F",
      "MAP_SEAFOAM_ISLANDS_CINNABAR_GYM"
    ],
    "audit": {
      "scope": "primary geography; secondary verification tracked separately",
      "primaryRevision": "d2355244ac42b3c6e40d8c36aa3564ee8706dea4"
    }
  },
  {
    "name": "Cerulean Cave",
    "type": "landmark",
    "region": "Kanto",
    "details": "1F, 2F and B1F; Mewtwo after all sixteen Badges",
    "landmarks": [
      "1F, 2F and B1F",
      "Mewtwo after all sixteen Badges"
    ],
    "access": [
      "Postgame Kanto access follows the first Pokémon League victory and S.S. Aqua voyage.",
      "Reference navigation remains available regardless of saved story progress.",
      "All sixteen Badges are required to enter Cerulean Cave."
    ],
    "connections": [
      "Cerulean City"
    ],
    "sources": [
      {
        "label": "Serebii HGSS location reference",
        "url": "https://www.serebii.net/pokearth/kanto/4th/ceruleancave.shtml"
      },
      {
        "label": "Bulbapedia HGSS location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Cerulean_Cave"
      },
      {
        "label": "Pinned HGSS map headers",
        "url": "https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/src/data/map_headers.h"
      }
    ],
    "mapIds": [
      "MAP_CERULEAN_CAVE_1F",
      "MAP_CERULEAN_CAVE_2F",
      "MAP_CERULEAN_CAVE_B1F"
    ],
    "audit": {
      "scope": "primary geography; secondary verification tracked separately",
      "primaryRevision": "d2355244ac42b3c6e40d8c36aa3564ee8706dea4"
    }
  },
  {
    "name": "Viridian Forest",
    "type": "landmark",
    "region": "Kanto",
    "details": "Forest passage on Route 2; Headbutt and walking encounters",
    "landmarks": [
      "Forest passage on Route 2",
      "Headbutt and walking encounters"
    ],
    "access": [
      "Postgame Kanto access follows the first Pokémon League victory and S.S. Aqua voyage.",
      "Reference navigation remains available regardless of saved story progress."
    ],
    "connections": [
      "Route 2"
    ],
    "sources": [
      {
        "label": "Serebii HGSS location reference",
        "url": "https://www.serebii.net/pokearth/kanto/4th/viridianforest.shtml"
      },
      {
        "label": "Bulbapedia HGSS location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Viridian_Forest"
      },
      {
        "label": "Pinned HGSS map headers",
        "url": "https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/src/data/map_headers.h"
      }
    ],
    "mapIds": [
      "MAP_VIRIDIAN_FOREST"
    ],
    "audit": {
      "scope": "primary geography; secondary verification tracked separately",
      "primaryRevision": "d2355244ac42b3c6e40d8c36aa3564ee8706dea4"
    }
  },
  {
    "name": "Pal Park",
    "type": "facility",
    "region": "Kanto",
    "details": "Generation III migration facility north of Fuchsia; transferred Pokémon are not fixed wild encounters",
    "landmarks": [
      "Generation III migration facility north of Fuchsia",
      "transferred Pokémon are not fixed wild encounters"
    ],
    "access": [
      "Postgame Kanto access follows the first Pokémon League victory and S.S. Aqua voyage.",
      "Reference navigation remains available regardless of saved story progress."
    ],
    "connections": [
      "Fuchsia City"
    ],
    "sources": [
      {
        "label": "Serebii HGSS location reference",
        "url": "https://www.serebii.net/pokearth/kanto/4th/fuchsiacity.shtml"
      },
      {
        "label": "Bulbapedia HGSS location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Pal_Park"
      },
      {
        "label": "Pinned HGSS map headers",
        "url": "https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/src/data/map_headers.h"
      }
    ],
    "mapIds": [
      "MAP_PAL_PARK",
      "MAP_FUCHSIA_PAL_PARK_ENTRANCE"
    ],
    "audit": {
      "scope": "primary geography; secondary verification tracked separately",
      "primaryRevision": "d2355244ac42b3c6e40d8c36aa3564ee8706dea4"
    }
  },
  {
    "name": "Power Plant",
    "type": "facility",
    "region": "Kanto",
    "details": "Broken and repaired story variants; restore the stolen Machine Part",
    "landmarks": [
      "Broken and repaired story variants",
      "restore the stolen Machine Part"
    ],
    "access": [
      "Postgame Kanto access follows the first Pokémon League victory and S.S. Aqua voyage.",
      "Reference navigation remains available regardless of saved story progress."
    ],
    "connections": [
      "Route 10"
    ],
    "sources": [
      {
        "label": "Serebii HGSS location reference",
        "url": "https://www.serebii.net/pokearth/kanto/4th/powerplant.shtml"
      },
      {
        "label": "Bulbapedia HGSS location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Kanto_Power_Plant"
      },
      {
        "label": "Pinned HGSS map headers",
        "url": "https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/src/data/map_headers.h"
      }
    ],
    "mapIds": [
      "MAP_ROUTE_10_POWER_PLANT_REPAIRED",
      "MAP_ROUTE_10_POWER_PLANT_BROKEN"
    ],
    "audit": {
      "scope": "primary geography; secondary verification tracked separately",
      "primaryRevision": "d2355244ac42b3c6e40d8c36aa3564ee8706dea4"
    }
  },
  {
    "name": "Mt. Moon Square",
    "type": "landmark",
    "region": "Kanto",
    "details": "Monday-night Clefairy dance; shop and Moon Stone event",
    "landmarks": [
      "Monday-night Clefairy dance",
      "shop and Moon Stone event"
    ],
    "access": [
      "Postgame Kanto access follows the first Pokémon League victory and S.S. Aqua voyage.",
      "Reference navigation remains available regardless of saved story progress."
    ],
    "connections": [
      "Mt. Moon"
    ],
    "sources": [
      {
        "label": "Serebii HGSS location reference",
        "url": "https://www.serebii.net/pokearth/kanto/4th/mt.moon.shtml"
      },
      {
        "label": "Bulbapedia HGSS location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Mt._Moon"
      },
      {
        "label": "Pinned HGSS map headers",
        "url": "https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/src/data/map_headers.h"
      }
    ],
    "mapIds": [
      "MAP_MOUNT_MOON_SQUARE_ENTRANCE",
      "MAP_MOUNT_MOON_SQUARE",
      "MAP_MOUNT_MOON_SQUARE_CLEFAIRY_EVENT",
      "MAP_MOUNT_MOON_SQUARE_SHOP"
    ],
    "audit": {
      "scope": "primary geography; secondary verification tracked separately",
      "primaryRevision": "d2355244ac42b3c6e40d8c36aa3564ee8706dea4"
    }
  },
  {
    "name": "Underground Path",
    "type": "facility",
    "region": "Kanto",
    "details": "Passage between Routes 5 and 6; reopens after power is restored",
    "landmarks": [
      "Passage between Routes 5 and 6",
      "reopens after power is restored"
    ],
    "access": [
      "Postgame Kanto access follows the first Pokémon League victory and S.S. Aqua voyage.",
      "Reference navigation remains available regardless of saved story progress.",
      "The Underground Path reopens after power is restored.",
      "Restore power to reopen the Underground Path."
    ],
    "connections": [
      "Route 5",
      "Route 6"
    ],
    "sources": [
      {
        "label": "Serebii HGSS location reference",
        "url": "https://www.serebii.net/pokearth/kanto/4th/undergroundpath5-6.shtml"
      },
      {
        "label": "Bulbapedia HGSS location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Underground_Path"
      },
      {
        "label": "Pinned HGSS map headers",
        "url": "https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/src/data/map_headers.h"
      }
    ],
    "mapIds": [
      "MAP_ROUTE_5_UNDERGROUND_PATH"
    ],
    "audit": {
      "scope": "primary geography; secondary verification tracked separately",
      "primaryRevision": "d2355244ac42b3c6e40d8c36aa3564ee8706dea4"
    }
  },
  {
    "name": "Kanto Radio Tower",
    "type": "facility",
    "region": "Kanto",
    "details": "EXPN Card after restoring the Power Plant; not the Goldenrod Radio Tower",
    "landmarks": [
      "EXPN Card after restoring the Power Plant",
      "not the Goldenrod Radio Tower"
    ],
    "access": [
      "Postgame Kanto access follows the first Pokémon League victory and S.S. Aqua voyage.",
      "Reference navigation remains available regardless of saved story progress."
    ],
    "connections": [
      "Lavender Town"
    ],
    "sources": [
      {
        "label": "Serebii HGSS location reference",
        "url": "https://www.serebii.net/pokearth/kanto/4th/lavendertown.shtml"
      },
      {
        "label": "Bulbapedia HGSS location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Lavender_Radio_Tower"
      },
      {
        "label": "Pinned HGSS map headers",
        "url": "https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/src/data/map_headers.h"
      }
    ],
    "mapIds": [
      "MAP_LAVENDER_RADIO_STATION"
    ],
    "audit": {
      "scope": "primary geography; secondary verification tracked separately",
      "primaryRevision": "d2355244ac42b3c6e40d8c36aa3564ee8706dea4"
    }
  },
  {
    "name": "Saffron Magnet Train Station",
    "type": "facility",
    "region": "Kanto",
    "details": "Train to Goldenrod; restored power and Copycat’s Pass required",
    "landmarks": [
      "Train to Goldenrod",
      "restored power and Copycat’s Pass required"
    ],
    "access": [
      "Postgame Kanto access follows the first Pokémon League victory and S.S. Aqua voyage.",
      "Reference navigation remains available regardless of saved story progress.",
      "Train travel requires restored Power Plant electricity and Copycat’s Pass; entering the station does not."
    ],
    "connections": [
      "Magnet Train Station",
      "Saffron City"
    ],
    "sources": [
      {
        "label": "Serebii HGSS location reference",
        "url": "https://www.serebii.net/pokearth/kanto/4th/saffroncity.shtml"
      },
      {
        "label": "Bulbapedia HGSS location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Magnet_Train"
      },
      {
        "label": "Pinned HGSS map headers",
        "url": "https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/src/data/map_headers.h"
      }
    ],
    "mapIds": [
      "MAP_SAFFRON_MAGNET_TRAIN_STATION_1F",
      "MAP_SAFFRON_MAGNET_TRAIN_STATION_2F",
      "MAP_SAFFRON_MAGNET_TRAIN_STATION_2F_EMPTY"
    ],
    "audit": {
      "scope": "primary geography; secondary verification tracked separately",
      "primaryRevision": "d2355244ac42b3c6e40d8c36aa3564ee8706dea4"
    }
  },
  {
    "name": "Fighting Dojo",
    "type": "facility",
    "region": "Kanto",
    "details": "Gym Leader rematches; scheduled opponents require their telephone registrations",
    "landmarks": [
      "Gym Leader rematches",
      "scheduled opponents require their telephone registrations"
    ],
    "access": [
      "Postgame Kanto access follows the first Pokémon League victory and S.S. Aqua voyage.",
      "Reference navigation remains available regardless of saved story progress."
    ],
    "connections": [
      "Saffron City"
    ],
    "sources": [
      {
        "label": "Serebii HGSS location reference",
        "url": "https://www.serebii.net/pokearth/kanto/4th/saffroncity.shtml"
      },
      {
        "label": "Bulbapedia HGSS location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Fighting_Dojo"
      },
      {
        "label": "Pinned HGSS map headers",
        "url": "https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/src/data/map_headers.h"
      }
    ],
    "mapIds": [
      "MAP_SAFFRON_FIGHTING_DOJO"
    ],
    "audit": {
      "scope": "primary geography; secondary verification tracked separately",
      "primaryRevision": "d2355244ac42b3c6e40d8c36aa3564ee8706dea4"
    }
  },
  {
    "name": "Silph Co.",
    "type": "facility",
    "region": "Kanto",
    "details": "Steven’s Hoenn starter gift; Rotom room requires an eligible Rotom",
    "landmarks": [
      "Steven’s Hoenn starter gift",
      "Rotom room requires an eligible Rotom"
    ],
    "access": [
      "Postgame Kanto access follows the first Pokémon League victory and S.S. Aqua voyage.",
      "Reference navigation remains available regardless of saved story progress."
    ],
    "connections": [
      "Saffron City"
    ],
    "sources": [
      {
        "label": "Serebii HGSS location reference",
        "url": "https://www.serebii.net/pokearth/kanto/4th/saffroncity.shtml"
      },
      {
        "label": "Bulbapedia HGSS location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Silph_Co."
      },
      {
        "label": "Pinned HGSS map headers",
        "url": "https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/src/data/map_headers.h"
      }
    ],
    "mapIds": [
      "MAP_SAFFRON_SILPH_CO_HQ",
      "MAP_SAFFRON_SILPH_CO_ROTOM_ROOM",
      "MAP_SAFFRON_SILPH_CO_ELEVATOR"
    ],
    "audit": {
      "scope": "primary geography; secondary verification tracked separately",
      "primaryRevision": "d2355244ac42b3c6e40d8c36aa3564ee8706dea4"
    }
  },
  {
    "name": "Celadon Department Store",
    "type": "facility",
    "region": "Kanto",
    "details": "Multi-floor shops; rooftop and elevator",
    "landmarks": [
      "Multi-floor shops",
      "rooftop and elevator"
    ],
    "access": [
      "Postgame Kanto access follows the first Pokémon League victory and S.S. Aqua voyage.",
      "Reference navigation remains available regardless of saved story progress."
    ],
    "connections": [
      "Celadon City"
    ],
    "sources": [
      {
        "label": "Serebii HGSS location reference",
        "url": "https://www.serebii.net/pokearth/kanto/4th/celadoncity.shtml"
      },
      {
        "label": "Bulbapedia HGSS location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Celadon_Department_Store"
      },
      {
        "label": "Pinned HGSS map headers",
        "url": "https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/src/data/map_headers.h"
      }
    ],
    "mapIds": [
      "MAP_CELADON_DEPARTMENT_STORE_1F",
      "MAP_CELADON_DEPARTMENT_STORE_2F",
      "MAP_CELADON_DEPARTMENT_STORE_3F",
      "MAP_CELADON_DEPARTMENT_STORE_4F",
      "MAP_CELADON_DEPARTMENT_STORE_5F",
      "MAP_CELADON_DEPARTMENT_STORE_ROOF",
      "MAP_CELADON_DEPARTMENT_STORE_ELEVATOR"
    ],
    "audit": {
      "scope": "primary geography; secondary verification tracked separately",
      "primaryRevision": "d2355244ac42b3c6e40d8c36aa3564ee8706dea4"
    }
  },
  {
    "name": "Celadon Game Corner",
    "type": "facility",
    "region": "Kanto",
    "details": "Voltorb Flip in international HGSS; Japanese slots room is a regional variant",
    "landmarks": [
      "Voltorb Flip in international HGSS",
      "Japanese slots room is a regional variant"
    ],
    "access": [
      "Postgame Kanto access follows the first Pokémon League victory and S.S. Aqua voyage.",
      "Reference navigation remains available regardless of saved story progress."
    ],
    "connections": [
      "Celadon City"
    ],
    "sources": [
      {
        "label": "Serebii HGSS location reference",
        "url": "https://www.serebii.net/pokearth/kanto/4th/celadoncity.shtml"
      },
      {
        "label": "Bulbapedia HGSS location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Celadon_Game_Corner"
      },
      {
        "label": "Pinned HGSS map headers",
        "url": "https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/src/data/map_headers.h"
      }
    ],
    "mapIds": [
      "MAP_CELADON_GAME_CORNER_JP",
      "MAP_CELADON_PRIZE_CORNER",
      "MAP_CELADON_GAME_CORNER"
    ],
    "audit": {
      "scope": "primary geography; secondary verification tracked separately",
      "primaryRevision": "d2355244ac42b3c6e40d8c36aa3564ee8706dea4"
    }
  },
  {
    "name": "Trainer House",
    "type": "facility",
    "region": "Kanto",
    "details": "Battle facility; linked trainer and daily battle conditions",
    "landmarks": [
      "Battle facility",
      "linked trainer and daily battle conditions"
    ],
    "access": [
      "Postgame Kanto access follows the first Pokémon League victory and S.S. Aqua voyage.",
      "Reference navigation remains available regardless of saved story progress."
    ],
    "connections": [
      "Viridian City"
    ],
    "sources": [
      {
        "label": "Serebii HGSS location reference",
        "url": "https://www.serebii.net/pokearth/kanto/4th/viridiancity.shtml"
      },
      {
        "label": "Bulbapedia HGSS location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Trainer_House"
      },
      {
        "label": "Pinned HGSS map headers",
        "url": "https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/src/data/map_headers.h"
      }
    ],
    "mapIds": [
      "MAP_VIRIDIAN_TRAINER_HOUSE_1F",
      "MAP_VIRIDIAN_TRAINER_HOUSE_B1F"
    ],
    "audit": {
      "scope": "primary geography; secondary verification tracked separately",
      "primaryRevision": "d2355244ac42b3c6e40d8c36aa3564ee8706dea4"
    }
  },
  {
    "name": "Pewter Museum of Science",
    "type": "facility",
    "region": "Kanto",
    "details": "Fossil restoration; museum exhibits",
    "landmarks": [
      "Fossil restoration",
      "museum exhibits"
    ],
    "access": [
      "Postgame Kanto access follows the first Pokémon League victory and S.S. Aqua voyage.",
      "Reference navigation remains available regardless of saved story progress."
    ],
    "connections": [
      "Pewter City"
    ],
    "sources": [
      {
        "label": "Serebii HGSS location reference",
        "url": "https://www.serebii.net/pokearth/kanto/4th/pewtercity.shtml"
      },
      {
        "label": "Bulbapedia HGSS location reference",
        "url": "https://bulbapedia.bulbagarden.net/wiki/Pewter_Museum_of_Science"
      },
      {
        "label": "Pinned HGSS map headers",
        "url": "https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/src/data/map_headers.h"
      }
    ],
    "mapIds": [
      "MAP_PEWTER_MUSEUM_OF_SCIENCE"
    ],
    "audit": {
      "scope": "primary geography; secondary verification tracked separately",
      "primaryRevision": "d2355244ac42b3c6e40d8c36aa3564ee8706dea4"
    }
  }
]);
