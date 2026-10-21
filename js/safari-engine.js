import { SOULSILVER_SAFARI_MECHANICS as rules } from './data/games/soulsilver/safari-mechanics.js';
import { validateSafariAreas,swapSafariArea } from './data/safari-layout.js';
export const SAFARI_METHODS=Object.freeze({land:'Walking',surf:'Surfing',oldrod:'Old Rod',goodrod:'Good Rod',superrod:'Super Rod'});
export const SAFARI_TIMES=Object.freeze(['morning','day','night']);
export const SAFARI_CATEGORIES=Object.freeze(['plains','forest','peak','water']);
const integer=(value,min,max,label)=>{if(!Number.isInteger(value)||value<min||value>max)throw new Error(`Invalid ${label}.`);return value;};
export function safariRules(gameId){return gameId==='soulsilver'?rules:null;}
function requireGame(gameId){if(!safariRules(gameId))throw new Error('Safari mechanics are unavailable for this game.');}
export function safariMultiplier(category,days){
 if(!SAFARI_CATEGORIES.includes(category))throw new Error('Invalid block category.');
 integer(days,0,255,'area age');return 1+rules.thresholds[category].filter(day=>days>=day).length;
}
export function safariAvailableObjects(blockLevel,trainerId){
 integer(blockLevel,0,4,'block unlock level');
 if(blockLevel===0)return [];
 if(blockLevel===4)return rules.objects.map(object=>object.id);
 if(trainerId===null||trainerId===undefined)return null;
 integer(trainerId,0,0xffffffff,'trainer ID');
 return rules.objectGroupOrders[trainerId%10].slice(0,blockLevel).flatMap(group=>rules.objectGroups[group]).sort((a,b)=>a-b);
}
export function safariBlockScores(blocks,days){
 if(!blocks||typeof blocks!=='object'||Array.isArray(blocks))throw new Error('Block quantities are required.');
 for(const key of Object.keys(blocks))if(![...SAFARI_CATEGORIES,'none'].includes(key))throw new Error('Invalid block category.');
 // Missing category counts are unknown, not automatically zero.
 const quantities=Object.fromEntries(SAFARI_CATEGORIES.map(c=>[c,integer(blocks[c],0,30,`${c} block count`)]));
 const decorations=integer(blocks.none??0,0,30,'decoration count');
 if(Object.values(quantities).reduce((a,b)=>a+b,decorations)>rules.maxBlocks)throw new Error('At most 30 objects may be placed in one area.');
 return Object.fromEntries(SAFARI_CATEGORIES.map(c=>[c,quantities[c]*safariMultiplier(c,days)]));
}
export function minimumSafariBlocks(requirements,days){
 integer(days,0,255,'area age');
 if(!requirements||typeof requirements!=='object'||Array.isArray(requirements))throw new Error('Block requirements are required.');
 const blocks=Object.fromEntries(SAFARI_CATEGORIES.map(c=>[c,0]));
 for(const [c,points]of Object.entries(requirements)){
  if(!SAFARI_CATEGORIES.includes(c))throw new Error('Invalid block category.');
  integer(points,0,255,'block points');blocks[c]=Math.ceil(points/safariMultiplier(c,days));
 }
 const total=Object.values(blocks).reduce((a,b)=>a+b,0);
 return {blocks,total,possible:total<=rules.maxBlocks};
}
export function minimumSafariDays(requirements,{fromDays=0,capacity=30,categories=SAFARI_CATEGORIES}={}){
 integer(fromDays,0,255,'area age');integer(capacity,0,30,'block capacity');
 if(!Array.isArray(categories)||categories.some(c=>!SAFARI_CATEGORIES.includes(c)))throw new Error('Invalid available categories.');
 // Validate requirements even when a requested category is unavailable.
 minimumSafariBlocks(requirements,fromDays);
 if(Object.entries(requirements).some(([c,p])=>p>0&&!categories.includes(c)))return null;
 for(let days=fromDays;days<=255;days++){
  const result=minimumSafariBlocks(requirements,days);
  if(result.total<=capacity)return {days,additionalDays:days-fromDays,...result};
 }
 return null;
}
// Resolve a fully supplied hypothetical table; progression/access is checked by
// evaluateSafariEncounters below. Uniform slot shares exclude lead abilities/Repel.
export function resolveSafariSlots({gameId,areaId,method,time,blocks,days}){
 requireGame(gameId);integer(areaId,0,11,'area');
 if(!Object.hasOwn(SAFARI_METHODS,method))throw new Error('Unsupported Safari encounter method.');
 const timeIndex=SAFARI_TIMES.indexOf(time);if(timeIndex===-1)throw new Error('Invalid Safari time.');
 const scores=safariBlockScores(blocks,days);
 const table=rules.areas[areaId].methods[method];if(!table)return [];
 const slots=table.base[timeIndex].map(([speciesId,level],slot)=>({slot,speciesId,level,bonusId:null,slotPercent:10}));
 let replacement=0;
 for(const bonus of table.bonus){
  if(!Object.entries(bonus.requirements).every(([category,points])=>scores[category]>=points))continue;
  const [speciesId,level]=bonus.mons[timeIndex];slots[replacement]={slot:replacement,speciesId,level,bonusId:bonus.id,slotPercent:10};
  if(++replacement===10)break;
 }
 return slots;
}
export function evaluateSafariEncounters(scenario){
 const {gameId,areaId,method,time,blocks,days,layout,progression,trainerId,methodAccess}=scenario;
 if(!safariRules(gameId))return {status:'unsupported',reasons:['Safari mechanics are unavailable for this game.'],slots:[]};
 try{
  if(areaId===null||areaId===undefined)return {status:'unknown',reasons:['Unavailable: required Safari area.'],slots:[]};
  integer(areaId,0,11,'area');
  if(!Object.hasOwn(SAFARI_METHODS,method))return {status:'unsupported',reasons:['Unsupported Safari encounter method.'],slots:[]};
  if(!rules.areas[areaId].methods[method])return {status:'unavailable',reasons:['This area has no water encounter terrain.'],slots:[]};
  if(progression?.open===false)return {status:'unavailable',reasons:['Safari entry is not unlocked.'],slots:[]};
  const missing=[];
  if(progression?.open!==true)missing.push('Safari entry status');
  if(!layout)missing.push('active area arrangement');else{validateSafariAreas(gameId,layout);if(!layout.includes(areaId))return {status:'unavailable',reasons:['The required area is not active.'],slots:[]};}
  if(method!=='land'){
   if(methodAccess?.[method]===false)return {status:'unavailable',reasons:['The required Surf or rod access is not unlocked.'],slots:[]};
   if(methodAccess?.[method]!==true)missing.push('required Surf or rod access');
  }
  if(!SAFARI_TIMES.includes(time))missing.push('time of day');
  if(days===null||days===undefined)missing.push('area age');
  if(!blocks||SAFARI_CATEGORIES.some(c=>blocks[c]===null||blocks[c]===undefined))missing.push('block quantities');
  if(progression?.blockLevel===null||progression?.blockLevel===undefined)missing.push('block unlock level');
  if(missing.length)return {status:'unknown',reasons:missing.map(x=>`Unavailable: ${x}.`),slots:[]};
  const objects=safariAvailableObjects(progression.blockLevel,trainerId);
  safariBlockScores(blocks,days);
  const placed=Object.values(blocks).reduce((a,b)=>a+b,0);
  if(placed&&progression.nationalDex===false)return {status:'unavailable',reasons:['Object placement requires the National Dex.'],slots:[]};
  if(placed&&progression.baobaStage!==null&&progression.baobaStage!==undefined&&safariCustomizationAccess(progression).blockCallsEligible===false)return {status:'unavailable',reasons:['Baoba’s second challenge must be completed before object placement.'],slots:[]};
  if(placed&&objects===null)return {status:'unknown',reasons:['Trainer ID is needed to determine the unlocked object groups.'],slots:[]};
  const categories=new Set((objects||[]).map(id=>rules.objects[id].category));
  if(Object.entries(blocks).some(([c,n])=>n>0&&!categories.has(c)))return {status:'unavailable',reasons:['The configuration uses locked object categories.'],slots:[]};
  const slots=resolveSafariSlots(scenario);
  return {status:'available',reasons:[],slots,rateBasis:'Uniform encounter slots before lead abilities and Repel',scores:safariBlockScores(blocks,days)};
 }catch(error){return {status:'invalid',reasons:[error.message],slots:[]};}
}
export function rearrangeSafariAreas(gameId,layout,position,areaId,{customizerUnlocked}={}){
 requireGame(gameId);if(customizerUnlocked!==true)throw new Error('The Area Customizer must be unlocked before changing the layout.');
 return swapSafariArea(gameId,layout,position,areaId);
}
// Elapsed days here means verified credited days, not a wall-clock estimate.
// Area age is keyed by identity and is preserved while the area is inactive.
export function advanceSafariAges(ages,layout,elapsed,{blockLevel,clockPenalty}={}){
 validateSafariAreas('soulsilver',layout);integer(elapsed,0,65535,'elapsed days');integer(blockLevel,0,4,'block unlock level');
 if(typeof clockPenalty!=='boolean')throw new Error('Clock penalty status is required.');
 if(!Array.isArray(ages)||ages.length!==12||Array.from(ages).some(n=>!Number.isInteger(n)||n<0||n>255))throw new Error('All area ages are required.');
 return ages.map((age,id)=>!clockPenalty&&blockLevel>0&&layout.includes(id)?Math.min(255,age+elapsed):age);
}
export function safariAvailableAreas({gameId,customizerUnlocked,initialLayout}={}){
 requireGame(gameId);
 if(customizerUnlocked===true)return rules.areas.map(area=>area.id);
 if(customizerUnlocked!==false||!initialLayout)return null;
 validateSafariAreas(gameId,initialLayout);
 if(!rules.initialLayouts.some(layout=>layout.every((id,i)=>id===initialLayout[i])))throw new Error('The starting layout is not a verified initial arrangement.');
 return [...initialLayout];
}
// Baoba's script variable is a logical stage here, not a decoded save offset.
// Stage 4 unlocks Area Customizer for the second challenge; stage 6 has passed it.
export function safariCustomizationAccess({baobaStage,nationalDex}={}){
 if(baobaStage===null||baobaStage===undefined)return {customizerUnlocked:null,blockCallsEligible:null};
 integer(baobaStage,0,7,'Baoba challenge stage');
 return {customizerUnlocked:baobaStage>=4,blockCallsEligible:baobaStage<6||nationalDex===false?false:nationalDex===true?true:null};
}
export function reconfigureSafariAreas(state,position,areaId,{customizerUnlocked}={}){
 const layout=rearrangeSafariAreas(state.gameId,state.layout,position,areaId,{customizerUnlocked});
 if(!Array.isArray(state.areaBlocks)||state.areaBlocks.length!==6||Array.from(state.areaBlocks).some(blocks=>!blocks))throw new Error('Six area object configurations are required.');
 state.areaBlocks.forEach(blocks=>safariBlockScores(blocks,0));
 const areaBlocks=state.areaBlocks.map(blocks=>({...blocks})),other=state.layout.indexOf(areaId);
 if(other!==-1)[areaBlocks[position],areaBlocks[other]]=[areaBlocks[other],areaBlocks[position]];
 else areaBlocks[position]={plains:0,forest:0,peak:0,water:0,none:0};
 // A replacement initializes the new area's objects, while swapping retains them.
 // The twelve identity-bound age counters are unchanged by either operation.
 return {...state,layout,areaBlocks,...(state.areaAges?{areaAges:[...state.areaAges]}:{})};
}
