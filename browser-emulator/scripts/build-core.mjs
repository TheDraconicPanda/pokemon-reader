// All downloaded tools, compiler caches and build output stay in the checkout.
import {readFileSync, mkdirSync, existsSync, writeFileSync, copyFileSync} from 'node:fs';
import {resolve, delimiter} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const root=resolve(import.meta.dirname,'../..');
process.chdir(root);
const lock=JSON.parse(readFileSync('browser-emulator/core.lock.json'));
const source=resolve(process.env.MELONDS_SOURCE||'work/research/melonds');
const sdk=resolve(process.env.EMSDK||'work/tools/emsdk');
const win=process.platform==='win32';
const cmake=process.env.CMAKE_BIN||(win?resolve('work/tools/python-packages/cmake/data/bin/cmake.exe'):'cmake');
const ninja=process.env.NINJA_BIN||(win?resolve('work/tools/python-packages/bin/ninja.exe'):'ninja');
const python=process.env.EMSDK_PYTHON||(win?resolve(sdk,'python/3.13.3_64bit/python.exe'):'python3');
const env={...process.env,EMSDK_PYTHON:python,EM_CONFIG:resolve(sdk,'.emscripten'),EM_CACHE:resolve('work/cache/emscripten'),
  TEMP:resolve('work/tmp'),TMP:resolve('work/tmp'),PYTHONDONTWRITEBYTECODE:'1',
  PATH:[resolve(cmake,'..'),resolve(ninja,'..'),process.env.PATH].join(delimiter)};
for(const p of ['work/tmp','work/cache/emscripten','browser-emulator/vendor'])mkdirSync(p,{recursive:true});
function run(command,args){const r=spawnSync(command,args,{env,stdio:'inherit'});if(r.error)throw r.error;if(r.status)process.exit(r.status);}
const sha=spawnSync('git',['-C',source,'rev-parse','HEAD'],{encoding:'utf8'}).stdout?.trim();
if(sha!==lock.revision)throw Error(`Expected melonDS ${lock.revision}, got ${sha}`);
if(!existsSync(resolve(sdk,'upstream/emscripten/emcmake.py')))throw Error('Install and activate the pinned repository-local Emscripten first.');
run(python,[resolve(sdk,'upstream/emscripten/emcmake.py'),cmake,'-S','browser-emulator','-B','work/b1/build','-G','Ninja',
  '-DCMAKE_BUILD_TYPE=Release',`-DCMAKE_MAKE_PROGRAM=${ninja}`,`-DMELONDS_SOURCE=${source}`]);
run(cmake,['--build','work/b1/build','--parallel','4']);
copyFileSync(resolve(source,'LICENSE'),'browser-emulator/vendor/melonDS-LICENSE.txt');
for(const file of ['b1.mjs','melonDS-LICENSE.txt']){
  const path='browser-emulator/vendor/'+file;
  writeFileSync(path,readFileSync(path,'utf8').replaceAll('\r\n','\n').replace(/[ \t]+$/gm,''));
}
const hashes={};for(const name of ['b1.mjs','b1.wasm'])hashes[name]=createHash('sha256').update(readFileSync(`browser-emulator/vendor/${name}`)).digest('hex');
writeFileSync('browser-emulator/vendor/build.json',JSON.stringify({coreRevision:sha,emscripten:lock.emscripten,hashes},null,2)+'\n');
