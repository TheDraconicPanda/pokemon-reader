const {test}=require('node:test');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
const load=file=>import(pathToFileURL(path.join(__dirname,'..',file)).href);

test('every directed non-Safari connection has a scoped travel review and sources',async()=>{
 const {ATLAS_LOCATIONS:locations}=await load('js/data/atlas-locations.js');
 const {SOULSILVER_TRAVEL:travel}=await load('js/data/games/soulsilver/travel.js');
 const {travelConnection,travelHm}=await load('js/data/atlas-travel.js');
 let count=0;
 for(const from of locations.filter(l=>l.name!=='Safari Zone'))for(const to of from.connections.filter(n=>n!=='Safari Zone')){
  const r=travelConnection('soulsilver',from.name,to);assert.ok(r,from.name+' → '+to);count++;
  assert.equal(r.fromLocation,from.name);assert.equal(r.toLocation,to);assert.ok(r.sources.length>=2);
  for(const url of r.sources)assert.ok(['bulbapedia.bulbagarden.net','www.serebii.net'].includes(new URL(url).hostname));
  for(const hm of r.hms){assert.ok(travelHm('soulsilver',hm.id));assert.ok(['passage','through','alternative','optional'].includes(hm.usage));}
 }
 assert.equal(count,274);assert.equal(travel.connections.length,154);
 assert.equal(travelConnection('soulsilver','Safari Zone Gate','Safari Zone'),null);
 for(const game of ['heartgold','__proto__',undefined]){assert.equal(travelConnection(game,'New Bark Town','Route 27'),null);assert.equal(travelHm(game,'surf'),null);}
 assert.equal(travelHm('soulsilver','__proto__'),null);
});

test('travel indicators distinguish mandatory HMs, alternative paths, depth and one-way ledges',async()=>{
 const {travelConnection:r,travelHm}=await load('js/data/atlas-travel.js');
 const edge=(a,b)=>r('soulsilver',a,b);
 assert.deepEqual(edge('New Bark Town','Route 27').hms,[{id:'surf',usage:'passage'}]);
 assert.equal(edge('New Bark Town','Route 29').hms.length,0);
 assert.equal(edge('Cherrygrove City','Route 29').hms.length,0);
 assert.deepEqual(edge('Route 35','Route 36').hms,[{id:'cut',usage:'passage'}]);
 assert.equal(edge('Route 35','National Park').hms.length,0);
 assert.equal(edge('Ecruteak City','Route 42').hms.find(h=>h.id==='surf').usage,'alternative');
 assert.match(edge('Ecruteak City','Route 42').notes.join(' '),/Mt. Mortar/);
 assert.equal(edge('Route 44','Ice Path').hms.some(h=>h.id==='waterfall'),false);
 assert.match(edge('Route 44','Ice Path').notes.join(' '),/teaching or using Waterfall is not needed/);
 assert.equal(edge('Route 44','Ice Path').hms.find(h=>h.id==='strength').usage,'through');
 assert.deepEqual(edge('Route 41','Whirl Islands').hms.map(h=>h.id),['surf','whirlpool']);
 assert.equal(edge('Azalea Town','Slowpoke Well').hms.every(h=>h.usage==='optional'),true);
 assert.match(edge('Route 29','Route 46').notes.join(' '),/lower section.*Ledges/);
 assert.match(edge('Dark Cave','Route 45').notes.join(' '),/cannot be reached uphill/);
 assert.match(edge('Mahogany Town','Route 44').conditions.join(' '),/Radio Tower.*RageCandyBar/);
 assert.match(edge('Pokémon League Reception Gate','Route 28').conditions.join(' '),/16 Badges.*Oak/);
 assert.equal(travelHm('soulsilver','surf').badge,'Fog Badge');
 assert.equal(travelHm('soulsilver','strength').badge,'Plain Badge');
});
