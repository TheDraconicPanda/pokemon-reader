import { routeEncounters, routeFeatures } from "./data/atlas-route-reference.js";
const ATLAS_GAME_ID = "soulsilver";
import { ATLAS_LOCATIONS as LOCATIONS } from "./data/atlas-locations.js";
import { ATLAS_MAPS } from "./data/atlas-maps.js";

// Explicit orientation for existing overland links. Unresolved links and interiors
// remain available under Other connections; never infer direction from list order.
const COMPASS_PAIRS = [
  ["New Bark Town", "Route 29", "west"],
  ["New Bark Town", "Route 27", "east"],
  ["Route 27", "Route 26", "east"],
  ["Route 26", "Pokémon League Reception Gate", "north"],
  ["Pokémon League Reception Gate", "Victory Road", "north"],
  ["Victory Road", "Indigo Plateau", "north"],
  ["Pokémon League Reception Gate", "Route 28", "west"],
  ["Route 28", "Mt. Silver", "west"],
  ["Route 34", "Ilex Forest", "south"],
  ["Route 35", "Route 36", "north"],
  ["Route 40", "Frontier Access", "north"],
  ["Frontier Access", "Battle Frontier", "north"],
  ["Cianwood City", "Cliff Edge Gate", "west"],
  ["Cliff Edge Gate", "Route 47", "west"],
  ["Route 29", "Cherrygrove City", "west"],
  ["Route 29", "Route 46", "north"],
  ["Cherrygrove City", "Route 30", "north"],
  ["Route 30", "Route 31", "north"],
  ["Route 31", "Violet City", "west"],
  ["Violet City", "Route 32", "south"],
  ["Violet City", "Route 36", "west"],
  ["Route 32", "Union Cave", "south"],
  ["Union Cave", "Route 33", "south"],
  ["Route 33", "Azalea Town", "west"],
  ["Azalea Town", "Ilex Forest", "west"],
  ["Route 34", "Goldenrod City", "north"],
  ["Goldenrod City", "Route 35", "north"],
  ["Route 35", "National Park", "north"],
  ["National Park", "Route 36", "east"],
  ["Route 36", "Route 37", "north"],
  ["Route 37", "Ecruteak City", "north"],
  ["Ecruteak City", "Route 38", "west"],
  ["Route 38", "Route 39", "west"],
  ["Route 39", "Olivine City", "south"],
  ["Olivine City", "Route 40", "west"],
  ["Route 40", "Route 41", "south"],
  ["Route 41", "Cianwood City", "west"],
  ["Ecruteak City", "Route 42", "east"],
  ["Route 42", "Mahogany Town", "east"],
  ["Mahogany Town", "Route 43", "north"],
  ["Route 43", "Lake of Rage", "north"],
  ["Mahogany Town", "Route 44", "east"],
  ["Route 44", "Ice Path", "east"],
  ["Ice Path", "Blackthorn City", "south"],
  ["Blackthorn City", "Route 45", "south"],
  ["Route 45", "Route 46", "south"],
  ["Route 47", "Route 48", "north"],
  ["Route 48", "Safari Zone Gate", "north"],
  ["Safari Zone Gate", "Safari Zone", "north"]
];
const OPPOSITE = { north: "south", south: "north", east: "west", west: "east" };
function connectionDirection(source, target) {
  for (const [from, to, direction] of COMPASS_PAIRS) {
    if (source === from && target === to) return direction;
    if (source === to && target === from) return OPPOSITE[direction];
  }
  return "other";
}

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

const AZALEA_TOWN_ENCOUNTERS = Object.freeze([
  { method: "Headbutt · Group A", pokemon: "Spearow", levels: "—", times: "All times", rate: "Not listed", rarity: "Common" },
  { method: "Headbutt · Group A", pokemon: "Aipom", levels: "—", times: "All times", rate: "Not listed", rarity: "Uncommon" },
  { method: "Headbutt · Group A", pokemon: "Heracross", levels: "—", times: "All times", rate: "Not listed", rarity: "Uncommon" }
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


const SAFARI_ZONE_GATE_ENCOUNTERS = Object.freeze([
  { method: "Headbutt · SoulSilver", pokemon: "Exeggcute", levels: "Not specified", times: "All times", rarity: "Encounter listed; rate/level not specified" },
  { method: "Headbutt · SoulSilver", pokemon: "Hoothoot", levels: "Not specified", times: "All times", rarity: "Encounter listed; rate/level not specified" },
  { method: "Headbutt · SoulSilver", pokemon: "Ledyba", levels: "Not specified", times: "All times", rarity: "SoulSilver" },
  { method: "Headbutt · SoulSilver", pokemon: "Pineco", levels: "Not specified", times: "All times", rarity: "Encounter listed; rate/level not specified" }
]);

const SAFARI_ZONE_ENCOUNTERS = Object.freeze([
  { method: "Plains · Walking · Morning/Day", pokemon: "Rattata", levels: "15–17", times: "Morning, day", rarity: "Standard encounter" },
  { method: "Plains · Walking · Morning/Day", pokemon: "Abra", levels: "15–17", times: "Morning, day", rarity: "Standard encounter" },
  { method: "Plains · Walking · Morning/Day", pokemon: "Girafarig", levels: "15–17", times: "Morning, day", rarity: "Standard encounter" },
  { method: "Plains · Walking · Morning/Day", pokemon: "Smeargle", levels: "17", times: "Morning, day", rarity: "Standard encounter" },
  { method: "Plains · Walking · Night", pokemon: "Raticate", levels: "15–17", times: "Night", rarity: "Standard encounter" },
  { method: "Plains · Walking · Night", pokemon: "Abra", levels: "15–17", times: "Night", rarity: "Standard encounter" },
  { method: "Plains · Walking · Night", pokemon: "Girafarig", levels: "15–17", times: "Night", rarity: "Standard encounter" },
  { method: "Plains · Walking · Night", pokemon: "Stantler", levels: "17", times: "Night", rarity: "Standard encounter" },
  { method: "Meadow · Walking · Morning", pokemon: "Jigglypuff", levels: "15–17", times: "Morning", rarity: "Standard encounter" },
  { method: "Meadow · Walking · Morning", pokemon: "Hoppip", levels: "15–17", times: "Morning", rarity: "Standard encounter" },
  { method: "Meadow · Walking · Morning", pokemon: "Skiploom", levels: "17", times: "Morning", rarity: "Standard encounter" },
  { method: "Meadow · Walking · Day", pokemon: "Sunkern", levels: "15–17", times: "Day", rarity: "Standard encounter" },
  { method: "Meadow · Walking · Day", pokemon: "Hoppip", levels: "16–17", times: "Day", rarity: "Standard encounter" },
  { method: "Meadow · Walking · Night", pokemon: "Marill", levels: "15–17", times: "Night", rarity: "Standard encounter" },
  { method: "Meadow · Walking · Night", pokemon: "Wooper", levels: "15–17", times: "Night", rarity: "Standard encounter" },
  { method: "Meadow · Surfing", pokemon: "Magikarp", levels: "15–17", times: "All times", rarity: "Standard encounter" },
  { method: "Meadow · Surfing", pokemon: "Wooper", levels: "15–17", times: "All times", rarity: "Standard encounter" },
  { method: "Meadow · Surfing", pokemon: "Marill", levels: "16–17", times: "All times", rarity: "Standard encounter" },
  { method: "Savannah · Walking · Morning/Day", pokemon: "Nidoran♀", levels: "15–17", times: "Morning, day", rarity: "Standard encounter" },
  { method: "Savannah · Walking · Morning/Day", pokemon: "Nidoran♂", levels: "15–17", times: "Morning, day", rarity: "Standard encounter" },
  { method: "Savannah · Walking · Morning/Day", pokemon: "Tauros", levels: "15–17", times: "Morning, day", rarity: "Standard encounter" },
  { method: "Savannah · Walking · Morning/Day", pokemon: "Rhyhorn", levels: "17", times: "Morning, day", rarity: "Standard encounter" },
  { method: "Savannah · Walking · Night", pokemon: "Nidorina", levels: "15–17", times: "Night", rarity: "Standard encounter" },
  { method: "Savannah · Walking · Night", pokemon: "Nidorino", levels: "15–17", times: "Night", rarity: "Standard encounter" },
  { method: "Savannah · Walking · Night", pokemon: "Zubat", levels: "15–17", times: "Night", rarity: "Standard encounter" },
  { method: "Peak · Walking · Morning/Day", pokemon: "Geodude", levels: "15–17", times: "Morning, day", rarity: "Standard encounter" },
  { method: "Peak · Walking · Morning/Day", pokemon: "Magnemite", levels: "15–16", times: "Morning, day", rarity: "Standard encounter" },
  { method: "Peak · Walking · Morning/Day", pokemon: "Graveler", levels: "16–17", times: "Morning, day", rarity: "Standard encounter" },
  { method: "Peak · Walking · Morning/Day", pokemon: "Magneton", levels: "17", times: "Morning, day", rarity: "Standard encounter" },
  { method: "Peak · Walking · Night", pokemon: "Wobbuffet", levels: "16–17", times: "Night", rarity: "Standard encounter" },
  { method: "Rocky Beach · Walking · Morning/Day", pokemon: "Doduo", levels: "15–17", times: "Morning, day", rarity: "Standard encounter" },
  { method: "Rocky Beach · Walking · Morning/Day", pokemon: "Slowpoke", levels: "15–17", times: "Morning, day", rarity: "Standard encounter" },
  { method: "Rocky Beach · Walking · Morning/Day", pokemon: "Krabby", levels: "15–17", times: "Morning, day", rarity: "Standard encounter" },
  { method: "Rocky Beach · Walking · Night", pokemon: "Zubat", levels: "15–17", times: "Night", rarity: "Standard encounter" },
  { method: "Wetland · Walking · Morning/Day", pokemon: "Spearow", levels: "15–17", times: "Morning, day", rarity: "Standard encounter" },
  { method: "Wetland · Walking · Morning/Day", pokemon: "Sentret", levels: "15–17", times: "Morning, day", rarity: "Standard encounter" },
  { method: "Wetland · Walking · Morning/Day", pokemon: "Farfetch'd", levels: "15–17", times: "Morning, day", rarity: "Standard encounter" },
  { method: "Wetland · Walking · Morning/Day", pokemon: "Ditto", levels: "17", times: "Morning, day", rarity: "Standard encounter" },
  { method: "Wetland · Walking · Night", pokemon: "Wooper", levels: "15–17", times: "Night", rarity: "Standard encounter" },
  { method: "Wetland · Walking · Night", pokemon: "Psyduck", levels: "15–16", times: "Night", rarity: "Standard encounter" },
  { method: "Wetland · Surfing", pokemon: "Poliwag", levels: "15–16", times: "All times", rarity: "Standard encounter" },
  { method: "Wetland · Surfing", pokemon: "Wooper", levels: "15–16", times: "All times", rarity: "Standard encounter" },
  { method: "Wetland · Surfing", pokemon: "Psyduck", levels: "16–17", times: "All times", rarity: "Standard encounter" },
  { method: "Marshland · Walking · Morning/Day", pokemon: "Ekans", levels: "15–17", times: "Morning, day", rarity: "Standard encounter" },
  { method: "Marshland · Walking · Morning/Day", pokemon: "Koffing", levels: "15–17", times: "Morning, day", rarity: "Standard encounter" },
  { method: "Marshland · Walking · Morning/Day", pokemon: "Weezing", levels: "15–17", times: "Morning, day", rarity: "Standard encounter" },
  { method: "Marshland · Walking · Night", pokemon: "Wooper", levels: "15–17", times: "Night", rarity: "Standard encounter" },
  { method: "Marshland · Walking · Night", pokemon: "Oddish", levels: "15–17", times: "Night", rarity: "Standard encounter" },
  { method: "Marshland · Surfing", pokemon: "Poliwag", levels: "15–17", times: "All times", rarity: "Standard encounter" },
  { method: "Marshland · Surfing", pokemon: "Wooper", levels: "15–17", times: "All times", rarity: "Standard encounter" },
  { method: "Marshland · Surfing", pokemon: "Grimer", levels: "15–17", times: "All times", rarity: "Standard encounter" },
  { method: "Wasteland · Walking · Morning/Day", pokemon: "Kangaskhan", levels: "15–17", times: "Morning, day", rarity: "Standard encounter" },
  { method: "Wasteland · Walking · Morning/Day", pokemon: "Magnemite", levels: "15–17", times: "Morning, day", rarity: "Standard encounter" },
  { method: "Wasteland · Walking · Morning/Day", pokemon: "Onix", levels: "15–16", times: "Morning, day", rarity: "Standard encounter" },
  { method: "Wasteland · Walking · Morning/Day", pokemon: "Machop", levels: "16–17", times: "Morning, day", rarity: "Standard encounter" },
  { method: "Wasteland · Walking · Morning/Day", pokemon: "Machoke", levels: "17", times: "Morning, day", rarity: "Standard encounter" },
  { method: "Forest · Walking · Morning/Day", pokemon: "Bellsprout", levels: "15–17", times: "Morning, day", rarity: "Standard encounter" },
  { method: "Forest · Walking · Morning/Day", pokemon: "Pidgey", levels: "15–17", times: "Morning, day", rarity: "Standard encounter" },
  { method: "Forest · Walking · Morning/Day", pokemon: "Mr. Mime", levels: "15–17", times: "Morning, day", rarity: "Standard encounter" },
  { method: "Forest · Walking · Morning/Day", pokemon: "Misdreavus", levels: "17", times: "Morning, day", rarity: "Standard encounter" },
  { method: "Forest · Walking · Night", pokemon: "Gastly", levels: "15–17", times: "Night", rarity: "Standard encounter" },
  { method: "Forest · Walking · Night", pokemon: "Voltorb", levels: "15–17", times: "Night", rarity: "SoulSilver" },
  { method: "Swamp · Walking · Morning/Day", pokemon: "Sentret", levels: "15–17", times: "Morning, day", rarity: "Standard encounter" },
  { method: "Swamp · Walking · Morning/Day", pokemon: "Jigglypuff", levels: "15–17", times: "Morning, day", rarity: "Standard encounter" },
  { method: "Swamp · Walking · Morning/Day", pokemon: "Paras", levels: "15–17", times: "Morning, day", rarity: "Standard encounter" },
  { method: "Swamp · Walking · Morning/Day", pokemon: "Murkrow", levels: "17", times: "Morning, day", rarity: "Standard encounter" },
  { method: "Swamp · Walking · Night", pokemon: "Sentret", levels: "15–17", times: "Night", rarity: "Standard encounter" },
  { method: "Swamp · Walking · Night", pokemon: "Drowzee", levels: "15–17", times: "Night", rarity: "Standard encounter" },
  { method: "Swamp · Walking · Night", pokemon: "Murkrow", levels: "15–17", times: "Night", rarity: "Standard encounter" },
  { method: "Swamp · Walking · Night", pokemon: "Hypno", levels: "17", times: "Night", rarity: "Standard encounter" },
  { method: "Mountain · Walking · Morning/Day", pokemon: "Rattata", levels: "15–16", times: "Morning, day", rarity: "Standard encounter" },
  { method: "Mountain · Walking · Morning/Day", pokemon: "Raticate", levels: "15–17", times: "Morning, day", rarity: "Standard encounter" },
  { method: "Mountain · Walking · Morning/Day", pokemon: "Lickitung", levels: "15–17", times: "Morning, day", rarity: "Standard encounter" },
  { method: "Mountain · Walking · Morning/Day", pokemon: "Magneton", levels: "17", times: "Morning, day", rarity: "Standard encounter" },
  { method: "Mountain · Walking · Morning/Day", pokemon: "Larvitar", levels: "17", times: "Morning, day", rarity: "Standard encounter" },
  { method: "Mountain · Walking · Night", pokemon: "Zubat", levels: "15–17", times: "Night", rarity: "Standard encounter" },
  { method: "Mountain · Walking · Night", pokemon: "Golbat", levels: "15–17", times: "Night", rarity: "Standard encounter" },
  { method: "Mountain · Walking · Night", pokemon: "Rattata", levels: "15–16", times: "Night", rarity: "Standard encounter" },
  { method: "Mountain · Walking · Night", pokemon: "Magneton", levels: "17", times: "Night", rarity: "Standard encounter" },
  { method: "Desert · Walking · Morning/Day", pokemon: "Sandshrew", levels: "15–17", times: "Morning, day", rarity: "Standard encounter" },
  { method: "Desert · Walking · Morning/Day", pokemon: "Sandslash", levels: "15–17", times: "Morning, day", rarity: "Standard encounter" },
  { method: "Desert · Walking · Morning/Day", pokemon: "Cubone", levels: "15–16", times: "Morning, day", rarity: "Standard encounter" },
  { method: "Desert · Walking · Morning/Day", pokemon: "Marowak", levels: "17", times: "Morning, day", rarity: "Standard encounter" },
  { method: "Desert · Walking · Night", pokemon: "Sandshrew", levels: "15–17", times: "Night", rarity: "Standard encounter" },
  { method: "Desert · Walking · Night", pokemon: "Sandslash", levels: "15–17", times: "Night", rarity: "Standard encounter" },
  { method: "Desert · Walking · Night", pokemon: "Fearow", levels: "15–17", times: "Night", rarity: "Standard encounter" },
  { method: "Meadow · Walking · Day", pokemon: "Jigglypuff", levels: "15–17", times: "Day", rarity: "Standard encounter" },
  { method: "Meadow · Walking · Day", pokemon: "Skiploom", levels: "17", times: "Day", rarity: "Standard encounter" },
  { method: "Meadow · Walking · Night", pokemon: "Jigglypuff", levels: "15–17", times: "Night", rarity: "Standard encounter" },
  { method: "Meadow · Walking · Night", pokemon: "Clefairy", levels: "17", times: "Night", rarity: "Standard encounter" },
  { method: "Savannah · Walking · Night", pokemon: "Golbat", levels: "17", times: "Night", rarity: "Standard encounter" },
  { method: "Peak · Walking · Morning/Day", pokemon: "Magmar", levels: "17", times: "Morning, day", rarity: "Standard encounter" },
  { method: "Peak · Walking · Night", pokemon: "Geodude", levels: "15–17", times: "Night", rarity: "Standard encounter" },
  { method: "Peak · Walking · Night", pokemon: "Magnemite", levels: "15–16", times: "Night", rarity: "Standard encounter" },
  { method: "Peak · Walking · Night", pokemon: "Magneton", levels: "17", times: "Night", rarity: "Standard encounter" },
  { method: "Rocky Beach · Walking · Morning/Day", pokemon: "Slowbro", levels: "17", times: "Morning, day", rarity: "Standard encounter" },
  { method: "Rocky Beach · Walking · Night", pokemon: "Slowpoke", levels: "15–17", times: "Night", rarity: "Standard encounter" },
  { method: "Rocky Beach · Walking · Night", pokemon: "Krabby", levels: "15–17", times: "Night", rarity: "Standard encounter" },
  { method: "Rocky Beach · Walking · Night", pokemon: "Slowbro", levels: "17", times: "Night", rarity: "Standard encounter" },
  { method: "Wetland · Walking · Night", pokemon: "Quagsire", levels: "16–17", times: "Night", rarity: "Standard encounter" },
  { method: "Wetland · Walking · Night", pokemon: "Golduck", levels: "17", times: "Night", rarity: "Standard encounter" },
  { method: "Marshland · Walking · Morning/Day", pokemon: "Arbok", levels: "17", times: "Morning, day", rarity: "Standard encounter" },
  { method: "Marshland · Walking · Morning/Day", pokemon: "Grimer", levels: "17", times: "Morning, day", rarity: "Standard encounter" },
  { method: "Marshland · Walking · Night", pokemon: "Koffing", levels: "15–17", times: "Night", rarity: "Standard encounter" },
  { method: "Marshland · Walking · Night", pokemon: "Gloom", levels: "17", times: "Night", rarity: "Standard encounter" },
  { method: "Wetland · Surfing", pokemon: "Quagsire", levels: "16–17", times: "All times", rarity: "Standard encounter" },
  { method: "Marshland · Surfing", pokemon: "Goldeen", levels: "15–17", times: "All times", rarity: "Standard encounter" },
  { method: "Meadow · Old Rod", pokemon: "Magikarp", levels: "15–17", times: "All times", rarity: "Standard encounter" },
  { method: "Meadow · Old Rod", pokemon: "Poliwag", levels: "12–15", times: "All times", rarity: "Standard encounter" },
  { method: "Meadow · Good Rod", pokemon: "Magikarp", levels: "22–24", times: "All times", rarity: "Standard encounter" },
  { method: "Meadow · Good Rod", pokemon: "Poliwag", levels: "22–24", times: "All times", rarity: "Standard encounter" },
  { method: "Meadow · Good Rod", pokemon: "Poliwhirl", levels: "24–25", times: "All times", rarity: "Standard encounter" },
  { method: "Meadow · Super Rod", pokemon: "Poliwag", levels: "35–36", times: "All times", rarity: "Standard encounter" },
  { method: "Meadow · Super Rod", pokemon: "Poliwhirl", levels: "35–38", times: "All times", rarity: "Standard encounter" },
  { method: "Wetland · Old Rod", pokemon: "Magikarp", levels: "12–14", times: "All times", rarity: "Standard encounter" },
  { method: "Wetland · Old Rod", pokemon: "Poliwag", levels: "12–15", times: "All times", rarity: "Standard encounter" },
  { method: "Wetland · Good Rod", pokemon: "Poliwag", levels: "22–24", times: "All times", rarity: "Standard encounter" },
  { method: "Wetland · Good Rod", pokemon: "Poliwhirl", levels: "23–25", times: "All times", rarity: "Standard encounter" },
  { method: "Wetland · Super Rod", pokemon: "Poliwag", levels: "35–37", times: "All times", rarity: "Standard encounter" },
  { method: "Wetland · Super Rod", pokemon: "Poliwhirl", levels: "35–37", times: "All times", rarity: "Standard encounter" },
  { method: "Marshland · Old Rod", pokemon: "Magikarp", levels: "12–15", times: "All times", rarity: "Standard encounter" },
  { method: "Marshland · Good Rod", pokemon: "Magikarp", levels: "22–24", times: "All times", rarity: "Standard encounter" },
  { method: "Marshland · Good Rod", pokemon: "Goldeen", levels: "22–24", times: "All times", rarity: "Standard encounter" },
  { method: "Marshland · Good Rod", pokemon: "Seaking", levels: "24–25", times: "All times", rarity: "Standard encounter" },
  { method: "Marshland · Super Rod", pokemon: "Goldeen", levels: "35–37", times: "All times", rarity: "Standard encounter" },
  { method: "Marshland · Super Rod", pokemon: "Seaking", levels: "35–37", times: "All times", rarity: "Standard encounter" },
  { method: "Marshland · Super Rod", pokemon: "Dratini", levels: "36–37", times: "All times", rarity: "Standard encounter" },
  { method: "Plains · Walking · Blocks", pokemon: "Girafarig", levels: "40", times: "Any time", rarity: "Requires 3 Plains blocks; available after 0 days" },
  { method: "Plains · Walking · Blocks", pokemon: "Stantler", levels: "40", times: "Any time", rarity: "Requires 3 Plains blocks; available after 0 days" },
  { method: "Plains · Walking · Blocks", pokemon: "Manectric", levels: "45", times: "Any time", rarity: "Requires 3 Forest blocks; available after 0 days" },
  { method: "Plains · Walking · Blocks", pokemon: "Shinx", levels: "43", times: "Any time", rarity: "Requires 15 Plains blocks; available after 0 days" },
  { method: "Plains · Walking · Blocks", pokemon: "Smeargle", levels: "41", times: "Any time", rarity: "Requires 10 Plains blocks; available after 0 days" },
  { method: "Plains · Walking · Blocks", pokemon: "Zigzagoon", levels: "44", times: "Any time", rarity: "Requires 3 Forest blocks; available after 0 days" },
  { method: "Plains · Walking · Blocks", pokemon: "Ponyta", levels: "42", times: "Any time", rarity: "Requires 15 Forest blocks; available after 0 days" },
  { method: "Plains · Walking · Blocks", pokemon: "Houndoom", levels: "45", times: "Any time", rarity: "Requires 5 Peak blocks; available after 0 days" },
  { method: "Plains · Walking · Blocks", pokemon: "Zangoose", levels: "43", times: "Any time", rarity: "Requires 10 Peak blocks; available after 0 days" },
  { method: "Plains · Walking · Blocks", pokemon: "Lotad", levels: "42", times: "Any time", rarity: "Requires 12 Waterside blocks; available after 0 days" },
  { method: "Plains · Walking · Blocks", pokemon: "Surskit", levels: "46", times: "Any time", rarity: "Requires 28 Waterside blocks; available after 0 days" },
  { method: "Meadow · Walking · Blocks", pokemon: "Raticate", levels: "40", times: "Any time", rarity: "Requires 5 Plains blocks; available after 0 days" },
  { method: "Meadow · Walking · Blocks", pokemon: "Chansey", levels: "42", times: "Any time", rarity: "Requires 12 Plains blocks; available after 0 days" },
  { method: "Meadow · Walking · Blocks", pokemon: "Skiploom", levels: "40", times: "Any time", rarity: "Requires 8 Forest blocks; available after 0 days" },
  { method: "Meadow · Walking · Blocks", pokemon: "Nuzleaf", levels: "38", times: "Any time", rarity: "Requires 28 Forest blocks; available after 0 days" },
  { method: "Meadow · Walking · Blocks", pokemon: "Geodude", levels: "45", times: "Any time", rarity: "Requires 3 Peak blocks; available after 0 days" },
  { method: "Meadow · Walking · Blocks", pokemon: "Clefairy", levels: "42", times: "Any time", rarity: "Requires 3 Peak blocks; available after 0 days" },
  { method: "Meadow · Walking · Blocks", pokemon: "Wooper", levels: "40", times: "Any time", rarity: "Requires 3 Waterside blocks; available after 0 days" },
  { method: "Meadow · Walking · Blocks", pokemon: "Seedot", levels: "45", times: "Any time", rarity: "Requires 18 Plains blocks; available after 0 days" },
  { method: "Meadow · Walking · Blocks", pokemon: "Nuzleaf", levels: "48", times: "Any time", rarity: "Requires 18 Forest blocks; available after 10 days" },
  { method: "Meadow · Walking · Blocks", pokemon: "Nosepass", levels: "45", times: "Any time", rarity: "Requires 18 Peak blocks; available after 20 days" },
  { method: "Meadow · Walking · Blocks", pokemon: "Riolu", levels: "45", times: "Any time", rarity: "Requires 10 Forest blocks + 14 Peak blocks; available after 70 days" },
  { method: "Rocky Beach · Old Rod", pokemon: "Magikarp", levels: "12–14", times: "All times", rarity: "Standard encounter" },
  { method: "Rocky Beach · Old Rod", pokemon: "Goldeen", levels: "13–15", times: "All times", rarity: "Standard encounter" },
  { method: "Rocky Beach · Old Rod", pokemon: "Krabby", levels: "13–15", times: "All times", rarity: "Standard encounter" },
  { method: "Rocky Beach · Good Rod", pokemon: "Magikarp", levels: "22–23", times: "All times", rarity: "Standard encounter" },
  { method: "Rocky Beach · Good Rod", pokemon: "Goldeen", levels: "22–23", times: "All times", rarity: "Standard encounter" },
  { method: "Rocky Beach · Good Rod", pokemon: "Krabby", levels: "22–25", times: "All times", rarity: "Standard encounter" },
  { method: "Rocky Beach · Super Rod", pokemon: "Goldeen", levels: "35–38", times: "All times", rarity: "Standard encounter" },
  { method: "Rocky Beach · Super Rod", pokemon: "Seaking", levels: "35–38", times: "All times", rarity: "Standard encounter" },
  { method: "Rocky Beach · Super Rod", pokemon: "Kingler", levels: "38–39", times: "All times", rarity: "Standard encounter" },
  { method: "Savannah · Walking · Blocks", pokemon: "Tauros", levels: "41", times: "Any time", rarity: "Requires 5 Plains blocks; available after 0 days" },
  { method: "Savannah · Walking · Blocks", pokemon: "Zigzagoon", levels: "38", times: "Any time", rarity: "Requires 10 Plains blocks; available after 0 days" },
  { method: "Savannah · Walking · Blocks", pokemon: "Luxio", levels: "45–46", times: "Any time", rarity: "Requires 24 Plains blocks; available after 0 days" },
  { method: "Savannah · Walking · Blocks", pokemon: "Houndour", levels: "42", times: "Any time", rarity: "Requires 4 Forest blocks; available after 0 days" },
  { method: "Savannah · Walking · Blocks", pokemon: "Rhyhorn", levels: "41", times: "Any time", rarity: "Requires 5 Peak blocks; available after 0 days" },
  { method: "Savannah · Walking · Blocks", pokemon: "Rhydon", levels: "44", times: "Any time", rarity: "Requires 10 Peak blocks; available after 0 days" },
  { method: "Savannah · Walking · Blocks", pokemon: "Azurill", levels: "42", times: "Any time", rarity: "Requires 5 Water blocks; available after 0 days" },
  { method: "Savannah · Walking · Blocks", pokemon: "Cacturne", levels: "42", times: "Any time", rarity: "Requires 18 Forest blocks; available after 20 days" },
  { method: "Savannah · Walking · Blocks", pokemon: "Shroomish", levels: "45", times: "Any time", rarity: "Requires 6 Plains blocks; available after 20 days" },
  { method: "Savannah · Walking · Blocks", pokemon: "Torkoal", levels: "46–47", times: "Any time", rarity: "Requires 18 Forest blocks + 18 Peak blocks; available after 30 days" },
  { method: "Peak · Walking · Blocks", pokemon: "Linoone", levels: "46", times: "Any time", rarity: "Requires 5 Plains blocks; available after 0 days" },
  { method: "Peak · Walking · Blocks", pokemon: "Zangoose", levels: "43–45", times: "Any time", rarity: "Requires 12 Plains blocks; available after 0 days" },
  { method: "Peak · Walking · Blocks", pokemon: "Paras", levels: "42", times: "Any time", rarity: "Requires 3 Forest blocks; available after 0 days" },
  { method: "Peak · Walking · Blocks", pokemon: "Fearow", levels: "44", times: "Any time", rarity: "Requires 5 Forest blocks; available after 0 days" },
  { method: "Peak · Walking · Blocks", pokemon: "Magmar", levels: "41", times: "Any time", rarity: "Requires 10 Peak blocks; available after 0 days" },
  { method: "Peak · Walking · Blocks", pokemon: "Wobbuffet", levels: "41", times: "Any time", rarity: "Requires 10 Peak blocks; available after 0 days" },
  { method: "Peak · Walking · Blocks", pokemon: "Lairon", levels: "45", times: "Any time", rarity: "Requires 24 Peak blocks; available after 0 days" },
  { method: "Peak · Walking · Blocks", pokemon: "Slowbro", levels: "45", times: "Any time", rarity: "Requires 5 Water blocks; available after 0 days" },
  { method: "Peak · Walking · Blocks", pokemon: "Bronzor", levels: "45", times: "Any time", rarity: "Requires 7 Forest blocks; available after 30 days" },
  { method: "Peak · Walking · Blocks", pokemon: "Spheal", levels: "45", times: "Any time", rarity: "Requires 18 Peak blocks + 18 Water blocks; available after 40 days" },
  { method: "Peak · Walking · Blocks", pokemon: "Vigoroth", levels: "47", times: "Any time", rarity: "Requires 10 Plains blocks + 19 Forest blocks; available after 60 days" },
  { method: "Rocky Beach · Walking · Blocks", pokemon: "Dodrio", levels: "42", times: "Any time", rarity: "Requires 4 Plains blocks; available after 0 days" },
  { method: "Rocky Beach · Walking · Blocks", pokemon: "Electrike", levels: "42", times: "Any time", rarity: "Requires 10 Plains blocks; available after 0 days" },
  { method: "Rocky Beach · Walking · Blocks", pokemon: "Mareep", levels: "43", times: "Any time", rarity: "Requires 5 Forest blocks; available after 0 days" },
  { method: "Rocky Beach · Walking · Blocks", pokemon: "Manectric", levels: "37", times: "Any time", rarity: "Requires 10 Forest blocks; available after 0 days" },
  { method: "Rocky Beach · Walking · Blocks", pokemon: "Budew", levels: "40", times: "Any time", rarity: "Requires 18 Forest blocks; available after 0 days" },
  { method: "Rocky Beach · Walking · Blocks", pokemon: "Slowbro", levels: "42", times: "Any time", rarity: "Requires 3 Peak blocks; available after 0 days" },
  { method: "Rocky Beach · Walking · Blocks", pokemon: "Kingler", levels: "40", times: "Any time", rarity: "Requires 8 Peak blocks; available after 0 days" },
  { method: "Rocky Beach · Walking · Blocks", pokemon: "Aron", levels: "44–45", times: "Any time", rarity: "Requires 24 Peak blocks; available after 0 days" },
  { method: "Rocky Beach · Walking · Blocks", pokemon: "Slowbro", levels: "37", times: "Any time", rarity: "Requires 5 Water blocks; available after 0 days" },
  { method: "Rocky Beach · Walking · Blocks", pokemon: "Gible", levels: "44", times: "Any time", rarity: "Requires 13 Plains blocks + 17 Peak blocks; available after 100 days" },
  { method: "Wetland · Walking · Blocks", pokemon: "Furret", levels: "37", times: "Any time", rarity: "Requires 2 Plains blocks; available after 0 days" },
  { method: "Wetland · Walking · Blocks", pokemon: "Surskit", levels: "40", times: "Any time", rarity: "Requires 6 Plains blocks; available after 0 days" },
  { method: "Wetland · Walking · Blocks", pokemon: "Lombre", levels: "47", times: "Any time", rarity: "Requires 14 Plains blocks; available after 0 days" },
  { method: "Wetland · Walking · Blocks", pokemon: "Farfetch'd", levels: "41", times: "Any time", rarity: "Requires 3 Forest blocks; available after 0 days" },
  { method: "Wetland · Walking · Blocks", pokemon: "Pachirisu", levels: "43", times: "Any time", rarity: "Requires 8 Forest blocks; available after 0 days" },
  { method: "Wetland · Walking · Blocks", pokemon: "Doduo", levels: "45", times: "Any time", rarity: "Requires 4 Peak blocks; available after 0 days" },
  { method: "Wetland · Walking · Blocks", pokemon: "Golduck", levels: "40", times: "Any time", rarity: "Requires 5 Peak blocks; available after 0 days" },
  { method: "Wetland · Walking · Blocks", pokemon: "Ditto", levels: "41", times: "Any time", rarity: "Requires 15 Water blocks; available after 0 days" },
  { method: "Wetland · Walking · Blocks", pokemon: "Buizel", levels: "45", times: "Any time", rarity: "Requires 18 Water blocks; available after 0 days" },
  { method: "Wetland · Walking · Blocks", pokemon: "Shelgon", levels: "46", times: "Any time", rarity: "Requires 21 Peak blocks; available after 70 days" },
  { method: "Wetland · Surfing · Blocks", pokemon: "Quagsire", levels: "37", times: "Any time", rarity: "Requires 3 Water blocks; available after 0 days" },
  { method: "Wetland · Surfing · Blocks", pokemon: "Golduck", levels: "37–45", times: "Any time", rarity: "Requires 4 Water blocks; available after 0 days" },
  { method: "Wetland · Old Rod · Blocks", pokemon: "Poliwhirl", levels: "17–18", times: "Any time", rarity: "Requires 2 Water blocks; available after 0 days" },
  { method: "Wetland · Good Rod · Blocks", pokemon: "Corphish", levels: "26–28", times: "Any time", rarity: "Requires 10 Water blocks; available after 0 days" },
  { method: "Wetland · Super Rod · Blocks", pokemon: "Gyarados", levels: "45–48", times: "Any time", rarity: "Requires 6 Water blocks; available after 0 days" },
  { method: "Forest · Walking · Blocks", pokemon: "Mr. Mime", levels: "45", times: "Any time", rarity: "Requires 3 Plains blocks; available after 0 days" },
  { method: "Forest · Walking · Blocks", pokemon: "Budew", levels: "47", times: "Any time", rarity: "Requires 24 Plains blocks; available after 0 days" },
  { method: "Forest · Walking · Blocks", pokemon: "Misdreavus", levels: "42", times: "Any time", rarity: "Requires 4 Forest blocks; available after 0 days" },
  { method: "Forest · Walking · Blocks", pokemon: "Electabuzz", levels: "41", times: "Any time", rarity: "Requires 4 Peak blocks; available after 0 days" },
  { method: "Forest · Walking · Blocks", pokemon: "Lickitung", levels: "40", times: "Any time", rarity: "Requires 3 Water blocks; available after 0 days" },
  { method: "Forest · Walking · Blocks", pokemon: "Bidoof", levels: "40", times: "Any time", rarity: "Requires 10 Water blocks; available after 0 days" },
  { method: "Forest · Walking · Blocks", pokemon: "Surskit", levels: "42", times: "Any time", rarity: "Requires 24 Water blocks; available after 0 days" },
  { method: "Forest · Walking · Blocks", pokemon: "Shuppet", levels: "46", times: "Any time", rarity: "Requires 18 Forest blocks; available after 20 days" },
  { method: "Forest · Walking · Blocks", pokemon: "Beldum", levels: "44", times: "Any time", rarity: "Requires 21 Peak blocks; available after 70 days" },
  { method: "Forest · Walking · Blocks", pokemon: "Bronzong", levels: "45", times: "Any time", rarity: "Requires 9 Forest blocks + 19 Peak blocks; available after 110 days" },
  { method: "Marshland · Walking · Blocks", pokemon: "Gloom", levels: "42", times: "Any time", rarity: "Requires 2 Plains blocks; available after 0 days" },
  { method: "Marshland · Walking · Blocks", pokemon: "Jumpluff", levels: "38", times: "Any time", rarity: "Requires 5 Plains blocks; available after 0 days" },
  { method: "Marshland · Walking · Blocks", pokemon: "Diglett", levels: "43", times: "Any time", rarity: "Requires 5 Peak blocks; available after 0 days" },
  { method: "Marshland · Walking · Blocks", pokemon: "Shuckle", levels: "44", times: "Any time", rarity: "Requires 8 Peak blocks; available after 0 days" },
  { method: "Marshland · Walking · Blocks", pokemon: "Muk", levels: "38", times: "Any time", rarity: "Requires 8 Water blocks; available after 0 days" },
  { method: "Marshland · Walking · Blocks", pokemon: "Seviper", levels: "48", times: "Any time", rarity: "Requires 18 Plains blocks; available after 10 days" },
  { method: "Marshland · Walking · Blocks", pokemon: "Carnivine", levels: "41", times: "Any time", rarity: "Requires 18 Forest blocks; available after 20 days" },
  { method: "Marshland · Walking · Blocks", pokemon: "Croagunk", levels: "44", times: "Any time", rarity: "Requires 21 Forest blocks; available after 20 days" },
  { method: "Marshland · Walking · Blocks", pokemon: "Roselia", levels: "46", times: "Any time", rarity: "Requires 25 Forest blocks; available after 20 days" },
  { method: "Marshland · Walking · Blocks", pokemon: "Banette", levels: "44", times: "Any time", rarity: "Requires 25 Peak blocks; available after 30 days" },
  { method: "Marshland · Surfing · Blocks", pokemon: "Jumpluff", levels: "47", times: "Any time", rarity: "Requires 10 Water blocks; available after 0 days" },
  { method: "Marshland · Surfing · Blocks", pokemon: "Quagsire", levels: "43", times: "Any time", rarity: "Requires 13 Water blocks; available after 0 days" },
  { method: "Marshland · Surfing · Blocks", pokemon: "Muk", levels: "48", times: "Any time", rarity: "Requires 16 Water blocks; available after 0 days" },
  { method: "Marshland · Old Rod · Blocks", pokemon: "Poliwag", levels: "16–18", times: "Any time", rarity: "Requires 2 Water blocks; available after 0 days" },
  { method: "Marshland · Good Rod · Blocks", pokemon: "Gyarados", levels: "26–29", times: "Any time", rarity: "Requires 3 Water blocks; available after 0 days" },
  { method: "Marshland · Super Rod · Blocks", pokemon: "Barboach", levels: "42–45", times: "Any time", rarity: "Requires 4 Water blocks; available after 0 days" },
  { method: "Swamp · Walking · Blocks", pokemon: "Parasect", levels: "41", times: "Any time", rarity: "Requires 3 Plains blocks; available after 0 days" },
  { method: "Swamp · Walking · Blocks", pokemon: "Furret", levels: "42", times: "Any time", rarity: "Requires 5 Plains blocks; available after 0 days" },
  { method: "Swamp · Walking · Blocks", pokemon: "Pachirisu", levels: "47", times: "Any time", rarity: "Requires 10 Plains blocks; available after 0 days" },
  { method: "Swamp · Walking · Blocks", pokemon: "Murkrow", levels: "37", times: "Day", rarity: "Requires 5 Forest blocks; available after 0 days" },
  { method: "Swamp · Walking · Blocks", pokemon: "Hypno", levels: "37", times: "Night", rarity: "Requires 5 Forest blocks; available after 0 days" },
  { method: "Swamp · Walking · Blocks", pokemon: "Weepinbell", levels: "46", times: "Any time", rarity: "Requires 8 Forest blocks; available after 0 days" },
  { method: "Swamp · Walking · Blocks", pokemon: "Chimecho", levels: "47", times: "Any time", rarity: "Requires 15 Forest blocks; available after 0 days" },
  { method: "Swamp · Walking · Blocks", pokemon: "Voltorb", levels: "42", times: "Any time", rarity: "Requires 10 Peak blocks; available after 0 days" },
  { method: "Swamp · Walking · Blocks", pokemon: "Duskull", levels: "38", times: "Any time", rarity: "Requires 28 Peak blocks; available after 0 days" },
  { method: "Swamp · Walking · Blocks", pokemon: "Floatzel", levels: "44", times: "Any time", rarity: "Requires 10 Water blocks; available after 0 days" },
  { method: "Swamp · Walking · Blocks", pokemon: "Bagon", levels: "45", times: "Any time", rarity: "Requires 9 Forest blocks + 19 Peak blocks; available after 110 days" },
  { method: "Swamp · Surfing · Blocks", pokemon: "Seaking", levels: "42", times: "Any time", rarity: "Requires 4 Water blocks; available after 0 days" },
  { method: "Swamp · Surfing · Blocks", pokemon: "Krabby", levels: "47", times: "Any time", rarity: "Requires 10 Water blocks; available after 0 days" },
  { method: "Swamp · Surfing · Blocks", pokemon: "Duskull", levels: "48", times: "Any time", rarity: "Requires 18 Water blocks; available after 40 days" },
  { method: "Swamp · Old Rod · Blocks", pokemon: "Goldeen", levels: "17", times: "Any time", rarity: "Requires 4 Water blocks; available after 0 days" },
  { method: "Swamp · Old Rod · Blocks", pokemon: "Seaking", levels: "17", times: "Any time", rarity: "Requires 10 Water blocks; available after 0 days" },
  { method: "Swamp · Good Rod · Blocks", pokemon: "Seaking", levels: "27", times: "Any time", rarity: "Requires 6 Water blocks; available after 0 days" },
  { method: "Swamp · Good Rod · Blocks", pokemon: "Dratini", levels: "29", times: "Any time", rarity: "Requires 10 Water blocks; available after 0 days" },
  { method: "Swamp · Super Rod · Blocks", pokemon: "Dragonair", levels: "42–45", times: "Any time", rarity: "Requires 20 Water blocks; available after 0 days" },
  { method: "Wasteland · Walking · Blocks", pokemon: "Manectric", levels: "41", times: "Any time", rarity: "Requires 3 Plains blocks; available after 0 days" },
  { method: "Wasteland · Walking · Blocks", pokemon: "Illumise", levels: "46", times: "Any time", rarity: "Requires 10 Plains blocks; available after 0 days" },
  { method: "Wasteland · Walking · Blocks", pokemon: "Bellsprout", levels: "41", times: "Any time", rarity: "Requires 3 Forest blocks; available after 0 days" },
  { method: "Wasteland · Walking · Blocks", pokemon: "Machoke", levels: "40", times: "Any time", rarity: "Requires 5 Peak blocks; available after 0 days" },
  { method: "Wasteland · Walking · Blocks", pokemon: "Skorupi", levels: "44–45", times: "Any time", rarity: "Requires 28 Peak blocks; available after 0 days" },
  { method: "Wasteland · Walking · Blocks", pokemon: "Golduck", levels: "45", times: "Any time", rarity: "Requires 3 Water blocks; available after 0 days" },
  { method: "Wasteland · Walking · Blocks", pokemon: "Kingler", levels: "48", times: "Any time", rarity: "Requires 10 Water blocks; available after 0 days" },
  { method: "Wasteland · Walking · Blocks", pokemon: "Medicham", levels: "44", times: "Any time", rarity: "Requires 18 Forest blocks; available after 20 days" },
  { method: "Wasteland · Walking · Blocks", pokemon: "Breloom", levels: "46", times: "Any time", rarity: "Requires 21 Forest blocks; available after 20 days" },
  { method: "Wasteland · Walking · Blocks", pokemon: "Solrock", levels: "45–46", times: "Any time", rarity: "Requires 21 Peak blocks; available after 30 days" },
  { method: "Mountain · Walking · Blocks", pokemon: "Magneton", levels: "42", times: "Any time", rarity: "Requires 3 Plains blocks; available after 0 days" },
  { method: "Mountain · Walking · Blocks", pokemon: "Volbeat", levels: "46", times: "Any time", rarity: "Requires 10 Plains blocks; available after 0 days" },
  { method: "Mountain · Walking · Blocks", pokemon: "Chingling", levels: "38", times: "Any time", rarity: "Requires 10 Forest blocks; available after 0 days" },
  { method: "Mountain · Walking · Blocks", pokemon: "Meditite", levels: "44", times: "Any time", rarity: "Requires 20 Forest blocks; available after 0 days" },
  { method: "Mountain · Walking · Blocks", pokemon: "Larvitar", levels: "42", times: "Any time", rarity: "Requires 5 Peak blocks; available after 0 days" },
  { method: "Mountain · Walking · Blocks", pokemon: "Lunatone", levels: "46", times: "Any time", rarity: "Requires 15 Peak blocks; available after 0 days" },
  { method: "Mountain · Walking · Blocks", pokemon: "Krabby", levels: "43", times: "Any time", rarity: "Requires 3 Water blocks; available after 0 days" },
  { method: "Mountain · Walking · Blocks", pokemon: "Dusclops", levels: "45", times: "Any time", rarity: "Requires 18 Forest blocks; available after 20 days" },
  { method: "Mountain · Walking · Blocks", pokemon: "Metang", levels: "44", times: "Any time", rarity: "Requires 28 Peak blocks; available after 30 days" },
  { method: "Mountain · Walking · Blocks", pokemon: "Sealeo", levels: "45", times: "Any time", rarity: "Requires 7 Peak blocks + 17 Water blocks; available after 80 days" }










]);

function renderEncounters(locationName) {
  const encounters = routeEncounters(ATLAS_GAME_ID, locationName) ?? (locationName === "Union Cave" ? UNION_CAVE_ENCOUNTERS : locationName === "Azalea Town" ? AZALEA_TOWN_ENCOUNTERS : locationName === "Cliff Edge Gate" ? CLIFF_EDGE_GATE_ENCOUNTERS : locationName === "Cliff Cave" ? CLIFF_CAVE_ENCOUNTERS : locationName === "Embedded Tower" ? EMBEDDED_TOWER_ENCOUNTERS : locationName === "Safari Zone Gate" ? SAFARI_ZONE_GATE_ENCOUNTERS : locationName === "Safari Zone" ? SAFARI_ZONE_ENCOUNTERS : locationName === "Whirl Islands" ? WHIRL_ISLANDS_ENCOUNTERS : null);
  const section = document.createElement("section");
  section.className = "location-encounters";
  section.setAttribute("aria-label", `${locationName} encounters`);
  const heading = document.createElement("h3");
  heading.textContent = routeFeatures(ATLAS_GAME_ID, locationName) ? "Pokémon encounters · SoulSilver" : "Wild Pokémon · SoulSilver";
  if (!encounters) {
    const message = document.createElement("p");
    message.className = "encounter-note";
    message.textContent = "Encounter data has not been added for this location yet.";
    section.append(heading, message);
    return section;
  }
  const note = document.createElement("p");
  note.className = "encounter-note";
  note.textContent = routeFeatures(ATLAS_GAME_ID, locationName) ? "Rates are species shares within the listed method/time/tree group, after an encounter starts; abilities and Repel can change results. Morning: 04:00–09:59; day: 10:00–19:59; night: 20:00–03:59. Radio species require the matching broadcast after the National Pokédex; outbreak entries require today’s announced outbreak. Headbutt groups depend on the tree and Trainer ID; special trees require Rock Climb. Conditional entries replace normal encounter slots. Roaming Pokémon, once released, move between eligible routes and are not fixed route encounters." : locationName === "Union Cave" ? "Encounter tables are separated by floor (1F, B1F, B2F). Percentages are shown where listed by the reference; Radio encounters require the matching broadcast, and Lapras appears as a special Friday encounter on B2F." : locationName === "Azalea Town" ? "Headbutt encounters are listed for SoulSilver; the reference does not provide exact rates or levels for these tree encounters." : locationName === "Cliff Edge Gate" ? "Water encounters are in the small lake; the lake is accessible after obtaining Rock Climb." : locationName === "Cliff Cave" ? "Encounter coverage combines the shared 1F/2F/B1F walking and Radio tables. Rock Smash encounters occur on B1F; verify floor-specific details in the later accuracy audit." : locationName === "Embedded Tower" ? "These are stationary legendary encounters, not random wild encounters. Groudon is the SoulSilver orb encounter; Rayquaza requires both Groudon and Kyogre." : locationName === "Safari Zone Gate" ? "SoulSilver Headbutt species are listed; the reference does not provide encounter rates or levels for these tree encounters." : locationName === "Safari Zone" ? "Standard walking coverage spans all 12 areas. Block-attracted encounters are being added area by area; water/fishing coverage and encounter levels still need a full accuracy audit." : locationName === "Whirl Islands" ? "Encounter tables are grouped by floor. Radio species require the matching broadcast; Lugia is a special story encounter in the bottom chamber, not a normal wild encounter." : "Rarity labels are shown instead of percentages where the reference lists categories rather than exact rates. Sound-based encounters require the matching radio broadcast; swarm encounters are conditional.";
  section.append(heading, note);

  const methods = [...new Set(encounters.map((entry) => entry.method))];
  for (const method of methods) {
    const group = document.createElement("div");
    group.className = "encounter-method";
    const methodHeading = document.createElement("h4");
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

function renderLocations({ exactName = null } = {}) {
  const query = searchInput.value.trim().toLowerCase();
  const selectedType = typeSelect.value;
  const matches = LOCATIONS.filter((location) => {
    if (exactName !== null) return location.name === exactName;
    const matchesType = selectedType === "all" || location.type === selectedType;
    const route = routeFeatures(ATLAS_GAME_ID, location.name);
    const routeText = route ? [...route.npcs, ...route.trainers, ...route.items.map(item => `${item.name} ${item.location}`)].join(" ") : "";
    const searchable = `${routeText} ${location.name} ${(location.aliases || []).join(" ")} ${location.region} ${location.details} ${location.landmarks.join(" ")} ${location.access.join(" ")} ${TYPE_LABELS[location.type]}`.toLowerCase();
    return matchesType && searchable.includes(query);
  });

  countLabel.textContent = `${matches.length} of ${LOCATIONS.length} locations`;
  list.replaceChildren();

  for (const location of matches) {
    const card = document.createElement("article");
    card.className = "location-card";
    const overview = document.createElement("section");
    overview.className = "location-overview";

    const text = document.createElement("div");
    const heading = document.createElement("h2");
    heading.textContent = location.name;
    heading.tabIndex = -1;
    heading.id = `location-${LOCATIONS.indexOf(location)}`;
    card.setAttribute("aria-labelledby", heading.id);
    overview.setAttribute("aria-labelledby", heading.id);
    const details = document.createElement("p");
    details.textContent = `${location.region} · ${location.details}`;
    text.append(heading, details);

    const badge = document.createElement("span");
    badge.className = "location-type";
    badge.textContent = TYPE_LABELS[location.type];

    overview.append(text, badge);

    const staticSection = document.createElement("section");
    staticSection.className = "location-static";
    staticSection.setAttribute("aria-label", `${location.name} location information`);
    for (const [title, items] of [["Landmarks & features", location.landmarks], ["Access & progression", location.access]]) {
      const group = document.createElement("div");
      const titleElement = document.createElement("h3");
      titleElement.textContent = title;
      const itemsList = document.createElement("ul");
      for (const item of items) {
        const entry = document.createElement("li");
        entry.textContent = item;
        itemsList.append(entry);
      }
      group.append(titleElement, itemsList);
      staticSection.append(group);
    }
    const route = routeFeatures(ATLAS_GAME_ID, location.name);
    if (route) {
      for (const [title, lines] of [
        ["Items & Apricorns", route.items.map(item => `${item.name} — ${item.location}`)],
        ["NPCs & trainers", [...route.npcs, route.trainers.length ? `Trainers: ${route.trainers.join(", ")}.` : "No ordinary Trainer battles."]]
      ]) {
        const group = document.createElement("details");
        group.className = "route-features";
        const summary = document.createElement("summary");
        summary.textContent = title;
        const entries = document.createElement("ul");
        for (const line of lines) {
          const item = document.createElement("li");
          item.textContent = line;
          entries.append(item);
        }
        group.append(summary, entries);
        staticSection.append(group);
      }
    }
    const sources = document.createElement("details");
    sources.className = "location-sources";
    const sourcesHeading = document.createElement("summary");
    sourcesHeading.textContent = "Sources";
    const sourceList = document.createElement("ul");
    for (const source of [...location.sources, ...(route?.sources || [])]) {
      const entry = document.createElement("li");
      const link = document.createElement("a");
      link.href = source.url;
      link.textContent = source.label;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      entry.append(link);
      sourceList.append(entry);
    }
    if (route) {
      for (const [label, file] of [
        ["SoulSilver encounter slots", "files/fielddata/encountdata/gs_enc_data.json"],
        ["HGSS encounter selection rules", "src/field/encounter_check.c"],
        ["SoulSilver Headbutt groups", "files/arc/headbutt.json"]
      ]) {
        const entry = document.createElement("li");
        const link = document.createElement("a");
        link.href = `https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/${file}`;
        link.textContent = label;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        entry.append(link);
        sourceList.append(entry);
      }
    }
    const map = ATLAS_MAPS[location.name];
    if (map) {
      const entry = document.createElement("li");
      const link = document.createElement("a");
      link.href = map.source;
      link.textContent = "HGSS map image · Bulbagarden Archives";
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      entry.append(link);
      sourceList.append(entry);
    }
    sources.append(sourcesHeading, sourceList);
    staticSection.append(sources);

    const connectedNames = location.connections.filter((name) =>
      LOCATIONS.some((candidate) => candidate.name === name)
    );
    if (connectedNames.length) {
      const connections = document.createElement("div");
      connections.className = "location-connections";
      const label = document.createElement("strong");
      label.textContent = "Connected locations";
      const links = document.createElement("div");
      links.className = "connection-links";
      const groups = {};
      for (const direction of ["north", "west", "east", "south", "other"]) {
        const group = document.createElement("div");
        group.className = `compass-${direction}`;
        const caption = document.createElement("span");
        caption.className = "direction-label";
        caption.textContent = direction === "other" ? "Other connections" : direction[0].toUpperCase() + direction.slice(1);
        group.append(caption);
        groups[direction] = group;
      }
      const current = document.createElement("figure");
      current.className = "compass-current";
      const map = ATLAS_MAPS[location.name];
      const caption = document.createElement("figcaption");
      caption.textContent = location.name;
      if (map) {
        links.classList.add("has-map");
        const mapLink = document.createElement("a");
        mapLink.className = "location-map-link";
        mapLink.href = `../assets/maps/${map.file}`;
        mapLink.target = "_blank";
        mapLink.rel = "noopener noreferrer";
        mapLink.setAttribute("aria-label", `Open full-size ${location.name} map in a new tab`);
        const image = document.createElement("img");
        image.className = "location-map";
        image.alt = `${location.name} outdoor map in HeartGold and SoulSilver; north is up`;
        image.width = map.width;
        image.height = map.height;
        image.decoding = "async";
        image.loading = matches.length === 1 ? "eager" : "lazy";
        const hint = document.createElement("span");
        hint.className = "map-hint";
        hint.textContent = "Open full-size map";
        mapLink.append(image, hint);
        const fallback = document.createElement("p");
        fallback.className = "map-hint";
        fallback.textContent = "Map unavailable. Use the connections to continue.";
        fallback.hidden = true;
        image.addEventListener("error", () => {
          mapLink.hidden = true;
          fallback.hidden = false;
        }, { once: true });
        image.src = mapLink.href;
        current.append(mapLink, fallback);
      }
      current.append(caption);
      links.append(current);
      for (const name of connectedNames) {
        const link = document.createElement("button");
        link.type = "button";
        link.className = "connection-link";
        link.textContent = name;
        const direction = connectionDirection(location.name, name);
        link.setAttribute("aria-label", `${direction === "other" ? "Go to" : direction}: ${name}`);
        link.addEventListener("click", () => {
          searchInput.value = name;
          typeSelect.value = "all";
          renderLocations({ exactName: name });
          const destination = list.querySelector("h2");
          destination.focus({ preventScroll: true });
          destination.scrollIntoView({ block: "start" });
        });
        groups[direction].append(link);
      }
      for (const group of Object.values(groups)) {
        if (group.querySelector("button")) links.append(group);
      }
      connections.append(label, links);
      overview.append(connections);
    }

    overview.append(staticSection);
    card.append(overview, renderEncounters(location.name));
    list.append(card);
  }

  emptyMessage.hidden = matches.length !== 0;
}

searchInput.addEventListener("input", renderLocations);
typeSelect.addEventListener("change", renderLocations);
renderLocations({ exactName: "New Bark Town" });
