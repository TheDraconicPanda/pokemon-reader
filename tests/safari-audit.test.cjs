const {test}=require('node:test');
const assert=require('node:assert/strict');
const fixtures=require('./fixtures/safari/reference-cases.json');
const engine=import('../js/safari-engine.js'),stateApi=import('../js/safari-scenario.js'),optimizer=import('../js/safari-optimizer.js');
const cats=['plains','forest','peak','water'];
async function configured(){const {createSafariScenario,updateSafariScenario}=await stateApi;let s=createSafariScenario();for(const [key,value]of Object.entries({open:true,baobaStage:6,blockLevel:4,nationalDex:true,surf:true,oldrod:true,goodrod:true,superrod:true}))s=updateSafariScenario(s,key,value,{starting:true});return s;}
// Exhaustive integer oracle, independent of threshold-cell projection/ranking.
// Raw slots were independently compared to the pinned primary by the audit CLI.
function exhaustiveCost(table,id,time,days,current){
 const ti=['morning','day','night'].indexOf(time),multipliers=cats.map(c=>1+fixtures.thresholds[c].filter(t=>days>=t).length);
 let best=Infinity;
 for(let a=0;a<=30;a++)for(let b=0;b<=30-a;b++)for(let c=0;c<=30-a-b;c++)for(let d=0;d<=30-a-b-c;d++){
  const counts=[a,b,c,d],none=Math.min(current.none,30-a-b-c-d),cost=counts.reduce((n,v,i)=>n+Math.abs(v-current[cats[i]]),Math.abs(none-current.none));
  if(cost>=best)continue;
  const qualified=table.bonus.filter(row=>Object.entries(row.requirements).every(([cat,n])=>counts[cats.indexOf(cat)]*multipliers[cats.indexOf(cat)]>=n)).slice(0,10);
  const slots=[...qualified.map(row=>row.mons[ti]),...table.base[ti].slice(qualified.length)];
  if(slots.some(mon=>mon[0]===id))best=cost;
 }
 return best;
}
test('minimum-change optimizer agrees with exhaustive 30-object allocations for base displacement, capacity and aged targets',async()=>{
 const {safariRules}=await engine,{updateSafariScenario}=await stateApi,{optimizeSafariTarget}=await optimizer;
 const cases=[
  {area:0,id:19,days:250,counts:[3,3,3,4,0]},
  {area:3,id:305,days:0,counts:[0,25,5,0,0]},
  {area:7,id:371,days:110,counts:[0,0,0,0,30]},
  {area:1,id:447,days:70,counts:[0,0,0,30,0]},
  {area:3,id:126,days:250,counts:[10,10,10,0,0]},
  {area:4,id:131,days:100,counts:[0,0,0,30,0],method:'surf'}
 ];
 for(const entry of cases){
  let s=await configured();s=updateSafariScenario(s,'layout.0',entry.area,{starting:true});s=updateSafariScenario(s,`age.${entry.area}`,entry.days,{starting:true});
  const blocks=Object.fromEntries([...cats,'none'].map((cat,i)=>[cat,entry.counts[i]]));
  for(const [cat,count]of Object.entries(blocks))s=updateSafariScenario(s,`blocks.0.${cat}`,count,{starting:true});
  const method=entry.method||'land',expected=exhaustiveCost(safariRules('soulsilver').areas[entry.area].methods[method],entry.id,'morning',entry.days,blocks);
  const plans=optimizeSafariTarget(s,entry.id,{limit:10000}).plans.filter(p=>p.areaId===entry.area&&p.method===method&&p.additionalDays===0&&p.availableTimes.includes('morning'));
  assert.equal(plans.length?Math.min(...plans.map(p=>p.objectOperations)):Infinity,expected,`${entry.id}, area ${entry.area}`);
 }
});
test('all independent encounter fixtures survive scenario initialization and live aggregation',async()=>{
 const {updateSafariScenario}=await stateApi,{safariLiveResults}=await optimizer;
 for(const fixture of fixtures.tables){
  let s=await configured();s=updateSafariScenario(s,'layout.0',fixture.areaId,{starting:true});s=updateSafariScenario(s,'time',fixture.time,{starting:true});s=updateSafariScenario(s,`age.${fixture.areaId}`,fixture.days,{starting:true});
  for(const [cat,count]of Object.entries(fixture.blocks))s=updateSafariScenario(s,`blocks.0.${cat}`,count,{starting:true});
  const result=safariLiveResults(s,0,fixture.method);assert.equal(result.status,'available');
  assert.deepEqual(result.slots.map(slot=>[slot.speciesId,slot.level]),fixture.expected);
  assert.equal(result.encounters.reduce((n,row)=>n+row.percent,0),100);
 }
});
test('every Safari target plan and advertised time can be replayed without changing the original or baseline',()=>{
 const path=require('node:path'),root=path.resolve(__dirname,'..');
 const run=require('node:child_process').spawnSync(process.execPath,['scripts/audit-safari-v1.mjs'],{cwd:root,encoding:'utf8',timeout:60000});
 assert.equal(run.status,0,run.stderr||run.stdout);
 const report=JSON.parse(run.stdout);assert.equal(report.targetSpecies,153);assert.equal(report.coveredAreaMethodTimes,96);assert.ok(report.checkedPlans>2000);assert.ok(report.checkedPlanTimes>6000);assert.deepEqual(report.failures,[]);
});
test('unknown object-group identity does not hide an already qualifying object-free base encounter',async()=>{
 const {updateSafariScenario}=await stateApi,{optimizeSafariTarget,safariLiveResults}=await optimizer;
 let s=await configured();for(const [key,value]of Object.entries({blockLevel:1,trainerId:null,nationalDex:null,baobaStage:null}))s=updateSafariScenario(s,key,value,{starting:true});
 const live=safariLiveResults(s,4,'land');assert.equal(live.status,'available');assert.equal(live.basis.unavailable.length,0);
 const result=optimizeSafariTarget(s,126);assert.equal(result.plans[0].alreadyQualifies,true);assert.equal(result.plans[0].totalObjects,0);assert.equal(result.plans[0].basis.unavailable.length,0);
 assert.equal(optimizeSafariTarget(s,371).status,'unknown');assert.equal(optimizeSafariTarget(s,371).plans.length,0);
});
