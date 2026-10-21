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
 assert.deepEqual(data.pairs.map(p=>p.id),['A','B','C','D','E','F']);
 assert.equal(evidence.primaryRevision,'d2355244ac42b3c6e40d8c36aa3564ee8706dea4');
 const coveredUpper=new Set(),coveredLower=new Set();
 for(const pair of data.pairs){
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
 const pairs=mapLinksForLocation('soulsilver','Whirl Islands').pairs;
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
 for(const name of ['Safari Zone','Ice Path','__proto__'])assert.equal(mapLinksForLocation('soulsilver',name),null);
});
