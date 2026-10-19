const {test}=require('node:test');
const assert=require('node:assert/strict');
const {fixture}=require('./fixtures/reader.cjs');
const api=import('../js/planner-model.js');
async function setup(speciesId=67) {
  const model=await api;
  const data=fixture();Object.assign(data.party[0],{speciesId,personality:701,natureId:3,moves:[{id:223},{id:70},{id:431},{id:0}]});
  const {createSnapshot}=await import('../js/adventures.js');
  const profile={id:'adventure-a',gameId:'soulsilver',revision:1,snapshot:createSnapshot(data,'test.sav')};
  const plan=model.newPlanner('Mando',profile.id);
  return {model,profile,plan,member:plan.goals.team.find(p=>p.id==='machamp')};
}
test('Planner goals retain existing move IDs and map PID nature indices with game_index',async()=>{
  const {defaultGoals,newPlanner,validatePlanner,moveId,natureName}=await api;
  const goals=defaultGoals();
  assert.deepEqual(goals.team.find(p=>p.id==='dragonite').moveIds,[349,89,337,19]);
  assert.equal(goals.team.find(p=>p.id==='machamp').moveIds[3],null);
  assert.equal(moveId('DynamicPunch'),223);assert.equal(moveId('Shadow Ball'),247);
  assert.equal(natureName(3),'Adamant');assert.equal(natureName(10),'Timid');assert.equal(natureName(15),'Modest');
  validatePlanner(newPlanner());
});
test('initial matching uses a unique party family member and never auto-assigns PC-only candidates',async()=>{
  const {model,profile,plan}=await setup();
  assert.equal(model.reconcilePlanner(plan,profile).links.machamp.lastKnown.speciesId,67);
  profile.snapshot.storage.boxes[0].pokemon[0]={...profile.snapshot.party[0],slot:1,recordKind:'storage',boxNumber:1};
  profile.snapshot.party=[];
  assert.equal(model.reconcilePlanner(plan,profile).links.machamp,undefined);
  const member=plan.goals.team.find(p=>p.id==='machamp');
  assert.equal(model.memberProgress(plan,member,profile).candidates.length,1);
  profile.snapshot.party=[profile.snapshot.storage.boxes[0].pokemon[0],{...profile.snapshot.storage.boxes[0].pokemon[0],slot:2,personality:702}].map(p=>({...p,recordKind:'party'}));
  assert.equal(model.reconcilePlanner(plan,profile).links.machamp,undefined,'Ambiguous party must be selected');
});
test('a durable identity follows evolution and party/PC transfers without changing desired goals or checklists',async()=>{
  const {model,profile,plan,member}=await setup();
  plan.state.moves['machamp:1']=true;
  const before=JSON.stringify({goals:plan.goals,state:plan.state});
  const linked=model.reconcilePlanner(plan,profile);
  const pokemon=profile.snapshot.party.shift();pokemon.speciesId=68;pokemon.recordKind='storage';pokemon.slot=1;
  profile.snapshot.storage.boxes[5].pokemon[0]=pokemon;profile.revision=2;
  const refreshed=model.reconcilePlanner(linked,profile);const progress=model.memberProgress(refreshed,member,profile);
  assert.equal(progress.actual.location,'Box 6, slot 1');assert.equal(progress.evolved,true);assert.equal(progress.nature,true);
  assert.deepEqual(progress.moves,[true,false,false,false]);
  assert.equal(JSON.stringify({goals:refreshed.goals,state:refreshed.state}),before);
  assert.equal(refreshed.links.machamp.lastKnown.speciesId,68);
});
test('forgotten moves become incomplete and absent linked Pokémon retain last-known values without false completion',async()=>{
  const {model,profile,plan,member}=await setup();
  const linked=model.reconcilePlanner(plan,profile);
  assert.equal(model.memberProgress(linked,member,profile).moves[0],true);
  profile.snapshot.party[0].moves=[{id:1},{id:0},{id:0},{id:0}];profile.revision++;
  const refreshed=model.reconcilePlanner(linked,profile);
  assert.equal(model.memberProgress(refreshed,member,profile).moves[0],false);
  profile.snapshot.party=[];profile.revision++;
  const missing=model.reconcilePlanner(refreshed,profile);const progress=model.memberProgress(missing,member,profile);
  assert.equal(progress.status,'missing');assert.equal(progress.actual,null);assert.equal(progress.lastKnown.speciesId,67);
  assert.deepEqual(progress.moves,[false,false,false,false]);assert.deepEqual(missing.links,refreshed.links);
});
test('identity checks reject different OT/IV/met evidence, exclude eggs and keep cloned identities ambiguous after a new save',async()=>{
  const {model,profile,plan,member}=await setup();
  const linked=model.reconcilePlanner(plan,profile);
  const original=structuredClone(profile.snapshot.party[0]);
  for(const mutate of [p=>{p.otId++;},p=>{p.secretId++;},p=>{p.ivs.hp--;},p=>{p.otName='Another OT';},p=>{p.metLevel++;},p=>{p.isEgg=true;}]) {
    const p=structuredClone(original);mutate(p);profile.snapshot.party=[p];
    assert.equal(model.memberProgress(linked,member,profile).status,'missing');
  }
  profile.snapshot.party=[original,{...structuredClone(original),slot:2}];profile.revision++;
  assert.equal(model.memberProgress(linked,member,profile).status,'ambiguous');
  const candidates=model.savedPokemon(profile);
  model.linkPokemon(linked,'machamp',candidates.find(p=>p.token==='party:2'),profile);
  assert.equal(model.memberProgress(linked,member,profile).actual.slot,2,'Explicit position resolves this snapshot only');
  profile.revision++;
  assert.equal(model.memberProgress(linked,member,profile).status,'ambiguous');
});
test('manual overrides and unrelated adventures cannot silently steal associations',async()=>{
  const {model,profile,plan,member}=await setup();
  plan.links.machamp={manual:true};assert.deepEqual(model.reconcilePlanner(plan,profile).links.machamp,{manual:true});
  const another={...profile,id:'adventure-b'};
  assert.equal(model.memberProgress(plan,member,another).candidates.length,0);
  assert.throws(()=>model.linkPokemon(plan,'machamp',model.savedPokemon(profile)[0],another));
  assert.deepEqual(model.reconcilePlanner(plan,another),plan);
});
test('v1/v2 imports create independent plans, retain manual goals/progress and never reassign foreign profile IDs',async()=>{
  const {newPlanner,importPlannerBackup,validatePlanner}=await api;
  const original=newPlanner('Original','foreign-profile');original.state.moves['gengar:0']=true;
  const imported=importPlannerBackup({version:2,planner:original});
  assert.notEqual(imported.id,original.id);assert.equal(imported.adventureId,null);assert.deepEqual(imported.links,{});
  assert.deepEqual(imported.goals,original.goals);assert.deepEqual(imported.state,original.state);
  const old=importPlannerBackup({state:{version:1,ready:{kingdra:true},custom:'kept'}});
  assert.equal(old.state.ready.kingdra,true);assert.equal(old.state.custom,'kept');
  assert.throws(()=>importPlannerBackup({version:99}));
  const broken=structuredClone(original);delete broken.goals.team[0].temporary;assert.throws(()=>validatePlanner(broken));
});
