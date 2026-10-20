import { SOULSILVER_TRAVEL } from './games/soulsilver/travel.js';

const GAMES = new Map([['soulsilver', SOULSILVER_TRAVEL]]);
const PAIRS = new Map([...GAMES].map(([id, game]) => [id, new Map(game.connections.map(row => [JSON.stringify([row.fromLocation,row.toLocation]), row]))]));

export function travelConnection(gameId, from, to) {
  return PAIRS.get(gameId)?.get(JSON.stringify([from,to])) ?? null;
}
export function travelHm(gameId, id) {
  const hms = GAMES.get(gameId)?.hms;
  return hms && Object.hasOwn(hms,id) ? hms[id] : null;
}
