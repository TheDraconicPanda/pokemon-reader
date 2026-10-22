import {getActiveProfile,subscribeAdventureChanges} from './adventures.js';
import {greatMarshDaily,greatMarshPool,greatMarshTable,GREAT_MARSH_RULES} from './great-marsh-engine.js';
import {gameReference} from './data/game-reference.js';
import {renderAtlasEncounters} from './atlas-encounters.js';
export function mountGreatMarsh({panel,onOpenLocation,decorateSpecies}) {
 const names=gameReference('platinum').species;let profile=null,seed=null,area=1,time='day',method='walking',national=null,visitor=null,hypothetical=false;
 const node=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
 function select(label,id,choices,value,change){const wrap=node('label',label+' '),s=node('select');s.id=id;for(const [v,text]of choices){const o=node('option',text);o.value=v;s.append(o);}s.value=value;s.addEventListener('change',()=>change(s.value));wrap.append(s);return wrap;}
 function render(){
  panel.replaceChildren();const title=node('h2','Great Marsh · Platinum');title.id='great-marsh-title';title.tabIndex=-1;panel.append(title);
  panel.append(node('p',`Six fixed areas. Entry costs ${GREAT_MARSH_RULES.entryCost}; a new game starts with ${GREAT_MARSH_RULES.balls} Safari Balls and ${GREAT_MARSH_RULES.steps} steps. Daily visitors replace two grass slots (10% total). No Johto blocks or area aging apply.`));
  const status=node('p',hypothetical?'Hypothetical / manually observed conditions; your save and Adventure Profile are unchanged.':seed!==null?`Saved daily selection · ${profile?.snapshot.trainer.name || 'Trainer'}. The app does not advance the game’s clock.`:'Daily selection is unknown. Load a Platinum save in Reader, or choose a Pokédex stage and an observed visitor.');status.id='great-marsh-status';status.setAttribute('role','status');panel.append(status);
  const controls=node('div');controls.className='ev-controls';
  controls.append(select('Area','great-marsh-area',Array.from({length:6},(_,i)=>[i+1,'Area '+(i+1)]),area,value=>{area=Number(value);visitor=null;render();}));
  controls.append(select('Time','great-marsh-time',[['morning','Morning · 04:00–09:59'],['day','Day · 10:00–19:59'],['night','Night · 20:00–03:59']],time,value=>{time=value;hypothetical=true;render();}));
  controls.append(select('Method','great-marsh-method',[['walking','Walking'],['surfing','Surfing'],['old_rod','Old Rod'],['good_rod','Good Rod'],['super_rod','Super Rod']],method,value=>{method=value;hypothetical=true;render();}));
  controls.append(select('Pokédex stage','great-marsh-dex',[['unknown','Unknown'],['local','Before National Pokédex'],['national','National Pokédex']],national===null?'unknown':national?'national':'local',value=>{national=value==='unknown'?null:value==='national';visitor=null;seed=null;hypothetical=true;render();}));
  const fromSave=greatMarshDaily(seed,national)?.[area-1]?.speciesId;
  controls.append(select('Daily visitor','great-marsh-visitor',[['unknown','Unknown'],...greatMarshPool(national).map(r=>[r.speciesId,names[r.speciesId]])],visitor??fromSave??'unknown',value=>{visitor=value==='unknown'?null:Number(value);seed=null;hypothetical=true;render();}));
  const reset=node('button','Use loaded save');reset.type='button';reset.disabled=!profile?.snapshot.greatMarsh;reset.addEventListener('click',()=>{seed=profile.snapshot.greatMarsh.dailySeed;national=profile.snapshot.greatMarsh.nationalDex;visitor=null;hypothetical=false;render();});controls.append(reset);panel.append(controls);
  const open=node('button',`Open Area ${area} in Atlas`);open.type='button';open.addEventListener('click',()=>onOpenLocation('Great Marsh',`MAP_HEADER_GREAT_MARSH_${area}`));panel.append(open);
  const result=greatMarshTable({area,time,method,dailySeed:seed,nationalDex:national,dailySpeciesId:visitor});
  const methods={walking:'Walking',surfing:'Surfing',old_rod:'Old Rod',good_rod:'Good Rod',super_rod:'Super Rod'};
  panel.append(renderAtlasEncounters({gameId:'platinum',locationName:`Great Marsh · Area ${area}`,encounters:result.rows.map(row=>({pokemon:names[row.speciesId],speciesId:row.speciesId,method:methods[method],times:time[0].toUpperCase()+time.slice(1),levels:row.minLevel===row.maxLevel?String(row.minLevel):`${row.minLevel}–${row.maxLevel}`,rate:`${row.percent}%`})),status:result.status==='no-encounters'?'no-fixed-wild':'verified',emptyMessage:'No encounters for this method in the selected Great Marsh area.',notes:[`Slot shares before lead abilities and Repel. ${result.unknownPercent?`${result.unknownPercent}% daily slots remain unknown; known rows have not been renormalized.`:'Complete 100% distribution for the selected conditions.'}`,'The daily visitor may also occupy ordinary slots, so its total encounter share can exceed 10%. Rod tables require the matching rod; the app does not infer equipment access.'],decorateSpecies}));
  const daily=node('details'),summary=node('summary','Daily selection pool');daily.append(summary,node('p','Pool probability is the chance of selection for one area under a uniformly distributed daily value, not an encounter or capture chance. The same visitor can be selected for several areas. Binoculars may show ordinary Pokémon as well as daily visitors.'));
  if(national===null)daily.append(node('p','Choose a Pokédex stage to inspect its verified pool.'));
  else{const ul=node('ul');for(const row of greatMarshPool(national)){const li=node('li',`${names[row.speciesId]} · ${row.indices.length}/32 (${row.dailyProbability*100}%)`);decorateSpecies(li,row.speciesId);ul.append(li);}daily.append(ul);}panel.append(daily);
  const refs=node('details');refs.append(node('summary','Sources and scope'),node('p','Pinned Platinum area tables, daily selection algorithm and save layout; independent mechanics references and tests are documented below. This tool plans encounters. It does not simulate capture/bait/mud battles or change the uploaded save.'));
  const a=node('a','Great Marsh evidence and validation');a.href='../docs/platinum-great-marsh.md';refs.append(a);panel.append(refs);
 }
 async function refresh(){try{profile=await getActiveProfile();if(profile?.gameId!=='platinum')profile=null;seed=profile?.snapshot.greatMarsh?.dailySeed??null;national=profile?.snapshot.greatMarsh?.nationalDex??null;visitor=null;hypothetical=false;if(!panel.hidden)render();}catch{profile=null;seed=null;national=null;if(!panel.hidden)render();}}
 subscribeAdventureChanges(refresh);window.addEventListener('pageshow',refresh);refresh();
 return {show(){render();refresh();},hide(){}};
}
