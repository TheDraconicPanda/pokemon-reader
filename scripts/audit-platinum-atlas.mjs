// Pure game-data assessment plus filesystem evidence; shared release audit calls it.
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';
import path from 'node:path';
const ROOT=fileURLToPath(new URL('../',import.meta.url));
const sha=x=>createHash('sha256').update(x).digest('hex');
const json=async p=>JSON.parse(await readFile(path.join(ROOT,p),'utf8'));
export async function loadPlatinumAtlasInputs(){
 const [{PLATINUM_ATLAS:atlas},{PLATINUM_MAPS:maps},{PLATINUM_SPECIES_IDS:species},{PLATINUM_POKEDEX:dex},{locationEncounterReference}]=await Promise.all([import('../js/data/games/platinum/atlas.js'),import('../js/data/games/platinum/maps.js'),import('../js/data/games/platinum/species-identifiers.js'),import('../js/data/games/platinum/pokedex-reference.js'),import('../js/data/atlas-route-reference.js')]);
 const [inventory,ledger,mapAudit,comparison,decisions]=await Promise.all(['scripts/platinum-atlas-reference-inventory.json','docs/platinum-atlas-inventory.json','docs/platinum-map-audit.json','docs/platinum-encounter-comparison.json','docs/platinum-source-decisions.json'].map(json));
 const assets={};for(const map of Object.values(maps.locations).flat()){
  try{if(!/^platinum\/[a-z0-9_]+\.png$/.test(map.file))throw new Error('Invalid asset path');const bytes=await readFile(path.join(ROOT,'assets/maps',map.file));assets[map.file]={sha256:sha(bytes),width:bytes.readUInt32BE(16),height:bytes.readUInt32BE(20),png:bytes.subarray(0,8).toString('hex')==='89504e470d0a1a0a'};}catch(e){assets[map.file]={error:e.message};}
 }
 return {atlas,maps,species,dex,inventory,ledger,mapAudit,comparison,decisions,assets,atlasInputSha256:sha(await readFile(path.join(ROOT,'js/data/games/platinum/atlas.js'))),displayed:Object.fromEntries(atlas.locations.map(l=>[l.name,locationEncounterReference('platinum',l.name)]))};
}
export function assessPlatinumAtlas(input){
 const {atlas:a,maps,inventory:i,ledger,assets,comparison,decisions,mapAudit}=input;const failures=[];
 const fail=(code,location,detail)=>failures.push({code,location,detail});
 const check=(ok,code,loc,detail)=>{if(!ok)fail(code,loc,detail);};
 const validSource=p=>Boolean(ledger.sources[p]?.sha256?.match(/^[a-f0-9]{64}$/)&&ledger.sources[p]?.url===`https://github.com/pret/pokeplatinum/blob/${i.primaryRevision}/${p}`);
 check(a.gameId==='platinum'&&a.generation===4&&a.region==='Sinnoh'&&a.schemaVersion===2,'wrong-game',null,'Platinum schema, generation and region must be explicit.');
 check(a.revision===i.primaryRevision,'wrong-revision',null,'Pinned primary revision differs.');
 const names=new Set(a.locations.map(l=>l.name)),ids=new Set(a.locations.map(l=>l.id));
 check(names.size===a.locations.length&&ids.size===a.locations.length,'duplicate-location',null,'Location IDs and names must be unique.');
 for(const [name,expected]of Object.entries(i.locations))check(names.has(name),'missing-location',name,'Missing independently inventoried location.');
 for(const l of a.locations){
  const expected=i.locations[l.name];check(Boolean(expected),'unexpected-location',l.name,'Location is absent from the reviewed inventory.');
  check(l.region==='Sinnoh'&&l.gameId==='platinum'&&l.id===expected?.id,'invalid-regional-id',l.name,'Wrong game, region or stable location ID.');
  check(JSON.stringify(l.headers)===JSON.stringify(expected?.headers),'missing-area',l.name,'Native area membership differs from the census.');
  check(l.sources.length>0&&l.sources.every(s=>s.url?.includes(`/blob/${i.primaryRevision}/`)),'missing-source',l.name,'Location provenance is missing.');
  check(JSON.stringify(l.connections)===JSON.stringify(expected?.connections),'missing-navigation',l.name,'Reference destinations differ from the independently reviewed native graph.');
  check(l.connections.length>0&&new Set(l.connections).size===l.connections.length,'missing-navigation',l.name,'Every location needs distinct reference destinations.');
  for(const to of l.connections)check(names.has(to),'broken-navigation',l.name,`Unknown destination: ${to}`);
  for(const r of l.accessRequirements){
   check(['hm','progress','event','unreleased','mechanic','item'].includes(r.kind)&&r.text&&r.sources?.length&&r.sources.every(validSource),'invalid-requirement',l.name,'Access requirement type, description or source is missing.');
   check(r.kind!=='hm'||Object.hasOwn(a.travel.hms,r.id),'impossible-requirement',l.name,`Unknown HM ${r.id}.`);
  }
  const views=maps.locations[l.name]||[];
  check(JSON.stringify(views.map(m=>m.id))===JSON.stringify(expected?.mapIds),'missing-map',l.name,'Native floor/view choices differ from the census.');
  for(const m of views){const file=assets[m.file];check(file?.png&&file.sha256===m.sha256&&file.width===m.width&&file.height===m.height,'broken-map',l.name,`Missing/corrupt terrain plan ${m.file}.`);check(a.areas[m.id]?.location===l.name&&m.kind==='terrain-plan'&&m.notice?.includes('Static attributes'),'invalid-map',l.name,'Terrain provenance/caveat is missing.');}
  const rows=a.encounters[l.name];check(Array.isArray(rows)&&rows.length===expected?.encounterRows,'missing-encounters',l.name,'Encounter row count differs from the reviewed extraction.');
  check(sha(JSON.stringify(rows))===expected?.encounterSha256,'changed-encounters',l.name,'Source-derived encounters differ from the reviewed catalogue.');
  check(new Set((rows||[]).map(r=>JSON.stringify(r))).size===rows?.length,'duplicate-encounter',l.name,'Duplicate encounter record.');
  for(const r of rows||[]){
   check(Number.isInteger(r.speciesId)&&r.speciesId>=1&&r.speciesId<=493&&input.dex.species[r.speciesId]?.name===r.pokemon,'invalid-species',l.name,'Species ID/name mismatch.');
   check(['walking','surfing','old_rod','good_rod','super_rod','gift','interaction','trade','roaming','honey_tree'].includes(r.method),'invalid-method',l.name,'Unsupported encounter method.');
   check(Array.isArray(r.levels)&&r.levels.every(x=>Number.isInteger(x)&&x>=1&&x<=100)&&(r.levels.length>0||r.method==='trade'&&r.levelsLabel),'invalid-level',l.name,'Missing or invalid levels / explicit variable-level rule.');
   check(r.percent===null?Boolean(r.availability):Number.isFinite(r.percent)&&r.percent>0&&r.percent<=100,'invalid-rate',l.name,'Missing or impossible encounter share.');
   check(!['gift','interaction','trade','roaming','honey_tree'].includes(r.method)||r.conditions.length>0,'missing-prerequisite',l.name,'Special encounter prerequisites are missing.');
   check(Array.isArray(r.times)&&r.times.every(t=>['morning','day','night'].includes(t))&&Array.isArray(r.conditions),'invalid-condition',l.name,'Invalid time or condition list.');
   check(a.areas[r.area]?.location===l.name,'invalid-area',l.name,'Encounter points to another/missing area.');
   check(validSource(r.source)&&r.validationStatus==='primary-verified','missing-source',l.name,'Encounter has no pinned source evidence.');
   if(r.conditions.some(c=>c.includes('Poké Radar')))check(a.habitats[r.area]?.tallGrassTiles>0,'impossible-radar',l.name,'Radar on a map without native tall grass.');
  }
  check(input.displayed[l.name]?.encounters.length===rows?.length,'undisplayed-encounters',l.name,'Shared Atlas adapter drops source rows.');
 }
 check(sha(JSON.stringify(Object.entries(ledger.sources).sort((a,b)=>a[0]<b[0]?-1:a[0]>b[0]?1:0)))===i.sourceLedgerSha256,'changed-source-ledger',null,'Pinned source provenance differs from the reviewed source inventory.');
 const known=new Set(['Twinleaf Town']);let old;do{old=known.size;for(const l of a.locations)if(known.has(l.name))l.connections.filter(n=>names.has(n)).forEach(n=>known.add(n));}while(old!==known.size);
 check(known.size===names.size,'orphan-location',null,'Some groups are unreachable from Twinleaf in reference navigation.');
 const headers=Object.keys(a.headers),included=headers.filter(h=>a.headers[h].location!==null);
 check(headers.length===i.totalNativeHeaders&&included.length===i.counts.includedHeaders,'incomplete-header-census',null,'Native header census changed.');
 for(const h of headers)check(a.headers[h].location?Boolean(a.areas[h]&&names.has(a.headers[h].location)&&a.areas[h].location===a.headers[h].location):Boolean(i.excludedHeaders[h]&&a.headers[h].excludedReason===i.excludedHeaders[h]),'unexplained-header',h,'Every header must have an area or a reviewed exclusion.');
 for(const [h,table]of Object.entries(a.tables)){
  check(Boolean(a.areas[h])&&validSource(table.source),'unexplained-bank',h,'Encounter bank is unassigned or lacks provenance.');
  for(const [field,length]of [['land',12],['surf',5],['old_rod',5],['good_rod',5],['super_rod',5]]){
   const d=table.data;check(Number.isInteger(d[field+'_rate'])&&d[field+'_rate']>=0&&d[field+'_rate']<=100&&d[field+'_encounters'].length===length,'invalid-native-table',h,'Invalid native rate/table length.');
   if(d[field+'_rate'])for(const s of d[field+'_encounters'])check(input.species[s.species]>=1&&input.species[s.species]<=493&&Number.isInteger(s.level??s.level_min)&&Number.isInteger(s.level??s.level_max)&&(s.level??s.level_min)>=1&&(s.level??s.level_max)<=100&&(s.level??s.level_min)<=(s.level??s.level_max),'invalid-native-species',h,'Enabled native slot has invalid species/levels.');
  }
 }
 check(Object.keys(a.tables).length===i.counts.headerEncounterTables,'missing-bank',null,'Native encounter table count changed.');
 for(const [name,data]of Object.entries(maps.links))for(const pair of data.pairs)for(const end of pair.ends){const map=(maps.locations[name]||[]).find(m=>m.id===end.mapId);check(Boolean(map)&&end.x>=0&&end.y>=0&&end.x<=map.width&&end.y<=map.height,'broken-floor-link',name,'Warp endpoint is outside its verified map.');}
 const systems=a.specialSystems;
 for(const [key,count]of [['fixedScriptCommands',21],['npcTrades',4],['roamers',5],['honeyTrees',21],['trophyGardenVisitors',16]])check(systems[key]?.length===count,'missing-special-system',null,`Incomplete ${key}.`);
 check(a.greatMarshPools.before_national_dex.length===32&&a.greatMarshPools.after_national_dex.length===32&&Array.from({length:6},(_,n)=>a.tables[`MAP_HEADER_GREAT_MARSH_${n+1}`]).every(Boolean),'incomplete-great-marsh',null,'Both daily pools and all six areas are mandatory.');
 check(Object.keys(a.travel.hms).length===8&&a.travel.hms.fly.badge==='Cobble Badge'&&a.travel.hms.defog.badge==='Relic Badge','wrong-hm-badge',null,'Platinum field-move badge checks differ from primary.');
 check(comparison.atlasInputSha256===input.atlasInputSha256&&mapAudit.atlasInputSha256===input.atlasInputSha256,'stale-independent-evidence',null,'Rebuild comparison/maps after changing native data.');
 check(comparison.ordinaryAreaCount===144&&comparison.exactAreas===142&&comparison.slotComparisons===7920,'incomplete-independent-comparison',null,'Independent ordinary area comparison count changed.');
 const resolved=new Set(decisions.decisions.filter(d=>d.status==='resolved-primary'&&d.evidence?.length).map(d=>d.apiArea));
 for(const diff of comparison.differences)check(resolved.has(Number(diff.apiArea)),'unresolved-discrepancy',null,`Unresolved independent area ${diff.apiArea}.`);
 check(decisions.unresolvedCriticalMechanics.length===0,'unresolved-mechanic',null,'Critical mechanics remain unverified.');
 const complete=failures.length===0;
 return {gameId:'platinum',schemaVersion:1,primaryRevision:i.primaryRevision,coverage:{expectedLocations:Object.keys(i.locations).length,implementedLocations:names.size,locationCoveragePercent:Math.min(100,names.size/Object.keys(i.locations).length*100),nativeHeaders:headers.length,includedAreas:included.length,excludedHeaders:headers.length-included.length,terrainPlans:Object.values(maps.locations).flat().length,encounterRows:Object.values(a.encounters).flat().length,headerEncounterTables:Object.keys(a.tables).length,directedNativeConnections:a.connections.length,referenceDestinations:a.locations.reduce((n,l)=>n+l.connections.length,0),warpReferences:Object.values(maps.links).reduce((n,l)=>n+l.pairs.length,0)},independent:{ordinaryAreas:comparison.ordinaryAreaCount,exactAreas:comparison.exactAreas,slotComparisons:comparison.slotComparisons,resolvedDiscrepancies:comparison.differences.map(d=>Number(d.apiArea))},specialSystems:Object.fromEntries(['fixedScriptCommands','npcTrades','roamers','honeyTrees','trophyGardenVisitors'].map(k=>[k,systems[k].length])),mandatoryFailures:failures,completionPassed:complete,realSaveOrInGameValidation:false,scope:i.scope};
}
export async function auditPlatinumAtlas(){return assessPlatinumAtlas(await loadPlatinumAtlasInputs());}
if(process.argv[1]&&pathToFileURL(path.resolve(process.argv[1])).href===import.meta.url){const report=await auditPlatinumAtlas();await writeFile(path.join(ROOT,'docs/platinum-atlas-coverage.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));if(!report.completionPassed)process.exitCode=1;}
