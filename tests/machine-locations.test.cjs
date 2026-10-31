const {test}=require('node:test');
const assert=require('node:assert/strict');
test('machine obtain sources retain alternative pickups, costs, conditions and exact Atlas destinations',async()=>{
 const {machineObtainInfo:info}=await import('../js/data/machine-locations.js');
 const {ATLAS_LOCATIONS}=await import('../js/data/atlas-locations.js');
 const {pokedexReference}=await import('../js/data/pokedex-reference.js');
 const names=new Set(ATLAS_LOCATIONS.map(l=>l.name));
 const flame=info('soulsilver','TM35').locations;
 assert.ok(flame.some(r=>r.location==='Goldenrod City'&&r.cost==='10,000 Coins'));
 assert.ok(flame.some(r=>r.location==='Route 28'&&r.conditions.includes('Cut')));
 const quake=info('soulsilver','TM26').locations;
 assert.ok(quake.some(r=>r.location==='Victory Road'&&/last hole on 3F/.test(r.instruction)));
 assert.ok(quake.some(r=>r.location==='Battle Frontier'&&r.cost==='80 BP'));
 const strength=info('soulsilver','HM04').locations;
 assert.equal(strength.filter(r=>r.location==='Route 42').length,1);
 assert.match(strength[0].instruction,/Hiker/);
 for(const m of Object.keys(pokedexReference('soulsilver').machines)){
  const result=info('soulsilver',m);assert.equal('guide' in result,false);
  const seen=new Set();for(const r of result.locations){assert.ok(names.has(r.location));assert.ok(r.instruction);assert.equal(new URLSearchParams(r.href.split('#')[1]).get('location'),r.location);const key=JSON.stringify([r.location,r.instruction,r.cost]);assert.ok(!seen.has(key));seen.add(key);}
 }
 assert.deepEqual(info('platinum','TM35').locations,[]);
 assert.equal('guide' in info('platinum','TM35'),false);
 for(const [g,m] of [['leafgreen','TM35'],['toString','TM35'],['soulsilver','TM00'],['soulsilver','TM350']])assert.equal(info(g,m),null);
});
