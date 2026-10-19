import { SOULSILVER_SAFARI_REFERENCE } from './games/soulsilver/safari-reference.js';
import { SOULSILVER_SAFARI_ENCOUNTERS } from './games/soulsilver/safari-encounters.js';
export const SAFARI_POSITIONS=['Northwest','North center','Northeast','Southwest','South center','Southeast'];
export function safariReference(gameId) { return gameId==='soulsilver'?SOULSILVER_SAFARI_REFERENCE:null; }
export function validateSafariAreas(gameId,areas) {
  const game=safariReference(gameId);
  if(!game||!Array.isArray(areas)||areas.length!==6||new Set(areas).size!==6||areas.some(id=>!Number.isInteger(id)||!game.areas.some(a=>a.id===id)))throw new Error('Choose six different Safari areas for SoulSilver.');
  return areas;
}
export function safariNeighbors(gameId,position) {
  const game=safariReference(gameId);
  if(!game||!Number.isInteger(position)||position<0||position>=6)return null;
  const col=position%game.columns,row=Math.floor(position/game.columns);
  return {north:row>0?position-game.columns:null,east:col<game.columns-1?position+1:null,south:row<game.rows-1?position+game.columns:position===game.entrancePosition?'gate':null,west:col>0?position-1:null};
}
export function safariAreaEncounters(gameId,areaId) {
  const area=safariReference(gameId)?.areas.find(a=>a.id===areaId);
  if(!area)return [];
  return SOULSILVER_SAFARI_ENCOUNTERS.flatMap((row,sourceIndex)=>row.method.split(' · ')[0]===area.name?[{...row,sourceIndex}]:[]);
}
export function swapSafariArea(gameId,areas,position,areaId) {
  validateSafariAreas(gameId,areas);
  if(!Number.isInteger(position)||position<0||position>=6||!safariReference(gameId).areas.some(a=>a.id===areaId))throw new Error('Invalid Safari area position.');
  const updated=[...areas],other=updated.indexOf(areaId);
  if(other!==-1)updated[other]=updated[position];
  updated[position]=areaId;return updated;
}
