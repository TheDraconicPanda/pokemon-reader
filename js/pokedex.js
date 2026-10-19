import { pokedexReference, referenceSpecies, speciesForms, evolutionFamily, evolutionRequirement, typeMultipliers, statRange, heldItems, speciesLocations, moveName, STAT_LABELS } from './data/pokedex-reference.js';
import { hgssSprite, typeBadges, speciesHeading } from './species-presentation.js';
import { getActiveProfile } from './adventures.js';
const gameSelect=document.querySelector('#reference-game'), scopeSelect=document.querySelector('#reference-scope');
const list=document.querySelector('#species-list'), status=document.querySelector('#reference-status');
const dialog=document.querySelector('#reference-detail'), content=document.querySelector('#reference-content');
const search=document.querySelector('#species-search'), next=document.querySelector('#next-match');
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
function renderList() {
  list.replaceChildren();const ids=scope==='regional'?data().regional:Array.from({length:493},(_,i)=>i+1);
  ids.forEach((id,index)=>{
    const p=species(id),li=node('li');li.id=`species-${id}`;li.value=index+1;
    const b=node('button',undefined,'species-row');b.type='button';b.dataset.speciesId=id;b.setAttribute('aria-label',`${String(index+1).padStart(3,'0')} ${p.name}, ${p.types.join(' and ')}`);
    const number=node('span',String(index+1).padStart(3,'0'),'dex-number');
    const img=node('img');img.src=hgssSprite(id);img.width=56;img.height=56;img.alt='';img.loading='lazy';
    b.append(number,img,node('strong',p.name),typeBadges(p.types));b.addEventListener('click',()=>openSpecies(id));li.append(b);list.append(li);
  });
  scopeSelect.value=scope;document.body.dataset.referenceReady='true';
}
function renderDetail(key,referenceType=null) {
  const original=species(key);if(!original)return;
  const p=referenceType?{...original,types:[referenceType]}:original;
  currentKey=key;content.replaceChildren();document.querySelector('#reference-title').textContent=p.name;
  content.append(speciesHeading(p));
  if(p.id===351||p.id===493) {
    const label=node('label',p.id===493?'Plate type ':'Forecast/weather type '),select=node('select'); select.id='reference-type';
    for(const type of p.id===493?Object.keys(data().typeChart):['normal','fire','water','ice']){const opt=node('option',type[0].toUpperCase()+type.slice(1));opt.value=type;select.append(opt);}
    select.value=p.types[0];select.addEventListener('change',()=>{renderDetail(key,select.value);document.querySelector('#reference-type').focus({preventScroll:true});});label.append(select);content.append(label);
  }
  const forms=speciesForms(gameId,p.id);
  if(forms.length>1){const label=node('label','Form '),select=node('select');select.id='reference-form';for(const f of forms){const opt=node('option',f.record.form);opt.value=f.key;select.append(opt);}select.value=key;select.addEventListener('change',()=>openSpecies(Number(select.value),true));label.append(select);content.append(label);}
  if([201,351,412,421,422,423,493].includes(p.id))note(content,p.id===493?'Without a Plate, Arceus is Normal. Select the Plate’s type to inspect matchups; Draco Meteor requires the Draco Plate.':p.id===351?'Forecast changes Castform to Fire in sun, Water in rain or Ice in hail. Choose the weather type above; stats remain the same.':'Standard appearance is shown; cosmetic/cloak forms share these base stats and types.');
  if(p.id===479&&key!==479)note(content,'In Generation IV, all Rotom appliance forms remain Electric/Ghost. Changing appliances teaches Overheat, Hydro Pump, Blizzard, Air Slash or Leaf Storm respectively; these form-change moves are separate from the level-up list.');
  const ability=section('Abilities');for(const id of p.abilities){ability.append(node('h3',data().abilities[id].name),node('p',data().abilities[id].description));}note(ability,'Available HGSS abilities; no hidden abilities in Generation IV.');
  const ev=section('EV yield');ev.append(node('p',p.evYield.map((v,i)=>v?`${v} ${STAT_LABELS[i]}`:null).filter(Boolean).join(' · ')||'None'));note(ev,'Base yield per defeated Pokémon, before held items or Pokérus.');
  const types=section('Type matchups');const grid=node('div',undefined,'type-grid');for(const {type,multiplier} of typeMultipliers(gameId,p.types)){const row=node('div');row.append(typeBadges([type]),node('strong',`×${multiplier}`));grid.append(row);}types.append(grid);note(types,'Incoming damage by type, before abilities, items and battle effects. Generation IV: Steel resists Ghost and Dark; no Fairy type.');
  const items=section('Wild held items');const itemResults=node('p');const label=node('label'),check=node('input');check.type='checkbox';check.id='compound-eyes';label.append(check,document.createTextNode(' Lead Pokémon has Compound Eyes'));const update=()=>itemResults.textContent=heldItems(p,check.checked).map(r=>`${r.name}: ${r.percent}%`).join(' · ');check.addEventListener('change',update);update();items.append(itemResults,label);note(items,'Normal wild item rolls. These odds do not establish that this species is catchable in SoulSilver; gifts, trades and scripted encounters may use fixed items.');
  const family=evolutionFamily(gameId,p.id),evolutions=data().evolutions.filter(e=>family.includes(e.from));
  const evo=section('Evolution family');const familyLinks=node('div');for(const id of family)familyLinks.append(speciesButton(id));evo.append(familyLinks);
  if(!evolutions.length)evo.append(node('p','No evolution in Generation IV.'));
  const edges=node('ul',undefined,'evolution-list');for(const edge of evolutions){const li=node('li');li.append(speciesButton(edge.from),document.createTextNode(' → '),speciesButton(edge.to),node('span',evolutionRequirement(edge)));edges.append(li);}evo.append(edges);
  if(p.id===489||p.id===490)note(evo,'Phione and Manaphy do not evolve into one another. Breeding Manaphy or Phione with Ditto produces Phione.');
  const locations=section('SoulSilver locations');locations.classList.add('reference-locations');note(locations,'Current Atlas coverage: Johto and existing League/Mt. Silver approaches. Full Kanto, Pokéwalker and event/distribution coverage are not included. Safari records retain their pending-audit label.');
  const records=speciesLocations(gameId,p.id);if(!records.length)locations.append(node('p','No location recorded in the current Atlas coverage. This does not mean unavailable in SoulSilver. Check this evolution family and external sources below.'));
  for(const group of records){const d=node('details');d.append(node('summary',group.location));const link=node('a',`Open ${group.location} in Atlas`);link.href=`../pokedex-earth/#location=${encodeURIComponent(group.location)}`;d.append(link);const ul=node('ul');for(const text of group.details)ul.append(node('li',text));d.append(ul);for(const n of group.notes)note(d,n);locations.append(d);}
  const learn=section('Level-up moves',false);table(learn,['Level','Move'],p.levelMoves.map(([level,id])=>[level,moveName(gameId,id)]),'HGSS level-up learnset');
  if(!p.levelMoves.length)learn.append(node('p','No level-up moves.'));
  const machines=section('TM/HM compatibility across evolutions',false);
  const stages=family.map(id=>({key:id,record:species(id)}));
  // Forms with different compatibility remain explicit columns (e.g. Wormadam).
  for(const id of family)for(const f of speciesForms(gameId,id).slice(1))if(JSON.stringify(f.record.machines)!==JSON.stringify(species(id).machines))stages.push(f);
  const columns=stages.map(({record:r})=>{const h=node('div');const img=node('img');img.src=hgssSprite(r.sprite);img.alt='';img.width=48;img.height=48;h.append(img,document.createTextNode(r.name+(r.form==='Standard'?'':` (${r.form})`)));return h;});
  const machineIds=Object.keys(data().machines).filter(m=>stages.some(s=>s.record.machines.includes(m)));
  const mt=table(machines,['Machine / move',...columns],machineIds.map(m=>[`${m} · ${moveName(gameId,data().machines[m])}`,...stages.map(s=>{const yes=s.record.machines.includes(m);const cell=node('span',yes?'✓':'—',yes?'compatible':'');cell.setAttribute('aria-label',yes?'Compatible':'Not compatible');return cell;})]),'HGSS compatibility by evolution stage');mt.classList.add('machine-table');note(machines,'✓ can learn directly from that machine in HGSS. — cannot learn directly. Earlier-stage moves can sometimes be retained through evolution.');if(!machineIds.length)machines.append(node('p','No TM/HM compatibility for this family.'));
  const tutor=section('Tutor moves',false);if(p.tutorMoves.length)table(tutor,['Move','Tutor / cost'],p.tutorMoves.map(id=>{const info=data().tutors[id];return [moveName(gameId,id),`${info.location}${info.cost?` · ${info.cost} BP`:''}${info.condition?` · ${info.condition}`:''}`];}),'HGSS tutors');else tutor.append(node('p','No tutor moves for this species/form.'));
  const egg=section('Egg moves',false);if(p.eggMoves.length){const ul=node('ul');for(const id of p.eggMoves)ul.append(node('li',moveName(gameId,id)));egg.append(ul);note(egg,'HGSS inherited Egg moves for this species. Parent compatibility and move inheritance still apply; this list does not include every inherited TM or level-up move.');}else egg.append(node('p','No Egg moves listed for this species. Check the base/baby stage for breeding.'));
  const stats=section('Base stats and possible ranges',false);const levelLabel=node('label','Level '),level=node('input');level.type='number';level.min=1;level.max=100;level.value=50;level.id='reference-level';levelLabel.append(level);stats.append(levelLabel);const statBody=node('div');stats.append(statBody);
  const updateStats=()=>{statBody.replaceChildren();const l=Number(level.value);if(!Number.isInteger(l)||l<1||l>100){statBody.append(node('p','Enter a whole level from 1 to 100.'));return;}table(statBody,['Stat','Base','Minimum','Maximum'],STAT_LABELS.map((name,i)=>[name,p.stats[i],...statRange(p,i,l)]),`Possible stats at level ${l}`);};level.addEventListener('input',updateStats);updateStats();note(stats,'Individual ranges: IV 0 / EV 0 / hindering nature through IV 31 / EV 252 / beneficial nature. Gen IV permits 255 EV per stat, but 252 gives the same stat gain. 510 total EV limit means all six maxima cannot be reached together. HP ignores nature; Shedinja has 1 HP.');
  note(stats,'HP = floor((2 × Base + IV + floor(EV / 4)) × Level / 100) + Level + 10. Other stats = floor((floor((2 × Base + IV + floor(EV / 4)) × Level / 100) + 5) × Nature). Nature is 0.9, 1 or 1.1.');
  const sources=section('Sources and coverage',false);note(sources,'Pinned HGSS personal/evolution/learnset/tutor data from pret/pokeheartgold. HGSS ability text and regional ordering from PokéAPI. All 493 species’ move lists were cross-checked. No live metadata requests are needed.');for(const [text,url]of [['Data audit and pinned sources','../docs/reference-pokedex.md'],['HGSS species reference',`https://www.serebii.net/pokedex-dp/${String(p.id).padStart(3,'0')}.shtml`]]){const a=node('a',text);a.href=url;sources.append(a,node('br'));}
}
function openSpecies(key,replace=false) {
  if(!species(key))return;
  if(!dialog.open){opener=document.activeElement;listY=scrollY;}
  const hash=`#species=${key}&scope=${scope}`;
  // One history entry per open detail, so Back returns to the original list.
  if(dialog.open||replace)history.replaceState(history.state,'',hash);
  else history.pushState({referenceDetail:true,listY,scope},'',hash);
  renderDetail(key);if(!dialog.open)dialog.showModal();dialog.scrollTop=0;document.querySelector('#reference-close').focus({preventScroll:true});
}
function closeDetail() {
  if(history.state?.referenceDetail){history.back();return;}
  history.replaceState(null,'',`#scope=${scope}`);restoreList();
}
function restoreList() {
  if(dialog.open)dialog.close();currentKey=null;
  opener?.focus({preventScroll:true});window.scrollTo({top:listY,behavior:'instant'});
}
function route() {
  const params=new URLSearchParams(location.hash.slice(1));const desired=params.get('scope')==='national'?'national':'regional';
  if(desired!==scope){scope=desired;renderList();}
  const key=Number(params.get('species'));
  if(key&&species(key)){if(!dialog.open){listY=history.state?.listY||scrollY;opener=list.querySelector(`[data-species-id="${species(key).id}"]`);}renderDetail(key);if(!dialog.open)dialog.showModal();}
  else restoreList();
}
document.querySelector('#reference-close').addEventListener('click',closeDetail);
dialog.addEventListener('cancel',event=>{event.preventDefault();closeDetail();});
dialog.addEventListener('click',event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)closeDetail();}});
window.addEventListener('popstate',route);window.addEventListener('hashchange',route);
scopeSelect.addEventListener('change',()=>{scope=scopeSelect.value;history.replaceState(null,'',`#scope=${scope}`);renderList();status.textContent='Search keeps the surrounding species in view.';});
function jump(id) {
  if(!document.querySelector(`#species-${id}`)){scope='national';history.replaceState(null,'','#scope=national');renderList();}
  for(const old of list.querySelectorAll('.search-match'))old.classList.remove('search-match');
  const row=document.querySelector(`#species-${id}`);row.classList.add('search-match');row.scrollIntoView({block:'start',behavior:'instant'});row.querySelector('button').focus({preventScroll:true});
  status.textContent=`${species(id).name} · National #${String(id).padStart(3,'0')} · match ${matchIndex+1} of ${matchIds.length}. ${scope==='national'?'National':'Johto'} order; surrounding species remain visible.`;
}
const normalize=s=>s.normalize('NFKC').toLowerCase().replace(/[^a-z0-9♀♂]/g,'');
document.querySelector('#reference-search').addEventListener('submit',event=>{event.preventDefault();const q=normalize(search.value);matchIds=q?Array.from({length:493},(_,i)=>i+1).filter(id=>/^\d+$/.test(q)?id===Number(q):normalize(species(id).name).includes(q)):[];matchIndex=0;next.hidden=matchIds.length<2;if(matchIds.length)jump(matchIds[0]);else status.textContent=q?'No matching SoulSilver species. The list is unchanged.':'Enter a species name or National number.';});
next.addEventListener('click',()=>{matchIndex=(matchIndex+1)%matchIds.length;jump(matchIds[matchIndex]);});
// Supported game defaults from the active profile; reference remains independent.
try {const profile=await getActiveProfile();if(pokedexReference(profile?.gameId))gameId=profile.gameId;}catch{}
gameSelect.value=gameId;renderList();route();
