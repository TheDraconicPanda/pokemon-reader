const {test}=require('node:test');
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
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
test('all twelve Safari area views preserve the original 269 records, conditions and source indices',async()=>{
 const {safariReference,safariAreaEncounters}=await api();const {SOULSILVER_SAFARI_ENCOUNTERS:original}=await import('../js/data/games/soulsilver/safari-encounters.js');
 const rows=safariReference('soulsilver').areas.flatMap(area=>{const rows=safariAreaEncounters('soulsilver',area.id);assert.ok(rows.length);assert.ok(rows.every(r=>r.method.split(' · ')[0]===area.name));return rows;});
 assert.equal(rows.length,269);assert.equal(new Set(rows.map(r=>r.sourceIndex)).size,269);
 for(const {sourceIndex,...row}of rows)assert.deepEqual(row,original[sourceIndex]);
 assert.equal(crypto.createHash('sha256').update(JSON.stringify(original)).digest('hex'),'769f131cc6148882931d4e5ddf4ce614fca9494389f6cafe5d73d229d3228246');
 assert.ok(rows.some(r=>r.rarity.includes('days')));assert.ok(rows.some(r=>r.method.includes('Surfing')));assert.ok(rows.some(r=>r.method.includes('Super Rod')));
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
