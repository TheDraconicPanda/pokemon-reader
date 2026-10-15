// SoulSilver route features checked against the references in docs/atlas-route-audit.json.
export const SOULSILVER_ROUTE_FEATURES = Object.freeze({
  gameId: "soulsilver",
  routes: {
    "Route 26": {
      "items": [
        {
          "name": "Blu Apricorn",
          "location": "North-west of rest stop (daily)",
          "kind": "apricorn"
        },
        {
          "name": "TinyMushroom",
          "location": "North-east of Ace Trainer Jake (hidden)",
          "kind": "item"
        },
        {
          "name": "Max Elixir",
          "location": "On the northern express path after the second ledge",
          "kind": "item"
        }
      ],
      "trainers": [
        "Fisherman Scott",
        "Psychic Vernon",
        "Ace Trainer Joyce",
        "Ace Trainer Gaven",
        "Ace Trainer Jake",
        "Ace Trainer Jamie"
      ],
      "npcs": [
        "A woman in the rest house heals your party for free.",
        "The Week Siblings’ house contains a note listing their locations and visiting days.",
        "Ace Trainers Gaven and Jamie exchange Pokégear numbers after battle.",
        "Cameron takes party photos on Tuesdays and Fridays."
      ],
      "sources": [
        {
          "label": "Route event script",
          "url": "https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/files/fielddata/script/scr_seq/scr_seq_0218_R26.s"
        }
      ]
    },
    "Route 27": {
      "items": [
        {
          "name": "Rare Candy",
          "location": "On a tiny area southeast of the Tohjo Falls (requires Surf)",
          "kind": "item"
        },
        {
          "name": "TM37 (Sandstorm)",
          "location": "From a woman in the house east of the Tohjo Falls if you's lead Pokémon has high enough friendship",
          "kind": "item"
        },
        {
          "name": "Nugget",
          "location": "On a tiny spit of land at the eastern end of the route only accessible from Route 26 (requires Surf) (hidden)",
          "kind": "item"
        },
        {
          "name": "TM02 (Dragon Claw)",
          "location": "On an isolated area of land south of the bridge (requires Surf and Whirlpool)",
          "kind": "item"
        },
        {
          "name": "Destiny Knot",
          "location": "On a ledge northwest of Psychic Eli",
          "kind": "item"
        },
        {
          "name": "Revive",
          "location": "On a ledge northeast of Psychic Eli (hidden)",
          "kind": "item"
        },
        {
          "name": "Big Mushroom",
          "location": "On a rock near the eastern end of the route, above a ledge only accessible from Route 26 (hidden)",
          "kind": "item"
        },
        {
          "name": "Star Piece",
          "location": "Sometimes given by Bird Keeper Jose after you has his phone number",
          "kind": "item"
        }
      ],
      "trainers": [
        "Ace Trainer Megan",
        "Ace Trainer Blake",
        "Bird Keeper Jose",
        "Ace Trainer Brian",
        "Psychic Eli",
        "Ace Trainer Reena"
      ],
      "npcs": [
        "A woman in the house east of Tohjo Falls checks the lead Pokémon’s friendship and gives TM37 (Sandstorm) when it is high enough.",
        "Ace Trainer Reena and Bird Keeper Jose exchange Pokégear numbers; Jose can later offer a Star Piece."
      ],
      "sources": [
        {
          "label": "Route event script",
          "url": "https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/files/fielddata/script/scr_seq/scr_seq_0221_R27.s"
        }
      ]
    },
    "Route 28": {
      "items": [
        {
          "name": "TM47 (Steel Wing)",
          "location": "From the celebrity in her house (requires Cut)",
          "kind": "item"
        },
        {
          "name": "TM35 (Flamethrower)",
          "location": "Just beyond the celebrity's house (requires Cut)",
          "kind": "item"
        },
        {
          "name": "Rare Candy",
          "location": "In the northeast corner (hidden) (requires Cut)",
          "kind": "item"
        }
      ],
      "trainers": [],
      "npcs": [
        "The reclusive celebrity gives TM47 (Steel Wing); Cut is needed to reach her house."
      ],
      "sources": [
        {
          "label": "Route event script",
          "url": "https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/files/fielddata/script/scr_seq/scr_seq_0223_R28.s"
        }
      ]
    },
    "Route 29": {
      "items": [
        {
          "name": "Potion",
          "location": "East of the northeasternmost grass patch",
          "kind": "item"
        },
        {
          "name": "Grn Apricorn",
          "location": "Northwest of the northwesternmost grass patch, on the Apricorn tree on a plateau (requires Apricorn Box) (daily)",
          "kind": "apricorn"
        },
        {
          "name": "Poké Ball ×5",
          "location": "Gift from Lyra/Ethan after teaching you how to catch Pokémon",
          "kind": "item"
        },
        {
          "name": "TwistedSpoon",
          "location": "From Tuscany after earning the Zephyr Badge (Tuesday)",
          "kind": "item"
        },
        {
          "name": "Shock Ribbon",
          "location": "Tuscany on Tuesdays after meeting all seven Week Siblings and receiving her first gift",
          "kind": "item"
        }
      ],
      "trainers": [],
      "npcs": [
        "Lyra/Ethan demonstrates catching Pokémon after the Mystery Egg errand and gives five Poké Balls.",
        "Tuscany appears on Tuesdays after the Zephyr Badge: TwistedSpoon on the first visit; Shock Ribbon on later visits after meeting all seven Week Siblings."
      ],
      "sources": [
        {
          "label": "Route event script",
          "url": "https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/files/fielddata/script/scr_seq/scr_seq_0225_R29.s"
        }
      ]
    },
    "Route 30": {
      "items": [
        {
          "name": "Potion ×2",
          "location": "One beside the eastern entrance path; one hidden in the flower bed east of the Trainer Tips sign",
          "kind": "item"
        },
        {
          "name": "Grn Apricorn",
          "location": "On the Apricorn tree beside the southern house (requires Apricorn Box) (daily)",
          "kind": "apricorn"
        },
        {
          "name": "Apricorn Box",
          "location": "Given by the man in the southern house",
          "kind": "item"
        },
        {
          "name": "Antidote",
          "location": "North of the southern house",
          "kind": "item"
        },
        {
          "name": "Pnk Apricorn",
          "location": "On the Apricorn tree west of Mr. Pokémon's house (daily)",
          "kind": "apricorn"
        },
        {
          "name": "Mystery Egg",
          "location": "Given by Mr. Pokémon in his house",
          "kind": "item"
        },
        {
          "name": "Pokédex",
          "location": "Given by Professor Oak after obtaining the Mystery Egg from Mr. Pokémon",
          "kind": "item"
        },
        {
          "name": "Exp. Share",
          "location": "Given by Mr. Pokémon in exchange for the Red Scale",
          "kind": "item"
        },
        {
          "name": "Red Orb",
          "location": "From Mr. Pokémon after defeating Red and receiving a Kanto starter from Professor Oak (SoulSilver only)",
          "kind": "item"
        },
        {
          "name": "HP Up",
          "location": "Given by Youngster Joey after defeating him in a rematch",
          "kind": "item"
        }
      ],
      "trainers": [
        "Youngster Joey",
        "Youngster Mikey",
        "Bug Catcher Don"
      ],
      "npcs": [
        "The man in the southern house gives the Apricorn Box, needed to collect Apricorns.",
        "Mr. Pokémon gives the Mystery Egg; Professor Oak gives the Pokédex in the same house.",
        "Return the Red Scale to Mr. Pokémon for an Exp. Share. In SoulSilver he later gives the Red Orb after Red has been defeated and Oak has given a Kanto starter.",
        "Youngster Joey exchanges Pokégear numbers and can give HP Up after a rematch."
      ],
      "sources": [
        {
          "label": "Route event script",
          "url": "https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/files/fielddata/script/scr_seq/scr_seq_0227_R30.s"
        }
      ]
    },
    "Route 31": {
      "items": [
        {
          "name": "Potion",
          "location": "West of the entrance to Dark Cave",
          "kind": "item"
        },
        {
          "name": "Blk Apricorn",
          "location": "On the Apricorn tree beside the sleeping man (daily)",
          "kind": "apricorn"
        },
        {
          "name": "Poké Ball",
          "location": "Near Bug Catcher Wade",
          "kind": "item"
        },
        {
          "name": "Vs. Recorder",
          "location": "From Lyra/Ethan in the gate",
          "kind": "item"
        },
        {
          "name": "TM44 (Rest)",
          "location": "From the man standing by the small pond after delivering him a Spearow from his friend on Route 35",
          "kind": "item"
        },
        {
          "name": "Cheri Berry",
          "location": "Sometimes given out if you has his number — Bug Catcher Wade",
          "kind": "item"
        },
        {
          "name": "Chesto Berry",
          "location": "Sometimes given out if you has his number — Bug Catcher Wade",
          "kind": "item"
        },
        {
          "name": "Pecha Berry",
          "location": "Sometimes given out if you has his number — Bug Catcher Wade",
          "kind": "item"
        },
        {
          "name": "Rawst Berry",
          "location": "Sometimes given out if you has his number — Bug Catcher Wade",
          "kind": "item"
        },
        {
          "name": "Aspear Berry",
          "location": "Sometimes given out if you has his number — Bug Catcher Wade",
          "kind": "item"
        },
        {
          "name": "Leppa Berry",
          "location": "Sometimes given out if you has his number — Bug Catcher Wade",
          "kind": "item"
        },
        {
          "name": "Oran Berry",
          "location": "Sometimes given out if you has his number — Bug Catcher Wade",
          "kind": "item"
        },
        {
          "name": "Persim Berry",
          "location": "Sometimes given out if you has his number — Bug Catcher Wade",
          "kind": "item"
        },
        {
          "name": "Sitrus Berry",
          "location": "Sometimes given out if you has his number — Bug Catcher Wade",
          "kind": "item"
        },
        {
          "name": "Lum Berry",
          "location": "Sometimes given out if you has his number — Bug Catcher Wade",
          "kind": "item"
        }
      ],
      "trainers": [
        "Bug Catcher Wade"
      ],
      "npcs": [
        "Lyra/Ethan gives the Vs. Recorder in the Violet City gate.",
        "Deliver the Grass Mail from Webster’s Spearow Kenya (Route 35 gate) to the man by the pond for TM44 (Rest).",
        "Bug Catcher Wade exchanges Pokégear numbers and can offer Berries."
      ],
      "sources": [
        {
          "label": "Route event script",
          "url": "https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/files/fielddata/script/scr_seq/scr_seq_0230_R31.s"
        }
      ]
    },
    "Route 32": {
      "items": [
        {
          "name": "Miracle Seed",
          "location": "From an old man south of Violet City entrance after getting the Zephyr Badge",
          "kind": "item"
        },
        {
          "name": "Great Ball",
          "location": "Southwest of the pier, in a patch of grass",
          "kind": "item"
        },
        {
          "name": "Old Rod",
          "location": "From the Fishing Guru inside the Pokémon Center",
          "kind": "item"
        },
        {
          "name": "Poison Barb",
          "location": "Frieda on Fridays, first gift",
          "kind": "item"
        },
        {
          "name": "TM05 (Roar)",
          "location": "From the man on the ledge on the northern side of the route (requires Cut)",
          "kind": "item"
        },
        {
          "name": "Repel",
          "location": "In the tall grass, west of Picnicker Liz",
          "kind": "item"
        },
        {
          "name": "Super Potion",
          "location": "Next to the trees west of the man who gives TM05 (Roar) (requires Cut) (hidden)",
          "kind": "item"
        },
        {
          "name": "TM09 (Bullet Seed)",
          "location": "On the ledge west of Youngster Gordon",
          "kind": "item"
        },
        {
          "name": "Relax Ribbon",
          "location": "From Frieda if all Week Siblings have been met (Friday)",
          "kind": "item"
        },
        {
          "name": "Shell Bell",
          "location": "Beyond a breakable rock near the Union Cave entrance (requires Rock Smash)",
          "kind": "item"
        },
        {
          "name": "Lure Ball ×2",
          "location": "From a fan of Kurt in the Pokémon Center",
          "kind": "item"
        },
        {
          "name": "Heart Scale",
          "location": "In the small rock in the water to the east of the fishermen, next to the leg of the train bridge (requires Surf) (hidden)",
          "kind": "item"
        },
        {
          "name": "Great Ball",
          "location": "Outside the entrance to Union Cave (hidden)",
          "kind": "item"
        }
      ],
      "trainers": [
        "Youngster Albert",
        "Picnicker Liz",
        "Camper Roland",
        "Fisherman Henry",
        "Fisherman Justin",
        "Fisherman Ralph",
        "Youngster Gordon",
        "Bird Keeper Peter"
      ],
      "npcs": [
        "The man near Violet City gives Miracle Seed after the Zephyr Badge.",
        "The Fishing Guru in the southern Pokémon Center gives the Old Rod; a fan of Kurt gives two Lure Balls.",
        "Frieda visits on Fridays: Poison Barb first, then Relax Ribbon after meeting all seven Week Siblings.",
        "The man beyond the northern Cut tree gives TM05 (Roar). Fisherman Ralph and Picnicker Liz exchange Pokégear numbers.",
        "After the Plain Badge, Cameron takes party photos on Tuesdays, Thursdays and Saturdays."
      ],
      "sources": [
        {
          "label": "Route event script",
          "url": "https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/files/fielddata/script/scr_seq/scr_seq_0232_R32.s"
        }
      ]
    },
    "Route 33": {
      "items": [
        {
          "name": "Blk Apricorn",
          "location": "Right-hand tree just outside of Union Cave (daily)",
          "kind": "apricorn"
        },
        {
          "name": "Pnk Apricorn",
          "location": "Left-hand tree just outside of Union Cave (daily)",
          "kind": "apricorn"
        }
      ],
      "trainers": [
        "Hiker Anthony"
      ],
      "npcs": [
        "Rain is permanent here and affects battles.",
        "Hiker Anthony exchanges Pokégear numbers and can call about Dunsparce outbreaks in Dark Cave; those encounters are in the cave, not on this route."
      ],
      "sources": [
        {
          "label": "Route event script",
          "url": "https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/files/fielddata/script/scr_seq/scr_seq_0236_R33.s"
        }
      ]
    },
    "Route 34": {
      "items": [
        {
          "name": "TM12 (Taunt)",
          "location": "Received from the woman behind the counter in the gate connecting Route 34 with Ilex Forest",
          "kind": "item"
        },
        {
          "name": "Super Potion",
          "location": "In the Headbutt tree in the corner straight east of Youngster Ian (hidden)",
          "kind": "item"
        },
        {
          "name": "TM63 (Embargo)",
          "location": "In the northernmost patch of grass",
          "kind": "item"
        },
        {
          "name": "Nugget",
          "location": "In the fenced area west of Picnicker Gina (requires Surf)",
          "kind": "item"
        },
        {
          "name": "Rare Candy",
          "location": "In the fenced area west of Picnicker Gina, in the upper-left corner of the second tree from the right (requires Surf) (hidden)",
          "kind": "item"
        },
        {
          "name": "Power Herb",
          "location": "Reward for defeating Ace Trainer Kate (requires Surf)",
          "kind": "item"
        },
        {
          "name": "Leaf Stone",
          "location": "Sometimes given out by Picnicker Gina if you has her number",
          "kind": "item"
        },
        {
          "name": "Cheri Berry",
          "location": "Sometimes given out after being defeated in a rematch — Youngster Ian",
          "kind": "item"
        },
        {
          "name": "Chesto Berry",
          "location": "Sometimes given out after being defeated in a rematch — Youngster Ian",
          "kind": "item"
        },
        {
          "name": "Pecha Berry",
          "location": "Sometimes given out after being defeated in a rematch — Youngster Ian",
          "kind": "item"
        },
        {
          "name": "Rawst Berry",
          "location": "Sometimes given out after being defeated in a rematch — Youngster Ian",
          "kind": "item"
        },
        {
          "name": "Leppa Berry",
          "location": "Sometimes given out after being defeated in a rematch — Youngster Ian",
          "kind": "item"
        },
        {
          "name": "Oran Berry",
          "location": "Sometimes given out after being defeated in a rematch — Youngster Ian",
          "kind": "item"
        },
        {
          "name": "Persim Berry",
          "location": "Sometimes given out after being defeated in a rematch — Youngster Ian",
          "kind": "item"
        },
        {
          "name": "Lum Berry",
          "location": "Sometimes given out after being defeated in a rematch — Youngster Ian",
          "kind": "item"
        }
      ],
      "trainers": [
        "Youngster Samuel",
        "Pokéfan Brandon",
        "Picnicker Gina",
        "Youngster Ian",
        "Policeman Keith",
        "Camper Todd",
        "Ace Trainer Irene",
        "Ace Trainer Jenn",
        "Ace Trainer Kate"
      ],
      "npcs": [
        "The Day Care raises up to two Pokémon and can produce Eggs from compatible parents. The backyard is not accessible in HGSS.",
        "Surf reaches the southern Ace Trainer sisters; Irene and Jenn fight together, and Kate gives a Power Herb after victory.",
        "Policeman Keith battles only at night. Picnicker Gina, Youngster Ian and Camper Todd exchange Pokégear numbers.",
        "The woman in the Ilex Forest gate gives TM12 (Taunt), not the Generation II Sweet Scent TM.",
        "After the Plain Badge, Cameron takes a photo with the Day-Care Man on Wednesdays and Thursdays."
      ],
      "sources": [
        {
          "label": "Route event script",
          "url": "https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/files/fielddata/script/scr_seq/scr_seq_0237_R34.s"
        }
      ]
    },
    "Route 35": {
      "items": [
        {
          "name": "Grass Mail",
          "location": "Held by Kenya, a Spearow you can receive from the guard in the southern gate",
          "kind": "item"
        },
        {
          "name": "Grn Apricorn",
          "location": "Across the small pond (requires Surf) (daily)",
          "kind": "apricorn"
        },
        {
          "name": "Nugget",
          "location": "Across the small pond, north of the Apricorn tree (requires Surf) (hidden)",
          "kind": "item"
        },
        {
          "name": "Parlyz Heal",
          "location": "East of Juggler Irwin, surrounded by trees",
          "kind": "item"
        },
        {
          "name": "TM66 (Payback)",
          "location": "In the southern part of the grass patch",
          "kind": "item"
        },
        {
          "name": "HP Up",
          "location": "Given by the guard in the southern gate after delivering the Spearow with its Mail to Route 31",
          "kind": "item"
        }
      ],
      "trainers": [
        "Picnicker Kim",
        "Camper Elliot",
        "Picnicker Brooke",
        "Camper Ivan",
        "Juggler Irwin",
        "Firebreather Walt",
        "Policeman Dirk",
        "Bug Catcher Arnie",
        "Bird Keeper Bryan"
      ],
      "npcs": [
        "Webster in the Goldenrod gate lends the level 20 Spearow Kenya holding Grass Mail for delivery to Route 31; return afterward for HP Up.",
        "Policeman Dirk battles only at night. Juggler Irwin, Bug Catcher Arnie and Firebreather Walt exchange Pokégear numbers.",
        "Bug Catcher Arnie can call about Yanma outbreaks on this route.",
        "Cameron takes party photos on Mondays, Tuesdays and Fridays."
      ],
      "sources": [
        {
          "label": "Route event script",
          "url": "https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/files/fielddata/script/scr_seq/scr_seq_0240_R35.s"
        }
      ]
    },
    "Route 36": {
      "items": [
        {
          "name": "Hard Stone",
          "location": "From Arthur (Thursday)",
          "kind": "item"
        },
        {
          "name": "Careless Ribbon",
          "location": "From Arthur after meeting all the Week Siblings (Thursday)",
          "kind": "item"
        },
        {
          "name": "HM06 (Rock Smash)",
          "location": "From the man east of the Sudowoodo",
          "kind": "item"
        },
        {
          "name": "Blu Apricorn",
          "location": "Next to the National Park gate (daily)",
          "kind": "apricorn"
        },
        {
          "name": "Awakening",
          "location": "In the southwestern tile of the third tree from the left, north of the patch of grass (hidden)",
          "kind": "item"
        },
        {
          "name": "Fire Stone",
          "location": "Sometimes given out by Schoolboy Alan if you has his phone number",
          "kind": "item"
        },
        {
          "name": "Berry Pots",
          "location": "From Floria, after removing Sudowoodo",
          "kind": "item"
        },
        {
          "name": "Oran Berry ×3",
          "location": "From Floria, after removing Sudowoodo",
          "kind": "item"
        },
        {
          "name": "Pecha Berry ×3",
          "location": "From Floria, after removing Sudowoodo",
          "kind": "item"
        },
        {
          "name": "Hyper Potion",
          "location": "Northwest of Sudowoodo, south of the small grove",
          "kind": "item"
        }
      ],
      "trainers": [
        "Psychic Mark",
        "School Kid Alan"
      ],
      "npcs": [
        "Use the SquirtBottle on the blocking Sudowoodo to start its one-time level 20 encounter.",
        "After Sudowoodo is cleared, Floria gives Berry Pots, three Oran Berries and three Pecha Berries.",
        "The man on the eastern side gives HM06 (Rock Smash).",
        "Arthur visits on Thursdays: Hard Stone first, then Careless Ribbon after meeting all seven Week Siblings. School Kid Alan exchanges Pokégear numbers and may give a Fire Stone."
      ],
      "sources": [
        {
          "label": "Route event script",
          "url": "https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/files/fielddata/script/scr_seq/scr_seq_0243_R36.s"
        }
      ]
    },
    "Route 37": {
      "items": [
        {
          "name": "Red Apricorn",
          "location": "Northwestern tree in the clearing (daily)",
          "kind": "apricorn"
        },
        {
          "name": "Blu Apricorn",
          "location": "Northeastern tree in the clearing (daily)",
          "kind": "apricorn"
        },
        {
          "name": "Blk Apricorn",
          "location": "Southern tree in the clearing (daily)",
          "kind": "apricorn"
        },
        {
          "name": "Magnet",
          "location": "From Sunny (Sunday)",
          "kind": "item"
        },
        {
          "name": "Smile Ribbon",
          "location": "From Sunny after having met all the week siblings (Sunday)",
          "kind": "item"
        }
      ],
      "trainers": [
        "Twins Tori & Til",
        "Beauty Callie",
        "Beauty Kassandra",
        "Psychic Greg"
      ],
      "npcs": [
        "Sunny visits on Sundays: Magnet first, then Smile Ribbon after meeting all seven Week Siblings.",
        "Beauty Callie and Beauty Kassandra battle together. The eastern Apricorn clearing is approached from the north because of the ledge."
      ],
      "sources": [
        {
          "label": "Route event script",
          "url": "https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/files/fielddata/script/scr_seq/scr_seq_0246_R37.s"
        }
      ]
    },
    "Route 38": {
      "items": [
        {
          "name": "Wht Apricorn",
          "location": "West of the fenced section on the lower middle path (daily)",
          "kind": "apricorn"
        },
        {
          "name": "Thunderstone",
          "location": "Sometimes given out by Lass Dana if you has her phone number",
          "kind": "item"
        },
        {
          "name": "Max Potion",
          "location": "In the grass along the southern path",
          "kind": "item"
        },
        {
          "name": "Lax Incense",
          "location": "Behind the fence (requires Rock Climb)",
          "kind": "item"
        },
        {
          "name": "HP Up",
          "location": "In white flowers behind the fence (requires Rock Climb) (hidden)",
          "kind": "item"
        }
      ],
      "trainers": [
        "Sailor Harry",
        "Lass Dana",
        "Bird Keeper Toby",
        "School Kid Chad",
        "Beauty Valerie"
      ],
      "npcs": [
        "Lass Dana and School Kid Chad exchange Pokégear numbers. Dana may offer a Thunderstone.",
        "Rock Climb reaches the fenced-off Lax Incense and hidden HP Up.",
        "The special Headbutt tree requires Rock Climb; its species differ from ordinary tree groups."
      ],
      "sources": [
        {
          "label": "Route event script",
          "url": "https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/files/fielddata/script/scr_seq/scr_seq_0247_R38.s"
        }
      ]
    },
    "Route 39": {
      "items": [
        {
          "name": "Grn Apricorn",
          "location": "From the tree next to Moomoo Farm (daily)",
          "kind": "apricorn"
        },
        {
          "name": "Moomoo Milk",
          "location": "Buyable for $500 at the farm after healing Miltank",
          "kind": "item"
        },
        {
          "name": "TM83 (Natural Gift)",
          "location": "From the farmer's wife for healing Miltank",
          "kind": "item"
        },
        {
          "name": "Seal Case",
          "location": "From a girl in the farm for healing Miltank",
          "kind": "item"
        },
        {
          "name": "X Attack",
          "location": "On the clump of grass directly northeast of the two trees in the pasture (hidden)",
          "kind": "item"
        },
        {
          "name": "PP Up",
          "location": "On the clump of grass on the western side of the pasture (hidden)",
          "kind": "item"
        },
        {
          "name": "Nugget",
          "location": "On the southernmost clump of grass on the southern side of the pasture, next to the silo (hidden)",
          "kind": "item"
        },
        {
          "name": "TM60 (Drain Punch)",
          "location": "In the corner west of the silo",
          "kind": "item"
        },
        {
          "name": "Nugget",
          "location": "Sometimes given out by Pokéfan Derek if you has his phone number",
          "kind": "item"
        }
      ],
      "trainers": [
        "Psychic Nelson",
        "Sailor Eugene",
        "Pokéfan Derek",
        "Pokéfan Ruth"
      ],
      "npcs": [
        "Meet Baoba here and exchange phone numbers for the Safari Zone storyline.",
        "MooMoo Farm is beside this route: give the sick Miltank seven Oran Berries to unlock Moomoo Milk sales and the farm’s rewards.",
        "Pokéfan Derek exchanges Pokégear numbers and may offer a Nugget.",
        "Cameron takes party photos on Thursdays and Sundays. After trading Pikachu with Lt. Surge, Surge can pose for a photo on Fridays and Saturdays when he is not waiting for a rematch."
      ],
      "sources": [
        {
          "label": "Route event script",
          "url": "https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/files/fielddata/script/scr_seq/scr_seq_0249_R39.s"
        }
      ]
    },
    "Route 40": {
      "items": [
        {
          "name": "Sharp Beak",
          "location": "From Monica (Monday)",
          "kind": "item"
        },
        {
          "name": "Alert Ribbon",
          "location": "From Monica after meeting all the Week Siblings (Monday)",
          "kind": "item"
        },
        {
          "name": "TM88 (Pluck)",
          "location": "On the sandy patch southeast of Swimmer♀ Elaine (requires Surf)",
          "kind": "item"
        },
        {
          "name": "Hyper Potion",
          "location": "Underneath TM88 (requires Surf) (hidden)",
          "kind": "item"
        }
      ],
      "trainers": [
        "Swimmer Simon",
        "Swimmer Elaine",
        "Swimmer Paula",
        "Swimmer Randall"
      ],
      "npcs": [
        "Monica visits the beach on Mondays: Sharp Beak first, then Alert Ribbon after meeting all seven Week Siblings.",
        "The northern gate leads to Frontier Access and the Battle Frontier; Surf is needed to travel south toward Route 41."
      ],
      "sources": [
        {
          "label": "Route event script",
          "url": "https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/files/fielddata/script/scr_seq/scr_seq_0962_W40.s"
        }
      ]
    },
    "Route 41": {
      "items": [
        {
          "name": "Max Ether",
          "location": "On the beach on the southeast island (requires Whirlpool) (hidden)",
          "kind": "item"
        },
        {
          "name": "Stardust ×4",
          "location": "Hidden on the island beaches: two on the northeast island, one northwest, one southwest (requires Whirlpool)",
          "kind": "item"
        }
      ],
      "trainers": [
        "Swimmer Charlie",
        "Swimmer George",
        "Swimmer Susie",
        "Swimmer Kaylee",
        "Swimmer Matthew",
        "Swimmer Wendy",
        "Swimmer Berke",
        "Swimmer Kara",
        "Swimmer Ronald",
        "Swimmer Denise"
      ],
      "npcs": [
        "Whirlpool gives access to the islands’ beaches and cave entrances; island cave encounters are listed separately under Whirl Islands.",
        "Mantine is a HeartGold encounter here and must not appear in the SoulSilver table."
      ],
      "sources": [
        {
          "label": "Route event script",
          "url": "https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/files/fielddata/script/scr_seq/scr_seq_0964_W41.s"
        }
      ]
    },
    "Route 42": {
      "items": [
        {
          "name": "TM65 (Shadow Claw)",
          "location": "In the indent next to the western entrance to Mt. Mortar",
          "kind": "item"
        },
        {
          "name": "HM04 (Strength)",
          "location": "Given by the Hiker running out of Mt. Mortar",
          "kind": "item"
        },
        {
          "name": "Super Potion",
          "location": "Northeast of the Apricorn grove (requires Surf)",
          "kind": "item"
        },
        {
          "name": "Pnk Apricorn",
          "location": "In the left Apricorn tree in the middle of the route (requires Surf and Cut) (daily)",
          "kind": "apricorn"
        },
        {
          "name": "Grn Apricorn",
          "location": "In the middle Apricorn tree in the middle of the route (requires Surf and Cut) (daily)",
          "kind": "apricorn"
        },
        {
          "name": "Ylw Apricorn",
          "location": "In the right Apricorn tree in the middle of the route (requires Surf and Cut) (daily)",
          "kind": "apricorn"
        },
        {
          "name": "Max Potion",
          "location": "In the small rock on the patch of land south of the eastern pond (requires Surf) (hidden)",
          "kind": "item"
        },
        {
          "name": "Water Stone",
          "location": "Sometimes given out by Fisherman Tully if you has his phone number",
          "kind": "item"
        },
        {
          "name": "Dubious Disc",
          "location": "On the patch of land north of the eastern pond, accessed via the upper exit from Mt. Mortar (requires Rock Climb)",
          "kind": "item"
        }
      ],
      "trainers": [
        "Fisherman Tully",
        "Poké Maniac Shane",
        "Hiker Benjamin"
      ],
      "npcs": [
        "A Hiker emerging from Mt. Mortar gives HM04 (Strength).",
        "Suicune appears near the Apricorn grove and flees when approached; this sighting does not start a catchable battle.",
        "Fisherman Tully exchanges Pokégear numbers and may offer a Water Stone.",
        "The ledge with Dubious Disc is reached through Mt. Mortar using Rock Climb."
      ],
      "sources": [
        {
          "label": "Route event script",
          "url": "https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/files/fielddata/script/scr_seq/scr_seq_0252_R42.s"
        }
      ]
    },
    "Route 43": {
      "items": [
        {
          "name": "Blk Apricorn",
          "location": "From the tree across the big lake (requires Surf and Cut) (daily)",
          "kind": "apricorn"
        },
        {
          "name": "TM36 (Sludge Bomb)",
          "location": "Given by the guard in the toll building after defeating Team Rocket",
          "kind": "item"
        },
        {
          "name": "Max Ether",
          "location": "West of the toll gate",
          "kind": "item"
        },
        {
          "name": "Poké Doll",
          "location": "Sometimes given out by Picnicker Tiffany if you has her phone number",
          "kind": "item"
        }
      ],
      "trainers": [
        "Camper Spencer",
        "Picnicker Tiffany",
        "Poké Maniac Brent",
        "Poké Maniac Beckett",
        "Poké Maniac Ron",
        "Fisherman Marvin"
      ],
      "npcs": [
        "Team Rocket charges ₽1,000 in the eastern gate before its defeat; the grassy western path avoids the toll.",
        "After Team Rocket is defeated, the gate guard gives TM36 (Sludge Bomb).",
        "Picnicker Tiffany and Poké Maniac Brent exchange Pokégear numbers; Tiffany may offer a Poké Doll."
      ],
      "sources": [
        {
          "label": "Route event script",
          "url": "https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/files/fielddata/script/scr_seq/scr_seq_0254_R43.s"
        }
      ]
    },
    "Route 44": {
      "items": [
        {
          "name": "Red Apricorn",
          "location": "Northeast of the Mahogany Town entrance (daily)",
          "kind": "apricorn"
        },
        {
          "name": "Max Repel",
          "location": "Directly east of the Mahogany Town entrance",
          "kind": "item"
        },
        {
          "name": "Max Revive",
          "location": "In the patch of grass in the middle of the lake (requires Surf)",
          "kind": "item"
        },
        {
          "name": "Ultra Ball",
          "location": "Northeast of the ponds",
          "kind": "item"
        },
        {
          "name": "Elixir",
          "location": "At the end of the short dead-end path east of the ponds (hidden)",
          "kind": "item"
        },
        {
          "name": "Carbos",
          "location": "Given by Bird Keeper Vance after defeating him in a rematch",
          "kind": "item"
        },
        {
          "name": "Poké Ball",
          "location": "Sometimes given out if you has his number — Fisherman Wilton",
          "kind": "item"
        },
        {
          "name": "Great Ball",
          "location": "Sometimes given out if you has his number — Fisherman Wilton",
          "kind": "item"
        },
        {
          "name": "Ultra Ball",
          "location": "Sometimes given out if you has his number — Fisherman Wilton",
          "kind": "item"
        }
      ],
      "trainers": [
        "Psychic Phil",
        "Fisherman Edgar",
        "Ace Trainer Cybil",
        "Ace Trainer Allen",
        "Poké Maniac Zach",
        "Fisherman Wilton",
        "Bird Keeper Vance"
      ],
      "npcs": [
        "Access from Mahogany is blocked until Team Rocket is defeated at Goldenrod Radio Tower.",
        "Fisherman Wilton and Bird Keeper Vance exchange Pokégear numbers. Wilton may offer Poké Balls and report Remoraid outbreaks; Vance can give Carbos after a rematch."
      ],
      "sources": [
        {
          "label": "Route event script",
          "url": "https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/files/fielddata/script/scr_seq/scr_seq_0257_R44.s"
        }
      ]
    },
    "Route 45": {
      "items": [
        {
          "name": "Elixir",
          "location": "Left path",
          "kind": "item"
        },
        {
          "name": "Max Potion",
          "location": "Center path",
          "kind": "item"
        },
        {
          "name": "Revive",
          "location": "Left path",
          "kind": "item"
        },
        {
          "name": "Nugget",
          "location": "Left path",
          "kind": "item"
        },
        {
          "name": "Full Heal",
          "location": "Left path",
          "kind": "item"
        },
        {
          "name": "PP Up",
          "location": "East of the grass south of the Nugget (hidden)",
          "kind": "item"
        },
        {
          "name": "Grn Apricorn",
          "location": "Near the pond at the south end of the route (daily)",
          "kind": "apricorn"
        },
        {
          "name": "PP Max",
          "location": "On a ledge at the southern end of the route (requires Rock Climb) (hidden)",
          "kind": "item"
        },
        {
          "name": "PP Up",
          "location": "Given by Blackbelt Kenji after defeating him in a rematch",
          "kind": "item"
        },
        {
          "name": "Iron",
          "location": "Given by Hiker Parry after defeating him in a rematch",
          "kind": "item"
        }
      ],
      "trainers": [
        "Hiker Erik",
        "Ace Trainer Ryan",
        "Ace Trainer Kelly",
        "Hiker Parry",
        "Black Belt Kenji",
        "Hiker Timothy",
        "Hiker Michael"
      ],
      "npcs": [
        "The ledges make the route primarily southbound. The central river is not Surfable; the southern pond is where the water encounters occur.",
        "Hiker Parry and Black Belt Kenji exchange Pokégear numbers; rematch rewards include Iron and PP Up respectively.",
        "Cameron takes party photos on Wednesdays and Saturdays."
      ],
      "sources": [
        {
          "label": "Route event script",
          "url": "https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/files/fielddata/script/scr_seq/scr_seq_0258_R45.s"
        }
      ]
    },
    "Route 46": {
      "items": [
        {
          "name": "Grn Apricorn",
          "location": "West of entrance to Dark Cave (daily)",
          "kind": "apricorn"
        },
        {
          "name": "Ylw Apricorn",
          "location": "West of entrance to Dark Cave (daily)",
          "kind": "apricorn"
        },
        {
          "name": "X Speed",
          "location": "West of Camper Ted",
          "kind": "item"
        },
        {
          "name": "Calcium",
          "location": "Given by Picnicker Erin after defeating her in a rematch",
          "kind": "item"
        }
      ],
      "trainers": [
        "Camper Ted",
        "Picnicker Erin",
        "Hiker Bailey"
      ],
      "npcs": [
        "Only the southern grass is accessible from Route 29 at first. The northern section and Apricorn trees are reached from Route 45 or Dark Cave.",
        "Picnicker Erin exchanges Pokégear numbers and can give Calcium after a rematch."
      ],
      "sources": [
        {
          "label": "Route event script",
          "url": "https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/files/fielddata/script/scr_seq/scr_seq_0259_R46.s"
        }
      ]
    },
    "Route 47": {
      "items": [
        {
          "name": "Revive",
          "location": "Near Camper Grant after first waterfall",
          "kind": "item"
        },
        {
          "name": "Pearl",
          "location": "On the beach between the waterfalls (requires Surf) (hidden)",
          "kind": "item"
        },
        {
          "name": "Lagging Tail",
          "location": "South of Young Couple Duff & Eda",
          "kind": "item"
        },
        {
          "name": "White Flute",
          "location": "West of Young Couple Duff & Eda (requires Surf and Waterfall)",
          "kind": "item"
        },
        {
          "name": "Wave Incense",
          "location": "South of the entrance to the Embedded Tower (requires Surf and Rock Climb)",
          "kind": "item"
        },
        {
          "name": "Stardust",
          "location": "South of the entrance to the Embedded Tower (requires Surf and Rock Climb) (hidden)",
          "kind": "item"
        }
      ],
      "trainers": [
        "Hiker Devin",
        "Camper Grant",
        "Double Team Thom & Kae",
        "Young Couple Duff & Eda"
      ],
      "npcs": [
        "The Safari Zone road opens after the SecretPotion is delivered to Jasmine in the Olivine Lighthouse.",
        "Cliff Cave connects the route’s levels. Surf and Waterfall are needed to reach its tall grass; Rock Climb reaches the Embedded Tower branch and special Headbutt trees.",
        "Crasher Wake visits this route; speaking to him does not start a battle. Chuck can pose for a photo here on Sundays after entering the Hall of Fame, when he is not waiting for a rematch."
      ],
      "sources": [
        {
          "label": "Route event script",
          "url": "https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/files/fielddata/script/scr_seq/scr_seq_0260_R47.s"
        }
      ]
    },
    "Route 48": {
      "items": [
        {
          "name": "Nugget",
          "location": "In the dead end west of the tall grass",
          "kind": "item"
        }
      ],
      "trainers": [],
      "npcs": [
        "The grassy path leads north to Safari Zone Gate; the gate and Safari Zone have their own Atlas entries.",
        "Cameron takes party photos on Fridays and Sundays."
      ],
      "sources": [
        {
          "label": "Route event script",
          "url": "https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/files/fielddata/script/scr_seq/scr_seq_0261_R48.s"
        }
      ]
    },
  }
});
