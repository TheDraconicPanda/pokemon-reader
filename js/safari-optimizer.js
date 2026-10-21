import { safariRules,SAFARI_CATEGORIES,SAFARI_TIMES,SAFARI_METHODS,safariAvailableObjects,safariMultiplier,evaluateSafariEncounters } from './safari-engine.js';
import { safariEngineScenario,updateSafariScenario } from './safari-scenario.js';
import { speciesReference } from './data/game-reference.js';
const rules=safariRules('soulsilver'),categories=[...SAFARI_CATEGORIES,'none'];
const zero=()=>Object.fromEntries(categories.map(c=>[c,0]));
const sum=values=>values.reduce((a,b)=>a+b,0);
const signature=scenario=>JSON.stringify([scenario.contextKey,scenario.current]);
export const SAFARI_TARGETS=Object.freeze([...new Set(rules.areas.flatMap(a=>Object.values(a.methods).flatMap(t=>[...t.base.flat().map(m=>m[0]),...t.bonus.flatMap(b=>b.mons.map(m=>m[0]))])))].sort((a,b)=>speciesReference('soulsilver',a).name.localeCompare(speciesReference('soulsilver',b).name)).map(id=>speciesReference('soulsilver',id)));
export function safariResultBasis(scenario,keys){
 const basis={save:[],manual:[],default:[],hypothetical:[],unavailable:[]};
 for(const key of new Set(keys)){const source=scenario.current.provenance[key]||'unavailable';basis[source].push(key);}
 return basis;
}
function relevantKeys(position,areaId,method,blocks,blockLevel){
 const placed=Object.values(blocks||{}).some(n=>n>0);
 return ['open','time','blockLevel',...Array.from({length:6},(_,i)=>`layout.${i}`),`age.${areaId}`,...categories.map(c=>`blocks.${position}.${c}`),...(method==='land'?[]:[method]),...(placed?['nationalDex','baobaStage',...(blockLevel>0&&blockLevel<4?['trainerId']:[])]:[])];
}
export function safariLiveResults(scenario,position,method,{starting=false}={}){
 const state=starting?{...scenario,current:scenario.starting}:scenario;
 const input={...safariEngineScenario(state,position),method};
 const result=evaluateSafariEncounters(input),grouped=new Map();
 for(const slot of result.slots){
  if(!grouped.has(slot.speciesId))grouped.set(slot.speciesId,{speciesId:slot.speciesId,levels:[],percent:0,slots:[]});
  const row=grouped.get(slot.speciesId);row.levels.push(slot.level);row.percent+=slot.slotPercent;row.slots.push(slot.slot);
 }
 const encounters=[...grouped.values()].map(r=>({...r,levels:[...new Set(r.levels)].sort((a,b)=>a-b)}));
 return {...result,encounters,basis:safariResultBasis(state,relevantKeys(position,input.areaId,method,input.blocks,input.progression.blockLevel))};
}
// Each cell has exactly the same qualifying bonus rows. Project the current
// quantities onto that cell, then remove only the capacity excess. This avoids
// brute-forcing every integer allocation or assuming a base encounter survives.
function intervals(table,days,category){
 const cuts=[...new Set([0,31,...table.bonus.map(b=>Math.ceil((b.requirements[category]||0)/safariMultiplier(category,days))).filter(n=>n>0&&n<=30)])].sort((a,b)=>a-b);
 return cuts.slice(0,-1).map((low,i)=>[low,cuts[i+1]-1]);
}
function nearestInCell(bounds,current){
 const blocks=zero();
 SAFARI_CATEGORIES.forEach((c,i)=>blocks[c]=Math.max(bounds[i][0],Math.min(bounds[i][1],current[c])));blocks.none=current.none;
 let excess=sum(Object.values(blocks))-30;
 if(excess>0){
  const removable=categories.map((c,i)=>({c,low:i<4?bounds[i][0]:0,changed:blocks[c]!==current[c]}));
  removable.sort((a,b)=>Number(b.changed)-Number(a.changed)||(blocks[b.c]-b.low)-(blocks[a.c]-a.low));
  for(const {c,low}of removable){const take=Math.min(Math.max(0,excess),blocks[c]-low);blocks[c]-=take;excess-=take;}
 }
 return excess>0?null:blocks;
}
function blockCandidates(table,days,current,allowed){
 const bins=SAFARI_CATEGORIES.map(c=>allowed.has(c)?intervals(table,days,c):[[0,0]]),output=[];
 function visit(bounds){
  if(sum(bounds.map(b=>b[0]))>30)return;
  if(bounds.length===4){const candidate=nearestInCell(bounds,current);if(candidate)output.push(candidate);return;}
  for(const interval of bins[bounds.length])visit([...bounds,interval]);
 }
 visit([]);return output;
}
function planRank(plan){return [plan.status==='ready'?0:plan.additionalDays===0&&!plan.timeChange?1:2,plan.additionalDays,Number(plan.timeChange),plan.objectOperations+Number(plan.replaceArea)+Number(plan.timeChange),plan.displacedObjects,plan.changedBlockCategories,plan.totalObjects,plan.areaId,plan.position,SAFARI_TIMES.indexOf(plan.time)];}
function compare(a,b){const x=planRank(a),y=planRank(b);for(let i=0;i<x.length;i++)if(x[i]!==y[i])return x[i]-y[i];return 0;}
function prerequisites(values,areaId,method,position,replaceArea){
 const blocked=[],unknown=[];
 if(values.open===false)blocked.push('Safari entry must be unlocked.');else if(values.open!==true)unknown.push('Confirm Safari entry access.');
 if(replaceArea){if(values.customizerUnlocked===false)blocked.push('Unlock Area Customizer to activate this area.');else if(values.customizerUnlocked!==true)unknown.push('Confirm Area Customizer access before activating this area.');}
 if(method!=='land'){if(values[method]===false)blocked.push(`Obtain ${SAFARI_METHODS[method]} access.`);else if(values[method]!==true)unknown.push(`Confirm ${SAFARI_METHODS[method]} access.`);}
 if(values[`age.${areaId}`]===null)unknown.push('Supply this area’s stored age; additional waiting cannot be inferred.');
 if(values.blockLevel===null)unknown.push('Supply the object unlock level.');
 if(values.time===null)unknown.push('Choose a time of day.');
 if(categories.some(c=>values[`blocks.${position}.${c}`]===null))unknown.push('Complete the object counts, including decorations, for this position.');
 return {blocked,unknown};
}
export function optimizeSafariTarget(scenario,speciesId,{replacePosition=null,limit=6}={}){
 if(scenario?.gameId!=='soulsilver'||!Number.isInteger(speciesId)||speciesId<1||speciesId>493)return {status:'unsupported',plans:[],issues:[],reason:'Choose a supported SoulSilver species.'};
 const values=scenario.current.values,layout=Array.from({length:6},(_,i)=>values[`layout.${i}`]);
 if(layout.some(id=>id===null)||new Set(layout).size!==6)return {status:'unknown',plans:[],issues:[],reason:'Complete the six distinct active areas before calculating changes.'};
 if(replacePosition!==null&&(!Number.isInteger(replacePosition)||replacePosition<0||replacePosition>5))return {status:'invalid',plans:[],issues:[],reason:'Invalid replacement position.'};
 const plans=[],issues=[];let targetTables=0;
 let objects=null;
 try{if(values.blockLevel!==null)objects=safariAvailableObjects(values.blockLevel,values.trainerId);}catch(error){return {status:'invalid',plans:[],issues:[],reason:error.message};}
 const allowed=new Set((objects||[]).map(id=>rules.objects[id].category));
 for(const area of rules.areas)for(const [method,table]of Object.entries(area.methods)){
  const times=SAFARI_TIMES.filter((time,ti)=>table.base[ti].some(mon=>mon[0]===speciesId)||table.bonus.some(b=>b.mons[ti][0]===speciesId));
  if(!times.length)continue;targetTables++;
  const active=layout.indexOf(area.id),replaceArea=active===-1;
  const positions=replaceArea?(replacePosition===null?[0,1,2,3,4,5]:[replacePosition]):[active];
  const tableIssue={areaId:area.id,method,times,requirements:table.bonus.filter(b=>b.mons.some(m=>m[0]===speciesId)).map(b=>({...b.requirements}))};
  let recorded=false;
  for(const position of positions){
   const pre=prerequisites(values,area.id,method,position,replaceArea);
   const isBase=table.base.some(t=>t.some(m=>m[0]===speciesId));
   if(!isBase){
    if(values.blockLevel===0)pre.blocked.push('Unlock object placement through Baoba and the National Dex.');
    if(values.nationalDex===null)pre.unknown.push('Confirm National Dex progress before placing objects.');
    if(values.baobaStage===null)pre.unknown.push('Confirm Baoba challenge progress before placing objects.');
    if(values.nationalDex===false)pre.blocked.push('Obtain the National Dex before placing objects.');
    if(values.baobaStage!==null&&values.baobaStage<6)pre.blocked.push('Complete Baoba’s second challenge before placing objects.');
    if(values.blockLevel>0&&objects===null)pre.unknown.push('Supply the full trainer ID to determine unlocked object groups.');
    if(objects!==null&&!tableIssue.requirements.some(req=>Object.keys(req).every(c=>allowed.has(c))))pre.blocked.push('Receive the missing object-category calls from Baoba.');
   }
   if(pre.blocked.length||pre.unknown.length){if(!recorded){issues.push({...tableIssue,status:pre.blocked.length?'locked':'unknown',reasons:[...new Set([...pre.blocked,...pre.unknown])]});recorded=true;}continue;}
   if(objects===null&&(!isBase||(!replaceArea&&categories.some(c=>values[`blocks.${position}.${c}`]>0)))){if(!recorded){issues.push({...tableIssue,status:'unknown',reasons:['Supply the full trainer ID to determine unlocked object groups.']});recorded=true;}continue;}
   const before=Object.fromEntries(categories.map(c=>[c,values[`blocks.${position}.${c}`]])),current=replaceArea?zero():before;
   const fromDays=values[`age.${area.id}`],daysToTry=[...new Set([fromDays,...Object.values(rules.thresholds).flat().filter(day=>day>fromDays)])].sort((a,b)=>a-b);
   const found=new Set();let feasible=false;
   for(const days of daysToTry){
    if(days>fromDays&&values.blockLevel===0)break;
    const candidates=blockCandidates(table,days,current,allowed);
    const byTime=new Map();
    for(const blocks of candidates){
     const objectOperations=sum(categories.map(c=>Math.abs(blocks[c]-current[c])));
     if(!replaceArea&&objectOperations>0&&values.blockLevel===0)continue;
     for(const time of times){
      if(found.has(time))continue;
      const proposedLayout=[...layout];proposedLayout[position]=area.id;
      const evaluation=evaluateSafariEncounters({gameId:'soulsilver',areaId:area.id,method,time,days,blocks,layout:proposedLayout,trainerId:values.trainerId,progression:{open:values.open,blockLevel:values.blockLevel,nationalDex:values.nationalDex,baobaStage:values.baobaStage},methodAccess:{[method]:values[method]}});
      if(evaluation.status!=='available')continue;
      const slots=evaluation.slots.filter(s=>s.speciesId===speciesId);if(!slots.length)continue;
      const additionalDays=days-fromDays,timeChange=time!==values.time;
      const alreadyQualifies=!replaceArea&&!objectOperations&&!additionalDays&&!timeChange;
      const plan={speciesId,areaId:area.id,method,position,time,availableTimes:[time],days,additionalDays,blocks:{...blocks},scores:evaluation.scores,multipliers:Object.fromEntries(SAFARI_CATEGORIES.map(c=>[c,safariMultiplier(c,days)])),levels:[...new Set(slots.map(s=>s.level))].sort((a,b)=>a-b),percent:slots.length*10,replaceArea,previousArea:layout[position],timeChange,objectOperations,displacedObjects:replaceArea?sum(Object.values(before)):0,changedBlockCategories:categories.filter(c=>blocks[c]!==current[c]).length,totalObjects:sum(Object.values(blocks)),alreadyQualifies,status:alreadyQualifies?'ready':additionalDays?'waiting':timeChange?'time':'configure',requirements:table.bonus.filter(b=>slots.some(s=>s.bonusId===b.id)).map(b=>({...b.requirements})),basis:safariResultBasis(scenario,[...relevantKeys(position,area.id,method,blocks,values.blockLevel),...(replaceArea?['customizerUnlocked']:[]),...(additionalDays?['clockPenalty']:[])]),warnings:additionalDays?(values.clockPenalty===true?['Clock penalty is active. Credited area aging must resume before these waiting days can accumulate.']:values.clockPenalty===null?['Clock penalty status is unknown. Waiting is expressed in credited active-area days, not a calendar date.']:[]):[],signature:signature(scenario)};
      if(!byTime.has(time))byTime.set(time,[]);byTime.get(time).push(plan);
     }
    }
    for(const [time,options]of byTime){options.sort(compare);plans.push(...options.slice(0,3));found.add(time);feasible=true;}
    if(found.size===times.length)break;
   }
   if(!feasible&&!recorded){issues.push({...tableIssue,status:'locked',reasons:['No valid configuration fits the 30-object limit with these unlocks. Check any contradictory starting progression or placed objects.']});recorded=true;}
  }
 }
 plans.sort(compare);
 // Merge identical solutions across times while retaining genuine level differences.
 const unique=new Map();
 for(const plan of plans){const key=JSON.stringify([plan.areaId,plan.method,plan.position,plan.days,plan.blocks,plan.levels,plan.percent]);if(!unique.has(key))unique.set(key,plan);else{const existing=unique.get(key);for(const time of plan.availableTimes)if(!existing.availableTimes.includes(time))existing.availableTimes.push(time);}}
 const sorted=[...unique.values()].sort(compare);
 return {status:sorted.length?'solutions':targetTables?(issues.some(i=>i.status==='unknown')?'unknown':'locked'):'unsupported',plans:sorted.slice(0,limit),totalSolutions:sorted.length,issues,reason:sorted.length?'':targetTables?'No confirmed solution with the supplied starting values and unlocks.':'This species has no supported Safari Zone encounter.'};
}
export function applySafariPlan(scenario,plan){
 if(plan.signature!==signature(scenario))throw new Error('The configuration changed. Recalculate this target before applying a plan.');
 let next=scenario;
 if(plan.replaceArea)next=updateSafariScenario(next,`layout.${plan.position}`,plan.areaId);
 if(plan.additionalDays){
  for(let i=0;i<6;i++){const area=next.current.values[`layout.${i}`],age=next.current.values[`age.${area}`];if(age!==null)next=updateSafariScenario(next,`age.${area}`,Math.min(255,age+plan.additionalDays));}
 }
 // Decreases first keep every intermediate quantity update within the cap.
 const keys=categories.map(c=>({key:`blocks.${plan.position}.${c}`,value:plan.blocks[c]}));
 keys.sort((a,b)=>(a.value-next.current.values[a.key])-(b.value-next.current.values[b.key]));
 for(const {key,value}of keys)if(next.current.values[key]!==value)next=updateSafariScenario(next,key,value);
 if(next.current.values.time!==plan.time)next=updateSafariScenario(next,'time',plan.time);
 return next;
}
