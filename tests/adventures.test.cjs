const { test } = require('node:test');
const assert = require('node:assert/strict');
const { fixture } = require('./fixtures/reader.cjs');
const { syntheticSave } = require('./fixtures/soulsilver.cjs');
const api = import('../js/adventures.js');

test('decoded snapshots preserve Reader fields and strip binary data and save offsets', async () => {
  const {createSnapshot, snapshotResult, trainerKey} = await api;
  const result = fixture();
  result.raw = new Uint8Array(512 * 1024);
  result.party[0].saveOffset = 0x98;
  result.party[0].evs.unexpectedBinary = new Uint8Array(30);
  const snapshot = createSnapshot(result, 'example.sav', '2026-10-19T10:00:00.000Z');
  assert.equal(trainerKey(snapshot), 'soulsilver:123:456');
  assert.equal(snapshot.party[0].saveOffset, undefined);
  assert.equal(snapshot.party[0].evs.unexpectedBinary, undefined);
  assert.equal(snapshot.raw, undefined);
  assert.equal(snapshot.safari.supported, false);
  const restored = snapshotResult(snapshot);
  assert.deepEqual(restored.party, snapshot.party);
  assert.equal(restored.storage.boxes.length, 18);
  assert.equal(restored.save.pokedex.caughtCount, 1);
});

test('partial, corrupt, unsupported and inconsistent snapshots are rejected before storage', async () => {
  const {createSnapshot, validateSnapshot} = await api;
  for (const mutate of [
    r => {r.valid = false;},
    r => {r.game = 'Pokémon Platinum';},
    r => {r.decodeComplete = false;},
    r => {r.storage.boxes.pop();},
    r => {r.storage.boxes[0].pokemon.pop();},
    r => {r.party[0].checksumValid = false;},
    r => {delete r.party[0].checksumValid;},
    r => {r.party[0].speciesId = 494;},
    r => {r.party[0].moves[0].id = 468;},
    r => {r.party[0].evs.hp = -1;},
    r => {r.party[0].evs = Object.fromEntries(Object.keys(r.party[0].evs).map(k => [k,255]));},
    r => {delete r.party[0].ivs.hp;},
    r => {delete r.save.trainer.secretId;},
    r => {r.save.pokedex.caughtCount++;},
    r => {r.save.pokedex.caughtSpecies.push(25);}
  ]) {
    const result = fixture(); mutate(result);
    assert.throws(() => createSnapshot(result, 'invalid.sav'));
  }
  const snapshot = createSnapshot(fixture(), 'valid.sav');
  assert.throws(() => validateSnapshot({...snapshot,schemaVersion:99}));
  assert.throws(() => validateSnapshot({...snapshot,snapshotVersion:99}));
});

test('parser exposes individual-record checksum failure even when the outer block is valid', async () => {
  const {detectSoulSilver} = await import('../js/saves/soulsilver.js');
  const {createSnapshot} = await api;
  const {bytes, sealBlock} = syntheticSave();
  const result = detectSoulSilver(bytes.buffer);
  assert.equal(result.valid, true);
  assert.equal(result.party[0].checksumValid, true);
  assert.equal(result.storage.boxes[0].pokemon[0].checksumValid, true);
  assert.equal(createSnapshot(result, 'synthetic.sav').party[0].speciesId, 133);
  bytes[0x98 + 8] ^= 1;
  sealBlock(0, 0xF628);
  const corrupt = detectSoulSilver(bytes.buffer);
  assert.equal(corrupt.valid, true, 'Outer block still validates');
  assert.equal(corrupt.party[0].checksumValid, false);
  assert.throws(() => createSnapshot(corrupt, 'corrupt.sav'), /corrupt/);
});
