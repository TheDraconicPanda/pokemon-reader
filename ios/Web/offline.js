// Native bundle adapter. Cartridge-era facts are pinned in hgss-offline-sources.json.
import { PLANNER_REFERENCE } from '../js/data/games/soulsilver/planner-reference.js';
let facts;
const slug = text => String(text).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
export async function nativeMetadata(address) {
  facts ||= fetch(new URL('hgss-offline.json',import.meta.url)).then(r=>{if(!r.ok)throw Error('Offline facts unavailable.');return r.json();});
  const data=await facts,url=new URL(address),[kind,id]=url.pathname.split('/').filter(Boolean).slice(2);
  if(url.origin!=='https://pokeapi.co')throw Error('Unsupported metadata source.');
  let body;
  if(kind==='pokemon-species'&&!id)body={results:Object.entries(PLANNER_REFERENCE.species).map(([id,name])=>({name,url:`https://pokeapi.co/api/v2/pokemon-species/${id}/`}))};
  else if(kind==='pokemon-species'&&data.species[id])body={name:PLANNER_REFERENCE.species[id],growth_rate:{name:data.species[id].growthRate},gender_rate:data.species[id].genderRate};
  else if(kind==='pokemon'&&data.species[id])body={types:data.species[id].types.map((name,index)=>({slot:index+1,type:{name}})),past_types:[]};
  else if(kind==='move'&&data.movePP[id]!==undefined)body={name:PLANNER_REFERENCE.moves[id],pp:data.movePP[id]};
  else if(kind==='item')body={name:data.items[id]||Object.values(data.items).find(name=>slug(name)===id)||`Item ${id}`};
  return new Response(JSON.stringify(body||{}),{status:body?200:404,headers:{'Content-Type':'application/json'}});
}
