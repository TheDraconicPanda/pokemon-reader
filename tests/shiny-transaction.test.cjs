const {test}=require('node:test');
const assert=require('node:assert/strict');
const {save,pokemon}=require('./fixtures/gen3.cjs');
const {syntheticSave}=require('./fixtures/soulsilver.cjs');

test('Generation III shiny PID editing preserves checksum, nature, gender, ability slot and Unown form',async()=>{
  const {setGen3PokemonShiny,decodeGen3Pokemon}=await import('../js/saves/gen3-pokemon.js');
  for(const options of [{pid:0},{pid:0x12345678},{species:201,pid:0x03020100}]){
    const before=pokemon(options),original=decodeGen3Pokemon(before),shiny=setGen3PokemonShiny(before,true),after=decodeGen3Pokemon(shiny);
    assert.equal(after.shiny,true);assert.equal(after.checksumValid,true);
    assert.equal(after.natureId,original.natureId);assert.equal(after.genderId,original.genderId);
    assert.equal(after.abilitySlot,original.abilitySlot);assert.equal(after.formId,original.formId);
    const normal=setGen3PokemonShiny(shiny,false),roundTrip=decodeGen3Pokemon(normal);
    assert.equal(roundTrip.shiny,false);assert.equal(roundTrip.natureId,original.natureId);
    assert.equal(roundTrip.genderId,original.genderId);assert.equal(roundTrip.formId,original.formId);
    assert.deepEqual(before,pokemon(options));
  }
});

test('Generation III shiny editing refuses Spinda to preserve its PID-encoded spot pattern',async()=>{
  const {setGen3PokemonShiny}=await import('../js/saves/gen3-pokemon.js');
  assert.throws(()=>setGen3PokemonShiny(pokemon({species:327}),true),/Spinda.*spot pattern/);
});

test('LeafGreen party and PC shiny edits produce independently readable saves and preserve the original',async()=>{
  const {detectSave}=await import('../js/saves/index.js');
  const {setPokemonShiny,shinyExportName}=await import('../js/saves/shiny-transaction.js');
  const bytes=save(),original=bytes.slice(),loaded=detectSave(bytes,{gameId:'leafgreen'});
  assert.equal(loaded.valid,true);
  const party=loaded.party[0],partyOutput=setPokemonShiny(bytes,party,true);
  const partyResult=detectSave(partyOutput,{gameId:'leafgreen'});
  assert.equal(partyResult.valid,true);assert.equal(partyResult.party[0].shiny,true);
  assert.equal(partyResult.party[0].natureId,party.natureId);assert.equal(partyResult.party[0].genderId,party.genderId);
  assert.deepEqual(bytes,original);
  const pc=loaded.storage.boxes[13].pokemon[29],pcOutput=setPokemonShiny(bytes,pc,true);
  const pcResult=detectSave(pcOutput,{gameId:'leafgreen'});
  assert.equal(pcResult.valid,true);assert.equal(pcResult.storage.boxes[13].pokemon[29].shiny,true);
  assert.equal(pcResult.storage.boxes[13].pokemon[29].natureId,pc.natureId);
  assert.deepEqual(bytes,original);
  assert.equal(shinyExportName('game.sav'),'game.shiny.sav');
  assert.equal(shinyExportName('game.dsv'),'game.shiny.dsv');
  assert.equal(shinyExportName('game.shiny.sav'),'game.shiny-2.sav');
});

test('SoulSilver party and PC shiny edits retain Pokémon data and the save container',async()=>{
  const {detectSave}=await import('../js/saves/index.js');
  const {setPokemonShiny}=await import('../js/saves/shiny-transaction.js');
  const {bytes,sealBlock}=syntheticSave(25);
  bytes[0x7E]=0x85;bytes[0x83]=0x81;bytes[0x81]|=2;
  bytes[0x12B8+4+3]=1;bytes[0x12B8+4+64+3]=1;sealBlock(0,0xF628);
  const original=bytes.slice(),loaded=detectSave(bytes);
  assert.equal(loaded.valid,true,loaded.reason);
  for(const pokemon of [loaded.party[0],loaded.storage.boxes[0].pokemon[0]]){
    const output=setPokemonShiny(bytes,pokemon,true),verified=detectSave(output);
    assert.equal(verified.valid,true,verified.reason);
    const updated=pokemon.recordKind==='party'?verified.party[0]:verified.storage.boxes[0].pokemon[0];
    assert.equal(updated.shiny,true);assert.equal(updated.checksumValid,true);
    assert.equal(updated.natureId,pokemon.natureId);assert.equal(updated.speciesId,pokemon.speciesId);
    assert.equal(updated.abilityId,pokemon.abilityId);assert.deepEqual(updated.ivs,pokemon.ivs);
    assert.deepEqual(updated.evs,pokemon.evs);assert.deepEqual(updated.moves,pokemon.moves);
  }
  assert.deepEqual(bytes,original);
});

test('Platinum can turn an existing shiny Pokémon off and back on without changing its identity',async()=>{
  const fs=require('node:fs'),path=require('node:path');
  const {detectSave}=await import('../js/saves/index.js');
  const {setPokemonShiny}=await import('../js/saves/shiny-transaction.js');
  const file=path.join(__dirname,'fixtures/gen4/platinum/postgame.sav');
  const bytes=new Uint8Array(fs.readFileSync(file)),original=bytes.slice();
  const loaded=detectSave(bytes);assert.equal(loaded.valid,true,loaded.reason);
  const shiny=loaded.party.find(p=>p.shiny);assert.ok(shiny);
  const nonShinyBytes=setPokemonShiny(bytes,shiny,false),nonShinySave=detectSave(nonShinyBytes);
  assert.equal(nonShinySave.valid,true,nonShinySave.reason);
  const nonShiny=nonShinySave.party.find(p=>p.slot===shiny.slot);
  assert.equal(nonShiny.shiny,false);assert.equal(nonShiny.natureId,shiny.natureId);
  assert.equal(nonShiny.genderId,shiny.genderId);assert.equal(nonShiny.abilityId,shiny.abilityId);
  assert.equal(nonShiny.formId,shiny.formId);assert.deepEqual(nonShiny.ivs,shiny.ivs);
  const shinyAgain=setPokemonShiny(nonShinyBytes,nonShiny,true),reloaded=detectSave(shinyAgain);
  assert.equal(reloaded.valid,true,reloaded.reason);
  assert.equal(reloaded.party.find(p=>p.slot===shiny.slot).shiny,true);
  assert.deepEqual(bytes,original);
});
