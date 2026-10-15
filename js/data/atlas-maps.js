import { SOULSILVER_MAPS } from './games/soulsilver/maps.js';

const GAMES = new Map([['soulsilver', SOULSILVER_MAPS.locations]]);

export function mapsForLocation(gameId, locationName) {
  const locations = GAMES.get(gameId);
  return locations && Object.hasOwn(locations, locationName) ? locations[locationName] : [];
}

// First-view compatibility for existing consumers; the Atlas uses mapsForLocation.
export const ATLAS_MAPS = Object.freeze(Object.fromEntries(
  Object.entries(SOULSILVER_MAPS.locations).filter(([, maps]) => maps.length).map(([name, maps]) => [name, maps[0]])
));
