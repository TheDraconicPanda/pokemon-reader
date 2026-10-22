const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const dir=path.join(__dirname,'fixtures/gen4/platinum');
const bytes=name=>new Uint8Array(fs.readFileSync(path.join(dir,`${name}.sav`)));
const expected=name=>JSON.parse(fs.readFileSync(path.join(dir,`${name}.expected.json`)));
function comparePokemon(actual,reference,party){
 const keys=Object.keys(reference).filter(k=>party||!['level','currentHp','maxHp','status','stats'].includes(k));
 const result=Object.fromEntries(keys.map(k=>[k,k==='formId'?(actual[k]??0):actual[k]]));
 assert.deepEqual(result,Object.fromEntries(keys.map(k=>[k,reference[k]])));
}

test('three PKHeX-generated Platinum fixtures match independent trainer, party and PC expected values',async()=>{
 const {detectSave}=await import('../js/saves/index.js');
 const {createSnapshot,snapshotResult}=await import('../js/adventures.js');
 for(const name of ['early','middle','postgame']){
  const result=detectSave(bytes(name)),reference=expected(name);
  assert.equal(result.valid,true,result.reason);assert.equal(result.gameId,'platinum');
  assert.equal(result.activePartition,1);assert.equal(result.activeStoragePartition,1);
  const trainer=Object.fromEntries(Object.keys(reference.trainer).map(k=>[k,result.trainer[k]]));assert.deepEqual(trainer,reference.trainer);
  assert.equal(result.party.length,reference.party.length);
  result.party.forEach((p,i)=>comparePokemon(p,reference.party[i],true));
  const pc=result.storage.boxes.flatMap(b=>b.pokemon.filter(p=>!p.empty));assert.equal(pc.length,reference.pc.length);
  reference.pc.forEach(row=>comparePokemon(result.storage.boxes[row.box-1].pokemon[row.slot-1],row.pokemon,false));
  assert.equal(result.storage.boxes[0].pokemon[0].empty,true);
  assert.ok(bytes(name).subarray(0xCF30+8,0xCF30+136).some(value=>value!==0),'Cartridge-style encrypted empty slot');
  assert.equal(result.storage.totalCount,pc.length);assert.equal(result.storage.boxes.length,18);
  assert.equal(result.save.pokedex.speciesCount,name==='postgame'?493:210);
  assert.deepEqual(result.save.pokedex.allCaughtSpecies,[387]);assert.deepEqual(result.save.pokedex.allSeenSpecies,[387]);
  assert.equal(result.save.pokedex.caughtCount,1);assert.equal(result.save.pokedex.seenCount,1);
  const snapshot=createSnapshot(result,`misleading-soulsilver-${name}.sav`);
  assert.equal(snapshot.gameId,'platinum');assert.deepEqual(snapshotResult(snapshot).party,snapshot.party);
  assert.equal(snapshot.safari.supported,false);assert.equal(snapshot.party[0].saveOffset,undefined);
 }
});

test('Platinum selects independently stored valid copies and falls back from corrupt blocks',async()=>{
 const {detectPlatinum}=await import('../js/saves/platinum.js');
 let raw=bytes('middle');raw[0x40000+0xCF30]^=1;
 let result=detectPlatinum(raw);assert.equal(result.valid,true);assert.equal(result.activePartition,1);assert.equal(result.activeStoragePartition,0);
 raw=bytes('middle');raw[0x40000+0x100]^=1;
 result=detectPlatinum(raw);assert.equal(result.valid,true);assert.equal(result.activePartition,0);assert.equal(result.activeStoragePartition,1);
 raw[0x100]^=1;assert.equal(detectPlatinum(raw).valid,false);
});

test('Platinum will not combine incompatible save generations or accept wrong footer identity/magic/game',async()=>{
 const {detectPlatinum}=await import('../js/saves/platinum.js');
 const {crc16Ccitt}=await import('../js/saves/gen4-binary.js');
 const seal=(raw,base,size)=>new DataView(raw.buffer).setUint16(base+size-2,crc16Ccitt(raw.subarray(base,base+size-20)),true);
 for(const mutate of [
  (r,b)=>{r[b+0xCF2C-4]=1;},
  (r,b)=>{r[b+0xCF2C-8]=0;},
  (r,b)=>{r[b+0x84]=10;seal(r,b,0xCF2C);},
 ]){
  const raw=bytes('middle');for(const b of [0,0x40000])mutate(raw,b);assert.equal(detectPlatinum(raw).valid,false);
 }
 const raw=bytes('middle'),v=new DataView(raw.buffer);
 for(const b of [0,0x40000])v.setUint32(b+0xCF2C+0x121E4-20,99,true);
 assert.match(detectPlatinum(raw).reason,/no coherent backup/);
});

test('record corruption, invalid party size, truncated files and empty raw files are rejected explicitly',async()=>{
 const {detectSave}=await import('../js/saves/index.js');
 const {detectPlatinum}=await import('../js/saves/platinum.js');
 const {crc16Ccitt}=await import('../js/saves/gen4-binary.js');
 for(const recordOffset of [0xA0+8,0x9C]){
  const raw=bytes('middle');for(const base of [0,0x40000]){raw[base+recordOffset]=recordOffset===0x9C?7:raw[base+recordOffset]^1;new DataView(raw.buffer).setUint16(base+0xCF2C-2,crc16Ccitt(raw.subarray(base,base+0xCF2C-20)),true);}
  assert.equal(detectPlatinum(raw).valid,false);
 }
 for(const raw of [new Uint8Array(0),new Uint8Array(17),new Uint8Array(0x80000),bytes('early').slice(0,-1)])assert.equal(detectSave(raw).valid,false);
});

test('Platinum handles eggs, shiny PID upper bits, gender, form, accented strings and year 2000 dates',async()=>{
 const {detectPlatinum}=await import('../js/saves/platinum.js');
 const r=detectPlatinum(bytes('postgame'));
 assert.equal(r.party[2].shiny,true);assert.equal(r.party[2].genderId,2);assert.equal(r.party[2].formId,1);
 assert.equal(r.party[1].nickname,'Röcky');assert.equal(r.storage.boxes[1].pokemon[29].isEgg,true);
 assert.equal(r.party[2].status,8);assert.equal(r.party[2].currentHp,0);
 assert.deepEqual(r.party[0].metDate,{year:2000,month:1,day:2});
 assert.deepEqual(r.party[0].moves[0],{id:33,pp:17,ppUps:2});
});

test('all 32 shuffle values and legitimate PID zero match independent PKHeX stored and party records',async()=>{
 const {decryptGen4StoredPokemon,decryptGen4PartyPokemon}=await import('../js/saves/gen4-pokemon.js');
 const cases=JSON.parse(fs.readFileSync(path.join(dir,'shuffles.json')));
 assert.equal(cases.length,32);
 for(const entry of cases){
  comparePokemon(decryptGen4StoredPokemon(new Uint8Array(Buffer.from(entry.stored,'base64')),true),entry.expected,false);
  comparePokemon(decryptGen4PartyPokemon(new Uint8Array(Buffer.from(entry.party,'base64')),true),entry.expected,true);
 }
});

test('committed synthetic fixtures and independent expected values retain their source hashes',()=>{
 const {createHash}=require('node:crypto');const ledger=JSON.parse(fs.readFileSync(path.join(dir,'provenance.json')));
 assert.equal(ledger.synthetic,true);assert.equal(ledger.realGameSaves,0);
 for(const [file,hash]of Object.entries(ledger.files))assert.equal(createHash('sha256').update(fs.readFileSync(path.join(dir,file))).digest('hex'),hash,file);
 for(const name of ['early','middle','postgame'])assert.equal(expected(name).checksumsValid,true);
});

test('checksum-valid Platinum saves with missing party members or invalid trainer and PC metadata are rejected before snapshot/export',async()=>{
 const {detectPlatinum}=await import('../js/saves/platinum.js');
 const {createSnapshot}=await import('../js/adventures.js');
 const {crc16Ccitt}=await import('../js/saves/gen4-binary.js');
 const {cryptGen4}=await import('../js/saves/gen4-pokemon.js');
 const empty=new Uint8Array(236);cryptGen4(empty,8,136,0);cryptGen4(empty,136,236,0);
 const cases=[
  {edit:(r,b)=>r.set(empty,b+0xA0),reason:/party count/},
  {edit:(r,b)=>r[b+0x80]=2,reason:/trainer gender/},
  {edit:(r,b)=>r[b+0x8C]=60,reason:/play-time/},
  {edit:(r,b)=>r[b+0x8D]=60,reason:/play-time/},
  {edit:(r,b)=>new DataView(r.buffer).setUint32(b+0xCF2C,18,true),reason:/current PC box/}
 ];
 for(const c of cases){
  const raw=bytes('middle');for(const b of [0,0x40000]){c.edit(raw,b);for(const [o,size]of [[0,0xCF2C],[0xCF2C,0x121E4]])new DataView(raw.buffer).setUint16(b+o+size-2,crc16Ccitt(raw.subarray(b+o,b+o+size-20)),true);}
  const before=raw.slice(),r=detectPlatinum(raw);assert.equal(r.valid,false);assert.match(r.reason,c.reason);assert.equal(r.trainer,null);assert.deepEqual(r.party,[]);assert.throws(()=>createSnapshot(r,'corrupt.sav'));assert.deepEqual(raw,before);
 }
});

test('party and PC experience levels match freshly executed independent PKHeX derived fixtures',async()=>{
 const {detectSave}=await import('../js/saves/index.js');const {savedLevel}=await import('../js/pokemon-level.js');
 const reference=JSON.parse(fs.readFileSync(path.join(dir,'derived.json')));const {createHash}=require('node:crypto');
 for(const [name,entry]of Object.entries(reference.fixtures)){
  const raw=bytes(name);assert.equal(createHash('sha256').update(raw).digest('hex'),entry.saveSha256);
  const r=detectSave(raw);assert.equal(r.valid,true);
  for(const p of entry.pokemon){const actual=p.box?r.storage.boxes[p.box-1].pokemon[p.slot-1]:r.party[p.slot-1];assert.equal(actual.speciesId,p.speciesId);assert.equal(savedLevel(actual),p.level,`${name} ${p.box}/${p.slot}`);}
 }
});
