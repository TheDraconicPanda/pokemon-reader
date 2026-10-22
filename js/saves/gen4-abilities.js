import { SOULSILVER_POKEDEX as hgss } from '../data/games/soulsilver/pokedex-reference.js';
import { PLATINUM_READER as platinum } from '../data/games/platinum/reader-reference.js';

// HGSS UpdateBoxMonAbility uses PID bit 0, falling back to ability 1 when
// ability 2 is absent. The pinned references retain ability order and collapse
// duplicate slots. No Hidden Abilities exist in Generation IV.
export function gen4AbilityForPid(personality, abilities) {
  if (!Number.isInteger(personality) || personality < 0 || personality > 0xFFFFFFFF ||
      !Array.isArray(abilities) || abilities.length < 1 || abilities.length > 2 ||
      !abilities.every(id => Number.isInteger(id) && id > 0 && id <= 123)) return null;
  return abilities[personality & 1] || abilities[0];
}

export function evolutionAbility(personality, speciesId, gameId) {
  const data = gameId === 'soulsilver' ? hgss : gameId === 'platinum' ? platinum : null;
  return gen4AbilityForPid(personality, data?.species[speciesId]?.abilities);
}

export function hgssAbilityName(id) {
  return hgss.abilities[id]?.name || `Ability #${id}`;
}

const forms = {
  172: [172, 172], 201: Array(28).fill(201), 386: [386, 496, 497, 498],
  412: [412, 412, 412], 413: [413, 499, 500], 422: [422, 422], 423: [423, 423],
  479: [479, 503, 504, 505, 506, 507], 487: [487, 501], 492: [492, 502],
  493: Array(18).fill(493),
};

// Membership validation deliberately accepts a species-valid stored ability
// even when it differs from PID parity (e.g. a legitimate Gen III transfer).
// This is an ability check, not a complete Pokémon legality checker.
export function validateSoulSilverAbility(pokemon) {
  if (!pokemon || pokemon.empty || pokemon.isEgg) return {status:'skipped'};
  if (pokemon.checksumValid !== true) return {status:'unknown', reason:'The Pokémon checksum is not verified. No safe repair is available.'};
  const form = pokemon.formId ?? 0;
  const key = forms[pokemon.speciesId] ? forms[pokemon.speciesId][form] : form === 0 ? pokemon.speciesId : null;
  const abilities = hgss.species[key]?.abilities;
  const replacement = gen4AbilityForPid(pokemon.personality, abilities);
  if (!Number.isInteger(form) || form < 0 || replacement === null) return {status:'unknown', reason:'The species, form or ability slot could not be established confidently. No repair is suggested.'};
  if (abilities.includes(pokemon.abilityId)) return {status:'valid'};
  return {status:'invalid', current: pokemon.abilityId, replacement};
}
