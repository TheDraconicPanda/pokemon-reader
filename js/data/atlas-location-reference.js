import { SOULSILVER_LOCATION_DETAILS } from './games/soulsilver/location-details.js';

const GAMES = new Map([['soulsilver', SOULSILVER_LOCATION_DETAILS.locations]]);

export function locationDetails(gameId, name) {
  const locations = GAMES.get(gameId);
  return locations && Object.hasOwn(locations, name) ? locations[name] : null;
}

export function locationDetailSearchText(gameId, name) {
  const details = locationDetails(gameId, name);
  if (!details) return '';
  return ['items', 'gifts', 'offers', 'services', 'trainers'].flatMap(key =>
    details[key].map(({ source, id, ...fields }) => Object.values(fields).flat().join(' '))
  ).join(' ');
}
