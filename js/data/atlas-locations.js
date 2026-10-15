// Johto location groups and the League/Mt. Silver approaches.
// Sources pinned to pret/pokeheartgold e3f671ad1d060140c587f925f4ab8ec3596f62b9.
// Encounter tables remain in world.js; this module contains static information only.
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
    ]
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
      "Surf opens the offshore part of the coast"
    ],
    "connections": [
      "Route 29",
      "Route 30"
    ],
    "sources": [
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
    ]
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
      "Sprout Tower is reached from within the city"
    ],
    "connections": [
      "Route 31",
      "Route 32",
      "Route 36",
      "Sprout Tower"
    ],
    "sources": [
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
    ]
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
      "Resolve the Slowpoke Well incident before challenging the Gym and continuing the story west"
    ],
    "connections": [
      "Route 33",
      "Ilex Forest",
      "Slowpoke Well"
    ],
    "sources": [
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
    ]
  },
  {
    "name": "Goldenrod City",
    "type": "town",
    "region": "Johto",
    "details": "Large city with the Goldenrod Gym, Department Store, and Radio Tower.",
    "landmarks": [
      "Whitney's Normal-type Gym, Department Store, Radio Tower, and Underground",
      "Bike Shop, Flower Shop, Game Corner, Global Terminal, and Magnet Train station"
    ],
    "access": [
      "Route 34 is south and Route 35 is north",
      "Train travel is a separate service requiring the restored service and a Pass"
    ],
    "connections": [
      "Route 34",
      "Route 35",
      "Goldenrod Department Store",
      "Goldenrod Radio Tower",
      "Goldenrod Underground",
      "Magnet Train Station"
    ],
    "sources": [
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
    ]
  },
  {
    "name": "Ecruteak City",
    "type": "town",
    "region": "Johto",
    "details": "Home of the Ecruteak Gym and the towers tied to Johto's legends.",
    "landmarks": [
      "Morty's Ghost-type Gym, Burned Tower, and Dance Theater",
      "Barrier Station leads toward Bellchime Trail and Bell Tower"
    ],
    "access": [
      "Routes 37, 38, and 42 lead south, west, and east",
      "The Barrier Station checks the Fog Badge before letting the player toward the tower"
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
    ]
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
    ]
  },
  {
    "name": "Cianwood City",
    "type": "town",
    "region": "Johto",
    "details": "Coastal town reached by crossing the sea west of Olivine.",
    "landmarks": [
      "Chuck's Fighting-type Gym, the pharmacy, and Cameron's house",
      "Chuck's wife gives HM02 Fly after the Gym victory"
    ],
    "access": [
      "Cross Route 41 using Surf",
      "Cliff Edge Gate is the entrance to the Route 47 corridor"
    ],
    "connections": [
      "Route 41",
      "Cliff Edge Gate"
    ],
    "sources": [
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
    ]
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
      "Story progress controls Gym access and the eastern road, not merely buying a RageCandyBar"
    ],
    "connections": [
      "Route 42",
      "Route 43",
      "Route 44",
      "Team Rocket HQ"
    ],
    "sources": [
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
    ]
  },
  {
    "name": "Blackthorn City",
    "type": "town",
    "region": "Johto",
    "details": "Northern Johto city with the Blackthorn Gym and Dragon's Den.",
    "landmarks": [
      "Clair's Dragon-type Gym and Dragon's Den",
      "Move Deleter and Move Reminder share a house"
    ],
    "access": [
      "Ice Path is the approach from Route 44",
      "Route 45 descends south, while the Den entrance is behind the Gym"
    ],
    "connections": [
      "Route 45",
      "Ice Path",
      "Dragon's Den"
    ],
    "sources": [
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
    ]
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
      "Ledges affect which paths can be taken in each direction"
    ],
    "connections": [
      "New Bark Town",
      "Cherrygrove City",
      "Route 46"
    ],
    "sources": [
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
    ]
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
      "There is no Ruins of Alph entrance on this route"
    ],
    "connections": [
      "Cherrygrove City",
      "Route 31"
    ],
    "sources": [
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
    ]
  },
  {
    "name": "Route 31",
    "type": "route",
    "region": "Johto",
    "details": "Connects Route 30 with Violet City.",
    "landmarks": [
      "Western entrance to Dark Cave",
      "Gatehouse leading into Violet City"
    ],
    "access": [
      "Continue from Route 30 to Violet",
      "Dark Cave is a separate optional branch rather than the required route through to the city"
    ],
    "connections": [
      "Violet City",
      "Route 30",
      "Dark Cave"
    ],
    "sources": [
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
    ]
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
      "Union Cave is the onward route to Route 33 and Azalea"
    ],
    "connections": [
      "Violet City",
      "Union Cave",
      "Ruins of Alph"
    ],
    "sources": [
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
    ]
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
    ]
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
    ]
  },
  {
    "name": "Route 35",
    "type": "route",
    "region": "Johto",
    "details": "North of Goldenrod City, leading toward the National Park area.",
    "landmarks": [
      "Gatehouse shared with National Park and Pokéathlon Dome",
      "Grass and a pond beside the main path"
    ],
    "access": [
      "Goldenrod is reached through the southern gate",
      "The northern gate branches toward the park and the Dome"
    ],
    "connections": [
      "Goldenrod City",
      "National Park",
      "Pokéathlon Dome"
    ],
    "sources": [
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
    ]
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
      "Route 37 continues north toward Ecruteak"
    ],
    "connections": [
      "Violet City",
      "National Park",
      "Route 37",
      "Ruins of Alph"
    ],
    "sources": [
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
    ]
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
      "The Route 36 Sudowoodo event controls the earlier through-route"
    ],
    "connections": [
      "Ecruteak City",
      "Route 36"
    ],
    "sources": [
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
    ]
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
      "Olivine is reached by continuing south along Route 39"
    ],
    "connections": [
      "Ecruteak City",
      "Route 39"
    ],
    "sources": [
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
    ]
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
      "Route 38 is north and Olivine is south",
      "The farm is a side visit, not a passage to a different route"
    ],
    "connections": [
      "Olivine City",
      "Route 38",
      "MooMoo Farm"
    ],
    "sources": [
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
    ]
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
      "The western gate leads through Frontier Access, not straight into a battle facility"
    ],
    "connections": [
      "Olivine City",
      "Route 41",
      "Frontier Access"
    ],
    "sources": [
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
    ]
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
    ]
  },
  {
    "name": "Route 42",
    "type": "route",
    "region": "Johto",
    "details": "Connects Ecruteak City, Mt. Mortar, and the Mahogany area.",
    "landmarks": [
      "Three entrances to the Mt. Mortar cave system",
      "Water and an Apricorn grove along the road"
    ],
    "access": [
      "Connects Ecruteak and Mahogany",
      "Surf permits the water crossing, while Mt. Mortar provides a cave branch"
    ],
    "connections": [
      "Ecruteak City",
      "Mahogany Town",
      "Mt. Mortar"
    ],
    "sources": [
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
    ]
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
      "The grass route provides an alternative to the toll gate",
      "Continue north to reach the lake"
    ],
    "connections": [
      "Mahogany Town",
      "Lake of Rage"
    ],
    "sources": [
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
    ]
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
      "Mahogany's eastern road is story-gated",
      "Enter Ice Path to continue to Blackthorn"
    ],
    "connections": [
      "Mahogany Town",
      "Ice Path"
    ],
    "sources": [
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
    ]
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
      "Continue toward Route 46 and the early Johto routes"
    ],
    "connections": [
      "Blackthorn City",
      "Dark Cave",
      "Route 46"
    ],
    "sources": [
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
    ]
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
      "The lower section can be visited early from Route 29, but it is not an unrestricted uphill shortcut to Blackthorn"
    ],
    "connections": [
      "Route 29",
      "Route 45",
      "Dark Cave"
    ],
    "sources": [
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
    ]
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
      "Cliff Cave changes elevation, while Surf and Rock Climb are required for the Embedded Tower approach"
    ],
    "connections": [
      "Cliff Edge Gate",
      "Cliff Cave",
      "Embedded Tower",
      "Route 48"
    ],
    "sources": [
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
    ]
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
    ]
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
      "Use this gate to leave Cianwood for Route 47",
      "Rock Climb is needed to reach the lower lake"
    ],
    "connections": [
      "Cianwood City",
      "Route 47"
    ],
    "sources": [
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
    ]
  },
  {
    "name": "Cliff Cave",
    "type": "landmark",
    "region": "Johto",
    "details": "Small multi-level cave connecting the different cliff levels of Route 47.",
    "landmarks": [
      "Multi-level cave inside the Route 47 cliffs",
      "Separate exits onto different elevations of the same route"
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
    ]
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
      "Legendary access is a postgame event with additional orb requirements, not an ordinary walking encounter"
    ],
    "connections": [
      "Route 47"
    ],
    "sources": [
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
    ]
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
      "Flash helps visibility",
      "Surf and Rock Smash are needed for parts of the cave, so an entrance does not guarantee unrestricted traversal to every exit"
    ],
    "connections": [
      "Route 31",
      "Route 45",
      "Route 46"
    ],
    "sources": [
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
    ]
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
      "Completing the tower is part of the early Violet Gym progression"
    ],
    "connections": [
      "Violet City"
    ],
    "sources": [
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
    ]
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
      "Outdoor gates connect to Routes 32 and 36",
      "Some chambers are approached through Union Cave and require exploration moves"
    ],
    "connections": [
      "Route 32",
      "Route 36",
      "Union Cave"
    ],
    "sources": [
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
    ]
  },
  {
    "name": "Union Cave",
    "type": "landmark",
    "region": "Johto",
    "details": "Cave between Route 32 and Route 33.",
    "landmarks": [
      "Main 1F passage, B1F, and B2F",
      "Side exits lead toward isolated Ruins of Alph chambers"
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
    ]
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
    ]
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
    ]
  },
  {
    "name": "National Park",
    "type": "landmark",
    "region": "Johto",
    "details": "Park between Routes 35 and 36; hosts the Bug-Catching Contest.",
    "landmarks": [
      "Bug-Catching Contest grounds and surrounding paths",
      "Northern gate area shared with the Pokéathlon approach"
    ],
    "access": [
      "Connects Routes 35 and 36 through gates",
      "The Bug-Catching Contest runs on Tuesday, Thursday, and Saturday"
    ],
    "connections": [
      "Route 35",
      "Route 36",
      "Pokéathlon Dome"
    ],
    "sources": [
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
    ]
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
      "The basement event advances the local story and is separate from random wild encounters"
    ],
    "connections": [
      "Ecruteak City"
    ],
    "sources": [
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
    ]
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
      "The Rainbow Wing is needed to ascend, and SoulSilver obtains it during the Kanto portion of the game"
    ],
    "connections": [
      "Bellchime Trail"
    ],
    "sources": [
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
    ]
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
      "Surf, Waterfall, and Strength open deeper routes",
      "The Kiyo reward requires space in the party"
    ],
    "connections": [
      "Route 42"
    ],
    "sources": [
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
    ]
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
      "Surf and Whirlpool are needed for the island approaches, and Flash helps underground",
      "SoulSilver's Lugia story also requires the Silver Wing and Tidal Bell events"
    ],
    "connections": [
      "Route 41"
    ],
    "sources": [
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
    ]
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
      "Surf reaches the Gyarados and water areas, while the outer paths have additional tree obstacles"
    ],
    "connections": [
      "Route 43"
    ],
    "sources": [
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
    ]
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
      "Connects Route 44 to Blackthorn City",
      "Strength is needed for the boulder puzzles, but learning Waterfall is not required just to exit the cave"
    ],
    "connections": [
      "Blackthorn City",
      "Route 44"
    ],
    "sources": [
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
    ]
  },
  {
    "name": "Dragon's Den",
    "type": "landmark",
    "region": "Johto",
    "details": "Sacred dragon location behind Blackthorn City.",
    "landmarks": [
      "Lake, shrine, and the elder's challenge",
      "Clair's post-battle Badge event"
    ],
    "access": [
      "Enter behind Blackthorn Gym after defeating Clair",
      "Surf and Whirlpool are needed to reach the shrine"
    ],
    "connections": [
      "Blackthorn City"
    ],
    "sources": [
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
    ]
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
    ]
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
      "Catching visits cost 500 Pokédollars and use Safari Balls; customization unlocks through later tests"
    ],
    "connections": [
      "Safari Zone Gate"
    ],
    "sources": [
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
    ]
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
      "Reached through the shared gate north of Route 35",
      "National Park's gate area connects to the same approach"
    ],
    "connections": [
      "Route 35",
      "National Park"
    ],
    "sources": [
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
    ]
  },
  {
    "name": "Goldenrod Department Store",
    "type": "facility",
    "region": "Johto",
    "details": "Multi-floor shop in Goldenrod City.",
    "landmarks": [
      "Multi-floor shop with stairs, elevator, and basement",
      "Different floors sell different categories of supplies"
    ],
    "access": [
      "Main entrance is in Goldenrod City",
      "The basement links to the Underground warehouse during the relevant story progression"
    ],
    "connections": [
      "Goldenrod City",
      "Goldenrod Underground"
    ],
    "sources": [
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
    ]
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
      "Upper floors are story-restricted, and the Underground rescue is part of resolving the takeover"
    ],
    "connections": [
      "Goldenrod City"
    ],
    "sources": [
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
    ]
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
      "Bring the SecretPotion from Cianwood's pharmacy to resolve the incident and return Jasmine to her Gym"
    ],
    "connections": [
      "Olivine City"
    ],
    "sources": [
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
    ]
  },
  {
    "name": "Pokémon Day Care",
    "type": "facility",
    "region": "Johto",
    "details": "Located on Route 34, south of Goldenrod City.",
    "landmarks": [
      "Pokémon care and compatible-pair Egg service",
      "Day-Care couple and Pokégear contact"
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
    ]
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
      "After the first voyage, departures from Olivine are Monday and Friday, while return departures from Vermilion are Wednesday and Sunday"
    ],
    "connections": [
      "Olivine City"
    ],
    "sources": [
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
    ]
  },
  {
    "name": "Victory Road",
    "type": "landmark",
    "region": "Kanto border",
    "details": "Final route through the caves before the Indigo Plateau.",
    "landmarks": [
      "Multi-floor cave on the approach to Indigo Plateau",
      "Rival battle near the northern exit"
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
    ]
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
      "The League challenge follows the Elite Four rooms before the Champion"
    ],
    "connections": [
      "Victory Road"
    ],
    "sources": [
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
    ]
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
      "Rock Climb is needed for the summit route, while Surf and Waterfall open water branches"
    ],
    "connections": [
      "Route 28"
    ],
    "sources": [
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
    ]
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
      "The northern gate checks the eight Johto Badges before allowing passage toward Victory Road"
    ],
    "connections": [
      "Route 27",
      "Pokémon League Reception Gate"
    ],
    "sources": [
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
    ]
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
      "Waterfall is needed to traverse Tohjo Falls and continue along the League approach"
    ],
    "connections": [
      "New Bark Town",
      "Route 26",
      "Tohjo Falls"
    ],
    "sources": [
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
    ]
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
      "The route leads to the Mt. Silver exterior rather than directly to Indigo Plateau"
    ],
    "connections": [
      "Pokémon League Reception Gate",
      "Mt. Silver"
    ],
    "sources": [
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
    ]
  },
  {
    "name": "Tohjo Falls",
    "type": "landmark",
    "region": "Johto / Kanto connection",
    "details": "Waterfall cave forming the passage through Route 27.",
    "landmarks": [
      "Twin waterfalls in a cave on Route 27",
      "Optional hidden room behind a waterfall"
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
    ]
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
      "The westward Mt. Silver route opens after Oak's all-16-Badges authorization, and Route 22 is beyond this Johto directory's eastern scope"
    ],
    "connections": [
      "Route 26",
      "Route 28",
      "Victory Road"
    ],
    "sources": [
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
    ]
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
    ]
  },
  {
    "name": "Goldenrod Underground",
    "type": "facility",
    "region": "Johto",
    "details": "Underground shopping passage and story basements beneath Goldenrod.",
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
    ]
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
      "Clear the headquarters as part of the Mahogany story"
    ],
    "connections": [
      "Mahogany Town"
    ],
    "sources": [
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
    ]
  },
  {
    "name": "Frontier Access",
    "type": "facility",
    "region": "Johto",
    "details": "Visitor area between Route 40 and the Battle Frontier.",
    "landmarks": [
      "Approach area with services for Battle Frontier visitors",
      "Gate to the five battle facilities"
    ],
    "access": [
      "Enter through the western Route 40 gate after the Hall of Fame progression",
      "Continue through the northern gate to the Battle Frontier"
    ],
    "connections": [
      "Route 40",
      "Battle Frontier"
    ],
    "sources": [
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
    ]
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
    ]
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
      "Feed Miltank Oran Berries to restore its health"
    ],
    "connections": [
      "Route 39"
    ],
    "sources": [
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
    ]
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
      "A Magnet Train Pass is required to board"
    ],
    "connections": [
      "Goldenrod City"
    ],
    "sources": [
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
    ]
  }
]);
