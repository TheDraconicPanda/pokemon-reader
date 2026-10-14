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
  { name: "Cliff Edge Gate", type: "landmark", region: "Johto", details: "Cave passage between Cianwood City and Route 47, with a small Rock Climb-accessible lake." },
  { name: "Cliff Cave", type: "landmark", region: "Johto", details: "Small multi-level cave connecting the different cliff levels of Route 47." },
  { name: "Embedded Tower", type: "landmark", region: "Johto", details: "Ancient tower on Route 47 tied to the legendary Pokémon Groudon and Rayquaza in SoulSilver." },
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
  "Route 47": ["Cliff Edge Gate", "Cliff Cave", "Embedded Tower", "Route 48", "Safari Zone"],
  "Route 48": ["Route 47", "Safari Zone"],
  "Cliff Edge Gate": ["Cianwood City", "Route 47"],
  "Cliff Cave": ["Route 47"],
  "Embedded Tower": ["Route 47"],
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


const ROUTE_34_ENCOUNTERS = Object.freeze([
  { method: "Walking", pokemon: "Rattata", levels: "11–13", times: "Morning, day, night", rate: "35%", rarity: "Common" },
  { method: "Walking", pokemon: "Drowzee", levels: "10–12", times: "Morning, day, night", rate: "50%", rarity: "Common" },
  { method: "Walking", pokemon: "Abra", levels: "10", times: "Morning, day, night", rate: "10%", rarity: "Uncommon" },
  { method: "Walking", pokemon: "Ditto", levels: "10", times: "Morning, day, night", rate: "5%", rarity: "Rare" },
  { method: "Surfing", pokemon: "Tentacool", levels: "10–25", times: "All times", rate: "90%", rarity: "Common" },
  { method: "Surfing", pokemon: "Tentacruel", levels: "15–29", times: "All times", rate: "10%", rarity: "Uncommon" },
  { method: "Old Rod", pokemon: "Magikarp", levels: "10", times: "All times", rate: "85%", rarity: "Common" },
  { method: "Old Rod", pokemon: "Krabby", levels: "10", times: "All times", rate: "15%", rarity: "Uncommon" },
  { method: "Good Rod · Morning/Day", pokemon: "Magikarp", levels: "20", times: "Morning, day", rate: "60%", rarity: "Common" },
  { method: "Good Rod · Morning/Day", pokemon: "Krabby", levels: "20", times: "Morning, day", rate: "37%", rarity: "Common" },
  { method: "Good Rod · Morning/Day", pokemon: "Corsola", levels: "20", times: "Morning, day", rate: "3%", rarity: "Rare" },
  { method: "Good Rod · Night", pokemon: "Magikarp", levels: "20", times: "Night", rate: "60%", rarity: "Common" },
  { method: "Good Rod · Night", pokemon: "Krabby", levels: "20", times: "Night", rate: "37%", rarity: "Common" },
  { method: "Good Rod · Night", pokemon: "Staryu", levels: "20", times: "Night", rate: "3%", rarity: "Rare" },
  { method: "Super Rod · Morning/Day", pokemon: "Krabby", levels: "40", times: "Morning, day", rate: "67%", rarity: "Common" },
  { method: "Super Rod · Morning/Day", pokemon: "Corsola", levels: "40", times: "Morning, day", rate: "30%", rarity: "Common" },
  { method: "Super Rod · Morning/Day", pokemon: "Kingler", levels: "40", times: "Morning, day", rate: "3%", rarity: "Rare" },
  { method: "Super Rod · Night", pokemon: "Krabby", levels: "40", times: "Night", rate: "67%", rarity: "Common" },
  { method: "Super Rod · Night", pokemon: "Staryu", levels: "40", times: "Night", rate: "30%", rarity: "Common" },
  { method: "Super Rod · Night", pokemon: "Kingler", levels: "40", times: "Night", rate: "3%", rarity: "Rare" },
  { method: "Headbutt", pokemon: "Hoothoot", levels: "9–12", times: "All times", rate: "50%", rarity: "Common" },
  { method: "Headbutt", pokemon: "Exeggcute", levels: "9–12", times: "All times", rate: "20%", rarity: "Uncommon" },
  { method: "Headbutt", pokemon: "Ledyba", levels: "11–12", times: "All times", rate: "20%", rarity: "Uncommon" },
  { method: "Headbutt", pokemon: "Pineco", levels: "9–10", times: "All times", rate: "10%", rarity: "Rare" },
  { method: "Hoenn Sound", pokemon: "Linoone", levels: "12", times: "Radio broadcast", rate: "20%", rarity: "Uncommon" },
  { method: "Hoenn Sound", pokemon: "Whismur", levels: "10–11", times: "Radio broadcast", rate: "20%", rarity: "Uncommon" },
  { method: "Sinnoh Sound", pokemon: "Bidoof", levels: "12", times: "Radio broadcast", rate: "20%", rarity: "Uncommon" },
  { method: "Sinnoh Sound", pokemon: "Buizel", levels: "10–11", times: "Radio broadcast", rate: "20%", rarity: "Uncommon" },
  { method: "Swarm", pokemon: "Ralts", levels: "10–11", times: "Swarm active", rate: "40%", rarity: "Uncommon" }
]);

const ROUTE_35_ENCOUNTERS = Object.freeze([
  { method: "Walking · Morning/Day", pokemon: "Nidoran♀", levels: "12", times: "Morning, day", rate: "30%", rarity: "Common" },
  { method: "Walking · Morning/Day", pokemon: "Nidoran♂", levels: "12", times: "Morning, day", rate: "30%", rarity: "Common" },
  { method: "Walking · Morning/Day", pokemon: "Drowzee", levels: "14", times: "Morning, day", rate: "20%", rarity: "Common" },
  { method: "Walking · Morning/Day", pokemon: "Abra", levels: "10", times: "Morning, day, night", rate: "10%", rarity: "Uncommon" },
  { method: "Walking · Morning/Day", pokemon: "Pidgey", levels: "14", times: "Morning, day", rate: "5%", rarity: "Rare" },
  { method: "Walking · Morning/Day", pokemon: "Ditto", levels: "10", times: "Morning, day, night", rate: "4%", rarity: "Rare" },
  { method: "Walking · Morning/Day", pokemon: "Yanma", levels: "12", times: "Morning, day, night", rate: "1%", rarity: "Rare" },
  { method: "Walking · Night", pokemon: "Nidoran♀", levels: "12", times: "Night", rate: "30%", rarity: "Common" },
  { method: "Walking · Night", pokemon: "Nidoran♂", levels: "12", times: "Night", rate: "30%", rarity: "Common" },
  { method: "Walking · Night", pokemon: "Drowzee", levels: "14", times: "Night", rate: "20%", rarity: "Common" },
  { method: "Walking · Night", pokemon: "Abra", levels: "10", times: "Night", rate: "10%", rarity: "Uncommon" },
  { method: "Walking · Night", pokemon: "Hoothoot", levels: "14", times: "Night", rate: "5%", rarity: "Rare" },
  { method: "Walking · Night", pokemon: "Ditto", levels: "10", times: "Night", rate: "4%", rarity: "Rare" },
  { method: "Walking · Night", pokemon: "Yanma", levels: "12", times: "Night", rate: "1%", rarity: "Rare" },
  { method: "Surfing", pokemon: "Psyduck", levels: "10–25", times: "All times", rate: "90%", rarity: "Common" },
  { method: "Surfing", pokemon: "Golduck", levels: "15–31", times: "All times", rate: "10%", rarity: "Uncommon" },
  { method: "Old Rod", pokemon: "Magikarp", levels: "10", times: "All times", rate: "85%", rarity: "Common" },
  { method: "Old Rod", pokemon: "Poliwag", levels: "10", times: "All times", rate: "15%", rarity: "Uncommon" },
  { method: "Good Rod", pokemon: "Magikarp", levels: "20", times: "All times", rate: "60%", rarity: "Common" },
  { method: "Good Rod", pokemon: "Poliwag", levels: "20", times: "All times", rate: "40%", rarity: "Common" },
  { method: "Super Rod", pokemon: "Magikarp", levels: "40", times: "All times", rate: "20%", rarity: "Uncommon" },
  { method: "Super Rod", pokemon: "Poliwag", levels: "40", times: "All times", rate: "80%", rarity: "Common" },
  { method: "Headbutt · Group A", pokemon: "Hoothoot", levels: "9–10", times: "All times", rate: "50%", rarity: "Common" },
  { method: "Headbutt · Group A", pokemon: "Pineco", levels: "9–10", times: "All times", rate: "30%", rarity: "Uncommon" },
  { method: "Headbutt · Group A", pokemon: "Exeggcute", levels: "9–10", times: "All times", rate: "20%", rarity: "Uncommon" },
  { method: "Headbutt · Group B", pokemon: "Hoothoot", levels: "10–11", times: "All times", rate: "50%", rarity: "Common" },
  { method: "Headbutt · Group B", pokemon: "Ledyba", levels: "13–14", times: "All times", rate: "30%", rarity: "Uncommon" },
  { method: "Headbutt · Group B", pokemon: "Exeggcute", levels: "10–11", times: "All times", rate: "20%", rarity: "Uncommon" },
  { method: "Hoenn Sound", pokemon: "Linoone", levels: "14", times: "Radio broadcast", rate: "20%", rarity: "Uncommon" },
  { method: "Hoenn Sound", pokemon: "Whismur", levels: "12", times: "Radio broadcast", rate: "20%", rarity: "Uncommon" },
  { method: "Sinnoh Sound", pokemon: "Bidoof", levels: "14", times: "Radio broadcast", rate: "20%", rarity: "Uncommon" },
  { method: "Sinnoh Sound", pokemon: "Buizel", levels: "12", times: "Radio broadcast", rate: "20%", rarity: "Uncommon" },
  { method: "Swarm", pokemon: "Yanma", levels: "12", times: "Swarm active", rate: "40%", rarity: "Conditional" }
]);

const ROUTE_36_ENCOUNTERS = Object.freeze([
  { method: "Walking · Morning", pokemon: "Nidoran♀", levels: "12–13", times: "Morning", rate: "30%", rarity: "Common" },
  { method: "Walking · Morning", pokemon: "Nidoran♂", levels: "12–13", times: "Morning", rate: "30%", rarity: "Common" },
  { method: "Walking · Morning", pokemon: "Pidgey", levels: "12–15", times: "Morning", rate: "25%", rarity: "Common" },
  { method: "Walking · Morning", pokemon: "Vulpix", levels: "13", times: "Morning", rate: "10%", rarity: "Uncommon" },
  { method: "Walking · Morning", pokemon: "Stantler", levels: "13", times: "Morning", rate: "5%", rarity: "Rare" },
  { method: "Walking · Day", pokemon: "Nidoran♀", levels: "12–13", times: "Day", rate: "30%", rarity: "Common" },
  { method: "Walking · Day", pokemon: "Nidoran♂", levels: "12–13", times: "Day", rate: "30%", rarity: "Common" },
  { method: "Walking · Day", pokemon: "Pidgey", levels: "12–13", times: "Day", rate: "20%", rarity: "Common" },
  { method: "Walking · Day", pokemon: "Vulpix", levels: "13–15", times: "Day", rate: "15%", rarity: "Uncommon" },
  { method: "Walking · Day", pokemon: "Stantler", levels: "13", times: "Day", rate: "5%", rarity: "Rare" },
  { method: "Walking · Night", pokemon: "Nidoran♀", levels: "12", times: "Night", rate: "30%", rarity: "Common" },
  { method: "Walking · Night", pokemon: "Nidoran♂", levels: "12", times: "Night", rate: "30%", rarity: "Common" },
  { method: "Walking · Night", pokemon: "Hoothoot", levels: "13–15", times: "Night", rate: "25%", rarity: "Common" },
  { method: "Walking · Night", pokemon: "Vulpix", levels: "13", times: "Night", rate: "10%", rarity: "Uncommon" },
  { method: "Walking · Night", pokemon: "Stantler", levels: "13", times: "Night", rate: "5%", rarity: "Rare" },
  { method: "Hoenn Sound", pokemon: "Plusle", levels: "12", times: "Radio broadcast", rate: "20%", rarity: "Conditional" },
  { method: "Hoenn Sound", pokemon: "Minun", levels: "13", times: "Radio broadcast", rate: "20%", rarity: "Conditional" },
  { method: "Sinnoh Sound", pokemon: "Shinx", levels: "12–13", times: "Radio broadcast", rate: "40%", rarity: "Conditional" },
  { method: "Headbutt", pokemon: "Exeggcute", levels: "Not listed", times: "All times", rarity: "Conditional" },
  { method: "Headbutt", pokemon: "Hoothoot", levels: "Not listed", times: "All times", rarity: "Conditional" },
  { method: "Headbutt", pokemon: "Ledyba", levels: "Not listed", times: "All times", rarity: "Conditional" },
  { method: "Headbutt", pokemon: "Pineco", levels: "Not listed", times: "All times", rarity: "Conditional" },
  { method: "Special encounter", pokemon: "Sudowoodo", levels: "20", times: "SquirtBottle interaction; respawns after Hall of Fame if defeated or fled", rarity: "One-time until postgame" }
]);

const ROUTE_37_ENCOUNTERS = Object.freeze([
  { method: "Walking · Morning", pokemon: "Ledyba", levels: "13–15", times: "Morning", rate: "40%", rarity: "Common" },
  { method: "Walking · Morning", pokemon: "Stantler", levels: "15", times: "Morning", rate: "30%", rarity: "Common" },
  { method: "Walking · Morning", pokemon: "Pidgey", levels: "15", times: "Morning", rate: "20%", rarity: "Common" },
  { method: "Walking · Morning", pokemon: "Vulpix", levels: "14", times: "Morning", rate: "10%", rarity: "Uncommon" },
  { method: "Walking · Day", pokemon: "Pidgey", levels: "13–15", times: "Day", rate: "50%", rarity: "Common" },
  { method: "Walking · Day", pokemon: "Stantler", levels: "15", times: "Day", rate: "30%", rarity: "Common" },
  { method: "Walking · Day", pokemon: "Pidgeotto", levels: "15", times: "Day", rate: "5%", rarity: "Rare" },
  { method: "Walking · Day", pokemon: "Vulpix", levels: "14–15", times: "Day", rate: "15%", rarity: "Uncommon" },
  { method: "Walking · Night", pokemon: "Hoothoot", levels: "13–15", times: "Night", rate: "60%", rarity: "Common" },
  { method: "Walking · Night", pokemon: "Stantler", levels: "15", times: "Night", rate: "30%", rarity: "Common" },
  { method: "Walking · Night", pokemon: "Vulpix", levels: "14", times: "Night", rate: "10%", rarity: "Uncommon" },
  { method: "Headbutt · Group A", pokemon: "Hoothoot", levels: "12–14", times: "All times", rate: "50%", rarity: "Common" },
  { method: "Headbutt · Group A", pokemon: "Pineco", levels: "12–14", times: "All times", rate: "30%", rarity: "Uncommon" },
  { method: "Headbutt · Group A", pokemon: "Exeggcute", levels: "12–14", times: "All times", rate: "20%", rarity: "Uncommon" },
  { method: "Headbutt · Group B", pokemon: "Hoothoot", levels: "15–17", times: "All times", rate: "50%", rarity: "Common" },
  { method: "Headbutt · Group B", pokemon: "Ledyba", levels: "15–17", times: "All times", rate: "30%", rarity: "Uncommon" },
  { method: "Headbutt · Group B", pokemon: "Spinarak", levels: "15–17", times: "All times", rate: "30%", rarity: "Uncommon" },
  { method: "Headbutt · Group B", pokemon: "Exeggcute", levels: "15–17", times: "All times", rate: "20%", rarity: "Uncommon" },
  { method: "Hoenn Sound", pokemon: "Plusle", levels: "13, 15", times: "Radio broadcast", rate: "20%", rarity: "Conditional" },
  { method: "Hoenn Sound", pokemon: "Minun", levels: "15", times: "Radio broadcast", rate: "20%", rarity: "Conditional" },
  { method: "Sinnoh Sound", pokemon: "Shinx", levels: "13, 15", times: "Radio broadcast", rate: "40%", rarity: "Conditional" }
]);

const ROUTE_38_ENCOUNTERS = Object.freeze([
  { method: "Walking · Morning", pokemon: "Raticate", levels: "16", times: "Morning", rate: "30%", rarity: "Common" },
  { method: "Walking · Morning", pokemon: "Meowth", levels: "16", times: "Morning", rate: "30%", rarity: "Common" },
  { method: "Walking · Morning", pokemon: "Magnemite", levels: "16", times: "Morning", rate: "20%", rarity: "Common" },
  { method: "Walking · Morning", pokemon: "Farfetch'd", levels: "16", times: "Morning", rate: "10%", rarity: "Uncommon" },
  { method: "Walking · Morning", pokemon: "Miltank", levels: "13", times: "Morning", rate: "5%", rarity: "Rare" },
  { method: "Walking · Morning", pokemon: "Tauros", levels: "13", times: "Morning", rate: "4%", rarity: "Rare" },
  { method: "Walking · Morning", pokemon: "Snubbull", levels: "13", times: "Morning", rate: "1%", rarity: "Very rare" },
  { method: "Walking · Day", pokemon: "Raticate", levels: "16", times: "Day", rate: "30%", rarity: "Common" },
  { method: "Walking · Day", pokemon: "Meowth", levels: "16", times: "Day", rate: "30%", rarity: "Common" },
  { method: "Walking · Day", pokemon: "Magnemite", levels: "16", times: "Day", rate: "20%", rarity: "Common" },
  { method: "Walking · Day", pokemon: "Farfetch'd", levels: "16", times: "Day", rate: "10%", rarity: "Uncommon" },
  { method: "Walking · Day", pokemon: "Miltank", levels: "13", times: "Day", rate: "5%", rarity: "Rare" },
  { method: "Walking · Day", pokemon: "Tauros", levels: "13", times: "Day", rate: "4%", rarity: "Rare" },
  { method: "Walking · Day", pokemon: "Snubbull", levels: "13", times: "Day", rate: "1%", rarity: "Very rare" },
  { method: "Walking · Night", pokemon: "Meowth", levels: "16", times: "Night", rate: "40%", rarity: "Common" },
  { method: "Walking · Night", pokemon: "Raticate", levels: "16", times: "Night", rate: "30%", rarity: "Common" },
  { method: "Walking · Night", pokemon: "Magnemite", levels: "16", times: "Night", rate: "20%", rarity: "Common" },
  { method: "Walking · Night", pokemon: "Miltank", levels: "13", times: "Night", rate: "5%", rarity: "Rare" },
  { method: "Walking · Night", pokemon: "Tauros", levels: "13", times: "Night", rate: "4%", rarity: "Rare" },
  { method: "Walking · Night", pokemon: "Snubbull", levels: "13", times: "Night", rate: "1%", rarity: "Very rare" },
  { method: "Headbutt · Group A", pokemon: "Hoothoot", levels: "13–14", times: "All times", rate: "50%", rarity: "Common" },
  { method: "Headbutt · Group A", pokemon: "Pineco", levels: "13–14", times: "All times", rate: "30%", rarity: "Uncommon" },
  { method: "Headbutt · Group A", pokemon: "Exeggcute", levels: "13–14", times: "All times", rate: "20%", rarity: "Uncommon" },
  { method: "Headbutt · Group B", pokemon: "Hoothoot", levels: "15–16", times: "All times", rate: "50%", rarity: "Common" },
  { method: "Headbutt · Group B", pokemon: "Ledyba", levels: "15–16", times: "All times", rate: "30%", rarity: "Uncommon" },
  { method: "Headbutt · Group B", pokemon: "Spinarak", levels: "15–16", times: "All times", rate: "30%", rarity: "Uncommon" },
  { method: "Headbutt · Group B", pokemon: "Exeggcute", levels: "15–16", times: "All times", rate: "20%", rarity: "Uncommon" },
  { method: "Headbutt · Rock Climb tree", pokemon: "Exeggcute", levels: "18–25", times: "All times", rate: "65%", rarity: "Common" },
  { method: "Headbutt · Rock Climb tree", pokemon: "Burmy", levels: "18–20", times: "All times", rate: "30%", rarity: "Uncommon" },
  { method: "Headbutt · Rock Climb tree", pokemon: "Burmy", levels: "21–25", times: "All times", rate: "5%", rarity: "Rare" },
  { method: "Hoenn Sound", pokemon: "Plusle", levels: "16", times: "Radio broadcast", rate: "20%", rarity: "Conditional" },
  { method: "Hoenn Sound", pokemon: "Minun", levels: "16", times: "Radio broadcast", rate: "20%", rarity: "Conditional" },
  { method: "Sinnoh Sound", pokemon: "Shinx", levels: "16", times: "Radio broadcast", rate: "40%", rarity: "Conditional" },
  { method: "Swarm", pokemon: "Snubbull", levels: "13–16", times: "Swarm active", rate: "40%", rarity: "Conditional" }
]);

const ROUTE_39_ENCOUNTERS = Object.freeze([
  { method: "Walking · Morning", pokemon: "Raticate", levels: "17", times: "Morning", rate: "30%", rarity: "Common" },
  { method: "Walking · Morning", pokemon: "Meowth", levels: "16", times: "Morning", rate: "30%", rarity: "Common" },
  { method: "Walking · Morning", pokemon: "Magnemite", levels: "16", times: "Morning", rate: "20%", rarity: "Common" },
  { method: "Walking · Morning", pokemon: "Farfetch'd", levels: "16", times: "Morning", rate: "10%", rarity: "Uncommon" },
  { method: "Walking · Morning", pokemon: "Miltank", levels: "15", times: "Morning", rate: "5%", rarity: "Rare" },
  { method: "Walking · Morning", pokemon: "Tauros", levels: "15", times: "Morning", rate: "5%", rarity: "Rare" },
  { method: "Walking · Day", pokemon: "Raticate", levels: "17", times: "Day", rate: "30%", rarity: "Common" },
  { method: "Walking · Day", pokemon: "Meowth", levels: "16", times: "Day", rate: "30%", rarity: "Common" },
  { method: "Walking · Day", pokemon: "Magnemite", levels: "16", times: "Day", rate: "20%", rarity: "Common" },
  { method: "Walking · Day", pokemon: "Farfetch'd", levels: "16", times: "Day", rate: "10%", rarity: "Uncommon" },
  { method: "Walking · Day", pokemon: "Miltank", levels: "15", times: "Day", rate: "5%", rarity: "Rare" },
  { method: "Walking · Day", pokemon: "Tauros", levels: "15", times: "Day", rate: "5%", rarity: "Rare" },
  { method: "Walking · Night", pokemon: "Meowth", levels: "16", times: "Night", rate: "40%", rarity: "Common" },
  { method: "Walking · Night", pokemon: "Raticate", levels: "17", times: "Night", rate: "30%", rarity: "Common" },
  { method: "Walking · Night", pokemon: "Magnemite", levels: "16", times: "Night", rate: "20%", rarity: "Common" },
  { method: "Walking · Night", pokemon: "Miltank", levels: "15", times: "Night", rate: "5%", rarity: "Rare" },
  { method: "Walking · Night", pokemon: "Tauros", levels: "15", times: "Night", rate: "5%", rarity: "Rare" },
  { method: "Headbutt · Group A", pokemon: "Hoothoot", levels: "14–15", times: "All times", rate: "50%", rarity: "Common" },
  { method: "Headbutt · Group A", pokemon: "Pineco", levels: "14–15", times: "All times", rate: "30%", rarity: "Uncommon" },
  { method: "Headbutt · Group A", pokemon: "Exeggcute", levels: "14–15", times: "All times", rate: "20%", rarity: "Uncommon" },
  { method: "Headbutt · Group B", pokemon: "Hoothoot", levels: "16–17", times: "All times", rate: "50%", rarity: "Common" },
  { method: "Headbutt · Group B", pokemon: "Ledyba", levels: "16–17", times: "All times", rate: "30%", rarity: "Uncommon" },
  { method: "Headbutt · Group B", pokemon: "Spinarak", levels: "16–17", times: "All times", rate: "30%", rarity: "Uncommon" },
  { method: "Headbutt · Group B", pokemon: "Exeggcute", levels: "16–17", times: "All times", rate: "20%", rarity: "Uncommon" },
  { method: "Hoenn Sound", pokemon: "Plusle", levels: "16–17", times: "Radio broadcast", rate: "20%", rarity: "Conditional" },
  { method: "Hoenn Sound", pokemon: "Minun", levels: "16", times: "Radio broadcast", rate: "20%", rarity: "Conditional" },
  { method: "Sinnoh Sound", pokemon: "Shinx", levels: "16–17", times: "Radio broadcast", rate: "40%", rarity: "Conditional" }
]);

const ROUTE_40_ENCOUNTERS = Object.freeze([
  { method: "Surfing", pokemon: "Tentacool", levels: "10–25", times: "All times", rate: "90%", rarity: "Common" },
  { method: "Surfing", pokemon: "Tentacruel", levels: "15–29", times: "All times", rate: "10%", rarity: "Uncommon" },
  { method: "Old Rod", pokemon: "Magikarp", levels: "10", times: "All times", rate: "95%", rarity: "Common" },
  { method: "Old Rod", pokemon: "Krabby", levels: "10", times: "All times", rate: "5%", rarity: "Rare" },
  { method: "Good Rod · Morning", pokemon: "Magikarp", levels: "20", times: "Morning", rate: "60%", rarity: "Common" },
  { method: "Good Rod · Morning", pokemon: "Krabby", levels: "20", times: "Morning", rate: "37%", rarity: "Common" },
  { method: "Good Rod · Morning", pokemon: "Corsola", levels: "20", times: "Morning", rate: "3%", rarity: "Rare" },
  { method: "Good Rod · Day", pokemon: "Magikarp", levels: "20", times: "Day", rate: "60%", rarity: "Common" },
  { method: "Good Rod · Day", pokemon: "Krabby", levels: "20", times: "Day", rate: "37%", rarity: "Common" },
  { method: "Good Rod · Day", pokemon: "Corsola", levels: "20", times: "Day", rate: "3%", rarity: "Rare" },
  { method: "Good Rod · Night", pokemon: "Magikarp", levels: "20", times: "Night", rate: "60%", rarity: "Common" },
  { method: "Good Rod · Night", pokemon: "Krabby", levels: "20", times: "Night", rate: "37%", rarity: "Common" },
  { method: "Good Rod · Night", pokemon: "Staryu", levels: "20", times: "Night", rate: "3%", rarity: "Rare" },
  { method: "Super Rod · Morning", pokemon: "Krabby", levels: "40", times: "Morning", rate: "67%", rarity: "Common" },
  { method: "Super Rod · Morning", pokemon: "Corsola", levels: "40", times: "Morning", rate: "30%", rarity: "Uncommon" },
  { method: "Super Rod · Morning", pokemon: "Kingler", levels: "40", times: "Morning", rate: "3%", rarity: "Rare" },
  { method: "Super Rod · Day", pokemon: "Krabby", levels: "40", times: "Day", rate: "67%", rarity: "Common" },
  { method: "Super Rod · Day", pokemon: "Corsola", levels: "40", times: "Day", rate: "30%", rarity: "Uncommon" },
  { method: "Super Rod · Day", pokemon: "Kingler", levels: "40", times: "Day", rate: "3%", rarity: "Rare" },
  { method: "Super Rod · Night", pokemon: "Krabby", levels: "40", times: "Night", rate: "67%", rarity: "Common" },
  { method: "Super Rod · Night", pokemon: "Staryu", levels: "40", times: "Night", rate: "30%", rarity: "Uncommon" },
  { method: "Super Rod · Night", pokemon: "Kingler", levels: "40", times: "Night", rate: "3%", rarity: "Rare" }
]);

const ROUTE_41_ENCOUNTERS = Object.freeze([
  { method: "Surfing", pokemon: "Tentacool", levels: "15–25", times: "All times", rate: "60%", rarity: "Common" },
  { method: "Surfing", pokemon: "Tentacruel", levels: "15–25", times: "All times", rate: "40%", rarity: "Common" },
  { method: "Old Rod", pokemon: "Magikarp", levels: "10", times: "All times", rate: "95%", rarity: "Common" },
  { method: "Old Rod", pokemon: "Tentacool", levels: "10", times: "All times", rate: "5%", rarity: "Rare" },
  { method: "Good Rod", pokemon: "Magikarp", levels: "20", times: "All times", rate: "60%", rarity: "Common" },
  { method: "Good Rod", pokemon: "Tentacool", levels: "20", times: "All times", rate: "30%", rarity: "Uncommon" },
  { method: "Good Rod", pokemon: "Chinchou", levels: "20", times: "All times", rate: "7%", rarity: "Rare" },
  { method: "Good Rod", pokemon: "Shellder", levels: "20", times: "All times", rate: "3%", rarity: "Rare" },
  { method: "Super Rod", pokemon: "Chinchou", levels: "40", times: "All times", rate: "60%", rarity: "Common" },
  { method: "Super Rod", pokemon: "Shellder", levels: "40", times: "All times", rate: "30%", rarity: "Uncommon" },
  { method: "Super Rod", pokemon: "Tentacruel", levels: "40", times: "All times", rate: "7%", rarity: "Rare" },
  { method: "Super Rod", pokemon: "Lanturn", levels: "40", times: "All times", rate: "3%", rarity: "Rare" }
]);


const WHIRL_ISLANDS_ENCOUNTERS = Object.freeze([
  { method: "1F · Walking", pokemon: "Krabby", levels: "22–24", times: "All times", rate: "50%", rarity: "Common" },
  { method: "1F · Walking", pokemon: "Zubat", levels: "23", times: "All times", rate: "30%", rarity: "Common" },
  { method: "1F · Walking", pokemon: "Seel", levels: "22–24", times: "All times", rate: "15%", rarity: "Uncommon" },
  { method: "1F · Walking", pokemon: "Golbat", levels: "23", times: "All times", rate: "5%", rarity: "Rare" },
  { method: "1F · Surfing", pokemon: "Tentacool", levels: "15–25", times: "All times", rate: "60%", rarity: "Common" },
  { method: "1F · Surfing", pokemon: "Horsea", levels: "10–20", times: "All times", rate: "30%", rarity: "Uncommon" },
  { method: "1F · Surfing", pokemon: "Tentacruel", levels: "15–25", times: "All times", rate: "10%", rarity: "Uncommon" },
  { method: "1F · Old Rod", pokemon: "Magikarp", levels: "10", times: "All times", rate: "85%", rarity: "Common" },
  { method: "1F · Old Rod", pokemon: "Krabby", levels: "10", times: "All times", rate: "15%", rarity: "Uncommon" },
  { method: "1F · Good Rod", pokemon: "Magikarp", levels: "20", times: "All times", rate: "60%", rarity: "Common" },
  { method: "1F · Good Rod", pokemon: "Krabby", levels: "20", times: "All times", rate: "37%", rarity: "Common" },
  { method: "1F · Good Rod", pokemon: "Horsea", levels: "20", times: "All times", rate: "3%", rarity: "Rare" },
  { method: "1F · Super Rod", pokemon: "Krabby", levels: "40", times: "All times", rate: "60%", rarity: "Common" },
  { method: "1F · Super Rod", pokemon: "Kingler", levels: "40", times: "All times", rate: "37%", rarity: "Common" },
  { method: "1F · Super Rod", pokemon: "Seadra", levels: "40", times: "All times", rate: "3%", rarity: "Rare" },
  { method: "B1F · Walking", pokemon: "Krabby", levels: "22–24", times: "All times", rate: "50%", rarity: "Common" },
  { method: "B1F · Walking", pokemon: "Zubat", levels: "23", times: "All times", rate: "30%", rarity: "Common" },
  { method: "B1F · Walking", pokemon: "Seel", levels: "22–24", times: "All times", rate: "15%", rarity: "Uncommon" },
  { method: "B1F · Walking", pokemon: "Golbat", levels: "23", times: "All times", rate: "5%", rarity: "Rare" },
  { method: "B1F · Hoenn Sound", pokemon: "Absol", levels: "22–23", times: "Hoenn Sound", rate: "20%", rarity: "Conditional" },
  { method: "B1F · Hoenn Sound", pokemon: "Makuhita", levels: "24", times: "Hoenn Sound", rate: "20%", rarity: "Conditional" },
  { method: "B1F · Sinnoh Sound", pokemon: "Bronzor", levels: "22–23", times: "Sinnoh Sound", rate: "20%", rarity: "Conditional" },
  { method: "B1F · Sinnoh Sound", pokemon: "Chingling", levels: "24", times: "Sinnoh Sound", rate: "20%", rarity: "Conditional" },
  { method: "B2F · Walking", pokemon: "Krabby", levels: "22–24", times: "All times", rate: "50%", rarity: "Common" },
  { method: "B2F · Walking", pokemon: "Zubat", levels: "23", times: "All times", rate: "30%", rarity: "Common" },
  { method: "B2F · Walking", pokemon: "Seel", levels: "22–24", times: "All times", rate: "15%", rarity: "Uncommon" },
  { method: "B2F · Walking", pokemon: "Golbat", levels: "23", times: "All times", rate: "5%", rarity: "Rare" },
  { method: "B2F · Hoenn Sound", pokemon: "Absol", levels: "22–23", times: "Hoenn Sound", rate: "20%", rarity: "Conditional" },
  { method: "B2F · Hoenn Sound", pokemon: "Makuhita", levels: "24", times: "Hoenn Sound", rate: "20%", rarity: "Conditional" },
  { method: "B2F · Sinnoh Sound", pokemon: "Bronzor", levels: "22–23", times: "Sinnoh Sound", rate: "20%", rarity: "Conditional" },
  { method: "B2F · Sinnoh Sound", pokemon: "Chingling", levels: "24", times: "Sinnoh Sound", rate: "20%", rarity: "Conditional" },
  { method: "B3F · Walking", pokemon: "Krabby", levels: "23–25", times: "All times", rate: "50%", rarity: "Common" },
  { method: "B3F · Walking", pokemon: "Zubat", levels: "24", times: "All times", rate: "30%", rarity: "Common" },
  { method: "B3F · Walking", pokemon: "Seel", levels: "23–25", times: "All times", rate: "15%", rarity: "Uncommon" },
  { method: "B3F · Walking", pokemon: "Golbat", levels: "24", times: "All times", rate: "5%", rarity: "Rare" },
  { method: "B3F · Hoenn Sound", pokemon: "Absol", levels: "23–24", times: "Hoenn Sound", rate: "20%", rarity: "Conditional" },
  { method: "B3F · Hoenn Sound", pokemon: "Makuhita", levels: "25", times: "Hoenn Sound", rate: "20%", rarity: "Conditional" },
  { method: "B3F · Sinnoh Sound", pokemon: "Bronzor", levels: "23–24", times: "Sinnoh Sound", rate: "20%", rarity: "Conditional" },
  { method: "B3F · Sinnoh Sound", pokemon: "Chingling", levels: "25", times: "Sinnoh Sound", rate: "20%", rarity: "Conditional" },
  { method: "Bottom · Special encounter", pokemon: "Lugia", levels: "45", times: "After required story items/event", rarity: "Legendary" }
]);


const ROUTE_42_ENCOUNTERS = Object.freeze([
  { method: "Walking · Morning", pokemon: "Mareep", levels: "13–15", times: "Morning", rate: "50%", rarity: "Common" },
  { method: "Walking · Morning", pokemon: "Spearow", levels: "14–16", times: "Morning", rate: "40%", rarity: "Common" },
  { method: "Walking · Morning", pokemon: "Flaaffy", levels: "15–17", times: "Morning", rate: "10%", rarity: "Uncommon" },
  { method: "Walking · Day", pokemon: "Mareep", levels: "13–15", times: "Day", rate: "50%", rarity: "Common" },
  { method: "Walking · Day", pokemon: "Spearow", levels: "14–16", times: "Day", rate: "40%", rarity: "Common" },
  { method: "Walking · Day", pokemon: "Flaaffy", levels: "15–17", times: "Day", rate: "10%", rarity: "Uncommon" },
  { method: "Walking · Night", pokemon: "Mareep", levels: "13–15", times: "Night", rate: "50%", rarity: "Common" },
  { method: "Walking · Night", pokemon: "Zubat", levels: "14–16", times: "Night", rate: "40%", rarity: "Common" },
  { method: "Walking · Night", pokemon: "Flaaffy", levels: "15–17", times: "Night", rate: "10%", rarity: "Uncommon" },
  { method: "Hoenn Sound", pokemon: "Whismur", levels: "13–14", times: "All times", rate: "20%", rarity: "Conditional" },
  { method: "Hoenn Sound", pokemon: "Linoone", levels: "14", times: "All times", rate: "20%", rarity: "Conditional" },
  { method: "Sinnoh Sound", pokemon: "Bidoof", levels: "14", times: "All times", rate: "20%", rarity: "Conditional" },
  { method: "Sinnoh Sound", pokemon: "Buizel", levels: "13–14", times: "All times", rate: "20%", rarity: "Conditional" },
  { method: "Headbutt", pokemon: "Spearow", levels: "Not specified", times: "All times", rarity: "Encounter listed; rate not specified" },
  { method: "Headbutt", pokemon: "Aipom", levels: "Not specified", times: "All times", rarity: "Encounter listed; rate not specified" },
  { method: "Headbutt", pokemon: "Heracross", levels: "Not specified", times: "All times", rarity: "Encounter listed; rate not specified" },
  { method: "Surfing", pokemon: "Goldeen", levels: "10–25", times: "All times", rate: "90%", rarity: "Common" },
  { method: "Surfing", pokemon: "Seaking", levels: "15–25", times: "All times", rate: "10%", rarity: "Uncommon" },
  { method: "Old Rod", pokemon: "Magikarp", levels: "10", times: "All times", rate: "95%", rarity: "Common" },
  { method: "Old Rod", pokemon: "Goldeen", levels: "10", times: "All times", rate: "5%", rarity: "Rare" },
  { method: "Good Rod", pokemon: "Magikarp", levels: "20", times: "All times", rate: "60%", rarity: "Common" },
  { method: "Good Rod", pokemon: "Goldeen", levels: "20", times: "All times", rate: "40%", rarity: "Common" },
  { method: "Super Rod", pokemon: "Goldeen", levels: "40", times: "All times", rate: "90%", rarity: "Common" },
  { method: "Super Rod", pokemon: "Magikarp", levels: "40", times: "All times", rate: "7%", rarity: "Rare" },
  { method: "Super Rod", pokemon: "Seaking", levels: "40", times: "All times", rate: "3%", rarity: "Rare" }
]);

const ROUTE_43_ENCOUNTERS = Object.freeze([
  { method: "Walking · Morning", pokemon: "Flaaffy", levels: "15", times: "Morning", rate: "30%", rarity: "Common" },
  { method: "Walking · Morning", pokemon: "Girafarig", levels: "15", times: "Morning", rate: "30%", rarity: "Common" },
  { method: "Walking · Morning", pokemon: "Pidgeotto", levels: "17", times: "Morning", rate: "25%", rarity: "Common" },
  { method: "Walking · Morning", pokemon: "Mareep", levels: "15", times: "Morning", rate: "10%", rarity: "Uncommon" },
  { method: "Walking · Morning", pokemon: "Venonat", levels: "16", times: "Morning", rate: "5%", rarity: "Rare" },
  { method: "Walking · Day", pokemon: "Flaaffy", levels: "15–17", times: "Day", rate: "40%", rarity: "Common" },
  { method: "Walking · Day", pokemon: "Girafarig", levels: "15", times: "Day", rate: "30%", rarity: "Common" },
  { method: "Walking · Day", pokemon: "Pidgeotto", levels: "17", times: "Day", rate: "20%", rarity: "Common" },
  { method: "Walking · Day", pokemon: "Mareep", levels: "15", times: "Day", rate: "10%", rarity: "Uncommon" },
  { method: "Walking · Night", pokemon: "Flaaffy", levels: "15", times: "Night", rate: "30%", rarity: "Common" },
  { method: "Walking · Night", pokemon: "Girafarig", levels: "15", times: "Night", rate: "30%", rarity: "Common" },
  { method: "Walking · Night", pokemon: "Noctowl", levels: "17", times: "Night", rate: "20%", rarity: "Common" },
  { method: "Walking · Night", pokemon: "Venonat", levels: "15–17", times: "Night", rate: "15%", rarity: "Uncommon" },
  { method: "Walking · Night", pokemon: "Mareep", levels: "16", times: "Night", rate: "5%", rarity: "Rare" },
  { method: "Hoenn Sound", pokemon: "Whismur", levels: "15", times: "All times", rate: "20%", rarity: "Conditional" },
  { method: "Hoenn Sound", pokemon: "Linoone", levels: "17", times: "All times", rate: "20%", rarity: "Conditional" },
  { method: "Sinnoh Sound", pokemon: "Bidoof", levels: "17", times: "All times", rate: "20%", rarity: "Conditional" },
  { method: "Sinnoh Sound", pokemon: "Buizel", levels: "15", times: "All times", rate: "20%", rarity: "Conditional" },
  { method: "Headbutt", pokemon: "Venonat", levels: "Not specified", times: "All times", rarity: "Encounter listed; rate not specified" },
  { method: "Headbutt", pokemon: "Exeggcute", levels: "Not specified", times: "All times", rarity: "Encounter listed; rate not specified" },
  { method: "Headbutt", pokemon: "Hoothoot", levels: "Not specified", times: "All times", rarity: "Encounter listed; rate not specified" },
  { method: "Headbutt", pokemon: "Pineco", levels: "Not specified", times: "All times", rarity: "Encounter listed; rate not specified" },
  { method: "Surfing", pokemon: "Magikarp", levels: "5–50", times: "All times", rate: "100%", rarity: "Common" },
  { method: "Old Rod", pokemon: "Magikarp", levels: "10", times: "All times", rate: "95%", rarity: "Common" },
  { method: "Old Rod", pokemon: "Poliwag", levels: "10", times: "All times", rate: "5%", rarity: "Rare" },
  { method: "Good Rod", pokemon: "Magikarp", levels: "20", times: "All times", rate: "60%", rarity: "Common" },
  { method: "Good Rod", pokemon: "Poliwag", levels: "20", times: "All times", rate: "40%", rarity: "Common" },
  { method: "Super Rod", pokemon: "Poliwag", levels: "40", times: "All times", rate: "93%", rarity: "Common" },
  { method: "Super Rod", pokemon: "Magikarp", levels: "40", times: "All times", rate: "7%", rarity: "Rare" }
]);

const ROUTE_44_ENCOUNTERS = Object.freeze([
  { method: "Walking", pokemon: "Weepinbell", levels: "22–24", times: "All times", rate: "35%", rarity: "Common" },
  { method: "Walking", pokemon: "Tangela", levels: "23", times: "All times", rate: "30%", rarity: "Common" },
  { method: "Walking", pokemon: "Bellsprout", levels: "22", times: "All times", rate: "20%", rarity: "Common" },
  { method: "Walking", pokemon: "Lickitung", levels: "24–26", times: "All times", rate: "15%", rarity: "Uncommon" },
  { method: "Hoenn Sound", pokemon: "Whismur", levels: "22–23", times: "All times", rate: "20%", rarity: "Conditional" },
  { method: "Hoenn Sound", pokemon: "Linoone", levels: "22", times: "All times", rate: "20%", rarity: "Conditional" },
  { method: "Sinnoh Sound", pokemon: "Buizel", levels: "22–23", times: "All times", rate: "20%", rarity: "Conditional" },
  { method: "Sinnoh Sound", pokemon: "Bidoof", levels: "22", times: "All times", rate: "20%", rarity: "Conditional" },
  { method: "Headbutt", pokemon: "Spearow", levels: "Not specified", times: "All times", rarity: "Encounter listed; rate not specified" },
  { method: "Headbutt", pokemon: "Aipom", levels: "Not specified", times: "All times", rarity: "Encounter listed; rate not specified" },
  { method: "Headbutt", pokemon: "Heracross", levels: "Not specified", times: "All times", rarity: "Encounter listed; rate not specified" },
  { method: "Surfing", pokemon: "Poliwag", levels: "10–25", times: "All times", rate: "90%", rarity: "Common" },
  { method: "Surfing", pokemon: "Poliwhirl", levels: "15–32", times: "All times", rate: "10%", rarity: "Uncommon" },
  { method: "Old Rod", pokemon: "Magikarp", levels: "10", times: "All times", rate: "95%", rarity: "Common" },
  { method: "Old Rod", pokemon: "Poliwag", levels: "10", times: "All times", rate: "5%", rarity: "Rare" },
  { method: "Good Rod", pokemon: "Magikarp", levels: "20", times: "All times", rate: "60%", rarity: "Common" },
  { method: "Good Rod", pokemon: "Poliwag", levels: "20", times: "All times", rate: "38%", rarity: "Common" },
  { method: "Good Rod", pokemon: "Remoraid", levels: "20", times: "All times", rate: "2%", rarity: "Rare" },
  { method: "Super Rod", pokemon: "Poliwag", levels: "40", times: "All times", rate: "90%", rarity: "Common" },
  { method: "Super Rod", pokemon: "Magikarp", levels: "40", times: "All times", rate: "7%", rarity: "Rare" },
  { method: "Super Rod", pokemon: "Remoraid", levels: "40", times: "All times", rate: "3%", rarity: "Rare" },
  { method: "Swarm", pokemon: "Remoraid", levels: "10–40", times: "Fishing swarm", rate: "90%", rarity: "Conditional" }
]);


const ROUTE_45_ENCOUNTERS = Object.freeze([
  { method: "Walking", pokemon: "Graveler", levels: "23–25", times: "All times", rate: "55%", rarity: "Common" },
  { method: "Walking", pokemon: "Geodude", levels: "23", times: "All times", rate: "30%", rarity: "Common" },
  { method: "Walking", pokemon: "Teddiursa", levels: "20", times: "All times", rate: "10%", rarity: "Uncommon" },
  { method: "Walking", pokemon: "Skarmory", levels: "27", times: "All times", rate: "5%", rarity: "Rare" },
  { method: "Hoenn Sound", pokemon: "Whismur", levels: "23", times: "All times", rate: "20%", rarity: "Conditional" },
  { method: "Hoenn Sound", pokemon: "Linoone", levels: "24", times: "All times", rate: "20%", rarity: "Conditional" },
  { method: "Sinnoh Sound", pokemon: "Buizel", levels: "23", times: "All times", rate: "20%", rarity: "Conditional" },
  { method: "Sinnoh Sound", pokemon: "Bidoof", levels: "24", times: "All times", rate: "20%", rarity: "Conditional" },
  { method: "Swarm", pokemon: "Swablu", levels: "23", times: "Swarm", rate: "40%", rarity: "Conditional" },
  { method: "Headbutt", pokemon: "Spearow", levels: "Not specified", times: "All times", rarity: "Encounter listed; rate not specified" },
  { method: "Headbutt", pokemon: "Aipom", levels: "Not specified", times: "All times", rarity: "Encounter listed; rate not specified" },
  { method: "Headbutt", pokemon: "Heracross", levels: "Not specified", times: "All times", rarity: "Encounter listed; rate not specified" },
  { method: "Surfing", pokemon: "Magikarp", levels: "2–20", times: "All times", rate: "100%", rarity: "Common" },
  { method: "Old Rod", pokemon: "Magikarp", levels: "10", times: "All times", rate: "95%", rarity: "Common" },
  { method: "Old Rod", pokemon: "Poliwag", levels: "10", times: "All times", rate: "5%", rarity: "Rare" },
  { method: "Good Rod", pokemon: "Magikarp", levels: "20", times: "All times", rate: "60%", rarity: "Common" },
  { method: "Good Rod", pokemon: "Poliwag", levels: "20", times: "All times", rate: "40%", rarity: "Common" },
  { method: "Super Rod", pokemon: "Poliwag", levels: "40", times: "All times", rate: "93%", rarity: "Common" },
  { method: "Super Rod", pokemon: "Magikarp", levels: "40", times: "All times", rate: "7%", rarity: "Rare" }
]);

const ROUTE_46_ENCOUNTERS = Object.freeze([
  { method: "Walking · Morning", pokemon: "Geodude", levels: "2–3", times: "Morning", rate: "40%", rarity: "Common" },
  { method: "Walking · Morning", pokemon: "Spearow", levels: "2–3", times: "Morning", rate: "35%", rarity: "Common" },
  { method: "Walking · Morning", pokemon: "Rattata", levels: "2–4", times: "Morning", rate: "25%", rarity: "Common" },
  { method: "Walking · Day", pokemon: "Geodude", levels: "2–3", times: "Day", rate: "40%", rarity: "Common" },
  { method: "Walking · Day", pokemon: "Spearow", levels: "2–3", times: "Day", rate: "35%", rarity: "Common" },
  { method: "Walking · Day", pokemon: "Rattata", levels: "2–4", times: "Day", rate: "25%", rarity: "Common" },
  { method: "Walking · Night", pokemon: "Rattata", levels: "2–4", times: "Night", rate: "55%", rarity: "Common" },
  { method: "Walking · Night", pokemon: "Geodude", levels: "2–3", times: "Night", rate: "45%", rarity: "Common" },
  { method: "Hoenn Sound", pokemon: "Plusle", levels: "2–3", times: "All times", rate: "20%", rarity: "Conditional" },
  { method: "Hoenn Sound", pokemon: "Minun", levels: "2", times: "All times", rate: "20%", rarity: "Conditional" },
  { method: "Sinnoh Sound", pokemon: "Shinx", levels: "2–3", times: "All times", rate: "40%", rarity: "Conditional" },
  { method: "Headbutt", pokemon: "Spearow", levels: "Not specified", times: "All times", rarity: "Encounter listed; rate not specified" },
  { method: "Headbutt", pokemon: "Aipom", levels: "Not specified", times: "All times", rarity: "Encounter listed; rate not specified" },
  { method: "Headbutt", pokemon: "Heracross", levels: "Not specified", times: "All times", rarity: "Encounter listed; rate not specified" }
]);


const ROUTE_47_ENCOUNTERS = Object.freeze([
  { method: "Walking · Morning/Day", pokemon: "Ditto", levels: "31–40", times: "Morning, day", rate: "41%", rarity: "Common" },
  { method: "Walking · Morning/Day", pokemon: "Farfetch'd", levels: "35", times: "Morning, day", rate: "20%", rarity: "Common" },
  { method: "Walking · Morning/Day", pokemon: "Miltank", levels: "35", times: "Morning, day", rate: "20%", rarity: "Common" },
  { method: "Walking · Morning/Day", pokemon: "Raticate", levels: "31–33", times: "Morning, day", rate: "5%", rarity: "Uncommon" },
  { method: "Walking · Morning/Day", pokemon: "Spearow", levels: "31", times: "Morning, day", rate: "5%", rarity: "Uncommon" },
  { method: "Walking · Morning/Day", pokemon: "Gloom", levels: "32", times: "Morning, day", rate: "5%", rarity: "Uncommon" },
  { method: "Walking · Morning/Day", pokemon: "Fearow", levels: "34", times: "Morning, day", rate: "4%", rarity: "Rare" },
  { method: "Walking · Night", pokemon: "Ditto", levels: "31–40", times: "Night", rate: "41%", rarity: "Common" },
  { method: "Walking · Night", pokemon: "Noctowl", levels: "35", times: "Night", rate: "20%", rarity: "Common" },
  { method: "Walking · Night", pokemon: "Miltank", levels: "35", times: "Night", rate: "20%", rarity: "Common" },
  { method: "Walking · Night", pokemon: "Raticate", levels: "31–33", times: "Night", rate: "5%", rarity: "Uncommon" },
  { method: "Walking · Night", pokemon: "Spearow", levels: "31", times: "Night", rate: "5%", rarity: "Uncommon" },
  { method: "Walking · Night", pokemon: "Gloom", levels: "32", times: "Night", rate: "5%", rarity: "Uncommon" },
  { method: "Walking · Night", pokemon: "Fearow", levels: "34", times: "Night", rate: "4%", rarity: "Rare" },
  { method: "Hoenn Sound", pokemon: "Whismur", levels: "33–34", times: "All times", rate: "20%", rarity: "Conditional" },
  { method: "Hoenn Sound", pokemon: "Linoone", levels: "31–32", times: "All times", rate: "20%", rarity: "Conditional" },
  { method: "Sinnoh Sound", pokemon: "Buizel", levels: "33–34", times: "All times", rate: "20%", rarity: "Conditional" },
  { method: "Sinnoh Sound", pokemon: "Bidoof", levels: "31–32", times: "All times", rate: "20%", rarity: "Conditional" },
  { method: "Swarm", pokemon: "Ditto", levels: "35", times: "Swarm", rate: "40%", rarity: "Conditional" },
  { method: "Headbutt · Main area", pokemon: "Exeggcute", levels: "Not specified", times: "All times", rarity: "Encounter listed; rate not specified" },
  { method: "Headbutt · Main area", pokemon: "Hoothoot", levels: "Not specified", times: "All times", rarity: "Encounter listed; rate not specified" },
  { method: "Headbutt · Main area", pokemon: "Ledyba", levels: "Not specified", times: "All times", rarity: "SoulSilver" },
  { method: "Headbutt · Main area", pokemon: "Pineco", levels: "Not specified", times: "All times", rarity: "Encounter listed; rate not specified" },
  { method: "Headbutt · Waterfall area", pokemon: "Kakuna", levels: "Not specified", times: "All times", rarity: "SoulSilver; special area" },
  { method: "Headbutt · Waterfall area", pokemon: "Beedrill", levels: "Not specified", times: "All times", rarity: "SoulSilver; special area" },
  { method: "Headbutt · Waterfall area", pokemon: "Heracross", levels: "Not specified", times: "All times", rarity: "Special area" },
  { method: "Surfing", pokemon: "Tentacool", levels: "15–25", times: "All times", rate: "60%", rarity: "Common" },
  { method: "Surfing", pokemon: "Seel", levels: "10–20", times: "All times", rate: "30%", rarity: "Common" },
  { method: "Surfing", pokemon: "Staryu", levels: "15–25", times: "All times", rate: "10%", rarity: "Uncommon" },
  { method: "Old Rod", pokemon: "Magikarp", levels: "10", times: "All times", rate: "95%", rarity: "Common" },
  { method: "Old Rod", pokemon: "Tentacool", levels: "10", times: "All times", rate: "5%", rarity: "Rare" },
  { method: "Good Rod", pokemon: "Magikarp", levels: "20", times: "All times", rate: "60%", rarity: "Common" },
  { method: "Good Rod", pokemon: "Tentacool", levels: "20", times: "All times", rate: "30%", rarity: "Common" },
  { method: "Good Rod", pokemon: "Chinchou", levels: "20", times: "All times", rate: "7%", rarity: "Rare" },
  { method: "Good Rod", pokemon: "Shellder", levels: "20", times: "All times", rate: "3%", rarity: "Rare" },
  { method: "Super Rod", pokemon: "Chinchou", levels: "40", times: "All times", rate: "60%", rarity: "Common" },
  { method: "Super Rod", pokemon: "Shellder", levels: "40", times: "All times", rate: "30%", rarity: "Common" },
  { method: "Super Rod", pokemon: "Tentacruel", levels: "40", times: "All times", rate: "7%", rarity: "Rare" },
  { method: "Super Rod", pokemon: "Lanturn", levels: "40", times: "All times", rate: "3%", rarity: "Rare" }
]);

const ROUTE_48_ENCOUNTERS = Object.freeze([
  { method: "Walking · Morning/Day", pokemon: "Tauros", levels: "20", times: "Morning, day", rate: "21%", rarity: "Common" },
  { method: "Walking · Morning/Day", pokemon: "Gloom", levels: "22–24", times: "Morning, day", rate: "20%", rarity: "Common" },
  { method: "Walking · Morning/Day", pokemon: "Farfetch'd", levels: "24", times: "Morning, day", rate: "20%", rarity: "Common" },
  { method: "Walking · Morning/Day", pokemon: "Hoppip", levels: "20", times: "Morning, day", rate: "11%", rarity: "Common" },
  { method: "Walking · Morning/Day", pokemon: "Fearow", levels: "21", times: "Morning, day", rate: "10%", rarity: "Common" },
  { method: "Walking · Morning/Day", pokemon: "Vulpix", levels: "21", times: "Morning, day", rate: "9%", rarity: "Common" },
  { method: "Walking · Morning/Day", pokemon: "Girafarig", levels: "20", times: "Morning, day", rate: "5%", rarity: "Uncommon" },
  { method: "Walking · Morning/Day", pokemon: "Diglett", levels: "20", times: "Morning, day", rate: "4%", rarity: "Rare" },
  { method: "Walking · Night", pokemon: "Vulpix", levels: "21–25", times: "Night", rate: "29%", rarity: "Common" },
  { method: "Walking · Night", pokemon: "Tauros", levels: "20", times: "Night", rate: "21%", rarity: "Common" },
  { method: "Walking · Night", pokemon: "Gloom", levels: "22–24", times: "Night", rate: "20%", rarity: "Common" },
  { method: "Walking · Night", pokemon: "Hoppip", levels: "20", times: "Night", rate: "11%", rarity: "Common" },
  { method: "Walking · Night", pokemon: "Fearow", levels: "21", times: "Night", rate: "10%", rarity: "Common" },
  { method: "Walking · Night", pokemon: "Girafarig", levels: "20", times: "Night", rate: "5%", rarity: "Uncommon" },
  { method: "Walking · Night", pokemon: "Diglett", levels: "20", times: "Night", rate: "4%", rarity: "Rare" },
  { method: "Hoenn Sound", pokemon: "Plusle", levels: "20–21", times: "All times", rate: "20%", rarity: "Conditional" },
  { method: "Hoenn Sound", pokemon: "Minun", levels: "22–24", times: "All times", rate: "20%", rarity: "Conditional" },
  { method: "Sinnoh Sound", pokemon: "Shinx", levels: "20–24", times: "All times", rate: "40%", rarity: "Conditional" },
  { method: "Headbutt", pokemon: "Exeggcute", levels: "Not specified", times: "All times", rarity: "SoulSilver; rate/level not specified" },
  { method: "Headbutt", pokemon: "Hoothoot", levels: "Not specified", times: "All times", rarity: "SoulSilver; rate/level not specified" },
  { method: "Headbutt", pokemon: "Ledyba", levels: "Not specified", times: "All times", rarity: "SoulSilver; rate/level not specified" },
  { method: "Headbutt", pokemon: "Pineco", levels: "Not specified", times: "All times", rarity: "SoulSilver; rate/level not specified" }
]);


const CLIFF_EDGE_GATE_ENCOUNTERS = Object.freeze([
  { method: "Surfing", pokemon: "Wooper", levels: "20–30", times: "All times", rate: "90%", rarity: "Common" },
  { method: "Surfing", pokemon: "Quagsire", levels: "30–40", times: "All times", rate: "10%", rarity: "Rare" },
  { method: "Old Rod", pokemon: "Magikarp", levels: "10", times: "All times", rate: "100%", rarity: "Common" },
  { method: "Good Rod", pokemon: "Magikarp", levels: "20", times: "All times", rate: "95%", rarity: "Common" },
  { method: "Good Rod", pokemon: "Poliwag", levels: "20", times: "All times", rate: "5%", rarity: "Rare" },
  { method: "Super Rod", pokemon: "Magikarp", levels: "40", times: "All times", rate: "90%", rarity: "Common" },
  { method: "Super Rod", pokemon: "Poliwag", levels: "40", times: "All times", rate: "10%", rarity: "Uncommon" }
]);

const CLIFF_CAVE_ENCOUNTERS = Object.freeze([
  { method: "1F/2F/B1F · Walking · Morning/Day", pokemon: "Golbat", levels: "22", times: "Morning, day", rate: "20%", rarity: "Common" },
  { method: "1F/2F/B1F · Walking · Morning/Day", pokemon: "Geodude", levels: "19", times: "Morning, day", rate: "20%", rarity: "Common" },
  { method: "1F/2F/B1F · Walking · Morning/Day", pokemon: "Machop", levels: "19", times: "Morning, day", rate: "10%", rarity: "Common" },
  { method: "1F/2F/B1F · Walking · Morning/Day", pokemon: "Onix", levels: "20", times: "Morning, day", rate: "10%", rarity: "Common" },
  { method: "1F/2F/B1F · Walking · Morning/Day", pokemon: "Krabby", levels: "20", times: "Morning, day", rate: "10%", rarity: "Common" },
  { method: "1F/2F/B1F · Walking · Morning/Day", pokemon: "Kingler", levels: "22", times: "Morning, day", rate: "10%", rarity: "Common" },
  { method: "1F/2F/B1F · Walking · Morning/Day", pokemon: "Wooper", levels: "18", times: "Morning, day", rate: "5%", rarity: "Uncommon" },
  { method: "1F/2F/B1F · Walking · Morning/Day", pokemon: "Quagsire", levels: "20", times: "Morning, day", rate: "5%", rarity: "Uncommon" },
  { method: "1F/2F/B1F · Walking · Morning/Day", pokemon: "Graveler", levels: "20", times: "Morning, day", rate: "4%", rarity: "Uncommon" },
  { method: "1F/2F/B1F · Walking · Morning/Day", pokemon: "Machoke", levels: "22", times: "Morning, day", rate: "4%", rarity: "Uncommon" },
  { method: "1F/2F/B1F · Walking · Morning/Day", pokemon: "Steelix", levels: "23", times: "Morning, day", rate: "2%", rarity: "Rare" },
  { method: "1F/2F/B1F · Walking · Night", pokemon: "Golbat", levels: "20–22", times: "Night", rate: "24%", rarity: "Common" },
  { method: "1F/2F/B1F · Walking · Night", pokemon: "Geodude", levels: "19", times: "Night", rate: "20%", rarity: "Common" },
  { method: "1F/2F/B1F · Walking · Night", pokemon: "Machop", levels: "19", times: "Night", rate: "10%", rarity: "Common" },
  { method: "1F/2F/B1F · Walking · Night", pokemon: "Onix", levels: "20", times: "Night", rate: "10%", rarity: "Common" },
  { method: "1F/2F/B1F · Walking · Night", pokemon: "Krabby", levels: "20", times: "Night", rate: "10%", rarity: "Common" },
  { method: "1F/2F/B1F · Walking · Night", pokemon: "Kingler", levels: "22", times: "Night", rate: "10%", rarity: "Common" },
  { method: "1F/2F/B1F · Walking · Night", pokemon: "Zubat", levels: "18", times: "Night", rate: "5%", rarity: "Uncommon" },
  { method: "1F/2F/B1F · Walking · Night", pokemon: "Misdreavus", levels: "20", times: "Night", rate: "5%", rarity: "Uncommon" },
  { method: "1F/2F/B1F · Walking · Night", pokemon: "Machoke", levels: "22", times: "Night", rate: "4%", rarity: "Uncommon" },
  { method: "1F/2F/B1F · Walking · Night", pokemon: "Steelix", levels: "23", times: "Night", rate: "2%", rarity: "Rare" },
  { method: "Radio · Hoenn Sound", pokemon: "Absol", levels: "20–22", times: "Hoenn Sound", rate: "20%", rarity: "Conditional" },
  { method: "Radio · Hoenn Sound", pokemon: "Makuhita", levels: "19–20", times: "Hoenn Sound", rate: "20%", rarity: "Conditional" },
  { method: "Radio · Sinnoh Sound", pokemon: "Bronzor", levels: "20–22", times: "Sinnoh Sound", rate: "20%", rarity: "Conditional" },
  { method: "Radio · Sinnoh Sound", pokemon: "Chingling", levels: "19–20", times: "Sinnoh Sound", rate: "20%", rarity: "Conditional" },
  { method: "B1F · Rock Smash", pokemon: "Krabby", levels: "20–26", times: "All times", rate: "90%", rarity: "Common" },
  { method: "B1F · Rock Smash", pokemon: "Kingler", levels: "28–31", times: "All times", rate: "10%", rarity: "Rare" }
]);

const EMBEDDED_TOWER_ENCOUNTERS = Object.freeze([
  { method: "Special encounter · SoulSilver", pokemon: "Groudon", levels: "50", times: "Requires the Blue Orb", rarity: "Stationary legendary" },
  { method: "Special encounter · Both versions", pokemon: "Rayquaza", levels: "50", times: "Requires Groudon and Kyogre in the same game and the Jade Orb", rarity: "Stationary legendary" }
]);

function renderEncounters(locationName) {
  const encounters = locationName === "Route 32" ? ROUTE_32_ENCOUNTERS : locationName === "Union Cave" ? UNION_CAVE_ENCOUNTERS : locationName === "Route 33" ? ROUTE_33_ENCOUNTERS : locationName === "Azalea Town" ? AZALEA_TOWN_ENCOUNTERS : locationName === "Route 34" ? ROUTE_34_ENCOUNTERS : locationName === "Route 35" ? ROUTE_35_ENCOUNTERS : locationName === "Route 36" ? ROUTE_36_ENCOUNTERS : locationName === "Route 37" ? ROUTE_37_ENCOUNTERS : locationName === "Route 38" ? ROUTE_38_ENCOUNTERS : locationName === "Route 39" ? ROUTE_39_ENCOUNTERS : locationName === "Route 40" ? ROUTE_40_ENCOUNTERS : locationName === "Route 41" ? ROUTE_41_ENCOUNTERS : locationName === "Route 42" ? ROUTE_42_ENCOUNTERS : locationName === "Route 43" ? ROUTE_43_ENCOUNTERS : locationName === "Route 44" ? ROUTE_44_ENCOUNTERS : locationName === "Route 45" ? ROUTE_45_ENCOUNTERS : locationName === "Route 46" ? ROUTE_46_ENCOUNTERS : locationName === "Route 47" ? ROUTE_47_ENCOUNTERS : locationName === "Route 48" ? ROUTE_48_ENCOUNTERS : locationName === "Cliff Edge Gate" ? CLIFF_EDGE_GATE_ENCOUNTERS : locationName === "Cliff Cave" ? CLIFF_CAVE_ENCOUNTERS : locationName === "Embedded Tower" ? EMBEDDED_TOWER_ENCOUNTERS : locationName === "Whirl Islands" ? WHIRL_ISLANDS_ENCOUNTERS : null;
  if (!encounters) return null;
  const section = document.createElement("section");
  section.className = "location-encounters";
  const heading = document.createElement("strong");
  heading.textContent = "Wild Pokémon · SoulSilver";
  const note = document.createElement("p");
  note.className = "encounter-note";
  note.textContent = locationName === "Union Cave" ? "Encounter tables are separated by floor (1F, B1F, B2F). Percentages are shown where listed by the reference; Radio encounters require the matching broadcast, and Lapras appears as a special Friday encounter on B2F." : locationName === "Route 33" ? "Route 33 is a short, rainy route. Walking encounters vary by time of day; Radio encounters require the matching broadcast, and Headbutt encounters vary by tree group." : locationName === "Azalea Town" ? "Headbutt encounters are listed for SoulSilver; the reference does not provide exact rates or levels for these tree encounters." : locationName === "Route 34" ? "Walking, Surfing, fishing, Headbutt, Radio, and swarm encounters are shown for SoulSilver. Radio and swarm entries require their respective conditions." : locationName === "Route 35" ? "Walking encounters vary by time of day; surfing, fishing, Headbutt tree groups, Radio broadcasts, and Yanma swarms have separate entries." : locationName === "Route 36" ? "SoulSilver walking encounters vary by time of day. Plusle and Minun require Hoenn Sound, Shinx requires Sinnoh Sound, Headbutt details are not fully listed by the reference, and Sudowoodo is a special level 20 interaction." : locationName === "Route 37" ? "SoulSilver walking encounters vary by time of day; Headbutt entries vary by tree group, while Plusle and Minun require Hoenn Sound and Shinx requires Sinnoh Sound." : locationName === "Route 38" ? "Walking encounters vary by time of day. Headbutt entries include regular tree groups and a special tree reached with Rock Climb; Plusle and Minun require Hoenn Sound, Shinx requires Sinnoh Sound, and Snubbull appears during a swarm." : locationName === "Route 39" ? "Walking encounters vary by time of day; Headbutt encounters vary by tree group, and Plusle, Minun, and Shinx require the matching radio broadcast." : locationName === "Route 40" ? "This sea route has Surfing encounters and fishing tables. Good Rod and Super Rod species vary by time of day; Route 40 has no separate walking encounter table." : locationName === "Route 41" ? "This sea route surrounds the Whirl Islands. SoulSilver Surfing and fishing encounters are listed here; access into the islands requires Whirlpool." : locationName === "Route 42" ? "Walking encounters vary by time of day; Radio encounters require the matching broadcast. Headbutt encounter rates and levels are not specified in the reference." : locationName === "Route 43" ? "Walking encounters vary by time of day; Radio and Headbutt entries are conditional. The route also has Surfing and fishing tables." : locationName === "Route 44" ? "Walking, Radio, Headbutt, Surfing, fishing, and Remoraid swarm encounters are listed. Headbutt rates and levels are not specified in the reference." : locationName === "Route 45" ? "SoulSilver walking encounters, Radio species, Swablu swarms, Headbutt, Surfing, and fishing are listed. Headbutt rates and levels are not specified by the reference." : locationName === "Route 46" ? "Walking encounters vary by time of day. Plusle and Minun require Hoenn Sound, Shinx requires Sinnoh Sound, and Headbutt rates and levels are not specified by the reference." : locationName === "Route 47" ? "Route 47 has multiple terrain levels. Surfing and fishing encounters are shown alongside walking, Radio, swarm, and separate Headbutt areas; Headbutt rates and levels are not specified." : locationName === "Route 48" ? "Walking encounters vary by time of day; Radio Pokémon require Hoenn or Sinnoh Sound. Headbutt rates and levels are not specified by the reference." : locationName === "Cliff Edge Gate" ? "Water encounters are in the small lake; the lake is accessible after obtaining Rock Climb." : locationName === "Cliff Cave" ? "Encounter coverage combines the shared 1F/2F/B1F walking and Radio tables. Rock Smash encounters occur on B1F; verify floor-specific details in the later accuracy audit." : locationName === "Embedded Tower" ? "These are stationary legendary encounters, not random wild encounters. Groudon is the SoulSilver orb encounter; Rayquaza requires both Groudon and Kyogre." : locationName === "Whirl Islands" ? "Encounter tables are grouped by floor. Radio species require the matching broadcast; Lugia is a special story encounter in the bottom chamber, not a normal wild encounter." : "Rarity labels are shown instead of percentages where the reference lists categories rather than exact rates. Sound-based encounters require the matching radio broadcast; swarm encounters are conditional.";
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
