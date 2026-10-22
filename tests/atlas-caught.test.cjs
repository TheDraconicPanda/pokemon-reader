const {test}=require('node:test');
const assert=require('node:assert/strict');
const {fixture}=require('./fixtures/reader.cjs');
const {syntheticSave}=require('./fixtures/soulsilver.cjs');
const api=import('../js/data/game-reference.js');

test('shared SoulSilver identifiers and audited yields cover every existing Atlas encounter without newer-game fallback',async()=>{
  const {gameReference,speciesReference,speciesIdForName}=await api;
  const {SOULSILVER_ROUTE_ENCOUNTERS}=await import('../js/data/games/soulsilver/route-encounters.js');
  const {SOULSILVER_LOCATION_ENCOUNTERS}=await import('../js/data/games/soulsilver/location-encounters.js');
  const {SOULSILVER_SAFARI_ENCOUNTERS}=await import('../js/data/games/soulsilver/safari-encounters.js');
  const rows=[...Object.values(SOULSILVER_ROUTE_ENCOUNTERS.routes).flat(),...Object.values(SOULSILVER_LOCATION_ENCOUNTERS.locations).flatMap(location=>location.encounters),...SOULSILVER_SAFARI_ENCOUNTERS];
  assert.equal(rows.length,1384+339);assert.equal(SOULSILVER_SAFARI_ENCOUNTERS.length,339);
  for(const row of rows)assert.ok(speciesReference('soulsilver',speciesIdForName('soulsilver',row.pokemon)),row.pokemon);
  for(let id=1;id<=493;id++)assert.ok(speciesReference('soulsilver',id).evYield,id);
  assert.equal(gameReference('soulsilver').generation,4);
  for(const game of ['heartgold','__proto__',undefined]) {
    assert.equal(gameReference(game),null);assert.equal(speciesIdForName(game,'Rattata'),null);assert.equal(speciesReference(game,19),null);
  }
  assert.equal(gameReference('platinum').gameId,'platinum');
  assert.deepEqual(speciesReference('platinum',19).evYield,{hp:0,attack:0,defense:0,spAttack:0,spDefense:0,speed:1});
  assert.equal(speciesReference('soulsilver',494),null);
  assert.equal(speciesIdForName('soulsilver','Unknown Pokémon'),null);
  assert.equal(speciesIdForName('soulsilver','Nidoran♀'),29);assert.equal(speciesIdForName('soulsilver','Nidoran♂'),32);
  assert.equal(speciesIdForName('soulsilver','Unown (!)'),201);assert.equal(speciesIdForName('soulsilver','Unown (?)'),201);
  assert.equal(speciesIdForName('soulsilver','Farfetch’d'),83);
});

test('parser reads all 493 caught/seen bits while preserving the existing regional Reader counts',async()=>{
  const {detectSoulSilver}=await import('../js/saves/soulsilver.js');
  const {bytes,sealBlock}=syntheticSave();
  const setBit=(id,bank)=>{const bit=id-1;bytes[0x12B8+4+bank+(bit>>3)]|=1<<(bit&7);};
  [19,387,493].forEach(id=>setBit(id,0));[25,387,493].forEach(id=>setBit(id,0x40));
  setBit(500,0); // Reserved Deoxys-form padding is not a species registration.
  sealBlock(0,0xF628);
  let dex=detectSoulSilver(bytes.buffer).save.pokedex;
  assert.equal(dex.nationalDex,false);assert.deepEqual(dex.caughtSpecies,[19]);assert.deepEqual(dex.seenSpecies,[25]);
  assert.equal(dex.caughtCount,1);assert.equal(dex.seenCount,1);
  assert.deepEqual(dex.allCaughtSpecies,[19,387,493]);assert.deepEqual(dex.allSeenSpecies,[25,387,493]);
  bytes[0x64+0x1D]|=2;sealBlock(0,0xF628);
  dex=detectSoulSilver(bytes.buffer).save.pokedex;
  assert.equal(dex.nationalDex,true);assert.equal(dex.caughtCount,3);assert.deepEqual(dex.caughtSpecies,dex.allCaughtSpecies);
});

test('caught markers use registration flags, never Seen flags or party/PC ownership, and retain older snapshots',async()=>{
  const {caughtRegistrations}=await api;
  const {createSnapshot}=await import('../js/adventures.js');
  const data=fixture();data.save.pokedex.allCaughtSpecies=[25,493];data.save.pokedex.allSeenSpecies=[25,133];
  const profile={gameId:'soulsilver',snapshot:createSnapshot(data,'fixture.sav')};
  assert.deepEqual([...caughtRegistrations(profile,'soulsilver').species],[25,493]);
  assert.equal(caughtRegistrations(profile,'soulsilver').species.has(133),false,'Owned and seen Eevee is not registered caught');
  assert.equal(caughtRegistrations(profile,'soulsilver').full,true);
  delete profile.snapshot.pokedex.allCaughtSpecies;
  assert.deepEqual([...caughtRegistrations(profile,'soulsilver').species],[25]);
  assert.equal(caughtRegistrations(profile,'soulsilver').full,false);
  assert.equal(caughtRegistrations(profile,'platinum').species.size,0);
  assert.equal(caughtRegistrations(null,'soulsilver').species.size,0);
});

test('invalid or inconsistent full registration arrays cannot become persisted snapshots',async()=>{
  const {createSnapshot}=await import('../js/adventures.js');
  for(const flags of [[25,494],[0,25],[25,25],[493]]) {
    const data=fixture();data.save.pokedex.allCaughtSpecies=flags;
    assert.throws(()=>createSnapshot(data,'invalid.sav'),/Pokédex flags/);
  }
  const old=createSnapshot(fixture(),'older.sav');assert.equal(old.pokedex.allCaughtSpecies,undefined);
});
