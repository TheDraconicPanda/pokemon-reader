const {test}=require('node:test');
const assert=require('node:assert/strict');
const api=()=>import('../js/data/safari-reference.js');
test('Safari topology uses verified 3×2 row-major positions and only the south-center entrance exits',async()=>{
 const {safariReference,safariNeighbors}=await api();const game=safariReference('soulsilver');
 assert.equal(safariReference('heartgold'),null);assert.equal(game.columns,3);assert.equal(game.rows,2);assert.equal(game.entrancePosition,4);
 assert.deepEqual(game.exampleAreas,[0,7,1,5,3,6]);assert.equal(game.areas.length,12);
 assert.deepEqual(safariNeighbors('soulsilver',0),{north:null,east:1,south:3,west:null});
 assert.deepEqual(safariNeighbors('soulsilver',4),{north:1,east:5,south:'gate',west:3});
 assert.equal(safariNeighbors('soulsilver',2).east,null);assert.equal(safariNeighbors('soulsilver',3).west,null);
 const reverse={north:'south',east:'west',south:'north',west:'east'};let edges=0,exits=0;
 for(let i=0;i<6;i++)for(const [d,target]of Object.entries(safariNeighbors('soulsilver',i))){if(target==='gate'){exits++;continue;}if(target!==null){edges++;assert.equal(safariNeighbors('soulsilver',target)[reverse[d]],i);}}
 assert.equal(edges,14);assert.equal(exits,1);assert.equal(safariNeighbors('x',4),null);
 for(const i of [-1,6,1.5,NaN])assert.equal(safariNeighbors('soulsilver',i),null);
 for(const source of Object.values(game.sources)){assert.match(source.url,/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/);assert.match(source.sha256,/^[a-f0-9]{64}$/);}
});
test('all twelve Safari area views share the verified 339-row catalogue and source indices',async()=>{
 const {safariReference,safariAreaEncounters}=await api();const {SOULSILVER_SAFARI_ENCOUNTERS:original}=await import('../js/data/games/soulsilver/safari-encounters.js');
 const rows=safariReference('soulsilver').areas.flatMap(area=>{const rows=safariAreaEncounters('soulsilver',area.id);assert.ok(rows.length);assert.ok(rows.every(r=>r.method.split(' · ')[0]===area.name));return rows;});
 assert.equal(rows.length,339);assert.equal(new Set(rows.map(r=>r.sourceIndex)).size,339);
 for(const {sourceIndex,...row}of rows)assert.deepEqual(row,original[sourceIndex]);
 assert.ok(rows.some(r=>r.rarity.includes('points')));assert.ok(rows.some(r=>r.method.includes('Surfing')));assert.ok(rows.some(r=>r.method.includes('Super Rod')));
 assert.deepEqual(safariAreaEncounters('other',0),[]);assert.deepEqual(safariAreaEncounters('soulsilver',12),[]);
});
test('manual layouts require six distinct area IDs and swapping preserves caller data and unrelated layouts',async()=>{
 const {validateSafariAreas,swapSafariArea}=await api();const original=[0,7,1,5,3,6];const changed=swapSafariArea('soulsilver',original,0,3);
 assert.deepEqual(original,[0,7,1,5,3,6]);assert.deepEqual(changed,[3,7,1,5,0,6]);
 assert.deepEqual(swapSafariArea('soulsilver',original,1,11),[0,11,1,5,3,6]);
 for(const input of [[],[0,1,2,3,4],[0,0,1,2,3,4],[0,1,2,3,4,12],[0,1,2,3,4,'5']])assert.throws(()=>validateSafariAreas('soulsilver',input));
 assert.throws(()=>validateSafariAreas('x',original));assert.throws(()=>swapSafariArea('soulsilver',original,6,1));
 const {validateSafariLayout}=await import('../js/safari-store.js');
 const record={key:'safariManualLayout:soulsilver:reference',gameId:'soulsilver',adventureId:null,schemaVersion:1,revision:1,areas:original};
 assert.equal(validateSafariLayout(record,'soulsilver',null),record);
 assert.throws(()=>validateSafariLayout(record,'soulsilver','other'));assert.throws(()=>validateSafariLayout({...record,schemaVersion:2},'soulsilver',null));
});
test('Safari map references cover the twelve exact area IDs without leaking into other games',async()=>{
 const {safariReference,safariAreaMap}=await api();const urls=new Set();
 for(const area of safariReference('soulsilver').areas){
  const map=safariAreaMap('soulsilver',area.id);
  assert.equal(map.name,area.name);assert.equal(map.width,496);assert.equal(map.height,384);
  assert.equal(map.contributor,area.id===8?null:'Jdthebud');
  const file=`Johto_Safari_Zone_${area.name.replaceAll(' ','_')}_HGSS.png`;
  assert.equal(new URL(map.imageUrl).hostname,'archives.bulbagarden.net');
  assert.ok(map.imageUrl.endsWith('/'+file));assert.ok(map.sourceUrl.endsWith('File:'+file));urls.add(map.imageUrl);
 }
 assert.equal(urls.size,12);
 for(const game of ['heartgold','other',null])assert.equal(safariAreaMap(game,0),null);
 for(const id of [-1,12,'0',null])assert.equal(safariAreaMap('soulsilver',id),null);
});

test('incomplete sparse layouts are rejected before a stored area can reach the renderer',async()=>{
 const {validateSafariAreas,swapSafariArea}=await api();
 const {validateSafariLayout}=await import('../js/safari-store.js');
 const incomplete=[0,7,1,5,3,6];delete incomplete[2];
 // IndexedDB structured cloning preserves holes: a corrupt six-slot record
 // must not be accepted merely because Array.some skips its missing entry.
 const stored=structuredClone(incomplete);
 assert.throws(()=>validateSafariAreas('soulsilver',stored),/six different/);
 assert.throws(()=>swapSafariArea('soulsilver',stored,0,11),/six different/);
 assert.throws(()=>validateSafariLayout({key:'safariManualLayout:soulsilver:reference',gameId:'soulsilver',adventureId:null,schemaVersion:1,revision:1,areas:stored},'soulsilver',null),/six different/);
});
