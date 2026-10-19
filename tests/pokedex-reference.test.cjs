const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const load=()=>import('../js/data/pokedex-reference.js');
test('HGSS reference covers all 493 species, 12 distinct forms and complete pinned learnsets without modern fallback',async()=>{
 const {pokedexReference,referenceSpecies}=await load();const d=pokedexReference('soulsilver');
 assert.equal(pokedexReference('heartgold'),null);assert.equal(referenceSpecies('x',25),null);assert.equal(referenceSpecies('soulsilver',494),null);
 assert.equal(Object.keys(d.species).length,505);assert.equal(d.regional.length,256);assert.equal(new Set(d.regional).size,256);assert.equal(d.regional[0],152);
 for(let i=1;i<=493;i++){
  const p=d.species[i];assert.equal(p.id,i);assert.ok(p.name);assert.equal(p.stats.length,6);assert.equal(p.evYield.length,6);
  assert.ok(p.types.every(t=>d.typeChart[t]));assert.ok(p.abilities.length>=1&&p.abilities.every(a=>a<=123&&d.abilities[a].description));
  for(const [level,m]of p.levelMoves)assert.ok(level>=1&&level<=100&&m>=1&&m<=467);
  for(const m of p.machines)assert.ok(d.machines[m]);for(const m of p.tutorMoves)assert.ok(d.tutors[m]);
  assert.ok([...p.eggMoves,...p.tutorMoves].every(m=>m>=1&&m<=467));
 }
 assert.equal(d.species[35].types[0],'normal');assert.deepEqual(d.species[303].types,['steel']);assert.deepEqual(d.species[94].abilities,[26]);
 assert.equal(d.species[100].stats[2],50); // Voltorb's Gen IV Defense, no modern stat adjustment.
 for(const i of [503,504,505,506,507])assert.deepEqual(d.species[i].types,['electric','ghost']);
 assert.deepEqual(d.species[496].stats,[50,180,20,180,20,150]);
 assert.equal(Object.keys(d.machines).length,100);assert.equal(Object.keys(d.abilities).length,123);
 assert.ok(!d.abilities[1].description.includes('keepwild'));
 for(const s of Object.values(d.sources)){assert.match(s.url,/blob\/[a-f0-9]{40}\//);assert.match(s.sha256,/^[a-f0-9]{64}$/);}
 const comparison=JSON.parse(fs.readFileSync(path.join(__dirname,'../docs/pokedex-move-comparison.json')));assert.deepEqual(comparison.differences,[]);assert.deepEqual(comparison.checks,{level:493,egg:493,machines:493,tutor:493});
});
test('evolution families retain babies, branches and all HGSS requirements, with stage-specific Fly compatibility',async()=>{
 const {pokedexReference,evolutionFamily,evolutionRequirement}=await load();const d=pokedexReference('soulsilver');
 assert.deepEqual(evolutionFamily('soulsilver',149),[147,148,149]);assert.deepEqual(evolutionFamily('soulsilver',25),[172,25,26]);
 assert.deepEqual(evolutionFamily('soulsilver',68),[66,67,68]);assert.equal(evolutionFamily('soulsilver',133).length,8);
 assert.ok(!d.species[147].machines.includes('HM02'));assert.ok(!d.species[148].machines.includes('HM02'));assert.ok(d.species[149].machines.includes('HM02'));assert.equal(d.machines.HM02,19);
 assert.equal(new Set(d.evolutions.map(e=>JSON.stringify(e))).size,d.evolutions.length);
 for(const e of d.evolutions){assert.ok(d.species[e.from]&&d.species[e.to]);assert.ok(!evolutionRequirement(e).includes('not verified'));}
 assert.match(evolutionRequirement(d.evolutions.find(e=>e.to===470)),/no Moss Rock in HGSS/);
 assert.match(evolutionRequirement(d.evolutions.find(e=>e.to===292)),/regular Poké Ball/);
 assert.match(evolutionRequirement(d.evolutions.find(e=>e.to===68)),/^Trade$/);
 assert.deepEqual(evolutionFamily('soulsilver',490),[490]);
});
test('Gen IV type, held-item and stat calculations preserve historical mechanics and integer floors',async()=>{
 const {typeMultipliers,heldItems,statRange,referenceSpecies}=await load();const p=id=>referenceSpecies('soulsilver',id);
 const steel=Object.fromEntries(typeMultipliers('soulsilver',['steel']).map(r=>[r.type,r.multiplier]));assert.equal(steel.ghost,.5);assert.equal(steel.dark,.5);assert.equal(steel.fairy,undefined);
 const dragonite=Object.fromEntries(typeMultipliers('soulsilver',p(149).types).map(r=>[r.type,r.multiplier]));assert.equal(dragonite.ice,4);assert.equal(dragonite.ground,0);
 assert.deepEqual(heldItems(p(25)),[{name:'Oran Berry',percent:50},{name:'Light Ball',percent:5},{name:'No item',percent:45}]);
 assert.deepEqual(heldItems(p(25),true),[{name:'Oran Berry',percent:60},{name:'Light Ball',percent:20},{name:'No item',percent:20}]);
 assert.deepEqual(heldItems(p(143)),[{name:'Leftovers',percent:100}]);assert.deepEqual(heldItems(p(1)),[{name:'No item',percent:100}]);
 assert.deepEqual(statRange(p(25),0,50),[95,142]);assert.deepEqual(statRange(p(25),1,50),[54,117]);assert.deepEqual(statRange(p(292),0,100),[1,1]);assert.equal(statRange(p(25),0,101),null);
 for(let i=1;i<=493;i++)for(const l of [1,50,100])for(let stat=0;stat<6;stat++){const r=statRange(p(i),stat,l);assert.ok(r[0]<=r[1]&&Number.isInteger(r[0])&&Number.isInteger(r[1]));}
});
test('Pokédex locations point only to exact existing Atlas IDs and keep conditional encounter/gift records',async()=>{
 const {speciesLocations}=await load();const {ATLAS_LOCATIONS}=await import('../js/data/atlas-locations.js');const names=new Set(ATLAS_LOCATIONS.map(l=>l.name));
 for(let i=1;i<=493;i++)for(const loc of speciesLocations('soulsilver',i)){assert.ok(names.has(loc.location),loc.location);assert.ok(loc.details.length);}
 assert.ok(speciesLocations('soulsilver',152).some(l=>l.location==='New Bark Town'&&l.details.some(t=>t.includes('Choose exactly one'))));
 assert.ok(speciesLocations('soulsilver',243).some(l=>l.location==='Route 29'&&l.details.some(t=>t.includes('Roaming'))));
 assert.ok(speciesLocations('soulsilver',130).some(l=>l.details.some(t=>t.includes('Guaranteed shiny'))));
 assert.deepEqual(speciesLocations('other',25),[]);
});
test('all 505 bundled HGSS sprites match the pinned asset manifest',async()=>{
 const {pokedexReference}=await load();const manifest=JSON.parse(fs.readFileSync(path.join(__dirname,'../assets/pokemon/hgss/manifest.json')));
 assert.equal(Object.keys(manifest.files).length,505);
 for(const p of Object.values(pokedexReference('soulsilver').species)){
  const b=fs.readFileSync(path.join(__dirname,`../assets/pokemon/hgss/${p.sprite}.png`));assert.equal(b.subarray(1,4).toString(),'PNG');assert.equal(crypto.createHash('sha256').update(b).digest('hex'),manifest.files[p.sprite]);
 }
});
