import { readUint32 } from './gen4-binary.js';
// SpecialEncounter starts at 0x7F24 in Platinum's selected general block.
// Native struct: marshDaily +0, swarmDaily +4, TrophyGarden +8,
// PlayerHoneyTreeStates +0x10 (trees +0x14 = PKHeX OFS_HONEY 0x7F38).
export function decodePlatinumGreatMarsh(data,result) {
  if(!result?.valid || result.gameId!=='platinum' || ![0,1].includes(result.activePartition) || data.length!==0x80000)return null;
  return {schemaVersion:1,status:'decoded',dailySeed:readUint32(data,result.activePartition*0x40000+0x7F24),nationalDex:result.save.pokedex.nationalDex};
}
export function sanitizeGreatMarsh(value) {
  if(value?.schemaVersion!==1 || value.status!=='decoded' || !Number.isInteger(value.dailySeed) || value.dailySeed<0 || value.dailySeed>0xFFFFFFFF || typeof value.nationalDex!=='boolean')return null;
  return {schemaVersion:1,status:'decoded',dailySeed:value.dailySeed,nationalDex:value.nationalDex};
}
