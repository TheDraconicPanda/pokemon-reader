// Run with a directory containing hgss-personal.json, hgss-abilities.h and
// hgss-pokemon-pinned.c downloaded from the pinned URLs recorded by the Pokédex.
import {readFile, writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import path from 'node:path';
import {SOULSILVER_POKEDEX as reference} from '../js/data/games/soulsilver/pokedex-reference.js';
import {gen4AbilityForPid} from '../js/saves/gen4-abilities.js';

export async function auditAbilities(directory) {
 const sources = {}, inputs = {};
 for (const [local, primary] of [['hgss-personal.json','files/poketool/personal/personal.json'],['hgss-abilities.h','include/constants/abilities.h'],['hgss-pokemon-pinned.c','src/pokemon.c']]) {
  const bytes=await readFile(path.join(directory,local)), source=reference.sources['pret:'+primary];
  assert.ok(source,primary);
  assert.equal(createHash('sha256').update(bytes).digest('hex'),source.sha256,primary+' is not the pinned primary source');
  sources[primary]=source;inputs[local]=bytes.toString();
 }
 const primary=JSON.parse(inputs['hgss-personal.json']).baseStats;
 const constants=Object.fromEntries([...inputs['hgss-abilities.h'].matchAll(/^#define\s+(\w+)\s+(\d+)\s*$/gm)].map(m=>[m[1],Number(m[2])]));
 const entries=[];
 for(const [key,record]of Object.entries(reference.species)) {
  const slots=primary[key].abilities.map(name=>constants[name]);
  assert.ok(slots.length===2&&slots.every(Number.isInteger));
  assert.deepEqual(record.abilities,[...new Set(slots.filter(Boolean))],`Ability order differs for record ${key}`);
  for(const pid of [0,1]) assert.equal(gen4AbilityForPid(pid,record.abilities),pid&1&&slots[1]?slots[1]:slots[0]);
  entries.push({key:Number(key),species:record.id,slots});
 }
 assert.match(inputs['hgss-pokemon-pinned.c'],/void UpdateBoxMonAbility\(BoxPokemon \*boxMon\)/);
 assert.equal(new Set(entries.map(e=>e.species)).size,493);
 return {schemaVersion:1,gameId:'soulsilver',mechanics:'HGSS UpdateBoxMonAbility: PID bit 0 selects the ordered species/form slot; absent second slot falls back to the first.',sources,species:493,records:entries.length,entries,passed:true};
}
if(process.argv[2]) {
 const report=await auditAbilities(process.argv[2]);
 await writeFile(new URL('../docs/hgss-ability-evidence.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
 console.log(`Verified ordered abilities for all ${report.records} HGSS species/form records against pinned primary data.`);
}
