const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {syntheticSave}=require('./fixtures/soulsilver.cjs');
const {vectors,evolutionFixture,dsv}=require('./fixtures/gen4/evolution.cjs');
const api=Promise.all([import('../js/saves/trade-transaction.js'),import('../js/saves/index.js'),import('../js/saves/gen4-pokemon.js'),import('../js/saves/gen4-record-writer.js'),import('../js/saves/gen4-binary.js'),import('../js/saves/profiles.js')]);
const {fixture,patch}=require('./fixtures/gen4/trade.cjs');

test('all sixteen trade evolutions exchange in both directions, consume only required items and preserve originals',async()=>{
 const [{tradeSaves}, {detectSave}]=await api;
 const selected=vectors.filter(v=>!v.blocked && ['trade','trade-item'].includes(v.method));
 assert.equal(new Set(selected.map(v=>v.from)).size,16);
 for(const vector of selected){
  const {ss,pt}=await fixture(vector),beforeA=ss.slice(),beforeB=pt.slice();
  const result=tradeSaves(ss,pt,1,1,{movesA:['skip','skip'],movesB:['skip','skip']});
  assert.deepEqual(ss,beforeA);assert.deepEqual(pt,beforeB);
  for(const bytes of [result.a,result.b]){
   const loaded=detectSave(bytes);assert.equal(loaded.valid,true,vector.label);
   assert.equal(loaded.party[0].speciesId,vector.to,vector.label);
   assert.equal(loaded.party[0].heldItemId,vector.method==='trade-item'?0:detectSave(ss).party[0].heldItemId);
   assert.equal(loaded.party[0].friendship,70);
   assert.ok(loaded.save.pokedex.allCaughtSpecies.includes(vector.from));
   assert.ok(loaded.save.pokedex.allCaughtSpecies.includes(vector.to));
  }
 }
});

test('ordinary exchange replaces both originals; unrelated party, PC, backups and container bytes stay identical',async()=>{
 const [{tradeSaves},{detectSave}]=await api;
 const {ss,pt}=await fixture();
 await patch(ss,1,r=>{r[8]=25;r[9]=0;r[21]=9;r[10]=0;r[11]=0;});
 const originals=[ss,pt],result=tradeSaves(dsv(ss),dsv(pt),1,1,{movesA:['skip'],movesB:['skip']});
 assert.equal(detectSave(result.a).party[0].speciesId,65);
 assert.equal(detectSave(result.b).party[0].speciesId,25);
 for(const [i,output] of [result.a,result.b].entries()){
  const source=detectSave(originals[i]),profile=(await api)[5].gameProfile(source.gameId||'soulsilver');
  const base=source.activePartition*profile.partitionSize,offset=source.party[0].saveOffset;
  const dex=base+profile.pokedexOffset;
  const allowed=o=>(o>=offset&&o<offset+236)||(o>=dex&&o<dex+(i===0?0x340:0x324))||(o>=base+profile.generalSize-2&&o<base+profile.generalSize)||(i===0&&o>=0x98+6*236&&o<0x98+6*236+5);
  for(let o=0;o<0x80000;o++)if(output[o]!==originals[i][o])assert.ok(allowed(o),`unexpected change ${o.toString(16)}`);
  assert.deepEqual(output.subarray(0x80000),dsv(originals[i]).subarray(0x80000));
 }
});

test('Everstone blocks Machoke but not Kadabra; absent held items prevent evolution without preventing trade',async()=>{
 const [{tradeSaves},{detectSave}]=await api;
 for(const [species,item,target] of [[67,229,67],[64,229,65],[95,0,95]]){
  const {ss,pt}=await fixture();await patch(ss,1,r=>{new DataView(r.buffer).setUint16(8,species,true);r[21]=species===67?62:species===95?69:28;new DataView(r.buffer).setUint16(10,item,true);});
  const result=tradeSaves(ss,pt,1,1,{movesA:['skip'],movesB:['skip']});
  assert.equal(detectSave(result.b).party[0].speciesId,target);assert.equal(detectSave(result.b).party[0].heldItemId,item);
 }
});

test('Eggs preserve hatch progress and origin, receive trade met date, never evolve or register',async()=>{
 const [{tradeSaves},{detectSave},{decryptGen4Record}]=await api;
 const {ss,pt}=await fixture();
 await patch(ss,1,r=>{r[0x3B]|=0x40;r[0x14]=12;});
 const eggBefore=detectSave(ss).party[0];
 assert.throws(()=>tradeSaves(ss,pt,1,1),/console date/);
 assert.throws(()=>tradeSaves(ss,pt,1,1,{dates:{b:'2026-02-30'}}),/console date/);
 const result=tradeSaves(ss,pt,1,1,{dates:{b:'2026-11-09'},movesA:['skip']});
 const loaded=detectSave(result.b),egg=loaded.party[0];
 assert.equal(egg.isEgg,true);assert.equal(egg.speciesId,eggBefore.speciesId);assert.equal(egg.friendship,12);
 assert.equal(egg.metLocationId,2002);assert.deepEqual(egg.metDate,{year:2026,month:11,day:9});
});

test('reject unsupported pairs, unavailable room, single/non-Egg-only choice, corrupt, special forms, and Griseous Orb',async()=>{
 const [{tradeSaves,loadTradeSave,tradeEligibility}, {detectSave},,, {writeUint16,crc16Ccitt}]=await api;
 const {ss,pt}=await fixture();assert.throws(()=>tradeSaves(pt,pt,1,1),/one SoulSilver/);
 assert.throws(()=>tradeSaves(ss,pt,9,1),/Choose/);
 for(const transform of [r=>{r[8]=172;r[9]=0;r[0x40]=8;},r=>{r[10]=112;r[11]=0;},r=>{new DataView(r.buffer).setUint16(8,479,true);r[0x40]=8;}]){
  const bytes=ss.slice();await patch(bytes,1,transform);assert.throws(()=>loadTradeSave(bytes));
 }
 let bytes=ss.slice();bytes[0x12B8+0x336]=0;writeUint16(bytes,0xF626,crc16Ccitt(bytes.subarray(0,0xF618)));assert.throws(()=>loadTradeSave(bytes),/Pokédex/);
 bytes=ss.slice();await patch(bytes,2,r=>{r[0x3B]|=0x40;});assert.match(tradeEligibility(loadTradeSave(bytes),1),/non-Egg/);
 bytes=ss.slice();bytes[0x98+8]^=1;assert.throws(()=>loadTradeSave(bytes));
 bytes=ss.slice();await patch(bytes,1,r=>{r[21]=123;});assert.match(tradeEligibility(loadTradeSave(bytes),1),/invalid ability/);
 assert.equal(detectSave(ss).valid,true);
});

test('trade-only triggers never use location, friendship or ordinary level evolutions',async()=>{
 const [{tradeSaves},{detectSave}]=await api;
 for(const species of [133,82,42]){
  const {ss,pt}=await fixture();await patch(ss,1,r=>{new DataView(r.buffer).setUint16(8,species,true);r[21]=species===133?50:species===82?42:39;r[0x14]=255;});
  assert.equal(detectSave(tradeSaves(ss,pt,1,1,{movesA:['skip']}).b).party[0].speciesId,species);
 }
});

test('evolution moves use receiving learnset, fill empty slots, require a choice when full, and protect game-specific HMs',async()=>{
 const [{tradeSaves,previewTrade},{detectSave}]=await api;
 const vector=vectors.find(v=>v.from===95&&!v.blocked);
 const {ss,pt}=await fixture(vector);
 // Steelix learns Crunch at level 46 in both games.
 await patch(ss,1,r=>{r[0x8C]=46;[15,250,432,33].forEach((id,i)=>{new DataView(r.buffer).setUint16(0x28+2*i,id,true);r[0x30+i]=1;r[0x34+i]=0;});});
 const preview=previewTrade(ss,pt,1,1);assert.deepEqual(preview.toB.prompts,[242]);
 assert.throws(()=>tradeSaves(ss,pt,1,1),/Choose a move/);
 assert.throws(()=>tradeSaves(ss,pt,1,1,{movesB:[0]}),/HM move/);
 assert.throws(()=>tradeSaves(ss,pt,1,1,{movesB:[2]}),/HM move/);
 const learned=detectSave(tradeSaves(ss,pt,1,1,{movesB:[1]}).b).party[0];
 assert.equal(learned.moves[1].id,242);assert.equal(learned.moves[1].ppUps,0);
 await patch(ss,1,r=>{new DataView(r.buffer).setUint16(0x28+2*3,0,true);r[0x33]=0;});
 assert.equal(detectSave(tradeSaves(ss,pt,1,1).b).party[0].moves[3].id,242);
});

test('Korean language boundary and unholdable key items are enforced without altering either save',async()=>{
 const [{tradeSaves,tradeEligibility,loadTradeSave},,,, {writeUint16,crc16Ccitt}]=await api;
 const {ss,pt}=await fixture();ss[0x7D]=8;writeUint16(ss,0xF626,crc16Ccitt(ss.subarray(0,0xF618)));
 assert.throws(()=>tradeSaves(ss,pt,1,1),/Korean/);
 const ordinary=(await fixture()).ss;await patch(ordinary,1,r=>{new DataView(r.buffer).setUint16(10,450,true);});
 assert.match(tradeEligibility(loadTradeSave(ordinary),1),/held item/);
});

test('native Dex registration covers language, genders, Spinda, Unown and packed form histories without clearing existing entries',async()=>{
 const {registerTradePokemon}=await import('../js/saves/trade-pokedex.js');
 const {readUint32}=await import('../js/saves/gen4-binary.js');
 for(const hgss of [false,true]){
  const bytes=new Uint8Array(0x340);bytes.fill(255,0x108,0x144);bytes.fill(255,hgss?0x338:0x31C,hgss?0x340:0x324);
  bytes[0x43]=255;bytes[0x83]=255;
  const mon={speciesId:201,personality:0x12345678,genderId:2,formId:27,languageId:7};
  registerTradePokemon(bytes,0,mon,hgss);assert.equal(bytes[0x10C],27);if(hgss)assert.equal(bytes[0x128],27);
  assert.ok(bytes[(hgss?0x144:0x128)+201]&32);
  registerTradePokemon(bytes,0,{...mon,speciesId:327,formId:0},hgss);assert.equal(readUint32(bytes,0x104),mon.personality);
  registerTradePokemon(bytes,0,{...mon,speciesId:386,formId:3},hgss);assert.equal(bytes[0x43]&15,3);
  registerTradePokemon(bytes,0,{...mon,speciesId:413,formId:2},hgss);assert.equal(bytes[0x10B]&3,2);
  registerTradePokemon(bytes,0,{...mon,speciesId:422,formId:1},hgss);assert.equal(bytes[0x108]&3,3);
  registerTradePokemon(bytes,0,{...mon,speciesId:422,formId:0},hgss);assert.equal(bytes[0x108]&3,1);
 }
});

test('reversed game orientation and different party slots retain incoming identity and remove each active outgoing record',async()=>{
 const [{tradeSaves},{detectSave},{decryptGen4Record}]=await api;
 const {ss,pt}=await fixture();
 await patch(ss,1,r=>{new DataView(r.buffer).setUint32(0,0xA1B2C3D4,true);new DataView(r.buffer).setUint16(8,25,true);r[21]=9;new DataView(r.buffer).setUint16(10,234,true);});
 const before=detectSave(ss).party[0],sent=decryptGen4Record(ss.subarray(before.saveOffset,before.saveOffset+236),true);
 const output=tradeSaves(pt,ss,2,1),got=detectSave(output.a).party[1];
 assert.equal(got.personality,0xA1B2C3D4);assert.equal(got.speciesId,25);assert.equal(got.heldItemId,234);
 assert.equal(detectSave(output.b).party[0].speciesId,133);
 const after=decryptGen4Record(output.a.subarray(got.saveOffset,got.saveOffset+236),true);
 const allowed=new Set([6,7,20,64,141,...Array.from({length:24},(_,i)=>212+i)]);
 for(let i=0;i<236;i++)if(!allowed.has(i))assert.equal(after[i],sent[i],`preserved byte ${i.toString(16)}`);
 assert.deepEqual(detectSave(output.a).party[0],detectSave(pt).party[0]);
});

test('level 100 still triggers a trade evolution and consumes its held item',async()=>{
 const [{tradeSaves},{detectSave}]=await api;
 const {ss,pt}=await fixture(vectors.find(v=>v.from===95&&!v.blocked));await patch(ss,1,r=>{r[0x8C]=100;});
 const mon=detectSave(tradeSaves(ss,pt,1,1).b).party[0];assert.equal(mon.speciesId,208);assert.equal(mon.level,100);assert.equal(mon.heldItemId,0);
});
