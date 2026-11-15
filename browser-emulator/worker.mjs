// SPDX-License-Identifier: GPL-3.0-or-later
import factory from './vendor/b1.mjs';
import {Store,SaveQueue,digest} from './storage.mjs';
import {Pacer,Metrics} from './timing.mjs';
const send=(type,data={},transfer=[])=>postMessage({type,...data},transfer);
const core=await factory({print:()=>{},printErr:()=>{}});
const store=await Store.open();
let key=null,diagnostic=false,running=false,keys=0,touch=[-1,-1],timer=null,leaseTimer=null;
let lastRevision=0,dirtyAt=0,lastChange=0,videoOutstanding=false,saveQueue=null;
let metrics=new Metrics(),pacer=new Pacer(),lastReport=0;
let releaseLock=null;
async function lockROM(key){
  if(!navigator.locks)return false;
  return new Promise((resolve,reject)=>{navigator.locks.request('reader-b1-'+key,{mode:'exclusive',ifAvailable:true},async lock=>{
    if(!lock){reject(Error('This ROM is open in another B1 window. Close that window first.'));return;}
    await new Promise(release=>{releaseLock=release;resolve(true);});
  }).catch(reject);});
}
const bytes=(ptr,len)=>core.HEAPU8.slice(ptr,ptr+len);
const saveBytes=()=>bytes(core._b1_save(),core._b1_save_size());
function withBytes(data,fn){const p=core._malloc(data.length||1);if(!p)throw Error('Insufficient browser memory');try{core.HEAPU8.set(data,p);return fn(p,data.length);}finally{core._free(p);}}
function copySave(force=false){
  if(!key||diagnostic||!saveQueue)return Promise.resolve();
  const revision=core._b1_revision();
  if(!force&&revision===lastRevision)return Promise.resolve();
  const data=saveBytes();if(!data.length)return Promise.resolve();
  lastRevision=revision;dirtyAt=0;
  return saveQueue.enqueue(data,revision);
}
function pause(){running=false;clearTimeout(timer);keys=0;touch=[-1,-1];send('paused');}
function fault(){pause();send('error',{message:'Browser storage failed or another window took the writer lease. Current RAM is retained. Export your save now, then retry persistence.'});}
function tick(){
  if(!running)return;
  try{
    let count=0,now=performance.now();
    while(pacer.due(now)&&count++<2){const start=performance.now();const seconds=core._b1_step(keys,...touch);const end=performance.now();
      if(!seconds){pause();send('error',{message:'The core stopped. Export any current cartridge save.'});return;}
      metrics.frame(seconds,end-start,end);pacer.advance(seconds,end);
      const n=core._b1_audio_read();if(n){const samples=core.HEAP16.slice(core._b1_audio()>>1,(core._b1_audio()>>1)+n*2);send('audio',{samples},[samples.buffer]);}
      const revision=core._b1_revision();if(revision!==lastRevision){if(!dirtyAt)dirtyAt=end;
        if(revision!==tick.seen){lastChange=end;tick.seen=revision;send('save',{state:'dirty',revision});}
        if(end-lastChange>=500||end-dirtyAt>=2000)copySave().catch(fault);
      }
      now=performance.now();
    }
    if(count>0&&!videoOutstanding){const data=bytes(core._b1_video(),256*192*8);videoOutstanding=true;send('video',{data},[data.buffer]);}
    if(now-lastReport>1000){send('metrics',{metrics:metrics.report(now)});lastReport=now;}
    timer=setTimeout(tick,pacer.delay(performance.now()));
  }catch{pause();send('error',{message:'Emulation failed. Export your cartridge save if available; reload before continuing.'});}
}
async function openROM(rom,isDiagnostic=false){
  pause();await copySave(true);
  if(key&&!diagnostic)await store.lease(key,true);clearInterval(leaseTimer);releaseLock?.();releaseLock=null;
  key=null;saveQueue=null;diagnostic=false;
  const next=isDiagnostic?'diagnostic':await digest(rom);let saved=null;
  if(!isDiagnostic){const exclusive=await lockROM(next);await store.lease(next,false,exclusive);saved=await store.loadSave(next);}
  const save=saved?.bytes||new Uint8Array();
  const ok=withBytes(save,(sp,sl)=>isDiagnostic?core._b1_diagnostic(sp,sl,0):withBytes(rom,(rp,rl)=>core._b1_load(rp,rl,sp,sl)));
  if(!ok){if(!isDiagnostic)await store.lease(next,true);key=null;throw Error('The core rejected this .nds file.');}
  key=next;diagnostic=isDiagnostic;lastRevision=core._b1_revision();dirtyAt=0;tick.seen=lastRevision;
  saveQueue=isDiagnostic?null:new SaveQueue((data,rev)=>store.save(key,data,rev),status=>send('save',{
    ...status,state:status.state==='persisted'&&status.revision!==core._b1_revision()?'dirty':status.state}));
  if(!isDiagnostic){await store.put('roms',key,{bytes:rom});await store.put('roms','last',key);
    leaseTimer=setInterval(()=>store.lease(key).catch(fault),5000);}
  send('loaded',{diagnostic,hasSave:!!saved,recovered:!!saved?.recovered,romBytes:rom?.length||0,gameCode:isDiagnostic?'TEST':String.fromCharCode(...rom.slice(12,16))});
}
// Serialize commands, particularly imports/switches with pending storage writes.
let chain=Promise.resolve();
onmessage=({data})=>{
  if(data.type==='input'){keys=data.keys;touch=data.touch;return;}
  if(data.type==='presented'){videoOutstanding=false;return;}
  chain=chain.then(async()=>{
    switch(data.type){
      case 'load': await openROM(data.rom);break;
      case 'diagnostic': await openROM(null,true);break;
      case 'reopen':{const last=await store.get('roms','last'),r=last&&await store.get('roms',last);if(!r)throw Error('No retained ROM. Choose a .nds file first.');await openROM(r.bytes);break;}
      case 'resume':if(running)break;if(!key)throw Error('Choose a ROM or run the diagnostic first.');if(saveQueue?.error)throw Error('Retry persistence or export before resuming.');
        if(!diagnostic)await store.lease(key);metrics.reset(performance.now());pacer.reset(performance.now());running=true;tick();send('running');break;
      case 'pause':pause();await copySave(true);break;
      case 'persist':if(saveQueue){await store.lease(key);await saveQueue.flush();await copySave(true);}break;
      case 'export':{pause();const data=saveBytes();send('export',{bytes:data},[data.buffer]);break;}
      case 'import':{
        if(!key||diagnostic)throw Error('Load the matching ROM before importing a raw save.');
        pause();await copySave(true);await store.lease(key);
        const r=await store.get('roms',key);if(!r)throw Error('Retained ROM unavailable.');
        // Restart from validated raw cartridge bytes. No native states accepted.
        const ok=withBytes(data.bytes,(sp,sl)=>withBytes(r.bytes,(rp,rl)=>core._b1_load(rp,rl,sp,sl)));
        if(!ok)throw Error('Core rejected imported save.');
        lastRevision=core._b1_revision();await copySave(true);send('imported');break;
      }
    }
  }).catch(error=>{pause();send('error',{message:error.message.startsWith('This ROM')||error.message.startsWith('No retained')||error.message.startsWith('Choose')||error.message.startsWith('Load the matching')||error.message.startsWith('Retry persistence')?error.message:'Operation failed. Storage may be full or unavailable. Current data is retained where possible; export your save before reloading.'});});
};
send('ready');
