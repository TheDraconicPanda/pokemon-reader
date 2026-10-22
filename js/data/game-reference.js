import { PLATINUM_POKEDEX } from './games/platinum/pokedex-reference.js';
import { PLATINUM_READER } from './games/platinum/reader-reference.js';
import { PLANNER_REFERENCE } from './games/soulsilver/planner-reference.js';
import { SOULSILVER_EV_YIELDS } from './games/soulsilver/ev-yields.js';

// Identifier/name data and audited base yields only. No newer-generation
// learnsets, abilities or mechanics are inferred from these references.
const normalize = name => typeof name === 'string' ? name.normalize('NFKC').toLowerCase().replace(/[^a-z0-9♀♂]/g,'') : '';
const names = new Map(Object.entries(PLANNER_REFERENCE.species).map(([id,name])=>[normalize(name),Number(id)]));
names.set(normalize('Gyarados (shiny)'),130); // Existing Lake of Rage label, same species registration.
const yields = new Map(Object.entries(SOULSILVER_EV_YIELDS.species).map(([name,value])=>[names.get(normalize(name)),value]));
const SOULSILVER = Object.freeze({
  ...PLANNER_REFERENCE, dataSchemaVersion:1,
  evYieldSource:SOULSILVER_EV_YIELDS.source,
  evYieldSourceSha256:SOULSILVER_EV_YIELDS.sourceSha256,
});
const PLATINUM=Object.freeze({gameId:'platinum',generation:4,dataSchemaVersion:1,species:PLANNER_REFERENCE.species,moves:Object.fromEntries(Object.entries(PLATINUM_READER.moves).map(([id,m])=>[id,m.name])),natures:PLANNER_REFERENCE.natures});
const platinumYield=id=>{const values=PLATINUM_POKEDEX.species[id]?.evYield;return values?Object.fromEntries(['hp','attack','defense','spAttack','spDefense','speed'].map((key,i)=>[key,values[i]])):null;};
export function gameReference(gameId) { return gameId === 'soulsilver' ? SOULSILVER : gameId==='platinum' ? PLATINUM : null; }
export function speciesIdForName(gameId, name) { return gameReference(gameId) ? names.get(normalize(name)) ?? null : null; }
export function speciesReference(gameId, id) {
  const game=gameReference(gameId);
  return game && Number.isInteger(id) && Object.hasOwn(game.species,id) ? {id,name:game.species[id],evYield:gameId==='platinum' ? platinumYield(id) : yields.get(id) || null} : null;
}
export function speciesEvYield(gameId,name) {
  const id=speciesIdForName(gameId,name);
  return id===null ? null : gameId==='platinum' ? platinumYield(id) : yields.get(id) || null;
}

export function caughtRegistrations(profile,gameId) {
  if(!gameReference(gameId) || profile?.gameId!==gameId || profile.snapshot?.gameId!==gameId) return {species:new Set(),full:false};
  const dex=profile.snapshot.pokedex;
  const valid=values=>Array.isArray(values) && values.every(id=>Number.isInteger(id) && id>=1 && id<=493);
  if(valid(dex?.allCaughtSpecies))return {species:new Set(dex.allCaughtSpecies),full:true};
  // Earlier decoded snapshots contain reliable flags only for their saved scope.
  // Preserve those positive registrations without inferring anything from ownership.
  return {species:new Set(valid(dex?.caughtSpecies)?dex.caughtSpecies:[]),full:Boolean(dex?.nationalDex && dex.speciesIds?.length===493)};
}
