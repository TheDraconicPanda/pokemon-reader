// Repair only Windows CRLF checkout conversion; preserve all actual local edits.
// Use when adopting .gitattributes in an existing checkout with hash-based tests.
import {spawnSync} from 'node:child_process';
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'../..');process.chdir(root);
const archive=spawnSync('git',['-c','core.autocrlf=false','archive','--format=tar','HEAD'],{maxBuffer:100*1024*1024});if(archive.status)throw Error('git archive failed');
let at=0,count=0;
while(at+512<=archive.stdout.length){const header=archive.stdout.subarray(at,at+512);if(header.every(v=>v===0))break;
  const name=header.subarray(0,100).toString().split('\0')[0],prefix=header.subarray(345,500).toString().split('\0')[0];
  const file=prefix?prefix+'/'+name:name,size=parseInt(header.subarray(124,136).toString().replaceAll('\0','').trim(),8)||0;
  const bytes=archive.stdout.subarray(at+512,at+512+size);at+=512+Math.ceil(size/512)*512;
  if(header[156]!==48&&header[156]!==0)continue;
  const path=resolve(root,file);if(!path.startsWith(root+'/')&&!path.startsWith(root+'\\'))throw Error('Invalid archive entry');
  const current=readFileSync(path);if(current.equals(bytes)||current.includes(0)||bytes.includes(0))continue;
  if(Buffer.from(current.toString('utf8').replaceAll('\r\n','\n')).equals(bytes)){writeFileSync(path,bytes);count++;}
}
console.log(`Restored canonical line endings in ${count} tracked text files; actual local edits preserved.`);
