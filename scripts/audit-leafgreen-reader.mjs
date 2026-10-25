// Compare production decoding with independently generated PKHeX observations.
// To refresh: run the pinned C# harness's records and inspect commands, then
// pass --records-in RECORDS.json --save-in INSPECT.json to this audit.
import {readFile,writeFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {decodeGen3Pokemon} from '../js/saves/gen3-pokemon.js';
import {detectLeafGreen} from '../js/saves/leafgreen.js';
const require=createRequire(import.meta.url),{save}=require('../tests/fixtures/gen3.cjs');
const root=new URL('../',import.meta.url);
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
// PKHeX's normalized ability enum omits native, unused Cacophony (76), so its
// Air Lock is 76 while the cartridge's constants and name table use 77.
const nativeValue=(key,value)=>key==='abilityId' && value===76 ? 77 : value;
export async function auditReader(records,inspection) {
  assert.equal(records.length,434);
  const species=new Set();
  for(const [i,row] of records.entries()) {
    const actual=decodeGen3Pokemon(Buffer.from(row.raw,'base64'));
    for(const [key,value] of Object.entries(row.expected))assert.deepEqual(actual[key],nativeValue(key,value),`record ${i}: ${key}`);
    species.add(actual.speciesId);
  }
  assert.equal(species.size,386);
  const bytes=save(),actual=detectLeafGreen(bytes,{confirmed:true});
  assert.equal(actual.valid,true,actual.reason);
  assert.deepEqual(actual.trainer,{...inspection.trainer,gender:inspection.trainer.gender?'Female':'Male',badgeCount:2});
  assert.equal(actual.save.pokedex.nationalDex,inspection.nationalDex);
  assert.equal(actual.party.length,inspection.party.length);
  for(const [i,p]of inspection.party.entries())for(const[key,value]of Object.entries(p))assert.deepEqual(actual.party[i][key],value,`party ${i}: ${key}`);
  const occupied=actual.storage.boxes.flatMap(box=>box.pokemon.filter(p=>!p.empty));assert.equal(occupied.length,inspection.boxes.length);
  for(const row of inspection.boxes)for(const[key,value]of Object.entries(row.pokemon))assert.deepEqual(actual.storage.boxes[row.box-1].pokemon[row.slot-1][key],value,`PC ${row.box}/${row.slot}: ${key}`);
  return {passed:true,synthetic:true,realSaveValidation:false,oracle:'PKHeX',referenceRevision:'9c3391d017d91ba407ef53075b15581f1bec8f0d',
    records:434,species:386,saveSha256:sha(bytes),recordsSha256:sha(JSON.stringify(records)),inspectionSha256:sha(JSON.stringify(inspection)),
    resolvedDifferences:[
      'Deoxys effective LeafGreen form is Defense; raw PK3 lacks a form field, and PKHeX exposes zero except Unown.',
      'Native GetAbilityBySpecies selects the stored ability slot directly; PKHeX falls back from a zero second ability to slot one. Ordinary oracle records use the valid first slot; a separate negative test preserves native zero behavior.',
      'Native Air Lock is ability 77 after unused Cacophony (76); PKHeX normalizes Air Lock to its modern identifier 76. Comparisons explicitly map this identifier.',
    ]};
}
if(process.argv[1]===new URL(import.meta.url).pathname) {
  const arg=name=>process.argv[process.argv.indexOf(name)+1];
  const refreshing=process.argv.includes('--records-in');
  const records=JSON.parse(await readFile(refreshing?arg('--records-in'):new URL('tests/fixtures/leafgreen/pkhex-records.json',root),'utf8'));
  const inspection=JSON.parse(await readFile(refreshing?arg('--save-in'):new URL('tests/fixtures/leafgreen/pkhex-save.json',root),'utf8'));
  const report=await auditReader(records,inspection);
  if(refreshing) {
    await writeFile(new URL('tests/fixtures/leafgreen/pkhex-records.json',root),JSON.stringify(records)+'\n');
    await writeFile(new URL('tests/fixtures/leafgreen/pkhex-save.json',root),JSON.stringify(inspection,null,2)+'\n');
    await writeFile(new URL('docs/leafgreen-reader-independent.json',root),JSON.stringify(report,null,2)+'\n');
  }
  console.log(JSON.stringify(report,null,2));
}
