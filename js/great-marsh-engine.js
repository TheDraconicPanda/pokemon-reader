import { PLATINUM_ATLAS } from './data/games/platinum/atlas.js';
export const GREAT_MARSH_RULES=Object.freeze({areas:6,balls:30,steps:500,entryCost:500,dailySlots:[6,7],dailySlotShare:10});
const landWeights=[20,20,10,10,10,10,5,5,4,4,1,1],waterWeights=[60,30,5,4,1],rodWeights=[40,40,15,4,1];
const methods={walking:'land',surfing:'surf',old_rod:'old_rod',good_rod:'good_rod',super_rod:'super_rod'};
import { PLATINUM_SPECIES_IDS } from './data/games/platinum/species-identifiers.js';
function pool(nationalDex){return typeof nationalDex==='boolean'?PLATINUM_ATLAS.greatMarshPools[nationalDex?'after_national_dex':'before_national_dex']:null;}
export function greatMarshPool(nationalDex) {
  const values=pool(nationalDex);if(!values)return [];
  return [...new Set(values)].map(speciesId=>({speciesId,indices:values.flatMap((id,i)=>id===speciesId?[i]:[]),dailyProbability:values.filter(id=>id===speciesId).length/32}));
}
export function greatMarshDaily(dailySeed,nationalDex) {
  if(!Number.isInteger(dailySeed)||dailySeed<0||dailySeed>0xFFFFFFFF||!pool(nationalDex))return null;
  return Array.from({length:6},(_,i)=>{const index=(dailySeed>>>(5*i))&31;return {area:i+1,index,speciesId:pool(nationalDex)[index]};});
}
export function greatMarshTable({area,time='day',method='walking',dailySeed=null,nationalDex=null,dailySpeciesId=null}={}) {
  if(!Number.isInteger(area)||area<1||area>6)throw new Error('Select a Great Marsh area from 1 to 6.');
  if(!['morning','day','night'].includes(time))throw new Error('Select morning, day or night.');
  if(!Object.hasOwn(methods,method))throw new Error('Unsupported Great Marsh encounter method.');
  const data=PLATINUM_ATLAS.tables[`MAP_HEADER_GREAT_MARSH_${area}`].data,field=methods[method];
  if(!data[field+'_rate'])return {status:'no-encounters',rows:[],unknownPercent:0,area,time,method};
  const slots=data[field+'_encounters'].map(s=>({...s}));let unknownPercent=0;
  if(method==='walking'){
    if(time!=='morning')for(const [j,i]of [2,3].entries())slots[i].species=data[time][j];
    const selected=dailySpeciesId??greatMarshDaily(dailySeed,nationalDex)?.[area-1].speciesId;
    if(selected!==null&&selected!==undefined){
      if(!pool(nationalDex)?.includes(selected))throw new Error('The daily visitor is not in the selected Platinum Pokédex pool.');
      for(const i of [6,7])slots[i].species=selected;
    }else{slots[6]=slots[7]=null;unknownPercent=10;}
  }
  const weights=method==='walking'?landWeights:method==='surfing'||method==='old_rod'?waterWeights:rodWeights;
  const groups=new Map();
  slots.forEach((slot,i)=>{if(!slot)return;const id=typeof slot.species==='number'?slot.species:PLATINUM_SPECIES_IDS[slot.species];
    if(!Number.isInteger(id)||id<1||id>493)throw new Error('Invalid primary Great Marsh species identifier.');
    const min=slot.level??slot.level_min,max=slot.level??slot.level_max,key=JSON.stringify([id,min,max]);
    if(!groups.has(key))groups.set(key,{speciesId:id,minLevel:min,maxLevel:max,percent:0});groups.get(key).percent+=weights[i];
  });
  const rows=[...groups.values()];if(rows.reduce((sum,r)=>sum+r.percent,unknownPercent)!==100)throw new Error('Incomplete Great Marsh slot distribution.');
  return {status:unknownPercent?'partial':'complete',rows,unknownPercent,area,time,method};
}
