const {test} = require('node:test');
const assert = require('node:assert/strict');
const {readFile} = require('node:fs/promises');
const {createHash} = require('node:crypto');
const path = require('node:path');

test('opening-area maps have intact local PNGs, dimensions and source references', async () => {
  const source=await readFile(path.join(__dirname,'../js/data/atlas-maps.js'),'utf8');
  const {ATLAS_MAPS:maps}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
  assert.deepEqual(Object.keys(maps),['New Bark Town','Route 29','Cherrygrove City','Route 30','Route 31','Violet City']);
  for (const map of Object.values(maps)) {
    assert.match(map.file,/^[a-z0-9-]+\.png$/);
    const bytes=await readFile(path.join(__dirname,'../assets/maps',map.file));
    assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
    assert.equal(bytes.readUInt32BE(16),map.width);
    assert.equal(bytes.readUInt32BE(20),map.height);
    assert.equal(createHash('sha256').update(bytes).digest('hex'),map.sha256);
    assert.equal(new URL(map.source).hostname,'archives.bulbagarden.net');
  }
});
