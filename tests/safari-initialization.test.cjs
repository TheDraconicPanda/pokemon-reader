const {test}=require('node:test');
const assert=require('node:assert/strict');
const {safariSave}=require('./fixtures/safari/save.cjs');
const {fixture}=require('./fixtures/reader.cjs');
const api=import('../js/safari-scenario.js');
const parser=import('../js/saves/soulsilver.js');
const adventures=import('../js/adventures.js');
async function loaded(partition=0){const f=safariSave({partition});const originalBytes=f.bytes.slice();const result=(await parser).detectSoulSilver(f.bytes.buffer);assert.deepEqual(f.bytes,originalBytes);const snapshot=(await adventures).createSnapshot(result,'synthetic.sav');return {f,result,profile:{id:'fixture',revision:1,gameId:'soulsilver',snapshot}};}

test('literal format fixtures decode local Safari areas, object IDs/categories, ages and flags from the validated active partition without writes',async()=>{
 for(const partition of [0,1]){
  const {f,result}=await loaded(partition),original=f.bytes.slice(),s=result.save.safari;
  assert.equal(result.valid,true);assert.equal(result.activePartition,partition);assert.deepEqual(s.layout,f.layout);assert.deepEqual(s.areaAges,f.ages);
  assert.equal(s.baobaStage,6);assert.equal(s.blockLevel,4);assert.equal(s.activeSet,0);assert.equal(s.pendingDays,0);
  assert.deepEqual(s.areaObjects[0],[{id:0,x:2,y:3,z:4},{id:6,x:5,y:6,z:7},{id:12,x:8,y:9,z:10}]);
  assert.deepEqual(s.areaBlocks[0],{plains:1,forest:0,peak:1,water:0,none:1});
  assert.deepEqual(f.bytes,original);
 }
});
test('Safari decoding never bypasses the existing invalid-save checksum gate',async()=>{
 const {detectSoulSilver}=await parser;const {bytes}=safariSave();bytes[0xC13C]^=1;
 const result=detectSoulSilver(bytes.buffer);assert.equal(result.valid,false);assert.equal(result.save,null);
});
test('corrupt or linked Safari fields fall back independently while other Reader data remains valid',async()=>{
 const {detectSoulSilver}=await parser;
 for(const [offset,value,field]of [[0xC13C,255,'layout'],[0xC13D,31,'areaBlocks'],[0xC13E,99,'areaBlocks'],[0xE92,255,'baobaStage'],[0xC735,63,'blockLevel']]){
  const {bytes,sealBlock}=safariSave();bytes[offset]=value;sealBlock(0,0xF628);const result=detectSoulSilver(bytes.buffer),s=result.save.safari;
  assert.equal(result.valid,true);if(field==='areaBlocks'){assert.equal(s.areaBlocks[0],null);assert.deepEqual(s.areaBlocks[1],{plains:0,forest:0,peak:0,water:0,none:0});}else assert.equal(s[field],null);
  assert.equal(result.party[0].speciesId,133);
 }
 const {bytes,sealBlock}=safariSave();bytes[0xC735]=0x44;sealBlock(0,0xF628);const linked=detectSoulSilver(bytes.buffer).save.safari;
 assert.equal(linked.activeSet,1);assert.equal(linked.layout,null);assert.equal(linked.areaAges,null);assert.ok(linked.areaBlocks.every(b=>b===null));assert.equal(linked.baobaStage,6);assert.equal(linked.blockLevel,4);
});
test('snapshot restoration and canonical persistence preserve supported Safari fields but strip unexpected data',async()=>{
 const {profile}=await loaded();const {createSnapshot,snapshotResult}=await adventures;
 profile.snapshot.safari.extraBinary=new Uint8Array(30);profile.snapshot.safari.areaObjects[0][0].offset=0xC13E;
 const restored=snapshotResult(profile.snapshot);const next=createSnapshot(restored,'synthetic.sav');
 assert.deepEqual(next.safari.layout,profile.snapshot.safari.layout);assert.equal(next.safari.extraBinary,undefined);assert.equal(next.safari.areaObjects[0][0].offset,undefined);
 assert.deepEqual(next.safari.areaBlocks,profile.snapshot.safari.areaBlocks);
 const old=createSnapshot(fixture(),'old.sav');assert.equal(old.safari.supported,false);assert.equal(snapshotResult(old).save.safari.supported,false);
});
test('loaded initialization never invents missing progress, objects, access, time or clock state',async()=>{
 const {createSafariScenario}=await api;const {profile}=await loaded();const s=createSafariScenario(profile);
 assert.deepEqual(Array.from({length:6},(_,i)=>s.original.values[`layout.${i}`]),profile.snapshot.safari.layout);
 assert.equal(s.current.values['age.7'],110);assert.equal(s.current.provenance['age.7'],'save');assert.equal(s.current.values['blocks.0.peak'],1);
 for(const key of ['open','surf','oldrod','goodrod','superrod','clockPenalty','time']){assert.equal(s.current.values[key],null);assert.equal(s.current.provenance[key],'unavailable');}
 assert.equal(s.current.values.customizerUnlocked,true);assert.equal(s.current.values.trainerId,456*65536+123);
 const older=structuredClone(profile);older.snapshot.safari={supported:false};const partial=createSafariScenario(older);
 assert.equal(partial.current.values['layout.0'],null);assert.equal(partial.current.values['age.7'],null);assert.equal(partial.current.values['blocks.0.peak'],null);
 assert.equal(partial.current.values.nationalDex,true);assert.equal(partial.current.provenance.nationalDex,'save');
});
test('save-free defaults are labeled clean, configurable and independent of saved progress',async()=>{
 const {createSafariScenario,updateSafariScenario}=await api;const s=createSafariScenario();
 assert.equal(s.mode,'reference');assert.equal(s.current.values['age.7'],0);assert.equal(s.current.values['blocks.0.peak'],0);assert.equal(s.current.values.blockLevel,0);assert.equal(s.current.provenance.blockLevel,'default');assert.equal(s.current.values.customizerUnlocked,false);
 const manual=updateSafariScenario(s,'blockLevel',4,{starting:true});assert.equal(manual.current.values.blockLevel,4);assert.equal(manual.current.provenance.blockLevel,'manual');assert.equal(s.current.values.blockLevel,0);
});
test('manual corrections, hypothetical changes and both resets preserve original state and save bytes',async()=>{
 const {createSafariScenario,updateSafariScenario,resetSafariScenario,safariScenarioChanges,safariEngineScenario}=await api;
 const {profile,f}=await loaded(),before=structuredClone(profile),originalBytes=f.bytes.slice();let s=createSafariScenario(profile);
 s=updateSafariScenario(s,'open',true,{starting:true});s=updateSafariScenario(s,'time','day',{starting:true});
 s=updateSafariScenario(s,'age.7',120);
 assert.equal(s.current.provenance['age.7'],'hypothetical');assert.equal(s.starting.values['age.7'],110);assert.equal(s.original.values['age.7'],110);
 assert.equal(safariScenarioChanges(s).length,1);assert.equal(safariEngineScenario(s,3).days,120);
 s=resetSafariScenario(s);assert.equal(s.current.values['age.7'],110);assert.equal(s.current.values.open,true);assert.equal(s.current.provenance.open,'manual');
 s=resetSafariScenario(s,{original:true});assert.equal(s.current.values.open,null);assert.equal(s.current.provenance.open,'unavailable');
 assert.deepEqual(profile,before);assert.deepEqual(f.bytes,originalBytes);assert.ok(Object.isFrozen(s.original.values));
});
test('partial manual completion and hypothetical layout changes preserve area identity and object reset rules',async()=>{
 const {createSafariScenario,updateSafariScenario}=await api;
 const {profile}=await loaded();let s=createSafariScenario(profile);
 s=updateSafariScenario(s,'layout.0',4);assert.equal(s.current.values['layout.1'],11);assert.equal(s.current.values['blocks.1.peak'],1);assert.equal(s.current.values['blocks.0.peak'],0);assert.equal(s.current.values['age.11'],255);
 s=updateSafariScenario(s,'layout.1',10);assert.equal(s.current.values['blocks.1.peak'],0);assert.equal(s.original.values['blocks.0.peak'],1);
 assert.throws(()=>updateSafariScenario(s,'blocks.1.peak',31));assert.throws(()=>updateSafariScenario(s,'blocks.1.peak',-1));
 s=updateSafariScenario(s,'blocks.1.peak',30);assert.throws(()=>updateSafariScenario(s,'blocks.1.none',1),/30/);
 assert.throws(()=>updateSafariScenario(createSafariScenario(),'layout.0',11),/Customizer/);
 const partial=structuredClone(profile);partial.snapshot.safari.areaObjects[0]=null;
 const fixed=updateSafariScenario(createSafariScenario(partial),'blocks.0.peak',3,{starting:true});assert.equal(fixed.current.values['blocks.0.peak'],3);assert.equal(fixed.current.values['blocks.0.water'],null);
});
test('new saves, same-adventure revisions, different profiles and reference mode have distinct initialization contexts',async()=>{
 const {safariContextKey,createSafariScenario}=await api;const {profile}=await loaded();
 assert.notEqual(safariContextKey(profile),safariContextKey({...profile,revision:2}));assert.notEqual(safariContextKey(profile),safariContextKey({...profile,id:'other'}));assert.notEqual(safariContextKey(profile),safariContextKey(null));
 assert.equal(createSafariScenario({...profile,revision:2}).current.provenance['age.7'],'save');
 assert.throws(()=>createSafariScenario({...profile,gameId:'heartgold'}));
});
test('pending saved days remain separate and selecting the same proposed area never clears its objects',async()=>{
 const {createSafariScenario,updateSafariScenario}=await api;const {profile}=await loaded();profile.snapshot.safari.pendingDays=7;
 const s=createSafariScenario(profile);assert.equal(s.current.values['age.7'],110);assert.equal(s.pendingDays,7);assert.match(s.notes.join(' '),/pending/);
 const same=updateSafariScenario(s,'layout.0',11);assert.equal(same.current.values['blocks.0.peak'],1);assert.deepEqual(same.current.values,s.current.values);
});
test('known partial quantities cannot already exceed the placement cap while other fields are unavailable',async()=>{
 const {createSafariScenario,updateSafariScenario}=await api;const {profile}=await loaded();profile.snapshot.safari.areaObjects[0]=null;
 let s=createSafariScenario(profile);s=updateSafariScenario(s,'blocks.0.peak',30,{starting:true});assert.throws(()=>updateSafariScenario(s,'blocks.0.plains',1,{starting:true}),/30/);
});
