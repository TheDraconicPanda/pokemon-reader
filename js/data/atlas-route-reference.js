import { SOULSILVER_ROUTE_ENCOUNTERS } from './games/soulsilver/route-encounters.js';
import { SOULSILVER_ROUTE_FEATURES } from './games/soulsilver/route-features.js';

// Explicit game selection keeps future versions from inheriting SoulSilver data.
const REFERENCES = new Map([["soulsilver", { encounters: SOULSILVER_ROUTE_ENCOUNTERS.routes, features: SOULSILVER_ROUTE_FEATURES.routes }]]);
const METHODS = { walking: 'Walking', surfing: 'Surfing', old_rod: 'Old Rod', good_rod: 'Good Rod', super_rod: 'Super Rod', headbutt: 'Headbutt', 'rock-smash': 'Rock Smash', interaction: 'Special encounter', gift: 'Gift Pokémon' };
const CONDITIONS = { 'hoenn-sound': 'Hoenn Sound · Wednesday · National Pokédex', 'sinnoh-sound': 'Sinnoh Sound · Thursday · National Pokédex', swarm: 'Active outbreak · National Pokédex', 'tree-a': 'Tree group A', 'tree-b': 'Tree group B', 'special-tree': 'Special trees · Rock Climb', squirtbottle: 'Use SquirtBottle · once', 'kenya-mail': 'Webster’s Kenya · Mail delivery' };
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
  return rows.map(row => ({
    method: [METHODS[row.method], ...row.conditions.map(condition => CONDITIONS[condition])].join(' · '),
    pokemon: row.pokemon,
    levels: formatLevels(row.levels),
    times: !row.times.length || row.times.length === 3 ? 'All times' : row.times.map(time => TIMES[time]).join(', '),
    rate: row.percent === null ? 'One-time' : `${row.percent}%`
  }));
}
