const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const baseline=require('./fixtures/gen4/soulsilver-baseline.json');
const {syntheticSave}=require('./fixtures/soulsilver.cjs');

test('SoulSilver parser matches captured pre-refactor trainer, party, all PC slots, Pokédex and Safari results',async()=>{
 const {detectSoulSilver}=await import('../js/saves/soulsilver.js');
 const {detectSave}=await import('../js/saves/index.js');
 for(const entry of baseline.cases){
  const {bytes,sealBlock}=syntheticSave(entry.pcSpecies);
  bytes[0x7e]=0x85;bytes[0x83]=0x81;bytes[0x81]|=2;
  bytes[0x12b8+4+3]=1;bytes[0x12b8+4+64+3]=1;sealBlock(0,0xF628);
  assert.deepEqual(JSON.parse(JSON.stringify(detectSoulSilver(bytes.buffer))),entry.result);
  assert.deepEqual(detectSave(bytes.buffer),detectSoulSilver(bytes.buffer));
 }
});

test('shared writer produces byte-identical SoulSilver exports and leaves its input intact',async()=>{
 const {detectSoulSilver}=await import('../js/saves/soulsilver.js');
 const {evolveSoulSilverPokemon,getAvailableEvolutions}=await import('../js/saves/soulsilver-evolution.js');
 for(const entry of baseline.cases.filter(e=>e.exportSha256)){
  const {bytes,sealBlock}=syntheticSave(entry.pcSpecies);
  bytes[0x7e]=0x85;bytes[0x83]=0x81;bytes[0x81]|=2;
  bytes[0x12b8+4+3]=1;bytes[0x12b8+4+64+3]=1;sealBlock(0,0xF628);
  const before=bytes.slice(),p=detectSoulSilver(bytes.buffer).storage.boxes[0].pokemon[0];
  const rule=getAvailableEvolutions(p).find(e=>e.method==='trade');
  const out=evolveSoulSilverPokemon(bytes,p,rule,0);
  assert.equal(createHash('sha256').update(out).digest('hex'),entry.exportSha256);
  assert.deepEqual(bytes,before);
  const loaded=detectSoulSilver(out.buffer);
  assert.equal(loaded.valid,true);assert.equal(loaded.storage.boxes[0].pokemon[0].speciesId,rule.to);
  assert.equal(loaded.storage.boxes[0].pokemon[0].checksumValid,true);
 }
});

test('shared dispatch rejects wrong-size and invalid saves without identifying from filenames',async()=>{
 const {detectSave}=await import('../js/saves/index.js');
 const {gameProfile,GAME_PROFILES}=await import('../js/saves/profiles.js');
 assert.equal(detectSave(new ArrayBuffer(17)).valid,false);
 assert.equal(detectSave(new ArrayBuffer(0x80000)).valid,false);
 assert.equal(gameProfile('unrecognized'),null);
 assert.ok(Object.isFrozen(GAME_PROFILES)&&Object.isFrozen(gameProfile('soulsilver')));
 assert.ok(Object.isFrozen(gameProfile('soulsilver').regionalDex));
});
