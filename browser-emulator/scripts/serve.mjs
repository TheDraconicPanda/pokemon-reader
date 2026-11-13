// Loopback only, public B1 allowlist. Never serves work/, ROMs or personal saves.
import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {readFileSync} from 'node:fs';
import {resolve,extname} from 'node:path';
const root=resolve(import.meta.dirname,'..');
const manifest=JSON.parse(readFileSync(resolve(root,'offline-assets.json')));
const allowed=new Set([...manifest.files,'sw.js','source.zip','offline-assets.json']);
const types={'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.wasm':'application/wasm','.css':'text/css','.json':'application/json','.webmanifest':'application/manifest+json','.png':'image/png','.txt':'text/plain','.zip':'application/zip'};
export function createServer(){return http.createServer(async(req,res)=>{try{
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{Allow:'GET, HEAD'}).end();return;}
  const url=new URL(req.url,'http://localhost');if(url.pathname==='/'){res.writeHead(302,{Location:'/browser-emulator/'}).end();return;}
  if(!url.pathname.startsWith('/browser-emulator/')){res.writeHead(404).end();return;}
  let name=decodeURIComponent(url.pathname.slice('/browser-emulator/'.length))||'index.html';
  if(!allowed.has(name)){res.writeHead(404).end();return;}
  const file=resolve(root,name),data=await readFile(file);
  res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'}).end(data);
}catch{res.writeHead(404).end();}});}
if(process.argv[1]&&resolve(process.argv[1])===resolve(import.meta.filename)){const port=Number(process.env.PORT||8080);createServer().listen(port,'127.0.0.1',()=>console.log(`Reader Browser B1: http://127.0.0.1:${port}/browser-emulator/\nPC loopback preview. iPhone needs the documented HTTPS route.`));}
