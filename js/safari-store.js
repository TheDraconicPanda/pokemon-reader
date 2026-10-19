import { adventureTransaction as transaction,idbValue as valueOf } from './adventures.js';
import { safariReference,validateSafariAreas } from './data/safari-reference.js';
const keyFor=(gameId,adventureId)=>`safariManualLayout:${gameId}:${adventureId||'reference'}`;
export function validateSafariLayout(record,gameId,adventureId) {
  if(record?.key!==keyFor(gameId,adventureId)||record.gameId!==gameId||record.adventureId!==adventureId||record.schemaVersion!==1||!Number.isInteger(record.revision)||record.revision<1)throw new Error('Saved Safari layout is invalid or belongs to another adventure.');
  validateSafariAreas(gameId,record.areas);return record;
}
export async function loadSafariLayout(gameId,adventureId=null) {
  if(!safariReference(gameId))throw new Error('Safari reference is unavailable for this game.');
  return transaction(['settings'],'readonly',async tx=>{
    const record=await valueOf(tx.objectStore('settings').get(keyFor(gameId,adventureId)));
    return record?validateSafariLayout(record,gameId,adventureId):null;
  });
}
export async function saveSafariLayout(gameId,adventureId,areas,expectedRevision) {
  validateSafariAreas(gameId,areas);
  // Capture caller-owned draft before opening the asynchronous transaction.
  const selectedAreas=[...areas];
  return transaction(['profiles','settings'],'readwrite',async tx=>{
    const settings=tx.objectStore('settings'),key=keyFor(gameId,adventureId);
    const active=await valueOf(settings.get('activeAdventure'));
    if((active?.id||null)!==adventureId)throw new Error('The active adventure changed. Reopen the manual layout for the current adventure.');
    if(adventureId){const profile=await valueOf(tx.objectStore('profiles').get(adventureId));if(profile?.gameId!==gameId)throw new Error('Adventure not found for this game.');}
    const previous=await valueOf(settings.get(key));
    if(previous)validateSafariLayout(previous,gameId,adventureId);
    if((previous?.revision||0)!==expectedRevision)throw new Error('This Safari layout changed in another tab. Close and reopen the editor to review it.');
    const record={key,gameId,adventureId,schemaVersion:1,areas:selectedAreas,revision:expectedRevision+1,updatedAt:new Date().toISOString()};
    settings.put(record);return record;
  });
}
