import { TEAM, HMS, BENCH } from './planner-defaults.js';
import { TEAM_FAMILIES, EV_KEYS } from './planner-save.js';
import { PLANNER_REFERENCE as REFERENCE } from './data/games/soulsilver/planner-reference.js';

export const defaultProgress = () => ({version:1, ready:{}, moves:{}, hmDone:{}, evDone:{}, benchNotes:{}});
export const speciesName = id => REFERENCE.species[id] || `Species #${id}`;
export const moveName = id => REFERENCE.moves[id] || `Move #${id}`;
export const natureName = id => REFERENCE.natures[id] || 'Unavailable';
const normalized = name => name.toLowerCase().replace(/[^a-z0-9]/g, '');
const moveIds = new Map(Object.entries(REFERENCE.moves).map(([id,name]) => [normalized(name),Number(id)]));
export const moveId = name => moveIds.get(normalized(name)) ?? null;
const targetIds = {kingdra:230,typhlosion:157,machamp:68,dragonite:149,ampharos:181,gengar:94};
const targetNatures = {kingdra:[15,10],typhlosion:[10,15],machamp:[3],dragonite:[3,13],ampharos:[15],gengar:[10,15]};
export function defaultGoals() {
  return {
    team:TEAM.map(member => ({...structuredClone(member), speciesId:targetIds[member.id], family:[...TEAM_FAMILIES[member.id]], natureIds:[...targetNatures[member.id]], moveIds:member.moves.map(([name]) => moveId(name))})),
    hms:HMS.map(hm => ({...hm, moveId:moveId(hm.move), ownerId:TEAM.find(p => p.name === hm.owner)?.id || null})),
    bench:structuredClone(BENCH)
  };
}
export function normalizeProgress(state) {
  if (!state || state.version !== 1 || Array.isArray(state)) throw new Error('Unrecognized Planner progress.');
  for (const group of ['ready','moves','hmDone','evDone','benchNotes']) {
    if (state[group] !== undefined && (!state[group] || typeof state[group] !== 'object' || Array.isArray(state[group]) || Object.values(state[group]).some(value => typeof value !== 'boolean'))) throw new Error('Invalid Planner checklist.');
  }
  return {...defaultProgress(),...structuredClone(state)};
}
export function newPlanner(name = 'SoulSilver / Mando', adventureId = null, goals = defaultGoals(), state = defaultProgress()) {
  const now = new Date().toISOString();
  return {id:crypto.randomUUID(),schemaVersion:2,gameId:'soulsilver',adventureId,name,goals:structuredClone(goals),state:normalizeProgress(state),links:{},revision:0,createdAt:now,updatedAt:now};
}
export function validatePlanner(plan) {
  if (!plan || plan.schemaVersion !== 2 || plan.gameId !== 'soulsilver' || typeof plan.id !== 'string' || typeof plan.name !== 'string' || !plan.name.trim() || plan.name.length > 100 || !(plan.adventureId === null || typeof plan.adventureId === 'string')) throw new Error('Unsupported Planner record.');
  normalizeProgress(plan.state);
  const team = plan.goals?.team;
  if (!Array.isArray(team) || team.length !== 6 || new Set(team.map(p => p.id)).size !== 6 || !Array.isArray(plan.goals.hms) || !Array.isArray(plan.goals.bench)) throw new Error('Incomplete Planner goals.');
  for (const p of team) {
    if (['name','origin','role','ability','nature','note'].some(key=>typeof p[key]!=='string') || !Array.isArray(p.temporary) || p.temporary.some(move=>typeof move!=='string') || !Array.isArray(p.moves) || p.moves.some(move=>!Array.isArray(move) || move.length!==2 || move.some(text=>typeof text!=='string'))) throw new Error('Incomplete Planner presentation fields.');
    if (!/^[a-z0-9-]+$/.test(p.id) || !Array.isArray(p.family) || !p.family.includes(p.speciesId) || p.family.some(id => !REFERENCE.species[id]) || !Array.isArray(p.natureIds) || p.natureIds.some(id => !Object.hasOwn(REFERENCE.natures,id)) || !Array.isArray(p.moves) || p.moves.length !== 4 || !Array.isArray(p.moveIds) || p.moveIds.length !== 4 || p.moveIds.some(id => id !== null && !REFERENCE.moves[id]) || p.moves.some((move,i) => !Array.isArray(move) || typeof move[0] !== 'string' || p.moveIds[i] !== moveId(move[0])) || !Array.isArray(p.evs) || p.evs.some(([stat,n]) => !Object.hasOwn(EV_KEYS,stat) || !Number.isInteger(n) || n < 0 || n > 255) || new Set(p.evs.map(([stat])=>stat)).size !== p.evs.length || p.evs.reduce((n,[,v])=>n+v,0)>510) throw new Error('Invalid Planner member goals.');
  }
  for (const hm of plan.goals.hms) {
    if (['move','owner','status','why'].some(key=>typeof hm[key]!=='string')) throw new Error('Incomplete HM goals.');
    if (!REFERENCE.moves[hm.moveId] || moveId(hm.move) !== hm.moveId || hm.ownerId !== null && !team.some(p => p.id === hm.ownerId)) throw new Error('Invalid HM goals.');
  }
  for (const candidate of plan.goals.bench) if (['id','name','role','note'].some(key=>typeof candidate[key]!=='string') || !/^[a-z0-9-]+$/.test(candidate.id)) throw new Error('Invalid bench goals.');
  if (!plan.links || typeof plan.links !== 'object' || Array.isArray(plan.links)) throw new Error('Invalid Pokémon associations.');
  for (const [id,link] of Object.entries(plan.links)) {
    if (!team.some(p => p.id === id) || !link || typeof link !== 'object') throw new Error('Invalid Pokémon association.');
    if (!link.manual && (!Number.isInteger(link.identity?.personality) || !Number.isInteger(link.identity.otId) || !Number.isInteger(link.identity.secretId) || !link.identity.ivs)) throw new Error('Incomplete Pokémon identity.');
  }
  return plan;
}

export function savedPokemon(profile) {
  if (!profile || profile.gameId !== 'soulsilver') return [];
  return [
    ...profile.snapshot.party.map(p => ({...p,location:`Party slot ${p.slot}`,token:`party:${p.slot}`})),
    ...profile.snapshot.storage.boxes.flatMap(box => box.pokemon.map(p => ({...p,location:`Box ${box.number}, slot ${p.slot}`,token:`storage:${box.number}:${p.slot}`})))
  ].filter(p => !p.empty && !p.isEgg && p.speciesId > 0);
}
export function pokemonIdentity(p) {
  return {personality:p.personality,otId:p.otId,secretId:p.secretId,ivs:structuredClone(p.ivs),otName:p.otName ?? null,metDate:p.metDate ?? null,metLocationId:p.metLocationId ?? null,metLevel:p.metLevel ?? null};
}
export function samePokemon(identity, p) {
  return identity.personality === p.personality && identity.otId === p.otId && identity.secretId === p.secretId &&
    Object.keys(EV_KEYS).every(stat => identity.ivs[EV_KEYS[stat]] === p.ivs?.[EV_KEYS[stat]]) &&
    ['otName','metLocationId','metLevel'].every(key => identity[key] === (p[key] ?? null)) &&
    JSON.stringify(identity.metDate) === JSON.stringify(p.metDate ?? null);
}
export function linkPokemon(plan, slotId, pokemon, profile) {
  if (!profile || plan.adventureId !== profile.id) throw new Error('Associate this plan with the adventure first.');
  const member=plan.goals.team.find(p => p.id === slotId);
  if (!member?.family.includes(pokemon.speciesId) || pokemon.isEgg || pokemon.empty) throw new Error('Choose a Pokémon from this evolution family.');
  plan.links[slotId]={identity:pokemonIdentity(pokemon),lastKnown:structuredClone(pokemon),lastSeenAt:profile.snapshot.loadedAt,profileRevision:profile.revision,token:pokemon.token};
}
export function memberProgress(plan, member, profile) {
  const link=plan.links[member.id];
  const relevant=profile && profile.id === plan.adventureId && profile.gameId === plan.gameId;
  const candidates=relevant ? savedPokemon(profile).filter(p => member.family.includes(p.speciesId)) : [];
  let status='manual', actual=null;
  if (link && !link.manual) {
    const matches=candidates.filter(p=>samePokemon(link.identity,p));
    actual=matches.length===1 ? matches[0] : matches.length>1 && link.profileRevision===profile?.revision ? matches.find(p=>p.token===link.token) : null;
    status=actual ? 'found' : matches.length>1 ? 'ambiguous' : 'missing';
  }
  return {status,actual,lastKnown:link?.lastKnown || null,candidates,linked:Boolean(link && !link.manual),
    moves:member.moveIds.map(id=>actual ? id !== null && actual.moves.some(move=>move.id===id) : false),
    evolved:actual ? actual.speciesId===member.speciesId : false,
    nature:actual ? member.natureIds.includes(actual.natureId) : false};
}
export function reconcilePlanner(plan, profile) {
  const updated=structuredClone(plan);
  if (!profile || profile.id !== plan.adventureId || profile.gameId !== plan.gameId) return updated;
  for (const member of updated.goals.team) {
    if (!updated.links[member.id]) {
      const party=savedPokemon(profile).filter(p=>p.recordKind==='party' && member.family.includes(p.speciesId));
      if (party.length===1) linkPokemon(updated,member.id,party[0],profile);
    }
    const progress=memberProgress(updated,member,profile);
    if (progress.actual) linkPokemon(updated,member.id,progress.actual,profile);
  }
  return updated;
}
export function importPlannerBackup(parsed, adventureId = null) {
  if (parsed?.version === 2) {
    validatePlanner(parsed.planner);
    // Portable goals/manual progress; local profile IDs and Pokémon links are
    // deliberately not reassigned to an unrelated adventure during import.
    return newPlanner(`${parsed.planner.name} (imported)`.slice(0,100),adventureId,parsed.planner.goals,parsed.planner.state);
  }
  const state=normalizeProgress(parsed?.state || parsed);
  return newPlanner('SoulSilver / Mando (imported)',adventureId,defaultGoals(),state);
}
