import { adventureTransaction, idbValue, trainerKey, validateSnapshot, notifyAdventureChange, ADVENTURE_SCHEMA } from '../js/adventures.js';
const key=rom=>`nativeROM:${rom}`;
const sameTrainer=(a,b)=>a&&b&&trainerKey(a)===trainerKey(b)&&a.trainer.name===b.trainer.name&&a.trainer.gender===b.trainer.gender;
export async function boundAdventure(rom) {
  return adventureTransaction(['settings','profiles'],'readonly',async tx=>{
    const binding=await idbValue(tx.objectStore('settings').get(key(rom)));
    if(!binding)return null;
    const profile=await idbValue(tx.objectStore('profiles').get(binding.id));
    if(profile)validateSnapshot(profile.snapshot);
    return profile||null;
  });
}
export async function commitCartridge(config,snapshot,digest,{choose,isCurrent,signal}) {
  validateSnapshot(snapshot);
  const proposed=await adventureTransaction(['settings','profiles'],'readonly',async tx=>{
    const binding=await idbValue(tx.objectStore('settings').get(key(config.rom)));
    const matches=await idbValue(tx.objectStore('profiles').index('trainerKey').getAll(trainerKey(snapshot)));
    const existing=matches.find(p=>p.id===binding?.id&&sameTrainer(p.snapshot,snapshot));
    return {binding,matches,existing};
  });
  let id=proposed.existing?.id;
  if(!id&&proposed.matches.length){id=await choose(proposed.matches);if(id===null)return null;}
  if(!isCurrent())return null;
  const profile=await adventureTransaction(['settings','profiles'],'readwrite',async tx=>{
    const abort=()=>{try{tx.abort();}catch{}};
    signal.addEventListener('abort',abort,{once:true});
    tx.addEventListener('complete',()=>signal.removeEventListener('abort',abort));
    tx.addEventListener('abort',()=>signal.removeEventListener('abort',abort));
    if(!isCurrent())throw Error('Snapshot was superseded.');
    const store=tx.objectStore('profiles'),settings=tx.objectStore('settings');
    const existing=id?await idbValue(store.get(id)):null;
    const binding=await idbValue(settings.get(key(config.rom)));
    if(id&&(!existing||trainerKey(existing.snapshot)!==trainerKey(snapshot)))throw Error('Adventure changed during selection.');
    if(!isCurrent())throw Error('Snapshot was superseded.');
    if(existing&&binding?.id===id&&binding.digest===digest&&binding.revision===existing.revision){settings.put({key:'activeAdventure',id});return existing;}
    // Ingestion time orders observations; game counters may go backwards after
    // restoring a state. A completed later save must still update this adventure.
    snapshot.loadedAt=new Date(Math.max(Date.now(),Date.parse(existing?.updatedAt||'')+1||0)).toISOString();
    const updated={id:id||crypto.randomUUID(),schemaVersion:ADVENTURE_SCHEMA,trainerKey:trainerKey(snapshot),gameId:snapshot.gameId,
      createdAt:existing?.createdAt||snapshot.loadedAt,updatedAt:snapshot.loadedAt,revision:(existing?.revision||0)+1,snapshot};
    store.put(updated);settings.put({key:key(config.rom),id:updated.id,digest,revision:updated.revision});settings.put({key:'activeAdventure',id:updated.id});return updated;
  });
  notifyAdventureChange();return profile;
}
