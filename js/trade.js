import {loadTradeSave,tradeEligibility,previewTrade,tradeSaves,tradeExportName,tradeSpeciesName,tradeMoveName,tradeItemName,tradeHmMoves} from './saves/trade-transaction.js';
const $=id=>document.getElementById(id), state={a:null,b:null}, slots={a:null,b:null};
let urls=[], preview=null, completed=false, moveChoices={a:[],b:[]};
function clearDownloads(){urls.forEach(URL.revokeObjectURL);urls=[];$('trade-downloads').hidden=true;$('download-links').replaceChildren();completed=false;}
function element(tag,text){const node=document.createElement(tag);if(text!==undefined)node.textContent=text;return node;}
function renderParty(side){
 const save=state[side]?.save,host=$('party-'+side);host.replaceChildren();
 if(!save)return;
 const group=element('fieldset');group.append(element('legend','Choose an outgoing Pokémon'));
 for(const mon of save.party){
  const reason=tradeEligibility(save,mon.slot),label=element('label');label.className='trade-pokemon';
  const input=element('input');input.type='radio';input.name='pokemon-'+side;input.value=mon.slot;input.disabled=Boolean(reason);input.checked=slots[side]===mon.slot;
  input.addEventListener('change',()=>{slots[side]=mon.slot;moveChoices={a:[],b:[]};clearDownloads();renderPreview();});
  const text=element('span',`${mon.nickname || tradeSpeciesName(mon.speciesId)} · ${tradeSpeciesName(mon.speciesId)}${mon.formId ? ` · Form ${mon.formId}` : ''}${mon.isEgg?' · Egg':` · Lv. ${mon.level}`}`);
  text.append(element('small',`Held item: ${tradeItemName(mon.heldItemId)} · Party slot ${mon.slot}`));
  if(reason)text.append(element('small',reason));
  label.append(input,text);group.append(label);
 }host.append(group);
}
function renderPreview(){
 preview=null;$('trade-preview').replaceChildren();$('confirm-trade').disabled=true;
 for(const side of ['a','b'])$('date-label-'+side).hidden=true;
 if(!state.a||!state.b||!slots.a||!slots.b){$('trade-status').textContent='Load one save of each game and choose a Pokémon on each side.';return;}
 for(const [side,other] of [['a','b'],['b','a']])$('date-label-'+side).hidden=!state[other].save.party.find(p=>p.slot===slots[other])?.isEgg;
 try{
  preview=previewTrade(state.a.bytes,state.b.bytes,slots.a,slots.b,{a:$('date-a').value,b:$('date-b').value});
  for(const side of ['a','b']){
   const received=side==='a'?preview.toA:preview.toB,save=state[side].save;
   const block=element('fieldset');block.append(element('legend',`Save ${side.toUpperCase()} · ${save.profile.shortName} receives`));
   block.append(element('p',`${tradeSpeciesName(received.originalSpecies)}${received.rule?` → ${tradeSpeciesName(received.species)}`:''}${received.mon.isEgg?' (Egg)':''}`));
   block.append(element('p',received.rule?.consumesItem?`${tradeItemName(received.mon.heldItemId)} will be consumed.`:`Held item: ${tradeItemName(received.mon.heldItemId)}.`));
   if(received.mon.heldItemId && !received.rule && received.mon.speciesId!==64) block.append(element('p','No trade evolution is triggered by this Pokémon and held item.'));
   let current=received.mon.moves.map(m=>m.id);while(current.length<4)current.push(0);
   for(const [i,id] of received.prompts.entries()){
    if(current.includes(id))continue;
    const empty=current.indexOf(0);
    if(empty>=0){current[empty]=id;block.append(element('p',`${tradeMoveName(id)} will be learned in empty move slot ${empty+1}.`));continue;}
    const label=element('label',`Learn ${tradeMoveName(id)}: `),select=element('select');select.id=`move-${side}-${i}`;
    select.append(new Option('Choose…',''),new Option('Do not learn','skip'));
    current.forEach((move,slot)=>{if(!tradeHmMoves(save.gameId).includes(move))select.append(new Option(`Forget ${tradeMoveName(move)}`,String(slot)));});
    select.value=moveChoices[side][i]??'';
    if(select.selectedIndex<0){select.value='';moveChoices[side][i]='';}
    if(select.value!==''&&select.value!=='skip')current[Number(select.value)]=id;
    select.addEventListener('change',()=>{moveChoices[side][i]=select.value;clearDownloads();renderPreview();$(select.id)?.focus();});
    label.append(select);block.append(label);
   }
   $('trade-preview').append(block);
  }
  $('trade-status').textContent='Both directions are eligible. Review the exchange and any evolution move choices.';
  $('confirm-trade').disabled=completed;
 }catch(error){$('trade-status').textContent=error.message;}
}
for(const side of ['a','b']){
 let generation=0;
 $('file-'+side).addEventListener('change',async event=>{
  const request=++generation,file=event.target.files[0];moveChoices={a:[],b:[]};clearDownloads();state[side]=null;slots[side]=null;renderParty(side);renderPreview();
  if(!file){$('status-'+side).textContent='No save loaded.';return;}
  $('status-'+side).textContent='Validating save…';
  try{
   if(![0x80000,0x80000+122].includes(file.size))throw new Error('Choose a 512 KB SoulSilver or Platinum save (.sav or supported .dsv).');
   const bytes=new Uint8Array(await file.arrayBuffer());if(request!==generation)return;
   const save=loadTradeSave(bytes);state[side]={bytes,save,name:file.name};
   $('status-'+side).textContent=`${save.profile.shortName} · ${save.source.trainer.name} · Trainer ID ${save.source.trainer.trainerId}`;
  }catch(error){if(request!==generation)return;$('status-'+side).textContent=error.message;}
  renderParty(side);renderPreview();
 });
 $('date-'+side).addEventListener('change',()=>{moveChoices={a:[],b:[]};clearDownloads();renderPreview();});
}
$('confirm-trade').addEventListener('click',()=>{
 if(!preview||completed)return;
 try{
  const choices=side=>Array.from({length:(side==='a'?preview.toA:preview.toB).prompts.length},(_,i)=>{const value=$(`move-${side}-${i}`)?.value;return value==='skip'?'skip':value===undefined||value===''?null:Number(value);});
  const result=tradeSaves(state.a.bytes,state.b.bytes,slots.a,slots.b,{dates:{a:$('date-a').value,b:$('date-b').value},movesA:choices('a'),movesB:choices('b')});
  clearDownloads();
  for(const side of ['a','b']){
   const url=URL.createObjectURL(new Blob([result[side]],{type:'application/octet-stream'}));urls.push(url);
   const link=element('a',`Download save ${side.toUpperCase()} · ${state[side].save.profile.shortName}`);link.href=url;link.download=tradeExportName(state[side].name,side);$('download-links').append(link);
  }
  completed=true;$('trade-downloads').hidden=false;$('confirm-trade').disabled=true;$('trade-status').textContent='Trade prepared and both saves validated. Download both updated saves below.';
 }catch(error){$('trade-status').textContent=error.message;}
});
window.addEventListener('pagehide',()=>urls.forEach(URL.revokeObjectURL));
document.documentElement.dataset.tradeReady='true';
