const {test}=require('node:test');
const assert=require('node:assert/strict');
const {pokemon}=require('./fixtures/gen3.cjs');

test('PK3 all 24 native permutations and high-bit XOR keys preserve independently encoded fields',async()=>{
  const {decodeGen3Pokemon}=await import('../js/saves/gen3-pokemon.js');
  for(let i=0;i<24;i++)for(const pid of [i,0xFFFFFFE8+i]) {
    const bytes=pokemon({pid}),before=bytes.slice(),p=decodeGen3Pokemon(bytes);
    assert.equal(p.checksumValid,true);assert.equal(p.speciesId,252);assert.equal(p.nativeSpeciesId,277);
    assert.equal(p.personality,pid);assert.equal(p.otId,0xCCDD);assert.equal(p.secretId,0xAABB);
    assert.equal(p.nickname,'T');assert.equal(p.otName,'A');assert.equal(p.experience,1000);assert.equal(p.friendship,70);
    assert.equal(p.heldItemId,13);assert.equal(p.abilityId,65);
    assert.deepEqual(p.moves.map(m=>[m.id,m.pp,m.ppUps]),[[1,12,0],[15,20,1],[0,0,2],[0,0,3]]);
    assert.deepEqual(Object.values(p.ivs),[1,2,3,4,5,6]);assert.deepEqual(Object.values(p.evs),[0,3,6,9,12,15]);
    assert.equal(p.metLocationId,88);assert.equal(p.metLevel,17);assert.equal(p.originGameId,5);assert.equal(p.pokeballId,4);assert.equal(p.otGenderId,1);
    assert.equal(p.contestBeauty,43);assert.equal(p.fatefulEncounter,true);assert.equal(p.status,undefined);assert.equal(p.level,undefined);
    assert.deepEqual(bytes,before);
  }
});
test('PK3 native egg, Unown form, Deoxys form and party-only data remain distinct',async()=>{
  const {decodeGen3Pokemon}=await import('../js/saves/gen3-pokemon.js');
  const p=decodeGen3Pokemon(pokemon({party:true,egg:true}),true);
  assert.equal(p.isEgg,true);assert.equal(p.level,10);assert.equal(p.currentHp,22);assert.equal(p.maxHp,30);
  assert.deepEqual(Object.values(p.stats),[31,32,33,34,35]);
  assert.equal(decodeGen3Pokemon(pokemon({species:201,pid:0x03020100})).formId,4);
  const deoxys=decodeGen3Pokemon(pokemon({species:410}));assert.equal(deoxys.speciesId,386);assert.equal(deoxys.formId,2);
});
test('PK3 bounds, corruption, Bad Egg, empty, unknown species and text terminators are explicit',async()=>{
  const {decodeGen3Pokemon,decodeGen3Text}=await import('../js/saves/gen3-pokemon.js');
  assert.deepEqual(decodeGen3Pokemon(new Uint8Array(80)),{empty:true});
  for(const size of [0,79,81,99,101])assert.throws(()=>decodeGen3Pokemon(new Uint8Array(size)),/length/);
  const broken=pokemon();broken[32]^=1;assert.equal(decodeGen3Pokemon(broken).checksumValid,false);
  const bad=pokemon();bad[19]|=1;assert.equal(decodeGen3Pokemon(bad).checksumValid,false);
  assert.equal(decodeGen3Pokemon(pokemon({species:65535})).speciesId,null);
  assert.equal(decodeGen3Text(Uint8Array.from([0xBB,0xFF,0xBC])),'A');
  assert.equal(decodeGen3Text(Uint8Array.from([0xB5,0xB6])),'♂♀');
  const japanese=pokemon();japanese[18]=1;assert.equal(decodeGen3Pokemon(japanese).nickname,'Ｔ');
  assert.equal(decodeGen3Text(Uint8Array.from([1,0xFF])),'À');
  assert.equal(decodeGen3Text(Uint8Array.from([0x60,0x6F,0x8B,0xFF]),1),'タマゴ');
  // Native GetAbilityBySpecies directly selects the slot; do not silently repair
  // an invalid second slot to the first ability as PKHeX's display helper does.
  assert.equal(decodeGen3Pokemon(pokemon({abilitySlot:1})).abilityId,0);
  assert.equal(decodeGen3Pokemon(pokemon({species:113,pid:255})).genderId,1); // female-only Chansey
  assert.equal(decodeGen3Pokemon(pokemon({species:128,pid:0})).genderId,0); // male-only Tauros
  assert.equal(decodeGen3Pokemon(pokemon({species:81,pid:255})).genderId,2); // genderless Magnemite
});
