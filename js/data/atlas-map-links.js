import { SOULSILVER_MAP_LINKS } from './games/soulsilver/map-links.js';

const GAMES = new Map([['soulsilver', SOULSILVER_MAP_LINKS]]);
export function mapLinksForLocation(gameId, locationName) {
  const locations = GAMES.get(gameId);
  return locations && Object.hasOwn(locations, locationName) ? locations[locationName] : null;
}
