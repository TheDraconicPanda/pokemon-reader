import { mountSafariSimulator } from './safari-simulator-ui.js';
import { getActiveProfile,subscribeAdventureChanges } from './adventures.js';
import { safariRules } from './safari-engine.js';
import { SAFARI_POSITIONS } from './data/safari-layout.js';
import { createSafariScenario,updateSafariScenario,resetSafariScenario,safariScenarioChanges,safariContextKey,SAFARI_FIELD_LABELS } from './safari-scenario.js';
const rules=safariRules('soulsilver'),labels=SAFARI_FIELD_LABELS;
const node=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
const $=id=>document.getElementById(id);
let scenario=null,revision=0;
const controls=new Map(),section=$('scenario-fields');
const stageLabels=['Before the Safari opening call','Safari opening call received','Geodude challenge underway','Geodude shown · awaiting next call','Area Customizer available · begin second challenge','Sandshrew challenge underway','Second challenge complete','Object placement calls received'];
const levelLabels=['No object groups received','One object group received','Two object groups received','Three object groups received','All four object groups received'];
let simulator=null;
const sourceNames={save:'Verified save field',manual:'Manually supplied starting value',default:'Default scenario value',hypothetical:'Hypothetical change',unavailable:'Unavailable · supply manually'};
function format(key,value){if(value===null)return 'Unavailable';if(typeof value==='boolean')return value?'Yes':'No';if(key.startsWith('layout.'))return rules.areas[value].name;if(key==='baobaStage')return stageLabels[value];if(key==='blockLevel')return levelLabels[value];return String(value);}
function labelFor(key){if(key.startsWith('layout.'))return SAFARI_POSITIONS[Number(key.split('.')[1])];if(key.startsWith('age.'))return `${rules.areas[Number(key.split('.')[1])].name} stored days`;if(key.startsWith('blocks.')){const [,i,c]=key.split('.');return `${SAFARI_POSITIONS[i]} · ${c==='none'?'Decorations':c==='water'?'Waterside':c[0].toUpperCase()+c.slice(1)} objects`;}return labels[key]||key;}
function addField(parent,key,type,options){
 const label=node('label',labelFor(key));label.className='scenario-field';const input=node(type==='number'?'input':'select');input.dataset.scenarioField=key;input.disabled=true;
 if(type==='number'){input.type='number';input.min=0;input.max=key.startsWith('age.')?255:key.startsWith('blocks.')?30:key==='baobaStage'?7:key==='blockLevel'?4:0xffffffff;input.step=1;input.placeholder='Unavailable';}
 else{input.append(new Option('Unavailable',''));for(const [value,text]of options)input.append(new Option(text,String(value)));}
 const help=node('small');help.id=`scenario-source-${key.replaceAll('.','-')}`;input.setAttribute('aria-describedby',help.id);
 input.addEventListener('change',()=>{
  try{
   const value=input.value===''?null:type==='number'?Number(input.value):type==='boolean'?input.value==='true':['area','integer'].includes(type)?Number(input.value):input.value;
   scenario=updateSafariScenario(scenario,key,value,{starting:$('scenario-edit-mode').value==='starting'});
   $('scenario-message').textContent=$('scenario-edit-mode').value==='starting'?'Manual starting value updated. Hypothetical changes reset to this starting configuration.':'Hypothetical change applied.';
  }catch(error){$('scenario-message').textContent=error.message;}
  render();
 });
 label.append(input,help);parent.append(label);controls.set(key,{input,help});
}
function group(title,open=false){const detail=node('details');detail.open=open;detail.append(node('summary',title));const fields=node('div');fields.className='scenario-grid';detail.append(fields);section.append(detail);return fields;}
const progress=group('Progression and access',true);
for(const key of ['open','customizerUnlocked','nationalDex','clockPenalty','surf','oldrod','goodrod','superrod'])addField(progress,key,'boolean',[[true,'Yes'],[false,'No']]);
addField(progress,'baobaStage','integer',stageLabels.map((label,i)=>[i,label]));
addField(progress,'blockLevel','integer',levelLabels.map((label,i)=>[i,label]));
const identity=group('Advanced: trainer identity for object calls');addField(identity,'trainerId','number');identity.append(node('p','Loaded saves supply this automatically. With only some object groups received, their order depends on the full trainer ID (TID + 65536 × SID). All four received groups remove this dependency. A default identity describes a hypothetical setup.'));
addField($('safari-live-controls'),'time','select',[['morning','Morning · 04:00–09:59'],['day','Day · 10:00–19:59'],['night','Night · 20:00–03:59']]);
const layout=group('Six active areas');for(let i=0;i<6;i++)addField(layout,`layout.${i}`,'area',rules.areas.map(a=>[a.id,a.name]));
const ages=group('Stored area days');for(const area of rules.areas)addField(ages,`age.${area.id}`,'number');
for(let i=0;i<6;i++){const block=group(`${SAFARI_POSITIONS[i]} objects`);for(const c of ['plains','forest','peak','water','none'])addField(block,`blocks.${i}.${c}`,'number');}
function render(){
 const edited=$('scenario-edit-mode').value==='starting'?scenario.starting:scenario.current;
 for(const [key,{input,help}]of controls){input.disabled=false;input.value=edited.values[key]===null?'':String(edited.values[key]);help.textContent=`${sourceNames[edited.provenance[key]]} · Original: ${format(key,scenario.original.values[key])}`;}
 $('scenario-owner').textContent=scenario.mode==='adventure'?`${scenario.owner} · Safari starting configuration`:'No save · default new Safari scenario';
 $('scenario-source').textContent=scenario.mode==='adventure'?'Decoded fields come from the active Adventure Profile. Missing fields remain unavailable.':'Defaults describe a configurable example, not saved progress.';
 $('scenario-notes').textContent=scenario.notes.join(' ');
 const list=$('scenario-differences');list.replaceChildren();const changes=safariScenarioChanges(scenario);
 if(!changes.length)list.append(node('li','No hypothetical changes.'));
 for(const {key,from,to}of changes)list.append(node('li',`${labelFor(key)}: ${format(key,from)} → ${format(key,to)} · Hypothetical`));
 simulator?.render();
 document.documentElement.dataset.safariScenarioReady='true';
}
$('scenario-edit-mode').addEventListener('change',()=>{if(scenario)render();});
$('scenario-reset').addEventListener('click',()=>{if(!scenario)return;scenario=resetSafariScenario(scenario);$('scenario-message').textContent='Hypothetical changes reset to your starting configuration.';render();});
$('scenario-restore').addEventListener('click',()=>{if(!scenario)return;scenario=resetSafariScenario(scenario,{original:true});$('scenario-message').textContent='Restored the original loaded/default starting configuration.';render();});
async function refresh(){
 const request=++revision;let profile;
 try{profile=await getActiveProfile();if(profile?.gameId!=='soulsilver')profile=null;}
 catch{if(request!==revision)return;if(!scenario){scenario=createSafariScenario();scenario.notes.push('Browser storage is unavailable. This visit uses a default scenario; no stored adventure is replaced.');render();}else $('scenario-message').textContent='Could not refresh the active adventure. The last initialized configuration remains visible; its current adventure status could not be checked.';return;}
 if(request!==revision)return;
 if(!scenario||scenario.contextKey!==safariContextKey(profile)){
  const replaced=!!scenario;scenario=createSafariScenario(profile);render();
  if(replaced)$('scenario-message').textContent='The active adventure or loaded save changed. The scenario was reinitialized; previous visit edits were cleared.';
 }
}
subscribeAdventureChanges(refresh);window.addEventListener('focus',refresh);window.addEventListener('pageshow',refresh);document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')refresh();});
simulator=mountSafariSimulator({getScenario:()=>scenario,setScenario:(next,message)=>{scenario=next;$('scenario-message').textContent=message;render();},focusField:key=>{const control=controls.get(key);if(!control)return;$('scenario-edit-mode').value='starting';render();const detail=control.input.closest('details');if(detail)detail.open=true;control.input.scrollIntoView({block:'center'});control.input.focus({preventScroll:true});},selectHypotheticalMode:()=>{$('scenario-edit-mode').value='current';}});
refresh();
