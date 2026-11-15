// Build offline parser closure, icons and an explicit app cache. No dependencies.
import {readFileSync,writeFileSync,mkdirSync,copyFileSync,existsSync,readdirSync} from 'node:fs';
import {resolve,dirname,relative} from 'node:path';
import {createHash} from 'node:crypto';
import {deflateSync,deflateRawSync} from 'node:zlib';
import {spawnSync} from 'node:child_process';
const root=resolve(import.meta.dirname,'../..'),app=resolve(root,'browser-emulator');
process.chdir(root);
// Make hashes match the LF checkout contract before packaging on Windows.
function normalize(dir){for(const entry of readdirSync(dir,{withFileTypes:true})){const file=resolve(dir,entry.name);
  if(entry.isDirectory())normalize(file);else if(!/\.(wasm|zip|png)$/.test(file)){
    const before=readFileSync(file),after=Buffer.from(before.toString('utf8').replaceAll('\r\n','\n'));if(!before.equals(after))writeFileSync(file,after);
  }
}}
normalize(app);
const visited=new Set();
function visit(file){file=resolve(file);if(visited.has(file))return;visited.add(file);
  const text=readFileSync(file,'utf8').replaceAll('\r\n','\n'),out=resolve(app,'vendor/reader',relative(root,file));mkdirSync(dirname(out),{recursive:true});writeFileSync(out,text);
  for(const match of text.matchAll(/(?:from\s*|import\s*)['"]([^'"]+)['"]/g)){if(match[1].startsWith('.'))visit(resolve(dirname(file),match[1]));}
}
visit('js/saves/index.js');
const crcTable=Array.from({length:256},(_,v)=>{for(let i=0;i<8;i++)v=v&1?(v>>>1)^0xedb88320:v>>>1;return v>>>0;});
function crc(data){let v=0xffffffff;for(const b of data)v=crcTable[(v^b)&255]^(v>>>8);return(v^0xffffffff)>>>0;}
function chunk(name,data){const n=Buffer.from(name),b=Buffer.alloc(12+data.length);b.writeUInt32BE(data.length);n.copy(b,4);data.copy(b,8);b.writeUInt32BE(crc(Buffer.concat([n,data])),8+data.length);return b;}
for(const size of [192,512]){const raw=Buffer.alloc((size*4+1)*size);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){const at=y*(size*4+1)+1+x*4;let c=[19,40,33,255];
    if(x>size*.18&&x<size*.82&&((y>size*.18&&y<size*.45)||(y>size*.55&&y<size*.82)))c=[211,225,157,255];
    Buffer.from(c).copy(raw,at);}
  const header=Buffer.alloc(13);header.writeUInt32BE(size);header.writeUInt32BE(size,4);header[8]=8;header[9]=6;
  writeFileSync(resolve(app,size===192?'icon.png':'icon-512.png'),Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',deflateSync(raw)),chunk('IEND',Buffer.alloc(0))]));
}
// Corresponding source: exact upstream tracked files + our build inputs. No .git,
// work state, test saves, ROMs, credentials, or generated binaries enter the zip.
const entries=[];
const source=resolve(process.env.MELONDS_SOURCE||'work/research/melonds');
function files(dir){const r=spawnSync('git',['-C',dir,'ls-files','-z'],{encoding:'utf8'});if(r.status)throw Error('Source tree unavailable');return r.stdout.split('\0').filter(Boolean);}
for(const name of files(source))if(existsSync(resolve(source,name)))entries.push([`melonDS/${name}`,readFileSync(resolve(source,name))]);
const own=['browser-emulator/CMakeLists.txt','browser-emulator/core.lock.json','ios/Tests/TestROM.h','package.json','docs/browser-b1.md'];
// Include new/untracked B1 source during development, from an explicit inventory.
const appFiles=['.gitattributes','index.html','style.css','app.mjs','worker.mjs','timing.mjs','storage.mjs','audio-worklet.js','manifest.webmanifest','THIRD-PARTY.txt','core/adapter.cpp','core/platform.cpp','core/session.h','scripts/build-core.mjs','scripts/prepare.mjs','scripts/serve.mjs','scripts/iphone-test.ps1'];
for(const f of [...own,...appFiles.map(f=>'browser-emulator/'+f),...[...visited].map(f=>relative(root,f))])if(existsSync(f))entries.push([`pokemon-reader/${f.replaceAll('\\','/')}`,readFileSync(f)]);
entries.push(['SOURCE-BUILD.txt',Buffer.from('Corresponding source for Reader Browser B1 0.1.0.\nUse Emscripten 4.0.10, CMake 3.25+ and Ninja. From this extracted directory:\nemcmake cmake -S pokemon-reader/browser-emulator -B build -G Ninja -DCMAKE_BUILD_TYPE=Release -DMELONDS_SOURCE=<absolute path to extracted melonDS directory>\ncmake --build build --parallel 4\nOutput: pokemon-reader/browser-emulator/vendor/b1.mjs and b1.wasm.\nThe melonDS directory is the complete pinned source tree b86390e4428bf38ce4c1ce0e9ca446d6d25955e8 with original component notices.\nSee pokemon-reader/docs/browser-b1.md and browser-emulator/THIRD-PARTY.txt.\n')]);
const locals=[],centrals=[];let offset=0;
for(const [name,data]of entries){const n=Buffer.from(name),packed=deflateRawSync(data),sum=crc(data),h=Buffer.alloc(30),c=Buffer.alloc(46);
  h.writeUInt32LE(0x04034b50);h.writeUInt16LE(20,4);h.writeUInt16LE(8,8);h.writeUInt32LE(sum,14);h.writeUInt32LE(packed.length,18);h.writeUInt32LE(data.length,22);h.writeUInt16LE(n.length,26);
  c.writeUInt32LE(0x02014b50);c.writeUInt16LE(20,4);c.writeUInt16LE(20,6);c.writeUInt16LE(8,10);c.writeUInt32LE(sum,16);c.writeUInt32LE(packed.length,20);c.writeUInt32LE(data.length,24);c.writeUInt16LE(n.length,28);c.writeUInt32LE(offset,42);
  locals.push(h,n,packed);centrals.push(c,n);offset+=h.length+n.length+packed.length;
}
const directory=Buffer.concat(centrals),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(entries.length,8);end.writeUInt16LE(entries.length,10);end.writeUInt32LE(directory.length,12);end.writeUInt32LE(offset,16);
writeFileSync(resolve(app,'source.zip'),Buffer.concat([...locals,directory,end]));
const publicFiles=['./','index.html','style.css','app.mjs','worker.mjs','timing.mjs','storage.mjs','audio-worklet.js','manifest.webmanifest','icon.png','icon-512.png','THIRD-PARTY.txt','vendor/b1.mjs','vendor/b1.wasm','vendor/build.json','vendor/melonDS-LICENSE.txt',
  ...[...visited].map(f=>'vendor/reader/'+relative(root,f).replaceAll('\\','/'))];
const hashes=Object.fromEntries(publicFiles.filter(f=>f!=='./').map(f=>[f,createHash('sha256').update(readFileSync(resolve(app,f))).digest('hex')]));
const version='b1-'+createHash('sha256').update(JSON.stringify(hashes)).digest('hex').slice(0,16);
writeFileSync(resolve(app,'offline-assets.json'),JSON.stringify({version,files:publicFiles,hashes},null,2)+'\n');
writeFileSync(resolve(app,'sw.js'),`// Generated by scripts/prepare.mjs. Scope is browser-emulator/ only.\nconst VERSION=${JSON.stringify(version)};\nconst ASSETS=${JSON.stringify([...publicFiles,'offline-assets.json'])};
self.addEventListener('install',event=>event.waitUntil(caches.open(VERSION).then(cache=>cache.addAll(ASSETS))));
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const name of await caches.keys())if(name.startsWith('b1-')&&name!==VERSION)await caches.delete(name);await self.clients.claim();})()));
self.addEventListener('message',event=>{if(event.data?.type==='version')event.ports[0]?.postMessage({version:VERSION});});
self.addEventListener('fetch',event=>{const url=new URL(event.request.url);if(event.request.method!=='GET'||url.origin!==self.location.origin)return;
const base=new URL('./',self.location),relative=url.href.slice(base.href.length);if(!url.href.startsWith(base.href)||!ASSETS.includes(relative)&&!ASSETS.includes('./'+relative))return;
event.respondWith(caches.open(VERSION).then(cache=>cache.match(event.request,{ignoreSearch:false})).then(hit=>hit||fetch(event.request)));});\n`);
console.log(`Prepared ${publicFiles.length} offline assets (${version}); source.zip contains ${entries.length} source files.`);
