import { SOULSILVER_POKEDEX as SS } from './games/soulsilver/pokedex-reference.js';
import { gameReference } from './game-reference.js';
import { ATLAS_LOCATIONS } from './atlas-locations.js';
import { locationEncounterReference } from './atlas-route-reference.js';
import { locationDetails } from './atlas-location-reference.js';
import { SOULSILVER_SAFARI_ENCOUNTERS } from './games/soulsilver/safari-encounters.js';
import { speciesIdForName } from './game-reference.js';
export const STAT_LABELS = ['HP','Attack','Defense','Special Attack','Special Defense','Speed'];
export function pokedexReference(gameId) { return gameId === 'soulsilver' ? SS : null; }
export function referenceSpecies(gameId, key) { return pokedexReference(gameId)?.species[key] || null; }
export function speciesForms(gameId,id) { return Object.entries(pokedexReference(gameId)?.species || {}).filter(([,p])=>p.id===id).map(([key,record])=>({key:Number(key),record})); }
export function evolutionFamily(gameId,id) {
  const data=pokedexReference(gameId); if(!data || !data.species[id]) return [];
  const ids=new Set([id]); let size;
  do { size=ids.size; for(const edge of data.evolutions) if(ids.has(edge.from)||ids.has(edge.to)){ids.add(edge.from);ids.add(edge.to);} }while(ids.size!==size);
  // Order by ancestry, including babies and branched evolutions.
  const depth=id=>{ const parent=data.evolutions.find(e=>e.to===id); return parent ? depth(parent.from)+1:0; };
  return [...ids].sort((a,b)=>depth(a)-depth(b)||a-b);
}
export function evolutionRequirement(edge) {
  const p=edge.param;
  const rules={
    EVO_LEVEL:`Level ${p}`, EVO_FRIENDSHIP:'Level up with friendship ≥220',
    EVO_FRIENDSHIP_DAY:'Level up with friendship ≥220 during daytime (04:00–19:59)',
    EVO_FRIENDSHIP_NIGHT:'Level up with friendship ≥220 at night (20:00–03:59)',
    EVO_TRADE:'Trade', EVO_TRADE_ITEM:`Trade holding ${p}`, EVO_STONE:`Use ${p}`,
    EVO_STONE_MALE:`Male · use ${p}`, EVO_STONE_FEMALE:`Female · use ${p}`,
    EVO_ITEM_DAY:`Level up holding ${p} during daytime (04:00–19:59)`,
    EVO_ITEM_NIGHT:`Level up holding ${p} at night (20:00–03:59)`,
    EVO_HAS_MOVE:`Level up knowing ${p}`, EVO_OTHER_PARTY_MON:`Level up with ${p} in the party`,
    EVO_LEVEL_MALE:`Male · level ${p}`, EVO_LEVEL_FEMALE:`Female · level ${p}${edge.from===412?' · cloak determines Wormadam form':''}`,
    EVO_LEVEL_ATK_GT_DEF:`Level ${p} · Attack > Defense`, EVO_LEVEL_ATK_EQ_DEF:`Level ${p} · Attack = Defense`, EVO_LEVEL_ATK_LT_DEF:`Level ${p} · Attack < Defense`,
    EVO_LEVEL_PID_LO:`Level ${p} · personality upper 16 bits modulo 10 <5 (fixed per individual)`,
    EVO_LEVEL_PID_HI:`Level ${p} · personality upper 16 bits modulo 10 ≥5 (fixed per individual)`,
    EVO_LEVEL_NINJASK:`Level ${p}`, EVO_LEVEL_SHEDINJA:'When Nincada evolves at level 20+: empty party slot and a regular Poké Ball in the bag',
    EVO_BEAUTY:`Level up with Beauty ≥${p} (Generation IV condition)`,
    EVO_CORONET:'Level up at Mt. Coronet in Diamond/Pearl/Platinum, then trade back; no magnetic evolution area in HGSS',
    EVO_ETERNA:'Level up near Eterna Forest’s Moss Rock in Diamond/Pearl/Platinum, then trade back; no Moss Rock in HGSS',
    EVO_ROUTE217:'Level up near Route 217’s Ice Rock in Diamond/Pearl/Platinum, then trade back; no Ice Rock in HGSS',
  };
  return rules[edge.method] || 'Requirement not verified';
}
export function typeMultipliers(gameId,types) {
  const data=pokedexReference(gameId); if(!data)return [];
  return Object.entries(data.typeChart).map(([type,targets])=>({type,multiplier:types.reduce((n,t)=>n*targets[t],1)}));
}
export function statRange(record,index,level) {
  if(!Number.isInteger(level)||level<1||level>100||!record||index<0||index>5) return null;
  if(index===0&&record.id===292)return [1,1];
  const stat=(iv,ev,nature)=>{
    const base=Math.floor((2*record.stats[index]+iv+Math.floor(ev/4))*level/100);
    return index===0 ? base+level+10 : Math.floor((base+5)*nature/100);
  };
  return [stat(0,0,index===0?100:90),stat(31,252,index===0?100:110)];
}
export function heldItems(record,compoundEyes=false) {
  const [common,rare]=record.items;
  if(common&&common===rare)return [{name:common,percent:100}];
  return [{name:common||'No item',percent:compoundEyes?60:50},{name:rare||'No item',percent:compoundEyes?20:5},{name:'No item',percent:compoundEyes?20:45}].reduce((list,row)=>{const found=list.find(x=>x.name===row.name);if(found)found.percent+=row.percent;else list.push({...row});return list;},[]);
}
// General Atlas narratives describe a whole location. Only explicitly scoped
// species notes belong on a species card; never infer relevance from shared geography.
const SPECIES_NOTE_INDICES = {
  'Violet City': {340:[0]}, 'Dark Cave': {206:[0]},
  'Ruins of Alph': {201:[0,1]}, 'Union Cave': {131:[0]},
  'Bell Tower': {250:[0]}, 'Whirl Islands': {249:[0]},
  'Lake of Rage': {130:[0]}, "Dragon's Den": {147:[0]},
  'Mt. Silver': {146:[0]},
  'Team Rocket HQ': {74:[0],100:[0],109:[0],101:[1]},
};
const SHARED_LOCATION_NOTE_INDICES = {
  'Cherrygrove City':[0], 'Ecruteak City':[0], 'Cliff Edge Gate':[0],
  'Cliff Cave':[0], 'Sprout Tower':[0], 'Ilex Forest':[0],
  'National Park':[1], 'Safari Zone Gate':[0],
};
function speciesLocationNotes(reference,location,id,method) {
  if(location==='Embedded Tower') {
    // The original note combines two separate legendary requirements.
    if(id===383)return ['Groudon is the SoulSilver Red Orb encounter.'];
    if(id===384)return ['Rayquaza requires the Jade Orb after showing Professor Oak both a HeartGold-origin Kyogre and a SoulSilver-origin Groudon.'];
    return [];
  }
  const notes=(SHARED_LOCATION_NOTE_INDICES[location]||[]).map(index=>reference.notes[index]);
  notes.push(...(SPECIES_NOTE_INDICES[location]?.[id]||[]).map(index=>reference.notes[index]));
  if(location==='Cianwood City'&&method.includes('Rock Smash'))notes.push('Rock Smash encounters are on the northern beach.');
  if(location==='Dark Cave'&&id!==206)notes.push('The Route 31/46 side and Route 45 side have separate tables.');
  if(location==='Ruins of Alph'&&id!==201)notes.push(reference.notes[2]);
  if(location==='National Park'&&method.includes('Bug-Catching Contest'))notes.push(reference.notes[0]);
  if(location==='Mt. Silver'&&id!==146)notes.push('Outside and each cave section have separate tables. Rock Climb is required to explore the mountain. No random encounters occur at the summit.');
  return notes;
}
const locationsCache=new Map();
export function speciesLocations(gameId,id) {
  if(!pokedexReference(gameId))return [];
  if(!locationsCache.has(gameId)) {
    const bySpecies=new Map();
    const add=(id,location,detail,notes=[])=>{if(!id)return; if(!bySpecies.has(id))bySpecies.set(id,[]); const rows=bySpecies.get(id); let group=rows.find(g=>g.location===location);if(!group){group={location,details:[],notes:[]};rows.push(group);} if(!group.details.includes(detail))group.details.push(detail);for(const note of notes)if(!group.notes.includes(note))group.notes.push(note);};
    for(const location of ATLAS_LOCATIONS) {
      const reference=locationEncounterReference(gameId,location.name);
      for(const row of reference?.encounters||[])add(row.speciesId,location.name,`${row.method} · Lv. ${row.levels} · ${row.times} · ${row.rate}`,speciesLocationNotes(reference,location.name,row.speciesId,row.method));
      for(const row of locationDetails(gameId,location.name)?.gifts||[])add(speciesIdForName(gameId,row.name),location.name,[row.kind,row.location,row.level?`Lv. ${row.level}`:'',...row.conditions,row.availability].filter(Boolean).join(' · '));
    }
    for(const row of SOULSILVER_SAFARI_ENCOUNTERS)add(speciesIdForName(gameId,row.pokemon),'Safari Zone',`${row.method} · Lv. ${row.levels} · ${row.times} · ${row.rarity}`,['Existing Safari records: encounter/block mechanics audit remains pending.']);
    // These are moving encounters, deliberately not fixed walking-table rows.
    for(const n of [29,30,31,32,33,34,35,36,37,38,39,42,43,44,45,46])for(const id of [243,244])add(id,`Route ${n}`,'Roaming · Lv. 40 · after release at Burned Tower; check the Pokégear map');
    for(const n of [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,24,26,28])add(381,`Route ${n}`,'Roaming · Lv. 35 · after Steven’s Vermilion City event; check the Pokégear map');
    locationsCache.set(gameId,bySpecies);
  }
  return locationsCache.get(gameId).get(id)||[];
}
export function moveName(gameId,id) { return gameReference(gameId)?.moves[id] || `Move #${id}`; }
