import { pokedexReference, referenceSpecies, speciesForms, evolutionFamily, evolutionRequirement, typeMultipliers, statRange, heldItems, speciesLocations, moveName, STAT_LABELS } from './data/pokedex-reference.js';
import { hgssSprite, typeBadges, speciesHeading } from './species-presentation.js';
import { getActiveProfile } from './adventures.js';
const gameSelect=document.querySelector('#reference-game'), scopeSelect=document.querySelector('#reference-scope');
const list=document.querySelector('#species-list'), status=document.querySelector('#reference-status');
const dialog=document.querySelector('#reference-detail'), content=document.querySelector('#reference-content');
const search=document.querySelector('#species-search'), next=document.querySelector('#next-match');
let savedDex=null, owned=new Map(), activeProfile=null;
const gameName=()=>gameId==='platinum'?'Platinum':'SoulSilver';
const regionName=()=>gameId==='platinum'?'Sinnoh':'Johto';
const gameParam=()=>gameId==='platinum'?'&game=platinum':'';
const saveFilter=document.querySelector('#save-filter');
const requestedFilter=new URLSearchParams(location.hash.slice(1)).get('filter');
if([...saveFilter.options].some(o=>o.value===requestedFilter))saveFilter.value=requestedFilter;
function saveFlags(id) { return {seen:new Set(savedDex?.allSeenSpecies || savedDex?.seenSpecies || []).has(id),caught:new Set(savedDex?.allCaughtSpecies || savedDex?.caughtSpecies || []).has(id),owned:owned.has(id)}; }
let gameId='soulsilver',scope='regional', opener=null,listY=0,currentKey=null,matchIds=[],matchIndex=0;
const node=(tag,text,className)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(className)n.className=className;return n;};
const note=(parent,text)=>parent.append(node('p',text,'reference-note'));
const data=()=>pokedexReference(gameId);
const species=id=>referenceSpecies(gameId,id);
function section(title,open=true) {
  const s=node('details',undefined,'pokemon-detail-section');s.open=open;s.append(node('summary',title));content.append(s);return s;
}
function table(parent,headers,rows,caption) {
  const wrap=node('div',undefined,'reference-scroll');wrap.tabIndex=0;wrap.setAttribute('role','region');wrap.setAttribute('aria-label',caption);
  const t=node('table',undefined,'reference-table');t.append(node('caption',caption));
  const head=node('thead'),tr=node('tr');for(const value of headers){const th=node('th');th.scope='col';value instanceof Node?th.append(value):th.textContent=value;tr.append(th);}head.append(tr);t.append(head);
  const body=node('tbody');for(const row of rows){const tr=node('tr');row.forEach((value,i)=>{const td=node(i===0?'th':'td');if(i===0)td.scope='row';value instanceof Node?td.append(value):td.textContent=String(value);tr.append(td);});body.append(tr);}t.append(body);wrap.append(t);parent.append(wrap);return t;
}
function speciesButton(id,label) { const b=node('button',label||species(id).name);b.type='button';b.addEventListener('click',()=>openSpecies(id));return b; }
function saveStatus(flags, count) {
  const row=node('small',undefined,'save-status');
  for(const [label,active,icon] of [
    ['Seen',flags.seen,flags.seen?'eye-open':'eye-closed'],
    ['Caught',flags.caught,'caught-gen4']
  ]) {
    const marker=node('span',undefined,`save-status-icon${active?'':' is-unregistered'}`);
    marker.setAttribute('role','img');marker.setAttribute('aria-label',`${label}: ${active?'Yes':'No'}`);
    marker.title=`${label}: ${active?'Yes':'No'}`;
    const img=node('img');img.src=`../assets/icons/${icon}.svg`;img.alt='';img.width=20;img.height=20;
    marker.append(img);row.append(marker);
  }
  row.append(node('span',`Owned: ${count}`));return row;
}
function renderList() {
  list.replaceChildren();const ids=scope==='regional'?data().regional:Array.from({length:493},(_,i)=>i+1);
  ids.forEach((id,index)=>{
    const flags=saveFlags(id),filter=saveFilter.value;
    if(savedDex && !(filter==='all'||flags[filter]||filter==='missing'&&!flags.caught||filter==='unseen'&&!flags.seen))return;
    const p=species(id),li=node('li');li.id=`species-${id}`;li.value=index+1;
    const b=node('button',undefined,'species-row');b.type='button';b.dataset.speciesId=id;b.setAttribute('aria-label',`${String(index+1).padStart(3,'0')} ${p.name}, ${p.types.join(' and ')}`);
    const number=node('span',String(index+1).padStart(3,'0'),'dex-number');
    const img=node('img');img.src=hgssSprite(id);img.width=56;img.height=56;img.alt='';img.loading='lazy';
    b.append(number,img,node('strong',p.name),typeBadges(p.types));if(savedDex)b.append(saveStatus(flags,owned.get(id)||0));b.addEventListener('click',()=>openSpecies(id));li.append(b);list.append(li);
  });
  if(!list.children.length)list.append(node('li','No species match this save filter.'));
  scopeSelect.value=scope;document.body.dataset.referenceReady='true';
}
function renderDetail(key,referenceType=null) {
  const original=species(key);if(!original)return;
  const p=referenceType?{...original,types:[referenceType]}:original;
  currentKey=key;content.replaceChildren();document.querySelector('#reference-title').textContent=p.name;
  content.append(speciesHeading(p));
  if(gameId==='platinum') {
    const regional=data().regional.indexOf(p.id);
    note(content,regional>=0?`Sinnoh #${String(regional+1).padStart(3,'0')} · National #${String(p.id).padStart(3,'0')}`:`National #${String(p.id).padStart(3,'0')} · outside Platinum’s regional Pokédex`);
    if(p.id===479)note(content,'Appliance forms require the historical Secret Key distribution to enter Rotom’s Room. Platinum has no currently running official distribution. Appliance forms revert for certain communication/battle facilities.');
    if(p.id===487)note(content,'Origin Forme is used in the Distortion World or while holding the Griseous Orb outside it.');
    if(p.id===492)note(content,'Sky Forme requires a Gracidea-eligible Shaymin and the Gracidea in daytime; frozen or night conditions revert it. Shaymin requires a historical distribution or transfer.');
  }
  if(p.id===351||p.id===493) {
    const label=node('label',p.id===493?'Plate type ':'Forecast/weather type '),select=node('select'); select.id='reference-type';
    for(const type of p.id===493?Object.keys(data().typeChart):['normal','fire','water','ice']){const opt=node('option',type[0].toUpperCase()+type.slice(1));opt.value=type;select.append(opt);}
    select.value=p.types[0];select.addEventListener('change',()=>{renderDetail(key,select.value);document.querySelector('#reference-type').focus({preventScroll:true});});label.append(select);content.append(label);
  }
  const forms=speciesForms(gameId,p.id);
  if(forms.length>1){const label=node('label','Form '),select=node('select');select.id='reference-form';for(const f of forms){const opt=node('option',f.record.form);opt.value=f.key;select.append(opt);}select.value=key;select.addEventListener('change',()=>openSpecies(Number(select.value),true));label.append(select);content.append(label);}
  if([201,351,412,421,422,423,493].includes(p.id))note(content,p.id===493?'Without a Plate, Arceus is Normal. Select the Plate’s type to inspect matchups; Draco Meteor requires the Draco Plate.':p.id===351?'Forecast changes Castform to Fire in sun, Water in rain or Ice in hail. Choose the weather type above; stats remain the same.':'Standard appearance is shown; cosmetic/cloak forms share these base stats and types.');
  if(p.id===479&&key!==479)note(content,'In Generation IV, all Rotom appliance forms remain Electric/Ghost. Changing appliances teaches Overheat, Hydro Pump, Blizzard, Air Slash or Leaf Storm respectively; these form-change moves are separate from the level-up list.');
  const ability=section('Abilities');for(const id of p.abilities){ability.append(node('h3',data().abilities[id].name),node('p',data().abilities[id].description));}note(ability,`Available ${gameName()} abilities; no hidden abilities in Generation IV.`);
  const ev=section('EV yield');ev.append(node('p',p.evYield.map((v,i)=>v?`${v} ${STAT_LABELS[i]}`:null).filter(Boolean).join(' · ')||'None'));note(ev,'Base yield per defeated Pokémon, before held items or Pokérus.');
  const types=section('Type matchups');const grid=node('div',undefined,'type-grid');for(const {type,multiplier} of typeMultipliers(gameId,p.types)){const row=node('div',undefined,multiplier>=4?'matchup-severe':multiplier>1?'matchup-weak':multiplier<1?'matchup-reduced':'matchup-neutral');row.dataset.type=type;row.dataset.multiplier=multiplier;row.append(typeBadges([type]),node('strong',`×${multiplier}`));grid.append(row);}types.append(grid);note(types,'Incoming damage by type, before abilities, items and battle effects. Generation IV: Steel resists Ghost and Dark; no Fairy type.');
  const items=section('Wild held items');const itemResults=node('p');const label=node('label'),check=node('input');check.type='checkbox';check.id='compound-eyes';label.append(check,document.createTextNode(' Lead Pokémon has Compound Eyes'));const update=()=>itemResults.textContent=heldItems(p,check.checked).map(r=>`${r.name}: ${r.percent}%`).join(' · ');check.addEventListener('change',update);update();items.append(itemResults,label);note(items,`Normal wild item rolls. These odds do not establish that this species is catchable in ${gameName()}; gifts, trades and scripted encounters may use fixed items.`);
  const family=evolutionFamily(gameId,p.id),evolutions=data().evolutions.filter(e=>family.includes(e.from));
  const evo=section('Evolution family');
  if(!evolutions.length) { evo.append(speciesButton(p.id),node('p','No evolution in Generation IV.')); }
  else {
    const scroll=node('div',undefined,'evolution-scroll');scroll.tabIndex=0;scroll.setAttribute('role','region');scroll.setAttribute('aria-label','Evolution paths');
    const paths=[];
    const walk=(id,path)=>{const children=evolutions.filter(e=>e.from===id);if(!children.length)paths.push(path);else for(const edge of children)walk(edge.to,[...path,edge]);};
    for(const root of family.filter(id=>!evolutions.some(e=>e.to===id)))walk(root,[]);
    const stage=id=>{const b=speciesButton(id);b.className='evolution-stage';b.replaceChildren();const img=node('img');img.src=hgssSprite(id);img.alt='';img.width=48;img.height=48;b.append(img,node('span',species(id).name,'evolution-stage-name'));return b;};
    for(const path of paths) {
      const line=node('div',undefined,'evolution-chain');line.append(stage(path[0].from));
      for(const edge of path){const link=node('div',undefined,'evolution-link');const arrow=node('span','→','evolution-arrow');arrow.setAttribute('aria-hidden','true');link.append(node('span',evolutionRequirement(edge,gameId),'evolution-requirement'),arrow);line.append(link,stage(edge.to));}
      scroll.append(line);
    }
    evo.append(scroll);
  }
  if(p.id===489||p.id===490)note(evo,'Phione and Manaphy do not evolve into one another. Breeding Manaphy or Phione with Ditto produces Phione.');
  const locations=section(`${gameName()} locations`);locations.classList.add('reference-locations');note(locations,gameId==='platinum'?'Platinum-specific encounter locations; conditions and availability remain explicit.': 'Current Atlas coverage: Johto and existing League/Mt. Silver approaches. Full Kanto, Pokéwalker and event/distribution coverage are not included. Safari records retain their pending-audit label.');
  if(gameId==='platinum') {
    const direct=speciesLocations(gameId,p.id),familyWild=family.some(id=>id!==p.id&&speciesLocations(gameId,id).length);
    note(locations,direct.length?'Direct conditional random encounters are recorded below.':'No direct random encounter is recorded. '+(familyWild?'An evolution-family member has native encounters; check the evolution conditions above.':'Check gifts, scripted encounters, historical distributions and transfer; native special encounters retain their prerequisites below.'));
  }
  const records=speciesLocations(gameId,p.id);if(!records.length)locations.append(node('p',`No direct encounter recorded in the current Atlas coverage. Check the evolution family, transfer requirements and external sources below; this does not establish unavailability in ${gameName()}.`));
  for(const group of records){const d=node('details');d.append(node('summary',group.location));const link=node('a',`Open ${group.location} in Atlas`);link.href=`../pokedex-earth/#location=${encodeURIComponent(group.location)}${gameParam()}`;d.append(link);const ul=node('ul');for(const text of group.details)ul.append(node('li',text));d.append(ul);for(const n of group.notes)note(d,n);locations.append(d);}
  const learn=section('Level-up moves',false);table(learn,['Level','Move'],p.levelMoves.map(([level,id])=>[level,moveName(gameId,id)]),`${gameName()} level-up learnset`);
  if(!p.levelMoves.length)learn.append(node('p','No level-up moves.'));
  const machines=section('TM/HM compatibility across evolutions',false);
  const stages=family.map(id=>({key:id,record:species(id)}));
  // Forms with different compatibility remain explicit columns (e.g. Wormadam).
  for(const id of family)for(const f of speciesForms(gameId,id).slice(1))if(JSON.stringify(f.record.machines)!==JSON.stringify(species(id).machines))stages.push(f);
  const columns=stages.map(({record:r})=>{const h=node('div');const img=node('img');img.src=hgssSprite(r.sprite);img.alt='';img.width=48;img.height=48;h.append(img,document.createTextNode(r.name+(r.form==='Standard'?'':` (${r.form})`)));return h;});
  const machineIds=Object.keys(data().machines).filter(m=>stages.some(s=>s.record.machines.includes(m)));
  const mt=table(machines,['Machine / move',...columns],machineIds.map(m=>[`${m} · ${moveName(gameId,data().machines[m])}`,...stages.map(s=>{const yes=s.record.machines.includes(m);const cell=node('span',yes?'✓':'—',yes?'compatible':'');cell.setAttribute('aria-label',yes?'Compatible':'Not compatible');return cell;})]),`${gameName()} compatibility by evolution stage`);mt.classList.add('machine-table');note(machines,`✓ can learn directly from that machine in ${gameName()}. — cannot learn directly. Earlier-stage moves can sometimes be retained through evolution.`);if(!machineIds.length)machines.append(node('p','No TM/HM compatibility for this family.'));
  const tutor=section('Tutor moves',false);if(p.tutorMoves.length)table(tutor,['Move','Tutor / cost'],p.tutorMoves.map(id=>{const info=data().tutors[id];return [moveName(gameId,id),`${info.location}${info.costLabel?` · ${info.costLabel}`:info.cost?` · ${info.cost} BP`:''}${info.condition?` · ${info.condition}`:''}`];}),`${gameName()} tutors`);else tutor.append(node('p','No tutor moves for this species/form.'));
  const egg=section('Egg moves',false);if(p.eggMoves.length){const ul=node('ul');for(const id of p.eggMoves)ul.append(node('li',moveName(gameId,id)));egg.append(ul);note(egg,`${gameName()} inherited Egg moves for this species. Parent compatibility and move inheritance still apply; this list does not include every inherited TM or level-up move.`);}else egg.append(node('p','No Egg moves listed for this species. Check the base/baby stage for breeding.'));
  const stats=section('Base stats and possible ranges',false);const levelLabel=node('label','Level '),level=node('input');level.type='number';level.min=1;level.max=100;level.value=50;level.id='reference-level';levelLabel.append(level);stats.append(levelLabel);const statBody=node('div');stats.append(statBody);
  const updateStats=()=>{statBody.replaceChildren();const l=Number(level.value);if(!Number.isInteger(l)||l<1||l>100){statBody.append(node('p','Enter a whole level from 1 to 100.'));return;}table(statBody,['Stat','Base','Minimum','Maximum'],STAT_LABELS.map((name,i)=>[name,p.stats[i],...statRange(p,i,l)]),`Possible stats at level ${l}`);};level.addEventListener('input',updateStats);updateStats();note(stats,'Individual ranges: IV 0 / EV 0 / hindering nature through IV 31 / EV 252 / beneficial nature. Gen IV permits 255 EV per stat, but 252 gives the same stat gain. 510 total EV limit means all six maxima cannot be reached together. HP ignores nature; Shedinja has 1 HP.');
  note(stats,'HP = floor((2 × Base + IV + floor(EV / 4)) × Level / 100) + Level + 10. Other stats = floor((floor((2 × Base + IV + floor(EV / 4)) × Level / 100) + 5) × Nature). Nature is 0.9, 1 or 1.1.');
  const sources=section('Sources and coverage',false);note(sources,gameId==='platinum'?'Pinned pret/pokeplatinum personal, learnset, tutor and ability data. All 493 species’ four move-list categories and Sinnoh ordering independently match PokéAPI’s Platinum data. Shared Generation IV type chart and existing HGSS illustrations. Offline data; no runtime API requests.':'Pinned HGSS personal/evolution/learnset/tutor data from pret/pokeheartgold. HGSS ability text and regional ordering from PokéAPI. All 493 species’ move lists were cross-checked. No live metadata requests are needed.');for(const [text,url]of [['Data audit and pinned sources',gameId==='platinum'?'../docs/platinum-pokedex.md':'../docs/reference-pokedex.md'],[gameId==='platinum'?'Generation IV species reference':'HGSS species reference',`https://www.serebii.net/pokedex-dp/${String(p.id).padStart(3,'0')}.shtml`]]){const a=node('a',text);a.href=url;sources.append(a,node('br'));}
}
function openSpecies(key,replace=false) {
  if(!species(key))return;
  if(!dialog.open){opener=document.activeElement;listY=list.scrollTop;}
  const hash=`#species=${key}&scope=${scope}${gameParam()}`;
  // One history entry per open detail, so Back returns to the original list.
  if(dialog.open||replace)history.replaceState(history.state,'',hash);
  else history.pushState({referenceDetail:true,listY,scope},'',hash);
  renderDetail(key);if(!dialog.open)dialog.showModal();dialog.scrollTop=0;document.querySelector('#reference-close').focus({preventScroll:true});
}
function closeDetail() {
  if(history.state?.referenceDetail){history.back();return;}
  history.replaceState(null,'',`#scope=${scope}${gameParam()}`);restoreList();
}
function restoreList() {
  if(dialog.open)dialog.close();currentKey=null;
  opener?.focus({preventScroll:true});list.scrollTo({top:listY,behavior:'instant'});
}
function route() {
  const params=new URLSearchParams(location.hash.slice(1));
  const requested=params.get('game') || (params.has('species')?'soulsilver':null);
  if(pokedexReference(requested) && requested!==gameId)selectGame(requested);
  const key=Number(params.get('species')), record=species(key);
  const outsideRegion=record&&!history.state?.referenceDetail&&!data().regional.includes(record.id);
  const desired=params.get('scope')==='national'||outsideRegion?'national':'regional';
  if(desired!==scope){scope=desired;renderList();}
  if(record) {
    if(!dialog.open) {
      if(history.state?.referenceDetail) {
        // Back/Forward and reload retain the original browse position.
        listY=history.state.listY;
        opener=list.querySelector(`[data-species-id="${record.id}"]`);
      } else {
        // An Atlas/direct link has no previous list position in this document.
        // Establish its destination before opening, so Close/Escape reveals it.
        opener=revealSpecies(record.id);
        listY=list.scrollTop;
        status.textContent=`${record.name} · National #${String(record.id).padStart(3,'0')}`;
      }
    }
    renderDetail(key);if(!dialog.open)dialog.showModal();
  } else restoreList();
}
document.querySelector('#reference-close').addEventListener('click',closeDetail);
dialog.addEventListener('cancel',event=>{event.preventDefault();closeDetail();});
dialog.addEventListener('click',event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)closeDetail();}});
window.addEventListener('popstate',route);window.addEventListener('hashchange',route);
scopeSelect.addEventListener('change',()=>{scope=scopeSelect.value;history.replaceState(null,'',`#scope=${scope}${gameParam()}`);renderList();status.textContent='Search keeps the surrounding species in view.';});
function revealSpecies(id) {
  for(const old of list.querySelectorAll('.search-match'))old.classList.remove('search-match');
  const row=document.querySelector(`#species-${id}`);
  row.classList.add('search-match');
  list.scrollTo({top:row.offsetTop,behavior:'instant'});
  return row.querySelector('button');
}
function jump(id) {
  if(!document.querySelector(`#species-${id}`)){scope='national';saveFilter.value='all';history.replaceState(null,'',`#scope=national${gameParam()}`);renderList();}
  revealSpecies(id).focus({preventScroll:true});
  status.textContent=`${species(id).name} · National #${String(id).padStart(3,'0')} · match ${matchIndex+1} of ${matchIds.length}. ${scope==='national'?'National':regionName()} order; surrounding species remain visible.`;
}
const normalize=s=>s.normalize('NFKC').toLowerCase().replace(/[^a-z0-9♀♂]/g,'');
document.querySelector('#reference-search').addEventListener('submit',event=>{event.preventDefault();const q=normalize(search.value);matchIds=q?Array.from({length:493},(_,i)=>i+1).filter(id=>/^\d+$/.test(q)?id===Number(q):normalize(species(id).name).includes(q)):[];matchIndex=0;next.hidden=matchIds.length<2;if(matchIds.length)jump(matchIds[0]);else status.textContent=q?`No matching ${gameName()} species. The list is unchanged.`:'Enter a species name or National number.';});
next.addEventListener('click',()=>{matchIndex=(matchIndex+1)%matchIds.length;jump(matchIds[matchIndex]);});
// Reference selection and persisted save indicators are independently game scoped.
function selectGame(id) {
  gameId=id;savedDex=null;owned=new Map();
  if(activeProfile?.gameId===id) {
    savedDex=activeProfile.snapshot.pokedex;
    for(const p of [...activeProfile.snapshot.party,...activeProfile.snapshot.storage.boxes.flatMap(b=>b.pokemon)])if(!p.empty&&!p.isEgg)owned.set(p.speciesId,(owned.get(p.speciesId)||0)+1);
  }
  gameSelect.value=id;saveFilter.disabled=!savedDex;
  scopeSelect.querySelector('[value="regional"]').textContent=`${regionName()} (${data().regional.length})`;
  list.setAttribute('aria-label',`${gameName()} species`);
  document.querySelector('#save-dex-status').textContent=savedDex?`${savedDex.nationalDex?'National':regionName()} save · Seen ${savedDex.seenCount} / ${savedDex.speciesCount} · Caught ${savedDex.caughtCount} / ${savedDex.speciesCount}. Registrations persist after evolution/trading. Owned counts party and PC only, excluding Eggs and Day Care.`:`Load a ${gameName()} save to see Seen, Caught and current ownership.`;
  matchIds=[];next.hidden=true;renderList();
}
try {activeProfile=await getActiveProfile();}catch{}
const initialParams=new URLSearchParams(location.hash.slice(1));
const requestedGame=initialParams.get('game') || (initialParams.has('species')?'soulsilver':null);
selectGame(pokedexReference(requestedGame)?requestedGame:pokedexReference(activeProfile?.gameId)?activeProfile.gameId:'soulsilver');
gameSelect.addEventListener('change',()=>{restoreList();selectGame(gameSelect.value);history.replaceState(null,'',`#scope=${scope}${gameParam()}`);status.textContent='Search keeps the surrounding species in view.';});
saveFilter.addEventListener('change',renderList);
route();
