import { safariRules,safariCustomizationAccess } from './safari-engine.js';
import { sanitizeSafariSave } from './saves/soulsilver-safari.js';
const rules=safariRules('soulsilver'),categories=['plains','forest','peak','water','none'];
const clone=v=>JSON.parse(JSON.stringify(v));
const freeze=v=>{if(v&&typeof v==='object'){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
const integer=(v,max)=>Number.isInteger(v)&&v>=0&&v<=max;
export const SAFARI_FIELD_LABELS={open:'Safari entry available',baobaStage:'Baoba challenge stage',customizerUnlocked:'Area Customizer unlocked',blockLevel:'Object unlock level',nationalDex:'National Dex obtained',trainerId:'Full trainer ID',clockPenalty:'Clock penalty active',time:'Time of day',surf:'Surf access',oldrod:'Old Rod available',goodrod:'Good Rod available',superrod:'Super Rod available'};
export function safariContextKey(profile){return profile?`${profile.gameId}:${profile.id}:${profile.revision}:${profile.snapshot?.loadedAt}`:'soulsilver:reference';}
export function createSafariScenario(profile=null){
 if(profile&&profile.gameId!=='soulsilver')throw new Error('Safari initialization supports SoulSilver only.');
 const saved=profile?sanitizeSafariSave(profile.snapshot?.safari):null;
 const values={},provenance={};
 function put(key,value,source){values[key]=value??null;provenance[key]=value===null||value===undefined?'unavailable':source;}
 for(let i=0;i<6;i++)put(`layout.${i}`,profile?saved.layout?.[i]:rules.initialLayouts[0][i],profile?'save':'default');
 for(let i=0;i<12;i++)put(`age.${i}`,profile?saved.areaAges?.[i]:0,profile?'save':'default');
 for(let i=0;i<6;i++)for(const c of categories)put(`blocks.${i}.${c}`,profile?saved.areaBlocks?.[i]?.[c]:0,profile?'save':'default');
 const trainer=profile?.snapshot?.trainer;
 const fullID=integer(trainer?.trainerId,65535)&&integer(trainer?.secretId,65535)?trainer.trainerId+trainer.secretId*65536:null;
 put('trainerId',profile?fullID:0,profile?'save':'default');
 put('baobaStage',profile?saved.baobaStage:2,profile?'save':'default');
 put('blockLevel',profile?saved.blockLevel:0,profile?'save':'default');
 put('nationalDex',profile&&typeof profile.snapshot?.pokedex?.nationalDex==='boolean'?profile.snapshot.pokedex.nationalDex:profile?null:false,profile?'save':'default');
 put('customizerUnlocked',profile?safariCustomizationAccess({baobaStage:saved.baobaStage}).customizerUnlocked:false,profile?'save':'default');
 put('open',profile?null:true,'default');put('clockPenalty',profile?null:false,'default');put('time',profile?null:'morning','default');
 for(const method of ['surf','oldrod','goodrod','superrod'])put(method,profile?null:false,'default');
 const original=freeze({values:clone(values),provenance:clone(provenance)});
 return {schemaVersion:1,gameId:'soulsilver',contextKey:safariContextKey(profile),mode:profile?'adventure':'reference',owner:profile?.snapshot?.trainer?.name||'No save loaded',notes:profile?[saved.reason||'Older adventure: reload the save to decode Safari fields.',...(saved.pendingDays?['Saved pending Safari days have not been applied. Stored ages are shown without adding elapsed time.']:[])]:['Default new Safari scenario: first possible layout, no objects, zero stored days. This is not an actual saved game.'],original,starting:clone(original),current:clone(original),savedObjects:profile?clone(saved.areaObjects||null):null,pendingDays:saved?.pendingDays??null};
}
function validateValue(key,value){
 if(value===null)return;
 if(/^(open|customizerUnlocked|nationalDex|clockPenalty|surf|oldrod|goodrod|superrod)$/.test(key)){if(typeof value!=='boolean')throw new Error('Choose Yes, No or Unavailable.');return;}
 if(key==='time'){if(!['morning','day','night'].includes(value))throw new Error('Choose a valid time.');return;}
 const max=key.startsWith('layout.')?11:key.startsWith('age.')?255:key.startsWith('blocks.')?30:key==='baobaStage'?7:key==='blockLevel'?4:key==='trainerId'?0xffffffff:-1;
 if(!integer(value,max))throw new Error('Enter a whole number within the field limits.');
}
export function updateSafariScenario(scenario,key,value,{starting=false}={}){
 if(!Object.hasOwn(scenario.original.values,key))throw new Error('Unknown Safari field.');
 validateValue(key,value);
 const next={...scenario,starting:clone(scenario.starting),current:clone(scenario.current)};
 const target=starting?next.starting:next.current;
 const changed=[key];
 if(key.startsWith('layout.')&&value!==null&&value!==target.values[key]){
  if(!starting&&target.values.customizerUnlocked!==true)throw new Error('Set the starting Area Customizer status before proposing layout changes.');
  const other=Object.keys(target.values).find(k=>k!==key&&k.startsWith('layout.')&&target.values[k]===value);
  if(other){target.values[other]=target.values[key];changed.push(other);}
  if(!starting){
   const position=key.split('.')[1],otherPosition=other?.split('.')[1];
   for(const c of categories){
    const field=`blocks.${position}.${c}`;
    if(other){const otherField=`blocks.${otherPosition}.${c}`;[target.values[field],target.values[otherField]]=[target.values[otherField],target.values[field]];changed.push(otherField);}
    else target.values[field]=0;
    changed.push(field);
   }
  }
 }
 target.values[key]=value;
 if(key==='baobaStage'){
  target.values.customizerUnlocked=safariCustomizationAccess({baobaStage:value}).customizerUnlocked;changed.push('customizerUnlocked');
 }
 // Clearing an unavailable quantity never invents the other category counts.
 const position=key.match(/^blocks\.(\d)\./)?.[1];
 if(position!==undefined){const counts=categories.map(c=>target.values[`blocks.${position}.${c}`]);if(counts.filter(n=>n!==null).reduce((a,b)=>a+b,0)>30)throw new Error('An area may contain at most 30 objects, including decorations.');}
 for(const field of changed)target.provenance[field]=target.values[field]===null?'unavailable':starting?'manual':'hypothetical';
 if(starting)next.current=clone(next.starting);
 return next;
}
export function resetSafariScenario(scenario,{original=false}={}){
 return {...scenario,starting:clone(original?scenario.original:scenario.starting),current:clone(original?scenario.original:scenario.starting)};
}
export function safariScenarioChanges(scenario){
 return Object.keys(scenario.current.values).filter(key=>scenario.current.values[key]!==scenario.starting.values[key]).map(key=>({key,from:scenario.starting.values[key],to:scenario.current.values[key]}));
}
export function safariEngineScenario(scenario,position=4){
 const v=scenario.current.values,areaId=v[`layout.${position}`];
 const layout=Array.from({length:6},(_,i)=>v[`layout.${i}`]);
 return {gameId:'soulsilver',areaId,layout:layout.every(n=>n!==null)?layout:null,days:areaId===null?null:v[`age.${areaId}`],blocks:Object.fromEntries(categories.map(c=>[c,v[`blocks.${position}.${c}`]])),time:v.time,trainerId:v.trainerId,progression:Object.fromEntries(['open','baobaStage','customizerUnlocked','blockLevel','nationalDex'].map(k=>[k,v[k]])),methodAccess:Object.fromEntries(['surf','oldrod','goodrod','superrod'].map(k=>[k,v[k]]))};
}
