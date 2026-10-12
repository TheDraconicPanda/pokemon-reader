const LOCATIONS = Object.freeze([
  { name: "New Bark Town", type: "town", region: "Johto", details: "Starting town; home of Professor Elm's laboratory." },
  { name: "Cherrygrove City", type: "town", region: "Johto", details: "Coastal town reached by Route 29." },
  { name: "Violet City", type: "town", region: "Johto", details: "Home of the Violet Gym and Sprout Tower." },
  { name: "Azalea Town", type: "town", region: "Johto", details: "Home of the Azalea Gym and Slowpoke Well." },
  { name: "Goldenrod City", type: "town", region: "Johto", details: "Large city with the Goldenrod Gym, Department Store, and Radio Tower." },
  { name: "Ecruteak City", type: "town", region: "Johto", details: "Home of the Ecruteak Gym and the towers tied to Johto's legends." },
  { name: "Olivine City", type: "town", region: "Johto", details: "Port city with a lighthouse and the Olivine Gym." },
  { name: "Cianwood City", type: "town", region: "Johto", details: "Coastal town reached by crossing the sea west of Olivine." },
  { name: "Mahogany Town", type: "town", region: "Johto", details: "Small town near the Lake of Rage." },
  { name: "Blackthorn City", type: "town", region: "Johto", details: "Northern Johto city with the Blackthorn Gym and Dragon's Den." },
  { name: "Route 29", type: "route", region: "Johto", details: "Connects New Bark Town and Cherrygrove City." },
  { name: "Route 30", type: "route", region: "Johto", details: "North of Cherrygrove City; leads toward Mr. Pokémon's house." },
  { name: "Route 31", type: "route", region: "Johto", details: "Connects Route 30 with Violet City." },
  { name: "Route 32", type: "route", region: "Johto", details: "Runs south from Violet City toward Union Cave." },
  { name: "Route 33", type: "route", region: "Johto", details: "Short route connecting Union Cave and Azalea Town." },
  { name: "Route 34", type: "route", region: "Johto", details: "South of Goldenrod City; the Day Care is along this route." },
  { name: "Route 35", type: "route", region: "Johto", details: "North of Goldenrod City, leading toward the National Park area." },
  { name: "Route 36", type: "route", region: "Johto", details: "Connects the Violet City area with the National Park and Route 37." },
  { name: "Route 37", type: "route", region: "Johto", details: "Wooded route south of Ecruteak City." },
  { name: "Route 38", type: "route", region: "Johto", details: "Connects Ecruteak City and the Olivine area." },
  { name: "Route 39", type: "route", region: "Johto", details: "Runs south toward Olivine City and MooMoo Farm." },
  { name: "Route 40", type: "route", region: "Johto", details: "Sea route west of Olivine City toward Route 41." },
  { name: "Route 41", type: "route", region: "Johto", details: "Sea route surrounding the Whirl Islands." },
  { name: "Route 42", type: "route", region: "Johto", details: "Connects Ecruteak City, Mt. Mortar, and the Mahogany area." },
  { name: "Route 43", type: "route", region: "Johto", details: "Route north from Mahogany Town to the Lake of Rage." },
  { name: "Route 44", type: "route", region: "Johto", details: "Eastern route from Mahogany Town toward Ice Path." },
  { name: "Route 45", type: "route", region: "Johto", details: "Mountain route south of Blackthorn City." },
  { name: "Route 46", type: "route", region: "Johto", details: "Mountain route connecting the Route 29 side of Johto with Route 45." },
  { name: "Route 47", type: "route", region: "Johto", details: "Route added in HeartGold and SoulSilver, leading toward the Safari Zone." },
  { name: "Route 48", type: "route", region: "Johto", details: "Connects Route 47 with the Safari Zone Gate." },
  { name: "Dark Cave", type: "landmark", region: "Johto", details: "Cave system with entrances near Routes 31, 45, and 46." },
  { name: "Sprout Tower", type: "landmark", region: "Johto", details: "Multi-floor tower in Violet City." },
  { name: "Ruins of Alph", type: "landmark", region: "Johto", details: "Ancient ruins with puzzles and Unown." },
  { name: "Union Cave", type: "landmark", region: "Johto", details: "Cave between Route 32 and Route 33." },
  { name: "Slowpoke Well", type: "landmark", region: "Johto", details: "Well in Azalea Town with multiple levels." },
  { name: "Ilex Forest", type: "landmark", region: "Johto", details: "Forest south of Azalea Town." },
  { name: "National Park", type: "landmark", region: "Johto", details: "Park between Routes 35 and 36; hosts the Bug-Catching Contest." },
  { name: "Burned Tower", type: "landmark", region: "Johto", details: "Ruined tower in Ecruteak City." },
  { name: "Bell Tower", type: "landmark", region: "Johto", details: "Tower in Ecruteak City associated with Ho-Oh." },
  { name: "Mt. Mortar", type: "landmark", region: "Johto", details: "Large cave system along Route 42." },
  { name: "Whirl Islands", type: "landmark", region: "Johto", details: "Four islands reached from Route 41." },
  { name: "Lake of Rage", type: "landmark", region: "Johto", details: "Lake north of Mahogany Town." },
  { name: "Ice Path", type: "landmark", region: "Johto", details: "Icy cave route leading to Blackthorn City." },
  { name: "Dragon's Den", type: "landmark", region: "Johto", details: "Sacred dragon location behind Blackthorn City." },
  { name: "Safari Zone", type: "facility", region: "Johto", details: "Safari area west of Cianwood, reached through Routes 47 and 48." },
  { name: "Pokéathlon Dome", type: "facility", region: "Johto", details: "Pokéathlon venue west of the National Park." },
  { name: "Goldenrod Department Store", type: "facility", region: "Johto", details: "Multi-floor shop in Goldenrod City." },
  { name: "Goldenrod Radio Tower", type: "facility", region: "Johto", details: "Broadcasting tower in Goldenrod City." },
  { name: "Olivine Lighthouse", type: "facility", region: "Johto", details: "Lighthouse overlooking Olivine City." },
  { name: "Pokémon Day Care", type: "facility", region: "Johto", details: "Located on Route 34, south of Goldenrod City." },
  { name: "S.S. Aqua", type: "facility", region: "Johto / Kanto connection", details: "Ship connecting Olivine City and Vermilion City after the Johto League." },
  { name: "Victory Road", type: "landmark", region: "Kanto border", details: "Final route through the caves before the Indigo Plateau." },
  { name: "Indigo Plateau", type: "facility", region: "Kanto border", details: "Pokémon League headquarters." },
  { name: "Mt. Silver", type: "landmark", region: "Kanto border", details: "Postgame mountain area west of the Pokémon League." }
]);


const CONNECTIONS = Object.freeze({
  "New Bark Town": ["Route 29"],
  "Cherrygrove City": ["Route 29", "Route 30"],
  "Violet City": ["Route 31", "Route 32", "Route 36"],
  "Azalea Town": ["Route 33", "Ilex Forest", "Slowpoke Well"],
  "Goldenrod City": ["Route 34", "Route 35", "Goldenrod Department Store", "Goldenrod Radio Tower"],
  "Ecruteak City": ["Route 37", "Route 38", "Route 42", "Burned Tower", "Bell Tower"],
  "Olivine City": ["Route 39", "Route 40", "Olivine Lighthouse", "S.S. Aqua"],
  "Cianwood City": ["Route 41", "Route 47"],
  "Mahogany Town": ["Route 42", "Route 43", "Route 44"],
  "Blackthorn City": ["Route 45", "Ice Path", "Dragon's Den"],
  "Route 29": ["New Bark Town", "Cherrygrove City", "Route 46"],
  "Route 30": ["Cherrygrove City", "Route 31", "Ruins of Alph"],
  "Route 31": ["Route 30", "Violet City", "Dark Cave"],
  "Route 32": ["Violet City", "Union Cave", "Ruins of Alph"],
  "Route 33": ["Union Cave", "Azalea Town"],
  "Route 34": ["Goldenrod City", "Pokémon Day Care"],
  "Route 35": ["Goldenrod City", "National Park", "Pokéathlon Dome"],
  "Route 36": ["Violet City", "National Park", "Route 37"],
  "Route 37": ["Route 36", "Ecruteak City"],
  "Route 38": ["Ecruteak City", "Route 39"],
  "Route 39": ["Route 38", "Olivine City"],
  "Route 40": ["Olivine City", "Route 41"],
  "Route 41": ["Route 40", "Whirl Islands", "Cianwood City"],
  "Route 42": ["Ecruteak City", "Mt. Mortar", "Mahogany Town"],
  "Route 43": ["Mahogany Town", "Lake of Rage"],
  "Route 44": ["Mahogany Town", "Ice Path"],
  "Route 45": ["Blackthorn City", "Dark Cave", "Route 46"],
  "Route 46": ["Route 29", "Route 45", "Dark Cave"],
  "Route 47": ["Cianwood City", "Route 48", "Safari Zone"],
  "Route 48": ["Route 47", "Safari Zone"],
  "Dark Cave": ["Route 31", "Route 45", "Route 46"],
  "Sprout Tower": ["Violet City"],
  "Ruins of Alph": ["Route 30", "Route 32"],
  "Union Cave": ["Route 32", "Route 33"],
  "Slowpoke Well": ["Azalea Town"],
  "Ilex Forest": ["Azalea Town"],
  "National Park": ["Route 35", "Route 36", "Pokéathlon Dome"],
  "Burned Tower": ["Ecruteak City"],
  "Bell Tower": ["Ecruteak City"],
  "Mt. Mortar": ["Route 42"],
  "Whirl Islands": ["Route 41"],
  "Lake of Rage": ["Route 43"],
  "Ice Path": ["Route 44", "Blackthorn City"],
  "Dragon's Den": ["Blackthorn City"],
  "Safari Zone": ["Route 47", "Route 48"],
  "Pokéathlon Dome": ["National Park", "Route 35"],
  "Goldenrod Department Store": ["Goldenrod City"],
  "Goldenrod Radio Tower": ["Goldenrod City"],
  "Olivine Lighthouse": ["Olivine City"],
  "Pokémon Day Care": ["Route 34", "Goldenrod City"],
  "S.S. Aqua": ["Olivine City"],
  "Victory Road": ["Indigo Plateau"],
  "Indigo Plateau": ["Victory Road"],
  "Mt. Silver": ["Indigo Plateau"]
});


const ROUTE_32_ENCOUNTERS = Object.freeze([
  { method: "Walking", pokemon: "Rattata", levels: "4–6", times: "Morning", rarity: "Common" },
  { method: "Walking", pokemon: "Rattata", levels: "6", times: "Morning", rarity: "Rare" },
  { method: "Walking", pokemon: "Rattata", levels: "4–6", times: "Day", rarity: "Uncommon" },
  { method: "Walking", pokemon: "Rattata", levels: "4", times: "Night", rarity: "Common" },
  { method: "Walking", pokemon: "Ekans", levels: "4", times: "Morning, day, night", rarity: "Common" },
  { method: "Walking", pokemon: "Bellsprout", levels: "6", times: "Morning, day", rarity: "Common" },
  { method: "Walking", pokemon: "Bellsprout", levels: "6", times: "Night", rarity: "Uncommon" },
  { method: "Walking", pokemon: "Wooper", levels: "6", times: "Night", rarity: "Common" },
  { method: "Walking", pokemon: "Zubat", levels: "4", times: "Morning, night", rarity: "Rare" },
  { method: "Walking", pokemon: "Mareep", levels: "6", times: "Morning, day, night", rarity: "Uncommon" },
  { method: "Walking", pokemon: "Hoppip", levels: "6", times: "Morning, day", rarity: "Uncommon" },
  { method: "Hoenn Sound", pokemon: "Linoone", levels: "6", times: "All times", rarity: "Uncommon" },
  { method: "Hoenn Sound", pokemon: "Whismur", levels: "4–6", times: "All times", rarity: "Uncommon" },
  { method: "Sinnoh Sound", pokemon: "Bidoof", levels: "6", times: "All times", rarity: "Uncommon" },
  { method: "Sinnoh Sound", pokemon: "Buizel", levels: "4–6", times: "All times", rarity: "Uncommon" },
  { method: "Swarm", pokemon: "Qwilfish", levels: "20–40", times: "All times", rarity: "Common" },
  { method: "Surfing", pokemon: "Tentacool", levels: "10–20", times: "All times", rarity: "Common" },
  { method: "Surfing", pokemon: "Quagsire", levels: "15–25", times: "All times", rarity: "Common" },
  { method: "Surfing", pokemon: "Tentacruel", levels: "15–36", times: "All times", rarity: "Uncommon" },
  { method: "Old Rod", pokemon: "Magikarp", levels: "10", times: "All times", rarity: "Common" },
  { method: "Old Rod", pokemon: "Tentacool", levels: "10", times: "All times", rarity: "Rare" },
  { method: "Good Rod", pokemon: "Tentacool", levels: "20", times: "All times", rarity: "Common" },
  { method: "Good Rod", pokemon: "Magikarp", levels: "20", times: "All times", rarity: "Common" },
  { method: "Good Rod", pokemon: "Qwilfish", levels: "20", times: "All times", rarity: "Rare" },
  { method: "Super Rod", pokemon: "Tentacool", levels: "40", times: "All times", rarity: "Common" },
  { method: "Super Rod", pokemon: "Magikarp", levels: "40", times: "All times", rarity: "Rare" },
  { method: "Super Rod", pokemon: "Qwilfish", levels: "40", times: "All times", rarity: "Rare" },
  { method: "Headbutt", pokemon: "Hoothoot", levels: "10", times: "All times", rarity: "Common" },
  { method: "Headbutt", pokemon: "Exeggcute", levels: "10", times: "All times", rarity: "Common" },
  { method: "Headbutt", pokemon: "Ekans", levels: "10", times: "All times", rarity: "Uncommon" },
  { method: "Headbutt", pokemon: "Spearow", levels: "10", times: "All times", rarity: "Common" },
  { method: "Headbutt", pokemon: "Aipom", levels: "10", times: "All times", rarity: "Uncommon" },
  { method: "Headbutt (special trees)", pokemon: "Hoothoot", levels: "10", times: "All times", rarity: "Common" },
  { method: "Headbutt (special trees)", pokemon: "Pineco", levels: "10", times: "All times", rarity: "Common" },
  { method: "Headbutt (special trees)", pokemon: "Exeggcute", levels: "10", times: "All times", rarity: "Common" },
  { method: "Headbutt (special trees)", pokemon: "Spearow", levels: "10", times: "All times", rarity: "Common" },
  { method: "Headbutt (special trees)", pokemon: "Heracross", levels: "10", times: "All times", rarity: "Common" },
  { method: "Headbutt (special trees)", pokemon: "Aipom", levels: "10", times: "All times", rarity: "Uncommon" }
]);

const UNION_CAVE_ENCOUNTERS = Object.freeze([
  { method: "1F · Walking", pokemon: "Geodude", levels: "6", times: "All times", rate: "30%", rarity: "Uncommon" },
  { method: "1F · Walking", pokemon: "Rattata", levels: "4–6", times: "All times", rate: "40%", rarity: "Common" },
  { method: "1F · Walking", pokemon: "Zubat", levels: "5–7", times: "All times", rate: "25%", rarity: "Uncommon" },
  { method: "1F · Walking", pokemon: "Onix", levels: "6", times: "All times", rate: "5%", rarity: "Rare" },
  { method: "1F · Hoenn Sound", pokemon: "Absol", levels: "6", times: "Hoenn Sound", rarity: "Conditional" },
  { method: "1F · Hoenn Sound", pokemon: "Makuhita", levels: "5", times: "Hoenn Sound", rarity: "Conditional" },
  { method: "1F · Sinnoh Sound", pokemon: "Bronzor", levels: "6", times: "Sinnoh Sound", rarity: "Conditional" },
  { method: "1F · Sinnoh Sound", pokemon: "Chingling", levels: "5", times: "Sinnoh Sound", rarity: "Conditional" },
  { method: "1F · Surfing", pokemon: "Wooper", levels: "10–20", times: "All times", rate: "60%", rarity: "Common" },
  { method: "1F · Surfing", pokemon: "Quagsire", levels: "10–25", times: "All times", rate: "40%", rarity: "Common" },
  { method: "1F · Old Rod", pokemon: "Magikarp", levels: "10", times: "All times", rate: "95%", rarity: "Common" },
  { method: "1F · Old Rod", pokemon: "Goldeen", levels: "10", times: "All times", rate: "5%", rarity: "Rare" },
  { method: "1F · Good Rod", pokemon: "Magikarp", levels: "20", times: "All times", rate: "60%", rarity: "Common" },
  { method: "1F · Good Rod", pokemon: "Goldeen", levels: "20", times: "All times", rate: "40%", rarity: "Common" },
  { method: "1F · Super Rod", pokemon: "Goldeen", levels: "40", times: "All times", rate: "90%", rarity: "Common" },
  { method: "1F · Super Rod", pokemon: "Magikarp", levels: "40", times: "All times", rate: "7%", rarity: "Rare" },
  { method: "1F · Super Rod", pokemon: "Seaking", levels: "40", times: "All times", rate: "3%", rarity: "Rare" },
  { method: "B1F · Walking", pokemon: "Geodude", levels: "8", times: "All times", rate: "30%", rarity: "Uncommon" },
  { method: "B1F · Walking", pokemon: "Rattata", levels: "6–8", times: "All times", rate: "35%", rarity: "Uncommon" },
  { method: "B1F · Walking", pokemon: "Zubat", levels: "7–9", times: "All times", rate: "25%", rarity: "Uncommon" },
  { method: "B1F · Walking", pokemon: "Onix", levels: "8", times: "All times", rate: "10%", rarity: "Uncommon" },
  { method: "B1F · Hoenn Sound", pokemon: "Absol", levels: "8", times: "Hoenn Sound", rarity: "Conditional" },
  { method: "B1F · Hoenn Sound", pokemon: "Makuhita", levels: "7", times: "Hoenn Sound", rarity: "Conditional" },
  { method: "B1F · Sinnoh Sound", pokemon: "Bronzor", levels: "8", times: "Sinnoh Sound", rarity: "Conditional" },
  { method: "B1F · Sinnoh Sound", pokemon: "Chingling", levels: "7", times: "Sinnoh Sound", rarity: "Conditional" },
  { method: "B1F · Surfing", pokemon: "Wooper", levels: "10–20", times: "All times", rate: "60%", rarity: "Common" },
  { method: "B1F · Surfing", pokemon: "Quagsire", levels: "10–25", times: "All times", rate: "40%", rarity: "Common" },
  { method: "B1F · Old Rod", pokemon: "Magikarp", levels: "10", times: "All times", rate: "95%", rarity: "Common" },
  { method: "B1F · Old Rod", pokemon: "Goldeen", levels: "10", times: "All times", rate: "5%", rarity: "Rare" },
  { method: "B1F · Good Rod", pokemon: "Magikarp", levels: "20", times: "All times", rate: "60%", rarity: "Common" },
  { method: "B1F · Good Rod", pokemon: "Goldeen", levels: "20", times: "All times", rate: "40%", rarity: "Common" },
  { method: "B1F · Super Rod", pokemon: "Goldeen", levels: "40", times: "All times", rate: "90%", rarity: "Common" },
  { method: "B1F · Super Rod", pokemon: "Magikarp", levels: "40", times: "All times", rate: "7%", rarity: "Rare" },
  { method: "B1F · Super Rod", pokemon: "Seaking", levels: "40", times: "All times", rate: "3%", rarity: "Rare" },
  { method: "B2F · Walking", pokemon: "Zubat", levels: "22", times: "All times", rate: "30%", rarity: "Uncommon" },
  { method: "B2F · Walking", pokemon: "Raticate", levels: "22", times: "All times", rate: "30%", rarity: "Uncommon" },
  { method: "B2F · Walking", pokemon: "Golbat", levels: "22", times: "All times", rate: "20%", rarity: "Uncommon" },
  { method: "B2F · Walking", pokemon: "Geodude", levels: "21", times: "All times", rate: "10%", rarity: "Uncommon" },
  { method: "B2F · Walking", pokemon: "Rattata", levels: "20", times: "All times", rate: "5%", rarity: "Rare" },
  { method: "B2F · Walking", pokemon: "Onix", levels: "23", times: "All times", rate: "5%", rarity: "Rare" },
  { method: "B2F · Hoenn Sound", pokemon: "Absol", levels: "22", times: "Hoenn Sound", rarity: "Conditional" },
  { method: "B2F · Hoenn Sound", pokemon: "Makuhita", levels: "22", times: "Hoenn Sound", rarity: "Conditional" },
  { method: "B2F · Sinnoh Sound", pokemon: "Bronzor", levels: "22", times: "Sinnoh Sound", rarity: "Conditional" },
  { method: "B2F · Sinnoh Sound", pokemon: "Chingling", levels: "22", times: "Sinnoh Sound", rarity: "Conditional" },
  { method: "B2F · Surfing", pokemon: "Tentacool", levels: "10–20", times: "All times", rate: "60%", rarity: "Common" },
  { method: "B2F · Surfing", pokemon: "Quagsire", levels: "15–25", times: "All times", rate: "30%", rarity: "Uncommon" },
  { method: "B2F · Surfing", pokemon: "Tentacruel", levels: "15–25", times: "All times", rate: "10%", rarity: "Uncommon" },
  { method: "B2F · Old Rod", pokemon: "Magikarp", levels: "10", times: "All times", rate: "95%", rarity: "Common" },
  { method: "B2F · Old Rod", pokemon: "Krabby", levels: "10", times: "All times", rate: "5%", rarity: "Rare" },
  { method: "B2F · Good Rod (morning/day)", pokemon: "Magikarp", levels: "25", times: "Morning, day", rate: "60%", rarity: "Common" },
  { method: "B2F · Good Rod (morning/day)", pokemon: "Krabby", levels: "25", times: "Morning, day", rate: "37%", rarity: "Uncommon" },
  { method: "B2F · Good Rod (morning/day)", pokemon: "Corsola", levels: "25", times: "Morning, day", rate: "3%", rarity: "Rare" },
  { method: "B2F · Good Rod (night)", pokemon: "Magikarp", levels: "25", times: "Night", rate: "60%", rarity: "Common" },
  { method: "B2F · Good Rod (night)", pokemon: "Krabby", levels: "25", times: "Night", rate: "37%", rarity: "Uncommon" },
  { method: "B2F · Good Rod (night)", pokemon: "Staryu", levels: "25", times: "Night", rate: "3%", rarity: "Rare" },
  { method: "B2F · Super Rod (morning/day)", pokemon: "Krabby", levels: "40", times: "Morning, day", rate: "67%", rarity: "Common" },
  { method: "B2F · Super Rod (morning/day)", pokemon: "Corsola", levels: "40", times: "Morning, day", rate: "30%", rarity: "Uncommon" },
  { method: "B2F · Super Rod (morning/day)", pokemon: "Kingler", levels: "40", times: "Morning, day", rate: "3%", rarity: "Rare" },
  { method: "B2F · Super Rod (night)", pokemon: "Krabby", levels: "40", times: "Night", rate: "67%", rarity: "Common" },
  { method: "B2F · Super Rod (night)", pokemon: "Staryu", levels: "40", times: "Night", rate: "30%", rarity: "Uncommon" },
  { method: "B2F · Super Rod (night)", pokemon: "Kingler", levels: "40", times: "Night", rate: "3%", rarity: "Rare" },
  { method: "B2F · Friday encounter", pokemon: "Lapras", levels: "20", times: "Friday, interact", rate: "Limited", rarity: "Limited" },
]);

const ROUTE_33_ENCOUNTERS = Object.freeze([
  { method: "Walking · Morning", pokemon: "Hoppip", levels: "6–8", times: "Morning", rate: "35%", rarity: "Common" },
  { method: "Walking · Morning", pokemon: "Ekans", levels: "7", times: "Morning", rate: "30%", rarity: "Common" },
  { method: "Walking · Morning", pokemon: "Spearow", levels: "6", times: "Morning", rate: "20%", rarity: "Common" },
  { method: "Walking · Morning", pokemon: "Rattata", levels: "6", times: "Morning", rate: "10%", rarity: "Uncommon" },
  { method: "Walking · Morning", pokemon: "Zubat", levels: "4", times: "Morning", rate: "5%", rarity: "Rare" },
  { method: "Walking · Day", pokemon: "Hoppip", levels: "6–8", times: "Day", rate: "35%", rarity: "Common" },
  { method: "Walking · Day", pokemon: "Ekans", levels: "7", times: "Day", rate: "30%", rarity: "Common" },
  { method: "Walking · Day", pokemon: "Spearow", levels: "6", times: "Day", rate: "20%", rarity: "Common" },
  { method: "Walking · Day", pokemon: "Rattata", levels: "4–6", times: "Day", rate: "15%", rarity: "Uncommon" },
  { method: "Walking · Night", pokemon: "Rattata", levels: "6", times: "Night", rate: "30%", rarity: "Common" },
  { method: "Walking · Night", pokemon: "Zubat", levels: "4–8", times: "Night", rate: "40%", rarity: "Common" },
  { method: "Hoenn Sound", pokemon: "Plusle", levels: "6–7", times: "Hoenn Sound", rate: "20%", rarity: "Uncommon" },
  { method: "Hoenn Sound", pokemon: "Minun", levels: "6", times: "Hoenn Sound", rate: "20%", rarity: "Uncommon" },
  { method: "Sinnoh Sound", pokemon: "Shinx", levels: "6–7", times: "Sinnoh Sound", rate: "40%", rarity: "Uncommon" },
  { method: "Headbutt · Group A", pokemon: "Spearow", levels: "3–5", times: "All times", rate: "50%", rarity: "Common" },
  { method: "Headbutt · Group A", pokemon: "Aipom", levels: "3–5", times: "All times", rate: "20%", rarity: "Uncommon" },
  { method: "Headbutt · Group A", pokemon: "Heracross", levels: "3–5", times: "All times", rate: "30%", rarity: "Uncommon" },
  { method: "Headbutt · Group B", pokemon: "Spearow", levels: "6–8", times: "All times", rate: "80%", rarity: "Common" },
  { method: "Headbutt · Group B", pokemon: "Aipom", levels: "6–8", times: "All times", rate: "20%", rarity: "Uncommon" }
]);


const AZALEA_TOWN_ENCOUNTERS = Object.freeze([
  { method: "Headbutt · Group A", pokemon: "Spearow", levels: "—", times: "All times", rate: "Not listed", rarity: "Common" },
  { method: "Headbutt · Group A", pokemon: "Aipom", levels: "—", times: "All times", rate: "Not listed", rarity: "Uncommon" },
  { method: "Headbutt · Group A", pokemon: "Heracross", levels: "—", times: "All times", rate: "Not listed", rarity: "Uncommon" }
]);

function renderEncounters(locationName) {
  const encounters = locationName === "Route 32" ? ROUTE_32_ENCOUNTERS : locationName === "Union Cave" ? UNION_CAVE_ENCOUNTERS : locationName === "Route 33" ? ROUTE_33_ENCOUNTERS : locationName === "Azalea Town" ? AZALEA_TOWN_ENCOUNTERS : null;
  if (!encounters) return null;
  const section = document.createElement("section");
  section.className = "location-encounters";
  const heading = document.createElement("strong");
  heading.textContent = "Wild Pokémon · SoulSilver";
  const note = document.createElement("p");
  note.className = "encounter-note";
  note.textContent = locationName === "Union Cave" ? "Encounter tables are separated by floor (1F, B1F, B2F). Percentages are shown where listed by the reference; Radio encounters require the matching broadcast, and Lapras appears as a special Friday encounter on B2F." : locationName === "Route 33" ? "Route 33 is a short, rainy route. Walking encounters vary by time of day; Radio encounters require the matching broadcast, and Headbutt encounters vary by tree group." : locationName === "Azalea Town" ? "Headbutt encounters are listed for SoulSilver; the reference does not provide exact rates or levels for these tree encounters." : "Rarity labels are shown instead of percentages where the reference lists categories rather than exact rates. Sound-based encounters require the matching radio broadcast; swarm encounters are conditional.";
  section.append(heading, note);

  const methods = [...new Set(encounters.map((entry) => entry.method))];
  for (const method of methods) {
    const group = document.createElement("div");
    group.className = "encounter-method";
    const methodHeading = document.createElement("h3");
    methodHeading.textContent = method;
    const entries = document.createElement("div");
    entries.className = "encounter-entries";
    for (const encounter of encounters.filter((entry) => entry.method === method)) {
      const row = document.createElement("div");
      row.className = "encounter-entry";
      const name = document.createElement("span");
      name.className = "encounter-name";
      name.textContent = encounter.pokemon;
      const info = document.createElement("span");
      info.className = "encounter-info";
      info.textContent = `Lv. ${encounter.levels} · ${encounter.times}${encounter.rate ? ` · ${encounter.rate}` : ` · ${encounter.rarity}`}`;
      row.append(name, info);
      entries.append(row);
    }
    group.append(methodHeading, entries);
    section.append(group);
  }
  return section;
}

const searchInput = document.querySelector("#location-search");
const typeSelect = document.querySelector("#location-type");
const countLabel = document.querySelector("#location-count");
const list = document.querySelector("#location-list");
const emptyMessage = document.querySelector("#empty-message");

const TYPE_LABELS = Object.freeze({
  town: "Town / city",
  route: "Route",
  landmark: "Landmark",
  facility: "Facility"
});

function renderLocations() {
  const query = searchInput.value.trim().toLowerCase();
  const selectedType = typeSelect.value;
  const matches = LOCATIONS.filter((location) => {
    const matchesType = selectedType === "all" || location.type === selectedType;
    const searchable = `${location.name} ${location.region} ${location.details} ${TYPE_LABELS[location.type]}`.toLowerCase();
    return matchesType && searchable.includes(query);
  });

  countLabel.textContent = `${matches.length} of ${LOCATIONS.length} locations`;
  list.replaceChildren();

  for (const location of matches) {
    const card = document.createElement("article");
    card.className = "location-card";

    const text = document.createElement("div");
    const heading = document.createElement("h2");
    heading.textContent = location.name;
    const details = document.createElement("p");
    details.textContent = `${location.region} · ${location.details}`;
    text.append(heading, details);

    const badge = document.createElement("span");
    badge.className = "location-type";
    badge.textContent = TYPE_LABELS[location.type];

    card.append(text, badge);

    const encounterSection = renderEncounters(location.name);
    if (encounterSection) card.append(encounterSection);

    const connectedNames = (CONNECTIONS[location.name] || []).filter((name) =>
      LOCATIONS.some((candidate) => candidate.name === name)
    );
    if (connectedNames.length) {
      const connections = document.createElement("div");
      connections.className = "location-connections";
      const label = document.createElement("strong");
      label.textContent = "Connected locations";
      const links = document.createElement("div");
      links.className = "connection-links";
      for (const name of connectedNames) {
        const link = document.createElement("button");
        link.type = "button";
        link.className = "connection-link";
        link.textContent = name;
        link.addEventListener("click", () => {
          searchInput.value = name;
          typeSelect.value = "all";
          renderLocations();
        });
        links.append(link);
      }
      connections.append(label, links);
      card.append(connections);
    }

    list.append(card);
  }

  emptyMessage.hidden = matches.length !== 0;
}

searchInput.addEventListener("input", renderLocations);
typeSelect.addEventListener("change", renderLocations);
renderLocations();
