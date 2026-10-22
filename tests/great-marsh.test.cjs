const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const fixture=require('./fixtures/gen4/great-marsh.json');
const api=import('../js/great-marsh-engine.js');
test('Great Marsh daily selection matches independently transcribed pools and six-area fixed vectors, including unsigned high bits',async()=>{
 const {greatMarshPool,greatMarshDaily}=await api;
 for(const [national,key]of [[false,'before'],[true,'national']]){
  const pool=greatMarshPool(national);assert.equal(pool.reduce((n,r)=>n+r.indices.length,0),32);assert.equal(pool.reduce((n,r)=>n+r.dailyProbability,0),1);
  for(const r of pool)for(const i of r.indices)assert.equal(fixture[key][i],r.speciesId);
  for(const v of fixture.vectors){const rows=greatMarshDaily(v.seed,national);assert.deepEqual(rows.map(r=>r.index),v.indexes);assert.deepEqual(rows.map(r=>r.speciesId),v[key]);}
  assert.deepEqual(greatMarshDaily(0xFFFFFFFF,national),greatMarshDaily(0x3FFFFFFF,national));
  for(let index=0;index<32;index++)for(let area=0;area<6;area++)assert.equal(greatMarshDaily(index*32**area,national)[area].speciesId,fixture[key][index]);
 }
 for(const seed of [null,-1,0x100000000,NaN,1.5,'0'])assert.equal(greatMarshDaily(seed,false),null);
 assert.equal(greatMarshDaily(0,null),null);assert.deepEqual(greatMarshPool(null),[]);
});
test('Great Marsh tables total 100% when known, retain unknown 10% grass slots, and use actual time, water and rod distributions',async()=>{
 const {greatMarshTable:table}=await api;
 for(let area=1;area<=6;area++)for(const time of ['morning','day','night'])for(const method of ['walking','surfing','old_rod','good_rod','super_rod']){
  const input={area,time,method,dailySeed:0,nationalDex:true},before=JSON.stringify(input),r=table(input);
  assert.equal(JSON.stringify(input),before);assert.ok(['complete','no-encounters'].includes(r.status));assert.equal(r.rows.reduce((n,v)=>n+v.percent,0),r.status==='complete'?100:0);
  assert.ok(r.rows.every(v=>v.speciesId>=1&&v.speciesId<=493&&v.minLevel>=1&&v.maxLevel<=100));
  if(method!=='walking')assert.deepEqual(table({...input,dailySeed:0x3FFFFFFF,nationalDex:false}),r);
 }
 const partial=table({area:1});assert.equal(partial.status,'partial');assert.equal(partial.unknownPercent,10);assert.equal(partial.rows.reduce((n,r)=>n+r.percent,0),90);
 const day=table({area:1,nationalDex:false,dailySeed:0}),night=table({area:1,time:'night',nationalDex:false,dailySeed:0});
 assert.equal(day.rows.filter(r=>r.speciesId===194).reduce((n,r)=>n+r.percent,0),40,'Daily Wooper also occupies ordinary slots');
 assert.equal(day.rows.filter(r=>r.speciesId===357).reduce((n,r)=>n+r.percent,0),20);
 assert.equal(night.rows.filter(r=>r.speciesId===164).reduce((n,r)=>n+r.percent,0),20);
 assert.equal(table({area:1,nationalDex:true,dailySeed:0}).rows.filter(r=>r.speciesId===454).reduce((n,r)=>n+r.percent,0),10);
 assert.throws(()=>table({area:7}),/area/);assert.throws(()=>table({area:1,method:'headbutt'}),/Unsupported/);
 assert.throws(()=>table({area:1,nationalDex:false,dailySpeciesId:454}),/pool/);
});
test('Great Marsh decoding uses the selected valid Platinum copy and persists only canonical read-only state',async()=>{
 const {detectSave}=await import('../js/saves/index.js');const {crc16Ccitt}=await import('../js/saves/gen4-binary.js');const {createSnapshot,snapshotResult,validateSnapshot}=await import('../js/adventures.js');
 const bytes=new Uint8Array(fs.readFileSync('tests/fixtures/gen4/platinum/postgame.sav')),view=new DataView(bytes.buffer);
 for(const [copy,seed]of [[0,0x12345678],[1,0xFEDCBA98]]){const start=copy*0x40000;view.setUint32(start+0x7F24,seed,true);view.setUint16(start+0xCF2C-2,crc16Ccitt(bytes.subarray(start,start+0xCF2C-20)),true);}
 const before=Buffer.from(bytes),result=detectSave(bytes);assert.equal(result.greatMarsh.dailySeed,0xFEDCBA98);
 assert.deepEqual(Buffer.from(bytes),before);const snapshot=createSnapshot(result,'test.sav');assert.deepEqual(snapshotResult(snapshot).greatMarsh,result.greatMarsh);
 assert.deepEqual(Object.keys(snapshot.greatMarsh).sort(),['dailySeed','nationalDex','schemaVersion','status']);
 const bad=structuredClone(snapshot);bad.gameId='soulsilver';assert.throws(()=>validateSnapshot(bad));
 for(const seed of [-1,0x100000000,'1']){const bad=structuredClone(snapshot);bad.greatMarsh.dailySeed=seed;assert.throws(()=>validateSnapshot(bad),/Great Marsh/);}
 const inconsistent=structuredClone(snapshot);inconsistent.greatMarsh.nationalDex=false;assert.throws(()=>validateSnapshot(inconsistent),/Great Marsh/);
 bytes[0x40000+0x7F24]^=1;const fallback=detectSave(bytes);assert.equal(fallback.valid,true);assert.equal(fallback.activePartition,0);assert.equal(fallback.greatMarsh.dailySeed,0x12345678);
});
