const {test}=require('node:test');
const assert=require('node:assert/strict');
const fixtures=require('./fixtures/safari/reference-cases.json');
const api=import('../js/safari-engine.js');
const zero={plains:0,forest:0,peak:0,water:0};
const base={gameId:'soulsilver',areaId:0,method:'land',time:'morning',blocks:zero,days:0,layout:[0,7,1,5,3,6],progression:{open:true,blockLevel:4}};

test('independent slot fixtures cover no objects, night differences, Surf and Old Rod replacement',async()=>{
 const {resolveSafariSlots}=await api;
 for(const fixture of fixtures.tables){
  const slots=resolveSafariSlots({gameId:'soulsilver',...fixture});
  assert.deepEqual(slots.map(s=>[s.speciesId,s.level]),fixture.expected,`${fixture.source}/${fixture.areaId}/${fixture.method}`);
  assert.equal(slots.reduce((n,s)=>n+s.slotPercent,0),100);
 }
});
test('every independent upgrade boundary includes the day before, at, and after the change',async()=>{
 const {safariMultiplier}=await api;
 for(const [category,days]of Object.entries(fixtures.thresholds))for(const [i,day]of days.entries()){
  assert.equal(safariMultiplier(category,day-1),i+1,`${category}/${day-1}`);
  assert.equal(safariMultiplier(category,day),i+2,`${category}/${day}`);
  assert.equal(safariMultiplier(category,Math.min(255,day+1)),i+2);
 }
 assert.throws(()=>safariMultiplier('water',256));assert.throws(()=>safariMultiplier('water',-1));
});
test('reference Lairon and Bagon cases distinguish points from objects and find minimum days',async()=>{
 const {minimumSafariBlocks,minimumSafariDays,resolveSafariSlots}=await api;
 for(const f of fixtures.minimumDays){
  if(f.minimumBlocks)assert.equal(minimumSafariBlocks(f.requirements,f.days).total,f.minimumBlocks);
  if(f.earliest){
   const earliest=minimumSafariDays(f.requirements);assert.equal(earliest.days,f.earliest);assert.deepEqual(earliest.blocks,f.blocks);
   assert.equal(minimumSafariBlocks(f.requirements,f.earliest-1).possible,false);
   const slots=resolveSafariSlots({...base,areaId:7,blocks:f.blocks,days:110});assert.ok(slots.some(s=>s.speciesId===371&&s.level===45));
   // A different valid combination also qualifies. Extra objects aren't a new wait.
   assert.ok(resolveSafariSlots({...base,areaId:7,blocks:{...f.blocks,forest:10},days:110}).some(s=>s.speciesId===371));
  }
 }
 assert.equal(minimumSafariDays({peak:56,forest:35},{categories:['peak']}),null);
 assert.equal(minimumSafariDays({peak:255,forest:255}),null);
 assert.equal(minimumSafariDays({peak:63}).days,70);
 assert.equal(minimumSafariDays({plains:49,peak:49}).days,100);
});
test('Wetland documented multi-category example fills Furret, Farfetch’d, Pachirisu then retains base slots',async()=>{
 const {resolveSafariSlots}=await api;
 const result=resolveSafariSlots({...base,areaId:5,blocks:{...zero,plains:5,forest:10}});
 assert.deepEqual(result.slice(0,3).map(s=>[s.speciesId,s.level,s.bonusId]),[[162,37,0],[83,41,3],[417,43,4]]);
 assert.deepEqual(result.slice(3).map(s=>[s.speciesId,s.level]),[[21,16],[161,16],[83,16],[21,17],[161,17],[83,17],[132,17]]);
});
test('primary object groups depend on full trainer ID and unlock level, decorations consume slots',async()=>{
 const {safariAvailableObjects,safariBlockScores,evaluateSafariEncounters}=await api;
 assert.deepEqual(safariAvailableObjects(0,null),[]);
 assert.equal(safariAvailableObjects(1,null),null);
 assert.deepEqual(safariAvailableObjects(1,0),[0,1,2,12,19,20]);
 assert.deepEqual(safariAvailableObjects(1,3),[3,4,5,13,14,17]);
 assert.deepEqual(safariAvailableObjects(1,6),[6,7,8,21,22,23]);
 assert.deepEqual(safariAvailableObjects(1,8),[9,10,11,15,16,18]);
 assert.equal(safariAvailableObjects(4,null).length,24);
 assert.deepEqual(safariBlockScores({...zero,peak:12,none:18},30),{plains:0,forest:0,peak:24,water:0});
 assert.throws(()=>safariBlockScores({...zero,peak:12,none:19},30),/30/);
 assert.equal(evaluateSafariEncounters({...base,progression:{open:true,blockLevel:0},blocks:{...zero,plains:1}}).status,'unavailable');
 assert.equal(evaluateSafariEncounters({...base,progression:{open:true,blockLevel:1},blocks:{...zero,plains:1}}).status,'unknown');
 assert.equal(evaluateSafariEncounters({...base,trainerId:3,progression:{open:true,blockLevel:1},blocks:{...zero,plains:1}}).status,'unavailable');
});
test('missing or partially decoded configuration stays unknown; impossible and unsupported states are explicit',async()=>{
 const {evaluateSafariEncounters,resolveSafariSlots,safariRules}=await api;
 assert.equal(evaluateSafariEncounters(base).status,'available');
 for(const patch of [{days:null},{blocks:null},{blocks:{plains:0}},{layout:null},{time:null},{progression:{}},{progression:{open:true}}]){
  const result=evaluateSafariEncounters({...base,...patch});assert.equal(result.status,'unknown',JSON.stringify(patch));assert.deepEqual(result.slots,[]);
 }
 assert.equal(evaluateSafariEncounters({...base,progression:{open:false}}).status,'unavailable');
 assert.equal(evaluateSafariEncounters({...base,areaId:11}).status,'unavailable');
 assert.equal(evaluateSafariEncounters({...base,method:'surf'}).status,'unavailable');
 assert.equal(evaluateSafariEncounters({...base,method:'headbutt'}).status,'unsupported');
 assert.equal(evaluateSafariEncounters({...base,gameId:'heartgold'}).status,'unsupported');
 assert.equal(safariRules('platinum'),null);
 assert.equal(evaluateSafariEncounters({...base,days:-1}).status,'invalid');
 assert.equal(evaluateSafariEncounters({...base,blocks:{...zero,peak:31}}).status,'invalid');
 assert.throws(()=>resolveSafariSlots({...base,time:'dusk'}));
 assert.throws(()=>resolveSafariSlots({...base,gameId:'heartgold'}));
});
test('only active areas age after block unlock, preserve inactive ages and saturate at 255 without mutation',async()=>{
 const {advanceSafariAges,rearrangeSafariAreas}=await api;
 const ages=[0,10,20,30,40,50,60,70,80,90,250,255],layout=[0,1,2,3,4,10];
 const aged=advanceSafariAges(ages,layout,20,{blockLevel:1,clockPenalty:false});
 assert.deepEqual(aged,[20,30,40,50,60,50,60,70,80,90,255,255]);assert.equal(ages[0],0);
 assert.deepEqual(advanceSafariAges(ages,layout,20,{blockLevel:0,clockPenalty:false}),ages);
 assert.deepEqual(advanceSafariAges(ages,layout,20,{blockLevel:4,clockPenalty:true}),ages);
 assert.throws(()=>advanceSafariAges(ages,layout,1,{blockLevel:1}));
 assert.throws(()=>rearrangeSafariAreas('soulsilver',layout,0,1,{customizerUnlocked:false}));
 const swapped=rearrangeSafariAreas('soulsilver',layout,0,1,{customizerUnlocked:true});assert.deepEqual(swapped,[1,0,2,3,4,10]);assert.deepEqual(layout,[0,1,2,3,4,10]);
 // Swapping position never changes identity-bound ages.
 assert.deepEqual(advanceSafariAges(ages,swapped,20,{blockLevel:1,clockPenalty:false}),aged);
});
test('all generated areas/methods/times resolve deterministic ten-slot tables and Atlas catalogue retains every reachable candidate',async()=>{
 const {safariRules,resolveSafariSlots,SAFARI_TIMES}=await api;
 const rules=safariRules('soulsilver');const {SOULSILVER_SAFARI_ENCOUNTERS:rows}=await import('../js/data/games/soulsilver/safari-encounters.js');
 assert.deepEqual(rules.waterAreas,[1,4,5,7,8]);assert.equal(rules.initialLayouts.length,10);
 for(const a of rules.areas)for(const [method,table]of Object.entries(a.methods))for(const [ti,time]of SAFARI_TIMES.entries()){
  const slots=resolveSafariSlots({...base,areaId:a.id,method,time});assert.equal(slots.length,10);assert.deepEqual(slots,resolveSafariSlots({...base,areaId:a.id,method,time}));
  for(const [speciesId,level]of table.base[ti])assert.ok(rows.some(r=>r.areaId===a.id&&r.encounterMethod===method&&r.base&&r.speciesId===speciesId&&r.availableTimes.includes(time)&&r.levels.split(', ').includes(String(level))));
  for(const bonus of table.bonus){const [speciesId,level]=bonus.mons[ti];assert.ok(rows.some(r=>r.areaId===a.id&&r.encounterMethod===method&&r.bonusId===bonus.id&&r.speciesId===speciesId&&r.levels===String(level)&&r.availableTimes.includes(time)));}
 }
});
test('initial availability is confined to the actual six starting areas until the customizer is unlocked',async()=>{
 const {safariAvailableAreas}=await api;
 const layout=[0,7,1,5,3,6];
 assert.deepEqual(safariAvailableAreas({gameId:'soulsilver',customizerUnlocked:false,initialLayout:layout}),layout);
 assert.equal(safariAvailableAreas({gameId:'soulsilver',customizerUnlocked:false}),null);
 assert.equal(safariAvailableAreas({gameId:'soulsilver'}),null);
 assert.deepEqual(safariAvailableAreas({gameId:'soulsilver',customizerUnlocked:true}),[0,1,2,3,4,5,6,7,8,9,10,11]);
 assert.throws(()=>safariAvailableAreas({gameId:'soulsilver',customizerUnlocked:false,initialLayout:[0,1,2,3,4,11]}));
});
test('reference rates reflect occupied slots and day/night level differences rather than fixed species odds',async()=>{
 const {resolveSafariSlots,safariBlockScores}=await api;
 const peak=resolveSafariSlots({...base,areaId:3});
 assert.equal(peak.filter(s=>s.speciesId===74).length*10,40);
 assert.equal(peak.filter(s=>s.speciesId===126).length*10,10);
 const bagon=resolveSafariSlots({...base,areaId:7,days:110,blocks:{...zero,peak:19,forest:9},time:'night'});
 assert.ok(bagon.some(s=>s.speciesId===371&&s.level===44));
 const blocked=resolveSafariSlots({...base,areaId:7,days:109,blocks:{...zero,peak:19,forest:9}});
 assert.ok(!blocked.some(s=>s.speciesId===371));
 const marsh=resolveSafariSlots({...base,areaId:8,method:'oldrod',blocks:{...zero,water:3}});
 assert.equal(marsh.filter(s=>s.speciesId===60).length*10,60);
 assert.throws(()=>safariBlockScores({...zero,plains:NaN},0));
 assert.throws(()=>safariBlockScores({...zero,forest:1.5},0));
 assert.throws(()=>safariBlockScores({...zero,water:-1},0));
});
test('Baoba challenge and National Dex boundaries gate customization and object calls independently',async()=>{
 const {safariCustomizationAccess}=await api;
 assert.deepEqual(safariCustomizationAccess({baobaStage:3,nationalDex:true}),{customizerUnlocked:false,blockCallsEligible:false});
 assert.deepEqual(safariCustomizationAccess({baobaStage:4,nationalDex:false}),{customizerUnlocked:true,blockCallsEligible:false});
 assert.deepEqual(safariCustomizationAccess({baobaStage:5,nationalDex:true}),{customizerUnlocked:true,blockCallsEligible:false});
 assert.deepEqual(safariCustomizationAccess({baobaStage:6,nationalDex:false}),{customizerUnlocked:true,blockCallsEligible:false});
 assert.deepEqual(safariCustomizationAccess({baobaStage:6,nationalDex:true}),{customizerUnlocked:true,blockCallsEligible:true});
 assert.deepEqual(safariCustomizationAccess({baobaStage:6}),{customizerUnlocked:true,blockCallsEligible:null});
 assert.deepEqual(safariCustomizationAccess({}),{customizerUnlocked:null,blockCallsEligible:null});
});
test('primary area initialization clears objects on replacement, swaps move objects and age never resets',async()=>{
 const {reconfigureSafariAreas}=await api;
 const state={gameId:'soulsilver',layout:[0,7,1,5,3,6],areaBlocks:Array.from({length:6},(_,i)=>({...zero,peak:i})),areaAges:Array.from({length:12},()=>110)};
 const original=structuredClone(state),options={customizerUnlocked:true};
 const swapped=reconfigureSafariAreas(state,0,3,options);
 assert.equal(swapped.areaBlocks[0].peak,4);assert.equal(swapped.areaBlocks[4].peak,0);
 const replaced=reconfigureSafariAreas(state,4,11,options);
 assert.deepEqual(replaced.areaBlocks[4],{...zero,none:0});assert.deepEqual(replaced.areaAges,state.areaAges);
 assert.deepEqual(state,original);
});
test('Surf and rod possession restrictions cannot turn unknown access into an available encounter',async()=>{
 const {evaluateSafariEncounters}=await api;
 for(const method of ['surf','oldrod','goodrod','superrod']){
  const water={...base,areaId:1,method};
  assert.equal(evaluateSafariEncounters(water).status,'unknown');
  assert.equal(evaluateSafariEncounters({...water,methodAccess:{[method]:false}}).status,'unavailable');
  assert.equal(evaluateSafariEncounters({...water,methodAccess:{[method]:true}}).status,'available');
 }
 assert.equal(evaluateSafariEncounters({...base,blocks:{...zero,plains:1},progression:{open:true,blockLevel:4,nationalDex:false}}).status,'unavailable');
 assert.equal(evaluateSafariEncounters({...base,blocks:{...zero,plains:1},progression:{open:true,blockLevel:4,baobaStage:3,nationalDex:true}}).status,'unavailable');
});
