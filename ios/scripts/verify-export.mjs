import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {detectSave} from '../../js/saves/index.js';
const folder=process.argv[2];
for(const game of ['soulsilver','platinum']){
  const original=new Uint8Array(fs.readFileSync(path.join(folder,`e2-${game}-input.sav`)));
  const exported=new Uint8Array(fs.readFileSync(path.join(folder,`e2-${game}-export.sav`)));
  const before=detectSave(original),after=detectSave(exported);
  assert.equal(before.valid,true,before.reason);assert.equal(after.valid,true,after.reason);
  // SoulSilver retains the Reader's legacy implicit/default game identifier.
  assert.equal(after.gameId??'soulsilver',game);assert.deepEqual(after.trainer,before.trainer);
  assert.deepEqual(after.party,before.party);assert.deepEqual(after.storage,before.storage);
  const expected=new Uint8Array(original);expected[0x30000]=0x53;
  assert.deepEqual(exported,expected,'Only the diagnostic cartridge SPI write may differ');
}
console.log('PASS: both native cartridge exports independently decoded by the existing Reader; trainer, party and PC preserved.');
