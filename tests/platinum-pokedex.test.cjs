const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
test('Platinum reference has independently matched 210 ordering and 1972 learnsets with native Gen IV forms, machines and tutors',async()=>{
 const {pokedexReference,evolutionRequirement}=await import('../js/data/pokedex-reference.js');
 const p=pokedexReference('platinum'),ss=pokedexReference('soulsilver');
 assert.equal(p.regional.length,210);assert.equal(new Set(p.regional).size,210);assert.deepEqual(p.regional.slice(0,3),[387,388,389]);assert.equal(p.regional.at(-1),487);
 assert.equal(Object.keys(p.species).length,505);assert.equal(p.evolutions.length,246);
 const report=JSON.parse(fs.readFileSync('docs/platinum-pokedex-audit.json'));assert.equal(report.moveListComparisons,1972);assert.deepEqual(report.differences,[]);assert.equal(report.regionalOrderingMatches,true);
 assert.equal(p.machines.HM05,432);assert.equal(ss.machines.HM05,250);assert.ok(p.species[6].machines.includes('HM05'));
 assert.equal(p.tutors[434].location,'Route 210 — Grandma Wilma');assert.equal(p.tutors[307].location,'Route 228 — north house');assert.match(p.tutors[291].costLabel,/Shards/);
 for(const [key,r] of Object.entries(p.species)){
  assert.ok(r.id>=1&&r.id<=493);assert.equal(r.stats.length,6);assert.equal(r.evYield.length,6);assert.ok(r.name);
  assert.ok(r.abilities.length&&r.abilities.every(id=>p.abilities[id]?.description));assert.ok(r.types.every(t=>p.typeChart[t]));
  assert.ok(r.machines.every(m=>p.machines[m]));assert.ok(r.tutorMoves.every(m=>p.tutors[m]));
  assert.ok(r.levelMoves.every(([level,m])=>level>=1&&level<=100&&m>=1&&m<=467));assert.ok(r.eggMoves.every(m=>m>=1&&m<=467));
  if(Number(key)>=503)assert.deepEqual(r.types,['electric','ghost']);
 }
 for(const edge of p.evolutions){assert.ok(p.species[edge.from]&&p.species[edge.to]);assert.doesNotMatch(evolutionRequirement(edge,'platinum'),/not verified|trade back|no Moss Rock/);}
 assert.equal(evolutionRequirement(p.evolutions.find(e=>e.to===470),'platinum'),'Level up near Eterna Forest’s Moss Rock');
 assert.match(evolutionRequirement(ss.evolutions.find(e=>e.to===470)),/trade back/);
});
test('Platinum reference locations use real Sinnoh IDs and never leak Johto roamers or Safari data',async()=>{
 const {speciesLocations}=await import('../js/data/pokedex-reference.js');const {PLATINUM_ATLAS:a}=await import('../js/data/games/platinum/atlas.js');const names=new Set(a.locations.map(l=>l.name));
 for(let id=1;id<=493;id++)for(const row of speciesLocations('platinum',id)){assert.ok(names.has(row.location));assert.ok(row.details.length);assert.notEqual(row.location,'Safari Zone');}
 assert.ok(speciesLocations('platinum',396).some(r=>r.location==='Route 201'));
 assert.deepEqual(speciesLocations('platinum',243),[]);
 assert.ok(speciesLocations('soulsilver',243).some(r=>r.location==='Route 29'));
 assert.ok(!a.encounters['Iron Island'].some(r=>r.conditions.includes('Active outbreak on this map')));
 for(const n of ['Wayward Cave','Turnback Cave','Oreburgh Mine'])assert.ok(!a.encounters[n].some(r=>r.conditions.some(c=>c.includes('Poké Radar'))));
 assert.ok(a.encounters['Eterna Forest'].some(r=>r.conditions.some(c=>c.includes('Poké Radar'))));
 assert.equal(a.locations.length,125);assert.equal(Object.keys(a.headers).length,593);
});
test('Platinum Dex seen/caught flags agree with independent PKHeX fixtures and game-scoped caught adapters',async()=>{
 const {detectSave}=await import('../js/saves/index.js');const {caughtRegistrations,speciesReference}=await import('../js/data/game-reference.js');
 for(const name of ['early','middle','postgame']){
  const raw=fs.readFileSync(`tests/fixtures/gen4/platinum/${name}.sav`),p=detectSave(raw),expected=JSON.parse(fs.readFileSync(`tests/fixtures/gen4/platinum/${name}.dex.json`));
  assert.equal(p.valid,true);assert.deepEqual(p.save.pokedex.allSeenSpecies,expected.seen);assert.deepEqual(p.save.pokedex.allCaughtSpecies,expected.caught);
  const profile={gameId:'platinum',snapshot:{gameId:'platinum',pokedex:p.save.pokedex}};
  assert.deepEqual([...caughtRegistrations(profile,'platinum').species],expected.caught);assert.equal(caughtRegistrations(profile,'soulsilver').species.size,0);
 }
 assert.deepEqual(speciesReference('platinum',387).evYield,{hp:0,attack:1,defense:0,spAttack:0,spDefense:0,speed:0});
});
