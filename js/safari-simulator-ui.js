import { SAFARI_METHODS,safariRules } from './safari-engine.js';
import { SAFARI_POSITIONS } from './data/safari-layout.js';
import { speciesReference,speciesIdForName } from './data/game-reference.js';
import { SAFARI_TARGETS,safariLiveResults,optimizeSafariTarget,applySafariPlan } from './safari-optimizer.js';
const rules=safariRules('soulsilver'),categories=['plains','forest','peak','water','none'];
const names={plains:'Plains',forest:'Forest',peak:'Peak',water:'Waterside',none:'Decorations'};
const $=id=>document.getElementById(id),node=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
const quantities=blocks=>categories.filter(c=>blocks[c]>0).map(c=>`${blocks[c]} ${names[c]}`).join(' + ')||'No objects';
const points=requirements=>Object.entries(requirements).map(([c,n])=>`${n} ${names[c]} points`).join(' + ')||'No object requirement';
const plural=(n,unit)=>`${n} ${unit}${n===1?'':'s'}`;
function basisText(basis){
 const parts=[['manual','manually supplied'],['default','default'],['hypothetical','hypothetical'],['unavailable','unavailable']].filter(([key])=>basis[key].length).map(([key,label])=>`${basis[key].length} ${label} inputs`);
 return parts.length?`Depends on ${parts.join(', ')}.`:'Based on verified save fields.';
}
function speciesLink(id){const link=node('a',speciesReference('soulsilver',id).name);link.href=`../pokedex/#species=${id}&scope=national`;return link;}
export function mountSafariSimulator({getScenario,setScenario,focusField,selectHypotheticalMode}){
 let position=4,targetId=null;
 const areas=$('safari-sim-areas'),method=$('safari-sim-method');
 for(const target of SAFARI_TARGETS)$('safari-target-list').append(new Option(target.name));
 for(const c of categories){const paragraph=node('p',`${names[c]}: ${rules.objects.filter(o=>o.category===c).map(o=>o.name).join(', ')}. ${c==='none'?'Uses placement space but contributes no points.':'Any of these objects supplies the same category points.'}`);$('safari-object-guide').append(paragraph);}
 function showTable(result,statusId,listId){
  const status=$(statusId),list=$(listId);list.replaceChildren();
  status.textContent=result.status==='available'?`Available in this scenario. ${basisText(result.basis)}`:`${result.status==='unknown'?'Unknown':result.status==='unavailable'?'Unavailable':'Check configuration'}: ${result.reasons.join(' ')}`;
  for(const row of result.encounters){const li=node('li');li.append(speciesLink(row.speciesId),document.createTextNode(` · Lv. ${row.levels.join(', ')} · ${row.percent}%`));list.append(li);}
 }
 function renderTarget(){
  const scenario=getScenario(),container=$('safari-target-results');container.replaceChildren();
  if(!targetId)return;
  const result=optimizeSafariTarget(scenario,targetId),summary=$('safari-target-summary');
  if(!result.plans.length){const issue=result.issues.find(i=>i.status===result.status)||result.issues[0];summary.textContent=[result.reason,...(issue?.reasons||[])].join(' ');}
  else summary.textContent=result.plans[0].alreadyQualifies?'This Pokémon qualifies in the proposed scenario. Check its area, method and the changes from your starting configuration.':`Found ${plural(result.totalSolutions,'valid plan')}. Showing ${result.plans.length}; all changes remain hypothetical.`;
  for(const plan of result.plans){
   const card=node('article');card.className='safari-plan';card.dataset.planStatus=plan.status;
   const title=node('h3',`${rules.areas[plan.areaId].name} · ${SAFARI_METHODS[plan.method]}`);
   const state=node('p',plan.status==='ready'?'Already qualifies in the proposed configuration':plan.status==='waiting'?`Requires ${plural(plan.additionalDays,'additional credited area day')}`:plan.status==='time'?`Requires ${plan.time} time of day`:'No additional area days; configuration changes required');state.className='safari-plan-state';
   const timing=node('p',`Time: ${plan.availableTimes.join(', ')} · Lv. ${plan.levels.join(', ')} · ${plan.percent}% of encounter slots.`);
   const area=node('p',plan.replaceArea?`Replace ${rules.areas[plan.previousArea].name} at ${SAFARI_POSITIONS[plan.position]} with ${rules.areas[plan.areaId].name}; its object list starts empty.`:`Area already active at ${SAFARI_POSITIONS[plan.position]}.`);
   const blocks=node('p',`Proposed objects: ${quantities(plan.blocks)} (${plan.totalObjects}/30 placements).`);
   const requirement=node('p',plan.requirements.length?`Qualifying target slots use: ${plan.requirements.map(points).join('; ')}.`:'This result retains a normal encounter slot; no target-specific object requirement.');
   const age=node('p',`Area age: ${scenario.current.values[`age.${plan.areaId}`]} → ${plan.days} credited days. Multipliers: ${Object.entries(plan.multipliers).map(([c,n])=>`${names[c]} ×${n}`).join(', ')}.`);
   const cost=node('p',`From the current proposal: ${plural(plan.objectOperations,'object addition/removal')}${plan.timeChange?`; change time to ${plan.time}`:''}${plan.replaceArea?'; activate the required area':''}.`);
   const dependency=node('p',basisText(plan.basis));dependency.className='safari-dependency';
   card.append(title,state,timing,area,blocks,requirement,age,cost,dependency);
   for(const warning of plan.warnings)card.append(node('p',warning));
   const button=node('button',plan.alreadyQualifies?'View this encounter':'Preview this plan');button.type='button';
   button.addEventListener('click',()=>{
    try{position=plan.position;method.value=plan.method;selectHypotheticalMode();setScenario(applySafariPlan(getScenario(),plan),'Plan applied to the hypothetical scenario. Waiting days have not passed in your game.');$('safari-live-title').focus({preventScroll:true});$('safari-live-title').scrollIntoView({block:'start'});}
    catch(error){summary.textContent=error.message;}
   });card.append(button);container.append(card);
  }
  if(result.issues.length){const detail=node('details');detail.append(node('summary','Other paths: missing values or locked prerequisites'));const list=node('ul');for(const issue of result.issues){const li=node('li',`${rules.areas[issue.areaId].name} · ${SAFARI_METHODS[issue.method]} · ${issue.status==='unknown'?'Unknown starting values':'Locked with this configuration'}: ${issue.reasons.join(' ')}${issue.requirements.length?' Target slot points: '+issue.requirements.map(points).join('; ')+'.':''}`);list.append(li);}detail.append(list);container.append(detail);}
 }
 function render(){
  const scenario=getScenario();if(!scenario)return;
  areas.replaceChildren();
  for(let i=0;i<6;i++){const id=scenario.current.values[`layout.${i}`],button=node('button',`${SAFARI_POSITIONS[i]} · ${id===null?'Unavailable area':rules.areas[id].name}`);button.type='button';button.dataset.simPosition=i;if(i===position)button.setAttribute('aria-current','location');button.addEventListener('click',()=>{position=i;render();areas.querySelector(`[data-sim-position="${i}"]`).focus({preventScroll:true});});areas.append(button);}
  const current=safariLiveResults(scenario,position,method.value),starting=safariLiveResults(scenario,position,method.value,{starting:true});
  showTable(starting,'safari-starting-status','safari-starting-encounters');showTable(current,'safari-proposed-status','safari-proposed-encounters');
  $('safari-live-mode').textContent=$('scenario-edit-mode').value==='starting'?'Editing starting values: manual corrections become the comparison baseline.':'Editing hypothetical changes: starting values remain preserved.';
  const area=scenario.current.values[`layout.${position}`];
  $('safari-live-points').textContent=current.scores?`${rules.areas[area].name} points: ${Object.entries(current.scores).map(([c,n])=>`${names[c]} ${n}`).join(' · ')}. Ages are stored/simulated credited days.`:'Complete the unavailable starting fields to calculate this table.';
  $('safari-complete-start').hidden=current.status==='available';renderTarget();
 }
 method.addEventListener('change',render);
 $('safari-complete-start').addEventListener('click',()=>{
  const s=getScenario();if(!s)return;const v=s.current.values,area=v[`layout.${position}`];
  const keys=['open',...Array.from({length:6},(_,i)=>`layout.${i}`),'time','blockLevel',...(method.value==='land'?[]:[method.value]),`age.${area}`,...categories.map(c=>`blocks.${position}.${c}`)];
  const missing=keys.find(k=>v[k]===null);focusField(missing||'open');
 });
 $('safari-target-form').addEventListener('submit',event=>{
  event.preventDefault();const name=$('safari-target').value.trim();targetId=speciesIdForName('soulsilver',name);
  if(!targetId){$('safari-target-summary').textContent='Choose an exact Pokémon name from the list.';$('safari-target-results').replaceChildren();return;}
  if(!getScenario())return;renderTarget();
 });
 $('safari-target').addEventListener('input',()=>{targetId=null;$('safari-target-results').replaceChildren();$('safari-target-summary').textContent='Choose a target and find its requirements.';});
 return {render};
}
