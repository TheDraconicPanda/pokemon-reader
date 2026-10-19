import { EV_KEYS } from '../../js/planner-save.js';
import { listProfiles, getActiveProfile, selectProfile, clearActiveProfile, subscribeAdventureChanges } from '../../js/adventures.js';
import { initializePlanners, listPlanners, storePlanner, choosePlanner, preferredPlanner } from '../../js/planner-store.js';
import { defaultProgress, defaultGoals, newPlanner, normalizeProgress, memberProgress, reconcilePlanner, savedPokemon, linkPokemon, importPlannerBackup, speciesName, natureName, moveName } from '../../js/planner-model.js';

const $ = selector => document.querySelector(selector);
let plan=null, profile=null, plans=[], profiles=[], persistent=true, queue=Promise.resolve(), revision=0, refreshTimer;

function message(text) { $('#save-status').textContent=text; }
function run(action) {
  queue=queue.then(async()=>{
    const focused=document.activeElement?.id;
    $('.app').setAttribute('aria-busy','true');
    try { await action(); }
    catch(error) { if(plan)render();message(error.message+' Export a backup before refreshing if you have unsaved changes.'); }
    finally { $('.app').setAttribute('aria-busy','false'); if(focused) document.getElementById(focused)?.focus(); }
  });
  return queue;
}
async function commit(next) {
  const updated=persistent ? await storePlanner(next,{adventureId:profile?.id || null}) : next;
  plan=updated;
  plans=plans.filter(p=>p.id!==plan.id).concat(plan);
  render();
  message(persistent ? 'Saved in this browser' : 'Session only — browser storage unavailable; export a backup');
}
function mutate(action) {
  const id=plan?.id;
  return run(async()=>{ if(!plan || plan.id!==id)throw new Error('Planner selection changed. Please repeat the edit on the selected plan.');const next=structuredClone(plan);action(next);await commit(reconcilePlanner(next,profile)); });
}

async function refreshContext(preferredId=null) {
  const current=++revision;
  const selected=await getActiveProfile();
  const allProfiles=await listProfiles();
  const allPlans=await listPlanners();
  const preferred=await preferredPlanner(selected?.id || null);
  if(current!==revision)return;
  profile=selected;profiles=allProfiles;plans=allPlans;
  const associated=plans.filter(p=>profile && p.adventureId===profile.id);
  const unassociated=plans.filter(p=>p.adventureId===null);
  const available=associated.concat(unassociated);
  plan=available.find(p=>p.id===preferredId) || (associated.length===1 ? associated[0] : associated.length>1 ? associated.find(p=>p.id===preferred) : unassociated.find(p=>p.id===preferred) || (unassociated.length===1 ? unassociated[0] : null)) || null;
  if(plan) {
    const reconciled=reconcilePlanner(plan,profile);
    if(JSON.stringify(reconciled.links)!==JSON.stringify(plan.links)) {
      plan=await storePlanner(reconciled,{adventureId:profile?.id || null});
      plans=plans.filter(p=>p.id!==plan.id).concat(plan);
    }
  }
  render();
  if(!plan)message('Choose a planner; existing adventures and plans are preserved.');
  else message('Saved in this browser');
}
function checked(key,text,group,actual=null) {
  const label=document.createElement('label');label.className='checkline';
  const input=document.createElement('input');input.type='checkbox';input.id=key;
  input.checked=actual===null ? Boolean(plan.state[group]?.[key]) : actual;
  input.disabled=actual!==null;
  input.addEventListener('change',()=>{const value=input.checked;mutate(next=>{next.state[group][key]=value;});});
  label.htmlFor=input.id;label.append(input,document.createTextNode(text));return label;
}
function paragraph(text,className='small muted') {const p=document.createElement('p');p.className=className;p.textContent=text;return p;}
function tracking(member,context='team') {
  const progress=memberProgress(plan,member,profile);
  const box=document.createElement('div');box.className='pokemon-tracking';box.dataset.linkStatus=progress.status;
  if(!profile || plan.adventureId!==profile.id) {
    box.append(paragraph('Manual progress. Associate this plan with an adventure to track saved Pokémon.'));
    return box;
  }
  const label=document.createElement('label');label.textContent='Choose saved Pokémon: ';
  const select=document.createElement('select');select.id=`${context}-pokemon-${member.id}`;
  select.setAttribute('aria-label',`${context==='team'?'Saved':'EV'} Pokémon for ${member.name}`);
  select.add(new Option('Choose a Pokémon',''));
  select.add(new Option('Use manual progress','manual'));
  const groups=new Map();
  for(const candidate of progress.candidates) {
    const groupName=candidate.recordKind==='party' ? 'Party' : 'PC';
    if(!groups.has(groupName)){const group=document.createElement('optgroup');group.label=groupName;groups.set(groupName,group);select.append(group);}
    groups.get(groupName).append(new Option(`${candidate.nickname || speciesName(candidate.speciesId)} · ${speciesName(candidate.speciesId)} · ${candidate.location}`,candidate.token));
  }
  select.value=progress.actual?.token || (plan.links[member.id]?.manual ? 'manual' : '');
  select.addEventListener('change',()=>{
    const token=select.value;
    mutate(next=>{
      if(token==='manual')next.links[member.id]={manual:true};
      else if(token) {
        const pokemon=savedPokemon(profile).find(p=>p.token===token);
        if(!pokemon)throw new Error('That Pokémon is no longer in this snapshot.');
        linkPokemon(next,member.id,pokemon,profile);
      } else delete next.links[member.id];
    });
  });
  label.append(select);box.append(label);
  if(progress.actual) {
    const actual=progress.actual;
    box.append(paragraph(`Current: ${actual.nickname || speciesName(actual.speciesId)} · ${speciesName(actual.speciesId)} · ${actual.location}${actual.level ? ' · Level '+actual.level : ''}`,'actual-pokemon'));
    box.append(paragraph(`Evolution: ${progress.evolved ? 'Target reached' : 'Target: '+speciesName(member.speciesId)} · Nature: ${natureName(actual.natureId)} (${progress.nature ? 'matches goal' : 'does not match goal'})`));
    box.append(paragraph('Current moves: '+actual.moves.filter(move=>move.id).map(move=>moveName(move.id)).join(' · ')));
  } else if(progress.linked) {
    box.append(paragraph(progress.status==='ambiguous' ? 'Multiple Pokémon share this identity. Choose the intended Pokémon for this snapshot.' : 'Not found in latest save. Association preserved.','link-status'));
    if(progress.lastKnown)box.append(paragraph(`Last known: ${progress.lastKnown.nickname || speciesName(progress.lastKnown.speciesId)} · ${speciesName(progress.lastKnown.speciesId)} · ${progress.lastKnown.location} · ${natureName(progress.lastKnown.natureId)} · ${plan.links[member.id].lastSeenAt}`));
  } else {
    box.append(paragraph(progress.candidates.length ? 'Choose a saved Pokémon. PC candidates are never assigned automatically.' : 'No matching party Pokémon. Manual progress is available.'));
  }
  return box;
}
function renderTeam() {
  const grid=$('#team-grid');grid.replaceChildren();
  for(const member of plan.goals.team) {
    const progress=memberProgress(plan,member,profile);
    const card=document.createElement('article');card.className='team-card';card.dataset.member=member.id;
    const head=document.createElement('div');head.className='card-head';
    const titles=document.createElement('div');const title=document.createElement('h3');title.textContent=member.name;
    titles.append(title,paragraph('Started as '+member.origin,'species'));
    const pill=document.createElement('span');pill.className='status-pill'+(plan.state.ready[member.id]?' done':'');pill.textContent=plan.state.ready[member.id]?'Ready (manual)':'Planned';head.append(titles,pill);
    card.append(head,paragraph(member.role,'role'),paragraph('Planned ability: '+member.ability+' · Planned nature: '+member.nature,'small'),tracking(member));
    const moves=document.createElement('div');moves.className='moves';
    const heading=document.createElement('h4');heading.textContent='Final move priorities';moves.append(heading);
    member.moves.forEach(([move,detail],i)=>{
      const row=document.createElement('div');row.className='move'+(member.moveIds[i]===null?' unsettled':'');
      const number=document.createElement('span');number.className='priority';number.textContent=(i+1)+'.';
      const name=document.createElement('span');name.textContent=move;const info=document.createElement('small');info.textContent=detail;
      row.append(number,name,info);moves.append(row);
      const text=progress.linked ? (progress.actual ? (progress.moves[i]?'Currently learned: ':'Not currently learned: ')+move : 'Unavailable in latest save: '+move) : 'Manual completion: '+move;
      moves.append(checked(member.id+':'+i,text,'moves',progress.linked ? progress.moves[i] : null));
    });
    card.append(moves);
    if(member.temporary.length)card.append(paragraph('Temporary HMs: '+member.temporary.join(' · '),'small'));
    card.append(paragraph(member.note),checked(member.id,'Mark '+member.name+' ready for the final team (manual)','ready'));
    grid.append(card);
  }
}
function renderHms() {
  const list=$('#hm-list');list.replaceChildren();
  plan.goals.hms.forEach((hm,i)=>{
    const member=plan.goals.team.find(p=>p.id===hm.ownerId);
    const progress=member && memberProgress(plan,member,profile);
    const learned=progress?.actual?.moves.some(move=>move.id===hm.moveId) || false;
    const row=document.createElement('article');row.className='hm-row';row.dataset.hm=hm.move;
    const name=document.createElement('div');const title=document.createElement('h3');title.textContent=hm.move;name.append(title,paragraph(hm.status));
    const details=document.createElement('div');details.append(paragraph(hm.owner,'hm-owner'),paragraph(hm.why));
    const status=progress?.linked ? progress.actual ? `${learned?'Currently knows':'Does not currently know'} ${hm.move} · ${progress.actual.nickname || speciesName(progress.actual.speciesId)} · ${progress.actual.location}${progress.actual.recordKind==='storage'?' (in PC, outside the travelling party)':''}` : 'Linked Pokémon not found or ambiguous in latest save.' : 'Manual confirmation; no saved Pokémon linked to this owner.';
    details.append(paragraph(status,'hm-actual'));
    row.append(name,details,checked('hm:'+i,progress?.linked ? 'Currently learned' : hm.status==='Temporary'?'HM taught / handled (manual)':'Confirmed (manual)','hmDone',progress?.linked ? learned : null));list.append(row);
  });
}
function renderEvs() {
  const list=$('#ev-list');list.replaceChildren();
  for(const member of plan.goals.team) {
    const progress=memberProgress(plan,member,profile);
    const actual=progress.actual;
    const card=document.createElement('article');card.className='ev-card';card.dataset.member=member.id;
    const title=document.createElement('h3');title.textContent=member.name;card.append(title,paragraph('Target: '+member.evs.map(([stat,n])=>`${stat} ${n}`).join(' · ')),tracking(member,'ev'));
    const observed=actual || progress.lastKnown;
    if(observed)card.append(paragraph((actual?'Current: ':'Last known (not found or ambiguous): ')+Object.entries(EV_KEYS).map(([stat,key])=>`${stat} ${observed.evs[key]}`).join(' · ')+` · Total ${Object.values(observed.evs).reduce((n,v)=>n+v,0)} / 510`,actual?'ev-current':'ev-last-known'));
    const grid=document.createElement('div');grid.className='ev-checks';
    for(const [stat,target] of member.evs) {
      const current=actual?.evs[EV_KEYS[stat]];
      const text=actual ? `${stat} — ${current} / ${target} EVs · ${Math.max(0,target-current)} remaining${current>target?' · '+(current-target)+' over target':''}` : progress.linked ? `${stat} — ${target} EVs target; current value unavailable` : `${stat} — ${target} EVs target reached (manual)`;
      grid.append(checked(member.id+':'+stat,text,'evDone',progress.linked ? actual ? current>=target : false : null));
    }
    card.append(grid);list.append(card);
  }
}
function renderBench() {
  const grid=$('#bench-list');grid.replaceChildren();
  for(const candidate of plan.goals.bench) {
    const card=document.createElement('article');card.className='bench-card';const title=document.createElement('h3');title.textContent=candidate.name;
    card.append(title,paragraph(candidate.role),paragraph(candidate.note),checked(candidate.id,'Keep as a candidate to revisit','benchNotes'));grid.append(card);
  }
}
function updateSummary() {
  let moves=0,totalMoves=0,evs=0,totalEvs=0;
  const ready=plan.goals.team.filter(p=>plan.state.ready[p.id]).length;
  for(const member of plan.goals.team) {
    const progress=memberProgress(plan,member,profile);
    totalMoves+=member.moves.length;totalEvs+=member.evs.length;
    moves+=member.moves.filter((_,i)=>progress.linked ? progress.moves[i] : plan.state.moves[member.id+':'+i]).length;
    evs+=member.evs.filter(([stat,target])=>progress.linked ? progress.actual && progress.actual.evs[EV_KEYS[stat]]>=target : plan.state.evDone[member.id+':'+stat]).length;
  }
  $('#party-count').textContent=`${ready} / 6 ready`;$('#party-meter').style.width=(ready/6*100)+'%';
  $('#move-count').textContent=`${moves} / ${totalMoves} complete`;$('#move-meter').style.width=(moves/totalMoves*100)+'%';
  $('#ev-count').textContent=`${evs} / ${totalEvs} targets`;$('#ev-meter').style.width=(evs/totalEvs*100)+'%';
}
function renderControls() {
  const adventure=$('#planner-adventure');adventure.replaceChildren(new Option('Reference / no adventure',''));
  profiles.forEach(p=>adventure.add(new Option(`${p.snapshot.trainer.name} · SoulSilver · ${p.snapshot.trainer.trainerId} · ${p.id.slice(0,8)}`,p.id)));
  adventure.value=profile?.id || '';adventure.disabled=!persistent;
  const select=$('#planner-select');select.replaceChildren(new Option('Choose a planner',''));
  plans.filter(p=>p.adventureId===null || p.adventureId===profile?.id).forEach(p=>select.add(new Option(p.name+(p.adventureId?'':' · reference plan'),p.id)));
  select.value=plan?.id || '';
  $('#associate-plan').hidden=!plan || !profile || plan.adventureId!==null;
  $('#associate-plan').textContent='Use this plan for '+(profile?.snapshot.trainer.name || 'this adventure');
  $('#planner-empty').hidden=Boolean(plan);
  for(const id of ['export-btn','rename-plan','reset-btn'])$("#"+id).disabled=!plan;
  $('#planner-context').textContent=profile ? `Adventure: ${profile.snapshot.trainer.name} · Latest save: ${new Date(profile.snapshot.loadedAt).toLocaleString()}${plan && plan.adventureId!==profile.id?' · This plan is not associated yet.':''}` : 'Reference mode. Plans work without a save; manual checklists remain available.';
  $('#ev-save-status').textContent=profile && plan?.adventureId===profile.id ? `Using ${profile.snapshot.fileName} from ${new Date(profile.snapshot.loadedAt).toLocaleString()}. All Planner tabs use this adventure; no second upload is needed.` : 'No adventure associated with this plan. Manual progress is available.';
}
function render() {
  renderControls();
  for(const panel of document.querySelectorAll('.panel'))panel.classList.toggle('no-plan',!plan);
  if(!plan){
    for(const id of ['team-grid','hm-list','ev-list','bench-list'])$('#'+id).replaceChildren();
    for(const section of ['party','move','ev']){$('#'+section+'-count').textContent='Choose a planner';$('#'+section+'-meter').style.width='0%';}
    return;
  }
  renderTeam();renderHms();renderEvs();renderBench();updateSummary();
}
$('#planner-adventure').addEventListener('change',event=>{const id=event.target.value;run(async()=>{if(id)await selectProfile(id);else await clearActiveProfile();await refreshContext();});});
$('#planner-select').addEventListener('change',event=>{const id=event.target.value;if(id)run(async()=>{if(persistent){await choosePlanner(id,profile?.id || null);await refreshContext(id);}else{plan=plans.find(p=>p.id===id);render();}});});
$('#associate-plan').addEventListener('click',()=>mutate(next=>{if(next.adventureId!==null)throw new Error('This plan is already associated.');next.adventureId=profile.id;}));
for(const button of document.querySelectorAll('.tab'))button.addEventListener('click',()=>{
  document.querySelectorAll('.tab').forEach(tab=>tab.classList.toggle('active',tab===button));
  document.querySelectorAll('.panel').forEach(panel=>{panel.hidden=panel.id!=='panel-'+button.dataset.tab;panel.classList.toggle('active',!panel.hidden);});
  history.replaceState(null,'','#'+button.dataset.tab);
});
function planDialog(mode) {
  $('#plan-dialog').dataset.mode=mode;$('#plan-dialog').dataset.planner=plan?.id || '';$('#plan-dialog-title').textContent=mode==='rename'?'Rename planner':'Create planner';
  $('#plan-name').value=mode==='rename'?plan.name:'';$('#plan-dialog').showModal();$('#plan-name').focus();
}
$('#new-plan').addEventListener('click',()=>planDialog('new'));
$('#rename-plan').addEventListener('click',()=>planDialog('rename'));
$('#plan-form').addEventListener('submit',event=>{
  if(event.submitter?.value==='cancel')return;
  event.preventDefault();const name=$('#plan-name').value.trim();if(!name)return;
  if($('#plan-dialog').dataset.mode==='rename' && $('#plan-dialog').dataset.planner!==plan?.id){message('Planner selection changed. Close this dialog and select the planner you want to rename.');return;}
  const mode=$('#plan-dialog').dataset.mode;$('#plan-dialog').close();
  if(mode==='rename')mutate(next=>{next.name=name;});
  else run(async()=>{const created=newPlanner(name,profile?.id || null,plan?.goals || defaultGoals());await commit(reconcilePlanner(created,profile));});
});
$('#export-btn').addEventListener('click',()=>{
  const blob=new Blob([JSON.stringify({app:'Pokemon Reader Team Planner',version:2,exportedAt:new Date().toISOString(),planner:plan},null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download='soulsilver-team-planner-backup.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);message('Backup exported');
});
$('#import-file').addEventListener('change',event=>{
  const file=event.target.files?.[0];event.target.value='';if(!file)return;
  run(async()=>{const imported=importPlannerBackup(JSON.parse(await file.text()),null);await commit(imported);message('Backup imported as a separate reference plan. Existing plans are preserved; associate it explicitly to track an adventure.');});
});
$('#reset-btn').addEventListener('click',()=>$('#confirm-dialog').showModal());
$('#confirm-reset').addEventListener('click',()=>mutate(next=>{next.state=defaultProgress();}));
function scheduleRefresh() {
  if(!persistent)return;
  clearTimeout(refreshTimer);refreshTimer=setTimeout(()=>{if(persistent)run(()=>refreshContext());},50);
}
window.addEventListener('pageshow',scheduleRefresh);
window.addEventListener('focus',scheduleRefresh);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')scheduleRefresh();});
subscribeAdventureChanges(scheduleRefresh);
run(async()=>{
  try{await initializePlanners();await refreshContext();}
  catch(error){
    persistent=false;profile=null;profiles=[];
    let state=defaultProgress();try{const raw=localStorage.getItem('pokemon-reader-soulsilver-team-planner-v1');if(raw)state=normalizeProgress(JSON.parse(raw));}catch{}
    plan=newPlanner('SoulSilver / Mando (session only)',null,defaultGoals(),state);plans=[plan];render();message(`Planner storage unavailable: ${error.message} Original data is preserved; export session changes as a backup.`);
  }
  const tab=document.querySelector(`.tab[data-tab="${['team','hms','evs','bench'].includes(location.hash.slice(1))?location.hash.slice(1):'team'}"]`);tab.click();
});
