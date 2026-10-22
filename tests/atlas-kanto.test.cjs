const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const config=JSON.parse(fs.readFileSync(path.join(root,'scripts/soulsilver-kanto-inventory.json')));
const load=p=>import(require('node:url').pathToFileURL(path.join(root,p)).href);
test('independent HGSS Kanto inventory is searchable in the shared connected Atlas',async()=>{
 const {ATLAS_LOCATIONS:ls}=await load('js/data/atlas-locations.js');
 const names=new Map(ls.map(l=>[l.name,l]));assert.equal(names.size,ls.length);
 for(const item of config.locations){const l=names.get(item.name);assert.ok(l,item.name);assert.ok(l.mapIds.length);assert.equal(l.region,'Kanto');}
 for(let n=1;n<=25;n++)assert.equal(names.has('Route '+n),n!==23);
 for(const l of ls)for(const next of l.connections){assert.ok(names.has(next),l.name+' → '+next);assert.ok(names.get(next).connections.includes(l.name));}
 const seen=new Set(),queue=['New Bark Town'];while(queue.length){const n=queue.pop();if(seen.has(n))continue;seen.add(n);queue.push(...names.get(n).connections);}assert.equal(seen.size,ls.length);
 for(const [a,b]of [['S.S. Aqua','Vermilion City'],['Magnet Train Station','Saffron Magnet Train Station'],['Pokémon League Reception Gate','Route 22']])assert.ok(names.get(a).connections.includes(b));
});
test('primary Kanto census accounts for every header including split routes and story variants',()=>{
 const census=JSON.parse(fs.readFileSync(path.join(root,'docs/atlas-kanto-primary-census.json')));
 assert.equal(census.primaryRevision,config.primaryRevision);assert.equal(census.maps.length,199);assert.equal(new Set(census.maps.map(m=>m.mapId)).size,199);
 for(const m of census.maps)assert.ok(m.location||m.status==='excluded'&&m.reason);
 for(const id of ['MAP_ROUTE_2','MAP_ROUTE_2_EAST','MAP_ROUTE_16','MAP_ROUTE_16_EAST'])assert.ok(census.maps.some(m=>m.mapId===id&&m.status==='assigned'));
 assert.equal(census.maps.find(m=>m.mapId==='MAP_ROUTE_10_POWER_PLANT_BROKEN').location,'Power Plant');
});

test('every Kanto map has explicit encounter accounting and valid complete method/time distributions',async()=>{
 const {KANTO_ENCOUNTERS:k}=await load('js/data/games/soulsilver/kanto-encounters.js');
 const {locationEncounterReference:r}=await load('js/data/atlas-route-reference.js');
 const {encounterSections}=await load('js/atlas-encounter-sections.js');
 const {speciesIdForName}=await load('js/data/game-reference.js');
 assert.deepEqual(Object.keys(k.locations).sort(),config.locations.map(l=>l.name).sort());
 const evidence=JSON.parse(fs.readFileSync(path.join(root,'docs/atlas-kanto-encounter-evidence.json')));
 let count=0;
 for(const [name,ref]of Object.entries(k.locations)){
  const distributions=new Map();count+=ref.encounters.length;
  for(const row of ref.encounters){
   assert.ok(speciesIdForName('soulsilver',row.pokemon),name+': '+row.pokemon);
   assert.ok(row.levels.length&&row.levels.every(l=>Number.isInteger(l)&&l>=1&&l<=100)||row.method==='trade'&&row.levelsLabel);
   assert.deepEqual(row.levels,[...new Set(row.levels)].sort((a,b)=>a-b));
   if(row.percent===null){assert.ok(['interaction','gift','trade'].includes(row.method));continue;}
   assert.ok(row.percent>0&&row.percent<=100);
   for(const time of row.times.length?row.times:['morn','day','nite']){
    const key=JSON.stringify([row.area,row.method,row.conditions,time]);distributions.set(key,(distributions.get(key)||0)+row.percent);
   }
  }
  for(const [key,sum]of distributions){
   const conditions=JSON.parse(key)[2];assert.equal(sum,conditions.includes('swarm')?JSON.parse(key)[1]==='surfing'?60:JSON.parse(key)[1]==='old_rod'?15:JSON.parse(key)[1]==='good_rod'?65:JSON.parse(key)[1]==='super_rod'?100:40:conditions.some(c=>c.endsWith('-sound'))?40:100,name+': '+key);
  }
  const formatted=r('soulsilver',name);assert.ok(formatted);assert.equal(formatted.encounters.length,ref.encounters.length);
  assert.equal(new Set(encounterSections(formatted.encounters).flatMap(s=>s.entries.map(e=>e.index))).size,ref.encounters.length);
  assert.equal(r('heartgold',name),null);
  const reviewed=evidence.locations.find(e=>e.location===name);assert.ok(reviewed.maps.length);
  for(const m of reviewed.maps)assert.ok(m.aliasOf||m.rowCount>=0&&Array.isArray(m.methods));
  const bytes=JSON.stringify(ref.encounters);assert.equal(require('node:crypto').createHash('sha256').update(bytes).digest('hex'),reviewed.encountersSha256);
 }
 assert.equal(count,847);
});
test('independent HGSS examples preserve version, outbreak, Headbutt and stationary distinctions',async()=>{
 const {KANTO_ENCOUNTERS:k}=await load('js/data/games/soulsilver/kanto-encounters.js');
 const rows=n=>k.locations[n].encounters;
 const ordinary=n=>rows(n).filter(r=>r.method==='walking'&&!r.conditions.length&&r.times.includes('day'));
 assert.deepEqual(ordinary('Route 1').map(r=>[r.pokemon,r.percent,r.levels]),[['Pidgey',45,[2,3,4]],['Rattata',30,[2]],['Sentret',20,[3]],['Furret',5,[6]]]);
 assert.ok(rows('Route 1').some(r=>r.pokemon==='Ledyba'&&r.method==='headbutt'));
 assert.ok(!rows('Route 1').some(r=>r.pokemon==='Spinarak'&&r.method==='headbutt'));
 assert.ok(rows('Route 25').some(r=>r.pokemon==='Buneary'&&r.conditions.includes('swarm')&&r.percent===40));
 assert.deepEqual(ordinary('Diglett’s Cave').map(r=>[r.pokemon,r.percent,r.levels]),[['Diglett',90,[13,15,17,19]],['Dugtrio',10,[19,24,29]]]);
 for(const [place,mon,level]of [['Route 11','Snorlax',50],['Route 25','Suicune',40],['Route 10','Zapdos',50],['Seafoam Islands','Articuno',50],['Cerulean Cave','Mewtwo',70],['Pewter City','Latias',40]]){
  const row=rows(place).find(r=>r.pokemon===mon&&r.method==='interaction');assert.ok(row);assert.deepEqual(row.levels,[level]);assert.equal(row.percent,null);
 }
 assert.ok(!rows('Route 12').some(r=>r.pokemon==='Snorlax'));assert.equal(rows('Mt. Moon Square').filter(r=>r.method==='interaction').length,0);
 assert.equal(rows('Silph Co.').filter(r=>r.method==='gift').length,3);
 assert.equal(rows('Pewter Museum of Science').filter(r=>r.method==='gift').length,7);
});

test('all new Kanto groups have verified map assets with correct floor choices and labelled terrain evidence',async()=>{
 const {KANTO_MAPS:k}=await load('js/data/games/soulsilver/kanto-maps.js');const {mapsForLocation}=await load('js/data/atlas-maps.js');
 let views=0;const verified=new Set();
 for(const name of config.locations.map(l=>l.name)){
  const maps=mapsForLocation('soulsilver',name);assert.ok(maps.length,name);assert.equal(new Set(maps.map(m=>m.id)).size,maps.length);
  for(const m of maps){views++;const bytes=fs.readFileSync(path.join(root,'assets/maps',m.file));assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a');assert.equal(bytes.readUInt32BE(16),m.width);assert.equal(bytes.readUInt32BE(20),m.height);assert.equal(require('node:crypto').createHash('sha256').update(bytes).digest('hex'),m.sha256);verified.add(m.file);
   if(m.kind==='terrain-plan'){assert.match(m.notice,/not a rendered screenshot/);assert.match(m.source,/pokeheartgold\/blob\/d2355244/);}else assert.equal(new URL(m.source).hostname,'archives.bulbagarden.net');
  }
  assert.deepEqual(mapsForLocation('heartgold',name),[]);
 }
 assert.equal(views,83);assert.equal(verified.size,83);
 assert.deepEqual(k.locations['Cerulean Cave'].map(m=>m.label),['1F','2F','B1F']);
 assert.deepEqual(k.locations['Seafoam Islands'].slice(0,6).map(m=>m.label),['1F','B1F','B2F','B3F','B4F','Cinnabar Gym']);
 assert.ok(!k.locations['Cinnabar Island'].some(m=>m.id==='gym'));
 assert.equal(k.locations['Pal Park'].find(m=>m.mapIds.includes('MAP_PAL_PARK')).context,'outdoor');
});
test('reverse Pokédex locations include all 25 actual Kanto Latios routes and fixed Kanto encounters',async()=>{
 const {speciesLocations:s}=await load('js/data/pokedex-reference.js');
 const latios=s('soulsilver',381).filter(r=>r.details.some(d=>d.startsWith('Roaming'))).map(r=>r.location);
 assert.equal(latios.length,25);assert.ok(latios.includes('Route 1'));assert.ok(latios.includes('Route 24'));assert.ok(!latios.includes('Route 25'));
 assert.ok(s('soulsilver',150).some(r=>r.location==='Cerulean Cave'));assert.ok(s('soulsilver',144).some(r=>r.location==='Seafoam Islands'));
 assert.ok(s('soulsilver',245).some(r=>r.location==='Burned Tower'&&r.details.some(d=>d.includes('not a second capture'))));
});
