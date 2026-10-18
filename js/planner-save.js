// Only the EV snapshot crosses pages; raw save bytes stay in Reader memory.
const KEY = 'pokemon-reader-planner-save-v1';
export const EV_KEYS = { HP:'hp', Attack:'attack', Defense:'defense', 'Special Attack':'specialAttack', 'Special Defense':'specialDefense', Speed:'speed' };
export const TEAM_FAMILIES = { kingdra:[116,117,230], typhlosion:[155,156,157], machamp:[66,67,68], dragonite:[147,148,149], ampharos:[179,180,181], gengar:[92,93,94] };
export function snapshotSave(result, name) {
  if (!result.valid) throw new Error('Select a valid SoulSilver save');
  const records = [...(result.party || []), ...(result.storage?.boxes || []).flatMap(box => box.pokemon || [])];
  return { name, pokemon:records.filter(p => !p.empty && !p.isEgg && Object.values(TEAM_FAMILIES).some(ids => ids.includes(p.speciesId))).map(p => ({
    id:`${p.personality}:${p.otId}:${p.secretId}`, speciesId:p.speciesId, nickname:p.nickname || '',
    location:p.recordKind === 'storage' ? `Box ${p.boxNumber}, slot ${p.slot}` : `Party slot ${p.slot}`,
    evs:p.evs
  })) };
}
export function rememberSave(snapshot) {
  try { sessionStorage.setItem(KEY, JSON.stringify(snapshot)); return true; } catch { return false; }
}
export function readSavedSnapshot() {
  try {
    const snapshot = JSON.parse(sessionStorage.getItem(KEY));
    return snapshot && Array.isArray(snapshot.pokemon) && snapshot.pokemon.every(p => Object.values(EV_KEYS).every(key => Number.isInteger(p.evs?.[key]) && p.evs[key] >= 0 && p.evs[key] <= 255)) ? snapshot : null;
  } catch { return null; }
}
export function forgetSave() { try { sessionStorage.removeItem(KEY); } catch {} }
