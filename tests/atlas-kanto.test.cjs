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
