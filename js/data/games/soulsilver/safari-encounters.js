// Atlas catalogue derived from the same slot data/rules as the simulator engine.
// Base percentages assume no objects and no encounter-altering lead ability/Repel.
import { SOULSILVER_SAFARI_MECHANICS as rules } from './safari-mechanics.js';
import { SAFARI_METHODS,SAFARI_TIMES,minimumSafariDays } from '../../../safari-engine.js';
import { speciesReference } from '../../game-reference.js';
const labels={plains:'Plains',forest:'Forest',peak:'Peak',water:'Waterside'};
const timeLabel=time=>time[0].toUpperCase()+time.slice(1);
const levels=values=>[...new Set(values)].sort((a,b)=>a-b).join(', ');
const rows=[];
for(const area of rules.areas)for(const [method,table]of Object.entries(area.methods)){
 const candidates=[];
 for(const [ti,time]of SAFARI_TIMES.entries()){
  const grouped=new Map();
  for(const [speciesId,level]of table.base[ti]){
   if(!grouped.has(speciesId))grouped.set(speciesId,[]);grouped.get(speciesId).push(level);
  }
  for(const [speciesId,values]of grouped)candidates.push({areaId:area.id,encounterMethod:method,speciesId,levels:levels(values),time,base:true,requirements:{},rarity:`${values.length*10}% with no objects; object encounters replace the first qualifying slots`});
  for(const bonus of table.bonus){
   const [speciesId,level]=bonus.mons[ti];
   const points=Object.entries(bonus.requirements).map(([c,p])=>`${p} ${labels[c]} points`).join(' + ');
   const earliest=minimumSafariDays(bonus.requirements);
   candidates.push({areaId:area.id,encounterMethod:method,speciesId,levels:String(level),time,base:false,bonusId:bonus.id,requirements:bonus.requirements,minimumDays:earliest?.days??null,rarity:`Requires ${points}; objects must be unlocked; aging multiplies block points; 10% per qualifying slot`});
  }
 }
 // Identical per-time records share one reference row; keep explicit time
 // restrictions whenever species or levels differ across morning/day/night.
 const merged=new Map();
 for(const row of candidates){
  const {time,...rest}=row,key=JSON.stringify(rest);
  if(!merged.has(key))merged.set(key,{...rest,availableTimes:[]});merged.get(key).availableTimes.push(time);
 }
 for(const row of merged.values()){
  const times=row.availableTimes.length===3?'All times':row.availableTimes.map(timeLabel).join(', ');
  rows.push({...row,pokemon:speciesReference('soulsilver',row.speciesId).name,method:`${area.name} · ${SAFARI_METHODS[method]}${row.base?'':' · Objects'}`,times});
 }
}
export const SOULSILVER_SAFARI_ENCOUNTERS=Object.freeze(rows.map(row=>Object.freeze(row)));
