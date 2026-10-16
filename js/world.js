import { encounterSections } from "./atlas-encounter-sections.js";
import { mountEvTraining } from "./atlas-ev-training.js";
import { locationEncounterReference } from "./data/atlas-route-reference.js";
import { locationDetails, locationDetailSearchText } from "./data/atlas-location-reference.js";
const ATLAS_GAME_ID = "soulsilver";
import { ATLAS_LOCATIONS as LOCATIONS } from "./data/atlas-locations.js";
import { mapsForLocation } from "./data/atlas-maps.js";

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
  const reference = locationEncounterReference(ATLAS_GAME_ID, locationName);
  const encounters = reference ? reference.encounters : locationName === "Safari Zone" ? SAFARI_ZONE_ENCOUNTERS : null;
  const section = document.createElement("section");
  section.className = "location-encounters";
  section.setAttribute("aria-label", `${locationName} encounters`);
  const heading = document.createElement("h3");
  heading.textContent = reference ? "Pokémon encounters · SoulSilver" : "Wild Pokémon · SoulSilver";
  if (!encounters || encounters.length === 0) {
    const message = document.createElement("p");
    message.className = "encounter-note";
    message.textContent = reference?.status === "no-fixed-wild" ? "No fixed wild encounters at this location. Gifts, trades and Trainer battles are separate from wild encounters." : "Encounter data has not been added for this location yet.";
    section.append(heading, message);
    for (const text of reference?.notes || []) {
      const detail = document.createElement("p");
      detail.className = "encounter-note";
      detail.textContent = text;
      section.append(detail);
    }
    return section;
  }
  const note = document.createElement("p");
  note.className = "encounter-note";
  note.textContent = reference ? "Rates are species shares within the listed method, time and area after an encounter starts; abilities and Repel can affect results. Morning: 04:00–09:59; day: 10:00–19:59; night: 20:00–03:59. Radio entries require the matching broadcast after the National Pokédex. Outbreak entries require today’s announced outbreak. Headbutt groups depend on the tree and Trainer ID; special trees require Rock Climb. Conditional species replace normal encounter slots." : "Standard walking coverage spans all 12 areas. Block-attracted encounters are being added area by area; water/fishing coverage and encounter levels still need a full accuracy audit.";
  section.append(heading, note);
  for (const text of reference?.notes || []) {
    const detail = document.createElement("p");
    detail.className = "encounter-note";
    detail.textContent = text;
    section.append(detail);
  }

  for (const bucket of encounterSections(encounters)) {
    const disclosure = document.createElement("details");
    disclosure.className = "encounter-section";
    disclosure.dataset.encounterSection = bucket.id;
    const summary = document.createElement("summary");
    summary.textContent = `${bucket.title} (${bucket.entries.length})`;
    disclosure.append(summary);
    const methods = [...new Set(bucket.entries.map(({encounter}) => encounter.method))];
    for (const method of methods) {
      const group = document.createElement("div");
      group.className = "encounter-method";
      const methodHeading = document.createElement("h4");
      methodHeading.textContent = method;
      const entries = document.createElement("div");
      entries.className = "encounter-entries";
      for (const {encounter, index} of bucket.entries.filter(({encounter}) => encounter.method === method)) {
        const row = document.createElement("div");
        row.className = "encounter-entry";
        row.dataset.encounterIndex = String(index);
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
      disclosure.append(group);
    }
    section.append(disclosure);
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
    const routeText = locationDetailSearchText(ATLAS_GAME_ID, location.name);
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
    const reference = locationDetails(ATLAS_GAME_ID, location.name);
    if (reference) {
      const isRoute = location.type === "route";
      const describe = (entry) => {
        const area = (entry.section || "").split(" · ").filter(part => !["Items", "Items & Apricorns", "Floors", "Rewards & services"].includes(part)).join(" · ");
        return [entry.location, area, ...(entry.conditions || []).filter(condition => !(entry.location || "").toLowerCase().includes(condition.toLowerCase()))].filter(Boolean).join(" · ");
      };
      const groups = [
        ["Items & Apricorns", "items", reference.items.filter(item => item.kind !== "machine")],
        ["TMs & HMs", "machines", reference.items.filter(item => item.kind === "machine")],
        ["Gifts & trades", "gifts", reference.gifts],
        ["Shops & exchanges", "offers", reference.offers],
        ["NPCs & trainers", "people", [...reference.services.map(item => ({...item, recordType: "service"})), ...reference.trainers.map(item => ({...item, recordType: "trainer"}))]]
      ];
      for (const [title, key, records] of groups) {
        const group = document.createElement("details");
        group.className = "location-reference";
        group.dataset.reference = key;
        if (isRoute && ["items", "people"].includes(key)) group.classList.add("route-features");
        const summary = document.createElement("summary");
        summary.textContent = `${title} (${records.length})`;
        group.append(summary);
        if (!records.length) {
          const note = document.createElement("p");
          note.className = "reference-empty";
          note.textContent = reference.emptyNotes[key === "machines" ? "items" : key] || "No records in this category in the reviewed SoulSilver references.";
          group.append(note);
        } else {
          const entries = document.createElement("ul");
          entries.className = "reference-entries";
          for (const record of records) {
            const item = document.createElement("li");
            item.dataset.referenceId = record.id;
            const name = document.createElement("strong");
            name.textContent = record.name;
            const detail = document.createElement("p");
            if (key === "gifts") {
              const level = /^\d+$/.test(record.level) ? `Lv. ${record.level}` : record.level;
              detail.textContent = [record.kind === "egg" ? "Egg" : record.kind === "trade" ? "NPC trade" : record.kind === "prize" ? "Prize Pokémon" : record.kind === "event" ? "Event gift" : "Gift Pokémon", level, describe(record), record.availability].filter(Boolean).join(" · ");
            } else if (key === "people") {
              detail.textContent = [record.role === "ally" ? "Ally" : "", record.area, record.detail, ...(record.conditions || [])].filter(Boolean).join(" · ");
            } else {
              detail.textContent = [record.cost, describe(record)].filter(Boolean).join(" · ");
            }
            item.append(name, detail);
            if (record.party?.length) {
              const party = document.createElement("p");
              party.className = "reference-party";
              party.textContent = `Team: ${record.party.join("; ")}`;
              item.append(party);
            }
            entries.append(item);
          }
          group.append(entries);
        }
        staticSection.append(group);
      }
    }
    const sources = document.createElement("details");
    sources.className = "location-sources";
    const sourcesHeading = document.createElement("summary");
    sourcesHeading.textContent = "Sources";
    const sourceList = document.createElement("ul");
    for (const source of [...location.sources, ...(reference?.sources || []).map(url => ({url, label: url.includes("github.com") ? "Game event reference" : `Reference · ${decodeURIComponent(url.split("/wiki/")[1] || "Location").replaceAll("_", " ")}`}))]) {
      const entry = document.createElement("li");
      const link = document.createElement("a");
      link.href = source.url;
      link.textContent = source.label;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      entry.append(link);
      sourceList.append(entry);
    }
    if (locationEncounterReference(ATLAS_GAME_ID, location.name)) {
      for (const [label, file] of [
        ["SoulSilver encounter slots", "files/fielddata/encountdata/gs_enc_data.json"],
        ["HGSS encounter selection rules", "src/field/encounter_check.c"],
        ["SoulSilver Headbutt groups", "files/arc/headbutt.json"],
        ["HGSS map encounter banks", "src/data/map_headers.h"],
        ["HGSS roaming rules", "src/field_roamer.c"]
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
    const maps = mapsForLocation(ATLAS_GAME_ID, location.name);
    const map = maps[0];
    let mapSourceLink;
    if (map) {
      const entry = document.createElement("li");
      const link = document.createElement("a");
      mapSourceLink = link;
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
      const caption = document.createElement("figcaption");
      caption.textContent = location.name;
      if (maps.length) {
        links.classList.add("has-map");
        const mapLink = document.createElement("a");
        mapLink.className = "location-map-link";
        mapLink.target = "_blank";
        mapLink.rel = "noopener noreferrer";
        const fallback = document.createElement("p");
        fallback.className = "map-hint";
        fallback.textContent = "Map unavailable. Choose another map or use the connections to continue.";
        fallback.hidden = true;
        const announcement = document.createElement("span");
        announcement.className = "map-announcement";
        announcement.setAttribute("role", "status");
        let activeImage;
        let selection;
        let previous;
        let next;
        function showMap(index, userSelected = false) {
          const selected = maps[index];
          const description = `${location.name} · ${selected.label}`;
          const image = document.createElement("img");
          activeImage = image;
          image.className = "location-map";
          image.alt = selected.label.includes("reference view")
            ? `${description} in HeartGold and SoulSilver`
            : `${description} map in HeartGold and SoulSilver; north is up`;
          image.width = selected.width;
          image.height = selected.height;
          image.decoding = "async";
          image.loading = userSelected || matches.length === 1 ? "eager" : "lazy";
          mapLink.href = `../assets/maps/${selected.file}`;
          mapLink.setAttribute("aria-label", `Open full-size ${description} map in a new tab`);
          const hint = document.createElement("span");
          hint.className = "map-hint";
          hint.textContent = "Open full-size map";
          mapLink.replaceChildren(image, hint);
          mapLink.hidden = false;
          fallback.hidden = true;
          caption.textContent = selected.label === "Overview" ? location.name : description;
          if (mapSourceLink) mapSourceLink.href = selected.source;
          if (selection) {
            selection.value = String(index);
            previous.disabled = index === 0;
            next.disabled = index === maps.length - 1;
          }
          image.addEventListener("error", () => {
            if (activeImage !== image) return;
            mapLink.hidden = true;
            fallback.hidden = false;
            announcement.textContent = `${description}: map unavailable.`;
          }, { once: true });
          image.src = mapLink.href;
          if (userSelected) announcement.textContent = `Showing ${description}.`;
        }
        if (maps.length > 1) {
          const controls = document.createElement("div");
          controls.className = "map-controls";
          const label = document.createElement("label");
          label.textContent = "Map / area";
          selection = document.createElement("select");
          selection.className = "map-select";
          selection.setAttribute("aria-label", `${location.name} map or floor`);
          for (const [index, map] of maps.entries()) {
            const option = document.createElement("option");
            option.value = String(index);
            option.textContent = map.label;
            selection.append(option);
          }
          label.append(selection);
          previous = document.createElement("button");
          next = document.createElement("button");
          for (const [button, text, offset] of [[previous, "Previous map", -1], [next, "Next map", 1]]) {
            button.type = "button";
            button.textContent = text;
            button.addEventListener("click", () => showMap(Number(selection.value) + offset, true));
          }
          selection.addEventListener("change", () => showMap(Number(selection.value), true));
          controls.append(label, previous, next);
          current.append(controls);
        }
        current.append(mapLink, fallback, announcement);
        showMap(0);
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
          openAtlasLocation(name);
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

const atlasPanel = document.querySelector("#atlas-browser");
const evPanel = document.querySelector("#ev-training");
const browseLink = document.querySelector("#atlas-browse-link");
const evFinder = mountEvTraining({panel: evPanel, onOpenLocation: openAtlasLocation});

function openAtlasLocation(name, push = true, focus = true) {
  if (!LOCATIONS.some(location => location.name === name)) name = "New Bark Town";
  if (push) history.pushState(null, "", `#location=${encodeURIComponent(name)}`);
  evPanel.hidden = true;
  atlasPanel.hidden = false;
  browseLink.hidden = true;
  searchInput.value = name;
  typeSelect.value = "all";
  renderLocations({exactName: name});
  if (focus) {
    const destination = list.querySelector("h2");
    destination.focus({preventScroll: true});
    destination.scrollIntoView({block: "start"});
  }
}

function showAtlasRoute(focus = true) {
  if (location.hash === "#ev-training") {
    atlasPanel.hidden = true;
    evPanel.hidden = false;
    browseLink.hidden = false;
    evFinder.render();
    if (focus) document.querySelector("#ev-training-title").focus();
  } else if (location.hash.startsWith("#location=")) {
    let name;
    try { name = decodeURIComponent(location.hash.slice(10)); } catch { name = "New Bark Town"; }
    openAtlasLocation(name, false, focus);
  } else {
    evPanel.hidden = true;
    atlasPanel.hidden = false;
    browseLink.hidden = true;
    renderLocations({exactName: searchInput.value || "New Bark Town"});
    if (focus) searchInput.focus();
  }
}
function searchLocations() {
  if (location.hash.startsWith("#location=")) history.replaceState(null, "", "#atlas");
  renderLocations();
}
searchInput.addEventListener("input", searchLocations);
typeSelect.addEventListener("change", searchLocations);
window.addEventListener("hashchange", () => showAtlasRoute());
window.addEventListener("popstate", () => showAtlasRoute());
showAtlasRoute(false);
