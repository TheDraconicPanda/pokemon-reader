const {test}=require('node:test');const assert=require('node:assert/strict');
const api=import('../scripts/audit-platinum-atlas.mjs'),data=api.then(a=>a.loadPlatinumAtlasInputs());
async function assess(edit){const a=await api,input=structuredClone(await data);if(edit)edit(input);return a.assessPlatinumAtlas(input);}
const has=(r,code)=>r.mandatoryFailures.some(f=>f.code===code);
test('complete Platinum census covers every reviewed location, native area and method with independently matched or resolved data',async()=>{
 const r=await assess();assert.equal(r.completionPassed,true,JSON.stringify(r.mandatoryFailures));
 assert.equal(r.coverage.expectedLocations,125);assert.equal(r.coverage.implementedLocations,125);assert.equal(r.coverage.locationCoveragePercent,100);
 assert.equal(r.coverage.nativeHeaders,593);assert.equal(r.coverage.includedAreas,501);assert.equal(r.coverage.excludedHeaders,92);
 assert.equal(r.coverage.terrainPlans,501);assert.equal(r.coverage.headerEncounterTables,154);assert.equal(r.coverage.warpReferences,488);
 assert.equal(r.coverage.encounterRows,5724);assert.deepEqual(r.independent.resolvedDiscrepancies,[63,82]);assert.equal(r.independent.slotComparisons,7920);
 assert.equal(r.specialSystems.fixedScriptCommands,21);assert.equal(r.specialSystems.npcTrades,4);assert.equal(r.specialSystems.roamers,5);assert.equal(r.specialSystems.honeyTrees,21);assert.equal(r.specialSystems.trophyGardenVisitors,16);
});
test('Platinum missing locations/areas and disconnected or deleted travel cannot shrink the coverage denominator',async()=>{
 let r=await assess(i=>i.atlas.locations=i.atlas.locations.filter(l=>l.name!=='Twinleaf Town'));assert.equal(r.coverage.expectedLocations,125);assert.ok(has(r,'missing-location'));assert.ok(has(r,'broken-navigation'));
 r=await assess(i=>i.atlas.locations.push(structuredClone(i.atlas.locations[0])));assert.ok(has(r,'duplicate-location'));
 r=await assess(i=>i.atlas.locations.find(l=>l.name==='Fullmoon Island').connections=[]);assert.ok(has(r,'missing-navigation'));
 r=await assess(i=>i.atlas.locations.find(l=>l.name==='Lost Tower').headers.pop());assert.ok(has(r,'missing-area'));
 r=await assess(i=>i.atlas.locations.find(l=>l.name==='Twinleaf Town').connections.push('Johto'));assert.ok(has(r,'broken-navigation'));
 r=await assess(i=>i.atlas.locations[0].region='Johto');assert.ok(has(r,'invalid-regional-id'));
});
test('Platinum invalid species, methods, rates, levels, conditions and omitted source rows fail audit',async()=>{
 for(const [key,value,code]of [['speciesId',999,'invalid-species'],['method','headbutt','invalid-method'],['percent',101,'invalid-rate'],['levels',[101],'invalid-level'],['times',['winter'],'invalid-condition'],['source',null,'missing-source'],['area','MAP_HEADER_NEW_BARK_TOWN','invalid-area']]){
  const r=await assess(i=>i.atlas.encounters['Route 201'][0][key]=value);assert.ok(has(r,code),code);
 }
 let r=await assess(i=>i.atlas.encounters['Route 201'].pop());assert.ok(has(r,'missing-encounters'));
 r=await assess(i=>i.atlas.encounters['Route 201'][0].percent--);assert.ok(has(r,'changed-encounters'));
 r=await assess(i=>i.displayed['Route 201'].encounters.pop());assert.ok(has(r,'undisplayed-encounters'));
});
test('Platinum missing progression, impossible HMs and undocumented source disagreements cannot pass',async()=>{
 let r=await assess(i=>i.atlas.locations.find(l=>l.name==='Mt. Coronet').accessRequirements[0].id='whirlpool');assert.ok(has(r,'impossible-requirement'));
 r=await assess(i=>i.atlas.encounters['Hall of Origin'][0].conditions=[]);assert.ok(has(r,'missing-prerequisite'));
 r=await assess(i=>i.decisions.decisions=i.decisions.decisions.filter(d=>d.apiArea!==82));assert.ok(has(r,'unresolved-discrepancy'));
 r=await assess(i=>i.ledger.sources['include/data/map_headers.h'].sha256='0'.repeat(64));assert.ok(has(r,'changed-source-ledger'));
 r=await assess(i=>i.comparison.atlasInputSha256='stale');assert.ok(has(r,'stale-independent-evidence'));
});
test('Platinum missing/corrupt maps and floor links, incomplete special systems and lost daily pools fail audit',async()=>{
 let r=await assess(i=>i.maps.locations['Mt. Coronet'].pop());assert.ok(has(r,'missing-map'));
 r=await assess(i=>i.assets['platinum/mt_coronet_2f.png'].sha256='corrupt');assert.ok(has(r,'broken-map'));
 r=await assess(i=>i.maps.links['Mt. Coronet'].pairs[0].ends[0].x=-1);assert.ok(has(r,'broken-floor-link'));
 r=await assess(i=>i.atlas.specialSystems.honeyTrees.pop());assert.ok(has(r,'missing-special-system'));
 r=await assess(i=>i.atlas.greatMarshPools.after_national_dex.pop());assert.ok(has(r,'incomplete-great-marsh'));
});
test('Platinum source facts keep exact boats, gifts, event restrictions, field badges and unreachable placeholders distinct',async()=>{
 const {atlas:a}=await data;
 assert.ok(a.locations.find(l=>l.name==='Fullmoon Island').connections.includes('Canalave City'));
 assert.ok(a.locations.find(l=>l.name==='Fight Area').connections.includes('Snowpoint City'));
 assert.equal(a.travel.hms.fly.badge,'Cobble Badge');assert.equal(a.travel.hms.defog.badge,'Relic Badge');
 for(const n of ['Route 201','Mining Museum','Old Chateau','Iron Island','Verity Cavern'])assert.ok(a.encounters[n].some(r=>['gift','interaction','roaming'].includes(r.method)));
 assert.ok(a.encounters['Snowpoint City'].some(r=>r.pokemon==='Haunter'&&r.conditions.some(c=>c.includes('Everstone'))));
 assert.ok(a.encounters['Hall of Origin'].every(r=>r.availability==='Unreleased event'));
 assert.ok(a.encounters['Iron Ruins'].every(r=>r.conditions.some(c=>c.includes('fateful'))));
 assert.equal(a.tables.MAP_HEADER_TURNBACK_CAVE_GIRATINA_ROOM,undefined);assert.equal(a.tables.MAP_HEADER_TURNBACK_CAVE_PILLAR_3_ROOM_1.data.land_encounters[8].level,38);
 assert.ok(!a.encounters['Iron Island'].some(r=>r.conditions.includes('Active outbreak on this map')));
 assert.ok(a.encounters['Eterna Forest'].some(r=>r.conditions.some(c=>c.includes('Poké Radar'))));
 assert.ok(!a.encounters['Lost Tower'].some(r=>r.conditions.some(c=>c.includes('Poké Radar'))));
});

test('Platinum reuses shared EV ranking with native yields, complete ordinary distributions and exact area links, excluding capture-only parks',async()=>{
 const {rankEvTraining,evEncounterTables,scoreEvEncounters}=await import('../js/data/atlas-ev-training.js');
 const {atlasGameReference}=await import('../js/data/atlas-game-reference.js');
 assert.equal(atlasGameReference('platinum').homeLocation,'Twinleaf Town');assert.equal(atlasGameReference('soulsilver').homeLocation,'New Bark Town');assert.equal(atlasGameReference('heartgold'),null);
 for(const time of ['morn','day','nite']){
  const tables=evEncounterTables('platinum',time);assert.ok(tables.length>100);
  for(const t of tables){assert.equal(t.rows.reduce((n,r)=>n+r.percent,0),100);assert.ok(t.areaId.startsWith('MAP_HEADER_'));assert.notEqual(t.location,'Great Marsh');assert.notEqual(t.location,'Pal Park');}
 }
 const results=rankEvTraining('platinum',{stat:'speed',cleanOnly:true});assert.ok(results.length);assert.equal(results[0].method,'surfing');assert.ok(results.every(r=>r.cleanPercent===100&&r.expectedEv>0));
 const simple=scoreEvEncounters('platinum',[{pokemon:'Magikarp',percent:100,levels:[10]}],'speed');assert.equal(simple.expectedEv,1);assert.equal(simple.usefulPercent,100);
 assert.throws(()=>scoreEvEncounters('platinum',[{pokemon:'Magikarp',percent:90,levels:[10]}],'speed'),/complete/);
 assert.ok(!evEncounterTables('platinum').some(t=>t.conditions.some(c=>/radio|Headbutt/.test(c))));
});
