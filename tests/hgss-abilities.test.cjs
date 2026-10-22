const {test}=require('node:test');
const assert=require('node:assert/strict');
const {abilityFixture}=require('./fixtures/hgss-abilities.cjs');
const {dsv}=require('./fixtures/gen4/evolution.cjs');
const api=Promise.all([import('../js/saves/gen4-abilities.js'),import('../js/saves/soulsilver-ability-repair.js'),import('../js/saves/index.js'),import('../js/saves/gen4-pokemon.js')]);
const selected=(save,kind)=>kind==='party'?save.party[0]:save.storage.boxes[0].pokemon[0];

test('all 505 HGSS species/form ability lists retain their independently audited primary slot order',async()=>{
 const evidence=require('../docs/hgss-ability-evidence.json');
 const {SOULSILVER_POKEDEX:ref}=await import('../js/data/games/soulsilver/pokedex-reference.js');
 const [{gen4AbilityForPid}]=await api;
 assert.equal(evidence.passed,true);assert.equal(evidence.species,493);assert.equal(evidence.records,505);
 assert.deepEqual(evidence.entries.map(e=>e.key).sort((a,b)=>a-b),Object.keys(ref.species).map(Number).sort((a,b)=>a-b));
 for(const [file,source]of Object.entries(evidence.sources))assert.deepEqual(source,ref.sources['pret:'+file]);
 for(const {key,slots}of evidence.entries){
  assert.deepEqual(ref.species[key].abilities,[...new Set(slots.filter(Boolean))]);
  for(const pid of [0,1])assert.equal(gen4AbilityForPid(pid,ref.species[key].abilities),pid&1&&slots[1]?slots[1]:slots[0]);
 }
});

test('HGSS PID slots remap Horsea → Seadra → Kingdra for both Swift Swim/Poison Point and Sniper',async()=>{
 const [{evolutionAbility,gen4AbilityForPid}]=await api;
 for(const pid of [0,2,0xFFFFFFFE])assert.deepEqual([116,117,230].map(id=>evolutionAbility(pid,id,'soulsilver')),[33,38,33]);
 for(const pid of [1,3,0xFFFFFFFF])assert.deepEqual([116,117,230].map(id=>evolutionAbility(pid,id,'soulsilver')),[97,97,97]);
 assert.equal(gen4AbilityForPid(1,[33]),33);assert.equal(gen4AbilityForPid(0,[33,97]),33);
 for(const pid of [-1,NaN,1.5,0x100000000])assert.equal(gen4AbilityForPid(pid,[33,97]),null);
 assert.equal(evolutionAbility(0,999,'soulsilver'),null);assert.equal(evolutionAbility(0,230,'unknown'),null);
});

test('every existing SoulSilver trade, trade-item and location path writes the correct PID ability to party and PC',async()=>{
 const [{evolutionAbility},,{detectSave},{decryptGen4Record}]=await api;
 const {evolveSavePokemon}=await import('../js/saves/evolution-transaction.js');
 const {evolveSoulSilverPokemon,getAvailableEvolutions}=await import('../js/saves/soulsilver-evolution.js');
 const {SOULSILVER_POKEDEX:ref}=await import('../js/data/games/soulsilver/pokedex-reference.js');
 const methods=new Set();let count=0;
 for(const edge of ref.evolutions){
  const item={'Metal Coat':233,'Dragon Scale':235,"King’s Rock":221,"King's Rock":221,'Up-Grade':252,'Upgrade':252,'Deep Sea Tooth':226,'Deep Sea Scale':227,'Protector':321,'Electirizer':322,'Magmarizer':323,'Reaper Cloth':325,'Dubious Disc':324}[edge.param]||0;
  if(!getAvailableEvolutions({speciesId:edge.from,heldItemId:item,level:40}).some(rule=>rule.to===edge.to))continue;
  for(const kind of ['party','storage'])for(const parity of [0,1]){
   const pid=305397910+parity,ability=evolutionAbility(pid,edge.from,'soulsilver');
   const fixture=abilityFixture({species:edge.from,ability,pid,item,kind}),source=detectSave(fixture.bytes),p=selected(source,kind);
   const rule=getAvailableEvolutions({...p,level:40}).find(r=>r.to===edge.to);
   if(!rule)continue;methods.add(rule.method);count++;
   const before=fixture.bytes.slice(),output=evolveSavePokemon(fixture.bytes,p,rule),loaded=detectSave(output),evolved=selected(loaded,kind);
   assert.equal(loaded.valid,true);assert.equal(evolved.checksumValid,true);assert.equal(evolved.abilityId,evolutionAbility(pid,edge.to,'soulsilver'),`${edge.from} → ${edge.to}/${kind}/${parity}`);
   assert.equal(evolved.personality,pid);assert.deepEqual(fixture.bytes,before);assert.deepEqual(evolved.moves,p.moves);assert.deepEqual(evolved.ivs,p.ivs);assert.deepEqual(evolved.evs,p.evs);assert.equal(evolved.experience,p.experience);assert.equal(evolved.natureId,p.natureId);
   const stats=ref.species[edge.to].stats.map((base_stat,i)=>({base_stat,stat:{name:['hp','attack','defense','special-attack','special-defense','speed'][i]}}));
   const primitive=evolveSoulSilverPokemon(fixture.bytes,{...p,level:40},rule,0,stats);
   assert.equal(selected(detectSave(primitive),kind).abilityId,evolved.abilityId,'Compatibility writer must use the same correction');
   assert.deepEqual(decryptGen4Record(output.subarray(fixture.offset,fixture.offset+(kind==='party'?236:136)),kind==='party').subarray(0,4),fixture.logical.subarray(0,4));
  }
 }
 assert.equal(count,84);assert.deepEqual([...methods].sort(),['location-level-up','trade','trade-item']);
});

test('Kingdra Poison Point is invalid with Swift Swim replacement; both valid abilities and transfer mismatches remain untouched',async()=>{
 const [{validateSoulSilverAbility:validate}, {repairSoulSilverAbility:repair},{detectSave}]=await api;
 for(const ability of [38,33,97]){
  const {bytes}=abilityFixture({ability}),p=selected(detectSave(bytes),'storage');
  assert.deepEqual(validate(p),ability===38?{status:'invalid',current:38,replacement:33}:{status:'valid'});
  if(ability!==38)assert.deepEqual(repair(bytes,p),bytes);
 }
 // Gen III Porygon with Trace may retain it after migration even with odd PID.
 const {bytes}=abilityFixture({species:137,ability:36,pid:305397911});
 const p=selected(detectSave(bytes),'storage');assert.equal(validate(p).status,'valid');assert.deepEqual(repair(bytes,p),bytes);
 const odd=abilityFixture({ability:38,pid:305397911});assert.equal(validate(selected(detectSave(odd.bytes),'storage')).replacement,97);
});

test('repair preserves every unrelated logical byte and save byte across all 32 shuffle values, both partitions, party/PC and raw/DSV',async()=>{
 const [, {repairSoulSilverAbility:repair},{detectSave},{decryptGen4Record}]=await api;
 for(const kind of ['party','storage'])for(const partition of [0,1])for(let shuffle=0;shuffle<32;shuffle++){
  const {bytes,offset,logical}=abilityFixture({kind,partition,pid:(shuffle<<13)|2});
  const input=shuffle%2?dsv(bytes):bytes,before=input.slice(),p=selected(detectSave(input),kind);
  const output=repair(input,p),loaded=detectSave(output),repaired=selected(loaded,kind);
  assert.equal(loaded.valid,true);assert.equal(loaded.activePartition,partition);assert.equal(repaired.checksumValid,true);assert.equal(repaired.abilityId,33);
  assert.deepEqual(input,before);assert.equal(input.length,output.length);
  const decoded=decryptGen4Record(output.subarray(offset,offset+logical.length),kind==='party');
  for(let i=0;i<logical.length;i++)if(![6,7,21].includes(i))assert.equal(decoded[i],logical[i],`Unrelated PK4 byte ${i}`);
  const crc=partition*0x40000+(kind==='party'?0xF628:0xF700+0x12310)-2;
  for(let i=0;i<input.length;i++)if(output[i]!==input[i])assert.ok((i>=offset&&i<offset+logical.length)||i===crc||i===crc+1,`Unrelated save byte ${i}`);
  assert.deepEqual(repair(output,repaired),output,'Repair must be idempotent');
 }
});

test('form abilities use HGSS data and uncertain, corrupt, unsupported and stale records cannot be repaired',async()=>{
 const [{validateSoulSilverAbility:validate},{repairSoulSilverAbility:repair},{detectSave}]=await api;
 for(const [species,form,valid,invalid,replacement]of [[487,1,26,46,26],[492,1,32,30,32],[479,1,26,50,26]]){
  const fixture=abilityFixture({species,form,ability:valid});assert.equal(validate(selected(detectSave(fixture.bytes),'storage')).status,'valid');
  const bad=abilityFixture({species,form,ability:invalid});const p=selected(detectSave(bad.bytes),'storage');assert.equal(validate(p).replacement,replacement);assert.equal(selected(detectSave(repair(bad.bytes,p)),'storage').abilityId,replacement);
 }
 for(const settings of [{species:999},{species:487,form:7},{egg:true}]){
  const {bytes}=abilityFixture(settings),before=bytes.slice(),p=selected(detectSave(bytes),'storage');assert.throws(()=>repair(bytes,p));assert.deepEqual(bytes,before);
 }
 const {bytes}=abilityFixture(),source=detectSave(bytes),p=selected(source,'storage');
 for(const patch of [{personality:1},{speciesId:117},{abilityId:33},{saveOffset:0},{recordKind:'daycare'}])assert.throws(()=>repair(bytes,{...p,...patch}));
 assert.equal(validate({...p,checksumValid:false}).status,'unknown');assert.equal(validate({...p,personality:undefined}).status,'unknown');
 const corrupt=bytes.slice();corrupt[p.saveOffset+8]^=1;assert.throws(()=>repair(corrupt,p));
 const fs=require('node:fs');const platinum=new Uint8Array(fs.readFileSync(require('node:path').join(__dirname,'fixtures/gen4/platinum/early.sav')));assert.throws(()=>repair(platinum,detectSave(platinum).party[0]),/SoulSilver/);
});

test('ability repair and evolution keep original extensions and always propose a distinct download filename',async()=>{
 const {abilityRepairExportName:name,evolutionExportName}=await import('../js/saves/gen4-container.js');
 assert.equal(name('SoulSilver.sav'),'SoulSilver.ability-repaired.sav');assert.equal(name('SoulSilver.DSV'),'SoulSilver.ability-repaired.DSV');
 assert.equal(name('SoulSilver.ability-repaired.sav'),'SoulSilver.ability-repaired-2.sav');assert.equal(name('SoulSilver.ability-repaired-2.DSV'),'SoulSilver.ability-repaired-3.DSV');assert.equal(name('SoulSilver'),'SoulSilver.ability-repaired.sav');
 assert.equal(evolutionExportName('SoulSilver.DSV'),'SoulSilver.evolved.DSV');
});
