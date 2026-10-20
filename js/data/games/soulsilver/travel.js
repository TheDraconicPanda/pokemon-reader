// Directed travel reference, not saved-progression gating. Evidence: docs/atlas-johto-interiors-travel.md.
export const SOULSILVER_TRAVEL = Object.freeze({
  "gameId": "soulsilver",
  "reviewedOn": "2026-10-20",
  "primaryRevision": "d2355244ac42b3c6e40d8c36aa3564ee8706dea4",
  "hms": {
    "cut": {
      "label": "Cut",
      "badge": "Hive Badge"
    },
    "surf": {
      "label": "Surf",
      "badge": "Fog Badge"
    },
    "strength": {
      "label": "Strength",
      "badge": "Plain Badge"
    },
    "whirlpool": {
      "label": "Whirlpool",
      "badge": "Glacier Badge"
    },
    "waterfall": {
      "label": "Waterfall",
      "badge": "Rising Badge"
    },
    "rock-climb": {
      "label": "Rock Climb",
      "badge": "Earth Badge / all 16 Badges"
    },
    "rock-smash": {
      "label": "Rock Smash",
      "badge": "Zephyr Badge"
    }
  },
  "connections": [
    {
      "fromLocation": "New Bark Town",
      "toLocation": "Route 29",
      "hms": [],
      "conditions": [],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/newbarktown.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/New_Bark_Town",
        "https://www.serebii.net/pokearth/johto/route29.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_29"
      ]
    },
    {
      "fromLocation": "New Bark Town",
      "toLocation": "Route 27",
      "hms": [
        {
          "id": "surf",
          "usage": "passage"
        }
      ],
      "conditions": [
        "Receive Elm’s Master Ball after eight Johto Badges and complete the Kimono Girls/Lugia story event before departing east for the League."
      ],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/newbarktown.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/New_Bark_Town",
        "https://www.serebii.net/pokearth/kanto/route27.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Kanto_Route_27"
      ]
    },
    {
      "fromLocation": "Cherrygrove City",
      "toLocation": "Route 29",
      "hms": [],
      "conditions": [],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/cherrygrovecity.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Cherrygrove_City",
        "https://www.serebii.net/pokearth/johto/route29.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_29"
      ]
    },
    {
      "fromLocation": "Cherrygrove City",
      "toLocation": "Route 30",
      "hms": [],
      "conditions": [],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/cherrygrovecity.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Cherrygrove_City",
        "https://www.serebii.net/pokearth/johto/route30.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_30"
      ]
    },
    {
      "fromLocation": "Violet City",
      "toLocation": "Route 31",
      "hms": [],
      "conditions": [],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/violetcity.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Violet_City",
        "https://www.serebii.net/pokearth/johto/route31.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_31"
      ]
    },
    {
      "fromLocation": "Violet City",
      "toLocation": "Route 32",
      "hms": [],
      "conditions": [
        "Zephyr Badge and receiving Professor Elm’s Egg open the southern journey."
      ],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/violetcity.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Violet_City",
        "https://www.serebii.net/pokearth/johto/route32.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_32"
      ],
      "conditionUsage": "through"
    },
    {
      "fromLocation": "Violet City",
      "toLocation": "Route 36",
      "hms": [],
      "conditions": [],
      "notes": [
        "The eastern part is accessible early; the Sudowoodo junction needs the SquirtBottle from Goldenrod after Whitney."
      ],
      "sources": [
        "https://www.serebii.net/pokearth/johto/violetcity.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Violet_City",
        "https://www.serebii.net/pokearth/johto/route36.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_36"
      ]
    },
    {
      "fromLocation": "Violet City",
      "toLocation": "Sprout Tower",
      "hms": [],
      "conditions": [],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/violetcity.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Violet_City",
        "https://www.serebii.net/pokearth/johto/sprouttower.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Sprout_Tower"
      ]
    },
    {
      "fromLocation": "Azalea Town",
      "toLocation": "Route 33",
      "hms": [],
      "conditions": [],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/azaleatown.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Azalea_Town",
        "https://www.serebii.net/pokearth/johto/route33.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_33"
      ]
    },
    {
      "fromLocation": "Azalea Town",
      "toLocation": "Ilex Forest",
      "hms": [
        {
          "id": "cut",
          "usage": "through"
        }
      ],
      "conditions": [
        "Resolve the Slowpoke Well incident, defeat Bugsy and win the rival battle to continue the westward story."
      ],
      "notes": [
        "Cut applies to crossing the forest beyond its entrance."
      ],
      "sources": [
        "https://www.serebii.net/pokearth/johto/azaleatown.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Azalea_Town",
        "https://www.serebii.net/pokearth/johto/ilexforest.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Ilex_Forest"
      ]
    },
    {
      "fromLocation": "Azalea Town",
      "toLocation": "Slowpoke Well",
      "hms": [
        {
          "id": "surf",
          "usage": "optional"
        },
        {
          "id": "strength",
          "usage": "optional"
        }
      ],
      "conditions": [
        "Follow Kurt during the Slowpoke/Team Rocket incident to open the initial story access."
      ],
      "notes": [
        "Surf and Strength are for the deeper well chamber, not the initial Rocket story floor."
      ],
      "sources": [
        "https://www.serebii.net/pokearth/johto/azaleatown.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Azalea_Town",
        "https://www.serebii.net/pokearth/johto/slowpokewell.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Slowpoke_Well"
      ]
    },
    {
      "fromLocation": "Goldenrod City",
      "toLocation": "Route 34",
      "hms": [],
      "conditions": [],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/goldenrodcity.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Goldenrod_City",
        "https://www.serebii.net/pokearth/johto/route34.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_34"
      ]
    },
    {
      "fromLocation": "Goldenrod City",
      "toLocation": "Route 35",
      "hms": [],
      "conditions": [],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/goldenrodcity.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Goldenrod_City",
        "https://www.serebii.net/pokearth/johto/route35.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_35"
      ]
    },
    {
      "fromLocation": "Goldenrod City",
      "toLocation": "Goldenrod Department Store",
      "hms": [],
      "conditions": [],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/goldenrodcity.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Goldenrod_City",
        "https://bulbapedia.bulbagarden.net/wiki/Goldenrod_Department_Store"
      ]
    },
    {
      "fromLocation": "Goldenrod City",
      "toLocation": "Goldenrod Radio Tower",
      "hms": [],
      "conditions": [],
      "notes": [
        "The lobby is accessible early. Upper Rocket-story floors need the Director rescue and Card Key; SoulSilver’s completion reward is Silver Wing."
      ],
      "sources": [
        "https://www.serebii.net/pokearth/johto/goldenrodcity.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Goldenrod_City",
        "https://www.serebii.net/pokearth/johto/radiotower.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Goldenrod_Radio_Tower"
      ]
    },
    {
      "fromLocation": "Goldenrod City",
      "toLocation": "Goldenrod Tunnel",
      "hms": [],
      "conditions": [],
      "notes": [
        "Ordinary street shops are accessible separately from the key/switch-gated Rocket rescue basement."
      ],
      "sources": [
        "https://www.serebii.net/pokearth/johto/goldenrodcity.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Goldenrod_City",
        "https://www.serebii.net/pokearth/johto/goldenrodunderground.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Goldenrod_Underground"
      ]
    },
    {
      "fromLocation": "Goldenrod City",
      "toLocation": "Magnet Train Station",
      "hms": [],
      "conditions": [],
      "notes": [
        "The station can be visited; boarding requires restored Kanto Power Plant service and the Magnet Train Pass from Copycat."
      ],
      "sources": [
        "https://www.serebii.net/pokearth/johto/goldenrodcity.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Goldenrod_City",
        "https://bulbapedia.bulbagarden.net/wiki/Magnet_Train"
      ]
    },
    {
      "fromLocation": "Ecruteak City",
      "toLocation": "Route 37",
      "hms": [],
      "conditions": [],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/ecruteakcity.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Ecruteak_City",
        "https://www.serebii.net/pokearth/johto/route37.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_37"
      ]
    },
    {
      "fromLocation": "Ecruteak City",
      "toLocation": "Route 38",
      "hms": [],
      "conditions": [],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/ecruteakcity.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Ecruteak_City",
        "https://www.serebii.net/pokearth/johto/route38.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_38"
      ]
    },
    {
      "fromLocation": "Ecruteak City",
      "toLocation": "Route 42",
      "hms": [
        {
          "id": "surf",
          "usage": "alternative"
        }
      ],
      "conditions": [],
      "notes": [
        "Surf crosses the lakes. Walking through Mt. Mortar is an alternative; Surf is not a universal entry requirement."
      ],
      "sources": [
        "https://www.serebii.net/pokearth/johto/ecruteakcity.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Ecruteak_City",
        "https://www.serebii.net/pokearth/johto/route42.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_42"
      ]
    },
    {
      "fromLocation": "Ecruteak City",
      "toLocation": "Burned Tower",
      "hms": [],
      "conditions": [],
      "notes": [
        "Defeat the rival and trigger the basement beast event to return Morty to his Gym. Strength/Rock Smash are optional exploration tools."
      ],
      "sources": [
        "https://www.serebii.net/pokearth/johto/ecruteakcity.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Ecruteak_City",
        "https://www.serebii.net/pokearth/johto/burnedtower.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Burned_Tower"
      ]
    },
    {
      "fromLocation": "Ecruteak City",
      "toLocation": "Bellchime Trail",
      "hms": [],
      "conditions": [
        "The Barrier Station checks the Fog Badge before passage toward the tower."
      ],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/ecruteakcity.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Ecruteak_City",
        "https://www.serebii.net/pokearth/johto/bellchimetrail.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Bellchime_Trail"
      ]
    },
    {
      "fromLocation": "Olivine City",
      "toLocation": "Route 39",
      "hms": [],
      "conditions": [],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/olivinecity.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Olivine_City",
        "https://www.serebii.net/pokearth/johto/route39.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_39"
      ]
    },
    {
      "fromLocation": "Olivine City",
      "toLocation": "Route 40",
      "hms": [],
      "conditions": [],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/olivinecity.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Olivine_City",
        "https://www.serebii.net/pokearth/johto/route40.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_40"
      ]
    },
    {
      "fromLocation": "Olivine City",
      "toLocation": "Olivine Lighthouse",
      "hms": [],
      "conditions": [],
      "notes": [
        "The summit elevator shortcut opens after first speaking with Jasmine; bring the SecretPotion from Cianwood to heal Amphy."
      ],
      "sources": [
        "https://www.serebii.net/pokearth/johto/olivinecity.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Olivine_City",
        "https://www.serebii.net/pokearth/johto/shininglighthouse.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Glitter_Lighthouse"
      ]
    },
    {
      "fromLocation": "Olivine City",
      "toLocation": "S.S. Aqua",
      "hms": [],
      "conditions": [
        "Post-League service; an S.S. Ticket is required to board. Later Olivine departures are Monday/Friday; first voyage has its own story."
      ],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/olivinecity.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Olivine_City",
        "https://www.serebii.net/pokearth/johto/ssaqua.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/S.S._Aqua"
      ]
    },
    {
      "fromLocation": "Cianwood City",
      "toLocation": "Route 41",
      "hms": [
        {
          "id": "surf",
          "usage": "passage"
        }
      ],
      "conditions": [],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/cianwoodcity.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Cianwood_City",
        "https://www.serebii.net/pokearth/johto/route41.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_41"
      ]
    },
    {
      "fromLocation": "Cianwood City",
      "toLocation": "Cliff Edge Gate",
      "hms": [],
      "conditions": [
        "Deliver the SecretPotion to Jasmine/Amphy at the lighthouse to end the construction blockage on the corridor."
      ],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/cianwoodcity.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Cianwood_City",
        "https://www.serebii.net/pokearth/johto/cliffedgegate.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Cliff_Edge_Gate"
      ],
      "conditionUsage": "through"
    },
    {
      "fromLocation": "Mahogany Town",
      "toLocation": "Route 42",
      "hms": [
        {
          "id": "surf",
          "usage": "alternative"
        }
      ],
      "conditions": [],
      "notes": [
        "Surf crosses the lakes. Walking through Mt. Mortar is an alternative; Surf is not a universal entry requirement."
      ],
      "sources": [
        "https://www.serebii.net/pokearth/johto/mahoganytown.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Mahogany_Town",
        "https://www.serebii.net/pokearth/johto/route42.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_42"
      ]
    },
    {
      "fromLocation": "Mahogany Town",
      "toLocation": "Route 43",
      "hms": [],
      "conditions": [],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/mahoganytown.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Mahogany_Town",
        "https://www.serebii.net/pokearth/johto/route43.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_43"
      ]
    },
    {
      "fromLocation": "Mahogany Town",
      "toLocation": "Route 44",
      "hms": [],
      "conditions": [
        "Resolve the Goldenrod Radio Tower takeover to open the eastern road; buying a RageCandyBar alone does not open it."
      ],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/mahoganytown.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Mahogany_Town",
        "https://www.serebii.net/pokearth/johto/route44.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_44"
      ]
    },
    {
      "fromLocation": "Mahogany Town",
      "toLocation": "Team Rocket HQ",
      "hms": [],
      "conditions": [
        "Investigate the Lake of Rage incident; Lance reveals the shop’s hidden entrance."
      ],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/mahoganytown.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Mahogany_Town",
        "https://www.serebii.net/pokearth/johto/rockethideout.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Team_Rocket_HQ"
      ]
    },
    {
      "fromLocation": "Blackthorn City",
      "toLocation": "Route 45",
      "hms": [],
      "conditions": [],
      "notes": [
        "The road descends south through one-way ledges. Returning uphill from its lower sections is not possible."
      ],
      "sources": [
        "https://www.serebii.net/pokearth/johto/blackthorncity.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Blackthorn_City",
        "https://www.serebii.net/pokearth/johto/route45.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_45"
      ]
    },
    {
      "fromLocation": "Blackthorn City",
      "toLocation": "Ice Path",
      "hms": [
        {
          "id": "strength",
          "usage": "through"
        }
      ],
      "conditions": [],
      "notes": [
        "The through-route uses Strength and requires collecting HM07; no field use of Waterfall is required."
      ],
      "sources": [
        "https://www.serebii.net/pokearth/johto/blackthorncity.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Blackthorn_City",
        "https://www.serebii.net/pokearth/johto/icepath.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Ice_Path"
      ]
    },
    {
      "fromLocation": "Blackthorn City",
      "toLocation": "Dragon's Den",
      "hms": [
        {
          "id": "surf",
          "usage": "through"
        },
        {
          "id": "whirlpool",
          "usage": "through"
        }
      ],
      "conditions": [
        "Defeat Clair to enter behind the Gym."
      ],
      "notes": [
        "Surf and Whirlpool are required to reach the shrine, not to step inside the cave entrance."
      ],
      "sources": [
        "https://www.serebii.net/pokearth/johto/blackthorncity.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Blackthorn_City",
        "https://www.serebii.net/pokearth/johto/dragon'sden.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Dragon's_Den"
      ]
    },
    {
      "fromLocation": "Route 29",
      "toLocation": "New Bark Town",
      "hms": [],
      "conditions": [],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/route29.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_29",
        "https://www.serebii.net/pokearth/johto/newbarktown.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/New_Bark_Town"
      ]
    },
    {
      "fromLocation": "Route 29",
      "toLocation": "Cherrygrove City",
      "hms": [],
      "conditions": [],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/route29.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_29",
        "https://www.serebii.net/pokearth/johto/cherrygrovecity.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Cherrygrove_City"
      ]
    },
    {
      "fromLocation": "Route 29",
      "toLocation": "Route 46",
      "hms": [],
      "conditions": [],
      "notes": [
        "This enters the lower section only. Ledges block an uphill shortcut to Route 45/Blackthorn."
      ],
      "sources": [
        "https://www.serebii.net/pokearth/johto/route29.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_29",
        "https://www.serebii.net/pokearth/johto/route46.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_46"
      ]
    },
    {
      "fromLocation": "Route 30",
      "toLocation": "Cherrygrove City",
      "hms": [],
      "conditions": [],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/route30.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_30",
        "https://www.serebii.net/pokearth/johto/cherrygrovecity.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Cherrygrove_City"
      ]
    },
    {
      "fromLocation": "Route 30",
      "toLocation": "Route 31",
      "hms": [],
      "conditions": [
        "Deliver the Mystery Egg to Professor Elm to clear the early western-path Trainers."
      ],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/route30.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_30",
        "https://www.serebii.net/pokearth/johto/route31.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_31"
      ]
    },
    {
      "fromLocation": "Route 31",
      "toLocation": "Violet City",
      "hms": [],
      "conditions": [],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/route31.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_31",
        "https://www.serebii.net/pokearth/johto/violetcity.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Violet_City"
      ]
    },
    {
      "fromLocation": "Route 31",
      "toLocation": "Route 30",
      "hms": [],
      "conditions": [],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/route31.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_31",
        "https://www.serebii.net/pokearth/johto/route30.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_30"
      ]
    },
    {
      "fromLocation": "Route 31",
      "toLocation": "Dark Cave",
      "hms": [
        {
          "id": "surf",
          "usage": "optional"
        },
        {
          "id": "strength",
          "usage": "optional"
        },
        {
          "id": "rock-smash",
          "usage": "optional"
        }
      ],
      "conditions": [],
      "notes": [
        "The south entrance is optional; Flash helps visibility. The cave is not a south-to-north shortcut to Route 45."
      ],
      "sources": [
        "https://www.serebii.net/pokearth/johto/route31.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_31",
        "https://www.serebii.net/pokearth/johto/darkcave.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Dark_Cave"
      ]
    },
    {
      "fromLocation": "Route 32",
      "toLocation": "Violet City",
      "hms": [],
      "conditions": [],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/route32.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_32",
        "https://www.serebii.net/pokearth/johto/violetcity.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Violet_City"
      ]
    },
    {
      "fromLocation": "Route 32",
      "toLocation": "Union Cave",
      "hms": [],
      "conditions": [],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/route32.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_32",
        "https://www.serebii.net/pokearth/johto/unioncave.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Union_Cave"
      ]
    },
    {
      "fromLocation": "Route 32",
      "toLocation": "Ruins of Alph",
      "hms": [],
      "conditions": [],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/route32.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_32",
        "https://www.serebii.net/pokearth/johto/ruinsofalph.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Ruins_of_Alph"
      ]
    },
    {
      "fromLocation": "Route 33",
      "toLocation": "Azalea Town",
      "hms": [],
      "conditions": [],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/route33.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_33",
        "https://www.serebii.net/pokearth/johto/azaleatown.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Azalea_Town"
      ]
    },
    {
      "fromLocation": "Route 33",
      "toLocation": "Union Cave",
      "hms": [],
      "conditions": [],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/route33.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_33",
        "https://www.serebii.net/pokearth/johto/unioncave.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Union_Cave"
      ]
    },
    {
      "fromLocation": "Route 34",
      "toLocation": "Goldenrod City",
      "hms": [],
      "conditions": [],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/route34.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_34",
        "https://www.serebii.net/pokearth/johto/goldenrodcity.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Goldenrod_City"
      ]
    },
    {
      "fromLocation": "Route 34",
      "toLocation": "Ilex Forest",
      "hms": [
        {
          "id": "cut",
          "usage": "through"
        }
      ],
      "conditions": [],
      "notes": [
        "Cut and the Hive Badge open the forest’s main through-path."
      ],
      "sources": [
        "https://www.serebii.net/pokearth/johto/route34.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_34",
        "https://www.serebii.net/pokearth/johto/ilexforest.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Ilex_Forest"
      ]
    },
    {
      "fromLocation": "Route 34",
      "toLocation": "Pokémon Day Care",
      "hms": [],
      "conditions": [],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/route34.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_34",
        "https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9mon_Day_Care"
      ]
    },
    {
      "fromLocation": "Route 35",
      "toLocation": "Goldenrod City",
      "hms": [],
      "conditions": [],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/route35.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_35",
        "https://www.serebii.net/pokearth/johto/goldenrodcity.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Goldenrod_City"
      ]
    },
    {
      "fromLocation": "Route 35",
      "toLocation": "National Park",
      "hms": [],
      "conditions": [],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/route35.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_35",
        "https://www.serebii.net/pokearth/johto/nationalpark.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/National_Park"
      ]
    },
    {
      "fromLocation": "Route 35",
      "toLocation": "Pokéathlon Dome",
      "hms": [],
      "conditions": [
        "Defeat Whitney to open this area."
      ],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/route35.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_35",
        "https://www.serebii.net/pokearth/johto/pokeathlondome.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9athlon_Dome"
      ]
    },
    {
      "fromLocation": "Route 35",
      "toLocation": "Route 36",
      "hms": [
        {
          "id": "cut",
          "usage": "passage"
        }
      ],
      "conditions": [],
      "notes": [
        "This direct shortcut has a Cut tree. The National Park route is an alternative."
      ],
      "sources": [
        "https://www.serebii.net/pokearth/johto/route35.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_35",
        "https://www.serebii.net/pokearth/johto/route36.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_36"
      ]
    },
    {
      "fromLocation": "Route 36",
      "toLocation": "Violet City",
      "hms": [],
      "conditions": [],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/route36.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_36",
        "https://www.serebii.net/pokearth/johto/violetcity.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Violet_City"
      ]
    },
    {
      "fromLocation": "Route 36",
      "toLocation": "National Park",
      "hms": [],
      "conditions": [],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/route36.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_36",
        "https://www.serebii.net/pokearth/johto/nationalpark.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/National_Park"
      ]
    },
    {
      "fromLocation": "Route 36",
      "toLocation": "Route 37",
      "hms": [],
      "conditions": [
        "Obtain the SquirtBottle after Whitney’s Plain Badge and resolve the Sudowoodo blockage on the earlier through-route."
      ],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/route36.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_36",
        "https://www.serebii.net/pokearth/johto/route37.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_37"
      ],
      "conditionUsage": "through"
    },
    {
      "fromLocation": "Route 36",
      "toLocation": "Ruins of Alph",
      "hms": [],
      "conditions": [],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/route36.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_36",
        "https://www.serebii.net/pokearth/johto/ruinsofalph.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Ruins_of_Alph"
      ]
    },
    {
      "fromLocation": "Route 36",
      "toLocation": "Route 35",
      "hms": [
        {
          "id": "cut",
          "usage": "passage"
        }
      ],
      "conditions": [],
      "notes": [
        "This direct shortcut has a Cut tree. The National Park route is an alternative."
      ],
      "sources": [
        "https://www.serebii.net/pokearth/johto/route36.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_36",
        "https://www.serebii.net/pokearth/johto/route35.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_35"
      ]
    },
    {
      "fromLocation": "Route 37",
      "toLocation": "Ecruteak City",
      "hms": [],
      "conditions": [],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/route37.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_37",
        "https://www.serebii.net/pokearth/johto/ecruteakcity.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Ecruteak_City"
      ]
    },
    {
      "fromLocation": "Route 37",
      "toLocation": "Route 36",
      "hms": [],
      "conditions": [],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/route37.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_37",
        "https://www.serebii.net/pokearth/johto/route36.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_36"
      ]
    },
    {
      "fromLocation": "Route 38",
      "toLocation": "Ecruteak City",
      "hms": [],
      "conditions": [],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/route38.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_38",
        "https://www.serebii.net/pokearth/johto/ecruteakcity.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Ecruteak_City"
      ]
    },
    {
      "fromLocation": "Route 38",
      "toLocation": "Route 39",
      "hms": [],
      "conditions": [],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/route38.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_38",
        "https://www.serebii.net/pokearth/johto/route39.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_39"
      ]
    },
    {
      "fromLocation": "Route 39",
      "toLocation": "Olivine City",
      "hms": [],
      "conditions": [],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/route39.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_39",
        "https://www.serebii.net/pokearth/johto/olivinecity.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Olivine_City"
      ]
    },
    {
      "fromLocation": "Route 39",
      "toLocation": "Route 38",
      "hms": [],
      "conditions": [],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/route39.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_39",
        "https://www.serebii.net/pokearth/johto/route38.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_38"
      ]
    },
    {
      "fromLocation": "Route 39",
      "toLocation": "MooMoo Farm",
      "hms": [],
      "conditions": [],
      "notes": [
        "The house/barn are reachable without Rock Climb. Rock Climb is for the separate Route 38 plateau."
      ],
      "sources": [
        "https://www.serebii.net/pokearth/johto/route39.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_39",
        "https://bulbapedia.bulbagarden.net/wiki/Moomoo_Farm"
      ]
    },
    {
      "fromLocation": "Route 40",
      "toLocation": "Olivine City",
      "hms": [],
      "conditions": [],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/route40.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_40",
        "https://www.serebii.net/pokearth/johto/olivinecity.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Olivine_City"
      ]
    },
    {
      "fromLocation": "Route 40",
      "toLocation": "Route 41",
      "hms": [
        {
          "id": "surf",
          "usage": "passage"
        }
      ],
      "conditions": [],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/route40.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_40",
        "https://www.serebii.net/pokearth/johto/route41.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_41"
      ]
    },
    {
      "fromLocation": "Route 40",
      "toLocation": "Frontier Access",
      "hms": [],
      "conditions": [
        "Enter the Hall of Fame before the northern gate opens."
      ],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/route40.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_40",
        "https://www.serebii.net/pokearth/johto/frontieraccess.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Frontier_Access"
      ]
    },
    {
      "fromLocation": "Route 41",
      "toLocation": "Cianwood City",
      "hms": [
        {
          "id": "surf",
          "usage": "passage"
        }
      ],
      "conditions": [],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/route41.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_41",
        "https://www.serebii.net/pokearth/johto/cianwoodcity.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Cianwood_City"
      ]
    },
    {
      "fromLocation": "Route 41",
      "toLocation": "Route 40",
      "hms": [
        {
          "id": "surf",
          "usage": "passage"
        }
      ],
      "conditions": [],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/route41.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_41",
        "https://www.serebii.net/pokearth/johto/route40.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_40"
      ]
    },
    {
      "fromLocation": "Route 41",
      "toLocation": "Whirl Islands",
      "hms": [
        {
          "id": "surf",
          "usage": "passage"
        },
        {
          "id": "whirlpool",
          "usage": "passage"
        }
      ],
      "conditions": [],
      "notes": [
        "Flash helps visibility but is not an HM entry requirement. The northeast island leads toward Lugia; its chamber requires the Silver Wing/Tidal Bell story."
      ],
      "sources": [
        "https://www.serebii.net/pokearth/johto/route41.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_41",
        "https://www.serebii.net/pokearth/johto/whirlislands.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Whirl_Islands"
      ]
    },
    {
      "fromLocation": "Route 42",
      "toLocation": "Ecruteak City",
      "hms": [
        {
          "id": "surf",
          "usage": "alternative"
        }
      ],
      "conditions": [],
      "notes": [
        "Surf crosses the lakes. Walking through Mt. Mortar is an alternative; Surf is not a universal entry requirement."
      ],
      "sources": [
        "https://www.serebii.net/pokearth/johto/route42.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_42",
        "https://www.serebii.net/pokearth/johto/ecruteakcity.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Ecruteak_City"
      ]
    },
    {
      "fromLocation": "Route 42",
      "toLocation": "Mahogany Town",
      "hms": [
        {
          "id": "surf",
          "usage": "alternative"
        }
      ],
      "conditions": [],
      "notes": [
        "Surf crosses the lakes. Walking through Mt. Mortar is an alternative; Surf is not a universal entry requirement."
      ],
      "sources": [
        "https://www.serebii.net/pokearth/johto/route42.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_42",
        "https://www.serebii.net/pokearth/johto/mahoganytown.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Mahogany_Town"
      ]
    },
    {
      "fromLocation": "Route 42",
      "toLocation": "Mt. Mortar",
      "hms": [
        {
          "id": "surf",
          "usage": "optional"
        },
        {
          "id": "strength",
          "usage": "optional"
        },
        {
          "id": "waterfall",
          "usage": "optional"
        },
        {
          "id": "rock-climb",
          "usage": "optional"
        }
      ],
      "conditions": [],
      "notes": [
        "These HMs open different deeper/side areas; the entrance and the ordinary passage do not require every HM. Flash is not needed in HGSS."
      ],
      "sources": [
        "https://www.serebii.net/pokearth/johto/route42.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_42",
        "https://www.serebii.net/pokearth/johto/mt.mortar.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Mt._Mortar"
      ]
    },
    {
      "fromLocation": "Route 43",
      "toLocation": "Mahogany Town",
      "hms": [],
      "conditions": [],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/route43.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_43",
        "https://www.serebii.net/pokearth/johto/mahoganytown.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Mahogany_Town"
      ]
    },
    {
      "fromLocation": "Route 43",
      "toLocation": "Lake of Rage",
      "hms": [],
      "conditions": [],
      "notes": [
        "The grass path avoids Team Rocket’s $1,000 gate toll during the incident. Surf opens a side approach and Cut is used in the outer maze; neither is a universal requirement for visiting the lakeshore."
      ],
      "sources": [
        "https://www.serebii.net/pokearth/johto/route43.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_43",
        "https://www.serebii.net/pokearth/johto/lakeofrage.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Lake_of_Rage"
      ]
    },
    {
      "fromLocation": "Route 44",
      "toLocation": "Mahogany Town",
      "hms": [],
      "conditions": [],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/route44.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_44",
        "https://www.serebii.net/pokearth/johto/mahoganytown.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Mahogany_Town"
      ]
    },
    {
      "fromLocation": "Route 44",
      "toLocation": "Ice Path",
      "hms": [
        {
          "id": "strength",
          "usage": "through"
        }
      ],
      "conditions": [],
      "notes": [
        "Strength is needed for the through-route boulder puzzle. Pick up HM07 Waterfall when the NPC asks; teaching or using Waterfall is not needed to exit."
      ],
      "sources": [
        "https://www.serebii.net/pokearth/johto/route44.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_44",
        "https://www.serebii.net/pokearth/johto/icepath.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Ice_Path"
      ]
    },
    {
      "fromLocation": "Route 45",
      "toLocation": "Blackthorn City",
      "hms": [],
      "conditions": [],
      "notes": [
        "The road descends south through one-way ledges. Returning uphill from its lower sections is not possible."
      ],
      "sources": [
        "https://www.serebii.net/pokearth/johto/route45.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_45",
        "https://www.serebii.net/pokearth/johto/blackthorncity.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Blackthorn_City"
      ]
    },
    {
      "fromLocation": "Route 45",
      "toLocation": "Dark Cave",
      "hms": [],
      "conditions": [],
      "notes": [
        "This is the northern cave entrance. Ledges prevent the reverse south-to-north cave shortcut."
      ],
      "sources": [
        "https://www.serebii.net/pokearth/johto/route45.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_45",
        "https://www.serebii.net/pokearth/johto/darkcave.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Dark_Cave"
      ]
    },
    {
      "fromLocation": "Route 45",
      "toLocation": "Route 46",
      "hms": [],
      "conditions": [],
      "notes": [
        "Southbound ledges permit descent; they do not provide an unrestricted climb back north."
      ],
      "sources": [
        "https://www.serebii.net/pokearth/johto/route45.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_45",
        "https://www.serebii.net/pokearth/johto/route46.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_46"
      ]
    },
    {
      "fromLocation": "Route 46",
      "toLocation": "Route 29",
      "hms": [],
      "conditions": [],
      "notes": [
        "This enters the lower section only. Ledges block an uphill shortcut to Route 45/Blackthorn."
      ],
      "sources": [
        "https://www.serebii.net/pokearth/johto/route46.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_46",
        "https://www.serebii.net/pokearth/johto/route29.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_29"
      ]
    },
    {
      "fromLocation": "Route 46",
      "toLocation": "Route 45",
      "hms": [],
      "conditions": [],
      "notes": [
        "Southbound ledges permit descent; they do not provide an unrestricted climb back north."
      ],
      "sources": [
        "https://www.serebii.net/pokearth/johto/route46.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_46",
        "https://www.serebii.net/pokearth/johto/route45.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_45"
      ]
    },
    {
      "fromLocation": "Route 46",
      "toLocation": "Dark Cave",
      "hms": [
        {
          "id": "strength",
          "usage": "through"
        }
      ],
      "conditions": [],
      "notes": [
        "The connection is in upper Route 46, unreachable uphill from Route 29. Strength is used on the Route 46 cave passage."
      ],
      "sources": [
        "https://www.serebii.net/pokearth/johto/route46.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_46",
        "https://www.serebii.net/pokearth/johto/darkcave.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Dark_Cave"
      ]
    },
    {
      "fromLocation": "Route 47",
      "toLocation": "Cliff Edge Gate",
      "hms": [],
      "conditions": [
        "The main corridor opens after Amphy is healed with the SecretPotion."
      ],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/route47.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_47",
        "https://www.serebii.net/pokearth/johto/cliffedgegate.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Cliff_Edge_Gate"
      ]
    },
    {
      "fromLocation": "Route 47",
      "toLocation": "Cliff Cave",
      "hms": [],
      "conditions": [],
      "notes": [
        "Cliff Cave changes elevation and reaches Route 47’s lower shoreline. The tall-grass side area separately needs Surf and Waterfall."
      ],
      "sources": [
        "https://www.serebii.net/pokearth/johto/route47.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_47",
        "https://www.serebii.net/pokearth/johto/cliffcave.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Cliff_Cave"
      ]
    },
    {
      "fromLocation": "Route 47",
      "toLocation": "Embedded Tower",
      "hms": [
        {
          "id": "surf",
          "usage": "passage"
        },
        {
          "id": "rock-climb",
          "usage": "passage"
        }
      ],
      "conditions": [],
      "notes": [
        "For Groudon, obtain SoulSilver’s Red Orb after defeating Red and receiving Oak’s Kanto starter. Rayquaza separately requires the Jade Orb."
      ],
      "sources": [
        "https://www.serebii.net/pokearth/johto/route47.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_47",
        "https://www.serebii.net/pokearth/johto/embeddedtower.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Embedded_Tower"
      ]
    },
    {
      "fromLocation": "Route 47",
      "toLocation": "Route 48",
      "hms": [],
      "conditions": [],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/route47.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_47",
        "https://www.serebii.net/pokearth/johto/route48.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_48"
      ]
    },
    {
      "fromLocation": "Route 48",
      "toLocation": "Route 47",
      "hms": [],
      "conditions": [],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/route48.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_48",
        "https://www.serebii.net/pokearth/johto/route47.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_47"
      ]
    },
    {
      "fromLocation": "Route 48",
      "toLocation": "Safari Zone Gate",
      "hms": [],
      "conditions": [],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/route48.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_48",
        "https://www.serebii.net/pokearth/johto/safarizonegate.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Safari_Zone_Gate"
      ]
    },
    {
      "fromLocation": "Cliff Edge Gate",
      "toLocation": "Cianwood City",
      "hms": [],
      "conditions": [],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/cliffedgegate.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Cliff_Edge_Gate",
        "https://www.serebii.net/pokearth/johto/cianwoodcity.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Cianwood_City"
      ]
    },
    {
      "fromLocation": "Cliff Edge Gate",
      "toLocation": "Route 47",
      "hms": [],
      "conditions": [
        "The main corridor opens after Amphy is healed with the SecretPotion."
      ],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/cliffedgegate.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Cliff_Edge_Gate",
        "https://www.serebii.net/pokearth/johto/route47.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_47"
      ]
    },
    {
      "fromLocation": "Cliff Cave",
      "toLocation": "Route 47",
      "hms": [],
      "conditions": [],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/cliffcave.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Cliff_Cave",
        "https://www.serebii.net/pokearth/johto/route47.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_47"
      ]
    },
    {
      "fromLocation": "Embedded Tower",
      "toLocation": "Route 47",
      "hms": [
        {
          "id": "surf",
          "usage": "passage"
        },
        {
          "id": "rock-climb",
          "usage": "passage"
        }
      ],
      "conditions": [],
      "notes": [
        "For Groudon, obtain SoulSilver’s Red Orb after defeating Red and receiving Oak’s Kanto starter. Rayquaza separately requires the Jade Orb."
      ],
      "sources": [
        "https://www.serebii.net/pokearth/johto/embeddedtower.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Embedded_Tower",
        "https://www.serebii.net/pokearth/johto/route47.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_47"
      ]
    },
    {
      "fromLocation": "Dark Cave",
      "toLocation": "Route 31",
      "hms": [],
      "conditions": [],
      "notes": [
        "This exit is on the Route 31/46 southern side; moving between cave sections can require Surf and Strength."
      ],
      "sources": [
        "https://www.serebii.net/pokearth/johto/darkcave.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Dark_Cave",
        "https://www.serebii.net/pokearth/johto/route31.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_31"
      ]
    },
    {
      "fromLocation": "Dark Cave",
      "toLocation": "Route 45",
      "hms": [],
      "conditions": [],
      "notes": [
        "Only the northern/Route 45 cave section reaches this exit; it cannot be reached uphill from the Route 31/46 side."
      ],
      "sources": [
        "https://www.serebii.net/pokearth/johto/darkcave.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Dark_Cave",
        "https://www.serebii.net/pokearth/johto/route45.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_45"
      ]
    },
    {
      "fromLocation": "Dark Cave",
      "toLocation": "Route 46",
      "hms": [
        {
          "id": "strength",
          "usage": "through"
        }
      ],
      "conditions": [],
      "notes": [
        "The connection is in upper Route 46, unreachable uphill from Route 29. Strength is used on the Route 46 cave passage."
      ],
      "sources": [
        "https://www.serebii.net/pokearth/johto/darkcave.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Dark_Cave",
        "https://www.serebii.net/pokearth/johto/route46.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_46"
      ]
    },
    {
      "fromLocation": "Sprout Tower",
      "toLocation": "Violet City",
      "hms": [],
      "conditions": [],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/sprouttower.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Sprout_Tower",
        "https://www.serebii.net/pokearth/johto/violetcity.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Violet_City"
      ]
    },
    {
      "fromLocation": "Ruins of Alph",
      "toLocation": "Route 32",
      "hms": [],
      "conditions": [],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/ruinsofalph.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Ruins_of_Alph",
        "https://www.serebii.net/pokearth/johto/route32.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_32"
      ]
    },
    {
      "fromLocation": "Ruins of Alph",
      "toLocation": "Route 36",
      "hms": [],
      "conditions": [],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/ruinsofalph.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Ruins_of_Alph",
        "https://www.serebii.net/pokearth/johto/route36.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_36"
      ]
    },
    {
      "fromLocation": "Ruins of Alph",
      "toLocation": "Union Cave",
      "hms": [
        {
          "id": "surf",
          "usage": "through"
        },
        {
          "id": "strength",
          "usage": "optional"
        }
      ],
      "conditions": [],
      "notes": [
        "The western chamber approaches use Union Cave’s lower passage; one southwestern puzzle chamber also needs Strength."
      ],
      "sources": [
        "https://www.serebii.net/pokearth/johto/ruinsofalph.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Ruins_of_Alph",
        "https://www.serebii.net/pokearth/johto/unioncave.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Union_Cave"
      ]
    },
    {
      "fromLocation": "Union Cave",
      "toLocation": "Route 32",
      "hms": [],
      "conditions": [],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/unioncave.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Union_Cave",
        "https://www.serebii.net/pokearth/johto/route32.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_32"
      ]
    },
    {
      "fromLocation": "Union Cave",
      "toLocation": "Route 33",
      "hms": [],
      "conditions": [],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/unioncave.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Union_Cave",
        "https://www.serebii.net/pokearth/johto/route33.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_33"
      ]
    },
    {
      "fromLocation": "Union Cave",
      "toLocation": "Ruins of Alph",
      "hms": [
        {
          "id": "surf",
          "usage": "through"
        },
        {
          "id": "strength",
          "usage": "optional"
        }
      ],
      "conditions": [],
      "notes": [
        "The western chamber approaches use Union Cave’s lower passage; one southwestern puzzle chamber also needs Strength."
      ],
      "sources": [
        "https://www.serebii.net/pokearth/johto/unioncave.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Union_Cave",
        "https://www.serebii.net/pokearth/johto/ruinsofalph.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Ruins_of_Alph"
      ]
    },
    {
      "fromLocation": "Slowpoke Well",
      "toLocation": "Azalea Town",
      "hms": [],
      "conditions": [],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/slowpokewell.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Slowpoke_Well",
        "https://www.serebii.net/pokearth/johto/azaleatown.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Azalea_Town"
      ]
    },
    {
      "fromLocation": "Ilex Forest",
      "toLocation": "Azalea Town",
      "hms": [
        {
          "id": "cut",
          "usage": "through"
        }
      ],
      "conditions": [],
      "notes": [
        "Cut is for the forest through-path; it is not required just to step into the eastern entrance."
      ],
      "sources": [
        "https://www.serebii.net/pokearth/johto/ilexforest.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Ilex_Forest",
        "https://www.serebii.net/pokearth/johto/azaleatown.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Azalea_Town"
      ]
    },
    {
      "fromLocation": "Ilex Forest",
      "toLocation": "Route 34",
      "hms": [
        {
          "id": "cut",
          "usage": "through"
        }
      ],
      "conditions": [],
      "notes": [
        "Cut and the Hive Badge open the forest’s main through-path."
      ],
      "sources": [
        "https://www.serebii.net/pokearth/johto/ilexforest.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Ilex_Forest",
        "https://www.serebii.net/pokearth/johto/route34.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_34"
      ]
    },
    {
      "fromLocation": "National Park",
      "toLocation": "Route 35",
      "hms": [],
      "conditions": [],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/nationalpark.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/National_Park",
        "https://www.serebii.net/pokearth/johto/route35.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_35"
      ]
    },
    {
      "fromLocation": "National Park",
      "toLocation": "Route 36",
      "hms": [],
      "conditions": [],
      "notes": [
        "The Sudowoodo junction is a separate SquirtBottle story gate; entering the western Route 36 approach is not gated by it."
      ],
      "sources": [
        "https://www.serebii.net/pokearth/johto/nationalpark.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/National_Park",
        "https://www.serebii.net/pokearth/johto/route36.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_36"
      ]
    },
    {
      "fromLocation": "National Park",
      "toLocation": "Pokéathlon Dome",
      "hms": [],
      "conditions": [
        "Defeat Whitney to open this area."
      ],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/nationalpark.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/National_Park",
        "https://www.serebii.net/pokearth/johto/pokeathlondome.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9athlon_Dome"
      ]
    },
    {
      "fromLocation": "Burned Tower",
      "toLocation": "Ecruteak City",
      "hms": [],
      "conditions": [],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/burnedtower.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Burned_Tower",
        "https://www.serebii.net/pokearth/johto/ecruteakcity.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Ecruteak_City"
      ]
    },
    {
      "fromLocation": "Bell Tower",
      "toLocation": "Bellchime Trail",
      "hms": [],
      "conditions": [],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/belltower.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Bell_Tower",
        "https://bulbapedia.bulbagarden.net/wiki/Pewter_City",
        "https://www.serebii.net/pokearth/johto/bellchimetrail.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Bellchime_Trail"
      ]
    },
    {
      "fromLocation": "Mt. Mortar",
      "toLocation": "Route 42",
      "hms": [],
      "conditions": [],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/mt.mortar.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Mt._Mortar",
        "https://www.serebii.net/pokearth/johto/route42.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_42"
      ]
    },
    {
      "fromLocation": "Whirl Islands",
      "toLocation": "Route 41",
      "hms": [
        {
          "id": "surf",
          "usage": "passage"
        },
        {
          "id": "whirlpool",
          "usage": "passage"
        }
      ],
      "conditions": [],
      "notes": [
        "Flash helps visibility but is not an HM entry requirement. The northeast island leads toward Lugia; its chamber requires the Silver Wing/Tidal Bell story."
      ],
      "sources": [
        "https://www.serebii.net/pokearth/johto/whirlislands.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Whirl_Islands",
        "https://www.serebii.net/pokearth/johto/route41.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_41"
      ]
    },
    {
      "fromLocation": "Lake of Rage",
      "toLocation": "Route 43",
      "hms": [],
      "conditions": [],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/lakeofrage.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Lake_of_Rage",
        "https://www.serebii.net/pokearth/johto/route43.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_43"
      ]
    },
    {
      "fromLocation": "Ice Path",
      "toLocation": "Blackthorn City",
      "hms": [
        {
          "id": "strength",
          "usage": "through"
        }
      ],
      "conditions": [],
      "notes": [
        "The through-route uses Strength and requires collecting HM07; no field use of Waterfall is required."
      ],
      "sources": [
        "https://www.serebii.net/pokearth/johto/icepath.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Ice_Path",
        "https://www.serebii.net/pokearth/johto/blackthorncity.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Blackthorn_City"
      ]
    },
    {
      "fromLocation": "Ice Path",
      "toLocation": "Route 44",
      "hms": [
        {
          "id": "strength",
          "usage": "through"
        }
      ],
      "conditions": [],
      "notes": [
        "Strength is needed for the through-route boulder puzzle. Pick up HM07 Waterfall when the NPC asks; teaching or using Waterfall is not needed to exit."
      ],
      "sources": [
        "https://www.serebii.net/pokearth/johto/icepath.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Ice_Path",
        "https://www.serebii.net/pokearth/johto/route44.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_44"
      ]
    },
    {
      "fromLocation": "Dragon's Den",
      "toLocation": "Blackthorn City",
      "hms": [],
      "conditions": [],
      "notes": [
        "Return from the shrine through the same cave/water approach; its Rising Badge quiz unlocks field Waterfall."
      ],
      "sources": [
        "https://www.serebii.net/pokearth/johto/dragon'sden.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Dragon's_Den",
        "https://www.serebii.net/pokearth/johto/blackthorncity.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Blackthorn_City"
      ]
    },
    {
      "fromLocation": "Safari Zone Gate",
      "toLocation": "Route 48",
      "hms": [],
      "conditions": [],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/safarizonegate.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Safari_Zone_Gate",
        "https://www.serebii.net/pokearth/johto/route48.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_48"
      ]
    },
    {
      "fromLocation": "Pokéathlon Dome",
      "toLocation": "Route 35",
      "hms": [],
      "conditions": [],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/pokeathlondome.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9athlon_Dome",
        "https://www.serebii.net/pokearth/johto/route35.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_35"
      ]
    },
    {
      "fromLocation": "Pokéathlon Dome",
      "toLocation": "National Park",
      "hms": [],
      "conditions": [],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/pokeathlondome.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9athlon_Dome",
        "https://www.serebii.net/pokearth/johto/nationalpark.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/National_Park"
      ]
    },
    {
      "fromLocation": "Goldenrod Department Store",
      "toLocation": "Goldenrod City",
      "hms": [],
      "conditions": [],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/goldenrodcity.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Goldenrod_Department_Store",
        "https://bulbapedia.bulbagarden.net/wiki/Goldenrod_City"
      ]
    },
    {
      "fromLocation": "Goldenrod Department Store",
      "toLocation": "Goldenrod Tunnel",
      "hms": [],
      "conditions": [
        "Basement keys, switches and the Rocket Director rescue progression gate the warehouse connection."
      ],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/goldenrodcity.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Goldenrod_Department_Store",
        "https://www.serebii.net/pokearth/johto/goldenrodunderground.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Goldenrod_Underground"
      ]
    },
    {
      "fromLocation": "Goldenrod Radio Tower",
      "toLocation": "Goldenrod City",
      "hms": [],
      "conditions": [],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/radiotower.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Goldenrod_Radio_Tower",
        "https://www.serebii.net/pokearth/johto/goldenrodcity.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Goldenrod_City"
      ]
    },
    {
      "fromLocation": "Olivine Lighthouse",
      "toLocation": "Olivine City",
      "hms": [],
      "conditions": [],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/shininglighthouse.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Glitter_Lighthouse",
        "https://www.serebii.net/pokearth/johto/olivinecity.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Olivine_City"
      ]
    },
    {
      "fromLocation": "Pokémon Day Care",
      "toLocation": "Route 34",
      "hms": [],
      "conditions": [],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/route34.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9mon_Day_Care",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_34"
      ]
    },
    {
      "fromLocation": "S.S. Aqua",
      "toLocation": "Olivine City",
      "hms": [],
      "conditions": [
        "After the first voyage, return sailings from Vermilion are Wednesday/Sunday. This guide does not add a Kanto destination."
      ],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/ssaqua.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/S.S._Aqua",
        "https://www.serebii.net/pokearth/johto/olivinecity.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Olivine_City"
      ]
    },
    {
      "fromLocation": "Victory Road",
      "toLocation": "Pokémon League Reception Gate",
      "hms": [],
      "conditions": [],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/kanto/4th/victoryroad.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Victory_Road_(Kanto)",
        "https://www.serebii.net/pokearth/kanto/4th/route22.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9mon_League_Reception_Gate"
      ]
    },
    {
      "fromLocation": "Victory Road",
      "toLocation": "Indigo Plateau",
      "hms": [
        {
          "id": "strength",
          "usage": "through"
        }
      ],
      "conditions": [],
      "notes": [
        "Strength is needed on the cave through-route, not in the League lobby."
      ],
      "sources": [
        "https://www.serebii.net/pokearth/kanto/4th/victoryroad.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Victory_Road_(Kanto)",
        "https://www.serebii.net/pokearth/kanto/4th/indigoplateau.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Indigo_Plateau"
      ]
    },
    {
      "fromLocation": "Indigo Plateau",
      "toLocation": "Victory Road",
      "hms": [
        {
          "id": "strength",
          "usage": "through"
        }
      ],
      "conditions": [],
      "notes": [
        "Strength is needed on the cave through-route, not in the League lobby."
      ],
      "sources": [
        "https://www.serebii.net/pokearth/kanto/4th/indigoplateau.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Indigo_Plateau",
        "https://www.serebii.net/pokearth/kanto/4th/victoryroad.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Victory_Road_(Kanto)"
      ]
    },
    {
      "fromLocation": "Mt. Silver",
      "toLocation": "Route 28",
      "hms": [],
      "conditions": [],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/mt.silver.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Mt._Silver",
        "https://bulbapedia.bulbagarden.net/wiki/Mt._Silver_Cave",
        "https://www.serebii.net/pokearth/kanto/route28.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Kanto_Route_28"
      ]
    },
    {
      "fromLocation": "Route 26",
      "toLocation": "Route 27",
      "hms": [
        {
          "id": "surf",
          "usage": "passage"
        },
        {
          "id": "waterfall",
          "usage": "passage"
        }
      ],
      "conditions": [],
      "notes": [
        "The League through-route traverses Tohjo Falls; optional whirlpool islands are separate."
      ],
      "sources": [
        "https://www.serebii.net/pokearth/kanto/route26.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Kanto_Route_26",
        "https://www.serebii.net/pokearth/kanto/route27.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Kanto_Route_27"
      ]
    },
    {
      "fromLocation": "Route 26",
      "toLocation": "Pokémon League Reception Gate",
      "hms": [],
      "conditions": [],
      "notes": [
        "The building is reachable from Route 26; the north guard checks eight Johto Badges before Victory Road."
      ],
      "sources": [
        "https://www.serebii.net/pokearth/kanto/route26.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Kanto_Route_26",
        "https://www.serebii.net/pokearth/kanto/4th/route22.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9mon_League_Reception_Gate"
      ]
    },
    {
      "fromLocation": "Route 27",
      "toLocation": "New Bark Town",
      "hms": [
        {
          "id": "surf",
          "usage": "passage"
        }
      ],
      "conditions": [],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/kanto/route27.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Kanto_Route_27",
        "https://www.serebii.net/pokearth/johto/newbarktown.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/New_Bark_Town"
      ]
    },
    {
      "fromLocation": "Route 27",
      "toLocation": "Route 26",
      "hms": [
        {
          "id": "surf",
          "usage": "passage"
        },
        {
          "id": "waterfall",
          "usage": "passage"
        }
      ],
      "conditions": [],
      "notes": [
        "The League through-route traverses Tohjo Falls; optional whirlpool islands are separate."
      ],
      "sources": [
        "https://www.serebii.net/pokearth/kanto/route27.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Kanto_Route_27",
        "https://www.serebii.net/pokearth/kanto/route26.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Kanto_Route_26"
      ]
    },
    {
      "fromLocation": "Route 27",
      "toLocation": "Tohjo Falls",
      "hms": [
        {
          "id": "surf",
          "usage": "through"
        },
        {
          "id": "waterfall",
          "usage": "through"
        }
      ],
      "conditions": [],
      "notes": [
        "Surf reaches the cave approach; Waterfall is needed to pass through the falls, not merely to visit an entrance."
      ],
      "sources": [
        "https://www.serebii.net/pokearth/kanto/route27.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Kanto_Route_27",
        "https://www.serebii.net/pokearth/kanto/tohjofalls.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Tohjo_Falls"
      ]
    },
    {
      "fromLocation": "Route 28",
      "toLocation": "Pokémon League Reception Gate",
      "hms": [],
      "conditions": [],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/kanto/route28.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Kanto_Route_28",
        "https://www.serebii.net/pokearth/kanto/4th/route22.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9mon_League_Reception_Gate"
      ]
    },
    {
      "fromLocation": "Route 28",
      "toLocation": "Mt. Silver",
      "hms": [
        {
          "id": "rock-climb",
          "usage": "optional"
        },
        {
          "id": "surf",
          "usage": "optional"
        },
        {
          "id": "waterfall",
          "usage": "optional"
        }
      ],
      "conditions": [],
      "notes": [
        "This enters the exterior. Rock Climb is needed for the summit/Red route; Surf and Waterfall open separate water branches. The gate to Route 28 already requires Oak’s authorization."
      ],
      "sources": [
        "https://www.serebii.net/pokearth/kanto/route28.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Kanto_Route_28",
        "https://www.serebii.net/pokearth/johto/mt.silver.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Mt._Silver",
        "https://bulbapedia.bulbagarden.net/wiki/Mt._Silver_Cave"
      ]
    },
    {
      "fromLocation": "Tohjo Falls",
      "toLocation": "Route 27",
      "hms": [
        {
          "id": "surf",
          "usage": "through"
        },
        {
          "id": "waterfall",
          "usage": "through"
        }
      ],
      "conditions": [],
      "notes": [
        "Surf reaches the cave approach; Waterfall is needed to pass through the falls, not merely to visit an entrance."
      ],
      "sources": [
        "https://www.serebii.net/pokearth/kanto/tohjofalls.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Tohjo_Falls",
        "https://www.serebii.net/pokearth/kanto/route27.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Kanto_Route_27"
      ]
    },
    {
      "fromLocation": "Pokémon League Reception Gate",
      "toLocation": "Route 26",
      "hms": [],
      "conditions": [],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/kanto/4th/route22.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9mon_League_Reception_Gate",
        "https://www.serebii.net/pokearth/kanto/route26.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Kanto_Route_26"
      ]
    },
    {
      "fromLocation": "Pokémon League Reception Gate",
      "toLocation": "Route 28",
      "hms": [],
      "conditions": [
        "All 16 Badges and Professor Oak’s Mt. Silver authorization open the westward passage."
      ],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/kanto/4th/route22.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9mon_League_Reception_Gate",
        "https://www.serebii.net/pokearth/kanto/route28.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Kanto_Route_28"
      ]
    },
    {
      "fromLocation": "Pokémon League Reception Gate",
      "toLocation": "Victory Road",
      "hms": [
        {
          "id": "strength",
          "usage": "through"
        }
      ],
      "conditions": [
        "All eight Johto Badges are checked by the north guard."
      ],
      "notes": [
        "Strength applies to traversing Victory Road beyond the entrance."
      ],
      "sources": [
        "https://www.serebii.net/pokearth/kanto/4th/route22.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9mon_League_Reception_Gate",
        "https://www.serebii.net/pokearth/kanto/4th/victoryroad.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Victory_Road_(Kanto)"
      ]
    },
    {
      "fromLocation": "Bellchime Trail",
      "toLocation": "Ecruteak City",
      "hms": [],
      "conditions": [],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/bellchimetrail.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Bellchime_Trail",
        "https://www.serebii.net/pokearth/johto/ecruteakcity.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Ecruteak_City"
      ]
    },
    {
      "fromLocation": "Bellchime Trail",
      "toLocation": "Bell Tower",
      "hms": [],
      "conditions": [
        "SoulSilver’s Rainbow Wing, obtained in Pewter City, is required to ascend the tower; no HeartGold Clear Bell is required."
      ],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/bellchimetrail.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Bellchime_Trail",
        "https://www.serebii.net/pokearth/johto/belltower.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Bell_Tower",
        "https://bulbapedia.bulbagarden.net/wiki/Pewter_City"
      ],
      "conditionUsage": "through"
    },
    {
      "fromLocation": "Goldenrod Tunnel",
      "toLocation": "Goldenrod City",
      "hms": [],
      "conditions": [],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/goldenrodunderground.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Goldenrod_Underground",
        "https://www.serebii.net/pokearth/johto/goldenrodcity.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Goldenrod_City"
      ]
    },
    {
      "fromLocation": "Goldenrod Tunnel",
      "toLocation": "Goldenrod Department Store",
      "hms": [],
      "conditions": [
        "Basement keys, switches and the Rocket Director rescue progression gate the warehouse connection."
      ],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/goldenrodunderground.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Goldenrod_Underground",
        "https://www.serebii.net/pokearth/johto/goldenrodcity.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Goldenrod_Department_Store"
      ]
    },
    {
      "fromLocation": "Team Rocket HQ",
      "toLocation": "Mahogany Town",
      "hms": [],
      "conditions": [],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/rockethideout.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Team_Rocket_HQ",
        "https://www.serebii.net/pokearth/johto/mahoganytown.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Mahogany_Town"
      ]
    },
    {
      "fromLocation": "Frontier Access",
      "toLocation": "Route 40",
      "hms": [],
      "conditions": [],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/frontieraccess.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Frontier_Access",
        "https://www.serebii.net/pokearth/johto/route40.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_40"
      ]
    },
    {
      "fromLocation": "Frontier Access",
      "toLocation": "Battle Frontier",
      "hms": [],
      "conditions": [
        "Post-Hall-of-Fame area; each facility has separate entry/battle rules."
      ],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/frontieraccess.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Frontier_Access",
        "https://www.serebii.net/pokearth/johto/battlefrontier.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Battle_Frontier_(Generation_IV)"
      ]
    },
    {
      "fromLocation": "Battle Frontier",
      "toLocation": "Frontier Access",
      "hms": [],
      "conditions": [],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/battlefrontier.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Battle_Frontier_(Generation_IV)",
        "https://www.serebii.net/pokearth/johto/frontieraccess.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Frontier_Access"
      ]
    },
    {
      "fromLocation": "MooMoo Farm",
      "toLocation": "Route 39",
      "hms": [],
      "conditions": [],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/route39.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Moomoo_Farm",
        "https://bulbapedia.bulbagarden.net/wiki/Johto_Route_39"
      ]
    },
    {
      "fromLocation": "Magnet Train Station",
      "toLocation": "Goldenrod City",
      "hms": [],
      "conditions": [],
      "notes": [],
      "sources": [
        "https://www.serebii.net/pokearth/johto/goldenrodcity.shtml",
        "https://bulbapedia.bulbagarden.net/wiki/Magnet_Train",
        "https://bulbapedia.bulbagarden.net/wiki/Goldenrod_City"
      ]
    }
  ]
});
