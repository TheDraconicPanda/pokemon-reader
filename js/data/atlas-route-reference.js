import { KANTO_ENCOUNTERS } from "./games/soulsilver/kanto-encounters.js";
import { SOULSILVER_LOCATION_ENCOUNTERS } from './games/soulsilver/location-encounters.js';
import { SOULSILVER_ROUTE_ENCOUNTERS } from './games/soulsilver/route-encounters.js';
import { SOULSILVER_ROUTE_FEATURES } from './games/soulsilver/route-features.js';
import { speciesIdForName } from './game-reference.js';

// Explicit game selection keeps future versions from inheriting SoulSilver data.
const REFERENCES = new Map([["soulsilver", { encounters: SOULSILVER_ROUTE_ENCOUNTERS.routes, features: SOULSILVER_ROUTE_FEATURES.routes, locations: {...SOULSILVER_LOCATION_ENCOUNTERS.locations,...KANTO_ENCOUNTERS.locations} }]]);
const METHODS = { walking: 'Walking', surfing: 'Surfing', old_rod: 'Old Rod', good_rod: 'Good Rod', super_rod: 'Super Rod', headbutt: 'Headbutt', 'rock-smash': 'Rock Smash', interaction: 'Special encounter', gift: 'Gift Pokémon', trade: 'In-game trade', contest: 'Bug-Catching Contest' };
const CONDITIONS = {
  'moon-square-ordinary':'Ordinary Mt. Moon Square scene',
  'moon-square-clefairy':'Alternate Clefairy scene · Monday night / early Tuesday · before the dance reward is collected',
  'suicune-return':'If Suicune was not caught on Route 25, enter the Hall of Fame again to make it return to Burned Tower · not a second capture',
  'kanto-snorlax':'Restore power, receive the EXPN Card and play the Poké Flute radio channel beside Snorlax · once',
  'kanto-suicune':'Complete Suicune’s earlier sightings and defeat Misty · once',
  'kanto-sixteen-badges':'All sixteen Badges · once',
  'kanto-articuno':'B4F · Surf and Strength for the deeper cave route · once',
  'enigma-stone':'Historical Enigma Stone distribution required · SoulSilver’s stationary Latias · once',
  'oak-kanto-starter':'Defeat Red, then choose one of Oak’s three Kanto starters · once',
  'steven-hoenn-starter':'Defeat Red and speak to Steven at Silph Co. · choose one Hoenn starter · once',
  'celadon-prize':'Exchange Game Corner coins at the Prize Corner',
  'fossil-revival':'Bring the matching fossil to the museum; leave and return with party space · some fossils require transfer',
  'trade-power-plant':'Offer Dugtrio for Magneton at the Power Plant',
  'trade-pewter':'Offer Haunter for Xatu in Pewter’s Pokémon Center',
  'trade-surge':'After catching Zapdos and registering Lt. Surge’s number, offer Pikachu for his foreign Pikachu',
  'trade-brock':'Offer Bonsly for Rhyhorn when Brock visits Diglett’s Cave after phone registration; appearance follows his rematch schedule',
  'trade-steven':'After receiving Steven’s starter, offer Forretress for Beldum at Silph Co.', 'hoenn-sound': 'Hoenn Sound · Wednesday · National Pokédex', 'sinnoh-sound': 'Sinnoh Sound · Thursday · National Pokédex', swarm: 'Active outbreak · National Pokédex', 'tree-a': 'Tree group A', 'tree-b': 'Tree group B', 'special-tree': 'Special trees · Rock Climb', squirtbottle: 'Use SquirtBottle · once', 'kenya-mail': 'Webster’s Kenya · Mail delivery',
  'unown-puzzle': 'At least one tile puzzle solved', 'unown-complete': '26 letters, four puzzles, four secret rooms and entrance panel unlocked',
  'friday-lapras': 'Friday · Surf required', 'rainbow-wing': 'Rainbow Wing · SoulSilver',
  'silver-wing-tidal-bell': 'Silver Wing, Tidal Bell and Kimono Girls', 'red-gyarados': 'Guaranteed shiny · story interaction',
  moltres: 'Rock Climb, Surf and Waterfall', 'red-orb': 'Red Orb', 'jade-orb': 'Jade Orb · both HGSS-origin orb Pokémon shown to Oak',
  'trap-tiles': 'Uncleared trap tile · before generator is disabled', 'generator-electrode': 'Generator story event',
  'contest-pre-dex': 'Tuesday / Thursday / Saturday · before National Pokédex', 'contest-tuesday': 'Tuesday · National Pokédex',
  'contest-thursday': 'Thursday · National Pokédex', 'contest-saturday': 'Saturday · National Pokédex' };
const TIMES = { morn: 'Morning', day: 'Day', nite: 'Night' };

export function formatLevels(levels) {
  const groups = [];
  for (const level of levels) {
    const previous = groups.at(-1);
    if (previous && previous[1] + 1 === level) previous[1] = level;
    else groups.push([level, level]);
  }
  return groups.map(([min, max]) => min === max ? `${min}` : `${min}–${max}`).join(', ');
}

export function routeFeatures(gameId, name) {
  const features = REFERENCES.get(gameId)?.features;
  return features && Object.hasOwn(features, name) ? features[name] : null;
}

export function routeEncounters(gameId, name) {
  const encounters = REFERENCES.get(gameId)?.encounters;
  const rows = encounters && Object.hasOwn(encounters, name) ? encounters[name] : null;
  if (!rows) return null;
  return rows.map(row=>formatEncounter(row,gameId));
}

function formatEncounter(row,gameId) {
  return {
    method: [row.area, METHODS[row.method], ...row.conditions.map(condition => CONDITIONS[condition] || condition)].filter(Boolean).join(' · '),
    pokemon: row.pokemon,
    speciesId: speciesIdForName(gameId,row.pokemon),
    levels: row.levelsLabel || formatLevels(row.levels),
    times: !row.times.length || row.times.length === 3 ? 'All times' : row.times.map(time => TIMES[time]).join(', '),
    rate: row.availability || (row.percent === null ? 'One-time' : `${row.percent}%`)
  };
}

export function locationEncounterReference(gameId, name) {
  const game = REFERENCES.get(gameId);
  if (!game) return null;
  if (Object.hasOwn(game.encounters, name)) {
    const number = Number(name.replace('Route ', ''));
    const johtoRoamers = [29,30,31,32,33,34,35,36,37,38,39,42,43,44,45,46];
    const notes = johtoRoamers.includes(number)
      ? ['Roaming Pokémon: Raikou and Entei (Lv. 40) can move onto this route after their release at Burned Tower. Check the Pokégear map; they are not fixed members of its walking table.']
      : [26,28].includes(number)
        ? ['Roaming Pokémon: SoulSilver’s Latios (Lv. 35) can move onto this route after Steven’s Vermilion City event. Check the Pokégear map; Latias is not SoulSilver’s roaming Eon Pokémon.'] : [];
    return { status: 'verified', notes, encounters: routeEncounters(gameId, name) };
  }
  if (!Object.hasOwn(game.locations, name)) return null;
  const reference = game.locations[name];
  const extra = gameId==='soulsilver' ? KANTO_ENCOUNTERS.supplemental[name] || [] : [];
  return { ...reference, encounters: [...reference.encounters,...extra].map(row=>formatEncounter(row,gameId)) };
}
