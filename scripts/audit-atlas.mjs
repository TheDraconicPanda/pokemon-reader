// Regenerate the two-region report from runtime data + the independent reference inventory.
// npm run validate:atlas runs all automated tests and fails on mandatory defects.
import {readFile,writeFile,readdir,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {spawn} from 'node:child_process';
import {fileURLToPath,pathToFileURL} from 'node:url';
import path from 'node:path';
const ROOT=fileURLToPath(new URL('../',import.meta.url));
export const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const key=(a,b)=>JSON.stringify([a,b]);
const times=['morn','day','nite'];
const ordinary=new Set(['walking','surfing','old_rod','good_rod','super_rod','headbutt','rock-smash','contest']);
const opposite={north:'south',south:'north',east:'west',west:'east',other:'other'};
const percentage=(n,d)=>d?Math.round(n/d*10000)/100:0;
const json=async file=>JSON.parse(await readFile(path.join(ROOT,file),'utf8'));

export async function loadAtlasInputs(){
 const [{ATLAS_LOCATIONS:locations},{SOULSILVER_ROUTE_ENCOUNTERS:routes},{SOULSILVER_LOCATION_ENCOUNTERS:legacy},{KANTO_ENCOUNTERS:kanto},{locationEncounterReference},{mapsForLocation},{mapLinksForLocation},{travelConnection},{KANTO_COMPASS:compass},{speciesIdForName},{encounterSections},{SOULSILVER_SAFARI_MECHANICS:safari},{SOULSILVER_SAFARI_ENCOUNTERS:safariRows},{safariReference,safariNeighbors}]=await Promise.all([
  import('../js/data/atlas-locations.js'),import('../js/data/games/soulsilver/route-encounters.js'),import('../js/data/games/soulsilver/location-encounters.js'),import('../js/data/games/soulsilver/kanto-encounters.js'),import('../js/data/atlas-route-reference.js'),import('../js/data/atlas-maps.js'),import('../js/data/atlas-map-links.js'),import('../js/data/atlas-travel.js'),import('../js/data/games/soulsilver/kanto-compass.js'),import('../js/data/game-reference.js'),import('../js/atlas-encounter-sections.js'),import('../js/data/games/soulsilver/safari-mechanics.js'),import('../js/data/games/soulsilver/safari-encounters.js'),import('../js/data/safari-layout.js')]);
 const inventory=await json('scripts/soulsilver-atlas-reference-inventory.json');
 const referenceChecks=await json('docs/atlas-kanto-reference-checks.json');
 const raw={...Object.fromEntries(Object.entries(routes.routes).map(([n,encounters])=>[n,{status:'verified',encounters}])),...legacy.locations,...kanto.locations};
 const references={},maps={},mapLinks={},travel={},species={},displayed={};
 for(const l of locations){
  references[l.name]=locationEncounterReference('soulsilver',l.name);maps[l.name]=mapsForLocation('soulsilver',l.name);mapLinks[l.name]=mapLinksForLocation('soulsilver',l.name)?.pairs||[];
  for(const to of l.connections)travel[key(l.name,to)]=travelConnection('soulsilver',l.name,to);
  if(references[l.name])displayed[l.name]=[...new Set(encounterSections(references[l.name].encounters).flatMap(s=>s.entries.map(e=>e.index)))];
 }
 for(const r of Object.values(raw))for(const row of r.encounters)species[row.pokemon]=speciesIdForName('soulsilver',row.pokemon);
 const assetChecks={};
 for(const m of Object.values(maps).flat())if(!assetChecks[m.file]){
  try{if(!/^[a-z0-9-]+\.png$/.test(m.file))throw new Error('Invalid asset filename');const bytes=await readFile(path.join(ROOT,'assets/maps',m.file));assetChecks[m.file]={sha256:sha(bytes),isPng:bytes.subarray(0,8).toString('hex')==='89504e470d0a1a0a',width:bytes.readUInt32BE(16),height:bytes.readUInt32BE(20)};}
  catch(e){assetChecks[m.file]={error:e.code||e.message};}
 }
 const sourceChecks={};for(const [file,expected]of Object.entries(inventory.sources)){
  try{sourceChecks[file]=sha(await readFile(path.join(ROOT,file)))===expected;}catch{sourceChecks[file]=false;}
 }
 const safariTopology=Array.from({length:6},(_,i)=>safariNeighbors('soulsilver',i));
 return {inventory,locations,raw,supplemental:kanto.supplemental,references,maps,mapLinks,travel,compass,species,displayed,assetChecks,sourceChecks,referenceChecks,safari,safariRows,safariReference:safariReference('soulsilver'),safariTopology,safariMechanicsSha256:sha(await readFile(path.join(ROOT,'js/data/games/soulsilver/safari-mechanics.js')))};
}

// Pure assessment is separately tested with missing locations, deleted rows and broken links.
export function assessAtlas(input){
 const {inventory,locations,raw,references,maps,travel}=input;
 const failures=[],warnings=[],records=[],edges=[];
 const issue=(code,location,detail)=>failures.push({code,location,detail});
 const byName=new Map(),expected=new Map();
 for(const l of inventory.locations){if(expected.has(l.name))issue('duplicate-reference-location',l.name,'Duplicate expected identity');expected.set(l.name,l);}
 for(const l of locations){if(byName.has(l.name))issue('duplicate-location',l.name,'Duplicate Atlas identity');byName.set(l.name,l);if(!expected.has(l.name))issue('unexpected-location',l.name,'Update the independent inventory after source review.');}
 if(inventory.gameId!=='soulsilver')issue('wrong-game',null,'The reference inventory must be explicitly scoped to SoulSilver.');
 if(inventory.primaryMaps.length!==inventory.primaryHeaderCount||new Set(inventory.primaryMaps.map(m=>m.mapId)).size!==inventory.primaryHeaderCount)issue('primary-census',null,'Primary headers are missing or duplicated.');
 for(const [file,ok]of Object.entries(input.sourceChecks))if(!ok)issue('stale-reference-input',null,file);
 const knownUncertainties=new Map(input.referenceChecks.uncertainties.map(u=>[u.id,u]));
 const visited=new Set(),queue=['New Bark Town'];
 while(queue.length){const name=queue.pop();if(visited.has(name)||!byName.has(name))continue;visited.add(name);queue.push(...(byName.get(name).connections||[]));}
 for(const exp of inventory.locations){
  const name=exp.name,l=byName.get(name),start=failures.length;
  if(!l){issue('missing-location',name,'Expected HGSS location is absent.');records.push({name,region:exp.region,implementationStatus:'missing',present:false,ready:false,references:exp.references});continue;}
  if(!l.details?.trim()||!l.landmarks?.length||!l.access?.length||!l.sources?.length||!l.mapIds?.length)issue('incomplete-location',name,'Static context, access, primary identity or source information is missing.');
  if(!visited.has(name))issue('orphan-location',name,'Not reachable from New Bark Town.');
  if(!l.connections?.length)issue('empty-navigation',name,'No navigation connections.');
  if(new Set(l.connections).size!==l.connections.length)issue('duplicate-navigation',name,'Repeated destination.');
  for(const to of exp.requiredConnections)if(!l.connections.includes(to))issue('missing-navigation',name,to);
  for(const to of l.connections){
   const t=travel[key(name,to)],exists=byName.has(to),reciprocal=exists&&byName.get(to).connections.includes(name);
   if(to===name)issue('self-navigation',name,to);
   if(!exists)issue('broken-navigation',name,to);
   if(exists&&!reciprocal)issue('nonreciprocal-navigation',name,to);
   if(!exp.requiredConnections.includes(to))issue('unreviewed-navigation',name,to);
   const safariLink=[name,to].includes('Safari Zone');
   if(!safariLink&&!t)issue('missing-travel-reference',name,to);
   if(t&&(t.fromLocation!==name||t.toLocation!==to||!Array.isArray(t.hms)||!Array.isArray(t.conditions)||!Array.isArray(t.notes)||t.sources.length<2))issue('invalid-travel-reference',name,to);
   edges.push({from:name,to,status:exists&&reciprocal&&(safariLink||t)?'valid':'broken',hms:t?.hms||[],conditions:t?.conditions||[],notes:t?.notes||[],dynamicSafariEntrance:safariLink});
  }
  const views=maps[name]||[];
  if(views.length<exp.minimumMapViews)issue('missing-map-views',name,`Expected at least ${exp.minimumMapViews}; found ${views.length}.`);
  if(new Set(views.map(m=>m.id)).size!==views.length)issue('duplicate-map-view',name,'Repeated map/floor ID.');
  for(const m of views){
   const a=input.assetChecks[m.file];
   if(!a||a.error||!a.isPng||a.sha256!==m.sha256||a.width!==m.width||a.height!==m.height)issue('broken-map-asset',name,m.file);
   if(m.kind==='terrain-plan'&&(!m.notice||!m.source.includes('github.com/pret/pokeheartgold/')))issue('unlabelled-terrain-plan',name,m.file);
  }
  for(const id of exp.expectedMapViewIds||[])if(!views.some(m=>m.id===id))issue('missing-inventoried-map-view',name,id);
  const links=input.mapLinks[name]||[];
  if(new Set(links.map(p=>p.id)).size!==links.length)issue('duplicate-floor-link',name,'Repeated floor connection ID.');
  for(const expPair of exp.expectedMapLinks){
   const pair=links.find(p=>p.id===expPair.id);
   if(!pair||Boolean(pair.oneWay)!==expPair.oneWay||JSON.stringify(pair.ends.map(e=>({mapId:e.mapId,x:e.x,y:e.y})))!==JSON.stringify(expPair.ends))issue('missing-or-changed-floor-link',name,expPair.id);
  }
  for(const p of links){
   if(p.ends.length!==2)issue('invalid-floor-link',name,p.id);
   for(const e of p.ends){const m=views.find(m=>m.id===e.mapId);if(!m||!Number.isFinite(e.x)||!Number.isFinite(e.y)||e.x<0||e.y<0||e.x>=m.width||e.y>=m.height)issue('broken-floor-link',name,p.id);}
  }
  let encounter;
  if(exp.expectedEncounters.kind==='safari'){
   const e=exp.expectedEncounters;
   if(input.safariMechanicsSha256!==e.mechanicsSha256)issue('changed-safari-mechanics',name,'Re-audit the separate Safari source evidence before changing its rules.');
   if(input.safariRows.length!==e.catalogueRows)issue('incomplete-safari-catalogue',name,'Unexpected catalogue size.');
   const sublocations=e.areas.map(a=>{
    const area=input.safari.areas.find(r=>r.id===a.id),rows=input.safariRows.filter(r=>r.areaId===a.id);
    if(!area||area.name!==a.name||!rows.length)issue('missing-safari-area',name,a.name);
    const methods=area?Object.entries(area.methods):[];
    for(const [method,t]of methods){if(t.base.length!==3||t.base.some(slots=>slots.length!==10)||t.base.flat().some(([id,level])=>!Number.isInteger(id)||id<1||id>493||level<1||level>100))issue('invalid-safari-table',a.name,method);}
    return {id:a.id,name:a.name,status:area&&rows.length?'implemented':'missing',methods:methods.map(([m])=>m),catalogueRows:rows.length};
   });
   const tables=input.safari.areas.reduce((n,a)=>n+Object.keys(a.methods).length,0);
   if(tables!==e.methodTables)issue('missing-safari-method',name,`Expected ${e.methodTables} reachable tables, found ${tables}.`);
   if(input.safariTopology[4]?.south!=='gate'||input.safariTopology.some((r,i)=>i!==4&&r?.south==='gate'))issue('broken-safari-exit',name,'Only south-center may exit to the Gate.');
   encounter={status:'verified-separate-safari-engine',records:input.safariRows.length,methodTables:tables,sublocations};
  }else{
   const r=raw[name],rendered=references[name],expRows=exp.expectedEncounters;
   if(!r||!rendered){issue('missing-encounters',name,'No game-scoped encounter reference.');encounter={status:'missing',records:0};}
   else{
    if(!['verified','no-fixed-wild'].includes(r.status))issue('unverified-encounter-status',name,r.status);
    if(r.encounters.length!==expRows.baseRowCount||sha(JSON.stringify(r.encounters))!==expRows.baseSha256)issue('changed-or-missing-encounters',name,'Runtime base rows differ from independently inventoried primary data.');
    const extra=input.supplemental[name]||[];
    if(JSON.stringify(extra)!==JSON.stringify(expRows.supplemental))issue('missing-special-continuation',name,'Conditional return encounters differ from their source inventory.');
    const all=[...r.encounters,...extra],dist=new Map(),methods=new Set(),areas=new Set();
    if(!all.length&&r.status!=='no-fixed-wild')issue('unconfirmed-wild-absence',name,'Empty data must have explicit verified absence status.');
    if(rendered.encounters.length!==all.length||(input.displayed[name]||[]).length!==all.length)issue('undisplayed-encounters',name,'The shared display must retain every source row.');
    for(const row of all){
     methods.add(row.method);areas.add(row.area||'Whole location');
     if(!input.species[row.pokemon]||input.species[row.pokemon]<1||input.species[row.pokemon]>493)issue('unknown-species',name,row.pokemon);
     if(!Array.isArray(row.levels)||!row.levels.length&&!(row.method==='trade'&&row.levelsLabel)||row.levels.some(l=>!Number.isInteger(l)||l<1||l>100)||new Set(row.levels).size!==row.levels.length)issue('invalid-levels',name,row.pokemon);
     if(row.times.some(t=>!times.includes(t))||new Set(row.times).size!==row.times.length)issue('invalid-time',name,row.pokemon);
     if(row.percent===null){if(!['gift','trade','interaction'].includes(row.method)||!row.conditions.length)issue('unspecified-special',name,row.pokemon);continue;}
     if(!ordinary.has(row.method)||!Number.isFinite(row.percent)||row.percent<=0||row.percent>100)issue('invalid-encounter-rate',name,row.pokemon);
     for(const time of row.times.length?row.times:times){const k=JSON.stringify([row.area||'',row.method,row.conditions,time]);dist.set(k,(dist.get(k)||0)+row.percent);}
    }
    for(const [k,sum]of dist){
     const [,method,conditions]=JSON.parse(k);let expectedRate=100;
     if(conditions.some(c=>c.endsWith('-sound')))expectedRate=40;
     if(conditions.includes('swarm'))expectedRate={walking:40,surfing:60,old_rod:15,good_rod:65,super_rod:100}[method];
     if(sum!==expectedRate)issue('incomplete-encounter-distribution',name,`${k}: ${sum}% rather than ${expectedRate}%.`);
    }
    encounter={status:all.length?'primary-verified':'no-fixed-wild',wildStatus:all.some(r=>ordinary.has(r.method))?'ordinary-wild-present':'no-ordinary-wild',records:all.length,ordinaryWildRecords:all.filter(r=>ordinary.has(r.method)).length,specialRecords:all.filter(r=>!ordinary.has(r.method)).length,methods:[...methods].sort(),areas:[...areas].sort(),tableChecks:dist.size,expectedBaseRecords:expRows.baseRowCount,baseSha256:sha(JSON.stringify(r.encounters))};
   }
  }
  for(const site of ['serebii','bulbapedia'])if(!exp.references.some(r=>r.site===site))issue('missing-reference-site',name,site);
  for(const ref of exp.references){
   try{if(new URL(ref.url).protocol!=='https:')throw Error();}catch{issue('invalid-source-url',name,ref.url);}
   if(!['verified-at-prior-audit','verified'].includes(ref.status)){
    if(!ref.uncertainty||!knownUncertainties.has(ref.uncertainty))issue('undocumented-reference-uncertainty',name,ref.url);
    else warnings.push({code:'reference-not-fully-verified',location:name,site:ref.site,status:ref.status,url:ref.url,uncertainty:ref.uncertainty});
   }
  }
  records.push({name,region:exp.region,implementationStatus:failures.length===start?'implemented':'incomplete',present:true,ready:failures.length===start,expectedPrimaryMaps:exp.expectedMapIds.length,mapViews:views.length,directedConnections:l.connections.length,floorConnections:links.length,encounters:encounter,references:exp.references});
 }
 for(const [file,expectedSha]of Object.entries(inventory.expectedAssetHashes))if(input.assetChecks[file]?.sha256!==expectedSha)issue('changed-reference-map',null,file);
 for(const e of inventory.expectedCompass){
  const pair=input.compass.filter(([a,b])=>a===e.fromLocation&&b===e.toLocation);
  if(pair.length!==1||pair[0][2]!==e.direction||!opposite[e.direction])issue('incorrect-compass',e.fromLocation,e.toLocation);
  for(const [from,to]of [[e.fromLocation,e.toLocation],[e.toLocation,e.fromLocation]]){
   const actual=travel[key(from,to)],conditions=from===e.toLocation?(e.reverseConditions||e.conditions):e.conditions;
   if(!actual||JSON.stringify(actual.hms)!==JSON.stringify(e.hms)||JSON.stringify(actual.conditions)!==JSON.stringify(conditions)||JSON.stringify(actual.notes)!==JSON.stringify(e.notes))issue('travel-condition-mismatch',from,to);
  }
 }
 const primaryMaps=inventory.primaryMaps.map(m=>({...m,implementationStatus:m.status==='excluded'?'excluded':byName.has(m.location)?'grouped-reference':'missing-parent',dedicatedMapView:m.location?(maps[m.location]||[]).some(v=>v.mapIds?.includes(m.mapId)):false}));
 for(const m of primaryMaps)if(m.implementationStatus==='missing-parent'||m.status==='excluded'&&!m.reason)issue('unaccounted-primary-map',m.location,m.mapId);
 const namedSections=inventory.namedSections.map(s=>({...s,implementationStatus:s.excluded?'excluded':s.locations.length&&s.locations.every(n=>byName.has(n))?'covered-by-group':'missing'}));
 for(const s of namedSections)if(s.implementationStatus==='missing'||s.excluded&&!s.reason)issue('missing-named-section',null,s.section);
 const coverageFor=rs=>({expected:rs.length,implemented:rs.filter(r=>r.present).length,ready:rs.filter(r=>r.ready).length,locationCoveragePercent:percentage(rs.filter(r=>r.present).length,rs.length),readyPercent:percentage(rs.filter(r=>r.ready).length,rs.length)});
 const regions=Object.fromEntries(['Johto','Kanto'].map(region=>[region,coverageFor(records.filter(r=>r.region===region))]));
 return {schemaVersion:1,gameId:'soulsilver',primaryRevision:inventory.primaryRevision,scope:inventory.granularity,coverage:{regions,overall:coverageFor(records)},locations:records,navigation:{directedConnections:edges.length,connections:edges,floorConnections:Object.entries(input.mapLinks).flatMap(([location,pairs])=>pairs.map(p=>({location,id:p.id,label:p.label,oneWay:Boolean(p.oneWay),ends:p.ends.map(e=>({mapId:e.mapId,x:e.x,y:e.y})),status:failures.some(f=>f.location===location&&f.code.includes('floor-link'))?'invalid':'valid'}))),missing:failures.filter(f=>f.code==='missing-navigation'),broken:failures.filter(f=>['broken-navigation','nonreciprocal-navigation','self-navigation','duplicate-navigation'].includes(f.code)),orphans:failures.filter(f=>f.code==='orphan-location')},primaryMaps,namedSections,referenceVerification:{fullyVerifiedCurrentKanto:records.filter(r=>r.region==='Kanto').every(r=>r.references.every(ref=>ref.status==='verified')),uncertainties:input.referenceChecks.uncertainties,discrepancies:input.referenceChecks.discrepancies||[],warnings},excluded:inventory.excluded,mandatoryFailures:failures,integrityPassed:failures.length===0,realSaveOrInGameValidation:false};
}

async function fingerprints(){
 const files=[];async function walk(dir){for(const entry of await readdir(path.join(ROOT,dir),{withFileTypes:true})){const f=path.posix.join(dir,entry.name);if(entry.isDirectory()){if(!['bin','obj','__pycache__'].includes(entry.name))await walk(f);}else if(/\.(?:js|mjs|cjs|json|py|css|html|cs|csproj|sav)$/.test(f)&&!f.includes('__pycache__'))files.push(f);}}
 for(const dir of ['js','scripts','tests','css'])await walk(dir);
 for(const f of ['package.json','package-lock.json','index.html','pokedex-earth/index.html','team-planner/index.html','pokedex/index.html','safari-zone/index.html','.github/workflows/atlas-validation.yml'])files.push(f);
 return Object.fromEntries(await Promise.all(files.sort().map(async f=>[f,sha(await readFile(path.join(ROOT,f)))])));
}
async function runTests(){
 const testFiles=(await readdir(path.join(ROOT,'tests'))).filter(f=>f.endsWith('.test.cjs')).sort().map(f=>'tests/'+f);
 const args=['--test','--test-reporter=tap',...testFiles];
 const startedAt=new Date().toISOString();let output='';
 const result=await new Promise(resolve=>{
  const child=spawn(process.execPath,args,{cwd:ROOT,env:process.env,stdio:['ignore','pipe','pipe']});
  let error=null;child.on('error',e=>{error=e.message;});
  child.stdout.on('data',b=>{output+=b;});child.stderr.on('data',b=>{output+=b;});
  const timer=setTimeout(()=>{error='Automated checks exceeded five minutes';child.kill('SIGTERM');},300000);
  child.on('close',(code,signal)=>{clearTimeout(timer);resolve({code,signal,error});});
 });
 const count=name=>Number([...output.matchAll(new RegExp('^# '+name+' (\\d+)\\s*$','gm'))].at(-1)?.[1]??0);
 const tests=count('tests'),pass=count('pass'),fail=count('fail'),skipped=count('skipped'),cancelled=count('cancelled');
 await mkdir(path.join(ROOT,'work'),{recursive:true});await writeFile(path.join(ROOT,'work/atlas-validation.tap'),output);
 return {command:'node '+args.join(' '),startedAt,completedAt:new Date().toISOString(),status:result.code===0&&tests>0&&pass===tests&&fail===0&&skipped===0&&cancelled===0?'passed':'failed',tests,pass,fail,skipped,cancelled,exitCode:result.code,error:result.error,log:'work/atlas-validation.tap',logSha256:sha(output),testFiles};
}
export const stableReport=r=>JSON.stringify(Object.fromEntries(Object.entries(r).filter(([k])=>!['automatedTests','generatedAt'].includes(k))));
export async function main(args=process.argv.slice(2)){
 const reportFile='docs/atlas-coverage.json';let previous=null;
 try{previous=await json(reportFile);}catch{}
 let report;
 try{
  const input=await loadAtlasInputs();report=assessAtlas(input);
  const meta=await json('package.json');report.applicationVersion=meta.version;report.generatedAt=new Date().toISOString();report.generator='scripts/audit-atlas.mjs';report.referenceInventorySha256=sha(await readFile(path.join(ROOT,'scripts/soulsilver-atlas-reference-inventory.json')));report.inputSha256=await fingerprints();
  report.automatedTests=args.includes('--report-only')?{status:'not-run',reason:'Report-only mode cannot satisfy completion.'}:await runTests();
  if(JSON.stringify(report.inputSha256)!==JSON.stringify(await fingerprints()))report.mandatoryFailures.push({code:'inputs-changed-during-validation',location:null,detail:'Application or test inputs changed while validation was running; regenerate the report.'});
  if(report.automatedTests.status!=='passed')report.mandatoryFailures.push({code:'automated-tests',location:null,detail:'All automated checks must run and pass; missing browser capabilities are not a pass.'});
  report.completionPassed=report.mandatoryFailures.length===0&&report.coverage.overall.locationCoveragePercent===100&&report.coverage.overall.readyPercent===100;
  if(args.includes('--check-committed')&&(!previous||stableReport(previous)!==stableReport(report))){report.mandatoryFailures.push({code:'stale-committed-report',location:null,detail:'Run npm run validate:atlas and commit the regenerated report.'});report.completionPassed=false;}
 }catch(e){report={schemaVersion:1,gameId:'soulsilver',completionPassed:false,mandatoryFailures:[{code:'audit-error',location:null,detail:e.stack||String(e)}]};}
 await writeFile(path.join(ROOT,reportFile),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({report:reportFile,coverage:report.coverage,automatedTests:report.automatedTests,mandatoryFailures:report.mandatoryFailures,completionPassed:report.completionPassed},null,2));
 if(!report.completionPassed)process.exitCode=1;
 return report;
}
if(process.argv[1]&&pathToFileURL(path.resolve(process.argv[1])).href===import.meta.url)await main();
