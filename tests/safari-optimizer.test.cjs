const {test}=require('node:test');
const assert=require('node:assert/strict');
const reference=require('./fixtures/safari/reference-cases.json');
const api=import('../js/safari-optimizer.js');
const scenarioApi=import('../js/safari-scenario.js');
async function configured(){const {createSafariScenario,updateSafariScenario}=await scenarioApi;let s=createSafariScenario();for(const [k,v]of Object.entries({baobaStage:6,blockLevel:4,nationalDex:true,customizerUnlocked:true,surf:true,oldrod:true,goodrod:true,superrod:true}))s=updateSafariScenario(s,k,v,{starting:true});return s;}
async function set(s,key,value){return (await scenarioApi).updateSafariScenario(s,key,value,{starting:true});}

test('optimizer reproduces independently documented Bagon and Lairon setups instead of adding a separate wait gate',async()=>{
 const {optimizeSafariTarget}=await api;let s=await configured();
 const bagon=optimizeSafariTarget(s,371).plans[0],expected=reference.minimumDays.find(f=>f.source==='bagon');
 assert.equal(bagon.areaId,7);assert.equal(bagon.method,'land');assert.equal(bagon.days,expected.earliest);assert.equal(bagon.additionalDays,110);
 assert.deepEqual(bagon.blocks,{...expected.blocks,none:0});assert.equal(bagon.percent,10);assert.equal(bagon.alreadyQualifies,false);
 const lairon=optimizeSafariTarget(s,305).plans[0];assert.equal(lairon.additionalDays,0);assert.equal(lairon.blocks.peak,24);
 s=await set(s,'age.3',30);const aged=optimizeSafariTarget(s,305).plans[0];assert.equal(aged.additionalDays,0);assert.equal(aged.blocks.peak,12);
 s=await set(s,'age.7',100);assert.equal(optimizeSafariTarget(s,371).plans[0].additionalDays,10);
});
test('independent two-category and large-score targets have the correct earliest area ages',async()=>{
 const {optimizeSafariTarget}=await api;const s=await configured();
 const gible=optimizeSafariTarget(s,443).plans[0];assert.equal(gible.areaId,4);assert.equal(gible.days,100);assert.deepEqual(gible.blocks,{plains:13,forest:0,peak:17,water:0,none:0});assert.equal(gible.replaceArea,true);
 const riolu=optimizeSafariTarget(s,447).plans[0];assert.equal(riolu.days,70);assert.deepEqual(riolu.blocks,{plains:0,forest:10,peak:14,water:0,none:0});
 const beldum=optimizeSafariTarget(s,374).plans[0];assert.equal(beldum.days,70);assert.equal(beldum.blocks.peak,21);
});
test('already available base encounters outrank unnecessary object placement and night restrictions stay explicit',async()=>{
 const {optimizeSafariTarget}=await api;let s=await configured();
 const magmar=optimizeSafariTarget(s,126).plans[0];assert.equal(magmar.alreadyQualifies,true);assert.equal(magmar.status,'ready');assert.equal(magmar.objectOperations,0);assert.equal(magmar.totalObjects,0);
 s=await set(s,'time','night');const night=optimizeSafariTarget(s,126).plans[0];assert.equal(night.status,'time');assert.equal(night.timeChange,true);assert.ok(['morning','day'].includes(night.time));assert.equal(night.alreadyQualifies,false);
});
test('minimum-change projection handles capacity residues rather than discarding all unrelated objects',async()=>{
 const {optimizeSafariTarget}=await api;let s=await configured();s=await set(s,'blocks.4.forest',25);s=await set(s,'blocks.4.peak',5);
 const plan=optimizeSafariTarget(s,305).plans[0];assert.equal(plan.additionalDays,0);assert.equal(plan.blocks.peak,24);assert.equal(plan.blocks.forest,6);assert.equal(plan.totalObjects,30);assert.equal(plan.objectOperations,38);
});
test('optimizer accounts for base encounters displaced by object slots and minimizes removals',async()=>{
 const {optimizeSafariTarget,safariLiveResults,applySafariPlan}=await api;let s=await configured();s=await set(s,'age.0',250);
 for(const [c,n]of Object.entries({plains:3,forest:3,peak:3,water:4}))s=await set(s,`blocks.0.${c}`,n);
 assert.ok(!safariLiveResults(s,0,'land').encounters.some(r=>r.speciesId===19));
 const plan=optimizeSafariTarget(s,19,{limit:100}).plans.find(p=>p.areaId===0);assert.equal(plan.additionalDays,0);assert.equal(plan.objectOperations,4);
 const after=applySafariPlan(s,plan);assert.ok(safariLiveResults(after,plan.position,plan.method).encounters.some(r=>r.speciesId===19));
});
test('locked calls, Area Customizer, National Dex and Surf/rod access are explained without invented progress',async()=>{
 const {optimizeSafariTarget}=await api;let s=await configured();
 s=await set(s,'blockLevel',1);s=await set(s,'trainerId',0);
 const locked=optimizeSafariTarget(s,305);assert.equal(locked.plans.length,0);assert.equal(locked.status,'locked');assert.ok(locked.issues.some(i=>i.reasons.join(' ').includes('object-category')));
 s=await configured();s=await set(s,'customizerUnlocked',false);assert.equal(optimizeSafariTarget(s,443).status,'locked');
 s=await configured();s=await set(s,'nationalDex',false);assert.equal(optimizeSafariTarget(s,371).status,'locked');
 s=await configured();s=await set(s,'superrod',false);s=await set(s,'goodrod',false);const corphish=optimizeSafariTarget(s,341);assert.equal(corphish.plans.length,0);assert.ok(corphish.issues.some(i=>i.reasons.join(' ').includes('Super Rod')));
 s=await configured();s=await set(s,'surf',false);assert.equal(optimizeSafariTarget(s,131).status,'locked');
});
test('unknown starting values cannot produce a confirmed plan; waiting clock assumptions stay visible',async()=>{
 const {optimizeSafariTarget}=await api;let s=await configured();
 s=await set(s,'age.7',null);assert.equal(optimizeSafariTarget(s,371).status,'unknown');assert.equal(optimizeSafariTarget(s,371).plans.length,0);
 s=await configured();s=await set(s,'blocks.1.none',null);assert.equal(optimizeSafariTarget(s,371).status,'unknown');
 s=await configured();s=await set(s,'nationalDex',null);assert.equal(optimizeSafariTarget(s,371).status,'unknown');
 s=await configured();s=await set(s,'baobaStage',null);assert.equal(optimizeSafariTarget(s,371).status,'unknown');
 s=await configured();s=await set(s,'layout.0',null);assert.equal(optimizeSafariTarget(s,371).status,'unknown');
 s=await configured();s=await set(s,'blockLevel',2);s=await set(s,'trainerId',null);assert.equal(optimizeSafariTarget(s,371).status,'unknown');
 s=await configured();s=await set(s,'clockPenalty',true);assert.match(optimizeSafariTarget(s,371).plans[0].warnings.join(' '),/penalty/);
 s=await set(s,'clockPenalty',null);assert.match(optimizeSafariTarget(s,371).plans[0].warnings.join(' '),/unknown/);
});
test('previewing plans advances only hypothetical credited ages and leaves original/manual starting state intact',async()=>{
 const {optimizeSafariTarget,applySafariPlan,safariLiveResults}=await api;const s=await configured(),original=structuredClone(s);
 const plan=optimizeSafariTarget(s,371).plans[0],after=applySafariPlan(s,plan);
 assert.deepEqual(s,original);assert.deepEqual(after.starting,s.starting);assert.deepEqual(after.original,s.original);
 assert.equal(after.current.values['age.7'],110);assert.equal(after.current.provenance['age.7'],'hypothetical');assert.equal(after.current.values['age.0'],110);
 assert.equal(safariLiveResults(after,plan.position,plan.method).encounters.find(r=>r.speciesId===371).percent,10);
 assert.equal(optimizeSafariTarget(after,371).plans[0].alreadyQualifies,true);
 const changed=await set(s,'age.7',10);assert.throws(()=>applySafariPlan(changed,plan),/Recalculate/);
});
test('inactive-area plans clear replaced objects, age by identity and preserve unrelated unknown counters',async()=>{
 const {optimizeSafariTarget,applySafariPlan}=await api;let s=await configured();s=await set(s,'age.0',null);
 const plan=optimizeSafariTarget(s,443,{replacePosition:3}).plans[0];assert.equal(plan.position,3);assert.equal(plan.previousArea,5);
 const after=applySafariPlan(s,plan);assert.equal(after.current.values['layout.3'],4);assert.equal(after.current.values['age.4'],100);assert.equal(after.current.values['age.0'],null);assert.equal(after.current.values['age.5'],0);
 assert.equal(after.current.values['blocks.3.plains'],13);assert.equal(after.current.values['blocks.3.peak'],17);assert.equal(after.current.values['blocks.3.none'],0);
});
test('live results retain independent exact rod tables and unknown decorations never become zero',async()=>{
 const {safariLiveResults}=await api;let s=await configured();s=await set(s,'layout.0',4);s=await set(s,'blocks.0.water',8);s=await set(s,'time','day');
 const result=safariLiveResults(s,0,'goodrod');const kingler=result.encounters.find(r=>r.speciesId===99);
 assert.equal(result.status,'available');assert.deepEqual(kingler.levels,[26,27]);assert.equal(kingler.percent,20);assert.ok(result.basis.manual.length>0);
 s=await set(s,'blocks.0.none',null);assert.equal(safariLiveResults(s,0,'goodrod').status,'unknown');
 assert.equal((await api).optimizeSafariTarget(s,493).status,'unsupported');
});

test('equivalent-time merging preserves different slot shares even when species and levels match',async()=>{
 const {optimizeSafariTarget}=await api,s=await configured();
 const plans=optimizeSafariTarget(s,39,{limit:100}).plans.filter(p=>p.areaId===1&&p.totalObjects===0);
 const morning=plans.find(p=>p.availableTimes.includes('morning'));
 const day=plans.find(p=>p.availableTimes.includes('day'));
 assert.equal(morning.percent,50);assert.deepEqual(morning.availableTimes,['morning']);
 assert.equal(day.percent,30);assert.ok(day.availableTimes.includes('night'));
});
