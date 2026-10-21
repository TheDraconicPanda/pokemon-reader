// Verified HGSS cave warp pairs; source snapshots and image anchors: docs/cave-map-links.json.
export const SOULSILVER_MAP_LINKS = Object.freeze({
  "Whirl Islands": {
    "heading": "Stairs · 1F ↔ B1F",
    "arrivalLabel": "stair",
    "help": "Scroll the map to explore. Matching letters connect the same ladder between 1F and B1F.",
    "pairs": [
      {
        "id": "A",
        "label": "NW ladder",
        "ends": [
          {
            "mapId": "1f-nw",
            "x": 70,
            "y": 72
          },
          {
            "mapId": "b1f",
            "x": 168,
            "y": 110
          }
        ]
      },
      {
        "id": "B",
        "label": "NE · north ladder",
        "ends": [
          {
            "mapId": "1f-ne",
            "x": 375,
            "y": 71
          },
          {
            "mapId": "b1f",
            "x": 968,
            "y": 74
          }
        ]
      },
      {
        "id": "C",
        "label": "NE · south ladder",
        "ends": [
          {
            "mapId": "1f-ne",
            "x": 295,
            "y": 223
          },
          {
            "mapId": "b1f",
            "x": 824,
            "y": 182
          }
        ]
      },
      {
        "id": "D",
        "label": "SW · west ladder",
        "ends": [
          {
            "mapId": "1f-sw",
            "x": 70,
            "y": 86
          },
          {
            "mapId": "b1f",
            "x": 264,
            "y": 650
          }
        ]
      },
      {
        "id": "E",
        "label": "SW · east ladder",
        "ends": [
          {
            "mapId": "1f-sw",
            "x": 406,
            "y": 86
          },
          {
            "mapId": "b1f",
            "x": 536,
            "y": 650
          }
        ]
      },
      {
        "id": "F",
        "label": "SE ladder",
        "ends": [
          {
            "mapId": "1f-se",
            "x": 134,
            "y": 112
          },
          {
            "mapId": "b1f",
            "x": 856,
            "y": 600
          }
        ]
      }
    ]
  },
  "Cliff Cave": {
    "heading": "Stairs & passages",
    "pairs": [
      {
        "id": "A",
        "label": "Upper ladder",
        "ends": [
          {
            "mapId": "1f",
            "x": 86,
            "y": 82
          },
          {
            "mapId": "2f",
            "x": 87,
            "y": 85
          }
        ]
      },
      {
        "id": "B",
        "label": "Lower ladder",
        "ends": [
          {
            "mapId": "1f",
            "x": 151,
            "y": 98
          },
          {
            "mapId": "b1f",
            "x": 103,
            "y": 69
          }
        ]
      }
    ]
  },
  "Union Cave": {
    "heading": "Stairs & passages",
    "pairs": [
      {
        "id": "A",
        "label": "Northwest ladder",
        "ends": [
          {
            "mapId": "1f",
            "x": 70,
            "y": 88
          },
          {
            "mapId": "b1f",
            "x": 503,
            "y": 575
          }
        ]
      },
      {
        "id": "B",
        "label": "Southwest ladder",
        "ends": [
          {
            "mapId": "1f",
            "x": 134,
            "y": 912
          },
          {
            "mapId": "b1f",
            "x": 70,
            "y": 757
          }
        ]
      },
      {
        "id": "C",
        "label": "Lapras chamber passage",
        "ends": [
          {
            "mapId": "b1f",
            "x": 471,
            "y": 721
          },
          {
            "mapId": "b2f",
            "x": 70,
            "y": 89
          }
        ]
      },
      {
        "id": "D",
        "label": "North passage",
        "ends": [
          {
            "mapId": "b1f",
            "x": 70,
            "y": 71
          },
          {
            "mapId": "cave-plan-union-side-passages",
            "x": 684.0,
            "y": 444.0
          }
        ]
      },
      {
        "id": "E",
        "label": "Side passage",
        "ends": [
          {
            "mapId": "b1f",
            "x": 70,
            "y": 185
          },
          {
            "mapId": "cave-plan-union-side-passages",
            "x": 252.0,
            "y": 732.0
          }
        ]
      },
      {
        "id": "F",
        "label": "Eastern Ruins alcove",
        "ends": [
          {
            "mapId": "cave-plan-union-side-passages",
            "x": 516.0,
            "y": 156.0
          },
          {
            "mapId": "cave-plan-union-ruins-exits",
            "x": 684.0,
            "y": 156.0
          }
        ]
      },
      {
        "id": "G",
        "label": "Western Ruins alcove",
        "ends": [
          {
            "mapId": "cave-plan-union-side-passages",
            "x": 84.0,
            "y": 540.0
          },
          {
            "mapId": "cave-plan-union-ruins-exits",
            "x": 156.0,
            "y": 156.0
          }
        ]
      }
    ]
  },
  "Slowpoke Well": {
    "heading": "Stairs & passages",
    "pairs": [
      {
        "id": "A",
        "label": "Entrance passage",
        "ends": [
          {
            "mapId": "entrance",
            "x": 70,
            "y": 192
          },
          {
            "mapId": "b1f",
            "x": 464,
            "y": 402
          }
        ]
      },
      {
        "id": "B",
        "label": "Lower ladder",
        "ends": [
          {
            "mapId": "b1f",
            "x": 224,
            "y": 314
          },
          {
            "mapId": "b2f",
            "x": 252,
            "y": 282
          }
        ]
      }
    ]
  },
  "Mt. Mortar": {
    "heading": "Stairs & passages",
    "pairs": [
      {
        "id": "A",
        "label": "West lower passage",
        "ends": [
          {
            "mapId": "1f-entrance",
            "x": 488,
            "y": 520
          },
          {
            "mapId": "1f-back",
            "x": 312,
            "y": 1040
          }
        ]
      },
      {
        "id": "B",
        "label": "Central lower passage",
        "ends": [
          {
            "mapId": "1f-entrance",
            "x": 840,
            "y": 520
          },
          {
            "mapId": "1f-back",
            "x": 664,
            "y": 1040
          }
        ]
      },
      {
        "id": "C",
        "label": "East lower passage",
        "ends": [
          {
            "mapId": "1f-entrance",
            "x": 1240,
            "y": 478
          },
          {
            "mapId": "1f-back",
            "x": 1064,
            "y": 1000
          }
        ]
      },
      {
        "id": "D",
        "label": "West raised ladder",
        "ends": [
          {
            "mapId": "1f-entrance",
            "x": 359,
            "y": 212
          },
          {
            "mapId": "1f-back",
            "x": 184,
            "y": 748
          }
        ]
      },
      {
        "id": "E",
        "label": "East raised ladder",
        "ends": [
          {
            "mapId": "1f-entrance",
            "x": 1048,
            "y": 224
          },
          {
            "mapId": "1f-back",
            "x": 872,
            "y": 760
          }
        ]
      },
      {
        "id": "F",
        "label": "Above the waterfall",
        "ends": [
          {
            "mapId": "1f-entrance",
            "x": 664,
            "y": 72
          },
          {
            "mapId": "2f",
            "x": 408,
            "y": 635
          }
        ]
      },
      {
        "id": "G",
        "label": "Central basement ladder",
        "ends": [
          {
            "mapId": "1f-entrance",
            "x": 664,
            "y": 686
          },
          {
            "mapId": "b1f",
            "x": 488,
            "y": 813
          }
        ]
      },
      {
        "id": "H",
        "label": "Back cave basement ladder",
        "ends": [
          {
            "mapId": "1f-back",
            "x": 312,
            "y": 459
          },
          {
            "mapId": "b1f",
            "x": 312,
            "y": 63
          }
        ]
      },
      {
        "id": "I",
        "label": "Back cave upper ladder",
        "ends": [
          {
            "mapId": "1f-back",
            "x": 200,
            "y": 124
          },
          {
            "mapId": "2f",
            "x": 120,
            "y": 151
          }
        ]
      }
    ]
  },
  "Ice Path": {
    "heading": "Stairs & passages",
    "pairs": [
      {
        "id": "A",
        "label": "North 1F ladder",
        "ends": [
          {
            "mapId": "1f",
            "x": 816,
            "y": 106
          },
          {
            "mapId": "b1f",
            "x": 120,
            "y": 258
          }
        ]
      },
      {
        "id": "B",
        "label": "South 1F ladder",
        "ends": [
          {
            "mapId": "1f",
            "x": 816,
            "y": 266
          },
          {
            "mapId": "b1f",
            "x": 120,
            "y": 520
          }
        ]
      },
      {
        "id": "C",
        "label": "Boulder puzzle ladder",
        "ends": [
          {
            "mapId": "b1f",
            "x": 424,
            "y": 115
          },
          {
            "mapId": "b2f",
            "x": 408,
            "y": 155
          }
        ]
      },
      {
        "id": "D",
        "label": "East B1F ladder",
        "ends": [
          {
            "mapId": "b1f",
            "x": 456,
            "y": 511
          },
          {
            "mapId": "b2f",
            "x": 680,
            "y": 294
          }
        ]
      },
      {
        "id": "E",
        "label": "West B3F ladder",
        "ends": [
          {
            "mapId": "b2f",
            "x": 248,
            "y": 248
          },
          {
            "mapId": "b3f",
            "x": 104,
            "y": 136
          }
        ]
      },
      {
        "id": "F",
        "label": "East B3F ladder",
        "ends": [
          {
            "mapId": "b2f",
            "x": 792,
            "y": 99
          },
          {
            "mapId": "b3f",
            "x": 408,
            "y": 146
          }
        ]
      }
    ]
  },
  "Victory Road": {
    "heading": "Stairs & passages",
    "pairs": [
      {
        "id": "A",
        "label": "1F ladder",
        "ends": [
          {
            "mapId": "1f",
            "x": 126,
            "y": 103
          },
          {
            "mapId": "2f",
            "x": 148,
            "y": 283
          }
        ]
      },
      {
        "id": "B",
        "label": "South-central ladder",
        "ends": [
          {
            "mapId": "2f",
            "x": 468,
            "y": 418
          },
          {
            "mapId": "3f",
            "x": 416,
            "y": 492
          }
        ]
      },
      {
        "id": "C",
        "label": "Southeast ladder",
        "ends": [
          {
            "mapId": "2f",
            "x": 852,
            "y": 336
          },
          {
            "mapId": "3f",
            "x": 800,
            "y": 420
          }
        ]
      },
      {
        "id": "D",
        "label": "Northeast ladder",
        "ends": [
          {
            "mapId": "2f",
            "x": 932,
            "y": 125
          },
          {
            "mapId": "3f",
            "x": 880,
            "y": 210
          }
        ]
      },
      {
        "id": "E",
        "label": "Northwest ladder",
        "ends": [
          {
            "mapId": "2f",
            "x": 148,
            "y": 76
          },
          {
            "mapId": "3f",
            "x": 96,
            "y": 171
          }
        ]
      }
    ]
  },
  "Mt. Silver": {
    "heading": "Stairs & passages",
    "pairs": [
      {
        "id": "A",
        "label": "Main cave entrance",
        "ends": [
          {
            "mapId": "outside",
            "x": 184,
            "y": 104
          },
          {
            "mapId": "cave-1f",
            "x": 648,
            "y": 832
          }
        ]
      },
      {
        "id": "B",
        "label": "Moltres chamber",
        "ends": [
          {
            "mapId": "cave-1f",
            "x": 248,
            "y": 121
          },
          {
            "mapId": "moltres-chamber",
            "x": 192,
            "y": 316
          }
        ]
      },
      {
        "id": "C",
        "label": "Expert Belt chamber",
        "ends": [
          {
            "mapId": "cave-1f",
            "x": 552,
            "y": 608
          },
          {
            "mapId": "expert-belt-chamber",
            "x": 112,
            "y": 163
          }
        ]
      },
      {
        "id": "D",
        "label": "Lower mountainside · south",
        "ends": [
          {
            "mapId": "cave-1f",
            "x": 830,
            "y": 595
          },
          {
            "mapId": "lower-mountainside",
            "x": 336,
            "y": 466
          }
        ]
      },
      {
        "id": "E",
        "label": "Lower mountainside · middle",
        "ends": [
          {
            "mapId": "cave-1f",
            "x": 862,
            "y": 509
          },
          {
            "mapId": "lower-mountainside",
            "x": 272,
            "y": 388
          }
        ]
      },
      {
        "id": "F",
        "label": "Lower mountainside · north",
        "ends": [
          {
            "mapId": "cave-1f",
            "x": 895,
            "y": 285
          },
          {
            "mapId": "lower-mountainside",
            "x": 208,
            "y": 157
          }
        ]
      },
      {
        "id": "G",
        "label": "Spiral centre passage",
        "ends": [
          {
            "mapId": "cave-1f",
            "x": 520,
            "y": 48
          },
          {
            "mapId": "cave-2f",
            "x": 352,
            "y": 368
          }
        ]
      },
      {
        "id": "H",
        "label": "Upper mountainside · north",
        "ends": [
          {
            "mapId": "cave-2f",
            "x": 352,
            "y": 48
          },
          {
            "mapId": "upper-mountainside",
            "x": 392,
            "y": 282
          }
        ]
      },
      {
        "id": "I",
        "label": "Upper mountainside · northeast",
        "ends": [
          {
            "mapId": "cave-2f",
            "x": 640,
            "y": 138
          },
          {
            "mapId": "upper-mountainside",
            "x": 619,
            "y": 259
          }
        ]
      },
      {
        "id": "J",
        "label": "Upper mountainside · east",
        "ends": [
          {
            "mapId": "cave-2f",
            "x": 640,
            "y": 287
          },
          {
            "mapId": "upper-mountainside",
            "x": 619,
            "y": 407
          }
        ]
      },
      {
        "id": "K",
        "label": "Upper mountainside · southeast",
        "ends": [
          {
            "mapId": "cave-2f",
            "x": 640,
            "y": 438
          },
          {
            "mapId": "upper-mountainside",
            "x": 619,
            "y": 556
          }
        ]
      },
      {
        "id": "L",
        "label": "Upper mountainside · south",
        "ends": [
          {
            "mapId": "cave-2f",
            "x": 576,
            "y": 512
          },
          {
            "mapId": "upper-mountainside",
            "x": 520,
            "y": 659
          }
        ]
      },
      {
        "id": "M",
        "label": "Upper mountainside · southwest",
        "ends": [
          {
            "mapId": "cave-2f",
            "x": 352,
            "y": 512
          },
          {
            "mapId": "upper-mountainside",
            "x": 296,
            "y": 659
          }
        ]
      },
      {
        "id": "N",
        "label": "3F entrance",
        "ends": [
          {
            "mapId": "upper-mountainside",
            "x": 232,
            "y": 451
          },
          {
            "mapId": "cave-3f",
            "x": 576,
            "y": 361
          }
        ]
      },
      {
        "id": "O",
        "label": "Summit passage",
        "ends": [
          {
            "mapId": "cave-3f",
            "x": 240,
            "y": 48
          },
          {
            "mapId": "summit",
            "x": 328,
            "y": 386
          }
        ]
      }
    ]
  },
  "Dark Cave": {
    "heading": "Stairs & passages",
    "pairs": [
      {
        "id": "A",
        "label": "Connecting passage",
        "ends": [
          {
            "mapId": "route-31-route-46-side",
            "x": 456,
            "y": 108
          },
          {
            "mapId": "route-45-side",
            "x": 135,
            "y": 770
          }
        ]
      }
    ]
  },
  "Dragon's Den": {
    "heading": "Stairs & passages",
    "pairs": [
      {
        "id": "A",
        "label": "Entrance ladder",
        "ends": [
          {
            "mapId": "cave-plan-dragons-den-entrance",
            "x": 260.0,
            "y": 180.0
          },
          {
            "mapId": "overview",
            "x": 464,
            "y": 90
          }
        ]
      },
      {
        "id": "B",
        "label": "Dragon Shrine entrance",
        "ends": [
          {
            "mapId": "overview",
            "x": 464,
            "y": 687
          },
          {
            "mapId": "plan-dragons-den-shrine",
            "x": 200,
            "y": 540
          }
        ]
      }
    ]
  },
  "Tohjo Falls": {
    "heading": "Stairs & passages",
    "pairs": [
      {
        "id": "A",
        "label": "Behind the west waterfall",
        "ends": [
          {
            "mapId": "overview",
            "x": 272,
            "y": 245
          },
          {
            "mapId": "cave-plan-tohjo-hidden-room",
            "x": 224.0,
            "y": 324.0
          }
        ]
      }
    ]
  }
});
