const {test} = require('node:test');
const assert = require('node:assert/strict');
const {readFile} = require('node:fs/promises');
const {createHash} = require('node:crypto');
const {pathToFileURL} = require('node:url');
const path = require('node:path');
const root=path.join(__dirname,'..');
const load=()=>import(pathToFileURL(path.join(root,'js/data/atlas-maps.js')).href);

test('available HGSS map PNGs retain verified bytes, dimensions and source references',async()=>{
  const {mapsForLocation}=await load();
  const catalog=JSON.parse(await readFile(path.join(root,'scripts/atlas-map-sources.json'),'utf8'));
  const verified=new Set();
  for(const name of Object.keys(catalog.locations)) {
    const ids=new Set();
    for(const map of mapsForLocation('soulsilver',name)) {
      assert.ok(!ids.has(map.id),`${name}: duplicate map ID`);ids.add(map.id);
      assert.ok(map.label);
      assert.match(map.file,/^[a-z0-9-]+\.png$/);
      if(verified.has(map.file))continue;
      verified.add(map.file);
      const bytes=await readFile(path.join(root,'assets/maps',map.file));
      assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
      assert.equal(bytes.readUInt32BE(16),map.width);
      assert.equal(bytes.readUInt32BE(20),map.height);
      assert.equal(createHash('sha256').update(bytes).digest('hex'),map.sha256,map.file);
      assert.equal(new URL(map.source).hostname,map.kind==='terrain-plan'?'github.com':'archives.bulbagarden.net');
    }
  }
  assert.ok(verified.size>100,'Expansion must add verified maps beyond the opening six');
});

test('required map coverage includes every planned location, floor and chamber',async()=>{
  const coverage=JSON.parse(await readFile(path.join(root,'docs/atlas-map-coverage.json'),'utf8'));
  assert.deepEqual(coverage.missing,[], 'Required original images must be verified before this milestone can ship');
  assert.equal(coverage.expectedLocations,69);
  assert.equal(coverage.availableViews,coverage.expectedViews);
  const {mapsForLocation}=await load();
  const scope=JSON.parse(await readFile(path.join(root,'scripts/atlas-map-sources.json'),'utf8'));
  for(const [name,views] of Object.entries(scope.locations)) {
    assert.deepEqual(mapsForLocation('soulsilver',name).map(m=>m.label),views.map(m=>m.label),name);
  }
});

test('the opening six map images stay unchanged and unsupported games have no fallback',async()=>{
  const {ATLAS_MAPS,mapsForLocation}=await load();
  const hashes={
    'New Bark Town':'4d602e3d8820365395411f78c28726e7c760120aebd2df1f2eed9fef8ca8d4b0',
    'Route 29':'8836a1576262df52bff455588479b03d74d141c76852510e7d82262b7c5b2be7',
    'Cherrygrove City':'5f3dff40889ad1b40d3be91e05a8eac50ec4dd2f5d8d7af7f10a26164574fbf5',
    'Route 30':'19ec8a05639d41002db0b811d5a64dd0b778abfed84dedd3ff6a5a45d1f9aa4c',
    'Route 31':'99e3967eb2ff03600f3df404817dc887e55ad26e8e109d6d3a5c2c1ee2aba758',
    'Violet City':'a6fea01a668fb4a85086abe89ecbbed33fb51c27da0dbb7fdad5b67640ec7f7a'
  };
  for(const [name,hash] of Object.entries(hashes))assert.equal(ATLAS_MAPS[name].sha256,hash);
  for(const game of ['heartgold','platinum','__proto__',undefined])assert.deepEqual(mapsForLocation(game,'Ice Path'),[]);
  assert.deepEqual(mapsForLocation('soulsilver','Safari Zone'),[]);
  assert.deepEqual(mapsForLocation('soulsilver','__proto__'),[]);
});

test('Johto interiors include all eight Gyms and clearly identify shared/reference images',async()=>{
 const {mapsForLocation}=await load();
 for(const town of ['Violet City','Azalea Town','Goldenrod City','Ecruteak City','Olivine City','Cianwood City','Mahogany Town','Blackthorn City']){
  const gym=mapsForLocation('soulsilver',town).find(m=>m.label==='Gym');assert.ok(gym,town);assert.equal(gym.kind,'floorplan');
 }
 const newBark=mapsForLocation('soulsilver','New Bark Town');
 assert.equal(newBark.filter(m=>m.id.startsWith('elms-lab-')).length,2);
 assert.ok(newBark.some(m=>m.id==='player-bedroom'));
 assert.ok(newBark.find(m=>m.id==='neighbor-house-1f').notice.includes('Shares'));
 const goldenrod=mapsForLocation('soulsilver','Goldenrod City');
 assert.ok(goldenrod.some(m=>m.id==='game-corner-international'&&m.notice.includes('Voltorb Flip')));
 assert.ok(goldenrod.some(m=>m.id==='game-corner-japanese'&&m.notice.includes('Japanese')));
 assert.equal(goldenrod.filter(m=>m.id.startsWith('global-terminal-')).length,3);
 assert.equal(mapsForLocation('soulsilver','Magnet Train Station').find(m=>m.id==='magnet-train-platform').kind,'reference');
 for(const town of ['Cherrygrove City','Violet City','Azalea Town','Ecruteak City','Olivine City','Cianwood City','Blackthorn City']){
  const maps=mapsForLocation('soulsilver',town);assert.ok(maps.some(m=>m.id.endsWith('pokecenter-1f')),town);
  for(const map of maps.filter(m=>m.kind==='reference'))assert.ok(map.notice,map.id);
 }
});

test('Johto interior census accounts for all reviewed primary headers without borrowing other regions',async()=>{
 const coverage=JSON.parse(await readFile(path.join(root,'docs/atlas-johto-interior-coverage.json'),'utf8'));
 const config=JSON.parse(await readFile(path.join(root,'scripts/soulsilver-interior-rooms.json'),'utf8'));
 const {mapsForLocation}=await load();
 assert.equal(coverage.primaryRevision,'d2355244ac42b3c6e40d8c36aa3564ee8706dea4');
 assert.equal(coverage.accountedHeaders,208);assert.equal(coverage.coveredRooms,173);
 assert.equal(coverage.addedPlans,103);assert.deepEqual(coverage.missing,[]);
 assert.equal(new Set([...coverage.rooms,...coverage.excluded].map(r=>r.mapId)).size,208);
 assert.deepEqual(coverage.rooms.map(r=>r.mapId),config.rooms.map(r=>r.mapId));
 for(const room of coverage.rooms){
  const view=mapsForLocation('soulsilver',room.location).find(m=>m.id===room.viewId);
  assert.ok(view,room.mapId);assert.ok(view.mapIds.includes(room.mapId),room.mapId);
  assert.ok(coverage.inputSha256[room.matrix]);assert.ok(coverage.inputSha256[room.events]);
  if(room.file){
   assert.equal(view.kind,'terrain-plan');assert.match(view.notice,/objects, height/);
   assert.ok(view.source.endsWith(coverage.primaryRevision+'/'+room.events));
   assert.ok(room.terrainRows.every(row=>row.length===room.bounds[2]-room.bounds[0]+1));
   assert.equal(room.terrainRows.length,room.bounds[3]-room.bounds[1]+1);
   for(const warp of room.warps)assert.equal(room.terrainRows[warp.z-room.bounds[1]][warp.x-room.bounds[0]],'E');
  }
 }
 assert.ok(coverage.excluded.some(r=>r.mapId==='MAP_SAFARI_ZONE_ENTRANCE_INTERIOR'));
 assert.ok(!coverage.rooms.some(r=>r.location==='Safari Zone'||/SAFFRON|VERMILION/.test(r.mapId)));
 assert.equal(mapsForLocation('platinum','Azalea Town').length,0);
});

test('new terrain plans preserve independently reviewed room dimensions and exit positions',async()=>{
 const {rooms}=JSON.parse(await readFile(path.join(root,'docs/atlas-johto-interior-coverage.json'),'utf8'));
 const room=id=>rooms.find(r=>r.mapId===id);
 const kurt=room('MAP_AZALEA_KURT_HOUSE');
 assert.deepEqual(kurt.bounds,[0,0,17,10]);assert.equal(kurt.model,239);
 assert.deepEqual(kurt.warps.map(w=>[w.x,w.z,w.header]),[[4,9,'MAP_AZALEA']]);
 assert.equal(kurt.terrainRows[0],'##################');assert.equal(kurt.terrainRows[7],'#................#');
 const theater=room('MAP_ECRUTEAK_DANCE_THEATER');
 assert.deepEqual(theater.bounds,[0,0,13,18]);assert.equal(theater.model,228);
 assert.deepEqual(theater.warps.map(w=>[w.x,w.z]),[[7,17]]);
 assert.equal(room('MAP_CIANWOOD_PHARMACY').model,234);
 assert.equal(room('MAP_AZALEA_GYM_ENTRANCE').warps.length,2);
 for(const id of ['MAP_SS_AQUA_CAPTAIN_ROOM','MAP_SS_AQUA_1F_NORTHWEST_ROOMS','MAP_BATTLE_TOWER_PARTNER_ROOM','MAP_GOLDENROD_MAGNET_TRAIN_STATION_2F_EMPTY','MAP_ROUTE_32_POKECENTER_B1F','MAP_SAFARI_ZONE_GATE_POKECENTER_B1F'])assert.ok(room(id).file,id);
 assert.equal(room('MAP_GOLDENROD_MAGNET_TRAIN_STATION_2F').warps.length,0,'Scripted train scene must not invent exits');
 assert.equal(room('MAP_MAHOGANY_GYM_LEADER_ROOM').viewId,'mahogany-gym','Original composite covers all three rooms');
});
