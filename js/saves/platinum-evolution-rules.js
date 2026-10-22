import { PLATINUM_READER as data } from '../data/games/platinum/reader-reference.js';
import { savedLevel } from '../pokemon-level.js';

const locations = {
  EVO_LEVEL_MAGNETIC_FIELD:'Mt. Coronet',
  EVO_LEVEL_MOSS_ROCK:'Eterna Forest — near the Moss Rock',
  EVO_LEVEL_ICE_ROCK:'Route 217 — near the Ice Rock',
};

function ruleFor(edge) {
  const rule = {from:edge.from, to:edge.to, sourceMethod:edge.method, consumesItem:false};
  if (edge.method === 'EVO_TRADE') return {...rule, method:'trade'};
  if (edge.method === 'EVO_TRADE_WITH_HELD_ITEM') return {...rule, method:'trade-item', item:edge.param, itemName:data.items[edge.param], consumesItem:true};
  if (locations[edge.method]) return {...rule, method:'location-level-up', location:locations[edge.method]};
  if (edge.method === 'EVO_LEVEL_KNOW_MOVE') return {...rule, method:'move-level-up', moveId:edge.param};
  if (edge.method === 'EVO_LEVEL_SPECIES_IN_PARTY') return {...rule, method:'party-level-up', requiredSpecies:edge.param};
  if (edge.method.startsWith('EVO_LEVEL_WITH_HELD_ITEM_')) return {...rule, method:'held-item-level-up', item:edge.param, itemName:data.items[edge.param], consumesItem:true, requiredTime:edge.method.endsWith('_NIGHT')?'night':'day'};
  if (edge.method.startsWith('EVO_LEVEL_HAPPINESS')) return {...rule, method:'friendship-level-up', friendship:220, requiredTime:edge.method.endsWith('_NIGHT')?'night':edge.method.endsWith('_DAY')?'day':null};
  if (edge.method === 'EVO_LEVEL_BEAUTY') return {...rule, method:'beauty-level-up', beauty:edge.param};
  return null; // Ordinary level/stone evolutions remain in-game operations.
}

export const PLATINUM_SIMULATED_EVOLUTIONS = Object.freeze(data.evolutions.map(ruleFor).filter(Boolean).map(Object.freeze));

export function platinumEvolutions(pokemon, context = {}) {
  if (!pokemon || pokemon.empty || pokemon.isEgg || !pokemon.speciesId) return [];
  if (Number.isInteger(pokemon.formId) && pokemon.formId !== 0) return [];
  if (pokemon.heldItemId === 229 && pokemon.speciesId !== 64) return []; // Kadabra's Gen IV exception.
  const level = savedLevel(pokemon);
  return PLATINUM_SIMULATED_EVOLUTIONS.filter(rule => {
    if (rule.from !== pokemon.speciesId) return false;
    if (rule.method.includes('level-up') && (!Number.isInteger(level) || level >= 100)) return false;
    if (rule.item && pokemon.heldItemId !== rule.item) return false;
    if (rule.moveId && !pokemon.moves?.some(move => move.id === rule.moveId)) return false;
    if (rule.requiredSpecies && !context.party?.some(p => !p.empty && !p.isEgg && p.speciesId === rule.requiredSpecies)) return false;
    if (rule.friendship && !(pokemon.friendship >= rule.friendship)) return false;
    if (rule.beauty && !(pokemon.contestBeauty >= rule.beauty)) return false;
    if (rule.requiredTime && context.time && context.time !== rule.requiredTime) return false;
    return true;
  });
}
