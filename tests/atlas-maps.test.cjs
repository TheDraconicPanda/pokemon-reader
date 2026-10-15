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
      assert.equal(new URL(map.source).hostname,'archives.bulbagarden.net');
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
