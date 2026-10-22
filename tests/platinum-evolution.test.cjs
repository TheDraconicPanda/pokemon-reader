const {test}=require('node:test');
const assert=require('node:assert/strict');
const {vectors,evolutionFixture,comparePokemon,dsv}=require('./fixtures/gen4/evolution.cjs');
const fs=require('node:fs');
const crypto=require('node:crypto');
const independentReport=require('../docs/platinum-evolution-independent.json');
const independentSamples=new Map(independentReport.observations.map(row=>[row.file,row]));
const api=Promise.all([import('../js/saves/index.js'),import('../js/saves/evolution-transaction.js'),import('../js/saves/gen4-evolution.js')]);

test('hand-specified vectors cover every one of the 47 sourced Platinum simulation rules',async()=>{
 const {PLATINUM_SIMULATED_EVOLUTIONS:rules}=await import('../js/saves/platinum-evolution-rules.js');
 assert.equal(rules.length,47);
 const key=r=>`${r.from}:${r.to}:${r.method}`;
 assert.deepEqual(rules.map(key).sort(),vectors.slice(0,47).map(key).sort());
});

test('all 47 evolution paths and language/edge cases match PKHeX party and PC expected attributes',async()=>{
 const [{detectSave},{evolveSavePokemon}]=await api;
 const {decryptGen4Record}=await import('../js/saves/gen4-pokemon.js');
 for(const vector of vectors.filter(v=>!v.blocked))for(const kind of ['party','storage']){
  const {bytes,offset,oracle}=await evolutionFixture(vector,kind);
  const source=bytes.slice(),decoded=detectSave(bytes);
  assert.equal(decoded.valid,true,vector.label);
  const pokemon=kind==='party'?decoded.party[0]:decoded.storage.boxes[0].pokemon[0];
  comparePokemon(pokemon,oracle.before,kind==='party');
  const output=evolveSavePokemon(bytes,pokemon,vector,{time:vector.time});
  assert.deepEqual(bytes,source,'Source bytes changed');
  assert.equal(crypto.createHash('sha256').update(output).digest('hex'),independentSamples.get(`${vector.label}.${kind}.sav`).sha256,'Output differs from the independently inspected save');
  const loaded=detectSave(output);assert.equal(loaded.valid,true,vector.label);
  const actual=kind==='party'?loaded.party[0]:loaded.storage.boxes[0].pokemon[0];
  comparePokemon(actual,oracle.after,kind==='party');
  const length=kind==='party'?236:136;
  assert.deepEqual(Buffer.from(decryptGen4Record(output.subarray(offset,offset+length),kind==='party')),Buffer.from(oracle.afterLogical,'base64').subarray(0,length),`${vector.label}: full logical PK4 differs from PKHeX`);
  assert.ok(loaded.save.pokedex.allCaughtSpecies.includes(vector.to));
  assert.ok(loaded.save.pokedex.allSeenSpecies.includes(vector.to));
  const allowed=new Set(Array.from({length:kind==='party'?236:136},(_,i)=>offset+i));
  for(const o of [0x40000+0xCF2C-2,0x40000+0xCF2C+0x121E4-2]){allowed.add(o);allowed.add(o+1);}
  const bit=(vector.to-1)>>3;for(const region of [0,64,128,192])allowed.add(0x40000+0x1328+4+region+bit);
  for(let i=0;i<bytes.length;i++)if(output[i]!==bytes[i])assert.ok(allowed.has(i),`${vector.label}: unrelated byte ${i.toString(16)} changed`);
 }
});

test('eggs, Everstone, missing items/moves/party members, insufficient conditions and level 100 are rejected',async()=>{
 const [{detectSave},{evolveSavePokemon}]=await api;
 for(const vector of vectors.filter(v=>v.blocked)){
  const {bytes}=await evolutionFixture(vector),before=bytes.slice(),source=detectSave(bytes);
  assert.throws(()=>evolveSavePokemon(bytes,source.party[0],vector,{time:vector.time}),undefined,vector.label);
  assert.deepEqual(bytes,before);
 }
});

test('unknown game time and language, stale identity/moves, offsets and corrupt source fail transactionally',async()=>{
 const [{detectSave},{evolveSavePokemon}]=await api;
 const night=vectors.find(v=>v.from===207&&!v.blocked),ordinary=vectors[0];
 let fixture=await evolutionFixture(night),source=detectSave(fixture.bytes);
 assert.throws(()=>evolveSavePokemon(fixture.bytes,source.party[0],night),/Choose night/);
 fixture=await evolutionFixture(ordinary);source=detectSave(fixture.bytes);
 for(const patch of [{personality:1},{heldItemId:229},{saveOffset:0},{recordKind:'unknown'},{moves:source.party[0].moves.map(m=>({...m,pp:99}))}])assert.throws(()=>evolveSavePokemon(fixture.bytes,{...source.party[0],...patch},ordinary));
 const {crc16Ccitt}=await import('../js/saves/gen4-binary.js');
 fixture.bytes[0x40000+0x81]=0;new DataView(fixture.bytes.buffer).setUint16(0x40000+0xCF2C-2,crc16Ccitt(fixture.bytes.subarray(0x40000,0x40000+0xCF2C-20)),true);
 source=detectSave(fixture.bytes);assert.throws(()=>evolveSavePokemon(fixture.bytes,source.party[0],ordinary),/language/);
 fixture.bytes[0x40000+0xA0+8]^=1;
 assert.throws(()=>evolveSavePokemon(fixture.bytes,source.party[0],ordinary));
});

test('DeSmuME containers retain every footer byte and original extension while both games reload exported bytes',async()=>{
 const [{detectSave},{evolveSavePokemon}]=await api;
 const {evolutionExportName}=await import('../js/saves/gen4-container.js');
 const {syntheticSave}=require('./fixtures/soulsilver.cjs');
 const pt=await evolutionFixture(vectors[0]);const synthetic=syntheticSave(64);synthetic.bytes[0x7D]=2;synthetic.sealBlock(0,0xF628);const ss=synthetic.bytes;
 for(const [raw,kind]of [[pt.bytes,'party'],[ss,'storage']]){
  const input=dsv(raw),before=input.slice(),loaded=detectSave(input);
  assert.equal(loaded.valid,true);assert.equal(loaded.container.format,'desmume');
  const pokemon=kind==='party'?loaded.party[0]:loaded.storage.boxes[0].pokemon[0];
  const output=evolveSavePokemon(input,pokemon,{to:65,method:'trade'});
  assert.equal(output.length,input.length);assert.deepEqual(output.subarray(0x80000),input.subarray(0x80000));
  assert.deepEqual(input,before);assert.equal(detectSave(output).valid,true);
  const invalid=input.slice();invalid[invalid.length-1]^=1;assert.equal(detectSave(invalid).valid,false);
 }
 assert.equal(evolutionExportName('Platinum.DSV'),'Platinum.evolved.DSV');
 assert.equal(evolutionExportName('SoulSilver.sav'),'SoulSilver.evolved.sav');
 assert.equal(evolutionExportName('test.evolved.dsv'),'test.evolved-2.dsv');
 assert.equal(evolutionExportName('test.evolved-2.dsv'),'test.evolved-3.dsv');
});

test('all 3451 native default names decode to PKHeX expectations across seven Gen IV languages',async()=>{
 const {GEN4_DEFAULT_NAMES:names}=await import('../js/data/gen4-default-names.js');
 const {decodeTrainerName}=await import('../js/saves/gen4-pokemon.js');
 const expected=require('./fixtures/gen4/default-names.expected.json');let count=0;
 for(const [language,entries]of Object.entries(names))for(const [id,codes]of Object.entries(entries)){
  const bytes=new Uint8Array(codes.length*2),view=new DataView(bytes.buffer);codes.forEach((c,i)=>view.setUint16(i*2,c,true));
  assert.equal(decodeTrainerName(bytes,0,bytes.length),expected[language][id],`${language}/${id}`);count++;
 }
 assert.equal(count,3451);
});

test('SoulSilver uses the same native attribute transaction and preserves unrelated source records',async()=>{
 const [{detectSave},{evolveSavePokemon}]=await api;
 const {syntheticSave}=require('./fixtures/soulsilver.cjs');
 const {decryptGen4Record}=await import('../js/saves/gen4-pokemon.js');
 const {oracle}=await evolutionFixture(vectors.find(v=>v.from===112&&!v.blocked));
 const source=syntheticSave(112);source.bytes[0x7D]=2;source.bytes.set(Buffer.from(oracle.stored,'base64'),0xF700);source.sealBlock(0,0xF628);source.sealBlock(0xF700,0x12310);
 const before=source.bytes.slice(),loaded=detectSave(source.bytes),p=loaded.storage.boxes[0].pokemon[0];
 const output=evolveSavePokemon(source.bytes,p,{to:464,method:'trade-item'});
 assert.deepEqual(source.bytes,before);
 assert.deepEqual(Buffer.from(decryptGen4Record(output.subarray(0xF700,0xF700+136),false)),Buffer.from(oracle.afterLogical,'base64').subarray(0,136));
 const result=detectSave(output);assert.equal(result.valid,true);assert.equal(result.storage.boxes[0].pokemon[0].abilityId,116);
 assert.equal(result.storage.boxes[0].pokemon[0].nickname,'RHYPERIOR');assert.ok(result.save.pokedex.allCaughtSpecies.includes(464));
 assert.deepEqual(result.party,loaded.party);
});

test('the shared species growth mapping used for boxed evolution agrees with all 493 Platinum primary records',async()=>{
 const {PLATINUM_READER}=await import('../js/data/games/platinum/reader-reference.js');
 const {SOULSILVER_GROWTH_RATES}=await import('../js/data/games/soulsilver/growth-rates.js');
 for(let id=1;id<=493;id++)assert.equal(SOULSILVER_GROWTH_RATES.species[id],PLATINUM_READER.species[id].growthRate);
});

test('independent whole-save evidence covers every export and the current writer inputs',async()=>{
 const {writerFingerprints}=await import('../scripts/audit-platinum-evolutions.mjs');
 assert.equal(independentReport.passed,true);assert.equal(independentReport.verifiedExports,114);
 assert.equal(independentReport.referenceRevision,'a9ff30657073b26825929a65ef58e61f99a1fe6f');
 assert.equal(independentReport.realGamePlaythrough,false);
 assert.ok(independentReport.observations.every(row=>row.checksumsValid&&row.seen&&row.caught));
 assert.deepEqual(await writerFingerprints(),independentReport.writerInputSha256);
});
