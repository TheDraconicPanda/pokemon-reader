const {test}=require('node:test');
const assert=require('node:assert/strict');
const {readFile}=require('node:fs/promises');
const {createHash}=require('node:crypto');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
const root=path.join(__dirname,'..');
const load=()=>import(pathToFileURL(path.join(root,'js/data/atlas-map-links.js')).href);

test('Whirl stair pairs match every 1F/B1F warp in both directions, coalescing adjacent ladder tiles',async()=>{
 const {mapLinksForLocation}=await load();
 const data=mapLinksForLocation('soulsilver','Whirl Islands');
 const evidence=JSON.parse(await readFile(path.join(root,'docs/whirl-islands-stair-links.json'),'utf8'));
 const sources=Object.values(evidence.sources);
 const upper=sources[0].warps,lower=sources[1].warps;
 assert.deepEqual(data.pairs.slice(0,6).map(p=>p.id),['A','B','C','D','E','F']);
 assert.equal(evidence.primaryRevision,'d2355244ac42b3c6e40d8c36aa3564ee8706dea4');
 const coveredUpper=new Set(),coveredLower=new Set();
 for(const pair of data.pairs.slice(0,6)){
  const proof=evidence.pairs.find(p=>p.id===pair.id);
  assert.deepEqual(pair.ends,proof.ends);assert.equal(pair.label,proof.label);
  const from=upper[proof.primary1fWarp];coveredUpper.add(proof.primary1fWarp);
  assert.equal(from.header,'MAP_WHIRL_ISLANDS_B1F');assert.equal(from.anchor,proof.primaryB1fWarps[0]);
  const quadrant=`1f-${from.z<32?'n':'s'}${from.x<32?'w':'e'}`;
  assert.equal(pair.ends[0].mapId,quadrant,pair.id);assert.equal(pair.ends[1].mapId,'b1f');
  const returns=proof.primaryB1fWarps.map(i=>{coveredLower.add(i);return lower[i];});
  assert.equal(returns.length,2);
  assert.equal(returns[0].x,returns[1].x);assert.equal(Math.abs(returns[0].z-returns[1].z),1);
  for(const back of returns){assert.equal(back.header,'MAP_WHIRL_ISLANDS_1F');assert.equal(back.anchor,proof.primary1fWarp);}
 }
 assert.deepEqual([...coveredUpper].sort((a,b)=>a-b),upper.flatMap((w,i)=>w.header==='MAP_WHIRL_ISLANDS_B1F'?[i]:[]));
 assert.deepEqual([...coveredLower].sort((a,b)=>a-b),lower.flatMap((w,i)=>w.header==='MAP_WHIRL_ISLANDS_1F'?[i]:[]));
 assert.equal(upper[2].z<upper[1].z,true,'NE north and south labels follow the actual map');
 assert.equal(upper[6].x<upper[7].x,true,'SW west and east labels follow the actual map');
});

test('Whirl overlays anchor to the verified original PNGs and remain isolated to this game and location',async()=>{
 const {mapLinksForLocation}=await load();
 const {images}=JSON.parse(await readFile(path.join(root,'docs/whirl-islands-stair-links.json'),'utf8'));
 const pairs=mapLinksForLocation('soulsilver','Whirl Islands').pairs.slice(0,6);
 assert.deepEqual(Object.keys(images),['1f-nw','1f-ne','1f-sw','1f-se','b1f']);
 for(const image of Object.values(images)){
  const bytes=await readFile(path.join(root,'assets/maps',image.file));
  assert.equal(createHash('sha256').update(bytes).digest('hex'),image.sha256);
  assert.equal(bytes.readUInt32BE(16),image.width);assert.equal(bytes.readUInt32BE(20),image.height);
 }
 for(const pair of pairs)for(const end of pair.ends){
  assert.ok(end.x>0&&end.x<images[end.mapId].width);assert.ok(end.y>0&&end.y<images[end.mapId].height);
 }
 for(const game of ['heartgold','platinum','__proto__',undefined])assert.equal(mapLinksForLocation(game,'Whirl Islands'),null);
 for(const name of ['Safari Zone','Embedded Tower','New Bark Town','__proto__'])assert.equal(mapLinksForLocation('soulsilver',name),null);
});

test('every new cave pair covers the primary internal warp graph and all adjacent staircase tiles',async()=>{
 const {mapLinksForLocation}=await load();
 const evidence=JSON.parse(await readFile(path.join(root,'docs/cave-map-links.json'),'utf8'));
 assert.equal(evidence.primaryRevision,'d2355244ac42b3c6e40d8c36aa3564ee8706dea4');
 assert.equal(evidence.addedPairs,50);assert.equal(evidence.addedLocations,10);assert.deepEqual(evidence.missing,[]);
 const counts={'Cliff Cave':2,'Union Cave':7,'Slowpoke Well':2,'Mt. Mortar':9,'Ice Path':6,'Victory Road':5,'Mt. Silver':15,'Dark Cave':1,"Dragon's Den":2,'Tohjo Falls':1};
 for(const [name,count] of Object.entries(counts)){
  const proof=evidence.locations[name];const runtime=mapLinksForLocation('soulsilver',name);
  assert.equal(runtime.pairs.filter(p=>!p.oneWay).length,count,name);assert.deepEqual(proof.missing,[]);
  const ids=new Set(),used=new Set();
  for(const pair of proof.pairs){
   assert.ok(!ids.has(pair.id));ids.add(pair.id);
   const published=runtime.pairs.find(p=>p.id===pair.id);
   assert.equal(published.label,pair.label);
   assert.deepEqual(published.ends,pair.ends.map(({mapId,x,y,side})=>({mapId,x,y,...(side?{side}:{})})));
   const [a,b]=pair.ends;assert.notEqual(a.mapId,b.mapId);
   for(const [start,target]of[[a,b],[b,a]])for(const index of start.warpIndices){
    const key=start.primaryMap+':'+index;assert.ok(!used.has(key),name+': duplicate endpoint');used.add(key);
    const warp=evidence.sources[start.primaryMap].warps[index];
    assert.equal(warp.header,target.primaryMap,name+': '+pair.id);assert.ok(target.warpIndices.includes(warp.anchor));
   }
  }
  const expected=proof.primaryMaps.flatMap(node=>evidence.sources[node].warps.flatMap((w,i)=>proof.primaryMaps.includes(w.header)?[node+':'+i]:[]));
  assert.deepEqual([...used].sort(),expected.sort(),name+': omitted internal cave warp');
 }
 // Several displayed floors share one game map; header names cannot choose the floor.
 const cliff=mapLinksForLocation('soulsilver','Cliff Cave').pairs;
 assert.deepEqual(cliff.map(p=>p.ends.map(e=>e.mapId)),[['1f','2f'],['1f','b1f']]);
 // Union's isolated connector rooms are not silently assigned to the Lapras image.
 const union=mapLinksForLocation('soulsilver','Union Cave').pairs;
 assert.ok(union.some(p=>p.ends.some(e=>e.mapId==='cave-plan-union-side-passages')));
 assert.ok(union.some(p=>p.ends.some(e=>e.mapId==='cave-plan-union-ruins-exits')));
});

test('new cave image anchors retain original artwork and supplementary terrain provenance',async()=>{
 const {mapLinksForLocation}=await load();
 const evidence=JSON.parse(await readFile(path.join(root,'docs/cave-map-links.json'),'utf8'));
 const config=JSON.parse(await readFile(path.join(root,'scripts/soulsilver-cave-links.json'),'utf8'));
 assert.equal(evidence.supplementaryPlans.length,4);assert.equal(config.plans.length,4);
 for(const [name,location]of Object.entries(evidence.locations)){
  for(const image of Object.values(location.images)){
   const bytes=await readFile(path.join(root,'assets/maps',image.file));
   assert.equal(createHash('sha256').update(bytes).digest('hex'),image.sha256,image.file);
   assert.equal(bytes.readUInt32BE(16),image.width);assert.equal(bytes.readUInt32BE(20),image.height);
  }
  for(const pair of mapLinksForLocation('soulsilver',name).pairs)for(const e of pair.ends){
   assert.ok(e.x>0&&e.x<location.images[e.mapId].width,name);assert.ok(e.y>0&&e.y<location.images[e.mapId].height,name);
  }
 }
 for(const plan of evidence.supplementaryPlans){
  assert.ok(evidence.inputSha256[plan.matrix]);assert.equal(plan.attributesSha256.length,64);
  assert.equal(plan.terrainRows.length,plan.bounds[3]-plan.bounds[1]+1);
  assert.ok(plan.terrainRows.every(row=>row.length===plan.bounds[2]-plan.bounds[0]+1));
 }
 assert.equal(mapLinksForLocation('soulsilver','Embedded Tower'),null,'Story variants must not be linked as floors');
 assert.equal(mapLinksForLocation('soulsilver','Safari Zone'),null);
});

test('tower and lower Whirl links exhaust internal primary warps, including same-floor teleport pads',async()=>{
 const {mapLinksForLocation}=await load();
 const proof=JSON.parse(await readFile(path.join(root,'docs/dungeon-map-links.json'),'utf8'));
 assert.deepEqual(proof.missing,[]);
 const counts={'Sprout Tower':4,'Burned Tower':1,'Bell Tower':18,'Whirl Islands':4};
 for(const [name,count]of Object.entries(counts)){
  const evidence=proof.locations[name];assert.equal(evidence.pairs.length,count);
  const data=mapLinksForLocation('soulsilver',name);const covered=new Set();
  for(const pair of evidence.pairs){
   assert.deepEqual(data.pairs.find(p=>p.id===pair.id).ends,pair.ends.map(({mapId,x,y,side})=>({mapId,x,y,...(side?{side}:{})})));
   for(const [a,b]of[[pair.ends[0],pair.ends[1]],[pair.ends[1],pair.ends[0]]])for(const i of a.warpIndices){
    assert.ok(!covered.has(a.primaryMap+':'+i));covered.add(a.primaryMap+':'+i);
    const warp=proof.sources[a.primaryMap].warps[i];assert.equal(warp.header,b.primaryMap);assert.ok(b.warpIndices.includes(warp.anchor));
   }
  }
  if(name==='Whirl Islands'){
   const old=JSON.parse(await readFile(path.join(root,'docs/whirl-islands-stair-links.json'),'utf8'));
   for(const pair of old.pairs){covered.add('MAP_WHIRL_ISLANDS_1F:'+pair.primary1fWarp);for(const i of pair.primaryB1fWarps)covered.add('MAP_WHIRL_ISLANDS_B1F:'+i);}
   assert.deepEqual(data.pairs.slice(0,6),old.pairs.map(({id,label,ends})=>({id,label,ends})));
  }
  const expected=evidence.primaryMaps.flatMap(n=>proof.sources[n].warps.flatMap((w,i)=>evidence.primaryMaps.includes(w.header)?[n+':'+i]:[]));
  assert.deepEqual([...covered].sort(),expected.sort());
 }
 const bell=mapLinksForLocation('soulsilver','Bell Tower').pairs;
 assert.equal(bell.filter(p=>p.ends[0].mapId===p.ends[1].mapId).length,1);
 assert.equal(bell.find(p=>p.ends[0].mapId===p.ends[1].mapId).ends[0].mapId,'7f');
 for(const [name,evidence]of Object.entries(proof.locations))for(const [id,img]of Object.entries(evidence.images)){
  const bytes=await readFile(path.join(root,'assets/maps',img.file));assert.equal(createHash('sha256').update(bytes).digest('hex'),img.sha256);
  for(const p of mapLinksForLocation('soulsilver',name).pairs)for(const e of p.ends.filter(e=>e.mapId===id))assert.ok(e.x>0&&e.x<img.width&&e.y>0&&e.y<img.height);
 }
});

test('scripted holes have explicit one-way landings and account for every fall trigger',async()=>{
 const {mapLinksForLocation}=await load();const proof=JSON.parse(await readFile(path.join(root,'docs/dungeon-map-links.json'),'utf8'));
 for(const [name,count,indices,landings]of[
  ['Ice Path',4,[0,1,2,3],[[12,12],[10,21],[20,10],[21,23]]],
  ['Victory Road',5,[2,3,4,5,6],[[57,42],[28,38],[31,44],[22,17],[58,28]]]
 ]){
  const data=mapLinksForLocation('soulsilver',name).pairs.filter(p=>p.oneWay);assert.equal(data.length,count);
  const drops=proof.locations[name].drops;assert.deepEqual(drops.map(d=>d.scriptIndex),indices);assert.deepEqual(drops.map(d=>[d.landing.x,d.landing.z]),landings);
  for(const d of drops){assert.deepEqual(data.find(p=>p.id===d.id).ends,d.ends);assert.ok(d.trigger.scriptId.endsWith('_'+String(d.scriptIndex).padStart(3,'0')+' + 1'));assert.ok(proof.inputSha256[d.scriptPath]);}
 }
 assert.equal(mapLinksForLocation('soulsilver','Burned Tower').pairs.some(p=>p.oneWay),false);
 for(const game of ['platinum','heartgold',undefined])assert.equal(mapLinksForLocation(game,'Bell Tower'),null);
});
