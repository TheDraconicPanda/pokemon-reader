// Optional external-oracle release gate. Node fixtures run without .NET;
// this script materializes exports for the pinned PKHeX harness to read.
import {createRequire} from 'node:module';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
import {detectSave} from '../js/saves/index.js';
import {evolveSavePokemon} from '../js/saves/evolution-transaction.js';
const require=createRequire(import.meta.url);
const {vectors,evolutionFixture,comparePokemon,dsv}=require('../tests/fixtures/gen4/evolution.cjs');
const ROOT=fileURLToPath(new URL('../',import.meta.url));
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');

export async function generatedSamples(){
 const samples=[];
 for(const vector of vectors.filter(v=>!v.blocked))for(const kind of ['party','storage']){
  const {bytes,oracle}=await evolutionFixture(vector,kind),loaded=detectSave(bytes);
  assert.equal(loaded.valid,true);
  const pokemon=kind==='party'?loaded.party[0]:loaded.storage.boxes[0].pokemon[0];
  const output=evolveSavePokemon(bytes,pokemon,vector,{time:vector.time});
  samples.push({file:`${vector.label}.${kind}.sav`,bytes:output,vector,kind,oracle});
  if(vector===vectors[0])samples.push({file:`${vector.label}.${kind}.dsv`,bytes:evolveSavePokemon(dsv(bytes),pokemon,vector),vector,kind,oracle});
 }
 return samples;
}

export async function writerFingerprints(){
 const files=['js/saves/evolution-transaction.js','js/saves/gen4-evolution.js','js/saves/platinum-evolution-rules.js',
  'js/saves/gen4-container.js','js/saves/gen4-stats.js','js/saves/gen4-binary.js','js/saves/gen4-pokemon.js','js/saves/gen4-save.js','js/saves/profiles.js','js/saves/index.js','js/saves/platinum.js','js/saves/platinum-special.js','js/saves/soulsilver.js',
  'js/pokemon-level.js','js/data/games/soulsilver/growth-rates.js','js/data/games/platinum/reader-reference.js','js/data/gen4-default-names.js',
  'tests/fixtures/gen4/evolution-vectors.json','tests/fixtures/gen4/evolution-oracle.json','tests/fixtures/gen4/evolution.cjs','tests/fixtures/gen4/platinum/postgame.sav'];
 return Object.fromEntries(await Promise.all(files.map(async file=>[file,sha(await readFile(path.join(ROOT,file)))])));
}

export async function verifyOracle(observations){
 const samples=await generatedSamples();
 assert.equal(observations.length,samples.length,'Every generated sample must be independently inspected');
 const byName=new Map(observations.map(row=>[row.file,row]));assert.equal(byName.size,samples.length);
 for(const sample of samples){
  const row=byName.get(sample.file);assert.ok(row,sample.file);
  assert.equal(row.sha256,sha(sample.bytes),sample.file);
  assert.equal(row.checksumsValid,true,`${sample.file}: PKHeX rejected block integrity`);
  assert.equal(row.seen,true);assert.equal(row.caught,true);
  assert.equal(row.firstGender,sample.oracle.after.genderId===1?1:0);
  assert.equal(row.secondGender,sample.oracle.after.genderId===1?1:0);
  comparePokemon(row.selected,sample.oracle.after,sample.kind==='party');
 }
 return {schemaVersion:1,gameId:'platinum',independentOracle:'PKHeX.Core.SAV4Pt',
  referenceRevision:'a9ff30657073b26825929a65ef58e61f99a1fe6f',
  verifiedAt:new Date().toISOString(),syntheticFixtures:true,realGamePlaythrough:false,
  supportedEvolutionRules:47,positiveVectors:vectors.filter(v=>!v.blocked).length,
  blockedVectors:vectors.filter(v=>v.blocked).length,verifiedExports:samples.length,
  writerInputSha256:await writerFingerprints(),observations,passed:true};
}

if(process.argv[2]==='--exports'){
 await mkdir(process.argv[3],{recursive:true});const samples=await generatedSamples();
 for(const sample of samples)await writeFile(path.join(process.argv[3],sample.file),sample.bytes);
 console.log(`Materialized ${samples.length} exports for independent inspection.`);
}else if(process.argv[2]==='--verify'){
 const observations=JSON.parse(await readFile(process.argv[3],'utf8'));
 const report=await verifyOracle(observations);
 await writeFile(path.join(ROOT,'docs/platinum-evolution-independent.json'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({passed:report.passed,exports:report.verifiedExports,rules:report.supportedEvolutionRules}));
}
