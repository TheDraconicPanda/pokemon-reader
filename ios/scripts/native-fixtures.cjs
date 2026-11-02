// Synthetic parser fixtures, never personal saves or commercial ROM data.
const fs=require('node:fs');
const path=require('node:path');
const {syntheticSave}=require('../../tests/fixtures/soulsilver.cjs');
fs.writeFileSync(path.join(process.argv[2],'e2-soulsilver-input.sav'),syntheticSave().bytes);
