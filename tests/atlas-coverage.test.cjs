const {test}=require('node:test');
const assert=require('node:assert/strict');
const api=import('../scripts/audit-atlas.mjs');
const data=api.then(a=>a.loadAtlasInputs());
async function assess(edit){const a=await api,input=structuredClone(await data);if(edit)edit(input);return a.assessAtlas(input);}
const has=(r,code)=>r.mandatoryFailures.some(f=>f.code===code);
test('two-region coverage derives from an independent inventory, primary recipes and source hashes',async()=>{
 const r=await assess();assert.equal(r.integrityPassed,true,JSON.stringify(r.mandatoryFailures));
 assert.deepEqual(Object.fromEntries(Object.entries(r.coverage.regions).map(([n,v])=>[n,[v.expected,v.implemented,v.locationCoveragePercent]])),{Johto:[63,63,100],Kanto:[59,59,100]});
 assert.equal(r.coverage.overall.expected,122);assert.equal(r.primaryMaps.length,540);assert.equal(r.navigation.connections.length,276);assert.deepEqual(r.navigation.orphans,[]);assert.deepEqual(r.navigation.broken,[]);
 assert.equal(r.locations.find(l=>l.name==='Safari Zone').encounters.sublocations.length,12);
 assert.equal(r.referenceVerification.fullyVerifiedCurrentKanto,false);assert.ok(r.referenceVerification.warnings.length>0);assert.ok(r.referenceVerification.uncertainties.every(u=>u.id&&u.detail));
});
test('removing a location reduces calculated coverage instead of shrinking the denominator',async()=>{
 const r=await assess(i=>i.locations=i.locations.filter(l=>l.name!=='Pallet Town'));
 assert.equal(r.coverage.overall.expected,122);assert.equal(r.coverage.overall.implemented,121);assert.ok(r.coverage.overall.locationCoveragePercent<100);assert.ok(has(r,'missing-location'));assert.ok(has(r,'broken-navigation'));
});
test('broken, missing, duplicate, unreviewed and orphaned navigation fail mandatory checks',async()=>{
 let r=await assess(i=>i.locations.find(l=>l.name==='Pallet Town').connections.push('Missing cave'));assert.ok(has(r,'broken-navigation'));
 r=await assess(i=>i.locations.find(l=>l.name==='Pallet Town').connections=[]);assert.ok(has(r,'missing-navigation'));assert.ok(has(r,'nonreciprocal-navigation'));
 r=await assess(i=>{for(const l of i.locations)l.connections=l.connections.filter(n=>n!=='Pallet Town');i.locations.find(l=>l.name==='Pallet Town').connections=[];});assert.ok(has(r,'orphan-location'));
 r=await assess(i=>i.locations.push(structuredClone(i.locations[0])));assert.ok(has(r,'duplicate-location'));
 r=await assess(i=>i.compass[0][2]='east');assert.ok(has(r,'incorrect-compass'));
 r=await assess(i=>i.travel[JSON.stringify(['Route 22','Pokémon League Reception Gate'])].conditions=[]);assert.ok(has(r,'travel-condition-mismatch'));
});
test('missing rows, levels, rates, special continuations and display omissions cannot pass',async()=>{
 let r=await assess(i=>i.raw['Route 1'].encounters.pop());assert.ok(has(r,'changed-or-missing-encounters'));
 r=await assess(i=>i.raw['Route 1'].encounters[0].percent--);assert.ok(has(r,'incomplete-encounter-distribution'));
 r=await assess(i=>i.raw['Route 1'].encounters[0].levels=[101]);assert.ok(has(r,'invalid-levels'));
 r=await assess(i=>i.supplemental['Burned Tower']=[]);assert.ok(has(r,'missing-special-continuation'));
 r=await assess(i=>i.displayed['Route 1']=[]);assert.ok(has(r,'undisplayed-encounters'));
 r=await assess(i=>i.raw['Route 1'].encounters[0].pokemon='Unverified monster');assert.ok(has(r,'unknown-species'));
});
test('asset corruption, missing floor choices, deleted stair links and stale source evidence fail',async()=>{
 let r=await assess(i=>i.assetChecks['kanto-cerulean-cave-1f.png'].sha256='changed');assert.ok(has(r,'broken-map-asset'));
 r=await assess(i=>i.maps['Cerulean Cave'].pop());assert.ok(has(r,'missing-inventoried-map-view'));
 r=await assess(i=>i.mapLinks['Whirl Islands'].pop());assert.ok(has(r,'missing-or-changed-floor-link'));
 r=await assess(i=>i.sourceChecks[Object.keys(i.sourceChecks)[0]]=false);assert.ok(has(r,'stale-reference-input'));
});
test('unverified reference information requires explicit documentation, never a fabricated verified flag',async()=>{
 const r=await assess(i=>i.referenceChecks.uncertainties=[]);assert.ok(has(r,'undocumented-reference-uncertainty'));
 const missing=await assess(i=>i.inventory.locations.find(l=>l.name==='Pallet Town').references=[]);assert.ok(has(missing,'missing-reference-site'));
});
test('the existing Safari audit remains mandatory without changing its mechanics or layout assumptions',async()=>{
 let r=await assess(i=>i.safariMechanicsSha256='changed');assert.ok(has(r,'changed-safari-mechanics'));
 r=await assess(i=>i.safariTopology[0].south='gate');assert.ok(has(r,'broken-safari-exit'));
 r=await assess(i=>i.safari.areas.pop());assert.ok(has(r,'missing-safari-area'));assert.ok(has(r,'missing-safari-method'));
});

test('CI stale-report comparison ignores run metadata while retaining data and coverage fingerprints',async()=>{
 const {stableReport}=await api;
 const base={coverage:{expected:122,implemented:122},inputSha256:{data:'abc'},completionPassed:true,generatedAt:'old',automatedTests:{status:'passed',tests:237}};
 const rerun={...base,generatedAt:'new',automatedTests:{status:'passed',tests:238}};assert.equal(stableReport(base),stableReport(rerun));
 assert.notEqual(stableReport(base),stableReport({...rerun,inputSha256:{data:'changed'}}));
 assert.notEqual(stableReport(base),stableReport({...rerun,coverage:{expected:122,implemented:121}}));
});
