// Real bundled app, real C++ HTTP server and real IndexedDB; no parser stubs.
const {spawn}=require('node:child_process'),fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..'),build=process.argv[2]||path.join(root,'work/e1/build-linux'),bundle=process.argv[3]||path.join(root,'work/e4/Reader');
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
let server,browser,socket,origin,next=0,scriptId,log='';const pending=new Map(),exceptions=[],external=[];
async function until(fn,label){const deadline=Date.now()+20000;while(Date.now()<deadline){try{const r=await fn();if(r)return r;}catch(e){if(!/context|navigat/i.test(e.message))throw e;}await pause(30);}throw Error(`Timeout: ${label}\n${log.slice(-1500)}`);}
function command(method,params={}){return new Promise((resolve,reject)=>{const id=++next,timer=setTimeout(()=>{pending.delete(id);reject(Error(method+' timed out'));},20000);pending.set(id,m=>{clearTimeout(timer);m.error?reject(Error(JSON.stringify(m.error))):resolve(m.result);});socket.send(JSON.stringify({id,method,params}));});}
async function evaluate(expression){const r=await command('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;}
const config=(rom='a',game='soulsilver')=>({token:'test-token',rom:rom.repeat(64),name:`Test ${game} ${rom}`,game});
async function open(configuration){if(scriptId)await command('Page.removeScriptToEvaluateOnNewDocument',{identifier:scriptId});
  scriptId=(await command('Page.addScriptToEvaluateOnNewDocument',{source:`window.__readerNativeConfig=${JSON.stringify(configuration)};window.nativeMessages=[];window.webkit={messageHandlers:{reader:{postMessage:m=>nativeMessages.push(m)}}};`})).identifier;
  await command('Page.navigate',{url:origin+'/'});await until(()=>evaluate(`window.nativeMessages?.some(m=>m.type==='ready')`),'native bridge ready');
}
async function packet(configuration,which='completed'){
 const raw=await fs.readFile(path.join(build,`reader-${configuration.game}-${which}.sav`));return {...configuration,base64:raw.toString('base64'),digest:crypto.createHash('sha256').update(raw).digest('hex'),capturedAt:Date.now(),general:which==='completed'?1:0,storage:which==='completed'?1:0,origin:'test completed cartridge SPI write'};
}
async function deliver(data){return evaluate(`window.__readerReceive(${JSON.stringify(data)})`);}
async function profiles(){return evaluate(`import('/js/adventures.js').then(m=>m.listProfiles())`);}
async function main(){
  const profile=path.join(root,'work/e4/chromium');await fs.rm(profile,{recursive:true,force:true});await fs.mkdir(profile,{recursive:true});
  server=spawn(path.join(build,'reader_web_server'),[bundle],{stdio:['pipe','pipe','pipe']});server.stderr.on('data',d=>log+=d);
  let output='';server.stdout.on('data',d=>output+=d);await until(()=>/\d+/.test(output),'C++ server');origin=`http://127.0.0.1:${Number(output.trim())}`;
  for(const [route,type]of [['/','text/html'],['/js/app.js','text/javascript'],['/native/hgss-offline.json','application/json'],['/assets/pokemon/hgss/shiny/25.png','image/png'],['/docs/platinum-great-marsh.md','text/plain']]){const r=await fetch(origin+route);await r.arrayBuffer();assert.equal(r.status,200,route);assert.ok(r.headers.get('content-type').includes(type),route);}
  for(const route of ['/../ios/core.lock.json','/%2e%2e/ios/core.lock.json','/.git/config','/reader.completed','/api/save'])assert.equal((await fetch(origin+route)).status,404,route);
  assert.equal((await fetch(origin+'/',{method:'POST',body:'x'})).status,404);
  browser=spawn(process.env.CHROMIUM_PATH||'chromium',['--headless','--no-sandbox','--no-first-run','--disable-extensions','--disable-gpu','--disable-dev-shm-usage','--disable-features=BackForwardCache','--remote-debugging-port=0',`--user-data-dir=${profile}`,'about:blank'],{stdio:['ignore','ignore','pipe'],env:{...process.env,XDG_CONFIG_HOME:path.join(root,'work/e4/config'),XDG_CACHE_HOME:path.join(root,'work/e4/cache')}});browser.stderr.on('data',d=>log=(log+d).slice(-5000));
  const port=await until(async()=>{try{return (await fs.readFile(path.join(profile,'DevToolsActivePort'),'utf8')).split('\n')[0];}catch{return null;}},'Chromium launch');
  const pages=await(await fetch(`http://127.0.0.1:${port}/json/list`)).json();socket=new WebSocket(pages.find(p=>p.type==='page').webSocketDebuggerUrl);await new Promise(resolve=>socket.addEventListener('open',resolve,{once:true}));
  socket.addEventListener('message',({data})=>{const m=JSON.parse(data);if(m.id){pending.get(m.id)?.(m);pending.delete(m.id);}if(m.method==='Runtime.exceptionThrown')exceptions.push(m.params.exceptionDetails);
    if(m.method==='Fetch.requestPaused'){const {requestId,request}=m.params;if(request.url.startsWith(origin+'/')||request.url.startsWith('blob:'))command('Fetch.continueRequest',{requestId});else{external.push(request.url);command('Fetch.failRequest',{requestId,errorReason:'InternetDisconnected'});} }
  });
  await command('Runtime.enable');await command('Page.enable');await command('Fetch.enable',{patterns:[{urlPattern:'*'}]});await command('Emulation.setDeviceMetricsOverride',{width:430,height:932,deviceScaleFactor:1,mobile:true});
  // Clear only this isolated test origin; retain it across navigation/restarts.
  await command('Page.navigate',{url:origin+'/BundleInfo.json'});await until(()=>evaluate(`location.origin===${JSON.stringify(origin)}`),'test origin');
  await evaluate(`new Promise((resolve,reject)=>{let r=indexedDB.deleteDatabase('pokemon-reader-adventures');r.onsuccess=()=>resolve(true);r.onerror=()=>reject(r.error);})`);
  const a=config(),b=config('b'),p=config('c','platinum');
  await open(a);const before=await packet(a,'before'),after=await packet(a);
  // Bias the old HGSS partition's historical end-20 heuristic. Native-selected
  // committed partition 1 must still supply Eevee, never old Pikachu.
  const biased=Buffer.from(after.base64,'base64');biased.writeUInt32LE(0xFFFFFFFF,0xF628-20);let oldCRC=0xFFFF;for(let i=0;i<0xF628-16;i++){oldCRC^=biased[i]<<8;for(let b=0;b<8;b++)oldCRC=((oldCRC<<1)^((oldCRC&0x8000)?0x1021:0))&0xFFFF;}biased.writeUInt16LE(oldCRC,0xF628-2);after.base64=biased.toString('base64');after.digest=crypto.createHash('sha256').update(biased).digest('hex');assert.equal(await deliver(before),true);let all=await profiles();assert.equal(all.length,1);const aID=all[0].id;assert.equal(all[0].snapshot.storage.boxes[0].pokemon[0].speciesId,25);
  assert.equal(await deliver(after),true);all=await profiles();assert.equal(all[0].id,aID);assert.equal(all[0].snapshot.storage.boxes[0].pokemon[0].speciesId,133);const rev=all[0].revision;
  assert.equal(await deliver(after),true);assert.equal((await profiles())[0].revision,rev,'duplicate bytes do not create a new revision');
  const bad={...after,base64:Buffer.alloc(0x80000).toString('base64')};assert.equal(await deliver(bad),false);assert.equal((await profiles())[0].revision,rev);assert.equal(await evaluate(`document.body.dataset.nativeDigest`),after.digest);
  assert.equal(await deliver({...after,token:'wrong'}),false);assert.equal(await deliver({...after,rom:b.rom}),false);assert.equal(await deliver({...after,digest:'0'.repeat(64)}),false);
  // A later complete in-game save after state rollback can contain older progress.
  assert.equal(await deliver({...before,capturedAt:Date.now()}),true);all=await profiles();assert.equal(all[0].id,aID);assert.equal(all[0].snapshot.storage.boxes[0].pokemon[0].speciesId,25);assert.equal(all[0].revision,rev+1);
  // A superseded asynchronous decode must not commit even if its bytes validate.
  assert.deepEqual(await evaluate(`Promise.all([__readerReceive(${JSON.stringify(after)}),__readerReceive(${JSON.stringify(bad)})])`),[false,false]);assert.equal((await profiles())[0].revision,rev+1);
  const offline=await evaluate(`import('/native/offline.js').then(async m=>({item:await(await m.nativeMetadata('https://pokeapi.co/api/v2/item/1')).json(),move:await(await m.nativeMetadata('https://pokeapi.co/api/v2/move/33')).json(),species:await(await m.nativeMetadata('https://pokeapi.co/api/v2/pokemon/35')).json()}))`);assert.equal(offline.item.name,'Master Ball');assert.equal(offline.move.pp,35);assert.equal(offline.species.types[0].type.name,'normal');
  await evaluate(`location.hash='party'`);await until(()=>evaluate(`document.querySelector('#party-grid .pokemon-detail-button')`),'party offline');assert.equal(await evaluate(`document.documentElement.scrollWidth<=innerWidth`),true);
  // Host download interception sends bytes to native share, with no apply route.
  await evaluate(`(()=>{const a=document.createElement('a');a.download='separate.sav';a.href=URL.createObjectURL(new Blob([new Uint8Array([1,2,3])]));document.body.append(a);a.click();a.remove();})()`);
  await until(()=>evaluate(`nativeMessages.some(m=>m.type==='export'&&m.base64==='AQID'&&m.name==='separate.sav')`),'native export bytes');
  // A second ROM with the same trainer is explicitly kept separate or cancelled.
  await open(b);const bData=await packet(b,'before');await evaluate(`window.pendingDelivery=__readerReceive(${JSON.stringify(bData)}); true`);await until(()=>evaluate(`document.querySelector('#adventure-match-dialog').open`),'profile choice');await evaluate(`document.querySelector('#adventure-match-dialog').close('cancel')`);assert.equal(await evaluate('pendingDelivery'),false);assert.equal((await profiles()).length,1);
  await evaluate(`window.pendingDelivery=__readerReceive(${JSON.stringify(bData)}); true`);await until(()=>evaluate(`document.querySelector('#adventure-match-dialog').open`),'separate adventure choice');await evaluate(`document.querySelector('#adventure-match-dialog').close('confirm')`);assert.equal(await evaluate('pendingDelivery'),true);all=await profiles();assert.equal(all.length,2);const bID=await evaluate('document.body.dataset.nativeProfile');assert.notEqual(bID,aID);
  await open(a);assert.equal(await deliver(after),true);assert.equal(await evaluate('document.body.dataset.nativeProfile'),aID);assert.equal((await profiles()).length,2);
  // Native file input still goes through the existing real Reader workflow.
  await evaluate(`(()=>{const bytes=Uint8Array.from(atob('${(await packet(a)).base64}'),c=>c.charCodeAt(0));document.querySelector('#new-adventure').checked=true;const dt=new DataTransfer();dt.items.add(new File([bytes],'explicit-copy.sav'));const input=document.querySelector('#save-file');input.files=dt.files;input.dispatchEvent(new Event('change'));})()`);
  await until(()=>evaluate(`document.querySelector('#adventure-status').textContent.startsWith('Progress saved locally')`),'explicit file import');assert.equal((await profiles()).length,3);
  await open(p);const ptBefore=await packet(p,'before'),ptAfter=await packet(p);assert.equal(await deliver(ptBefore),true);let pt=(await profiles()).find(v=>v.gameId==='platinum');const ptID=pt.id;assert.equal(await deliver(ptAfter),true);pt=(await profiles()).find(v=>v.id===ptID);assert.equal(pt.revision,2);assert.equal(pt.snapshot.storage.boxes.length,18);
  // Every tool is navigated at the same app-local origin with network denied.
  const routes=[['/team-planner/',"Boolean(document.querySelector('#planner-context')?.textContent)"],['/pokedex/#game=platinum',"document.body.dataset.referenceReady==='true'"],['/pokedex-earth/#great-marsh&game=platinum',"document.querySelector('#great-marsh-status')?.textContent.includes('Saved daily selection')"],['/safari-zone/',"Boolean(document.querySelector('#safari-proposed-status')?.textContent)&&document.querySelectorAll('[data-sim-position]').length===6"]];
  for(const [route,ready]of routes){await command('Page.navigate',{url:origin+route});await until(()=>evaluate(`nativeMessages?.some(m=>m.type==='tool-ready')`),'offline tool bridge '+route);await until(()=>evaluate(ready),'offline tool data '+route);assert.equal(await evaluate('location.origin'),origin);assert.equal(await evaluate(`document.documentElement.scrollWidth<=innerWidth`),true,route);}
  assert.deepEqual(exceptions,[],'no uncaught browser errors');assert.equal(external.filter(url=>url.includes('pokeapi.co')||url.includes('githubusercontent.com')).length,0,'metadata/artwork never require network');
  console.log('PASS: native HTTP boundaries, offline real parsers/metadata/artwork, both games, completed saves, invalid/stale deliveries, rollback, ROM/profile isolation, cancellation, explicit imports, native export and shared tool navigation.');
}
main().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>{socket?.close();browser?.kill();server?.stdin.end('\n');});
