import { SOULSILVER_PROFILE } from './profiles.js';
import { evolveGen4Pokemon } from './gen4-evolution.js';
export { getAvailableEvolutions } from './gen4-evolution.js';

export function evolveSoulSilverPokemon(buffer, pokemon, evolution, activePartition, evolvedBaseStats = null) {
  return evolveGen4Pokemon(buffer, pokemon, evolution, activePartition, evolvedBaseStats, SOULSILVER_PROFILE);
}
