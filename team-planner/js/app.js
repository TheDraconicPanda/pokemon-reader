import { SOULSILVER_POKEDEX } from '../../js/data/games/soulsilver/pokedex-reference.js';
import { hgssSprite, typeBadges } from '../../js/species-presentation.js';
import { EV_KEYS } from '../../js/planner-save.js';
import { listProfiles, getActiveProfile, selectProfile, clearActiveProfile, subscribeAdventureChanges } from '../../js/adventures.js';
import { initializePlanners, listPlanners, storePlanner, choosePlanner, preferredPlanner } from '../../js/planner-store.js';
import { defaultProgress, defaultGoals, newPlanner, normalizeProgress, memberProgress, reconcilePlanner, savedPokemon, linkPokemon, importPlannerBackup, speciesName, natureName, moveName } from '../../js/planner-model.js';

let detailMember=null, detailPlan=null;
const trackingOpen=new Set();
const $ = selector => document.querySelector(selector);
let plan=null, profile=null, plans=[], profiles=[], persistent=true, queue=Promise.resolve(), revision=0, refreshTimer;

function message(text) { $('#save-status').textContent=text; }
function run(action) {
  queue=queue.then(async()=>{
    $('.app').setAttribute('aria-busy','true');
    try { await action(); }
    catch(error) { if(plan)render();message(error.message+' Export a backup before refreshing if you have unsaved changes.'); }
    finally { $('.app').setAttribute('aria-busy','false'); }
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
  else message(profile && plan.adventureId!==profile.id ? `Save loaded — open Settings to associate this planner with ${profile.snapshot.trainer.name}.` : 'Saved in this browser');
}
function displayProgress(member) {
  const progress=memberProgress(plan,member,profile);
  return {...progress,linked:progress.linked && progress.candidates.length>0};
}
function checked(key,text,group,actual=null,prefix='') {
  const label=document.createElement('label');label.className='checkline';
  const input=document.createElement('input');input.type='checkbox';input.id=prefix+key;
  input.checked=actual===null ? Boolean(plan.state[group]?.[key]) : actual;
  input.disabled=actual!==null;
  input.addEventListener('change',()=>{const value=input.checked;mutate(next=>{
    next.state[group] ||= {};
    if(group==='natures' && value)for(const id of Object.keys(next.state.natures))if(id.startsWith(key.split(':')[0]+':'))next.state.natures[id]=false;
    next.state[group][key]=value;
  });});
  label.htmlFor=input.id;label.append(input,document.createTextNode(text));return label;
}
function paragraph(text,className='small muted') {const p=document.createElement('p');p.className=className;p.textContent=text;return p;}
function tracking(member,context='team') {
  const progress=displayProgress(member);
  const box=document.createElement('details');box.className='pokemon-tracking';box.dataset.linkStatus=progress.status;
  const key=context+'-'+member.id;box.dataset.tracking=key;box.open=trackingOpen.has(key);
  const summary=document.createElement('summary');summary.id=context+'-tracking-'+member.id;summary.textContent='Choose saved Pokémon';box.append(summary);
  if(!profile || plan.adventureId!==profile.id) {
    box.append(paragraph('Manual progress. Associate this plan with an adventure to track saved Pokémon.'));
    return box;
  }
  const label=document.createElement('label');label.textContent='Saved Pokémon: ';
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
  if(!progress.candidates.length) {
    select.replaceChildren(new Option('No eligible Pokémon found','manual'));select.disabled=true;
  }
  select.value=progress.actual?.token || (plan.links[member.id]?.manual || !progress.candidates.length ? 'manual' : '');
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
  } else if(plan.links[member.id]?.identity) {
    box.append(paragraph(progress.status==='ambiguous' ? 'Multiple Pokémon share this identity. Choose the intended Pokémon for this snapshot.' : 'Not found in latest save. Association preserved.','link-status'));
    if(progress.lastKnown)box.append(paragraph(`Last known: ${progress.lastKnown.nickname || speciesName(progress.lastKnown.speciesId)} · ${speciesName(progress.lastKnown.speciesId)} · ${progress.lastKnown.location} · ${natureName(progress.lastKnown.natureId)} · ${plan.links[member.id].lastSeenAt}`));
  } else {
    box.append(paragraph(progress.candidates.length ? 'Choose a saved Pokémon. PC candidates are never assigned automatically.' : 'No eligible Pokémon found. Manual progress is enabled.'));
  }
  if(!progress.candidates.length && plan.links[member.id]?.identity)box.append(paragraph('No eligible Pokémon found. Manual progress is enabled; the saved association is preserved.'));
  return box;
}
function cardIdentity(member) {
  const actual=displayProgress(member).actual;
  const species=SOULSILVER_POKEDEX.species[actual?.speciesId || member.speciesId];
  const identity=document.createElement('div');identity.className='card-identity';
  const image=document.createElement('img');image.src=hgssSprite(species.id);image.alt=species.name;image.width=96;image.height=96;
  if(!actual)image.className='unowned-sprite';
  const speciesRow=document.createElement('div');speciesRow.className='card-species-row';
  const goal=document.createElement('h3');goal.className='card-species';goal.textContent=member.name;speciesRow.append(goal,typeBadges(species.types));
  identity.append(image,speciesRow,paragraph(actual ? actual.nickname || species.name : 'Planned','card-name'),paragraph(actual ? actual.level ? 'Level '+actual.level : 'Level unavailable' : 'No linked Pokémon','species'));
  return identity;
}
function natureOptions(member) {
  const current=displayProgress(member).actual?.natureId;
  return Number.isInteger(current) && current>=0 && current<25 && !member.natureIds.includes(current) ? [...member.natureIds,current] : member.natureIds;
}
function mainTeamNote(member) {
  const names=plan.goals.hms.map(hm=>hm.move.toLowerCase());
  return member.note.split(/(?<=[.!?])\s+/).filter(sentence=>!(/\bhms?\b/i.test(sentence) || names.some(name=>sentence.toLowerCase().includes(name)))).join(' ');
}
function natureInfo(member) {
  const wrap=document.createElement('div');wrap.className='nature-heading';
  const heading=document.createElement('h4');heading.textContent='Nature';
  const info=document.createElement('div');info.className='nature-info';
  const button=document.createElement('button');button.type='button';button.className='info-button';button.id='nature-info-toggle-'+member.id;button.textContent='ⓘ';button.setAttribute('aria-label','Nature descriptions');button.setAttribute('aria-expanded','false');
  const overlay=document.createElement('div');overlay.className='nature-overlay';overlay.id='nature-info-'+member.id;button.setAttribute('aria-controls',overlay.id);button.setAttribute('aria-describedby',overlay.id);overlay.setAttribute('role','tooltip');
  const stats=['Attack','Defense','Speed','Special Attack','Special Defense'];
  for(const id of natureOptions(member)) {
    const up=Math.floor(id/5),down=id%5;
    overlay.append(paragraph(natureName(id)+': '+(up===down?'Neutral — no stat changes':'+10% '+stats[up]+' · −10% '+stats[down])));
  }
  button.addEventListener('click',()=>{const open=info.classList.toggle('pinned');button.setAttribute('aria-expanded',String(open));});
  info.append(button,overlay);wrap.append(heading,info);return wrap;
}
function rememberTracking() {
  for(const box of document.querySelectorAll('.pokemon-tracking')) {
    if(box.open)trackingOpen.add(box.dataset.tracking);else trackingOpen.delete(box.dataset.tracking);
  }
}
function openMember(member) {
  detailMember=member.id;detailPlan=plan.id;
  renderTeam();$('#member-dialog').showModal();$('#member-close').focus();$('#member-dialog').scrollTop=0;
}
function renderTeam() {
  rememberTracking();
  const grid=$('#team-grid');grid.replaceChildren();
  const dialog=$('#member-dialog'), content=$('#member-content');
  const scroll=dialog.scrollTop;content.replaceChildren();
  if(detailPlan!==plan.id || !plan.goals.team.some(m=>m.id===detailMember)) {
    detailMember=null;detailPlan=null;if(dialog.open)dialog.close();
  }
  for(const member of plan.goals.team) {
    const progress=displayProgress(member);
    const card=document.createElement('article');card.className='team-card';card.dataset.member=member.id;
    const button=document.createElement('button');button.type='button';button.id='member-'+member.id;button.className='member-button';button.setAttribute('aria-label',member.name+'. Open Pokémon details');button.setAttribute('aria-haspopup','dialog');
    button.append(cardIdentity(member));button.addEventListener('click',()=>openMember(member));card.append(button);
    const body=document.createElement('div');body.className='member-details';body.dataset.member=member.id;body.hidden=member.id!==detailMember;
    const mainTitle=document.createElement('h3');mainTitle.textContent='Main team';body.append(mainTitle,paragraph('Started as '+member.origin,'species'),paragraph(member.role,'role'),tracking(member));
    const ability=progress.actual ? SOULSILVER_POKEDEX.abilities[progress.actual.abilityId]?.name : null;
    body.append(checked(member.id,'Planned ability: '+member.ability,'abilities',progress.linked ? Boolean(ability && member.ability.toLowerCase().split(' / ').includes(ability.toLowerCase())) : null,'ability-'));
    body.append(natureInfo(member));
    natureOptions(member).forEach((id,i)=>{
      const preferred=member.natureIds.includes(id);
      const row=checked(member.id+':'+id,preferred ? `${i+1}. ${natureName(id)}` : natureName(id),'natures',progress.linked ? Boolean(progress.actual?.natureId===id) : null,'nature-');
      if(!preferred) {const comment=document.createElement('em');comment.textContent='— Current nature; not on the preferred list';row.append(comment);row.classList.add('current-nature');}
      body.append(row);
    });
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
    body.append(moves);
    const note=mainTeamNote(member);if(note)body.append(paragraph(note));
    body.append(checked(member.id,'Mark '+member.name+' ready for the final team (manual)','ready'));
    const hmTitle=document.createElement('h3');hmTitle.textContent='HM plan';
    const hmList=document.createElement('div');hmList.className='stack';renderHms(hmList,member.id,'detail-');
    if(!hmList.childElementCount)hmList.append(paragraph('No HM assigned.'));
    const evTitle=document.createElement('h3');evTitle.textContent='EV training';
    const evList=document.createElement('div');renderEvs(evList,member.id,'detail-');
    body.append(hmTitle,hmList,evTitle,evList);
    if(member.id===detailMember) {
      $('#member-title').textContent=member.name;
      const identity=cardIdentity(member);identity.querySelector('.card-species').remove();identity.querySelector('.card-name').textContent=progress.actual?.nickname || speciesName(progress.actual?.speciesId || member.speciesId);
      content.append(identity,body);
    } else card.append(body);
    grid.append(card);
  }
  dialog.scrollTop=scroll;
}
function renderHms(list=$('#hm-list'),memberId=null,prefix='') {
  list.replaceChildren();
  plan.goals.hms.forEach((hm,i)=>{
    if(memberId && hm.ownerId!==memberId)return;
    const member=plan.goals.team.find(p=>p.id===hm.ownerId);
    const progress=member && displayProgress(member);
    const learned=progress?.actual?.moves.some(move=>move.id===hm.moveId) || false;
    const row=document.createElement('article');row.className='hm-row';row.dataset.hm=hm.move;
    const name=document.createElement('div');const title=document.createElement('h3');title.textContent=hm.move;name.append(title,paragraph(hm.status));
    const details=document.createElement('div');if(!memberId)details.append(paragraph(hm.owner,'hm-owner'));details.append(paragraph(hm.why));
    if(progress?.actual?.recordKind==='storage')details.append(paragraph('In PC · outside the travelling party','hm-actual'));
    else if(progress?.linked && !progress.actual)details.append(paragraph('Linked Pokémon not found or ambiguous in latest save.','hm-actual'));
    const check=checked('hm:'+i,'','hmDone',progress?.linked ? learned : null,prefix);
    check.querySelector('input').setAttribute('aria-label',hm.move+' learned'+(progress?.linked?'':' (manual)'));
    row.append(name,details,check);list.append(row);
  });
}
function renderEvs(list=$('#ev-list'),memberId=null,prefix='') {
  list.replaceChildren();
  for(const member of plan.goals.team) {
    if(memberId && member.id!==memberId)continue;
    const progress=displayProgress(member);
    const actual=progress.actual;
    const card=document.createElement('article');card.className='ev-card';card.dataset.member=member.id;
    const title=document.createElement('h3');title.textContent=member.name;card.append(title);
    const total=actual ? Object.values(actual.evs).reduce((n,v)=>n+v,0) : null;
    card.append(paragraph(total===null?'Total: unavailable / 510 EVs':`Total: ${total} / 510 EVs`,'small muted ev-total'),...(memberId ? [] : [tracking(member,'ev')]));
    if(!actual && progress.lastKnown)card.append(paragraph('Last known total (not current): '+Object.values(progress.lastKnown.evs).reduce((n,v)=>n+v,0)+' / 510 EVs','small ev-last-known'));
    const grid=document.createElement('div');grid.className='ev-checks';
    for(const [stat,target] of member.evs) {
      const current=actual?.evs[EV_KEYS[stat]];
      const text=actual ? `${stat} — ${current} / ${target} EVs · ${Math.max(0,target-current)} remaining${current>target?' · '+(current-target)+' over target':''}` : progress.linked ? `${stat} — ${target} EVs target; current value unavailable` : `${stat} — ${target} EVs target reached (manual)`;
      grid.append(checked(member.id+':'+stat,text,'evDone',progress.linked ? actual ? current>=target : false : null,prefix));
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
    const progress=displayProgress(member);
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
  // Capture focus at the DOM update, so an asynchronous refresh cannot steal
  // focus from a user who has already moved to another control.
  const focused=document.activeElement?.id;
  rememberTracking();
  renderControls();
  for(const panel of document.querySelectorAll('.panel'))panel.classList.toggle('no-plan',!plan);
  if(!plan){
    detailMember=null;detailPlan=null;$('#member-dialog').close();$('#member-content').replaceChildren();
    for(const id of ['team-grid','hm-list','ev-list','bench-list'])$('#'+id).replaceChildren();
    for(const section of ['party','move','ev']){$('#'+section+'-count').textContent='Choose a planner';$('#'+section+'-meter').style.width='0%';}
    return;
  }
  renderTeam();renderHms();renderEvs();renderBench();updateSummary();
  if(focused)document.getElementById(focused)?.focus();
}
$('#member-close').addEventListener('click',()=>$('#member-dialog').close());
$('#member-dialog').addEventListener('keydown',event=>{
  if(event.key!=='Tab')return;
  const controls=[...event.currentTarget.querySelectorAll('button:not(:disabled), select:not(:disabled), input:not(:disabled), summary')].filter(node=>node.getClientRects().length);
  const first=controls[0],last=controls.at(-1);
  if(event.shiftKey && document.activeElement===first){event.preventDefault();last?.focus();}
  else if(!event.shiftKey && document.activeElement===last){event.preventDefault();first?.focus();}
});
$('#member-dialog').addEventListener('close',()=>{
  // A queued close event can arrive after another member has already opened.
  if($('#member-dialog').open)return;
  const id=detailMember;detailMember=null;detailPlan=null;
  if(plan)renderTeam();
  if(id)document.getElementById('member-'+id)?.focus();
});
$('#planner-adventure').addEventListener('change',event=>{const id=event.target.value;run(async()=>{if(id)await selectProfile(id);else await clearActiveProfile();await refreshContext();});});
$('#planner-select').addEventListener('change',event=>{const id=event.target.value;if(id)run(async()=>{if(persistent){await choosePlanner(id,profile?.id || null);await refreshContext(id);}else{plan=plans.find(p=>p.id===id);render();}});});
$('#associate-plan').addEventListener('click',()=>mutate(next=>{if(next.adventureId!==null)throw new Error('This plan is already associated.');next.adventureId=profile.id;}));
const tabs=[...document.querySelectorAll('.tab')];
function showPlannerTab(name) {
  const selected=tabs.find(tab=>tab.dataset.tab===name)||tabs[0];
  for(const tab of tabs) {
    const active=tab===selected;
    tab.classList.toggle('active',active);tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;
  }
  for(const panel of document.querySelectorAll('.panel')) {
    panel.hidden=panel.id!=='panel-'+selected.dataset.tab;panel.classList.toggle('active',!panel.hidden);
  }
}
function routePlannerTab(){showPlannerTab(location.hash.slice(1));}
for(const button of tabs) {
  button.addEventListener('click',()=>{
    showPlannerTab(button.dataset.tab);
    // Preserve the existing policy: selecting a tab replaces this history entry.
    history.replaceState(null,'','#'+button.dataset.tab);
  });
  button.addEventListener('keydown',event=>{
    if(event.altKey||event.ctrlKey||event.metaKey)return;
    const index=tabs.indexOf(button);
    const target={ArrowRight:(index+1)%tabs.length,ArrowLeft:(index+tabs.length-1)%tabs.length,Home:0,End:tabs.length-1}[event.key];
    if(target===undefined)return;
    event.preventDefault();tabs[target].focus();tabs[target].click();
  });
}
window.addEventListener('hashchange',routePlannerTab);
window.addEventListener('popstate',routePlannerTab);
routePlannerTab();
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
  const tab=document.querySelector(`.tab[data-tab="${['team','bench'].includes(location.hash.slice(1))?location.hash.slice(1):'team'}"]`);tab.click();
});
