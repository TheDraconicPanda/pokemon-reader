const {test}=require('node:test');
const assert=require('node:assert/strict');
const {save,editSector}=require('./fixtures/gen3.cjs');
test('LeafGreen requires an explicit host-game confirmation and never guesses from Pokémon origins',async()=>{
  const {detectLeafGreen}=await import('../js/saves/leafgreen.js');
  const bytes=save(),before=bytes.slice(),candidate=detectLeafGreen(bytes);
  assert.equal(candidate.valid,false);assert.equal(candidate.requiresGameConfirmation,true);assert.equal(candidate.save,null);
  const result=detectLeafGreen(bytes,{confirmed:true});assert.equal(result.valid,true);assert.equal(result.gameId,'leafgreen');
  assert.deepEqual(bytes,before);assert.equal(result.activePartition,1);
});
test('LeafGreen decodes native trainer, encrypted money, badges, party and all 420 PC slots',async()=>{
  const {detectLeafGreen}=await import('../js/saves/leafgreen.js');
  const result=detectLeafGreen(save(),{confirmed:true});
  assert.equal(result.valid,true,result.reason);assert.equal(result.trainer.name,'A');assert.equal(result.trainer.money,50000);
  assert.equal(result.trainer.trainerId,12345);assert.equal(result.trainer.secretId,54321);assert.equal(result.trainer.badges,5);assert.equal(result.trainer.badgeCount,2);
  assert.deepEqual(result.trainer.playTime,{hours:25,minutes:30,seconds:45});
  assert.equal(result.party.length,1);assert.equal(result.party[0].speciesId,252);
  assert.equal(result.storage.boxes.length,14);assert.equal(result.storage.currentBox,13);assert.equal(result.storage.totalCount,1);
  assert.equal(result.storage.boxes.flatMap(b=>b.pokemon).length,420);assert.equal(result.storage.boxes[13].pokemon[29].speciesId,386);
  assert.equal(result.storage.boxes[13].pokemon[29].boxNumber,14);
});
test('LeafGreen registration scope distinguishes 151 regional/386 national and owned Pokémon',async()=>{
  const {detectLeafGreen}=await import('../js/saves/leafgreen.js');
  for(const national of [false,true]) {
    const result=detectLeafGreen(save({national}),{confirmed:true}),dex=result.save.pokedex;
    assert.equal(dex.speciesCount,national?386:151);assert.deepEqual(dex.allCaughtSpecies,[1,252]);assert.deepEqual(dex.allSeenSpecies,[1,2,252]);
    assert.deepEqual(dex.caughtSpecies,national?[1,252]:[1]);assert.deepEqual(dex.seenSpecies,national?[1,2,252]:[1,2]);
  }
  const mismatched=editSector(save(),1,b=>b[0x5F8]=0);
  const dex=detectLeafGreen(mismatched,{confirmed:true}).save.pokedex;
  assert.deepEqual(dex.seenSpecies,[]);assert.deepEqual(dex.caughtSpecies,[]);
  const inconsistentUnlock=editSector(save({national:true}),2,b=>b[0x109C-0xF80]=0);
  assert.equal(detectLeafGreen(inconsistentUnlock,{confirmed:true}).save.pokedex.nationalDex,false);
});
test('LeafGreen rejects unsupported sizes and structurally corrupt saves without exposing decoded progress',async()=>{
  const {detectLeafGreen}=await import('../js/saves/leafgreen.js');
  for(const bytes of [new Uint8Array(0),new Uint8Array(0x10000),new Uint8Array(0x20000),new Uint8Array(0x80000)]){
    const result=detectLeafGreen(bytes,{confirmed:true});assert.equal(result.valid,false);assert.equal(result.save,null);assert.equal(result.trainer,null);
  }
});
test('LeafGreen shared dispatch and snapshots preserve the selected game and fourteen boxes',async()=>{
  const {detectSave}=await import('../js/saves/index.js');
  const {createSnapshot,snapshotResult,validateSnapshot}=await import('../js/adventures.js');
  const bytes=save();assert.equal(detectSave(bytes).requiresGameConfirmation,true);
  const result=detectSave(bytes,{gameId:'leafgreen'}),snapshot=createSnapshot(result,'leafgreen.sav');
  assert.equal(snapshot.gameId,'leafgreen');assert.equal(snapshot.storage.boxes.length,14);
  assert.equal(snapshotResult(snapshot).storage.boxes[13].pokemon[29].speciesId,386);
  const bad=structuredClone(snapshot);bad.storage.boxes[0].pokemon[0]={...bad.party[0],speciesId:493};
  assert.throws(()=>validateSnapshot(bad),/Pokémon record/);
  const badMoves=structuredClone(snapshot);badMoves.party[0].moves[0].id=355;assert.throws(()=>validateSnapshot(badMoves),/moves/);
});
test('LeafGreen handles synthetic early/middle/postgame states and rejects checksum-valid semantic corruption',async()=>{
  const {detectLeafGreen}=await import('../js/saves/leafgreen.js');
  for(const stage of [{partyCount:0,badgeMask:0},{partyCount:3,badgeMask:21},{partyCount:6,badgeMask:255,national:true,cleared:true}]) {
    const result=detectLeafGreen(save(stage),{confirmed:true});assert.equal(result.valid,true,result.reason);
    assert.equal(result.party.length,stage.partyCount);assert.equal(result.trainer.badges,stage.badgeMask);assert.equal(result.progress.mainStoryCleared,Boolean(stage.cleared));
  }
  for(const [id,edit] of [[0,b=>b[8]=2],[0,b=>b[0x10]=60],[0,b=>b[0xAC]=0],[1,b=>b[0x34]=7],[1,b=>b.fill(0,0x38,0x38+100)],[1,b=>b[0x38+32]^=1],[5,b=>b[0]=14]]) {
    const result=detectLeafGreen(editSector(save(),id,edit),{confirmed:true});assert.equal(result.valid,false);assert.equal(result.save,null);assert.equal(result.trainer,null);
  }
});
test('LeafGreen matches independent PKHeX PK3 records for every species and a complete save inspection',async()=>{
  const {auditReader}=await import('../scripts/audit-leafgreen-reader.mjs');
  const records=require('./fixtures/leafgreen/pkhex-records.json'),inspection=require('./fixtures/leafgreen/pkhex-save.json');
  assert.equal((await auditReader(records,inspection)).passed,true);
});
