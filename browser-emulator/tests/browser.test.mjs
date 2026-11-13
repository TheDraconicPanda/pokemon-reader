import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import factory from '../vendor/b1.mjs';
import {createServer} from '../scripts/serve.mjs';
const pause=ms=>new Promise(r=>setTimeout(r,ms));
test('real Chromium: WASM worker, phone controls, raw import/export, fenced durable saves, quota faults, offline reboot and private-file isolation',async()=>{
  const root=resolve(import.meta.dirname,'../..'),work=resolve(root,'work/b1/browser-'+Date.now());await mkdir(work,{recursive:true});
  // Linux Unix-domain socket paths are limited to 108 bytes. Chromium adds a
  // temporary directory and SingletonSocket below TMPDIR; use a short repo-local
  // parent rather than the much longer per-run profile/evidence directory.
  const temp=resolve(root,'work/tmp');await mkdir(temp,{recursive:true});
  const wasm=await factory({wasmBinary:await readFile(resolve(root,'browser-emulator/vendor/b1.wasm')),print:()=>{},printErr:()=>{}});
  assert.equal(wasm._b1_diagnostic(0,0,0),1);
  const ptr=wasm._b1_diagnostic_rom(),length=wasm._b1_diagnostic_rom_size();
  const romPath=resolve(work,'original-diagnostic.nds');await writeFile(romPath,wasm.HEAPU8.slice(ptr,ptr+length));
  const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));
  const base=`http://127.0.0.1:${server.address().port}`,url=base+'/browser-emulator/';
  const browser=spawn(process.env.CHROMIUM_PATH||(process.platform==='win32'?'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe':'google-chrome'),
    ['--headless','--no-first-run','--no-default-browser-check','--no-sandbox','--disable-extensions','--disable-gpu','--disable-dev-shm-usage','--autoplay-policy=no-user-gesture-required','--disable-features=BackForwardCache',
      '--remote-debugging-port=0',`--user-data-dir=${work}/profile`,`--disk-cache-dir=${work}/cache`,'about:blank'],{stdio:['ignore','ignore','pipe'],env:{...process.env,TEMP:temp,TMP:temp,TMPDIR:temp}});
  let browserError='',browserSpawnError=null;
  browser.stderr.on('data',data=>{browserError=(browserError+data).slice(-4000);});
  browser.on('error',error=>{browserSpawnError=error;});
  let socket;let id=0;const pending=new Map(),exceptions=[];
  async function until(fn,message){const until=Date.now()+30000;while(Date.now()<until){try{const x=await fn();if(x)return x;}catch(error){if(!/context|target|ENOENT/i.test(error.message))throw error;}await pause(50);}throw Error(message);}
  try{
    const port=await until(async()=>{if(browserSpawnError)throw browserSpawnError;if(browser.exitCode!==null)throw Error('Chrome exited: '+browserError);
      try{return String(await readFile(resolve(work,'profile/DevToolsActivePort'))).split('\n')[0];}catch(error){if(['ENOENT','EBUSY'].includes(error.code))return null;throw error;}},'Chrome startup');
    const tabs=await(await fetch(`http://127.0.0.1:${port}/json/list`)).json();
    socket=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(r=>socket.addEventListener('open',r,{once:true}));
    socket.onmessage=({data})=>{const m=JSON.parse(data);if(m.id){pending.get(m.id)?.(m);pending.delete(m.id);}if(m.method==='Runtime.exceptionThrown')exceptions.push(m.params.exceptionDetails);};
    const command=(method,params={})=>new Promise((resolve,reject)=>{const n=++id,timer=setTimeout(()=>{pending.delete(n);reject(Error(method+' timed out'));},30000);
      pending.set(n,m=>{clearTimeout(timer);m.error?reject(Error(JSON.stringify(m.error))):resolve(m.result);});socket.send(JSON.stringify({id:n,method,params}));});
    const evaluate=async expression=>{const r=await command('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
    await command('Runtime.enable');await command('Page.enable');
    await command('Emulation.setDeviceMetricsOverride',{width:430,height:932,deviceScaleFactor:1,mobile:true});
    await command('Page.navigate',{url});await until(()=>evaluate(`document.querySelector('#run-state')?.textContent==='Ready'`),'WASM worker ready');
    await until(()=>evaluate(`document.querySelector('#offline').textContent.includes('Offline app ready')`),'offline cache ready');
    assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'),true);
    await evaluate(`document.querySelector('#diagnostic').click()`);await until(()=>evaluate(`document.querySelector('#status').textContent.includes('red/green')`),'diagnostic load');
    await evaluate(`document.querySelector('#resume').click()`);await until(()=>evaluate(`document.querySelector('#run-state').textContent==='Running'`),'run');
    await until(()=>evaluate(`document.querySelector('#top').getContext('2d').getImageData(20,20,1,1).data[0]>128`),'real top screen red');
    assert.ok(await evaluate(`document.querySelector('#bottom').getContext('2d').getImageData(20,20,1,1).data[1]>128`));
    await command('Input.dispatchKeyEvent',{type:'keyDown',key:'z',code:'KeyZ'});await command('Input.dispatchKeyEvent',{type:'keyUp',key:'z',code:'KeyZ'});
    await evaluate(`document.querySelector('[data-key="0"]').scrollIntoView({block:'center'})`);
    const rect=await evaluate(`(()=>{const r=document.querySelector('[data-key="0"]').getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()`);
    await command('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...rect,id:1}]});
    assert.equal(await evaluate(`document.querySelector('[data-key="0"]').classList.contains('pressed')`),true);
    await command('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    assert.equal(await evaluate(`document.querySelector('[data-key="0"]').classList.contains('pressed')`),false);
    await until(()=>evaluate(`document.querySelector('#metrics').textContent.includes('real time')`),'metrics');
    await evaluate(`document.querySelector('#pause').click()`);await until(()=>evaluate(`document.querySelector('#run-state').textContent==='Paused'`),'pause');
    // Load original code using the same local file picker as a player cartridge.
    const doc=await command('DOM.getDocument');const picker=await command('DOM.querySelector',{nodeId:doc.root.nodeId,selector:'#rom'});
    await command('DOM.setFileInputFiles',{nodeId:picker.nodeId,files:[romPath]});
    await until(()=>evaluate(`document.querySelector('#status').textContent.includes('Cartridge loaded locally')`),'ROM picker');
    const savePicker=await command('DOM.querySelector',{nodeId:doc.root.nodeId,selector:'#save-file'});
    await evaluate('window.confirm=()=>true');
    await command('DOM.setFileInputFiles',{nodeId:savePicker.nodeId,files:[resolve(root,'tests/fixtures/gen4/platinum/early.sav')]});
    await until(()=>evaluate(`document.querySelector('#status').textContent.includes('Validated raw save imported')`),'validated import and persistence');
    await command('Browser.setDownloadBehavior',{behavior:'allow',downloadPath:work});
    await evaluate(`document.querySelector('#export').click()`);
    await until(()=>evaluate(`document.querySelector('#status').textContent.includes('Reader parser validated')`),'export validation');
    const exported=await until(async()=>{try{return await readFile(resolve(work,'reader-b1-cartridge.sav'));}catch(e){if(e.code==='ENOENT')return;throw e;}},'download raw save');
    assert.deepEqual(exported,await readFile(resolve(root,'tests/fixtures/gen4/platinum/early.sav')));
    // Independent browser IndexedDB fault/isolation tests, without modifying app data.
    const result=await evaluate(`(async()=>{const {Store,SaveQueue}=await import('./storage.mjs');const a=await Store.open(),b=await Store.open();
      await a.lease('synthetic-test');await a.save('synthetic-test',new Uint8Array([1,2,3]),1);
      let fenced=false;try{await b.lease('synthetic-test')}catch{fenced=true;}
      let denied=false;try{await b.save('synthetic-test',new Uint8Array([9]),9)}catch{denied=true;}
      await a.save('synthetic-test',new Uint8Array([4,5,6]),2);const record=await a.get('saves','synthetic-test');record.current.bytes[0]=99;await a.put('saves','synthetic-test',record);
      const recovered=await a.loadSave('synthetic-test');let quota=true;const q=new SaveQueue(async()=>{if(quota)throw new DOMException('Full','QuotaExceededError');});
      let failed=false;try{await q.enqueue(new Uint8Array([7]),7)}catch{failed=true;}quota=false;await q.flush();await a.lease('synthetic-test',true);a.db.close();b.db.close();
      return {fenced,denied,recovered:recovered.recovered,byte:recovered.bytes[0],failed,retried:!q.error};})()`);
    assert.deepEqual(result,{fenced:true,denied:true,recovered:true,byte:1,failed:true,retried:true});
    // Offline cold page reload + retained ROM/save, with network actually disabled.
    await command('Network.enable');await command('Network.emulateNetworkConditions',{offline:true,latency:0,downloadThroughput:0,uploadThroughput:0});
    await command('Page.reload',{ignoreCache:true});await until(()=>evaluate(`document.querySelector('#run-state')?.textContent==='Ready'`),'offline worker startup');
    await evaluate(`document.querySelector('#reopen').click()`);await until(()=>evaluate(`document.querySelector('#save-status').textContent.includes('restored')`),'offline retained ROM and save');
    await evaluate(`document.querySelector('#resume').click()`);await until(()=>evaluate(`document.querySelector('#run-state').textContent==='Running'`),'offline play');
    await evaluate(`document.querySelector('#pause').click()`);await until(()=>evaluate(`document.querySelector('#run-state').textContent==='Paused'`),'offline pause');
    for(const [width,height]of [[320,800],[932,430]]){await command('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:true});assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'),true);}
    await evaluate(`document.querySelector('#resume').click()`);await until(()=>evaluate(`document.querySelector('#run-state').textContent==='Running'`),'landscape gameplay');
    assert.equal(await evaluate(`document.querySelector('.console').getBoundingClientRect().bottom<=innerHeight`),true,'landscape screens and controls fit together');
    await command('Network.emulateNetworkConditions',{offline:false,latency:0,downloadThroughput:-1,uploadThroughput:-1});
    assert.equal((await fetch(base+'/work/b1/browser/private.sav')).status,404);assert.equal((await fetch(base+'/browser-emulator/core/adapter.cpp')).status,404);
    assert.deepEqual(exceptions,[]);
    const screenshot=await command('Page.captureScreenshot',{format:'png'});await writeFile(resolve(work,'landscape.png'),Buffer.from(screenshot.data,'base64'));
    await evaluate(`dispatchEvent(new Event('blur'))`);await until(()=>evaluate(`document.querySelector('#run-state').textContent==='Paused'`),'background pauses explicitly');
    console.log('B1 browser evidence directory:',work);
  }finally{socket?.close();browser.kill();browser.unref();server.closeAllConnections();await new Promise(r=>server.close(r));}
},{timeout:150000});
