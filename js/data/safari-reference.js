import { SOULSILVER_SAFARI_MAPS } from './games/soulsilver/safari-maps.js';
import { SOULSILVER_SAFARI_ENCOUNTERS } from './games/soulsilver/safari-encounters.js';
export { SAFARI_POSITIONS,safariReference,validateSafariAreas,safariNeighbors,swapSafariArea } from './safari-layout.js';
import { safariReference } from './safari-layout.js';
export function safariAreaEncounters(gameId,areaId) {
  const area=safariReference(gameId)?.areas.find(a=>a.id===areaId);
  if(!area)return [];
  return SOULSILVER_SAFARI_ENCOUNTERS.flatMap((row,sourceIndex)=>row.method.split(' · ')[0]===area.name?[{...row,sourceIndex}]:[]);
}
export function safariAreaMap(gameId,areaId) {
  return gameId==='soulsilver'?SOULSILVER_SAFARI_MAPS.find(map=>map.areaId===areaId)||null:null;
}
