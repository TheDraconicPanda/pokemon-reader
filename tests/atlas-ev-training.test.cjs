const {test}=require('node:test');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
const root=path.join(__dirname,'..');
const load=()=>import(pathToFileURL(path.join(root,'js/data/atlas-ev-training.js')).href);

test('SoulSilver EV yields use the Gen IV six-stat order and known training species',async()=>{
  const {evYieldForSpecies:y}=await load();
  assert.deepEqual(y('soulsilver','Poliwag'),{hp:0,attack:0,defense:0,spAttack:0,spDefense:0,speed:1});
  for(const [pokemon,stat,amount] of [['Poliwhirl','speed',2],['Magikarp','speed',1],['Goldeen','attack',1],['Seaking','attack',2],['Gyarados','attack',2],['Tentacool','spDefense',1],['Tentacruel','spDefense',2],['Geodude','defense',1],['Gastly','spAttack',1],['Marill','hp',2]]) {
    const yields=y('soulsilver',pokemon);assert.equal(yields[stat],amount);assert.equal(Object.values(yields).reduce((a,b)=>a+b,0),amount);
  }
  assert.equal(y('soulsilver','Unown (!)'),y('soulsilver','Unown'));
  assert.equal(y('soulsilver','Unown (?)'),y('soulsilver','Unown'));
});

test('every supported baseline encounter table has 100% coverage at each time without conditional-slot inflation',async()=>{
  const {EV_STATS,evEncounterTables,scoreEvEncounters}=await load();
  for(const time of ['morn','day','nite']) {
    const tables=evEncounterTables('soulsilver',time);assert.ok(tables.length>300);
    assert.equal(new Set(tables.map(t=>t.id)).size,tables.length);
    for(const table of tables){
      assert.notEqual(table.location,'Safari Zone');
      assert.equal(table.rows.reduce((sum,r)=>sum+r.percent,0),100,table.id);
      assert.ok(table.rows.every(r=>!r.conditions.some(c=>['swarm','hoenn-sound','sinnoh-sound'].includes(c))));
      for(const stat of Object.keys(EV_STATS)){
        const score=scoreEvEncounters('soulsilver',table.rows,stat);
        assert.ok(score.usefulPercent<=100&&score.cleanPercent<=score.usefulPercent);
      }
    }
  }
});

test('Surf recommendations distinguish a pure EV table from one guaranteed species',async()=>{
  const {rankEvTraining:rank}=await load();
  const find=(stat,name,area='')=>rank('soulsilver',{stat,method:'surfing'}).find(r=>r.location===name&&r.area===area);
  const speed=find('speed','Violet City');
  assert.equal(speed.usefulPercent,100);assert.equal(speed.cleanPercent,100);assert.equal(speed.expectedEv,1.1);
  assert.deepEqual(speed.encounters.map(r=>[r.pokemon,r.percent,r.targetYield]),[['Poliwag',90,1],['Poliwhirl',10,2]]);
  const spdef=find('spDefense','Cherrygrove City');
  assert.equal(spdef.usefulPercent,100);assert.equal(spdef.expectedEv,1.1);
  assert.deepEqual(spdef.encounters.map(r=>r.pokemon),['Tentacool','Tentacruel']);
  const attack=find('attack','Route 42');assert.equal(attack.usefulPercent,100);
  assert.ok(attack.encounters.every(r=>['Goldeen','Seaking'].includes(r.pokemon)));
});

test('mixed yields and unwanted encounters are not recommended as clean training',async()=>{
  const {rankEvTraining:rank}=await load();
  const mixed=rank('soulsilver',{stat:'speed',method:'surfing',cleanOnly:false}).find(r=>r.location==='Lake of Rage');
  assert.equal(mixed.usefulPercent,90);assert.equal(mixed.cleanPercent,90);assert.equal(mixed.expectedEv,0.9);
  assert.ok(mixed.encounters.some(r=>r.pokemon==='Gyarados'&&r.yields.attack===2));
  assert.ok(!rank('soulsilver',{stat:'speed',method:'surfing'}).some(r=>r.location==='Lake of Rage'));
  const unown=rank('soulsilver',{stat:'spAttack',cleanOnly:false}).find(r=>r.location==='Ruins of Alph'&&r.method==='walking');
  assert.equal(unown.usefulPercent,100);assert.equal(unown.cleanPercent,0);
  assert.ok(unown.encounters.every(r=>r.targetYield===1&&r.unwanted));
  assert.ok(!rank('soulsilver',{stat:'spAttack'}).some(r=>r.location==='Ruins of Alph'&&r.method==='walking'));
});

test('Surf-first ranking, method/time filters and all six stats remain usable',async()=>{
  const {EV_STATS,rankEvTraining:rank}=await load();
  for(const stat of Object.keys(EV_STATS)){
    const results=rank('soulsilver',{stat});assert.ok(results.length,stat);
    assert.ok(results.every(r=>r.cleanPercent===100));
    const firstOther=results.findIndex(r=>r.method!=='surfing');
    if(firstOther>=0)assert.ok(results.slice(firstOther).every(r=>r.method!=='surfing'));
  }
  assert.equal(rank('soulsilver',{stat:'defense',method:'surfing'}).length,0);
  assert.ok(rank('soulsilver',{stat:'speed',method:'old_rod'}).every(r=>r.method==='old_rod'));
  const tables=await load();
  const day=tables.evEncounterTables('soulsilver','day').find(r=>r.location==='Route 29'&&r.method==='walking');
  const night=tables.evEncounterTables('soulsilver','nite').find(r=>r.location==='Route 29'&&r.method==='walking');
  assert.ok(day.rows.some(r=>r.pokemon==='Pidgey'));assert.ok(!night.rows.some(r=>r.pokemon==='Pidgey'));
  assert.ok(night.rows.some(r=>r.pokemon==='Hoothoot'));
});

test('incomplete distributions and missing EV yields fail rather than invent probabilities',async()=>{
  const {scoreEvEncounters:score,rankEvTraining:rank,evYieldForSpecies:y,evEncounterTables:tables}=await load();
  assert.throws(()=>score('soulsilver',[{pokemon:'Magikarp',percent:90,levels:[10]}],'speed'),/complete 100%/);
  assert.throws(()=>score('soulsilver',[{pokemon:'Unknown',percent:100,levels:[10]}],'speed'),/Missing Generation IV/);
  for(const game of ['heartgold','platinum','__proto__',undefined]){assert.deepEqual(rank(game),[]);assert.deepEqual(tables(game),[]);assert.equal(y(game,'Magikarp'),null);}
  assert.equal(y('soulsilver','__proto__'),null);
  assert.deepEqual(rank('soulsilver',{stat:'__proto__'}),[]);
  assert.deepEqual(rank('soulsilver',{time:'unknown'}),[]);
  assert.deepEqual(rank('soulsilver',{method:'contest'}),[]);
});
