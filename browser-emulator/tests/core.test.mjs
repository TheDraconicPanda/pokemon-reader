import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import factory from '../vendor/b1.mjs';
import {detectSave} from '../../js/saves/index.js';
import {Pacer,Metrics,FRAME_SECONDS} from '../timing.mjs';
import {SaveQueue,StateQueue} from '../storage.mjs';
const require=createRequire(import.meta.url);
const {syntheticSave}=require('../../tests/fixtures/soulsilver.cjs');
const wasm=await factory({wasmBinary:readFileSync(new URL('../vendor/b1.wasm',import.meta.url)),print:()=>{},printErr:()=>{}});
const withBytes=(bytes,fn)=>{const p=wasm._malloc(bytes.length||1);try{wasm.HEAPU8.set(bytes,p);return fn(p,bytes.length);}finally{wasm._free(p);}};
test('actual pinned WASM executes original ARM, presents both screens, mirrors keys/touch and advances DS clock',()=>{
  assert.equal(wasm._b1_diagnostic(0,0,0),1);
  let seconds=0,audio=0;
  for(let i=0;i<8;i++){seconds+=wasm._b1_step(1,123,77);audio+=wasm._b1_audio_read();}
  assert.ok(Math.abs(seconds-8*FRAME_SECONDS)<.001,`clock ${seconds}`);
  assert.equal(wasm._b1_word(0x1000),42);
  assert.equal(wasm._b1_word(0x1004)&1,0,'A pressed');
  assert.equal(wasm._b1_word(0x1008)&64,0,'touch pressed');
  const ptr=wasm._b1_video()>>2;
  const top=wasm.HEAPU32[ptr],bottom=wasm.HEAPU32[ptr+256*192];
  assert.ok((top&0xff0000)>0x800000,top.toString(16));assert.ok((bottom&0xff00)>0x8000,bottom.toString(16));
  assert.ok(audio>0);
  wasm._b1_step(0,-1,-1);assert.equal(wasm._b1_word(0x1004)&1,1);
});
test('both synthetic cartridge saves survive WASM import, actual retail/IR SPI writes, export and independent Reader parsing',()=>{
  const platinum=new Uint8Array(readFileSync(new URL('../../tests/fixtures/gen4/platinum/early.sav',import.meta.url)));
  for(const [ir,original]of [[0,platinum],[1,new Uint8Array(syntheticSave().bytes)]]){
    assert.equal(withBytes(original,(p,n)=>wasm._b1_diagnostic(p,n,ir)),1);
    assert.equal(wasm._b1_save_size(),0x80000);
    assert.equal(wasm._b1_diagnostic_write(0x30000,0x53),1);
    assert.ok(wasm._b1_revision()>0);
    const exported=wasm.HEAPU8.slice(wasm._b1_save(),wasm._b1_save()+wasm._b1_save_size());
    const expected=original.slice();expected[0x30000]=0x53;
    const differences=[];for(let i=0;i<expected.length;i++)if(exported[i]!==expected[i]&&differences.length<8)differences.push([i,exported[i],expected[i]]);
    assert.deepEqual(differences,[],`cartridge ${ir} raw differences`);
    const before=detectSave(original),after=detectSave(exported);assert.equal(after.valid,true,after.reason);
    assert.deepEqual(after.trainer,before.trainer);assert.deepEqual(after.party,before.party);assert.deepEqual(after.storage,before.storage);
    assert.equal(withBytes(exported,(p,n)=>wasm._b1_diagnostic(p,n,ir)),1);
    assert.equal(createHash('sha256').update(wasm.HEAPU8.slice(wasm._b1_save(),wasm._b1_save()+wasm._b1_save_size())).digest('hex'),createHash('sha256').update(exported).digest('hex'));
  }
});
test('full emulator checkpoints restore deterministically and reject a damaged state without leaving it applied',()=>{
  assert.equal(wasm._b1_diagnostic(0,0,0),1);
  for(let i=0;i<8;i++)wasm._b1_step(1,123,77);
  const capture=()=>{const length=wasm._b1_state_capture();assert.ok(length>1024*1024);const ptr=wasm._b1_state_data();return wasm.HEAPU8.slice(ptr,ptr+length);};
  const checkpoint=capture(),marker=wasm._b1_word(0x1004),view=new DataView(checkpoint.buffer);
  assert.equal(String.fromCharCode(...checkpoint.subarray(0,4)),'MELN');
  assert.equal(view.getUint32(8,true),checkpoint.length);
  for(let i=0;i<12;i++)wasm._b1_step(3,40+i,70+i);
  assert.notEqual(wasm._b1_word(0x1004),marker);
  assert.equal(withBytes(checkpoint,(p,n)=>wasm._b1_state_load(p,n)),1);
  assert.equal(wasm._b1_word(0x1004),marker);
  const replay=()=>{for(let i=0;i<5;i++)wasm._b1_step(i%2?3:0,180-i,20+i);return capture();};
  const first=replay();assert.equal(withBytes(checkpoint,(p,n)=>wasm._b1_state_load(p,n)),1);
  const second=replay();assert.deepEqual(second,first,'same checkpoint and inputs produce identical full state');
  const damaged=checkpoint.slice();damaged.set([66,65,68,33],16);
  const before=wasm._b1_word(0x1004);
  assert.equal(withBytes(damaged,(p,n)=>wasm._b1_state_load(p,n)),0);
  assert.equal(wasm._b1_word(0x1004),before,'failed state load rolls back the active machine');
});
test('pacing holds normal speed on 120Hz presentation and retains slow-host deficits in speed diagnostics',()=>{
  const pacer=new Pacer();pacer.reset(0);const m=new Metrics(0);
  let steps=0;for(let now=0;now<10000;now+=1000/120){let n=0;while(pacer.due(now)&&n++<2){steps++;m.frame(FRAME_SECONDS,2,now);pacer.advance(FRAME_SECONDS,now);}}
  assert.ok(Math.abs(steps*FRAME_SECONDS-10)<.03);assert.ok(m.report(10000).speed<1.004);
  const slow=new Metrics(0);for(let i=0;i<100;i++)slow.frame(FRAME_SECONDS,40,(i+1)*40);
  assert.ok(slow.report(4000).speed<.43,'render rate cannot masquerade as emulator speed');
});
test('save queue preserves failed bytes, serializes revisions and retries without false success',async()=>{
  let fail=true;const committed=[],events=[];
  const q=new SaveQueue(async(bytes,rev)=>{if(fail)throw Error('quota');committed.push([bytes[0],rev]);},e=>events.push(e.state));
  const source=new Uint8Array([7]);await assert.rejects(q.enqueue(source,1),/quota/);source[0]=9;
  assert.equal(q.pending.bytes[0],7);assert.deepEqual(events,['writing','failed']);
  fail=false;await q.flush();assert.deepEqual(committed,[[7,1]]);assert.equal(events.at(-1),'persisted');
  let release;const gate=new Promise(r=>release=r),seen=[];
  const serial=new SaveQueue(async(b,r)=>{seen.push(r);if(r===1)await gate;});
  const a=serial.enqueue(new Uint8Array([1]),1),b=serial.enqueue(new Uint8Array([2]),2);release();await Promise.all([a,b]);assert.deepEqual(seen,[1,2]);
});
test('full-state queue preserves the detached emergency checkpoint through quota failure and retry',async()=>{
  let fail=true;const commits=[],events=[];
  const q=new StateQueue(async(bytes,metadata)=>{if(fail)throw Error('quota');commits.push([bytes[0],metadata.slot]);return {meta:{at:123,length:bytes.length}};},e=>events.push(e.state));
  const source=new Uint8Array([7,8]);await assert.rejects(q.enqueue(source,{slot:'quick'}),/quota/);source[0]=99;
  assert.equal(q.pending.bytes[0],7);assert.deepEqual(events,['writing','failed']);
  fail=false;await q.flush();assert.deepEqual(commits,[[7,'quick']]);assert.equal(events.at(-1),'persisted');
});
test('shipped binaries match recorded hashes and generated Reader parser closure remains exact',()=>{
  const build=JSON.parse(readFileSync(new URL('../vendor/build.json',import.meta.url)));
  assert.equal(build.coreRevision,'b86390e4428bf38ce4c1ce0e9ca446d6d25955e8');
  for(const [file,hash]of Object.entries(build.hashes))assert.equal(createHash('sha256').update(readFileSync(new URL('../vendor/'+file,import.meta.url))).digest('hex'),hash);
  const assets=JSON.parse(readFileSync(new URL('../offline-assets.json',import.meta.url)));
  for(const [file,hash]of Object.entries(assets.hashes)){const data=readFileSync(new URL('../'+file,import.meta.url));assert.equal(createHash('sha256').update(data).digest('hex'),hash,file);
    if(file.startsWith('vendor/reader/'))assert.equal(String(data),readFileSync(new URL('../../'+file.slice('vendor/reader/'.length),import.meta.url),'utf8').replaceAll('\r\n','\n'),file);}
});
