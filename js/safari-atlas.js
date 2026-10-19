import { getActiveProfile,subscribeAdventureChanges,notifyAdventureChange } from './adventures.js';
import { safariReference,safariAreaEncounters,safariNeighbors,swapSafariArea,SAFARI_POSITIONS } from './data/safari-reference.js';
import { loadSafariLayout,saveSafariLayout } from './safari-store.js';
import { renderAtlasEncounters } from './atlas-encounters.js';
const node=(tag,text,className)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(className)n.className=className;return n;};

export function mountSafariAtlas({gameId,panel,decorateSpecies,onOpenPosition,onExit}) {
  const game=safariReference(gameId);
  if(!game)throw new Error('Safari reference is unavailable for this game.');
  const source=panel.querySelector('#safari-layout-source'),message=panel.querySelector('#safari-layout-status');
  const editor=panel.querySelector('#safari-layout-editor'),form=panel.querySelector('#safari-layout-form');
  const fields=panel.querySelector('#safari-layout-fields'),save=panel.querySelector('#safari-layout-save');
  const grid=panel.querySelector('#safari-area-grid'),compass=panel.querySelector('#safari-compass'),encounters=panel.querySelector('#safari-encounters');
  let profile=null,record=null,areas=[...game.exampleAreas],position=game.entrancePosition;
  let loaded=false,storageAvailable=true,loadRevision=0,busy=false,refreshPending=false;
  const sessions=new Map();
  const context=()=>profile?.id||null;
  const areaName=id=>game.areas.find(area=>area.id===id).name;
  function showSource() {
    const owner=profile?`${profile.snapshot.trainer.name||'Trainer'} · ID ${String(profile.snapshot.trainer.trainerId).padStart(5,'0')}`:'reference mode · no active adventure';
    const kind=sessions.has(context())?'Manual layout · session only':record?'Manual layout · saved in this browser':'Example layout · edit to match your game';
    source.textContent=`${kind} · ${owner}`;
    save.textContent=storageAvailable?'Save manual layout':'Use layout for this visit';
    save.disabled=busy||!loaded;
    panel.dataset.safariReady=String(loaded);
  }
  function render(nextPosition=position,{focus=false}={}) {
    position=safariNeighbors(gameId,nextPosition)?nextPosition:game.entrancePosition;
    if(panel.hidden){showSource();return;}
    compass.classList.add('connection-links');
    grid.replaceChildren();
    for(let i=0;i<6;i++) {
      const b=node('button',undefined,'safari-area-button');b.type='button';b.dataset.safariPosition=i;
      b.setAttribute('aria-label',`${SAFARI_POSITIONS[i]}: ${areaName(areas[i])}`);
      if(i===position)b.setAttribute('aria-current','location');
      b.append(node('span',SAFARI_POSITIONS[i],'safari-position'),node('strong',areaName(areas[i])));
      if(i===game.entrancePosition)b.append(node('small','Entrance to the south'));
      b.addEventListener('click',()=>onOpenPosition(i));grid.append(b);
    }
    compass.replaceChildren();
    const adjacent=safariNeighbors(gameId,position);
    for(const direction of ['north','east','south','west']) {
      const target=adjacent[direction],slot=node('div',undefined,`compass-${direction} compass-direction`);
      if(target!==null) {
        const b=node('button',target==='gate'?'Safari Zone Gate':areaName(areas[target]),'connection-link');b.type='button';b.dataset.safariDirection=direction;
        b.setAttribute('aria-label',`${direction}: ${b.textContent}`);b.addEventListener('click',()=>target==='gate'?onExit():onOpenPosition(target));slot.append(b);
      }
      compass.append(slot);
    }
    const current=node('div',undefined,'compass-current safari-current');
    const heading=node('h3',areaName(areas[position]));heading.id='safari-area-title';heading.tabIndex=-1;
    current.append(heading,node('p',SAFARI_POSITIONS[position]));compass.append(current);
    const rows=safariAreaEncounters(gameId,areas[position]);
    const section=renderAtlasEncounters({gameId,locationName:areaName(areas[position]),encounters:rows,notes:[],decorateSpecies});
    const count=node('p',`${rows.length} existing reference records · Safari data audit pending · not filtered by your blocks, aging or progression`,'safari-reference-count');
    encounters.replaceChildren(count,section);showSource();
    if(focus){heading.focus({preventScroll:true});heading.scrollIntoView({block:'center'});}
  }
  function fillEditor() {
    fields.replaceChildren();
    for(let i=0;i<6;i++) {
      const label=node('label',SAFARI_POSITIONS[i]);const select=node('select');select.dataset.safariEditPosition=i;
      for(const area of game.areas){const option=node('option',area.name);option.value=area.id;select.append(option);}
      select.value=areas[i];select.addEventListener('change',()=>{
        const previous=[...fields.querySelectorAll('select')].map(s=>Number(s.dataset.previous));
        const updated=swapSafariArea(gameId,previous,i,Number(select.value));
        [...fields.querySelectorAll('select')].forEach((s,j)=>{s.value=updated[j];s.dataset.previous=updated[j];});
      });select.dataset.previous=areas[i];label.append(select);fields.append(label);
    }
  }
  editor.addEventListener('toggle',()=>{if(editor.open)fillEditor();else refresh();});
  panel.querySelector('#safari-layout-cancel').addEventListener('click',()=>{editor.open=false;editor.querySelector('summary').focus();});
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(busy||!loaded)return;
    const draft=[...fields.querySelectorAll('select')].map(s=>Number(s.value));
    const owner=context();++loadRevision;busy=true;save.disabled=true;
    let notify=false;
    try {
      if(storageAvailable)record=await saveSafariLayout(gameId,owner,draft,record?.revision||0);
      else sessions.set(owner,draft);
      areas=[...draft];if(storageAvailable){sessions.delete(owner);notify=true;}
      editor.open=false;render();editor.querySelector('summary').focus();
      message.textContent=storageAvailable?'Manual layout saved. It does not change the arrangement in your game.':'Manual layout applied for this visit. Browser storage is unavailable; saved layouts have not been replaced.';
    } catch(error) {
      // A stale editor must never write a draft into another adventure or silently
      // override another tab. Leave that draft visible for review instead.
      if(['SecurityError','QuotaExceededError','UnknownError','InvalidStateError','AbortError'].includes(error.name)) {
        sessions.set(owner,[...draft]);areas=[...draft];storageAvailable=false;editor.open=false;render();editor.querySelector('summary').focus();
        message.textContent='Could not save the manual layout. Using it for this visit; the previously saved layout is preserved.';
      } else message.textContent=error.message;
    } finally {
      busy=false;save.disabled=false;
      if(notify)notifyAdventureChange();
      if(refreshPending){refreshPending=false;refresh();}
    }
  });
  async function refresh() {
    if(busy){refreshPending=true;return;}
    const revision=++loadRevision;let selected;
    try {
      selected=await getActiveProfile();
      if(selected?.gameId!==gameId)selected=null;
      const saved=await loadSafariLayout(gameId,selected?.id||null);
      if(revision!==loadRevision)return;
      const changed=!loaded||context()!==(selected?.id||null)||(record?.revision||0)!==(saved?.revision||0);
      if(changed&&editor.open){editor.open=false;message.textContent='The adventure or saved layout changed. Reopen the editor to review this layout; unsaved edits were not applied.';}
      profile=selected;record=saved;storageAvailable=true;loaded=true;
      if(changed){areas=[...(sessions.get(context())||record?.areas||game.exampleAreas)];render();}else showSource();
    } catch {
      if(revision!==loadRevision)return;
      const changed=!loaded||(selected!==undefined&&context()!==(selected?.id||null));
      if(changed){profile=selected||null;record=null;areas=[...(sessions.get(context())||game.exampleAreas)];}
      loaded=true;storageAvailable=false;
      message.textContent='Browser storage is unavailable. Manual layouts work for this visit; no saved adventure or layout is replaced.';
      if(changed)render();else showSource();
    }
  }
  subscribeAdventureChanges(refresh);window.addEventListener('focus',refresh);window.addEventListener('pageshow',refresh);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')refresh();});
  render();refresh();
  function hide(){grid.replaceChildren();compass.replaceChildren();compass.classList.remove('connection-links');encounters.replaceChildren();}
  return {render,refresh,hide};
}
