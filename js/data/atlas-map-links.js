import { PLATINUM_MAPS } from './games/platinum/maps.js';
import { SOULSILVER_MAP_LINKS } from './games/soulsilver/map-links.js';
import { SOULSILVER_DUNGEON_LINKS } from './games/soulsilver/dungeon-links.js';

const locations = { ...SOULSILVER_MAP_LINKS };
for (const [name, extra] of Object.entries(SOULSILVER_DUNGEON_LINKS)) {
  const original = locations[name];
  locations[name] = { ...extra, pairs: extra.append
    ? [...original.pairs, ...extra.pairs] : extra.pairs };
}
const GAMES = new Map([['soulsilver', locations],['platinum',PLATINUM_MAPS.links]]);
export function mapLinksForLocation(gameId, locationName) {
  const locations = GAMES.get(gameId);
  return locations && Object.hasOwn(locations, locationName) ? locations[locationName] : null;
}
