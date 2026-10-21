// Reproducible Safari integration audit. Optional primary checkout independently
// verifies every imported slot; no save file or network access is required.
// node scripts/audit-safari-v1.mjs [work/safari-primary] [output.json]
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {safariRules,SAFARI_TIMES,SAFARI_CATEGORIES} from '../js/safari-engine.js';
import {createSafariScenario,updateSafariScenario} from '../js/safari-scenario.js';
import {SAFARI_TARGETS,optimizeSafariTarget,applySafariPlan,safariLiveResults} from '../js/safari-optimizer.js';
const rules=safariRules('soulsilver');
let scenario=createSafariScenario();
for(const [key,value]of Object.entries({baobaStage:6,blockLevel:4,nationalDex:true,open:true,clockPenalty:false,surf:true,oldrod:true,goodrod:true,superrod:true}))scenario=updateSafariScenario(scenario,key,value,{starting:true});
const {version}=JSON.parse(await readFile(new URL('../package.json',import.meta.url),'utf8'));
const report={schemaVersion:1,version,gameId:'soulsilver',primaryRevision:rules.revision,areas:rules.areas.length,reachableMethodTables:0,baseTimeSlots:0,bonusTimeSlots:0,targetSpecies:SAFARI_TARGETS.length,checkedPlans:0,checkedPlanTimes:0,primaryCompared:false,realSaveFixtures:0,failures:[]};
for(const area of rules.areas)for(const table of Object.values(area.methods)){report.reachableMethodTables++;report.baseTimeSlots+=table.base.flat().length;report.bonusTimeSlots+=table.bonus.length*3;}
if(process.argv[2]){
 const checkout=process.argv[2];
 assert.equal(execFileSync('git',['-C',checkout,'rev-parse','HEAD'],{encoding:'utf8'}).trim(),rules.revision,'Use the pinned primary revision');
 execFileSync('git',['-C',checkout,'diff','--exit-code',rules.revision,'--','files/arc/safari_enc.json','include/constants/species.h'],{stdio:'pipe'});
 const raw=JSON.parse(await readFile(`${checkout}/files/arc/safari_enc.json`,'utf8')).encounters;
 const constants=await readFile(`${checkout}/include/constants/species.h`,'utf8');
 const ids=Object.fromEntries([...constants.matchAll(/#define\s+(SPECIES_\w+)\s+(\d+)\b/g)].map(m=>[m[1],Number(m[2])]));
 for(const area of rules.areas)for(const [method,table]of Object.entries(area.methods)){
  const original=raw[area.id][method];
  assert.deepEqual(table.base,['morn','day','nite'].map(time=>original.mons[time].map(m=>[ids[m.species],m.level])));
  assert.deepEqual(table.bonus,original.bonus_mons.map((bonus,id)=>({id,requirements:Object.fromEntries(bonus.conditions.map(c=>[c.object_type.replace('SAFARI_ZONE_OBJECT_TYPE_','').toLowerCase(),c.count])),mons:['morn','day','nite'].map(time=>[ids[bonus[time].species],bonus[time].level])})));
 }
 report.primaryCompared=true;
}
const original=JSON.stringify(scenario),covered=new Set();
for(const target of SAFARI_TARGETS){
 const result=optimizeSafariTarget(scenario,target.id,{limit:10000});
 assert.ok(result.plans.length,`${target.name}: no plan with all unlocks`);
 for(const plan of result.plans){
  const after=applySafariPlan(scenario,plan);report.checkedPlans++;
  assert.deepEqual(after.starting,scenario.starting);assert.deepEqual(after.original,scenario.original);
  assert.ok(plan.totalObjects<=30);assert.equal(after.current.values[`age.${plan.areaId}`],plan.days);
  for(const category of [...SAFARI_CATEGORIES,'none'])assert.equal(after.current.values[`blocks.${plan.position}.${category}`],plan.blocks[category]);
  for(const time of plan.availableTimes){
   const timed=updateSafariScenario(after,'time',time),live=safariLiveResults(timed,plan.position,plan.method);
   assert.equal(live.status,'available',`${target.name}: ${live.reasons}`);
   const encounter=live.encounters.find(e=>e.speciesId===target.id);
   assert.ok(encounter,`${target.name}: plan does not produce target`);assert.equal(encounter.percent,plan.percent);assert.deepEqual(encounter.levels,plan.levels);
   report.checkedPlanTimes++;covered.add(`${plan.areaId}/${plan.method}/${time}`);
  }
 }
 assert.equal(JSON.stringify(scenario),original,'Optimizer or preview mutated its input');
}
report.coveredAreaMethodTimes=covered.size;
assert.equal(covered.size,96,'Every reachable area/method/time needs a replayed plan');
report.mechanicsSha256=createHash('sha256').update(await readFile(new URL('../js/data/games/soulsilver/safari-mechanics.js',import.meta.url))).digest('hex');
if(process.argv[3])await writeFile(process.argv[3],JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
