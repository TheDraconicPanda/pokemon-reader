import { sanitizeGreatMarsh } from './saves/platinum-special.js';
import { gameProfile } from './saves/profiles.js';
import { sanitizeSafariSave } from './saves/soulsilver-safari.js';
// Decoded data only. Binary bytes remain owned by the Reader's current session.
export const ADVENTURE_SCHEMA = 1;
export const LEGACY_PLANNER_KEY = 'pokemon-reader-soulsilver-team-planner-v1';
const DB_NAME = 'pokemon-reader-adventures';
const STATS = ['hp', 'attack', 'defense', 'speed', 'specialAttack', 'specialDefense'];
const uint = (value, max) => Number.isInteger(value) && value >= 0 && value <= max;
const requireValue = (condition, message) => { if (!condition) throw new Error(message); };
const pick = (value, keys) => Object.fromEntries(keys.filter(key => value[key] !== undefined).map(key => [key, value[key]]));

export function trainerKey(snapshot) {
  return `${snapshot.gameId}:${snapshot.trainer.trainerId}:${snapshot.trainer.secretId}`;
}

export function validateSnapshot(snapshot) {
  requireValue(snapshot?.schemaVersion === ADVENTURE_SCHEMA && snapshot.snapshotVersion === 1, 'Unsupported adventure snapshot version.');
  const profile = gameProfile(snapshot.gameId);
  requireValue(profile, 'Unsupported adventure game.');
  requireValue(typeof snapshot.loadedAt === 'string' && Number.isFinite(Date.parse(snapshot.loadedAt)), 'Missing successful-load time.');
  const trainer = snapshot.trainer;
  requireValue(trainer && typeof trainer.name === 'string' && uint(trainer.trainerId, 65535) && uint(trainer.secretId, 65535), 'Incomplete trainer identity.');
  requireValue(uint(trainer.money, 0xFFFFFFFF) && uint(trainer.badges, (1 << profile.badgeCount) - 1) && uint(trainer.badgeCount, profile.badgeCount) && ['Male','Female'].includes(trainer.gender), 'Incomplete trainer information.');
  requireValue(uint(trainer.playTime?.hours, 65535) && uint(trainer.playTime?.minutes, 59) && uint(trainer.playTime?.seconds, 59), 'Invalid play time.');
  requireValue(Array.isArray(snapshot.party) && snapshot.party.length <= 6, 'Incomplete party.');
  const boxes = snapshot.storage?.boxes;
  requireValue(Array.isArray(boxes) && boxes.length === profile.boxCount && boxes.every((box, i) => box.number === i + 1 && Array.isArray(box.pokemon) && box.pokemon.length === profile.boxSlots), 'Incomplete PC storage.');
  const validatePokemon = (pokemon, slotLimit) => {
    requireValue(pokemon && uint(pokemon.slot, slotLimit) && pokemon.slot > 0, 'Invalid Pokémon slot.');
    if (pokemon.empty === true) return;
    requireValue(uint(pokemon.speciesId, profile.maxSpecies ?? 493) && pokemon.speciesId > 0 && pokemon.checksumValid === true, 'Invalid or corrupt Pokémon record.');
    requireValue(uint(pokemon.personality, 0xFFFFFFFF) && uint(pokemon.otId, 65535) && uint(pokemon.secretId, 65535), 'Incomplete Pokémon identity.');
    requireValue(STATS.every(stat => uint(pokemon.evs?.[stat], 255) && uint(pokemon.ivs?.[stat], 31)), 'Incomplete Pokémon training values.');
    requireValue(STATS.reduce((sum, stat) => sum + pokemon.evs[stat], 0) <= 510, 'Invalid Pokémon EV total.');
    requireValue(Array.isArray(pokemon.moves) && pokemon.moves.length === 4 && pokemon.moves.every(move => uint(move.id, profile.maxMove ?? 467)), 'Incomplete Pokémon moves.');
  };
  snapshot.party.forEach(p => validatePokemon(p, 6));
  requireValue(new Set(snapshot.party.map(p => p.slot)).size === snapshot.party.length, 'Duplicate party slots.');
  boxes.forEach(box => {
    box.pokemon.forEach(p => validatePokemon(p, 30));
    requireValue(new Set(box.pokemon.map(p => p.slot)).size === 30, 'Duplicate PC slots.');
  });
  const dex = snapshot.pokedex;
  for (const key of ['speciesIds', 'seenSpecies', 'caughtSpecies']) {
    requireValue(Array.isArray(dex?.[key]) && dex[key].every(id => uint(id, profile.maxSpecies ?? 493) && id > 0) && new Set(dex[key]).size === dex[key].length, 'Incomplete Pokédex flags.');
  }
  requireValue(dex.speciesCount === dex.speciesIds.length && dex.seenCount === dex.seenSpecies.length && dex.caughtCount === dex.caughtSpecies.length, 'Inconsistent Pokédex counts.');
  requireValue(typeof dex.nationalDex === 'boolean' && dex.speciesCount > 0 && [dex.seenPercent,dex.caughtPercent].every(p => Number.isFinite(p) && p >= 0 && p <= 100), 'Incomplete Pokédex summary.');
  requireValue([...dex.seenSpecies,...dex.caughtSpecies].every(id => dex.speciesIds.includes(id)), 'Registration outside the selected Pokédex scope.');
  for (const [full,scoped] of [['allCaughtSpecies','caughtSpecies'],['allSeenSpecies','seenSpecies']]) {
    if(dex[full]===undefined)continue; // v0.25.53/54 snapshots remain restorable.
    requireValue(Array.isArray(dex[full]) && dex[full].every(id=>uint(id,profile.maxSpecies ?? 493)&&id>0) && new Set(dex[full]).size===dex[full].length,'Invalid full Pokédex flags.');
    requireValue(dex[full].filter(id=>dex.speciesIds.includes(id)).length===dex[scoped].length && dex[scoped].every(id=>dex[full].includes(id)),'Full and scoped Pokédex flags disagree.');
  }
  if(snapshot.greatMarsh!==undefined)requireValue(snapshot.gameId==='platinum' && Boolean(sanitizeGreatMarsh(snapshot.greatMarsh)) && snapshot.greatMarsh.nationalDex===snapshot.pokedex.nationalDex,'Invalid Great Marsh state.');
  return snapshot;
}

export function createSnapshot(result, fileName, loadedAt = new Date().toISOString()) {
  const gameId = result?.gameId || (result?.game === 'Pokémon SoulSilver' ? 'soulsilver' : null);
  const profile = gameProfile(gameId);
  requireValue(result?.valid === true && profile && result.game === profile.game, 'Select a valid supported save.');
  requireValue(result.decodeComplete !== false, 'Save contains an invalid party count.');
  const pokemonKeys = ['empty','slot','personality','formId','speciesId','heldItemId','otId','secretId','experience','friendship','abilityId','isEgg','isNicknamed','nickname','otName','eggDate','metDate','eggLocationId','metLocationId','pokeballId','metLevel','shiny','natureId','moves','evs','ivs','level','currentHp','maxHp','stats','status','checksumValid','genderId','fatefulEncounter','originGameId','languageId','pokerus','otGenderId','groundTile','contestBeauty'];
  const decodedPokemon = p => {
    const value = pick(p, pokemonKeys);
    for (const key of ['evs','ivs','stats']) if (p[key]) value[key] = pick(p[key], STATS);
    if (p.moves) value.moves = p.moves.map(move => pick(move, ['id','pp','ppUps']));
    for (const key of ['eggDate','metDate']) if (p[key]) value[key] = pick(p[key], ['year','month','day']);
    return value;
  };
  const party = result.party?.map(p => ({ ...decodedPokemon(p), recordKind:'party' }));
  const storage = result.storage && {
    ...pick(result.storage, ['currentBox', 'totalCount']),
    boxes:result.storage.boxes?.map(box => ({ number:box.number, name:box.name, pokemon:box.pokemon?.map(p => ({ ...decodedPokemon(p), recordKind:'storage', boxNumber:box.number })) }))
  };
  const snapshot = {
    schemaVersion:ADVENTURE_SCHEMA, snapshotVersion:1, gameId, loadedAt,
    fileName:String(fileName || `${profile.shortName} save`),
    trainer:result.save?.trainer && pick(result.save.trainer, ['name','trainerId','secretId','money','gender','badges','badgeCount','playTime']),
    party, storage,
    pokedex:result.save?.pokedex && pick(result.save.pokedex, ['nationalDex','speciesIds','seenSpecies','caughtSpecies','speciesCount','seenCount','caughtCount','seenPercent','caughtPercent','allCaughtSpecies','allSeenSpecies']),
    ...(['platinum','leafgreen'].includes(gameId) && result.progress ? {progress:pick(result.progress,['mainStoryCleared','nationalDex'])} : {}),
    ...(gameId==='platinum' && sanitizeGreatMarsh(result.greatMarsh) ? {greatMarsh:sanitizeGreatMarsh(result.greatMarsh)} : {}),
    safari:sanitizeSafariSave(result.save?.safari)
  };
  if (snapshot.trainer?.playTime) snapshot.trainer.playTime = pick(snapshot.trainer.playTime, ['hours','minutes','seconds']);
  // Canonical JSON also ensures ArrayBuffers, typed arrays and parser offsets cannot
  // accidentally become a persisted copy of the user's binary save.
  return validateSnapshot(JSON.parse(JSON.stringify(snapshot)));
}

export function snapshotResult(snapshot) {
  validateSnapshot(snapshot);
  return { valid:true, supported:true, game:gameProfile(snapshot.gameId).game, gameId:snapshot.gameId, reason:'Restored decoded adventure.',
    trainer:snapshot.trainer, party:snapshot.party, storage:snapshot.storage, progress:snapshot.progress, ...(snapshot.gameId==='platinum'&&sanitizeGreatMarsh(snapshot.greatMarsh)?{greatMarsh:sanitizeGreatMarsh(snapshot.greatMarsh)}:{}),
    save:{trainer:snapshot.trainer, party:snapshot.party, storage:snapshot.storage, progress:snapshot.progress, pokedex:snapshot.pokedex, safari:sanitizeSafariSave(snapshot.safari)}
  };
}

async function database() {
  return new Promise((resolve, reject) => {
    let abandoned = false;
    const request = indexedDB.open(DB_NAME, ADVENTURE_SCHEMA);
    request.onupgradeneeded = () => {
      const db = request.result;
      db.createObjectStore('profiles', {keyPath:'id'}).createIndex('trainerKey', 'trainerKey', {unique:false});
      db.createObjectStore('planners', {keyPath:'id'}).createIndex('adventureId', 'adventureId', {unique:false});
      db.createObjectStore('settings', {keyPath:'key'});
    };
    request.onerror = () => reject(request.error);
    request.onblocked = () => {
      abandoned = true;
      reject(new Error('Close older application tabs to update adventure storage.'));
    };
    request.onsuccess = () => {
      const db = request.result;
      if (abandoned) { db.close(); return; }
      db.onversionchange = () => db.close();
      resolve(db);
    };
  });
}
const valueOf = request => new Promise((resolve, reject) => {
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});
export { transaction as adventureTransaction, valueOf as idbValue };

let changes = null;
if (typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined') {
  try { changes = new BroadcastChannel('pokemon-reader-adventures'); } catch { /* Focus/pageshow refresh remains available when channels are denied. */ }
}
export function notifyAdventureChange() {
  try { changes?.postMessage('updated'); } catch { /* A committed snapshot remains valid if notification fails. */ }
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('adventurechange'));
}
export function subscribeAdventureChanges(callback) {
  changes?.addEventListener('message', callback);
  window.addEventListener('adventurechange', callback);
  return () => { changes?.removeEventListener('message', callback); window.removeEventListener('adventurechange', callback); };
}
export async function clearActiveProfile() {
  await transaction(['settings'], 'readwrite', tx => { tx.objectStore('settings').delete('activeAdventure'); });
  notifyAdventureChange();
}
async function transaction(names, mode, operation) {
  const db = await database();
  try {
    const tx = db.transaction(names, mode);
    const completed = new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onabort = () => reject(tx.error || new Error('Adventure update was cancelled.'));
      tx.onerror = () => {}; // onabort owns rejection, including quota failures.
    });
    try {
      const result = await operation(tx);
      await completed;
      return result;
    } catch (error) {
      try { tx.abort(); } catch {}
      await completed.catch(() => {});
      throw error;
    }
  } finally { db.close(); }
}

export async function listProfiles() {
  return transaction(['profiles'], 'readonly', tx => valueOf(tx.objectStore('profiles').getAll()));
}
export async function getActiveProfile() {
  return transaction(['profiles','settings'], 'readonly', async tx => {
    const selected = await valueOf(tx.objectStore('settings').get('activeAdventure'));
    if (!selected) return null;
    const profile = await valueOf(tx.objectStore('profiles').get(selected.id));
    if (profile) validateSnapshot(profile.snapshot);
    return profile || null;
  });
}
export async function selectProfile(id) {
  const profile = await transaction(['profiles','settings'], 'readwrite', async tx => {
    const profile = await valueOf(tx.objectStore('profiles').get(id));
    requireValue(profile, 'Adventure no longer exists.');
    validateSnapshot(profile.snapshot);
    tx.objectStore('settings').put({key:'activeAdventure', id});
    return profile;
  });
  notifyAdventureChange();
  return profile;
}
export async function persistSnapshot(snapshot, {profileId = null, newAdventure = false} = {}) {
  validateSnapshot(snapshot);
  snapshot = createSnapshot(snapshotResult(snapshot), snapshot.fileName, snapshot.loadedAt);
  const profile = await transaction(['profiles','settings'], 'readwrite', async tx => {
    const store = tx.objectStore('profiles');
    const matches = await valueOf(store.index('trainerKey').getAll(trainerKey(snapshot)));
    let profile = profileId ? matches.find(p => p.id === profileId) : null;
    if (profileId) requireValue(profile, 'Selected adventure does not match this trainer.');
    if (!profile && !newAdventure && matches.length) {
      requireValue(matches.length === 1 && matches[0].snapshot.trainer.name === snapshot.trainer.name && matches[0].snapshot.trainer.gender === snapshot.trainer.gender, 'Choose an adventure for this trainer identity.');
      profile = matches[0];
    }
    if (profile) requireValue(Date.parse(snapshot.loadedAt) >= Date.parse(profile.snapshot.loadedAt), 'A newer snapshot is already stored. Reload the latest save.');
    const updated = {
      id:profile?.id || crypto.randomUUID(), schemaVersion:ADVENTURE_SCHEMA,
      trainerKey:trainerKey(snapshot), gameId:snapshot.gameId,
      createdAt:profile?.createdAt || snapshot.loadedAt, updatedAt:snapshot.loadedAt,
      revision:(profile?.revision || 0) + 1, snapshot
    };
    store.put(updated);
    tx.objectStore('settings').put({key:'activeAdventure', id:updated.id});
    return updated;
  });
  notifyAdventureChange();
  return profile;
}

// This first milestone creates a lossless, unassociated migration copy. The
// existing Planner remains authoritative until its multi-plan UI is integrated.
export async function preserveLegacyPlanner(storage = localStorage) {
  const raw = storage.getItem(LEGACY_PLANNER_KEY);
  if (raw === null) return null;
  const state = JSON.parse(raw);
  requireValue(state && state.version === 1 && !Array.isArray(state), 'Existing Planner data needs a backup before migration.');
  return transaction(['planners','settings'], 'readwrite', async tx => {
    const settings = tx.objectStore('settings');
    const marker = await valueOf(settings.get('legacyPlannerMigration'));
    if (marker) return marker.id;
    const id = crypto.randomUUID();
    tx.objectStore('planners').add({id, schemaVersion:1, gameId:'soulsilver', adventureId:null, name:'SoulSilver / Mando', legacySource:raw, state, createdAt:new Date().toISOString()});
    settings.put({key:'legacyPlannerMigration', id});
    return id;
  });
}
