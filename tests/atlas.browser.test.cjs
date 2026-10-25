const { before, beforeEach, after, test } = require("node:test");
const assert = require("node:assert/strict");
const { spawn, spawnSync } = require("node:child_process");
const { mkdtemp, readFile, rm, mkdir } = require("node:fs/promises");
const { tmpdir } = require("node:os");
const path = require("node:path");
const httpServer = require("http-server");
const { fixture } = require("./fixtures/reader.cjs");
const { syntheticSave } = require('./fixtures/soulsilver.cjs');
const { save:leafgreenFixture } = require('./fixtures/gen3.cjs');

test('LeafGreen Reader confirms once, preserves fourteen-box profiles, and shows native metadata on phones and desktop', async()=>{
  await command('Fetch.enable',{patterns:[{urlPattern:'https://pokeapi.co/*'}]});
  for(const width of [390,1440]) {
    await command('Page.navigate',{url:baseURL+'/tests/fixtures/reset.html'});
    await until(()=>evaluate(`document.body?.dataset.testReset==='ready'`),'Reset document');
    await evaluate(`new Promise((resolve,reject)=>{const r=indexedDB.deleteDatabase('pokemon-reader-adventures');r.onsuccess=()=>resolve(true);r.onerror=()=>reject(r.error);})`);
    await command('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<500});
    await command('Page.navigate',{url:baseURL+'/'});
    await until(()=>evaluate(`document.querySelector('#app-version')?.textContent === '0.27.0'`),'Reader initialization');
    await evaluate(`globalThis.leafgreenConfirmations=0;window.confirm=()=>{leafgreenConfirmations++;return true;}`);
    await uploadFixture({valid:true},true,leafgreenFixture(),'English LeafGreen.sav');
    assert.equal(await evaluate('leafgreenConfirmations'),1);
    assert.equal(await evaluate(`document.querySelector('#money-value').textContent`),'50,000');
    assert.equal(await evaluate(`document.querySelectorAll('#badge-grid .badge-item').length`),8);
    await evaluate(`location.hash='storage'`);
    await until(()=>evaluate(`!document.querySelector('#storage-info').hidden`),'PC view');
    assert.equal(await evaluate(`document.querySelector('.storage-summary').textContent`),'14 boxes · 30 slots each');
    assert.equal(await evaluate(`document.querySelectorAll('#box-select option').length`),14);
    await evaluate(`location.hash='party'`);
    await until(()=>evaluate(`!document.querySelector('#party-info').hidden`),'Party view');
    await evaluate(`document.querySelector('#party-grid .pokemon-detail-button').click()`);
    await until(()=>evaluate(`document.querySelector('#pokemon-detail-content').getAttribute('aria-busy')==='false'`),'Native details');
    const text=await evaluate(`document.querySelector('#pokemon-detail-content').textContent`);
    assert.match(text,/TREECKO/);assert.match(text,/OVERGROW/);assert.match(text,/POUND/);
    assert.equal(await evaluate(`document.documentElement.scrollWidth<=innerWidth`),true);
    await evaluate(`document.querySelector('#pokemon-detail-close').click()`);
    await uploadFixture({valid:true},false,leafgreenFixture(),'Latest save.sav');
    assert.equal(await evaluate('leafgreenConfirmations'),1);
    await evaluate(`window.confirm=()=>false;document.querySelector('#new-adventure').checked=true`);
    const payload=Buffer.from(leafgreenFixture()).toString('base64');
    await evaluate(`(()=>{const input=document.querySelector('#save-file'),dt=new DataTransfer();dt.items.add(new File([Uint8Array.from(atob('${payload}'),c=>c.charCodeAt(0))],'cancel.sav'));input.files=dt.files;input.dispatchEvent(new Event('change'));})()`);
    await until(()=>evaluate(`document.querySelector('#file-status').textContent.includes('cancelled')`),'Cancelled selection');
  }
  assert.deepEqual(exceptions,[]);
});

const root = path.resolve(__dirname, "..");
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let server, browser, profile, socket, baseURL;
let nextId = 0;
const pending = new Map();
const exceptions = [];
let browserLog = "";
let apiUnavailable = false;
let safariMapFixture=null, safariMapFailure=false;

async function until(operation, message) {
  const deadline = Date.now() + 15000;
  while (Date.now() < deadline) {
    try {
      const result = await operation();
      if (result) return result;
    } catch (error) {
      // A read can cross a real page navigation while polling for its destination.
      // Retry only CDP's destroyed-context errors; assertions and page errors fail.
      if (!/Inspected target navigated or closed|Execution context was destroyed|Cannot find context with specified id/.test(error.message)) throw error;
    }
    await pause(50);
  }
  throw new Error(`${message}\n${browserLog.slice(-2000)}`);
}

function command(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++nextId;
    const timer = setTimeout(() => {
      pending.delete(id);
      reject(new Error(`Chrome command timed out: ${method}`));
    }, 15000);
    pending.set(id, (message) => {
      clearTimeout(timer);
      if (message.error) reject(new Error(JSON.stringify(message.error)));
      else resolve(message.result);
    });
    socket.send(JSON.stringify({ id, method, params }));
  });
}

async function evaluate(expression) {
  const response = await command("Runtime.evaluate", {
    expression, returnByValue: true, awaitPromise: true
  });
  assert.equal(response.exceptionDetails, undefined, JSON.stringify(response.exceptionDetails));
  return response.result.value;
}

let atlasVisit = 0;
async function atlas({ directory = true } = {}) {
  await command("Page.navigate", { url: `${baseURL}/pokedex-earth/?test=${++atlasVisit}#atlas` });
  await until(() => evaluate(`document.querySelector('#location-count')?.textContent === '1 of 122 locations'`),
    "Atlas did not finish rendering");
  if (directory) await evaluate(`document.querySelector('#location-search').value='';document.querySelector('#location-search').dispatchEvent(new Event('input'))`);
}

before(async () => {
  assert.equal(typeof WebSocket, "function", "Use Node.js 22 or later");
  server = httpServer.createServer({ root, cache: -1 });
  // Mount the same static app beneath the production repository path as well.
  server.server.prependListener('request', request => {
    if (request.url.startsWith('/pokemon-reader/')) request.url = request.url.slice('/pokemon-reader'.length);
  });
  await new Promise((resolve, reject) => {
    server.server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  baseURL = `http://127.0.0.1:${server.server.address().port}`;
  profile = await mkdtemp(path.join(tmpdir(), "pokemon-atlas-test-"));
  // Optional proxy CA trust for cloud visual testing; verification stays enabled.
  if (process.env.CHROMIUM_CA_CERT) {
    const database=path.join(profile,'.pki','nssdb'); await mkdir(database,{recursive:true});
    for (const args of [['-N','--empty-password','-d',`sql:${database}`], ['-A','-d',`sql:${database}`,'-n','Cloud proxy CA','-t','C,,','-i',process.env.CHROMIUM_CA_CERT]]) {
      const result=spawnSync('certutil',args,{encoding:'utf8'});
      assert.equal(result.status,0,result.stderr);
    }
  }
  browser = spawn(process.env.CHROMIUM_PATH || "chromium", [
    // Independent cases delete IDB: do not freeze a previous app document with
    // an in-flight database close inside the back/forward cache.
    "--headless", "--no-sandbox", "--no-first-run", "--disable-extensions",
    "--disable-gpu", "--disable-dev-shm-usage", "--disable-features=BackForwardCache", "--remote-debugging-port=0",
    `--user-data-dir=${profile}`, "about:blank"
  ], { stdio: ["ignore", "ignore", "pipe"], env:{...process.env,HOME:profile} });
  browser.on("error", (error) => { browserLog += error.message; });
  browser.stderr.on("data", (data) => { browserLog = (browserLog + data).slice(-4000); });
  const port = await until(async () => {
    try { return (await readFile(path.join(profile, "DevToolsActivePort"), "utf8")).split("\n")[0]; }
    catch (error) { if (error.code === "ENOENT") return null; throw error; }
  }, "Chromium did not start; install Chromium or set CHROMIUM_PATH");
  const pages = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  socket = new WebSocket(pages.find((page) => page.type === "page").webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });
  socket.addEventListener("message", ({ data }) => {
    const message = JSON.parse(data);
    if (message.id) {
      pending.get(message.id)?.(message);
      pending.delete(message.id);
    }
    if (message.method === "Fetch.requestPaused") {
      const { requestId, request } = message.params;
      if (safariMapFixture && request.url.startsWith('https://archives.bulbagarden.net/media/upload/')) {
        command('Fetch.fulfillRequest',{requestId,responseCode:safariMapFailure?503:200,responseHeaders:[{name:'Content-Type',value:'image/png'}],body:safariMapFailure?'':safariMapFixture}).catch(error=>browserLog+=error.message);
        return;
      }
      let body;
      if (request.url.includes('/js/saves/soulsilver.js')) body = 'export function detectSoulSilver() { globalThis.__parseCount = (globalThis.__parseCount || 0) + 1; return structuredClone(globalThis.__readerFixture); }';
      else if (request.url.includes('pokemon-species?')) body = JSON.stringify({results:[{name:'pikachu',url:'https://pokeapi.co/api/v2/pokemon-species/25/'},{name:'eevee',url:'https://pokeapi.co/api/v2/pokemon-species/133/'},{name:'chikorita',url:'https://pokeapi.co/api/v2/pokemon-species/152/'}]});
      else if (request.url.includes('/pokemon-species/')) body = JSON.stringify({name:request.url.endsWith('/25')?'pikachu':'eevee',gender_rate:4,growth_rate:{name:'medium'}});
      else if (request.url.endsWith('/pokemon/35')) body=JSON.stringify({types:[{type:{name:'fairy'}}],past_types:[{generation:{name:'generation-v'},types:[{type:{name:'normal'}}]}]});
      else if (request.url.includes('/pokemon/')) body = JSON.stringify({types:[{type:{name:request.url.endsWith('/25')?'electric':'normal'}}],abilities:[{ability:{name:'static',url:'https://pokeapi.co/api/v2/ability/9/'}}]});
      else if (request.url.includes('/move/')) body = JSON.stringify({name:'pound',pp:35});
      else body = '{}';
      command('Fetch.fulfillRequest', {requestId,responseCode:apiUnavailable && request.url.includes("pokeapi.co") ? 503 : 200,responseHeaders:[{name:'Content-Type',value:request.url.includes('.js')?'text/javascript':'application/json'},{name:'Access-Control-Allow-Origin',value:'*'}],body:Buffer.from(body).toString('base64')}).catch(error => browserLog += error.message);
    }
    if (message.method === "Runtime.exceptionThrown") exceptions.push(message.params.exceptionDetails);
  });
  await command("Runtime.enable");
}, { timeout: 25000 });

// Profiles persist across page navigation within a test; tests start independently.
beforeEach(async () => {
  // Dispose the previous app before clearing IDB. A pending reload or background
  // refresh must not reopen the old database while the next case starts.
  await command('Page.navigate',{url:baseURL+'/tests/fixtures/reset.html'});
  await until(()=>evaluate(`document.body?.dataset.testReset==='ready'`),'Test reset document did not load');
  await evaluate(`location.origin === '${new URL(baseURL).origin}' ? new Promise((resolve,reject) => {
    const request=indexedDB.deleteDatabase('pokemon-reader-adventures');
    request.onsuccess=()=>resolve(true); request.onerror=()=>reject(request.error);
  }) : true`);
});

after(async () => {
  socket?.close();
  if (browser && browser.exitCode === null) {
    browser.kill("SIGTERM");
    await Promise.race([
      new Promise((resolve) => browser.once("exit", resolve)),
      pause(2000).then(() => browser.kill("SIGKILL"))
    ]);
  }
  if (server) await new Promise((resolve) => server.close(resolve));
  if (profile) await rm(profile, { recursive: true, force: true, maxRetries: 3 });
});

test("Atlas renders the existing inventory and every connection has a destination", async () => {
  await atlas();
  const cards = await evaluate(`Array.from(document.querySelectorAll('.location-card'), card => ({
    name: card.querySelector('h2').textContent,
    connections: Array.from(card.querySelectorAll('.connection-link'), link => link.textContent)
  }))`);
  assert.equal(cards.length, 122);
  const names = new Set(cards.map((card) => card.name));
  assert.equal(names.size, 122);
  for (let route = 29; route <= 48; route++) assert.ok(names.has(`Route ${route}`));
  for (const card of cards) for (const target of card.connections) {
    assert.ok(names.has(target), `${card.name} links to missing ${target}`);
  }
  assert.deepEqual(cards.find((card) => card.name === "Safari Zone").connections, ["Safari Zone Gate"]);
});

test("every connection opens exactly its destination and clears the type filter", async () => {
  await atlas();
  const failures = await evaluate(`(() => {
    const cards = Array.from(document.querySelectorAll('.location-card'));
    const edges = cards.flatMap(card => Array.from(card.querySelectorAll('.connection-link'), link => ({
      source: card.querySelector('h2').textContent, target: link.textContent
    })));
    const search = document.querySelector('#location-search');
    const type = document.querySelector('#location-type');
    const failures = [];
    for (const { source, target } of edges) {
      search.value = source;
      search.dispatchEvent(new Event('input'));
      const card = Array.from(document.querySelectorAll('.location-card')).find(c => c.querySelector('h2').textContent === source);
      const link = Array.from(card.querySelectorAll('.connection-link')).find(l => l.textContent === target);
      type.value = 'route';
      link.click();
      if(source==='Safari Zone Gate'&&target==='Safari Zone') {
        if(document.querySelector('#safari-mini-atlas').hidden||document.querySelector('#safari-area-title')?.textContent!=='Peak')failures.push({source,target,miniAtlas:false});
        document.querySelector('[data-safari-direction="south"]').click();
        continue;
      }
      const shown = Array.from(document.querySelectorAll('.location-card h2'), h => h.textContent);
      if (shown.length !== 1 || shown[0] !== target || type.value !== 'all' || search.value !== target) {
        failures.push({ source, target, shown });
      }
    }
    return failures;
  })()`);
  assert.deepEqual(failures, []);
});

test("manual search, type filters, empty state, and reset still work", async () => {
  await atlas();
  const result = await evaluate(`(() => {
    const search = document.querySelector('#location-search');
    const type = document.querySelector('#location-type');
    const names = () => Array.from(document.querySelectorAll('.location-card h2'), h => h.textContent);
    search.value = '  sAfArI zOnE  '; search.dispatchEvent(new Event('input'));
    const searchResults = names();
    search.value = 'no-such-location'; search.dispatchEvent(new Event('input'));
    type.value = 'route'; type.dispatchEvent(new Event('change'));
    const empty = names().length === 0 && !document.querySelector('#empty-message').hidden;
    search.value = ''; search.dispatchEvent(new Event('input'));
    const routes = names();
    type.value = 'all'; type.dispatchEvent(new Event('change'));
    return { searchResults, empty, routes, reset: names().length, emptyHidden: document.querySelector('#empty-message').hidden };
  })()`);
  assert.deepEqual(result.searchResults, ["Route 39", "Route 47", "Route 48", "Safari Zone Gate", "Safari Zone"]);
  assert.equal(result.empty, true);
  assert.equal(result.routes.length, 47);
  assert.ok(result.routes.every((name) => /^Route \d+$/.test(name)));
  assert.equal(result.reset, 122);
  assert.equal(result.emptyHidden, true);
});

test("all Atlas locations display static information, sources, and mobile layouts", async () => {
  await atlas();
  const result = await evaluate(`(() => {
    const cards = Array.from(document.querySelectorAll('.location-card'));
    const complete = cards.every(card => card.querySelectorAll('.location-static h3').length === 1 && card.querySelectorAll('.location-static > div li').length >= 1 && !card.querySelector('.location-overview > div:first-child > p') && !card.querySelector('.compass-current figcaption') && card.querySelectorAll('.location-sources a').length >= 2);
    const sources = cards[0].querySelector('.location-sources');
    sources.querySelector('summary').click();
    return { complete, sourcesOpen: sources.open };
  })()`);
  assert.deepEqual(result, { complete: true, sourcesOpen: true });
  await evaluate(`(() => { const input = document.querySelector('#location-search'); input.value = 'Waterfall'; input.dispatchEvent(new Event('input')); })()`);
  assert.ok((await evaluate(`Array.from(document.querySelectorAll('.location-card h2'), h => h.textContent)`)).includes("Tohjo Falls"));
  await command("Emulation.setDeviceMetricsOverride", { width: 375, height: 812, deviceScaleFactor: 1, mobile: true });
  assert.equal(await evaluate(`document.documentElement.scrollWidth <= innerWidth`), true);
  await command("Emulation.clearDeviceMetricsOverride");
  assert.deepEqual(exceptions, []);
});

test("audited sources, Tunnel alias, and the Route 35 shortcut are usable", async () => {
  await atlas();
  const result = await evaluate(`(() => {
    const search = document.querySelector('#location-search');
    const find = (name) => Array.from(document.querySelectorAll('.location-card')).find(card => card.querySelector('h2').textContent === name);
    const route = find('Route 35');
    const shortcut = Array.from(route.querySelectorAll('.connection-link')).find(link => link.textContent === 'Route 36');
    shortcut.click();
    const destination = document.querySelector('.location-card h2').textContent;
    search.value = 'Cut'; search.dispatchEvent(new Event('input'));
    const cut = Boolean(find('Route 36'));
    search.value = 'Goldenrod Underground'; search.dispatchEvent(new Event('input'));
    const tunnel = find('Goldenrod Tunnel');
    return { destination, cut, alias: Boolean(tunnel), sources: Array.from(tunnel.querySelectorAll('.location-sources a'), a => a.href) };
  })()`);
  assert.equal(result.destination, "Route 36");
  assert.equal(result.cut, true);
  assert.equal(result.alias, true);
  assert.ok(result.sources.some((url) => url.startsWith("https://www.serebii.net/")));
  assert.ok(result.sources.some((url) => url.startsWith("https://bulbapedia.bulbagarden.net/")));
});

test("encounter sections remain populated and release labels agree", async () => {
  await atlas();
  const result = await evaluate(`({
    version: document.title.includes('v0.27.0') && document.querySelector('.eyebrow').textContent.includes('v0.27.0'),
    safari: new Set(Array.from(Array.from(document.querySelectorAll('.location-card')).find(c => c.querySelector('h2').textContent === 'Safari Zone').querySelectorAll('.encounter-entry'),r=>r.dataset.encounterIndex)).size,
    route32: new Set(Array.from(Array.from(document.querySelectorAll('.location-card')).find(c => c.querySelector('h2').textContent === 'Route 32').querySelectorAll('.encounter-entry'),r=>r.dataset.encounterIndex)).size
  })`);
  assert.equal(result.version, true);
  assert.equal(result.safari, 339);
  assert.equal(result.route32, 33);
  const html = await readFile(path.join(root, "index.html"), "utf8");
  assert.match(html, /<title>Pokémon Reader — v0\.27\.0<\/title>/);
  await command("Page.navigate", { url: `${baseURL}/` });
  await until(() => evaluate(`document.querySelector('#app-version')?.textContent === '0.27.0'`), "Save reader did not initialize");
  assert.equal(await evaluate("document.title"), "Pokémon Reader — v0.27.0");
  assert.deepEqual(exceptions, []);
});

test("Reader rejects an invalid save without crashing", async () => {
  await command("Page.navigate", { url: `${baseURL}/` });
  await until(() => evaluate(`document.querySelector('#app-version')?.textContent === '0.27.0'`), "Reader did not initialize");
  await evaluate(`(() => {
    const transfer = new DataTransfer();
    transfer.items.add(new File([new Uint8Array(16)], 'invalid-test.sav'));
    const input = document.querySelector('#save-file');
    input.files = transfer.files;
    input.dispatchEvent(new Event('change'));
  })()`);
  await until(() => evaluate(`document.querySelector('#file-status').textContent.includes('Unsupported save size')`), "Reader did not reject the invalid save");
  assert.equal(await evaluate(`document.querySelector('#trainer-info').hidden`), true);
  assert.deepEqual(exceptions, []);
});

test("Planner checklist persists and tabs work independently of Atlas", async () => {
  await command("Page.navigate", { url: `${baseURL}/team-planner/` });
  await until(() => evaluate(`document.querySelectorAll('.team-card').length === 6`), "Planner did not render its team");
  await evaluate(`document.querySelector('#kingdra').click()`);
  await until(()=>evaluate(`document.querySelector('#party-count').textContent === '1 / 6 ready'`), "Planner edit did not persist");
  await command("Page.reload");
  await until(() => evaluate(`document.querySelector('#party-count')?.textContent === '1 / 6 ready'`), "Planner did not restore progress");
  assert.equal(await evaluate(`document.querySelector('#kingdra').checked`), true);
  for (const tab of ["bench", "team"]) {
    await evaluate(`document.querySelector('[data-tab="${tab}"]').click()`);
    assert.equal(await evaluate(`document.querySelector('#panel-${tab}').hidden`), false);
    assert.equal(await evaluate(`document.querySelectorAll('.panel:not([hidden])').length`), 1);
  }
  assert.deepEqual(exceptions, []);
});


test("Reader dashboard routes, themes, and mobile layout work", async () => {
  await command("Page.navigate", { url: `${baseURL}/` });
  await until(() => evaluate(`document.querySelector('[data-view="overview"]')?.getAttribute('aria-current') === 'page'`), "Dashboard did not initialize");
  assert.equal(await evaluate(`document.documentElement.dataset.theme`), "dark");
  await fixtureReader();
  for (const view of ["party", "storage", "collection", "overview"]) {
    await evaluate(`document.querySelector('[data-view="${view}"]').click()`);
    await until(() => evaluate(`document.querySelector('[data-view="${view}"]').getAttribute('aria-current') === 'page'`), "View did not switch");
    assert.equal(await evaluate(`document.activeElement.id`), "view-heading");
    assert.equal(await evaluate(`Array.from(document.querySelectorAll('[data-reader-view]')).every(p => p.classList.contains('inactive-view') === (p.dataset.readerView !== '${view}'))`), true);
    assert.equal(await evaluate(`document.querySelector('#view-empty').hidden`), true);
  }
  await evaluate(`document.querySelector('#theme-toggle').click()`);
  await command("Fetch.disable");
  await command("Page.reload");
  await until(() => evaluate(`document.documentElement?.dataset.theme === 'light' && document.readyState === 'complete' && document.querySelector('#theme-toggle')?.getAttribute('aria-pressed') === 'true'`), "Theme was not persisted");
  assert.equal(await evaluate(`document.querySelector('#theme-toggle').getAttribute('aria-pressed')`), "true");
  for (const width of [320, 390, 768, 1440]) {
    await command("Emulation.setDeviceMetricsOverride", {width, height: 900, deviceScaleFactor:1, mobile:width < 800});
    assert.equal(await evaluate(`document.documentElement.scrollWidth <= innerWidth`), true, `Overflow at ${width}px`);
    assert.equal(await evaluate(`Array.from(document.querySelectorAll('[data-view]')).every(a => a.getBoundingClientRect().height >= 44)`), true);
  }
  await command("Emulation.clearDeviceMetricsOverride");
  await evaluate(`document.querySelector('#theme-toggle').click()`);
  assert.deepEqual(exceptions, []);
});


async function fixtureReader(data = fixture(), bytes = null, realParser = false, fileName = "ui-fixture.sav") {
  await command('Fetch.enable', {patterns:[...(realParser?[]:[{urlPattern:'*/js/saves/soulsilver.js'}]),{urlPattern:'https://pokeapi.co/*'}]});
  await command('Page.navigate', {url:baseURL + '/'});
  await until(() => evaluate(`document.querySelector('#app-version')?.textContent === '0.27.0'`), 'Reader did not initialize');
  await uploadFixture(data, true, bytes, fileName);
}
async function uploadFixture(data, separateAdventure = true, bytes = null, fileName = "ui-fixture.sav") {
  const payload = bytes ? `Uint8Array.from(atob('${Buffer.from(bytes).toString('base64')}'),c=>c.charCodeAt(0))` : 'new Uint8Array(512*1024)';
  await evaluate(`globalThis.__readerFixture = ${JSON.stringify(data)}; document.querySelector('#new-adventure').checked = ${separateAdventure}; (() => {
    const files = new DataTransfer(); files.items.add(new File([${payload}], ${JSON.stringify(fileName)}));
    const input=document.querySelector('#save-file'); input.files=files.files; input.dispatchEvent(new Event('change'));
  })()`);
  try { await until(() => evaluate(`document.querySelector('#file-status').classList.contains('${data.valid ? 'success' : 'error'}')`), 'Fixture save did not render'); }
  catch(error) { error.message += `; status=${await evaluate(`document.querySelector('#file-status')?.textContent`)}; exceptions=${JSON.stringify(exceptions)}`; throw error; }
}
test('Overview displays parsed summaries and replaces stale save state', async () => {
  await fixtureReader();
  assert.equal(await evaluate(`document.querySelector('#trainer-name-value').textContent`),'Test Trainer');
  assert.equal(await evaluate(`document.querySelector('#overview-summary').hidden`),false);
  assert.equal(await evaluate(`document.querySelector('#overview-stats').textContent.includes('PC Pokémon2')`),true);
  assert.equal(await evaluate(`document.querySelectorAll('.summary-button').length`),6);
  assert.equal(await evaluate(`document.querySelectorAll('#badge-grid img').length`),16);
  assert.equal(await evaluate(`document.querySelectorAll('#badge-grid .earned').length`),2);
  await uploadFixture(fixture('Replacement'));
  assert.equal(await evaluate(`document.querySelector('#trainer-name-value').textContent`),'Replacement');
  assert.equal(await evaluate(`document.querySelector('.app').getAttribute('aria-busy')`),'false');
  await command('Fetch.disable');
});

test('Party keeps six slots and shared details retain fields, moves, and focus', async () => {
  await fixtureReader();
  await evaluate(`location.hash='party'`);
  await until(() => evaluate(`document.querySelector('[data-view="party"]').getAttribute('aria-current') === 'page'`), 'Party route');
  assert.equal(await evaluate(`document.querySelectorAll('#party-grid > button').length`),6);
  assert.equal(await evaluate(`document.querySelectorAll('.empty-party-slot').length`),4);
  assert.equal(await evaluate(`document.querySelectorAll('#party-grid > button')[2].textContent.includes('Buddy')`),true);
  assert.equal(await evaluate(`document.querySelector('.hp-bar').value`),25);
  assert.equal(await evaluate(`document.querySelector('#party-grid .pokemon-detail-button').tagName`),'BUTTON');
  await evaluate(`document.querySelector('#party-grid .pokemon-detail-button').focus(); document.activeElement.click()`);
  await until(() => evaluate(`document.querySelector('#pokemon-detail-content').getAttribute('aria-busy') === 'false'`), 'Detail loaded');
  const content=await evaluate(`document.querySelector('#pokemon-detail-content').textContent`);
  for (const value of ['Summary','Stats','Moves','Training','History','Original','20/49','PP Ups','Empty move slot','Hidden Power']) assert.ok(content.includes(value),value);
  await command('Input.dispatchKeyEvent',{type:'rawKeyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
  await command('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
  await until(() => evaluate(`!document.querySelector('#pokemon-detail-dialog').open`), 'Escape did not close details');
  assert.equal(await evaluate(`document.activeElement.classList.contains('pokemon-detail-button')`),true);
  await evaluate(`document.activeElement.click()`);
  await uploadFixture(fixture('Next Trainer'));
  assert.equal(await evaluate(`document.querySelector('#pokemon-detail-dialog').open`),false);
  await command('Fetch.disable');
});

test('PC retains 18 boxes and 30 slots while search navigates in original order', async () => {
  await fixtureReader();
  await evaluate(`location.hash='storage'`);
  await until(() => evaluate(`document.querySelector('[data-view="storage"]').getAttribute('aria-current') === 'page'`), 'Storage route');
  assert.equal(await evaluate(`document.querySelectorAll('#box-select option').length`),18);
  assert.equal(await evaluate(`document.querySelectorAll('#box-grid > article').length`),30);
  assert.equal(await evaluate(`document.querySelectorAll('#box-grid > article')[4].textContent.includes('Thunder')`),true);
  await evaluate(`var search=document.querySelector('#storage-search'); search.value='egg friend'; search.dispatchEvent(new Event('input'));`);
  assert.equal(await evaluate(`document.querySelectorAll('#storage-results button').length`),1);
  await evaluate(`document.querySelector('#storage-results button').click()`);
  assert.equal(await evaluate(`document.querySelector('#box-select').value`),'18');
  assert.equal(await evaluate(`document.querySelectorAll('#box-grid > article')[29].classList.contains('search-match')`),true);
  assert.equal(await evaluate(`document.querySelector('#box-occupancy').textContent`),'Box 18 · 1 / 30 occupied');
  await evaluate(`document.activeElement.click()`);
  await until(() => evaluate(`document.querySelector('#pokemon-detail-content').getAttribute('aria-busy') === 'false'`),'PC details');
  assert.equal(await evaluate(`document.querySelector('#pokemon-detail-dialog-title').textContent`),'Egg friend');
  await evaluate(`document.querySelector('#pokemon-detail-close').click(); document.querySelector('#box-previous').click()`);
  assert.equal(await evaluate(`document.querySelector('#box-select').value`),'17');
  assert.equal(await evaluate(`document.querySelectorAll('#box-grid > article').length`),30);
  await evaluate(`var search=document.querySelector('#storage-search'); search.value='no such pokemon'; search.dispatchEvent(new Event('input'));`);
  assert.equal(await evaluate(`document.querySelector('#storage-results').textContent`),'0 matching Pokémon across all boxes');
  await command('Fetch.disable');
});

test('Unified Pokédex keeps registration and ownership filters and redirects legacy Reader links', async () => {
  await fixtureReader(); await command('Fetch.disable');
  await evaluate(`location.hash='pokedex'`);
  await until(()=>evaluate(`document.body?.dataset.referenceReady==='true'`),'Unified Dex ready');
  assert.equal(await evaluate(`location.pathname`),'/pokedex/');
  assert.equal(await evaluate(`document.querySelector('#save-filter').disabled`),false);
  assert.equal(await evaluate(`document.querySelector('[data-species-id="25"] .save-status [aria-label="Seen: Yes"] img').getAttribute('src').endsWith('eye-open.svg')`),true);
  assert.equal(await evaluate(`document.querySelector('[data-species-id="25"] .save-status [aria-label="Caught: Yes"] img').getAttribute('src').endsWith('caught-gen4.svg')`),true);
  assert.equal(await evaluate(`document.querySelector('.save-status [aria-label="Seen: No"] img').getAttribute('src').endsWith('eye-closed.svg')`),true);
  assert.equal(await evaluate(`document.querySelector('.save-status [aria-label="Caught: No"]').classList.contains('is-unregistered')`),true);
  await evaluate(`var f=document.querySelector('#save-filter');f.value='owned';f.dispatchEvent(new Event('change'));`);
  assert.equal(await evaluate(`document.querySelectorAll('.species-row').length`),2);
  assert.equal(await evaluate(`document.querySelector('[data-species-id="133"]').textContent.includes('Owned: 1')`),true);
  await evaluate(`var f=document.querySelector('#save-filter');f.value='caught';f.dispatchEvent(new Event('change'));`);
  assert.equal(await evaluate(`document.querySelector('[data-species-id="25"]')!==null`),true);
});

test('Collection keeps counts, duplicates, caught/missing views, search and sorting', async () => {
  await fixtureReader();
  await evaluate(`location.hash='collection'`);
  assert.equal(await evaluate(`document.querySelector('#collection-total-value').textContent`),'4');
  assert.equal(await evaluate(`document.querySelector('#collection-eggs-value').textContent`),'1');
  assert.equal(await evaluate(`document.querySelector('#collection-gender-total').textContent`),'3');
  assert.equal(await evaluate(`document.querySelectorAll('#collection-box-counts > *').length`),18);
  await evaluate(`var mode=document.querySelector('#collection-list-mode'); mode.value='duplicates'; mode.dispatchEvent(new Event('change'));`);
  await until(() => evaluate(`document.querySelector('#collection-species-list').textContent.includes('Owned ×2')`),'Duplicate count');
  assert.equal(await evaluate(`document.querySelectorAll('.collection-species-row').length`),1);
  await evaluate(`var mode=document.querySelector('#collection-list-mode'); mode.value='missing'; mode.dispatchEvent(new Event('change'));`);
  await until(() => evaluate(`document.querySelectorAll('.collection-species-row').length === 2`),'Missing registrations');
  await evaluate(`var sort=document.querySelector('#collection-sort'); sort.value='name'; sort.dispatchEvent(new Event('change'));`);
  await until(() => evaluate(`document.querySelector('.collection-species-name').textContent === 'Chikorita'`),'Alphabetical sort');
  await evaluate(`var search=document.querySelector('#collection-search'); search.value='eevee'; search.dispatchEvent(new Event('input'));`);
  await until(() => evaluate(`document.querySelectorAll('.collection-species-row').length === 1`),'Collection search');
  assert.equal(await evaluate(`document.querySelector('.collection-species-meta').textContent`),'Owned: 1');
  assert.equal(await evaluate(`globalThis.__parseCount`),1);
  await command('Fetch.disable');
});

test('Loaded dashboard and dialogs fit mobile/desktop in both themes', async () => {
  await fixtureReader();
  for (const theme of ['dark','light']) {
    await evaluate(`if (document.documentElement.dataset.theme !== '${theme}') document.querySelector('#theme-toggle').click()`);
    for (const width of [320,390,768,1440]) {
      await command('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<800});
      for (const view of ['overview','party','storage','collection']) {
        await evaluate(`location.hash='${view}'`);
        await until(() => evaluate(`document.querySelector('[data-view="${view}"]').getAttribute('aria-current') === 'page'`),'View switch');
        assert.equal(await evaluate(`document.documentElement.scrollWidth <= innerWidth`),true,`${theme}/${view}/${width} overflow`);
        if (process.env.READER_SCREENSHOT_DIR && (width === 320 || width === 1440)) {
          const shot=await command('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
          await require('node:fs/promises').writeFile(path.join(process.env.READER_SCREENSHOT_DIR, `${theme}-${view}-${width}.png`),Buffer.from(shot.data,'base64'));
        }
      }
    }
  }
  await command('Emulation.setDeviceMetricsOverride',{width:320,height:700,deviceScaleFactor:1,mobile:true});
  await evaluate(`location.hash='party'`);
  await until(() => evaluate(`document.querySelector('[data-view="party"]').getAttribute('aria-current') === 'page'`),'Party view');
  await evaluate(`document.querySelector('#party-grid .pokemon-detail-button').focus(); document.activeElement.click()`);
  await until(() => evaluate(`document.querySelector('#pokemon-detail-content').getAttribute('aria-busy') === 'false'`),'Details');
  assert.equal(await evaluate(`const dialog=document.querySelector('#pokemon-detail-dialog'); dialog.scrollWidth <= dialog.clientWidth`),true,'Dialog overflow');
  for (let i=0;i<5;i++) {
    await command('Input.dispatchKeyEvent',{type:'rawKeyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
    await command('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
    assert.equal(await evaluate(`document.querySelector('#pokemon-detail-dialog').contains(document.activeElement)`),true,'Dialog focus escaped');
  }
  if (process.env.READER_SCREENSHOT_DIR) {
    const shot=await command('Page.captureScreenshot',{format:'png'});
    await require('node:fs/promises').writeFile(path.join(process.env.READER_SCREENSHOT_DIR,'detail-320.png'),Buffer.from(shot.data,'base64'));
  }
  await command('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  assert.equal(await evaluate(`getComputedStyle(document.querySelector('#drop-zone')).transitionDuration`),'0s');
  await command('Emulation.setEmulatedMedia',{features:[]});
  await evaluate(`document.querySelector('#pokemon-detail-close').click()`);
  await command('Emulation.clearDeviceMetricsOverride');
  await command('Fetch.disable');
});

test('Metadata outage retains parsed data and locally verified ability names', async () => {
  apiUnavailable=true;
  try {
    await fixtureReader();
    assert.equal(await evaluate(`document.querySelector('#trainer-name-value').textContent`),'Test Trainer');
    assert.equal(await evaluate(`document.querySelector('#party-grid').textContent.includes('Sparky')`),true);
    await evaluate(`location.hash='party'`);
    await until(() => evaluate(`document.querySelector('[data-view="party"]').getAttribute('aria-current') === 'page'`),'Party route');
    await evaluate(`document.querySelector('#party-grid .pokemon-detail-button').click()`);
    await until(() => evaluate(`document.querySelector('#pokemon-detail-content').getAttribute('aria-busy') === 'false'`),'Fallback detail');
    const content=await evaluate(`document.querySelector('#pokemon-detail-content').textContent`);
    assert.ok(content.includes('AbilityStatic'));
    assert.ok(content.includes('20/?'));
    assert.equal(await evaluate(`document.querySelector('.training-section tbody tr').textContent`),'HP311');
  } finally { apiUnavailable=false; await command('Fetch.disable'); }
});

test('Pagination and rapid replacement do not reparse or resurrect stale information', async () => {
  const data=fixture(); data.save.pokedex.speciesIds=Array.from({length:100},(_,i)=>i+1);
  await fixtureReader(data);
  await evaluate(`var mode=document.querySelector('#collection-list-mode'); mode.value='missing'; mode.dispatchEvent(new Event('change'));`);
  await until(() => evaluate(`document.querySelectorAll('.collection-species-row').length === 40`),'Initial collection page');
  await evaluate(`document.querySelector('#collection-show-more').click()`);
  await until(() => evaluate(`document.querySelectorAll('.collection-species-row').length === 80`),'More collection entries');
  await evaluate(`globalThis.__arrayBuffer = File.prototype.arrayBuffer; globalThis.__delayed = true;
    File.prototype.arrayBuffer = async function() { if (globalThis.__delayed) { globalThis.__delayed=false; await new Promise(r=>setTimeout(r,250)); } return globalThis.__arrayBuffer.call(this); };
    globalThis.__readerFixture = ${JSON.stringify(fixture('Slow old file'))};
    var transfer=new DataTransfer(); transfer.items.add(new File([new Uint8Array(512*1024)],'old.sav'));
    document.querySelector('#save-file').files=transfer.files; document.querySelector('#save-file').dispatchEvent(new Event('change'));
  `);
  await uploadFixture(fixture('Newest file'));
  await pause(300);
  assert.equal(await evaluate(`document.querySelector('#trainer-name-value').textContent`),'Newest file');
  assert.equal(await evaluate(`globalThis.__parseCount`),2,'Delayed old file should not be parsed');
  await evaluate(`File.prototype.arrayBuffer=globalThis.__arrayBuffer`);
  await command('Fetch.disable');
});

test('Invalid replacement clears all previous data and empty parties keep six slots', async () => {
  const empty=fixture(); empty.party=[];
  await fixtureReader(empty);
  const storageKeys = await evaluate(`Object.keys(localStorage).sort()`);
  assert.equal(await evaluate(`document.querySelectorAll('.empty-party-slot').length`),6);
  await uploadFixture({valid:false,game:'Not detected',activePartition:null,reason:'Invalid test save',party:[],save:null});
  for (const id of ['trainer-info','party-info','storage-info','collection-info','collection-gender-info','unown-form-info','collection-details-info','overview-summary']) {
    assert.equal(await evaluate(`document.querySelector('#${id}').hidden`),true,id);
  }
  assert.equal(await evaluate(`document.querySelector('#party-grid').childElementCount`),0);
  assert.equal(await evaluate(`document.querySelector('.app').getAttribute('aria-busy')`),'false');
  assert.deepEqual(await evaluate(`Object.keys(localStorage).sort()`),storageKeys);
  await command('Fetch.disable');
});

test('Dashboard theme text and type badges meet readable contrast', async () => {
  await fixtureReader();
  for (const theme of ['dark','light']) {
    await evaluate(`if (document.documentElement.dataset.theme !== '${theme}') document.querySelector('#theme-toggle').click()`);
    const ratios=await evaluate(`(() => {
      const luminance = color => {
        const rgb=color.match(/[\\d.]+/g).slice(0,3).map(n=>Number(n)/255).map(v=>v <= .04045 ? v/12.92 : ((v+.055)/1.055)**2.4);
        return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;
      };
      const ratio=(a,b) => (Math.max(luminance(a),luminance(b))+.05)/(Math.min(luminance(a),luminance(b))+.05);
      const css=getComputedStyle(document.documentElement);
      const resolve=name => { const p=document.createElement('span'); p.style.color='var('+name+')'; document.body.append(p); const value=getComputedStyle(p).color; p.remove(); return value; };
      const values={};
      for (const text of ['--text','--muted','--accent','--success','--error']) for (const surface of ['--background','--surface','--elevated']) values[text+surface]=ratio(resolve(text),resolve(surface));
      for (const badge of document.querySelectorAll('.type-badge')) { const style=getComputedStyle(badge); values[badge.textContent]=ratio(style.color,style.backgroundColor); }
      return values;
    })()`);
    for (const [name,ratio] of Object.entries(ratios)) assert.ok(ratio>=4.5,`${theme} ${name} contrast ${ratio}`);
  }
  await command('Fetch.disable');
  assert.deepEqual(exceptions,[]);
});


test('Details show Generation IV types, nature modifiers, and unavailable PC battle fields', async () => {
  const data=fixture(); data.party[0].speciesId=35; data.party[0].natureId=3;
  await fixtureReader(data);
  assert.equal(await evaluate(`document.querySelector('#party-grid .type-badge').textContent`),'Normal');
  await evaluate(`location.hash='party'`);
  await until(() => evaluate(`document.querySelector('[data-view="party"]').getAttribute('aria-current') === 'page'`),'Party route');
  await evaluate(`document.querySelector('#party-grid .pokemon-detail-button').click()`);
  await until(() => evaluate(`document.querySelector('#pokemon-detail-content').getAttribute('aria-busy') === 'false'`),'Nature details');
  assert.equal(await evaluate(`document.querySelector('.nature-up').textContent.includes('+10% Attack') && document.querySelector('.nature-down').textContent.includes('−10% Special Attack')`),true);
  await evaluate(`document.querySelector('#pokemon-detail-close').click(); location.hash='storage'`);
  await until(() => evaluate(`document.querySelector('[data-view="storage"]').getAttribute('aria-current') === 'page'`),'Storage route');
  await evaluate(`document.querySelector('#box-grid .pokemon-detail-button').click()`);
  await until(() => evaluate(`document.querySelector('#pokemon-detail-content').getAttribute('aria-busy') === 'false'`),'PC record');
  const content=await evaluate(`document.querySelector('#pokemon-detail-content').textContent`);
  assert.ok(content.includes('HP— / —'));
  assert.ok(content.includes('StatusNot stored in PC record'));
  await command('Fetch.disable');
});

test('Ribbons replace the old status row and Load Save resets to the welcome screen', async () => {
  await command('Page.navigate',{url:baseURL+'/'});
  await until(() => evaluate(`document.querySelector('#app-version')?.textContent === '0.27.0'`),'Reader ready');
  assert.equal(await evaluate(`document.querySelector('.header-actions, #dashboard-save-status, #game-value')`),null);
  assert.equal(await evaluate(`document.querySelector('.secondary-nav').firstElementChild.id`),'load-save');
  assert.equal(await evaluate(`document.querySelector('.secondary-nav').lastElementChild.id`),'settings-toggle');
  assert.equal(await evaluate(`document.querySelector('.dashboard-nav').nextElementSibling.className`),'view-intro');
  assert.equal(await evaluate(`document.querySelector('#upload-area').hidden`),false);
  await fixtureReader();
  assert.equal(await evaluate(`document.querySelector('#upload-area').hidden`),true);
  assert.equal(await evaluate(`document.querySelector('#overview-summary').hidden`),false);
  await evaluate(`location.hash='party'; document.querySelector('#load-save').click()`);
  await until(() => evaluate(`document.querySelector('[data-view="overview"]').getAttribute('aria-current') === 'page'`),'Reset route');
  for (const id of ['overview-summary','trainer-info','party-info','storage-info','collection-info']) {
    assert.equal(await evaluate(`document.querySelector('#${id}').hidden`),true,id);
  }
  assert.equal(await evaluate(`document.querySelector('#upload-area').hidden`),false);
  assert.equal(await evaluate(`document.querySelector('#file-status').textContent`),'No save file loaded.');
  assert.equal(await evaluate(`document.querySelector('#overview-stats').childElementCount`),0);
  await uploadFixture(fixture('Loaded after reset'));
  assert.equal(await evaluate(`document.querySelector('#trainer-name-value').textContent`),'Loaded after reset');
  assert.equal(await evaluate(`document.querySelector('#upload-area').hidden`),true);
  await command('Fetch.disable');
});

test('Summary buttons navigate to real Party, PC, ownership, shiny, and registration views', async () => {
  const data=fixture(); data.save.pokedex.speciesIds=[25];
  data.storage.boxes[0].pokemon[4].shiny=true;
  data.storage.boxes[17].pokemon[29].shiny=true;
  await fixtureReader(data);
  for (const [destination, view] of [['party','party'],['storage','storage'],['owned','collection'],['shiny','collection']]) {
    await evaluate(`location.hash='overview'`);
    await until(() => evaluate(`document.querySelector('[data-view="overview"]').getAttribute('aria-current') === 'page'`),'Overview route');
    await evaluate(`document.querySelector('.summary-button[data-destination="${destination}"]').click()`);
    await until(() => evaluate(`document.querySelector('[data-view="${view}"]').getAttribute('aria-current') === 'page'`),'Summary destination');
    if (destination === 'owned') {
      await until(() => evaluate(`document.querySelectorAll('.collection-species-row').length === 2`),'Owned species include those outside regional Dex');
      assert.equal(await evaluate(`document.querySelector('#collection-list-mode').value`),'owned');
    }
    if (destination === 'shiny') {
      await until(() => evaluate(`document.querySelectorAll('.collection-species-row').length === 3`),'Every shiny individual, including Eggs');
      assert.equal(await evaluate(`document.querySelector('#collection-details-count').textContent`),'3 shiny Pokémon');
      assert.equal(await evaluate(`document.querySelector('#collection-species-list').textContent.includes('Box 18, slot 30 · Egg')`),true);
      await evaluate(`document.querySelector('#collection-species-list .pokemon-detail-button').click()`);
      await until(() => evaluate(`document.querySelector('#pokemon-detail-content').getAttribute('aria-busy') === 'false'`),'Shiny inspection');
      assert.equal(await evaluate(`document.querySelector('#pokemon-detail-dialog-title').textContent`),'Sparky');
      await evaluate(`document.querySelector('#pokemon-detail-close').click()`);
    }
  }
  assert.equal(await evaluate(`globalThis.__parseCount`),1,'Summary navigation must not reparse the save');
  await command('Fetch.disable');
});

test('Reader ribbon sticks to the top on desktop and mobile without overflow', async () => {
  await fixtureReader();
  for (const width of [320,390,768,1440]) {
    await command('Emulation.setDeviceMetricsOverride',{width,height:600,deviceScaleFactor:1,mobile:width<800});
    await evaluate(`window.scrollTo(0,0)`);
    assert.equal(await evaluate(`document.documentElement.scrollWidth <= innerWidth`),true,`Top ribbon overflow at ${width}`);
    assert.equal(await evaluate(`document.querySelector('.dashboard-nav').getBoundingClientRect().top > 0`),true);
    await evaluate(`window.scrollTo(0,500)`);
    await until(() => evaluate(`Math.abs(document.querySelector('.dashboard-nav').getBoundingClientRect().top) <= 1`),'Ribbon did not stick');
    assert.equal(await evaluate(`document.querySelector('.secondary-nav').getBoundingClientRect().top < 0`),true,'Only Reader navigation should stick');
  }
  await command('Emulation.clearDeviceMetricsOverride');
  await command('Fetch.disable');
});

test('Six occupied Party card buttons keep 96px sprites and fit a single viewport', async () => {
  const data=fixture();
  data.party=Array.from({length:6},(_,i)=>({...data.party[0],slot:i+1,nickname:`Teammate ${i+1}`,currentHp:[100,45,30,15,5,0][i],maxHp:100,shiny:false}));
  await fixtureReader(data);
  await evaluate(`location.hash='party'`);
  await until(() => evaluate(`document.querySelector('[data-view="party"]').getAttribute('aria-current') === 'page'`),'Party route');
  assert.equal(await evaluate(`document.querySelector('#party-info > h2')`),null);
  assert.equal(await evaluate(`document.querySelectorAll('#party-grid button button').length`),0,'No nested Inspect controls');
  assert.equal(await evaluate(`document.querySelector('#party-grid').textContent.includes('Held item') || document.querySelector('#party-grid').textContent.includes('Status:') || document.querySelector('#party-grid').textContent.includes('Inspect')`),false);
  assert.deepEqual(await evaluate(`Array.from(document.querySelectorAll('#party-grid progress'),bar=>bar.className)`),['hp-bar hp-green','hp-bar hp-yellow','hp-bar hp-orange','hp-bar hp-red','hp-bar hp-critical','hp-bar hp-critical']);
  for (const [width,height] of [[320,700],[390,844],[768,700],[1440,900]]) {
    await command('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<800});
    await evaluate(`window.scrollTo(0,0)`);
    const layout=await evaluate(`Array.from(document.querySelectorAll('#party-grid > button'),card=>({top:card.getBoundingClientRect().top,bottom:card.getBoundingClientRect().bottom,spriteWidth:card.querySelector('img').getBoundingClientRect().width,spriteHeight:card.querySelector('img').getBoundingClientRect().height}))`);
    for (const card of layout) {
      assert.ok(card.top>=0 && card.bottom<=height,`Card outside ${width}×${height}: ${JSON.stringify(card)}`);
      assert.equal(card.spriteWidth,96); assert.equal(card.spriteHeight,96);
    }
    assert.equal(await evaluate(`document.documentElement.scrollWidth <= innerWidth`),true);
    if (process.env.READER_SCREENSHOT_DIR) {
      const shot=await command('Page.captureScreenshot',{format:'png'});
      await require('node:fs/promises').writeFile(path.join(process.env.READER_SCREENSHOT_DIR,`six-party-${width}.png`),Buffer.from(shot.data,'base64'));
    }
  }
  await command('Page.bringToFront');
  await evaluate(`document.querySelector('#party-grid button').focus()`);
  await command('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,text:'\r'});
  await command('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
  await until(() => evaluate(`document.querySelector('#pokemon-detail-dialog').open`),'Whole card Enter activation');
  await command('Emulation.clearDeviceMetricsOverride'); await command('Fetch.disable');
});

test('Detail header, borderless tables, totals and conditional history match parsed data', async () => {
  await command('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
  const data=fixture(); Object.assign(data.party[0],{isEgg:true,friendship:200,natureId:3,metLocationId:227,eggDate:{year:2020,month:1,day:2},eggLocationId:2000});
  await fixtureReader(data);
  await evaluate(`location.hash='party'`);
  await until(() => evaluate(`document.querySelector('[data-view="party"]').getAttribute('aria-current') === 'page'`),'Party route');
  await evaluate(`document.querySelector('#party-grid .pokemon-detail-button').click()`);
  await until(() => evaluate(`document.querySelector('#pokemon-detail-content').getAttribute('aria-busy') === 'false'`),'Detailed record');
  assert.equal(await evaluate(`document.querySelectorAll('#pokemon-detail-content h2').length`),0,'Name only in dialog title');
  assert.deepEqual(await evaluate(`Array.from(document.querySelectorAll('.detail-icons [role="img"]'),icon=>icon.getAttribute('aria-label'))`),['Shiny Pokémon','Egg']);
  assert.equal(await evaluate(`document.querySelector('.nature-up').textContent`),'↑ +10% Attack');
  assert.equal(await evaluate(`document.querySelector('.nature-down').textContent`),'↓ −10% Special Attack');
  assert.equal(await evaluate(`Math.abs(document.querySelector('.nature-up').getBoundingClientRect().x - document.querySelector('.nature-down').getBoundingClientRect().x) < 1 && document.querySelector('.nature-down').getBoundingClientRect().y > document.querySelector('.nature-up').getBoundingClientRect().y`),true,'Nature modifiers must be two rows, not two columns');
  assert.deepEqual(await evaluate(`Array.from(document.querySelectorAll('.moves-section thead th'),cell=>cell.textContent)`),['Name','PP','PP Ups']);
  assert.deepEqual(await evaluate(`Array.from(document.querySelector('.moves-section tbody tr').children,cell=>cell.textContent)`),['Pound','20/49','2']);
  assert.deepEqual(await evaluate(`Array.from(document.querySelectorAll('.training-section thead th'),cell=>cell.textContent)`),['Stat','IV','EV']);
  assert.deepEqual(await evaluate(`Array.from(document.querySelector('.training-section tbody tr:last-child').children,cell=>cell.textContent)`),['Total','171','21']);
  assert.equal(await evaluate(`getComputedStyle(document.querySelector('.detail-table td')).borderTopWidth`),'0px');
  assert.equal(await evaluate(`Array.from(document.querySelectorAll('.detail-table th:not(:first-child), .detail-table td')).every(cell => getComputedStyle(cell).textAlign === 'right')`),true,'Numeric headers and values align right');
  assert.equal(await evaluate(`Math.abs(document.querySelector('.nature-modifiers').getBoundingClientRect().right - document.querySelector('.nature-modifiers').parentElement.getBoundingClientRect().right) < 1`),true,'Nature block right alignment');
  for (const section of ['moves-section','training-section']) {
    const widths=await evaluate(`Array.from(document.querySelectorAll('.${section} thead th'),cell=>cell.getBoundingClientRect().width)`);
    const total=widths.reduce((a,b)=>a+b,0);
    assert.ok(widths[0]/total > .65);
    assert.ok(widths[1]/total < .17 && widths[2]/total < .17);
  }
  const text=await evaluate(`document.querySelector('#pokemon-detail-content').textContent`);
  for (const value of ['200 / 255','Safari Zone Gate','Day-Care Couple','Egg received']) assert.ok(text.includes(value),value);
  assert.equal(await evaluate(`Array.from(document.querySelectorAll('.pokemon-detail-list dt')).some(term=>term.textContent === 'Form')`),false);
  if (process.env.READER_SCREENSHOT_DIR) {
    const shot=await command('Page.captureScreenshot',{format:'png'});
    await require('node:fs/promises').writeFile(path.join(process.env.READER_SCREENSHOT_DIR,'detail-tables-desktop.png'),Buffer.from(shot.data,'base64'));
  }
  await command('Emulation.setDeviceMetricsOverride',{width:320,height:700,deviceScaleFactor:1,mobile:true});
  assert.equal(await evaluate(`document.querySelector('.nature-up').getBoundingClientRect().height < 20 && document.querySelector('.nature-down').getBoundingClientRect().height < 20`),true,'Each nature modifier is one line on mobile');
  assert.equal(await evaluate(`const dialog=document.querySelector('#pokemon-detail-dialog'); dialog.scrollWidth <= dialog.clientWidth`),true);
  if (process.env.READER_SCREENSHOT_DIR) {
    const shot=await command('Page.captureScreenshot',{format:'png'});
    await require('node:fs/promises').writeFile(path.join(process.env.READER_SCREENSHOT_DIR,'nature-mobile.png'),Buffer.from(shot.data,'base64'));
  }
  await command('Emulation.clearDeviceMetricsOverride');
  await command('Fetch.disable');
});

test('Ordinary Pokémon hide unknown egg history and missing training values do not invent totals', async () => {
  const data=fixture(); data.party[0].ivs=null; data.party[0].evs=null; data.party[0].metLocationId=9999;
  await fixtureReader(data);
  await evaluate(`location.hash='party'`);
  await until(() => evaluate(`document.querySelector('[data-view="party"]').getAttribute('aria-current') === 'page'`),'Party route');
  await evaluate(`document.querySelector('#party-grid .pokemon-detail-button').click()`);
  await until(() => evaluate(`document.querySelector('#pokemon-detail-content').getAttribute('aria-busy') === 'false'`),'Details');
  const terms=await evaluate(`Array.from(document.querySelectorAll('.pokemon-detail-list dt'),term=>term.textContent)`);
  for (const term of ['Egg received','Egg location','Form']) assert.ok(!terms.includes(term),term);
  assert.deepEqual(await evaluate(`Array.from(document.querySelector('.training-section tbody tr:last-child').children,cell=>cell.textContent)`),['Total','—','—']);
  assert.equal(await evaluate(`document.querySelector('#pokemon-detail-content').textContent.includes('Location #9999')`),true,'Unknown IDs remain explicit');
  await command('Fetch.disable');
});

test('Reader views stay unavailable before loading, after invalid files, and after reset', async () => {
  await command('Page.navigate',{url:baseURL+'/?gate-test=1#party'});
  await until(() => evaluate(`document.querySelector('[data-view="overview"]')?.getAttribute('aria-current') === 'page'`),'Guard direct Party link');
  for (const view of ['party','storage','collection']) {
    assert.equal(await evaluate(`document.querySelector('[data-view="${view}"]').getAttribute('aria-disabled')`),'true');
    assert.equal(await evaluate(`document.querySelector('[data-view="${view}"]').hasAttribute('href')`),false);
    assert.equal(await evaluate(`document.querySelector('[data-view="${view}"]').tabIndex`),-1);
    await evaluate(`document.querySelector('[data-view="${view}"]').click()`);
    assert.equal(await evaluate(`document.querySelector('.app').dataset.view`),'overview');
    await evaluate(`location.hash='${view}'`);
    await until(() => evaluate(`location.hash === '#overview'`),'Guard direct view hash');
  }
  await evaluate(`location.hash='collection-details-info'`);
  await until(() => evaluate(`location.hash === '#overview'`),'Guard section hash');
  await fixtureReader();
  assert.equal(await evaluate(`Array.from(document.querySelectorAll('.dashboard-nav a')).every(link=>link.hasAttribute('href') && !link.hasAttribute('aria-disabled'))`),true);
  await evaluate(`location.hash='party'`);
  await until(() => evaluate(`document.querySelector('.app').dataset.view === 'party'`),'Loaded Party route');
  await evaluate(`document.querySelector('#load-save').click()`);
  await until(() => evaluate(`document.querySelector('.app').dataset.view === 'overview'`),'Reset returns to Overview');
  assert.equal(await evaluate(`document.querySelectorAll('.dashboard-nav [aria-disabled="true"]').length`),3);
  await uploadFixture({valid:false,game:'Not detected',activePartition:null,reason:'Invalid test save',party:[],save:null});
  assert.equal(await evaluate(`document.querySelectorAll('.dashboard-nav [aria-disabled="true"]').length`),3);
  await command('Fetch.disable');
});

test('Top ribbon links and actions share the same vertical alignment', async () => {
  await command('Page.navigate',{url:baseURL+'/'});
  await until(() => evaluate(`document.querySelector('#app-version')?.textContent === '0.27.0'`),'Reader ready');
  for (const width of [320,390,768,1440]) {
    await command('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<800});
    const centers=await evaluate(`Array.from(document.querySelector('.secondary-nav').children,control=>{const rect=control.getBoundingClientRect();return rect.y+rect.height/2;})`);
    assert.ok(Math.max(...centers)-Math.min(...centers)<1,`Ribbon alignment at ${width}`);
    const textCenters=await evaluate(`Array.from(document.querySelector('.secondary-nav').children,control=>{const range=document.createRange(); range.selectNodeContents(control); const rect=range.getBoundingClientRect(); return rect.y+rect.height/2;})`);
    assert.ok(Math.max(...textCenters)-Math.min(...textCenters)<1,`Ribbon text alignment at ${width}`);
    assert.equal(await evaluate(`Array.from(document.querySelector('.secondary-nav').children).every(control=>getComputedStyle(control).display.includes('flex') && getComputedStyle(control).alignItems==='center')`),true);
    assert.equal(await evaluate(`document.documentElement.scrollWidth <= innerWidth`),true);
  }
  await command('Emulation.clearDeviceMetricsOverride');
});

test('Atlas starts in New Bark, uses compass positions, and keeps navigation before long encounters', async () => {
  await atlas({directory:false});
  assert.deepEqual(await evaluate(`Array.from(document.querySelectorAll('.location-card h2'),h=>h.textContent)`),['New Bark Town']);
  assert.equal(await evaluate(`document.querySelector('.compass-west button').textContent`),'Route 29');
  assert.equal(await evaluate(`document.querySelector('.compass-east button').textContent`),'Route 27');
  await evaluate(`document.querySelector('.compass-west button').click()`);
  assert.equal(await evaluate(`document.activeElement.textContent`),'Route 29');
  assert.deepEqual(await evaluate(`['north','east','west'].map(d=>document.querySelector('.compass-'+d+' button').textContent)`),['Route 46','New Bark Town','Cherrygrove City']);
  for (const width of [320,390,768,1440]) {
    await command('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:width<800});
    const compass = await evaluate(`(() => {
      const r = c => document.querySelector(c).getBoundingClientRect();
      const north=r('.compass-north'), west=r('.compass-west'), east=r('.compass-east'), current=r('.compass-current');
      return north.bottom <= current.top && west.right <= current.left && east.left >= current.right;
    })()`);
    assert.equal(compass,true,`Compass placement at ${width}`);
    await evaluate(`(() => { const search=document.querySelector('#location-search');search.value='Safari Zone Gate';search.dispatchEvent(new Event('input'));Array.from(document.querySelectorAll('.location-card')).find(c=>c.querySelector('h2').textContent==='Safari Zone Gate').querySelector('.compass-north button').click(); })()`);
    const layout=await evaluate(`({overflow:document.documentElement.scrollWidth>innerWidth,heading:document.activeElement.textContent,nav:document.querySelector('#safari-compass').getBoundingClientRect().bottom,encounters:document.querySelector('#safari-encounters').getBoundingClientRect().top,rows:new Set(Array.from(document.querySelectorAll('#safari-encounters .encounter-entry'),r=>r.dataset.encounterIndex)).size})`);
    assert.equal(layout.overflow,false); assert.equal(layout.heading,'Peak');
    assert.ok(layout.nav<=layout.encounters); assert.equal(layout.rows,21);
    await evaluate(`document.querySelector('[data-safari-direction="south"]').click()`);
    await evaluate(`document.querySelector('#location-search').value='New Bark Town';document.querySelector('#location-search').dispatchEvent(new Event('input'));document.querySelector('.compass-west button').click()`);
  }
  await command('Emulation.clearDeviceMetricsOverride');
  await atlas({directory:false});
  assert.equal(await evaluate(`document.querySelector('.location-card h2').textContent`),'New Bark Town');
});


test('Atlas separates overview and encounters for every location at mobile and desktop widths', async () => {
  await atlas();
  const baseline = await evaluate(`Array.from(document.querySelectorAll('.location-card'), card => ({name:card.querySelector('h2').textContent,entries:Array.from(card.querySelectorAll('.encounter-entry'),row=>row.textContent)}))`);
  assert.equal(baseline.filter(location=>location.entries.length).length,98);
  for (const width of [320,390,768,1440]) {
    await command('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:width<800});
    assert.deepEqual(await evaluate(`Array.from(document.querySelectorAll('.location-card')).filter(card => {
      const overview=card.querySelector('.location-overview');
      const encounters=card.querySelector('.location-encounters');
      return !overview || encounters.parentElement!==card || overview.parentElement!==card ||
        !overview.contains(card.querySelector('.location-connections')) || !overview.contains(card.querySelector('.location-static')) ||
        overview.contains(encounters) || overview.getBoundingClientRect().bottom+8>encounters.getBoundingClientRect().top ||
        !card.getAttribute('aria-labelledby') || !encounters.getAttribute('aria-label') ||
        (encounters.querySelectorAll('.encounter-entry').length===0 && !/(No fixed wild encounters|Encounter data has not been added)/.test(encounters.textContent));
    }).map(card=>card.querySelector('h2').textContent)`),[],`Separate accessible blocks at ${width}`);
    assert.equal(await evaluate(`document.documentElement.scrollWidth <= innerWidth`),true);
  }
  assert.deepEqual(await evaluate(`Array.from(document.querySelectorAll('.location-card'), card => ({name:card.querySelector('h2').textContent,entries:Array.from(card.querySelectorAll('.encounter-entry'),row=>row.textContent)}))`),baseline);
  await command('Emulation.clearDeviceMetricsOverride');
  assert.deepEqual(exceptions,[]);
});

test('opening journey maps load between compass controls and retain mobile navigation', async () => {
  for (const width of [320,390,768,1440]) {
    await command('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:width<800});
    await atlas({directory:false});
    for (const [name,direction] of [['New Bark Town','west'],['Route 29','west'],['Cherrygrove City','north'],['Route 30','north'],['Route 31','west'],['Violet City',null]]) {
      await until(()=>evaluate(`document.querySelector('.location-map')?.complete && document.querySelector('.location-map').naturalWidth > 0`),`${name} map load at ${width}`);
      const state=await evaluate(`(() => {
        const img=document.querySelector('.location-map'), current=document.querySelector('.compass-current');
        const r=current.getBoundingClientRect();
        return {name:document.querySelector('.location-card h2').textContent,overflow:document.documentElement.scrollWidth>innerWidth,
          imageHeight:img.getBoundingClientRect().height,link:img.parentElement.href,target:img.parentElement.target,
          alt:img.alt,source:!!document.querySelector('.location-sources a[href*="archives.bulbagarden.net"]'),
          placed:Array.from(document.querySelectorAll('.connection-links > div:not(.compass-other)')).every(group=>{
            const g=group.getBoundingClientRect();
            return group.classList.contains('compass-north') ? g.bottom <= r.top : group.classList.contains('compass-south') ? g.top >= r.bottom : group.classList.contains('compass-west') ? g.right <= r.left : g.left >= r.right;
          })};
      })()`);
      assert.equal(state.name,name); assert.equal(state.overflow,false); assert.ok(state.imageHeight<=260);
      assert.equal(state.target,'_blank'); assert.ok(state.link.startsWith(baseURL+'/assets/maps/'));
      assert.ok(state.alt.includes(name)); assert.equal(state.source,true); assert.equal(state.placed,true);
      if (process.env.ATLAS_SCREENSHOT_DIR && [390,1440].includes(width) && ['New Bark Town','Route 29','Route 30'].includes(name)) {
        await evaluate(`document.querySelector('.location-card h2').scrollIntoView({block:'start'})`);
        const shot=await command('Page.captureScreenshot',{format:'png'});
        await require('node:fs/promises').writeFile(path.join(process.env.ATLAS_SCREENSHOT_DIR,`${name.replaceAll(' ','-')}-${width}.png`),Buffer.from(shot.data,'base64'));
      }
      if (direction) await evaluate(`document.querySelector('.compass-${direction} button').click()`);
    }
  }
  // A real failed asset request must retain the location and usable route controls.
  await evaluate(`document.querySelector('.location-map').src='/missing-atlas-map.png'`);
  await until(()=>evaluate(`document.querySelector('.location-map-link').hidden && !document.querySelector('.compass-current p').hidden`),'Missing map fallback');
  await evaluate(`document.querySelector('.compass-east button').click()`);
  assert.equal(await evaluate(`document.activeElement.textContent`),'Route 31');
  await until(()=>evaluate(`document.querySelector('.location-map').naturalWidth>0`),'Return to loaded map');
  await command('Emulation.clearDeviceMetricsOverride');
  assert.deepEqual(exceptions,[]);
});

test('all 23 routes expose encounters and expandable items/NPCs on phones and desktop', async () => {
  await atlas();
  for (const width of [320, 390, 1440]) {
    await command('Emulation.setDeviceMetricsOverride', {width,height:844,deviceScaleFactor:1,mobile:width<800});
    const result = await evaluate(`(() => {
      const routes = Array.from(document.querySelectorAll('.location-card')).filter(card => /^Route \\d+$/.test(card.querySelector('h2').textContent) && Number(card.querySelector('h2').textContent.slice(6))>=26);
      const missing = routes.filter(card => !card.querySelector('.encounter-entry') || card.querySelectorAll('.route-features').length !== 2).map(card => card.querySelector('h2').textContent);
      const route29 = routes.find(card => card.querySelector('h2').textContent === 'Route 29');
      for (const details of route29.querySelectorAll('.route-features')) details.querySelector('summary').click();
      return {count:routes.length,missing,text:route29.textContent,visible:Array.from(route29.querySelectorAll('.route-features')).every(details=>details.open),fits:document.documentElement.scrollWidth<=innerWidth};
    })()`);
    assert.equal(result.count, 23);
    assert.deepEqual(result.missing, []);
    for (const pattern of [/Pidgey/, /Sentret/, /Hoothoot/, /Ledyba/, /Grn Apricorn/, /Tuscany/, /TwistedSpoon/, /Shock Ribbon/]) assert.match(result.text, pattern);
    assert.equal(result.visible, true);
    assert.equal(result.fits, true, `Route details fit ${width}px`);
    if (process.env.ATLAS_SCREENSHOT_DIR && width !== 320) {
      await evaluate(`Array.from(document.querySelectorAll('.location-card')).find(card=>card.querySelector('h2').textContent==='Route 29').scrollIntoView({block:'start'})`);
      const shot = await command('Page.captureScreenshot', {format:'png'});
      await require('node:fs/promises').writeFile(path.join(process.env.ATLAS_SCREENSHOT_DIR, `route-29-features-${width}.png`), Buffer.from(shot.data, 'base64'));
    }
    // Close before the next width so the next click exercises opening again.
    await evaluate(`document.querySelectorAll('.route-features').forEach(details=>details.open=false)`);
  }
  await command('Emulation.clearDeviceMetricsOverride');
  await evaluate(`document.querySelector('#location-search').value='Tuscany';document.querySelector('#location-search').dispatchEvent(new Event('input'))`);
  assert.equal(await evaluate(`document.querySelector('.location-card h2').textContent`), 'Route 29');
  assert.deepEqual(exceptions, []);
});

test('whole Atlas distinguishes verified empty locations and exposes city and cave encounters', async () => {
  await atlas();
  const cards = await evaluate(`Array.from(document.querySelectorAll('.location-card'),card=>({name:card.querySelector('h2').textContent,text:card.querySelector('.location-encounters').textContent,rows:new Set(Array.from(card.querySelectorAll('.encounter-entry'),r=>r.dataset.encounterIndex)).size}))`);
  assert.equal(cards.length,122);
  assert.equal(cards.filter(c=>c.rows===0).length,24);
  assert.equal(cards.filter(c=>c.text.includes('not been added')).length,0);
  for (const name of ['Cherrygrove City','Dark Cave','Ilex Forest','Mt. Mortar','Ice Path']) assert.ok(cards.find(c=>c.name===name).rows>0,name);
  assert.match(cards.find(c=>c.name==='Goldenrod City').text,/No fixed wild encounters/);
  assert.equal(cards.find(c=>c.name==='Safari Zone').rows,339);
  for (const width of [320,390,1440]) {
    await command('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:width<800});
    for (const name of ['Cherrygrove City','Ruins of Alph','National Park','Mt. Silver','Victory Road']) {
      await evaluate(`document.querySelector('#location-search').value=${JSON.stringify(name)};document.querySelector('#location-search').dispatchEvent(new Event('input'))`);
      const result = await evaluate(`(() => {const card=Array.from(document.querySelectorAll('.location-card')).find(c=>c.querySelector('h2').textContent===${JSON.stringify(name)});return {fits:document.documentElement.scrollWidth<=innerWidth,text:card.querySelector('.location-encounters').textContent};})()`);
      assert.equal(result.fits,true,`${name} at ${width}px`);
      if (name==='Cherrygrove City') for (const pattern of [/Tentacool/,/Tentacruel/,/Surfing/,/Old Rod/,/Staryu/,/Taillow/]) assert.match(result.text,pattern);
      if (name==='Victory Road') assert.match(result.text,/3F · Rock Smash/);
      if (process.env.ATLAS_SCREENSHOT_DIR && width===390 && ['Cherrygrove City','National Park'].includes(name)) {
        await evaluate(`Array.from(document.querySelectorAll('.location-card')).find(c=>c.querySelector('h2').textContent===${JSON.stringify(name)}).querySelector('.location-encounters').scrollIntoView({block:'start'})`);
        const shot=await command('Page.captureScreenshot',{format:'png'});
        await require('node:fs/promises').writeFile(path.join(process.env.ATLAS_SCREENSHOT_DIR,`${name.replaceAll(' ','-')}-encounters-390.png`),Buffer.from(shot.data,'base64'));
      }
    }
  }
  await command('Emulation.clearDeviceMetricsOverride');
  assert.deepEqual(exceptions,[]);
});

test('every exported map decodes in a real browser at its declared dimensions',async()=>{
  await atlas({directory:false});
  const result=await evaluate(`(async()=>{
    const {mapsForLocation}=await import('/js/data/atlas-maps.js');
    const names=Array.from(document.querySelectorAll('.connection-link'),b=>b.textContent);
    const {ATLAS_LOCATIONS}=await import('/js/data/atlas-locations.js');
    const unique=new Map(ATLAS_LOCATIONS.flatMap(l=>mapsForLocation('soulsilver',l.name)).map(m=>[m.file,m]));
    const failures=[];
    for(const map of unique.values()) {
      const image=new Image();image.src='/assets/maps/'+map.file;
      try {await image.decode();if(image.naturalWidth!==map.width||image.naturalHeight!==map.height)failures.push(map.file+': dimensions');}
      catch {failures.push(map.file+': decode');}
    }
    return {count:unique.size,failures};
  })()`);
  assert.ok(result.count>100);assert.deepEqual(result.failures,[]);
});

test('map and floor controls preserve encounters, update sources, and recover after an image failure',async()=>{
  for(const width of [320,390,1440]) {
    await command('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:width<800});
    await atlas();
    // Follow a real connection to open exactly Ice Path, rather than a broad search result.
    await evaluate(`Array.from(document.querySelectorAll('.connection-link')).find(b=>b.textContent==='Ice Path').click()`);
    const before=await evaluate(`document.querySelector('.location-encounters').textContent`);
    await until(()=>evaluate(`document.querySelector('.location-map').naturalWidth>0`),'Ice Path map load');
    for(const index of [1,2,3,0]) {
      await evaluate(`(()=>{const select=document.querySelector('.map-select');select.focus();select.value='${index}';select.dispatchEvent(new Event('change'));})()`);
      await until(()=>evaluate(`document.querySelector('.location-map').naturalWidth>0`),'Floor map load');
      const state=await evaluate(`({label:document.querySelector('.map-select').selectedOptions[0].textContent,alt:document.querySelector('.location-map').alt,source:document.querySelector('.location-sources a[href*="archives.bulbagarden.net"]').href,href:document.querySelector('.location-map-link').href,announcement:document.querySelector('.map-announcement').textContent,focused:document.activeElement===document.querySelector('.map-select'),text:document.querySelector('.location-encounters').textContent,fits:document.documentElement.scrollWidth<=innerWidth})`);
      const floor=['1F','B1F','B2F','B3F'][index];
      assert.equal(state.label,floor);assert.ok(state.alt.includes(floor));
      assert.ok(state.source.includes('Ice_Path_'+floor+'_HGSS.png'));assert.ok(state.href.includes('ice-path-'+floor.toLowerCase()));
      assert.equal(state.focused,true);assert.equal(state.fits,true);assert.equal(state.text,before);
      assert.ok(state.announcement.includes(floor));
    }
    assert.equal(await evaluate(`document.querySelector('.map-controls button').disabled`),true);
    await evaluate(`document.querySelector('.map-controls button:last-child').click()`);
    assert.equal(await evaluate(`document.querySelector('.map-select').value`),'1');
    await evaluate(`document.querySelector('.location-map').src='/missing-floor-map.png'`);
    await until(()=>evaluate(`document.querySelector('.location-map-link').hidden`),'Floor fallback');
    await evaluate(`document.querySelector('.map-controls button:last-child').click()`);
    await until(()=>evaluate(`!document.querySelector('.location-map-link').hidden&&document.querySelector('.location-map').naturalWidth>0`),'Recover after changing floors');
    assert.equal(await evaluate(`document.querySelector('.map-select').value`),'2');
    assert.equal(await evaluate(`document.querySelector('.location-encounters').textContent`),before);
    if(process.env.ATLAS_SCREENSHOT_DIR&&[390,1440].includes(width)) {
      await evaluate(`document.querySelector('.location-card h2').scrollIntoView({block:'start'})`);
      const shot=await command('Page.captureScreenshot',{format:'png'});
      await require('node:fs/promises').writeFile(path.join(process.env.ATLAS_SCREENSHOT_DIR,'ice-path-floors-'+width+'.png'),Buffer.from(shot.data,'base64'));
    }
    await evaluate(`document.querySelector('.connection-link').click()`);
    assert.notEqual(await evaluate(`document.querySelector('.location-card h2').textContent`),'Ice Path');
  }
  await command('Emulation.clearDeviceMetricsOverride');
  assert.deepEqual(exceptions,[]);
});

test('all non-Safari location map choices render the matching catalogue view',async()=>{
  await atlas();
  const result=await evaluate(`(async()=>{
    const {mapsForLocation}=await import('/js/data/atlas-maps.js');
    const failures=[];let views=0;let locations=0;
    for(const card of document.querySelectorAll('.location-card')) {
      const name=card.querySelector('h2').textContent;
      const maps=mapsForLocation('soulsilver',name);
      if(name==='Safari Zone') {if(maps.length)failures.push(name+': excluded');continue;}
      if(!maps.length)continue; // Kanto maps are tracked by their expansion audit.
      locations++;
      const select=card.querySelector('.map-select');
      if(!maps.length||!!select!==(maps.length>1))failures.push(name+': controls');
      for(const [index,map] of maps.entries()) {
        if(select){select.value=String(index);select.dispatchEvent(new Event('change'));}
        views++;
        const image=card.querySelector('.location-map');
        const source=card.querySelector('.location-sources a[data-map-source]');
        if(!image?.src.endsWith('/'+map.file)||source?.href!==new URL(map.source,location.href).href)
          failures.push(name+': '+map.label);
      }
    }
    return {locations,views,failures};
  })()`);
  assert.equal(result.locations,121);assert.equal(result.views,382);assert.deepEqual(result.failures,[]);
  assert.deepEqual(exceptions,[]);
});

test('structured location details expand, search and fit mobile without changing encounters',async()=>{
  for(const width of [320,390,1440]) {
    await command('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:width<800});
    await atlas();
    const coverage=await evaluate(`Array.from(document.querySelectorAll('.location-card')).filter(c=>c.querySelector('.location-reference')).map(c=>({name:c.querySelector('h2').textContent,count:c.querySelectorAll('.location-reference').length}))`);
    assert.equal(coverage.length,69);assert.ok(coverage.every(c=>c.count===5));
    await evaluate(`(()=>{const search=document.querySelector('#location-search');search.value='Primo';search.dispatchEvent(new Event('input'));})()`);
    assert.ok((await evaluate(`Array.from(document.querySelectorAll('.location-card h2'),h=>h.textContent)`)).includes('Violet City'));
    await evaluate(`(()=>{const s=document.querySelector('#location-search');s.value='Violet City';s.dispatchEvent(new Event('input'));const c=Array.from(document.querySelectorAll('.location-card')).find(c=>c.querySelector('h2').textContent==='Violet City');c.querySelector('[data-reference="gifts"] summary').click();})()`);
    let info=await evaluate(`(()=>{const c=Array.from(document.querySelectorAll('.location-card')).find(c=>c.querySelector('h2').textContent==='Violet City');return {open:c.querySelector('[data-reference="gifts"]').open,text:c.querySelector('[data-reference="gifts"]').textContent,fits:document.documentElement.scrollWidth<=innerWidth};})()`);
    assert.equal(info.open,true);assert.equal(info.fits,true);assert.match(info.text,/Togepi.*Egg.*Lv\. 1/);assert.match(info.text,/Bellsprout/);assert.match(info.text,/Primo/);
    await atlas();
    await evaluate(`Array.from(document.querySelectorAll('.connection-link')).find(b=>b.textContent==='Goldenrod Department Store').click()`);
    const before=await evaluate(`document.querySelector('.location-encounters').textContent`);
    await evaluate(`document.querySelectorAll('.location-reference summary').forEach(s=>s.click())`);
    const state=await evaluate(`({text:document.querySelector('.location-card').textContent,unchanged:document.querySelector('.location-encounters').textContent,fit:document.documentElement.scrollWidth<=innerWidth,open:Array.from(document.querySelectorAll('.location-reference')).every(d=>d.open),touch:Array.from(document.querySelectorAll('.location-reference summary')).every(s=>s.getBoundingClientRect().height>=44),sources:Array.from(document.querySelectorAll('.location-sources a')).every(a=>a.href.startsWith('https://'))})`);
    assert.equal(state.fit,true);assert.equal(state.open,true);assert.equal(state.touch,true);assert.equal(state.sources,true);assert.equal(state.unchanged,before);
    assert.match(state.text,/Machop/);assert.match(state.text,/Sunday/);assert.match(state.text,/once per save/);assert.match(state.text,/TM70 \(Flash\)/);
    if(process.env.ATLAS_SCREENSHOT_DIR&&[390,1440].includes(width)) {
      await evaluate(`document.querySelector('[data-reference="gifts"]').scrollIntoView({block:'start'})`);
      const shot=await command('Page.captureScreenshot',{format:'png'});
      await require('node:fs/promises').writeFile(path.join(process.env.ATLAS_SCREENSHOT_DIR,'location-details-'+width+'.png'),Buffer.from(shot.data,'base64'));
    }
  }
  await command('Emulation.clearDeviceMetricsOverride');
  assert.deepEqual(exceptions,[]);
});

test('EV finder filters all six stats, prioritizes Surfing, and handles an empty method result on mobile',async()=>{
  for(const width of [320,390,1440]) {
    await command('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:width<800});
    await atlas({directory:false});
    assert.equal(await evaluate(`getComputedStyle(document.querySelector('#ev-training')).display`),'none');
    await evaluate(`document.querySelector('a[href="#ev-training"]').click()`);
    await until(()=>evaluate(`!document.querySelector('#ev-training').hidden&&document.querySelector('.ev-result')`),'EV finder open');
    assert.equal(await evaluate(`getComputedStyle(document.querySelector('#atlas-browser')).display`),'none');
    assert.equal(await evaluate(`getComputedStyle(document.querySelector('#ev-training')).display`),'block');
    assert.equal(await evaluate(`document.querySelector('.ev-result').getBoundingClientRect().width>document.querySelector('#ev-training').getBoundingClientRect().width-60`),true);
    for(const stat of ['hp','attack','defense','spAttack','spDefense','speed']) {
      await evaluate(`(()=>{const s=document.querySelector('#ev-stat');s.value='${stat}';s.dispatchEvent(new Event('change'));})()`);
      const state=await evaluate(`({count:document.querySelectorAll('.ev-result').length,first:document.querySelector('.ev-result').dataset.method,text:document.querySelector('#ev-results').textContent,pure:Array.from(document.querySelectorAll('.ev-result')).every(c=>c.dataset.useful==='100'),fit:document.documentElement.scrollWidth<=innerWidth})`);
      assert.ok(state.count>0,stat);assert.equal(state.pure,true);assert.equal(state.fit,true);
      if(stat!=='defense')assert.equal(state.first,'surfing',stat);
      if(stat==='spDefense')assert.match(state.text,/Tentacool.*1 Special Defense/);
    }
    await evaluate(`(()=>{document.querySelector('#ev-stat').value='defense';document.querySelector('#ev-method').value='surfing';document.querySelector('#ev-method').dispatchEvent(new Event('change'));})()`);
    assert.match(await evaluate(`document.querySelector('#ev-result-count').textContent`),/No matching/);
    assert.equal(await evaluate(`document.querySelector('#ev-more').hidden`),true);
    await evaluate(`(()=>{document.querySelector('#ev-stat').value='speed';document.querySelector('#ev-method').value='surfing';document.querySelector('#ev-clean').checked=false;document.querySelector('#ev-clean').dispatchEvent(new Event('change'));})()`);
    await evaluate(`(()=>{const more=document.querySelector('#ev-more');if(!more.hidden)more.click();})()`);
    const mixed=await evaluate(`Array.from(document.querySelectorAll('.ev-result')).find(c=>c.dataset.location==='Lake of Rage')?.textContent`);
    assert.match(mixed,/90% useful encounters · Mixed EVs/);assert.match(mixed,/Gyarados.*2 Attack/);
    assert.match(mixed,/Other encounters/);
    if(process.env.ATLAS_SCREENSHOT_DIR&&[390,1440].includes(width)) {
      await evaluate(`document.querySelector('#ev-training-title').scrollIntoView({block:'start'})`);
      const shot=await command('Page.captureScreenshot',{format:'png'});
      await require('node:fs/promises').writeFile(path.join(process.env.ATLAS_SCREENSHOT_DIR,'ev-finder-'+width+'.png'),Buffer.from(shot.data,'base64'));
    }
  }
  await command('Emulation.clearDeviceMetricsOverride');
  assert.deepEqual(exceptions,[]);
});

test('EV finder paginates and opens exact Atlas destinations while preserving filter state on return',async()=>{
  await atlas({directory:false});
  await evaluate(`document.querySelector('a[href="#ev-training"]').click()`);
  await until(()=>evaluate(`!document.querySelector('#ev-training').hidden&&document.querySelector('.ev-result')`),'EV finder open');
  const initial=await evaluate(`document.querySelectorAll('.ev-result').length`);
  assert.equal(initial,12);
  await evaluate(`document.querySelector('#ev-more').click()`);
  assert.equal(await evaluate(`document.querySelectorAll('.ev-result').length`),24);
  assert.equal(await evaluate(`document.activeElement===document.querySelectorAll('.ev-result h3')[12]`),true);
  await evaluate(`(()=>{const s=document.querySelector('#ev-time');s.value='nite';s.dispatchEvent(new Event('change'));})()`);
  const destination=await evaluate(`document.querySelector('.ev-result').dataset.location`);
  await evaluate(`document.querySelector('.ev-open-location').click()`);
  assert.deepEqual(await evaluate(`Array.from(document.querySelectorAll('.location-card h2'),h=>h.textContent)`),[destination]);
  assert.equal(await evaluate(`document.querySelector('#ev-training').hidden`),true);
  assert.equal(await evaluate(`document.activeElement===document.querySelector('.location-card h2')`),true);
  assert.equal(await evaluate(`document.querySelector('#location-type').value`),'all');
  await evaluate(`history.back()`);
  await until(()=>evaluate(`!document.querySelector('#ev-training').hidden`),'Back to finder');
  assert.equal(await evaluate(`document.querySelector('#ev-time').value`),'nite');
  await command('Page.navigate',{url:baseURL+'/pokedex-earth/#ev-training'});
  await until(()=>evaluate(`document.querySelector('#ev-result-count')?.textContent.includes('matching training spots')`),'Direct EV training link');
  assert.equal(await evaluate(`document.querySelector('#atlas-browser').hidden`),true);
  await command('Page.navigate',{url:baseURL+'/pokedex-earth/#location=Violet%20City'});
  await until(()=>evaluate(`document.querySelector('#location-count')?.textContent==='1 of 122 locations'`),'Direct Atlas location');
  assert.equal(await evaluate(`document.querySelector('.location-card h2').textContent`),'Violet City');
  await command('Page.navigate',{url:baseURL+'/pokedex-earth/#location=%E0%A4%A'});
  await until(()=>evaluate(`document.querySelector('#location-count')?.textContent==='1 of 122 locations'`),'Invalid deep link fallback');
  assert.equal(await evaluate(`document.querySelector('.location-card h2').textContent`),'New Bark Town');
  assert.deepEqual(exceptions,[]);
});

test('all Atlas encounter records remain available in collapsed time and method sections',async()=>{
  await atlas();
  const result=await evaluate(`(async()=>{
    const {locationEncounterReference}=await import('/js/data/atlas-route-reference.js');
    const failures=[];
    for(const card of document.querySelectorAll('.location-card')){
      const name=card.querySelector('h2').textContent;
      const rows=Array.from(card.querySelectorAll('.encounter-entry'));
      const ids=[...new Set(rows.map(r=>Number(r.dataset.encounterIndex)))].sort((a,b)=>a-b);
      const expected=locationEncounterReference('soulsilver',name)?.encounters.length??(name==='Safari Zone'?339:0);
      if(ids.length!==expected)failures.push(name+': source count');
      if(ids.some((id,index)=>id!==index))failures.push(name+': missing source row');
      for(const row of rows){
        const section=row.closest('.encounter-section');
        if(!section||section.open)failures.push(name+': disclosure');
        const time=row.dataset.encounterTimes.toLowerCase();
        const key=section?.dataset.encounterSection;
        if(['morning','day','night'].includes(key)&&!time.includes(key)&&!time.includes('all times')&&!time.includes('any time'))failures.push(name+': wrong time');
        const method=row.closest('.encounter-method').querySelector('h4').textContent;
        if(key==='fishing'&&!/Rod/.test(method))failures.push(name+': wrong fishing method');
        if(key==='surfing'&&!method.includes('Surfing'))failures.push(name+': wrong Surf method');
        if(key==='headbutt'&&!method.includes('Headbutt'))failures.push(name+': wrong Headbutt method');
      }
    }
    const route=Array.from(document.querySelectorAll('.location-card')).find(c=>c.querySelector('h2').textContent==='Route 29');
    const morning=route.querySelector('[data-encounter-section="morning"]').textContent;
    const night=route.querySelector('[data-encounter-section="night"]').textContent;
    return {failures,morning,night};
  })()`);
  assert.deepEqual(result.failures,[]);assert.match(result.morning,/Pidgey/);assert.ok(!result.morning.includes('Hoothoot'));assert.match(result.night,/Hoothoot/);assert.ok(!result.night.includes('Pidgey'));
  for(const width of [320,390,1440]){
    await command('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:width<800});
    await atlas();
    await evaluate(`Array.from(document.querySelectorAll('.connection-link')).find(b=>b.textContent==='Violet City').click()`);
    for(const key of ['surfing','fishing','headbutt']){
      await evaluate(`document.querySelector('[data-encounter-section="${key}"] summary').click()`);
      assert.equal(await evaluate(`document.querySelector('[data-encounter-section="${key}"]').open`),true);
    }
    assert.equal(await evaluate(`document.documentElement.scrollWidth<=innerWidth`),true);
    assert.equal(await evaluate(`Array.from(document.querySelectorAll('.encounter-section > summary')).every(s=>s.getBoundingClientRect().height>=44)`),true);
    if(process.env.ATLAS_SCREENSHOT_DIR&&[390,1440].includes(width)){
      await evaluate(`document.querySelector('.location-encounters').scrollIntoView({block:'start'})`);
      const shot=await command('Page.captureScreenshot',{format:'png'});
      await require('node:fs/promises').writeFile(path.join(process.env.ATLAS_SCREENSHOT_DIR,'encounter-sections-'+width+'.png'),Buffer.from(shot.data,'base64'));
    }
  }
  await command('Emulation.clearDeviceMetricsOverride');assert.deepEqual(exceptions,[]);
});

test('Atlas opens on ordered region cards, Johto leads to its tools, and navigation has contextual encounter notes',async()=>{
  for(const width of [320,390,1440]) {
    await command('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:width<800});
    await command('Page.navigate',{url:baseURL+'/pokedex-earth/'});
    await until(()=>evaluate(`document.querySelector('#atlas-home')&&!document.querySelector('#atlas-home').hidden`),'Atlas landing');
    const home=await evaluate(`({names:Array.from(document.querySelectorAll('#atlas-home .atlas-feature-card strong'),s=>s.textContent),disabled:Array.from(document.querySelectorAll('#atlas-home button')).every(b=>b.disabled),visible:getComputedStyle(document.querySelector('#atlas-home')).display,navHidden:getComputedStyle(document.querySelector('#atlas-browser')).display,summary:document.querySelector('.world-header').textContent,fit:document.documentElement.scrollWidth<=innerWidth,johtoOnscreen:document.querySelector('#atlas-home a').getBoundingClientRect().bottom<innerHeight})`);
    assert.deepEqual(home.names,['Kanto','Johto','Hoenn','Sinnoh','Unova','Kalos','Alola']);assert.equal(home.disabled,true);assert.equal(home.navHidden,'none');assert.equal(home.fit,true);assert.equal(home.johtoOnscreen,true);
    assert.ok(!home.summary.includes('Start in New Bark'));
    await evaluate(`document.querySelector('#atlas-home a[href="#johto"]').click()`);
    await until(()=>evaluate(`!document.querySelector('#johto-home').hidden`),'Johto landing');
    assert.equal(await evaluate(`document.querySelector('#johto-home a[href="#safari"]').getAttribute('href')`),'#safari');
    if(process.env.ATLAS_SCREENSHOT_DIR&&[390,1440].includes(width)){
      await evaluate(`scrollTo(0,0)`);
      const shot=await command('Page.captureScreenshot',{format:'png'});
      await require('node:fs/promises').writeFile(path.join(process.env.ATLAS_SCREENSHOT_DIR,'johto-landing-'+width+'.png'),Buffer.from(shot.data,'base64'));
    }
    await evaluate(`document.querySelector('#johto-home a[href="#atlas"]').click()`);
    await until(()=>evaluate(`!document.querySelector('#atlas-browser').hidden`),'Johto navigation');
    assert.equal(await evaluate(`document.querySelector('.location-card h2').textContent`),'New Bark Town');
    await evaluate(`document.querySelector('.compass-west button').click()`);
    const walking=await evaluate(`({title:document.querySelector('[data-encounter-section="morning"] summary').textContent,topNotes:document.querySelectorAll('.location-encounters > .encounter-note').length,legend:document.querySelector('[data-encounter-section="legendary"]').textContent,rows:document.querySelector('[data-encounter-section="morning"] .encounter-info').textContent,fit:document.documentElement.scrollWidth<=innerWidth})`);
    assert.match(walking.title,/04:00–09:59/);assert.equal(walking.topNotes,0);assert.match(walking.legend,/Raikou.*Entei/);assert.ok(!walking.rows.includes('Morning'));assert.equal(walking.fit,true);
    await evaluate(`document.querySelector('#location-search').value='Bell Tower';document.querySelector('#location-search').dispatchEvent(new Event('input'))`);
    const bell=await evaluate(`Array.from(document.querySelectorAll('.location-card')).find(c=>c.querySelector('h2').textContent==='Bell Tower').querySelector('[data-encounter-section="legendary"]').textContent`);
    assert.match(bell,/Ho-Oh/);assert.match(bell,/Rainbow Wing/);assert.match(bell,/70/);
    await evaluate(`document.querySelector('#johto-tool-nav a[href="#home"]').click()`);
    await until(()=>evaluate(`!document.querySelector('#atlas-home').hidden`),'Back to regions');
    assert.equal(await evaluate(`document.documentElement.scrollWidth<=innerWidth`),true);
  }
  await command('Emulation.clearDeviceMetricsOverride');assert.deepEqual(exceptions,[]);
});

test('Shared menu keeps themes across tools and region pairs fit phones and desktop', async () => {
  for (const width of [320,390,1440]) {
    await command('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:width<800});
    for (const theme of ['light','dark']) {
      await atlas();
      await evaluate(`localStorage.setItem('pokemon-reader-theme',${JSON.stringify(theme)});dispatchEvent(new StorageEvent('storage',{key:'pokemon-reader-theme'}));location.hash='home'`);
      await until(()=>evaluate(`!document.querySelector('#atlas-home').hidden`),'Regions');
      const pairs=await evaluate(`(() => {
        const cards=[...document.querySelectorAll('#atlas-home .atlas-feature-card')].map(c=>c.getBoundingClientRect());
        return cards[0].top===cards[1].top && cards[2].top===cards[3].top && cards[4].top===cards[5].top && cards[0].left===cards[2].left && cards[1].left>cards[0].left;
      })()`);
      assert.equal(pairs,true);
      for (const [tool,selector] of [['atlas',null],['planner','.secondary-nav a[href*="team-planner/"]'],['reader','#load-save']]) {
        if(selector) {
          await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
          await until(()=>evaluate(`document.querySelector('app-menu')?.getAttribute('tool')===${JSON.stringify(tool)}`),'Shared menu navigation');
        }
        const state=await evaluate(`({theme:document.documentElement.dataset.theme,labels:[...document.querySelector('.secondary-nav').children].map(c=>c.textContent),fit:document.documentElement.scrollWidth<=innerWidth,hash:location.hash})`);
        assert.equal(state.theme,theme);assert.equal(state.fit,true);
        assert.deepEqual(state.labels,['Load Save','Team Planner','Atlas','Pokédex','⚙']);
        if(tool==='reader')assert.equal(state.hash,'#overview');
        if(process.env.ATLAS_SCREENSHOT_DIR && width!==320){
          await evaluate('scrollTo(0,0)');
          const shot=await command('Page.captureScreenshot',{format:'png'});
          await require('node:fs/promises').writeFile(path.join(process.env.ATLAS_SCREENSHOT_DIR,`shared-${tool}-${theme}-${width}.png`),Buffer.from(shot.data,'base64'));
        }
      }
      // Location disclosures and the EV finder also use the selected palette.
      await evaluate(`document.querySelector('.secondary-nav a[href*="pokedex-earth/"]').click()`);
      await until(()=>evaluate(`document.querySelector('app-menu')?.getAttribute('tool')==='atlas'`),'Atlas themed views');
      for (const view of ['location=Cherrygrove%20City','ev-training']) {
        await evaluate(`location.hash=${JSON.stringify(view)}`);
        await until(()=>evaluate(view==='ev-training' ? `!document.querySelector('#ev-training').hidden` : `document.querySelector('.location-card h2')?.textContent==='Cherrygrove City'`),'Themed Atlas view');
        assert.equal(await evaluate('document.documentElement.dataset.theme'),theme);
        assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'),true);
        if(process.env.ATLAS_SCREENSHOT_DIR && width===390){
          await evaluate(`document.querySelector('${view==='ev-training'?'#ev-training':'.location-encounters'}').scrollIntoView();document.querySelector('[data-encounter-section="surfing"]')?.setAttribute('open','')`);
          const shot=await command('Page.captureScreenshot',{format:'png'});
          await require('node:fs/promises').writeFile(path.join(process.env.ATLAS_SCREENSHOT_DIR,`shared-${view==='ev-training'?'ev':'encounters'}-${theme}.png`),Buffer.from(shot.data,'base64'));
        }
      }
      await evaluate(`document.querySelector('#load-save').click()`);
      await until(()=>evaluate(`document.querySelector('app-menu')?.getAttribute('tool')==='reader'`),'Reader theme change');
      // Reader changes the preference; Atlas picks it up on navigation.
      await evaluate(`document.querySelector('#theme-toggle').click();document.querySelector('.secondary-nav a[href*="pokedex-earth/"]').click()`);
      await until(()=>evaluate(`document.querySelector('app-menu')?.getAttribute('tool')==='atlas'`),'Return to Atlas');
      assert.equal(await evaluate('document.documentElement.dataset.theme'),theme==='dark'?'light':'dark');
    }
  }
  await command('Emulation.clearDeviceMetricsOverride');assert.deepEqual(exceptions,[]);
});


test('Compact Atlas cards and optional search preserve connection-first navigation', async () => {
  for (const width of [320,390,1440]) {
    await command('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:width<800});
    await atlas({directory:false});
    const initial=await evaluate(`({closed:!document.querySelector('#location-search-panel').open,count:document.querySelector('#location-search-panel').contains(document.querySelector('#location-count')),inputVisible:document.querySelector('#location-search').getBoundingClientRect().height>0 && document.querySelector('#location-search').checkVisibility(),location:document.querySelector('.location-card h2').textContent,fit:document.documentElement.scrollWidth<=innerWidth})`);
    assert.equal(initial.closed,true);assert.equal(initial.count,true);assert.equal(initial.inputVisible,false);assert.equal(initial.location,'New Bark Town');assert.equal(initial.fit,true);
    await evaluate(`document.querySelector('.compass-west button').click()`);
    assert.equal(await evaluate(`document.querySelector('.location-card h2').textContent`),'Route 29');
    await evaluate(`document.querySelector('#location-search-panel summary').click();document.querySelector('#location-search').value='Cherrygrove City';document.querySelector('#location-search').dispatchEvent(new Event('input'))`);
    assert.equal(await evaluate(`document.querySelector('.location-card h2').textContent`),'Cherrygrove City');
    assert.equal(await evaluate(`document.querySelector('#location-count').textContent`),'3 of 122 locations');
    await evaluate(`document.querySelector('#location-search-panel summary').click();document.querySelector('.compass-north button').click()`);
    assert.equal(await evaluate(`document.querySelector('.location-card h2').textContent`),'Route 30');
    assert.equal(await evaluate(`document.querySelector('#location-search-panel').open`),false);
    await evaluate(`location.hash='home'`);
    await until(()=>evaluate(`!document.querySelector('#atlas-home').hidden`),'Region cards');
    assert.equal(await evaluate(`/SoulSilver|Emerald|Platinum|FireRed|LeafGreen/.test(document.querySelector('#atlas-home .region-grid').textContent)`),false);
    await evaluate(`location.hash='johto'`);
    await until(()=>evaluate(`!document.querySelector('#johto-home').hidden`),'Johto cards');
    assert.deepEqual(await evaluate(`[...document.querySelectorAll('#johto-home .atlas-feature-card strong')].map(e=>e.textContent)`),['Navigation','Safari','EV Training']);
  }
  await command('Emulation.clearDeviceMetricsOverride');assert.deepEqual(exceptions,[]);
});


test('Compass reserves every direction with decorative arrows and accessible destination names', async () => {
  for (const width of [320,390,1440]) {
    await command('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:width<800});
    await atlas({directory:false});
    const state=await evaluate(`({slots:document.querySelectorAll('.compass-direction').length,labels:document.querySelectorAll('.compass-direction .direction-label').length,empty:document.querySelector('.compass-north').children.length,north:document.querySelector('.compass-north').getBoundingClientRect().height,south:document.querySelector('.compass-south').getBoundingClientRect().height,arrow:getComputedStyle(document.querySelector('.compass-north'),'::before').clipPath,west:document.querySelector('.compass-west button').getAttribute('aria-label'),fit:document.documentElement.scrollWidth<=innerWidth})`);
    assert.equal(state.slots,4);assert.equal(state.labels,0);assert.equal(state.empty,0);
    assert.equal(state.north,76);assert.equal(state.south,76);assert.match(state.arrow,/polygon/);assert.equal(state.west,'west: Route 29');assert.equal(state.fit,true);
    await evaluate(`document.querySelector('.compass-west button').click()`);
    assert.equal(await evaluate(`document.querySelector('.compass-north').getBoundingClientRect().height`),state.north);
    assert.equal(await evaluate(`document.querySelector('.compass-south').getBoundingClientRect().height`),state.south);
  }
  await command('Emulation.clearDeviceMetricsOverride');assert.deepEqual(exceptions,[]);
});

test('Adventure restores decoded Reader views after refresh and retains valid data after invalid replacement', async () => {
  await fixtureReader();
  assert.equal(await evaluate(`(async()=>(await (await import('./js/adventures.js')).listProfiles()).length)()`),1);
  await command('Page.reload');
  await until(()=>evaluate(`document.querySelector('.app')?.dataset.saveLoaded === 'true'`),'Adventure did not restore');
  assert.equal(await evaluate(`globalThis.__parseCount || 0`),0,'Restoration must not invoke the binary parser');
  assert.equal(await evaluate(`document.querySelector('#trainer-name-value').textContent`),'Test Trainer');
  assert.equal(await evaluate(`document.querySelector('#adventure-status').textContent.includes('Restored')`),true);
  await evaluate(`document.querySelector('#load-save').click()`);
  await uploadFixture({valid:false,game:'Not detected',reason:'Invalid test save',party:[],save:null});
  assert.equal(await evaluate(`(async()=>(await (await import('./js/adventures.js')).getActiveProfile()).snapshot.trainer.name)()`),'Test Trainer');
  await evaluate(`document.querySelector('#adventure-restore').click()`);
  await until(()=>evaluate(`document.querySelector('.app').dataset.saveLoaded === 'true'`),'Manual restore after invalid save');
  await evaluate(`location.hash='party';document.querySelectorAll('#party-grid .pokemon-detail-button')[1].click()`);
  await until(()=>evaluate(`document.querySelector('#pokemon-detail-content').getAttribute('aria-busy') === 'false'`),'Restored detail ready');
  assert.equal(await evaluate(`document.querySelector('#pokemon-detail-content').textContent.includes('Reload the original save file')`),true);
  assert.equal(await evaluate(`document.querySelector('.evolve-button') === null`),true);
  await command('Fetch.disable');
});

test('Adventure persistence rejects partial replacements, preserves other profiles and resolves duplicate trainer identities explicitly', async () => {
  await fixtureReader();
  const originalId=await evaluate(`(async()=>(await (await import('./js/adventures.js')).getActiveProfile()).id)()`);
  const partial=fixture(); delete partial.party[0].ivs.hp;
  await uploadFixture(partial, false);
  assert.equal(await evaluate(`document.querySelector('#adventure-status').textContent.includes('Previous profiles are preserved')`),true);
  assert.equal(await evaluate(`(async()=>(await (await import('./js/adventures.js')).getActiveProfile()).revision)()`),1);
  await uploadFixture(fixture('Separate trainer identity'), true);
  assert.equal(await evaluate(`(async()=>(await (await import('./js/adventures.js')).listProfiles()).length)()`),2);
  // A subsequent load with the shared TID/SID must ask, rather than overwrite one.
  await evaluate(`document.querySelector('#new-adventure').checked=false;globalThis.__readerFixture=${JSON.stringify(fixture())};
    const files=new DataTransfer();files.items.add(new File([new Uint8Array(512*1024)],'ambiguous.sav'));
    document.querySelector('#save-file').files=files.files;document.querySelector('#save-file').dispatchEvent(new Event('change'));`);
  await until(()=>evaluate(`document.querySelector('#adventure-match-dialog').open`),'Duplicate profile choice missing');
  assert.equal(await evaluate(`document.querySelectorAll('#adventure-match-select option').length`),3);
  await evaluate(`document.querySelector('#adventure-match-select').value=${JSON.stringify(originalId)};document.querySelector('#adventure-match-dialog button[value="confirm"]').click()`);
  await until(()=>evaluate(`document.querySelector('#file-status').classList.contains('success')`),'Explicit duplicate selection did not load');
  assert.equal(await evaluate(`(async()=>(await (await import('./js/adventures.js')).getActiveProfile()).id)()`),originalId);
  assert.equal(await evaluate(`(async()=>(await (await import('./js/adventures.js')).getActiveProfile()).revision)()`),2);
  assert.equal(await evaluate(`(async()=>(await (await import('./js/adventures.js')).listProfiles()).length)()`),2);
  await command('Fetch.disable');
});

test('Adventure transactions reject stale/future snapshots and roll back profile and active selection together', async () => {
  await fixtureReader();
  const result = await evaluate(`(async()=>{
    const api=await import('./js/adventures.js');
    const original=await api.getActiveProfile();
    const before=JSON.stringify(original);
    const stale=structuredClone(original.snapshot); stale.loadedAt='2000-01-01T00:00:00Z';
    let rejected=0;
    try {await api.persistSnapshot(stale);} catch {rejected++;}
    try {await api.persistSnapshot({...original.snapshot,schemaVersion:99});} catch {rejected++;}
    const put=IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put=function(value){if(this.name==='settings')throw new DOMException('Simulated quota failure','QuotaExceededError');return put.call(this,value);};
    try {await api.persistSnapshot({...original.snapshot,loadedAt:new Date(Date.now()+1000).toISOString()});} catch {rejected++;}
    finally {IDBObjectStore.prototype.put=put;}
    return {rejected,unchanged:JSON.stringify(await api.getActiveProfile())===before,count:(await api.listProfiles()).length};
  })()`);
  assert.deepEqual(result,{rejected:3,unchanged:true,count:1});
  await command('Fetch.disable');
});

test('Legacy Planner migration is lossless, idempotent, unassociated and leaves current browser data authoritative', async () => {
  await fixtureReader();
  const result=await evaluate(`(async()=>{
    const api=await import('./js/adventures.js');
    const raw=JSON.stringify({version:1,ready:{dragonite:true},moves:{'gengar:0':true},evDone:{'kingdra:HP':true},custom:'preserve me'});
    localStorage.setItem(api.LEGACY_PLANNER_KEY,raw);
    const fake={getItem:()=>raw};
    const id=await api.preserveLegacyPlanner(fake);
    const same=await api.preserveLegacyPlanner(fake);
    const plan=await new Promise((resolve,reject)=>{const r=indexedDB.open('pokemon-reader-adventures');r.onsuccess=()=>{const db=r.result;const tx=db.transaction(['planners']);const get=tx.objectStore('planners').get(id);get.onsuccess=()=>resolve(get.result);get.onerror=()=>reject(get.error);tx.oncomplete=()=>db.close();};});
    // initializeAdventures may already have copied the real existing browser plan;
    // the marker must preserve that first copy rather than replacing it.
    return {same:id===same,unassociated:plan.adventureId===null,sourceRoundTrip:JSON.stringify(JSON.parse(plan.legacySource))===JSON.stringify(plan.state),hasOriginal:localStorage.getItem(api.LEGACY_PLANNER_KEY)===raw};
  })()`);
  assert.deepEqual(result,{same:true,unassociated:true,sourceRoundTrip:true,hasOriginal:true});
  await command('Fetch.disable');
});

test('Reader still loads when IndexedDB is denied, with an explicit persistence warning', async () => {
  await fixtureReader();
  await evaluate(`globalThis.__originalOpen=indexedDB.open;indexedDB.open=()=>{throw new DOMException('Storage denied','SecurityError');}`);
  await uploadFixture(fixture('Session only'));
  assert.equal(await evaluate(`document.querySelector('.app').dataset.saveLoaded`),'true');
  assert.equal(await evaluate(`document.querySelector('#adventure-status').textContent.includes('Storage denied')`),true);
  await evaluate(`indexedDB.open=globalThis.__originalOpen`);
  assert.equal(await evaluate(`(async()=>(await (await import('./js/adventures.js')).getActiveProfile()).snapshot.trainer.name)()`),'Test Trainer');
  await command('Fetch.disable');
});

test('Adventure restoration, menu links and profile controls work under the GitHub Pages path on phones', async () => {
  await fixtureReader();
  await command('Emulation.setDeviceMetricsOverride',{width:320,height:700,deviceScaleFactor:1,mobile:true});
  await command('Page.navigate',{url:baseURL+'/pokemon-reader/#overview'});
  await until(()=>evaluate(`document.querySelector('.app')?.dataset.saveLoaded==='true'`),'Restore beneath Pages repository path');
  assert.equal(await evaluate(`document.querySelector('app-menu a[href*="team-planner"]').pathname`),'/pokemon-reader/team-planner/');
  assert.equal(await evaluate(`document.querySelector('app-menu a[href*="pokedex-earth"]').pathname`),'/pokemon-reader/pokedex-earth/');
  assert.equal(await evaluate(`document.documentElement.scrollWidth<=innerWidth`),true);
  await evaluate(`document.querySelector('#load-save').click()`);
  assert.equal(await evaluate(`document.querySelector('#upload-area').hidden`),false);
  assert.equal(await evaluate(`document.querySelector('#adventure-restore').disabled`),false);
  assert.equal(await evaluate(`document.documentElement.scrollWidth<=innerWidth`),true);
  await command('Emulation.clearDeviceMetricsOverride');
  await command('Fetch.disable');
});

test('Evolution export downloads constructed save bytes without replacing loaded adventure progress', async () => {
  const {detectSoulSilver}=await import('../js/saves/soulsilver.js');
  const {bytes,sealBlock}=syntheticSave(64);bytes[0x7D]=2;sealBlock(0,0xF628);
  await fixtureReader(detectSoulSilver(bytes.buffer), bytes, true);
  await evaluate(`location.hash='storage';document.querySelector('#box-grid .pokemon-detail-button').click()`);
  await until(()=>evaluate(`Boolean(document.querySelector('.evolve-button'))`),'Evolution export control missing');
  const before=await evaluate(`(async()=>JSON.stringify(await (await import('./js/adventures.js')).getActiveProfile()))()`);
  await evaluate(`window.confirm=()=>true;globalThis.__downloaded=null;globalThis.__downloadName=null;
    URL.createObjectURL=blob=>{globalThis.__downloaded=blob;return 'blob:test-download';};
    HTMLAnchorElement.prototype.click=function(){globalThis.__downloadName=this.download;};
    document.querySelector('.evolve-button').click();`);
  await until(()=>evaluate(`document.querySelector('#adventure-status').textContent.includes('Load that file explicitly')`),'Export did not report separate progress');
  assert.equal(await evaluate(`globalThis.__downloadName`),'ui-fixture.evolved.sav');
  const exported=await evaluate(`(async()=>Array.from(new Uint8Array(await globalThis.__downloaded.arrayBuffer())))()`);
  assert.equal(detectSoulSilver(Uint8Array.from(exported).buffer).storage.boxes[0].pokemon[0].speciesId,65);
  assert.equal(await evaluate(`(async()=>JSON.stringify(await (await import('./js/adventures.js')).getActiveProfile()))()`),before);
  assert.equal(await evaluate(`document.querySelector('#pokemon-detail-dialog-title').textContent`),'A','Export must leave the original individual displayed');
  await command('Fetch.disable');
});

test('SoulSilver ability repair previews Poison Point → Swift Swim, requires confirmation and preserves the loaded adventure', async () => {
  const {abilityFixture}=require('./fixtures/hgss-abilities.cjs');
  const {dsv}=require('./fixtures/gen4/evolution.cjs');
  const {detectSave}=await import('../js/saves/index.js');
  const input=dsv(abilityFixture().bytes), original=input.slice();
  await fixtureReader(detectSave(input),input,true,'SoulSilver.DSV');
  await until(()=>evaluate(`document.querySelector('#ability-validation summary')?.textContent === 'Ability validation: 1 invalid'`),'Invalid-ability summary missing');
  const before=await evaluate(`(async()=>JSON.stringify(await (await import('./js/adventures.js')).getActiveProfile()))()`);
  await evaluate(`document.querySelector('#ability-validation').open=true;document.querySelector('#ability-validation button').click()`);
  await until(()=>evaluate(`Boolean(document.querySelector('.repair-ability-button'))`),'Repair action missing');
  assert.match(await evaluate(`document.querySelector('.ability-validation').textContent`),/Ability: Poison Point.*Invalid ability for Kingdra.*Suggested repair: Swift Swim/);
  assert.equal(await evaluate(`[...document.querySelectorAll('.pokemon-detail-list dt')].find(n=>n.textContent==='Ability').nextElementSibling.textContent`),'Poison Point');
  await evaluate(`globalThis.__downloaded=null;globalThis.__downloadName=null;globalThis.__confirmation='';
    URL.createObjectURL=blob=>{globalThis.__downloaded=blob;return 'blob:test-repair';};
    HTMLAnchorElement.prototype.click=function(){globalThis.__downloadName=this.download;};
    window.confirm=message=>{globalThis.__confirmation=message;return false;};
    document.querySelector('.repair-ability-button').click()`);
  assert.equal(await evaluate(`globalThis.__downloaded`),null);
  assert.match(await evaluate(`globalThis.__confirmation`),/Poison Point → Swift Swim/);
  assert.equal(await evaluate(`(async()=>JSON.stringify(await (await import('./js/adventures.js')).getActiveProfile()))()`),before);
  await command('Emulation.setDeviceMetricsOverride',{width:320,height:700,deviceScaleFactor:1,mobile:true});
  assert.equal(await evaluate(`document.documentElement.scrollWidth<=innerWidth`),true);
  if(process.env.ABILITY_SCREENSHOT_DIR){
    await require('node:fs/promises').mkdir(process.env.ABILITY_SCREENSHOT_DIR,{recursive:true});
    for(const theme of ['light','dark']){
      await evaluate(`document.documentElement.dataset.theme='${theme}';document.querySelector('.ability-validation').scrollIntoView({block:'center'})`);
      const shot=await command('Page.captureScreenshot',{format:'png'});
      await require('node:fs/promises').writeFile(path.join(process.env.ABILITY_SCREENSHOT_DIR,`repair-${theme}.png`),Buffer.from(shot.data,'base64'));
    }
  }
  await evaluate(`window.confirm=()=>true;document.querySelector('.repair-ability-button').click()`);
  await until(()=>evaluate(`Boolean(globalThis.__downloaded)`),'Repair did not download');
  assert.equal(await evaluate(`globalThis.__downloadName`),'SoulSilver.ability-repaired.DSV');
  const output=Uint8Array.from(await evaluate(`(async()=>Array.from(new Uint8Array(await globalThis.__downloaded.arrayBuffer())))()`));
  const loaded=detectSave(output);assert.equal(loaded.valid,true);assert.equal(loaded.storage.boxes[0].pokemon[0].abilityId,33);
  assert.deepEqual(output.subarray(0x80000),input.subarray(0x80000));assert.deepEqual(input,original);
  assert.equal(await evaluate(`(async()=>JSON.stringify(await (await import('./js/adventures.js')).getActiveProfile()))()`),before);
  assert.match(await evaluate(`document.querySelector('.ability-validation').textContent`),/Load that file explicitly/);
  await evaluate(`document.querySelector('#pokemon-detail-close').click();document.querySelector('#load-save').click()`);
  await uploadFixture(loaded,true,output,'SoulSilver.ability-repaired.DSV');
  await until(()=>evaluate(`document.querySelector('#ability-validation summary')?.textContent === 'Ability validation: 0 invalid'`),'Repaired save still flagged');
  await evaluate(`location.hash='storage';document.querySelector('#box-grid .pokemon-detail-button').click()`);
  await until(()=>evaluate(`document.querySelector('#pokemon-detail-content')?.getAttribute('aria-busy')==='false'`),'Repaired Pokémon details missing');
  assert.equal(await evaluate(`document.querySelector('.repair-ability-button')===null`),true);
  await command('Emulation.clearDeviceMetricsOverride');await command('Fetch.disable');
});

async function openLinkedPlanner(data) {
  await fixtureReader(data);
  await command('Fetch.disable');
  await command('Page.navigate',{url:baseURL+'/team-planner/'});
  await until(()=>evaluate(`document.querySelectorAll('.team-card').length===6&&document.querySelector('#associate-plan')&&!document.querySelector('#associate-plan').hidden`),'Existing reference plan was not offered for explicit association');
  await evaluate(`document.querySelector('#associate-plan').click()`);
  await until(()=>evaluate(`document.querySelector('#associate-plan').hidden&&document.querySelector('#ev-save-status').textContent.includes('Using')`),'Plan did not associate');
}
async function plannerSave(data) {
  await evaluate(`(async()=>{const api=await import('/js/adventures.js');const active=await api.getActiveProfile();await api.persistSnapshot(api.createSnapshot(${JSON.stringify(data)},'updated.sav'),{profileId:active.id});})()`);
}
function plannedParty() {
  const data=fixture();const p=data.party[0];
  data.party=[
    {...structuredClone(p),slot:1,speciesId:68,nickname:'Machamp partner',personality:101,natureId:3,moves:[{id:223},{id:70},{id:431},{id:0}],evs:{hp:252,attack:252,defense:0,speed:0,specialAttack:0,specialDefense:4}},
    {...structuredClone(p),slot:2,speciesId:148,nickname:'Mordecai',personality:102,natureId:3,moves:[{id:349},{id:89},{id:337},{id:0}]},
    {...structuredClone(p),slot:3,speciesId:94,nickname:'Gengar partner',personality:103,natureId:10,moves:[{id:247},{id:188},{id:411},{id:85}]}
  ];return data;
}
async function currentPlan(expression='plan') {
  return evaluate(`(async()=>{const store=await import('/js/planner-store.js');const plan=(await store.listPlanners()).find(p=>p.id===document.querySelector('#planner-select').value);return ${expression};})()`);
}
async function createPlanner(name) {
  await evaluate(`document.querySelector('#new-plan').click();document.querySelector('#plan-name').value=${JSON.stringify(name)};document.querySelector('#plan-form').requestSubmit(document.querySelector('#plan-form button[value="confirm"]'));`);
  await until(()=>evaluate(`document.querySelector('#planner-select').selectedOptions[0]?.textContent===${JSON.stringify(name)}`),'New planner did not save');
}

test('Planner uses Reader profile for current moves, HMs, nature, evolution and EVs without a second upload',async()=>{
  const data=plannedParty();await openLinkedPlanner(data);
  assert.equal(await evaluate(`document.querySelector('#ev-save-file')`),null);
  assert.equal(await evaluate(`document.querySelector('#team-pokemon-machamp').value`),'party:1');
  assert.equal(await evaluate(`document.querySelector('[data-member="dragonite"] .actual-pokemon').textContent.includes('Dragonair')`),true);
  assert.equal(await evaluate(`document.querySelector('[data-member="dragonite"] .pokemon-tracking').textContent.includes('Target: Dragonite')`),true);
  assert.equal(await evaluate(`document.getElementById('dragonite:3').checked`),false,'Dragonair does not know Fly');
  assert.equal(await evaluate(`document.getElementById('gengar:0').checked`),true);
  assert.equal(await evaluate(`document.getElementById('hm:4').checked`),true,'Rock Climb should use linked Machamp');
  assert.equal(await evaluate(`document.getElementById('hm:5').checked`),true,'Strength should use linked Machamp');
  assert.equal(await evaluate(`document.getElementById('machamp:Attack').checked`),true);
  assert.equal(await evaluate(`document.getElementById('machamp:Attack').disabled`),true);
  assert.equal(await evaluate(`document.querySelector('[data-member="machamp"] .pokemon-tracking').textContent.includes('Adamant (matches goal)')`),true);
  const before=await currentPlan('JSON.stringify({goals:plan.goals,state:plan.state})');
  data.party[2].moves=[{id:1},{id:0},{id:0},{id:0}];await plannerSave(data);
  await until(()=>evaluate(`!document.getElementById('gengar:0').checked`),'Forgotten move remained learned');
  assert.equal(await currentPlan('JSON.stringify({goals:plan.goals,state:plan.state})'),before,'Observations must not rewrite desired or manual values');
  await command('Page.reload');
  await until(()=>evaluate(`document.querySelector('#team-pokemon-machamp')?.value==='party:1'`),'Association did not survive refresh');
  assert.equal(await evaluate(`document.getElementById('hm:5').checked`),true);
});

test('Planner follows a linked individual through evolution, PC transfer and missing saves without stealing another candidate',async()=>{
  const data=plannedParty();data.party[0].speciesId=67;await openLinkedPlanner(data);
  const original=await currentPlan('plan.links.machamp.identity');
  const pokemon=data.party.shift();pokemon.speciesId=68;pokemon.recordKind='storage';pokemon.slot=1;
  data.storage.boxes[5].pokemon[0]=pokemon;await plannerSave(data);
  await until(()=>evaluate(`document.querySelector('#team-pokemon-machamp').value==='storage:6:1'`),'Linked Pokémon did not follow PC transfer');
  assert.equal(await evaluate(`document.querySelector('[data-member="machamp"] .pokemon-tracking').textContent.includes('Target reached')`),true);
  assert.equal(await evaluate(`document.querySelector('[data-hm="Strength"] .hm-actual').textContent.includes('In PC')`),true);
  assert.deepEqual(await currentPlan('plan.links.machamp.identity'),original);
  data.storage.boxes[5].pokemon[0]={slot:1,empty:true};
  data.party.push({...structuredClone(pokemon),slot:4,recordKind:'party',personality:999,nickname:'Different Machamp'});
  await plannerSave(data);
  await until(()=>evaluate(`document.querySelector('[data-member="machamp"] .link-status')?.textContent.includes('Not found')`),'Missing link was silently reassigned');
  assert.equal(await evaluate(`document.querySelector('[data-member="machamp"] .ev-last-known').textContent.includes('Last known total')`),true);
  assert.equal(await evaluate(`document.getElementById('machamp:Attack').checked`),false,'Last-known values are not current completion');
  assert.deepEqual(await currentPlan('plan.links.machamp.identity'),original);
  await evaluate(`var select=document.querySelector('#team-pokemon-machamp');select.value='party:4';select.dispatchEvent(new Event('change'));`);
  await until(()=>currentPlan('plan.links.machamp.identity.personality===999'),'Manual reassignment did not persist');
});

test('Planner requires explicit PC-only and ambiguous party choices; manual mode stays manual after refresh',async()=>{
  const data=fixture();Object.assign(data.storage.boxes[0].pokemon[4],{speciesId:116,personality:300,natureId:15});
  data.party=[{...structuredClone(data.party[0]),speciesId:66,slot:1,personality:301},{...structuredClone(data.party[0]),speciesId:67,slot:2,personality:302}];
  await openLinkedPlanner(data);
  assert.equal(await evaluate(`document.querySelector('#team-pokemon-kingdra').value`),'');
  assert.equal(await evaluate(`document.querySelector('#team-pokemon-machamp').value`),'');
  assert.equal(await currentPlan('Boolean(plan.links.kingdra || plan.links.machamp)'),false);
  await evaluate(`var select=document.querySelector('#team-pokemon-kingdra');select.value='storage:1:5';select.dispatchEvent(new Event('change'));`);
  await until(()=>currentPlan('Boolean(plan.links.kingdra?.identity)'),'Explicit PC link missing');
  assert.equal(await evaluate(`document.querySelector('#ev-pokemon-kingdra').value`),'storage:1:5');
  await evaluate(`var select=document.querySelector('#team-pokemon-machamp');select.value='party:2';select.dispatchEvent(new Event('change'));`);
  await until(()=>currentPlan('plan.links.machamp?.identity.personality===302'),'Ambiguous selection missing');
  await evaluate(`var select=document.querySelector('#team-pokemon-machamp');select.value='manual';select.dispatchEvent(new Event('change'));`);
  await until(()=>currentPlan('plan.links.machamp?.manual===true'),'Manual mode missing');
  await command('Page.reload');
  await until(()=>evaluate(`document.querySelector('#team-pokemon-machamp')?.value==='manual'`),'Manual mode lost after refresh');
  assert.equal(await evaluate(`document.querySelector('#team-pokemon-kingdra').value`),'storage:1:5');
});

test('Multiple planners and adventures retain separate progress, restore selections and request a choice when ambiguous',async()=>{
  await openLinkedPlanner(plannedParty());const first=await currentPlan('plan.id');
  await evaluate(`document.querySelector('#kingdra').click()`);
  await until(()=>currentPlan('plan.state.ready.kingdra===true'),'First plan progress not saved');
  await createPlanner('Alternate team');const second=await currentPlan('plan.id');assert.notEqual(first,second);
  assert.equal(await evaluate(`document.querySelector('#kingdra').checked`),false);
  await evaluate(`var select=document.querySelector('#planner-select');select.value=${JSON.stringify(first)};select.dispatchEvent(new Event('change'));`);
  await until(()=>evaluate(`document.querySelector('#kingdra').checked`),'First plan progress lost');
  const a=await evaluate(`document.querySelector('#planner-adventure').value`);
  const bData=plannedParty();bData.save.trainer.trainerId=900;bData.save.trainer.name='Another adventure';
  await evaluate(`(async()=>{const api=await import('/js/adventures.js');await api.persistSnapshot(api.createSnapshot(${JSON.stringify(bData)},'another.sav'));})()`);
  await until(()=>evaluate(`document.querySelector('#planner-context').textContent.includes('Another adventure')&& !document.querySelector('#planner-empty').hidden`),'Unrelated adventure reused a planner');
  const b=await evaluate(`document.querySelector('#planner-adventure').value`);
  await createPlanner('Another adventure plan');
  await evaluate(`var select=document.querySelector('#planner-adventure');select.value=${JSON.stringify(a)};select.dispatchEvent(new Event('change'));`);
  await until(()=>evaluate(`document.querySelector('#planner-select').value===${JSON.stringify(first)}`),'Remembered planner selection missing');
  assert.equal(await evaluate(`document.querySelector('#kingdra').checked`),true);
  await evaluate(`(async()=>{const api=await import('/js/adventures.js');await api.adventureTransaction(['settings'],'readwrite',tx=>tx.objectStore('settings').delete('activePlanner:'+${JSON.stringify(a)}));await api.selectProfile(${JSON.stringify(b)});})()`);
  await until(()=>evaluate(`document.querySelector('#planner-select').selectedOptions[0]?.textContent==='Another adventure plan'`),'Only associated planner not selected automatically');
  await evaluate(`var select=document.querySelector('#planner-adventure');select.value=${JSON.stringify(a)};select.dispatchEvent(new Event('change'));`);
  await until(()=>evaluate(`!document.querySelector('#planner-empty').hidden`),'Multiple planners should require a selection when none is saved');
  assert.equal(await evaluate(`document.querySelectorAll('#planner-select option').length`),3);
});

test('Planner activates the latest v1 data once, preserves raw backups, and imports as separate plans',async()=>{
  await command('Page.navigate',{url:baseURL+'/'});
  await until(()=>evaluate(`Boolean(document.querySelector('#app-version'))`),'Reader ready for migration');
  const raw=JSON.stringify({version:1,ready:{kingdra:true},moves:{'gengar:0':true},hmDone:{'hm:4':true},evDone:{'machamp:Attack':true},benchNotes:{metagross:true},custom:'preserved'});
  await evaluate(`(async()=>{const api=await import('/js/adventures.js');localStorage.setItem(api.LEGACY_PLANNER_KEY,JSON.stringify({version:1,ready:{}}));await api.preserveLegacyPlanner();localStorage.setItem(api.LEGACY_PLANNER_KEY,${JSON.stringify(raw)});})()`);
  await command('Page.navigate',{url:baseURL+'/team-planner/'});
  await until(()=>evaluate(`document.querySelector('#kingdra')?.checked`),'Latest legacy data was not activated');
  assert.equal(await currentPlan('plan.state.custom'),'preserved');
  assert.equal(await evaluate(`document.getElementById('hm:4').checked`),true);
  assert.equal(await evaluate(`localStorage.getItem('pokemon-reader-soulsilver-team-planner-v1')`),raw);
  await evaluate(`document.querySelector('#kingdra').click()`);
  await until(()=>currentPlan('plan.state.ready.kingdra===false'),'Migrated plan edit not saved');
  await command('Page.reload');
  await until(()=>evaluate(`document.querySelector('#kingdra')&&!document.querySelector('#kingdra').checked`),'Old v1 data overwrote a newer plan');
  const original=await currentPlan('plan.id');
  await evaluate(`globalThis.__exported=null;URL.createObjectURL=blob=>{globalThis.__exported=blob;return 'blob:test';};HTMLAnchorElement.prototype.click=function(){};document.querySelector('#export-btn').click();`);
  const exported=await evaluate(`(async()=>JSON.parse(await globalThis.__exported.text()))()`);
  assert.equal(exported.version,2);assert.equal(exported.planner.id,original);
  await evaluate(`var transfer=new DataTransfer();transfer.items.add(new File([${JSON.stringify(JSON.stringify(exported))}],'backup.json',{type:'application/json'}));document.querySelector('#import-file').files=transfer.files;document.querySelector('#import-file').dispatchEvent(new Event('change'));`);
  await pause(150);
  await until(()=>currentPlan(`plan.id!==${JSON.stringify(original)}`),'v2 backup import failed: '+await evaluate(`document.querySelector('#save-status').textContent`));
  assert.notEqual(await currentPlan('plan.id'),original);assert.equal(await currentPlan('plan.adventureId'),null);
  const count=await evaluate(`(async()=>(await(await import('/js/planner-store.js')).listPlanners()).length)()`);
  await evaluate(`var transfer=new DataTransfer();transfer.items.add(new File(['{"version":99}'],'invalid.json'));document.querySelector('#import-file').files=transfer.files;document.querySelector('#import-file').dispatchEvent(new Event('change'));`);
  await until(()=>evaluate(`document.querySelector('#save-status').textContent.includes('Unrecognized')`),'Invalid backup was not rejected');
  assert.equal(await evaluate(`(async()=>(await(await import('/js/planner-store.js')).listPlanners()).length)()`),count);
});

test('Planner concurrent edits and failed transactions preserve persisted goals and manual progress',async()=>{
  await openLinkedPlanner(plannedParty());
  const result=await evaluate(`(async()=>{const api=await import('/js/planner-store.js');const original=(await api.listPlanners())[0];const first=structuredClone(original);first.state.ready.kingdra=true;await api.storePlanner(first);let conflict=false;try{await api.storePlanner(original);}catch{conflict=true;}const before=JSON.stringify((await api.listPlanners())[0]);const put=IDBObjectStore.prototype.put;IDBObjectStore.prototype.put=function(value){if(this.name==='settings')throw new DOMException('Quota full','QuotaExceededError');return put.call(this,value);};let rejected=false;try{const latest=(await api.listPlanners())[0];latest.state.ready.kingdra=false;await api.storePlanner(latest);}catch{rejected=true;}finally{IDBObjectStore.prototype.put=put;}return {conflict,rejected,preserved:before===JSON.stringify((await api.listPlanners())[0])};})()`);
  assert.deepEqual(result,{conflict:true,rejected:true,preserved:true});
});

test('Linked Planner views fit phones and desktop in both themes and retain section navigation',async()=>{
  const data=plannedParty();data.party[0].nickname='A long but valid nickname';await openLinkedPlanner(data);
  for(const width of [320,390,768,1440]) {
    await command('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:width<800});
    for(const theme of ['light','dark']) {
      await evaluate(`localStorage.setItem('pokemon-reader-theme',${JSON.stringify(theme)});dispatchEvent(new StorageEvent('storage',{key:'pokemon-reader-theme'}));`);
      for(const tab of ['team','bench']) {
        await evaluate(`document.querySelector('[data-tab="${tab}"]').click();document.querySelector('#panel-${tab}').scrollIntoView();`);
        assert.equal(await evaluate(`document.documentElement.scrollWidth<=innerWidth`),true,`${width} ${theme} ${tab}`);
        assert.equal(await evaluate(`location.hash`),'#'+tab);
        if(process.env.PLANNER_SCREENSHOT_DIR && [390,1440].includes(width) && tab!=='bench') {
          const shot=await command('Page.captureScreenshot',{format:'png'});
          await require('node:fs/promises').writeFile(path.join(process.env.PLANNER_SCREENSHOT_DIR,`planner-${theme}-${width}-${tab}.png`),Buffer.from(shot.data,'base64'));
        }
      }
    }
  }
  await command('Page.reload');
  await until(()=>evaluate(`document.querySelector('#panel-bench')?.hidden===false&&document.querySelectorAll('.bench-card').length===3`),'Planner section was not restored');
  await command('Emulation.clearDeviceMetricsOverride');assert.deepEqual(exceptions,[]);
});

test('Planner receives profile updates from another browser tab through the shared channel',async()=>{
  const data=plannedParty();await openLinkedPlanner(data);
  const target=await command('Target.createTarget',{url:baseURL+'/pokedex-earth/'});
  try {
    const pages=await (await fetch(`http://${new URL(socket.url).host}/json/list`)).json();
    const other=new WebSocket(pages.find(page=>page.id===target.targetId).webSocketDebuggerUrl);
    await new Promise((resolve,reject)=>{other.addEventListener('open',resolve,{once:true});other.addEventListener('error',reject,{once:true});});
    data.party[0].moves=[{id:1},{id:0},{id:0},{id:0}];
    const response=await new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>reject(new Error('Other tab timed out')),10000);
      other.addEventListener('message',event=>{const message=JSON.parse(event.data);if(message.id===1){clearTimeout(timer);resolve(message);}});
      other.send(JSON.stringify({id:1,method:'Runtime.evaluate',params:{expression:`(async()=>{const api=await import('/js/adventures.js');const profile=await api.getActiveProfile();await api.persistSnapshot(api.createSnapshot(${JSON.stringify(data)},'other-tab.sav'),{profileId:profile.id});return true;})()`,awaitPromise:true,returnByValue:true}}));
    });
    other.close();assert.equal(response.result?.exceptionDetails,undefined);
    await until(()=>evaluate(`!document.getElementById('hm:5').checked`),'Other-tab update did not refresh HM progress');
    assert.equal(await evaluate(`document.getElementById('machamp:0').checked`),false);
  } finally {await command('Target.closeTarget',{targetId:target.targetId});}
});

test('Planner storage denial preserves existing data and provides manual session progress and export',async()=>{
  await fixtureReader();await command('Fetch.disable');
  const before=await evaluate(`(async()=>JSON.stringify(await(await import('/js/adventures.js')).getActiveProfile()))()`);
  await command('Page.enable');
  const injection=await command('Page.addScriptToEvaluateOnNewDocument',{source:`globalThis.__plannerOriginalOpen=indexedDB.open;indexedDB.open=()=>{throw new DOMException('Storage denied','SecurityError');};`});
  try {
    await command('Page.navigate',{url:baseURL+'/team-planner/'});
    await pause(200);
    await until(()=>evaluate(`document.querySelectorAll('.team-card').length===6&&document.querySelector('#save-status').textContent.includes('storage unavailable')`),'Session fallback unavailable: '+await evaluate(`JSON.stringify({cards:document.querySelectorAll('.team-card').length,status:document.querySelector('#save-status')?.textContent,injected:Boolean(globalThis.__plannerOriginalOpen)})`));
    const checked=await evaluate(`document.querySelector('#kingdra').checked`);
    await evaluate(`document.querySelector('#kingdra').click()`);
    await until(()=>evaluate(`document.querySelector('#kingdra').checked===${!checked}`),'Manual session edit did not work');
    assert.equal(await evaluate(`document.querySelector('#save-status').textContent.includes('Session only')`),true);
    await evaluate(`globalThis.__backup=null;URL.createObjectURL=blob=>{globalThis.__backup=blob;return 'blob:test';};HTMLAnchorElement.prototype.click=function(){};document.querySelector('#export-btn').click();`);
    assert.equal(await evaluate(`(async()=>JSON.parse(await globalThis.__backup.text()).version)()`),2);
  } finally {
    await command('Page.removeScriptToEvaluateOnNewDocument',{identifier:injection.identifier});
    await evaluate(`indexedDB.open=globalThis.__plannerOriginalOpen`);
  }
  assert.equal(await evaluate(`(async()=>JSON.stringify(await(await import('/js/adventures.js')).getActiveProfile()))()`),before);
});

test('Reader and Planner tolerate denied BroadcastChannel access while retaining saved progress',async()=>{
  const data=plannedParty();await fixtureReader(data);await command('Fetch.disable');
  await command('Page.enable');
  const injection=await command('Page.addScriptToEvaluateOnNewDocument',{source:`globalThis.__originalChannel=BroadcastChannel;globalThis.BroadcastChannel=class{constructor(){throw new DOMException('Channel denied','SecurityError');}};`});
  try {
    await command('Page.navigate',{url:baseURL+'/team-planner/'});
    await until(()=>evaluate(`document.querySelectorAll('.team-card').length===6&&!document.querySelector('#associate-plan').hidden`),'Denied channel prevented Planner initialization');
    await evaluate(`document.querySelector('#associate-plan').click()`);
    await until(()=>evaluate(`document.getElementById('hm:5').checked`),'Profile tracking unavailable without a channel');
    data.party[0].moves=[{id:1},{id:0},{id:0},{id:0}];await plannerSave(data);
    await until(()=>evaluate(`!document.getElementById('hm:5').checked`),'Local notification failed with channel denied');
    await command('Page.navigate',{url:baseURL+'/'});
    await until(()=>evaluate(`document.querySelector('.app')?.dataset.saveLoaded==='true'`),'Reader could not restore with channel denied');
  } finally {
    await command('Page.removeScriptToEvaluateOnNewDocument',{identifier:injection.identifier});
    await evaluate(`globalThis.BroadcastChannel=globalThis.__originalChannel`);
  }
});

function atlasCaughtFixture() {
  const data=fixture();data.party[0].speciesId=161; // Owned Sentret is not registered caught.
  data.save.pokedex={nationalDex:false,speciesIds:[19,161,163],seenSpecies:[19,161,163],caughtSpecies:[19],speciesCount:3,seenCount:3,caughtCount:1,seenPercent:100,caughtPercent:100/3,allCaughtSpecies:[19,129,387,493],allSeenSpecies:[19,129,161,163,387,493]};
  return data;
}
async function caughtAtlas(data=atlasCaughtFixture(),locationName='Route 29') {
  await fixtureReader(data);await command('Fetch.disable');
  await command('Page.navigate',{url:baseURL+'/pokedex-earth/#location='+encodeURIComponent(locationName)});
  await until(()=>evaluate(`document.querySelector('#atlas-save-status')?.textContent.includes('Test Trainer')&&document.querySelector('.location-card h2')?.textContent===${JSON.stringify(locationName)}`),'Atlas profile context not ready');
}

test('Atlas caught markers use registration rather than ownership or Seen flags and retain every encounter record',async()=>{
  await caughtAtlas();
  const result=await evaluate(`(async()=>{const api=await import('/js/data/atlas-route-reference.js');const rows=[...document.querySelectorAll('.encounter-entry')];return {
    caught:rows.filter(row=>row.querySelector('[data-species-id="19"]')).every(row=>Boolean(row.querySelector('.caught-indicator'))),
    ownedOnly:rows.filter(row=>row.querySelector('[data-species-id="161"]')).some(row=>Boolean(row.querySelector('.caught-indicator'))),
    seenOnly:rows.filter(row=>row.querySelector('[data-species-id="163"]')).some(row=>Boolean(row.querySelector('.caught-indicator'))),
    records:new Set(rows.map(row=>row.dataset.encounterIndex)).size,
    expected:api.locationEncounterReference('soulsilver','Route 29').encounters.length,
    accessible:[...document.querySelectorAll('.caught-indicator')].every(icon=>icon.alt==='Registered caught'&&icon.width===12&&icon.height===12),
    mapped:rows.every(row=>Boolean(row.querySelector('[data-species-id]')))
  };})()`);
  assert.equal(result.caught,true);assert.equal(result.ownedOnly,false);assert.equal(result.seenOnly,false);
  assert.equal(result.records,result.expected);assert.equal(result.accessible,true);assert.equal(result.mapped,true);
  await command('Page.navigate',{url:baseURL+'/pokedex-earth/#location=Safari%20Zone'});
  await until(()=>evaluate(`document.querySelector('[data-species-id="19"] .caught-indicator')`),'Existing Safari records lack caught markers');
  assert.equal(await evaluate(`new Set([...document.querySelectorAll('.encounter-entry')].map(row=>row.dataset.encounterIndex)).size`),339);
  await command('Page.navigate',{url:baseURL+'/pokedex-earth/#ev-training'});
  await until(()=>evaluate(`Boolean(document.querySelector('#ev-results [data-species-id="129"] .caught-indicator'))`),'EV finder did not share caught markers');
  assert.equal(await evaluate(`document.querySelectorAll('select[id*="caught"],input[id*="caught"]').length`),0);
});

test('Atlas updates profile markers in place, preserving open encounters, floor, focus and navigation',async()=>{
  await caughtAtlas(atlasCaughtFixture(),'Union Cave');
  await evaluate(`globalThis.__caughtLocation=document.querySelector('.location-card');document.querySelector('.encounter-section').open=true;var floor=document.querySelector('.map-select');floor.selectedIndex=1;floor.dispatchEvent(new Event('change'));floor.focus();scrollTo(0,200);`);
  const before=await evaluate(`({hash:location.hash,scroll:scrollY,floor:document.querySelector('.map-select').value,focus:document.activeElement.className})`);
  const data=atlasCaughtFixture();data.save.trainer.name='Other adventure';data.save.trainer.trainerId=901;
  data.save.pokedex.caughtSpecies=[];data.save.pokedex.caughtCount=0;data.save.pokedex.caughtPercent=0;data.save.pokedex.allCaughtSpecies=[];
  await evaluate(`(async()=>{const api=await import('/js/adventures.js');await api.persistSnapshot(api.createSnapshot(${JSON.stringify(data)},'other.sav'),{newAdventure:true});})()`);
  await until(()=>evaluate(`document.querySelector('#atlas-save-status').textContent.includes('Other adventure')`),'Profile switch did not update Atlas');
  assert.equal(await evaluate(`document.querySelectorAll('.caught-indicator').length`),0);
  assert.equal(await evaluate(`document.querySelector('.location-card')===globalThis.__caughtLocation`),true,'Profile changes must not rebuild location controls');
  assert.equal(await evaluate(`document.querySelector('.encounter-section').open`),true);
  assert.deepEqual(await evaluate(`({hash:location.hash,scroll:scrollY,floor:document.querySelector('.map-select').value,focus:document.activeElement.className})`),before);
  await evaluate(`(async()=>{const api=await import('/js/adventures.js');await api.clearActiveProfile();})()`);
  await until(()=>evaluate(`document.querySelector('#atlas-save-status').hidden`),'Reference mode did not clear profile context');
  assert.equal(await evaluate(`document.querySelectorAll('.caught-indicator').length`),0);
  assert.equal(await evaluate(`document.querySelectorAll('.encounter-entry').length>0`),true);
});

test('Atlas restores older scoped snapshots and preserves their valid markers after an invalid replacement',async()=>{
  const data=atlasCaughtFixture();delete data.save.pokedex.allCaughtSpecies;delete data.save.pokedex.allSeenSpecies;
  await caughtAtlas(data);
  assert.equal(await evaluate(`document.querySelector('#atlas-save-status').textContent.includes('Reload your save')`),true);
  assert.equal(await evaluate(`Boolean(document.querySelector('[data-species-id="19"] .caught-indicator'))`),true);
  await command('Page.reload');
  await until(()=>evaluate(`Boolean(document.querySelector('[data-species-id="19"] .caught-indicator'))`),'Older profile markers did not restore');
  assert.equal(await evaluate(`(async()=>{const api=await import('/js/adventures.js');const old=await api.getActiveProfile();try{await api.persistSnapshot({...old.snapshot,pokedex:{...old.snapshot.pokedex,allCaughtSpecies:[494]}});return false;}catch{return true;}})()`),true);
  assert.equal(await evaluate(`Boolean(document.querySelector('[data-species-id="19"] .caught-indicator'))`),true);
});

test('Caught icons decode locally and Atlas layouts fit phones/desktop in both themes beneath the Pages path',async()=>{
  await caughtAtlas();
  await command('Page.navigate',{url:baseURL+'/pokemon-reader/pokedex-earth/#location=Route%2029'});
  await until(()=>evaluate(`Boolean(document.querySelector('.caught-indicator'))`),'Pages path lost caught indicators');
  assert.equal(await evaluate(`(async()=>{const img=document.querySelector('.caught-indicator');await img.decode();return new URL(img.src).pathname;})()`),'/pokemon-reader/assets/icons/caught-gen4.svg');
  for(const width of [320,390,768,1440]) {
    await command('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:width<800});
    for(const theme of ['light','dark']) {
      await evaluate(`localStorage.setItem('pokemon-reader-theme',${JSON.stringify(theme)});dispatchEvent(new StorageEvent('storage',{key:'pokemon-reader-theme'}));document.querySelector('.encounter-section').open=true;document.querySelector('.location-encounters').scrollIntoView();`);
      assert.equal(await evaluate(`document.documentElement.scrollWidth<=innerWidth`),true,`${width} ${theme}`);
      if(process.env.CAUGHT_SCREENSHOT_DIR && [390,1440].includes(width)) {
        const shot=await command('Page.captureScreenshot',{format:'png'});
        await require('node:fs/promises').writeFile(path.join(process.env.CAUGHT_SCREENSHOT_DIR,`caught-${theme}-${width}.png`),Buffer.from(shot.data,'base64'));
      }
    }
  }
  await command('Emulation.clearDeviceMetricsOverride');assert.deepEqual(exceptions,[]);
});

test('Atlas remains usable without a save or when profile storage is denied',async()=>{
  await atlas({directory:false});
  assert.equal(await evaluate(`document.querySelectorAll('.caught-indicator').length`),0);
  await command('Page.enable');
  const injection=await command('Page.addScriptToEvaluateOnNewDocument',{source:`globalThis.__caughtOriginalOpen=indexedDB.open;indexedDB.open=()=>{throw new DOMException('Storage denied','SecurityError');};`});
  try {
    await command('Page.navigate',{url:baseURL+'/pokedex-earth/#location=Route%2032'});
    await until(()=>evaluate(`document.querySelector('#atlas-save-status')?.textContent.includes('unavailable')&&document.querySelectorAll('.encounter-entry').length>0`),'Atlas reference blocked by profile storage failure');
    assert.equal(await evaluate(`document.querySelectorAll('.caught-indicator').length`),0);
    assert.equal(await evaluate(`document.querySelectorAll('.connection-link').length>0`),true);
  } finally {
    await command('Page.removeScriptToEvaluateOnNewDocument',{identifier:injection.identifier});
    await evaluate(`indexedDB.open=globalThis.__caughtOriginalOpen`);
  }
});

async function referenceDex(hash='',prefix='') {
  await command('Page.navigate',{url:baseURL+prefix+'/pokedex/'+hash});
  await until(()=>evaluate(`document.body?.dataset.referenceReady==='true'`),'Reference Pokédex ready');
}
test('reference Pokédex is save-independent, keeps full numbered neighbors on search and opens outside-regional species',async()=>{
 await referenceDex();
 assert.equal(await evaluate(`document.querySelectorAll('.species-row').length`),256);
 assert.equal(await evaluate(`document.querySelector('.species-row strong').textContent`),'Chikorita');
 await evaluate(`document.querySelector('#species-search').value='Dratini';document.querySelector('#reference-search').requestSubmit()`);
 assert.equal(await evaluate(`document.querySelectorAll('.species-row').length`),256);
 assert.equal(await evaluate(`document.querySelector('.search-match').id`),'species-147');
 const neighbors=await evaluate(`(() => {const row=document.querySelector('.search-match');return [row.previousElementSibling.querySelector('strong').textContent,row.nextElementSibling.querySelector('strong').textContent]})()`);
 assert.deepEqual(neighbors,['Suicune','Dragonair']);
 await evaluate(`document.querySelector('#species-search').value='Deoxys';document.querySelector('#reference-search').requestSubmit()`);
 assert.equal(await evaluate(`document.querySelector('#reference-scope').value`),'national');
 assert.equal(await evaluate(`document.querySelectorAll('.species-row').length`),493);
 assert.equal(await evaluate(`document.querySelector('.search-match').id`),'species-386');
 assert.equal(await evaluate(`document.querySelector('.species-row').textContent.includes('Bulbasaur')`),true);
});
test('reference cards preserve list scroll/focus and Back/Forward/escape, and show exact evolution-stage Fly compatibility',async()=>{
 await referenceDex('#scope=national');
 await evaluate(`document.querySelector('#species-search').value='147';document.querySelector('#reference-search').requestSubmit()`);
 const before=await evaluate(`({y:document.querySelector('#species-list').scrollTop,focused:document.activeElement.dataset.speciesId})`);
 assert.ok(before.y>0,'Jump must scroll the list');
 await evaluate(`document.querySelector('[data-species-id="147"]').click()`);
 assert.equal(await evaluate(`document.querySelector('#reference-detail').open`),true);
 assert.equal(await evaluate(`document.querySelector('#reference-title').textContent`),'Dratini');
 const fly=await evaluate(`(() => {const table=document.querySelector('.machine-table');return [...table.tBodies[0].rows].find(r=>r.cells[0].textContent.includes('HM02')).textContent})()`);
 assert.equal(fly,'HM02 · Fly——✓');
 assert.equal(await evaluate(`document.querySelectorAll('#reference-content .type-grid>div').length`),17);
 await evaluate(`document.querySelector('#reference-close').click()`);
 await until(()=>evaluate(`!document.querySelector('#reference-detail').open`),'Closed card');
 assert.deepEqual(await evaluate(`({y:document.querySelector('#species-list').scrollTop,focused:document.activeElement.dataset.speciesId})`),before);
 await evaluate(`history.forward()`);await until(()=>evaluate(`document.querySelector('#reference-detail').open`),'Forward card');
 await command('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
 await command('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
 await until(()=>evaluate(`!document.querySelector('#reference-detail').open`),'Escape closes');
 assert.equal(await evaluate(`document.querySelector('#species-list').scrollTop`),before.y);
});
test('reference direct links include HGSS ability/item/form/type/stats and all move sections with live controls',async()=>{
 await referenceDex('#species=25&scope=national');
 assert.equal(await evaluate(`document.querySelector('#reference-detail').open`),true);
 assert.match(await evaluate(`document.querySelector('#reference-content').textContent`),/Static/);
 assert.match(await evaluate(`document.querySelector('#reference-content').textContent`),/Light Ball: 5%/);
 await evaluate(`document.querySelector('#compound-eyes').click()`);
 assert.match(await evaluate(`document.querySelector('#reference-content').textContent`),/Light Ball: 20%/);
 await evaluate(`document.querySelector('#reference-level').value='100';document.querySelector('#reference-level').dispatchEvent(new Event('input'))`);
 assert.equal(await evaluate(`document.querySelector('#reference-level').closest('details').querySelector('caption').textContent`),'Possible stats at level 100');
 const headings=await evaluate(`Array.from(document.querySelectorAll('#reference-content>details>summary'),n=>n.textContent)`);
 assert.deepEqual(headings,['Abilities','EV yield','Type matchups','Wild held items','Evolution family','SoulSilver locations','Level-up moves','TM/HM compatibility across evolutions','Tutor moves','Egg moves','Base stats and possible ranges','Sources and coverage']);
 // Base and appliance Rotom both retain their Generation IV Ghost type.
 await referenceDex('#species=479&scope=national');
 await evaluate(`document.querySelector('#reference-form').value='503';document.querySelector('#reference-form').dispatchEvent(new Event('change'))`);
 assert.equal(await evaluate(`document.querySelector('.pokemon-detail-header .type-badges').textContent`),'ElectricGhost');
 assert.match(await evaluate(`document.querySelector('#reference-content').textContent`),/Overheat/);
 await referenceDex('#species=493&scope=national');
 await evaluate(`document.querySelector('#reference-type').value='dragon';document.querySelector('#reference-type').dispatchEvent(new Event('change'))`);
 assert.equal(await evaluate(`document.querySelector('.pokemon-detail-header .type-badges').textContent`),'Dragon');
 await evaluate(`document.querySelector('#reference-close').click()`);
 assert.equal(await evaluate(`document.querySelector('#reference-detail').open`),false);
 assert.equal(await evaluate(`location.pathname`),'/pokedex/');
});
test('reference Atlas links open the exact location, and encounter names return to the matching species card',async()=>{
 await referenceDex('#species=152&scope=national');
 const href=await evaluate(`Array.from(document.querySelectorAll('.reference-locations a')).find(a=>a.textContent.includes('New Bark Town')).href`);
 assert.equal(new URL(href).hash,'#location=New%20Bark%20Town');
 await evaluate(`Array.from(document.querySelectorAll('.reference-locations a')).find(a=>a.textContent.includes('New Bark Town')).click()`);
 await until(()=>evaluate(`document.querySelector('.location-card h2')?.textContent==='New Bark Town'`),'Exact Atlas location');
 await evaluate(`location.hash='location=Route%2029'`);
 await until(()=>evaluate(`document.querySelector('.location-card h2')?.textContent==='Route 29'`),'Route29');
 const link=await evaluate(`document.querySelector('.encounter-name').href`);assert.match(link,/\/pokedex\/#species=\d+&scope=national$/);
 const id=Number(new URLSearchParams(new URL(link).hash.slice(1)).get('species'));
 await evaluate(`document.querySelector('.encounter-name').click()`);
 await until(()=>evaluate(`document.querySelector('#reference-detail')?.open`),'Encounter species');
 assert.equal(await evaluate(`Number(new URLSearchParams(location.hash.slice(1)).get('species'))`),id);
});
test('reference browsing works with denied profile storage, local sprites and repository-relative paths',async()=>{
 await command('Page.enable');
 const injection=await command('Page.addScriptToEvaluateOnNewDocument',{source:`Object.defineProperty(window,'indexedDB',{value:{open(){throw new DOMException('Denied','SecurityError')}}})`});
 try {
  await referenceDex('#species=68&scope=national','/pokemon-reader');
  assert.equal(await evaluate(`document.querySelector('#reference-title').textContent`),'Machamp');
  assert.equal(await evaluate(`document.querySelectorAll('.species-row').length`),493);
  assert.equal(await evaluate(`(async()=>{const img=document.querySelector('.pokemon-detail-header img');await img.decode();return img.naturalWidth>0&&new URL(img.src).pathname==='/pokemon-reader/assets/pokemon/hgss/68.png'})()`),true);
  assert.match(await evaluate(`document.querySelector('.secondary-nav a[aria-current="page"]').href`),/\/pokemon-reader\/pokedex\/$/);
  assert.match(await evaluate(`document.querySelector('#load-save').href`),/\/pokemon-reader\/#overview$/);
 }finally{await command('Page.removeScriptToEvaluateOnNewDocument',{identifier:injection.identifier});}
});
test('reference list and card fit phone/tablet/desktop themes, with keyboard-contained dialogs and a stationary menu/search block',async()=>{
 for(const theme of ['dark','light'])for(const width of [320,390,768,1440]){
  await command('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});
  await referenceDex('#scope=national','/pokemon-reader');
  await evaluate(`localStorage.setItem('pokemon-reader-theme',${JSON.stringify(theme)});window.dispatchEvent(new Event('pageshow'));document.querySelector('#species-list').scrollTop=1500`);
  assert.equal(await evaluate(`document.documentElement.scrollWidth<=innerWidth`),true,`List width ${width}`);
  assert.equal(await evaluate(`scrollY===0 && document.querySelector('#species-list').scrollTop===1500 && document.querySelector('.reference-top').getBoundingClientRect().bottom<=document.querySelector('#species-list').getBoundingClientRect().top`),true,'Only the list scrolls below the menu/search');
  await evaluate(`document.querySelector('[data-species-id="149"]').click()`);
  const fit=await evaluate(`(() => {const d=document.querySelector('#reference-detail'),r=d.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&d.scrollWidth<=d.clientWidth})()`);
  assert.equal(fit,true,`Card width ${width} ${theme}`);
  assert.equal(await evaluate(`document.activeElement.id`),'reference-close');
  await command('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
  await command('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9});
  assert.equal(await evaluate(`document.querySelector('#reference-detail').contains(document.activeElement)`),true);
  if(process.env.POKEDEX_SCREENSHOT_DIR&&[390,1440].includes(width)){
   const shot=await command('Page.captureScreenshot',{format:'png'});
   await require('node:fs/promises').writeFile(path.join(process.env.POKEDEX_SCREENSHOT_DIR,`pokedex-${theme}-${width}.png`),Buffer.from(shot.data,'base64'));
  }
 }
 await command('Emulation.clearDeviceMetricsOverride');
});

test('Pokédex search highlights stay inside the scrolling list while the menu/search stays stationary',async()=>{
 await command('Emulation.setDeviceMetricsOverride',{width:390,height:740,deviceScaleFactor:1,mobile:false});
 await referenceDex('#scope=national');
 const top=await evaluate(`document.querySelector('.reference-top').getBoundingClientRect().toJSON()`);
 await evaluate(`document.querySelector('#species-search').value='Horsea';document.querySelector('#reference-search').requestSubmit()`);
 await until(()=>evaluate(`document.querySelector('.search-match img').complete&&document.querySelector('.search-match img').naturalWidth>0`),'Visible list sprite loads after nested scrolling');
 const state=await evaluate(`(() => {const list=document.querySelector('#species-list'),r=list.getBoundingClientRect(),row=document.querySelector('.search-match').getBoundingClientRect();return {top:document.querySelector('.reference-top').getBoundingClientRect().toJSON(),windowY:scrollY,listY:list.scrollTop,listBottom:r.bottom,rowY:row.top,listYStart:r.top,hasHeader:!!document.querySelector('.app-header'),pageFits:document.documentElement.scrollHeight<=innerHeight,highlightOutline:getComputedStyle(document.querySelector('.search-match')).outlineStyle};})()`);
 assert.equal(state.top.top,top.top);assert.equal(state.windowY,0);assert.ok(state.listY>0);assert.ok(state.rowY>=state.listYStart);assert.ok(state.listBottom<=740);assert.equal(state.pageFits,true);assert.equal(state.hasHeader,false);assert.equal(state.highlightOutline,'none');
 if(process.env.POKEDEX_SCREENSHOT_DIR){const shot=await command('Page.captureScreenshot',{format:'png'});await require('node:fs/promises').writeFile(path.join(process.env.POKEDEX_SCREENSHOT_DIR,'pokedex-list-390.png'),Buffer.from(shot.data,'base64'));}
 await evaluate(`document.querySelector('#species-list').scrollTop+=1200`);
 assert.deepEqual(await evaluate(`document.querySelector('.reference-top').getBoundingClientRect().toJSON()`),state.top);
 assert.equal(await evaluate(`scrollY`),0);
 await command('Emulation.clearDeviceMetricsOverride');
});
test('Pokédex evolution paths place requirements above inline arrows, matchups use requested colors, and Horsea excludes Lugia notes',async()=>{
 for(const theme of ['dark','light']){
  await referenceDex('#species=149&scope=national');
  await evaluate(`localStorage.setItem('pokemon-reader-theme',${JSON.stringify(theme)});window.dispatchEvent(new Event('pageshow'))`);
  const colors=await evaluate(`(() => {const css=getComputedStyle(document.documentElement),grid=document.querySelector('.type-grid');return [...grid.children].map(n=>({type:n.dataset.type,mult:Number(n.dataset.multiplier),color:getComputedStyle(n.querySelector('strong')).color,expected:css.getPropertyValue(Number(n.dataset.multiplier)>=4?'--error':Number(n.dataset.multiplier)>1?'--warning':Number(n.dataset.multiplier)<1?'--success':'--text').trim()}));})()`);
  for(const row of colors){const expected=await evaluate(`(() => {const n=document.createElement('span');n.style.color=${JSON.stringify(row.expected)};document.body.append(n);const c=getComputedStyle(n).color;n.remove();return c;})()`);assert.equal(row.color,expected,`${theme} ${row.type} ×${row.mult}`);}
  assert.equal(colors.find(c=>c.type==='ice').mult,4);assert.equal(colors.find(c=>c.type==='ground').mult,0);
  const evo=await evaluate(`(() => {const chain=document.querySelector('.evolution-chain');return {stages:[...chain.querySelectorAll('.evolution-stage-name')].map(n=>n.textContent),requirements:[...chain.querySelectorAll('.evolution-requirement')].map(n=>n.textContent),above:[...chain.querySelectorAll('.evolution-link')].every(n=>n.querySelector('.evolution-requirement').getBoundingClientRect().bottom<=n.querySelector('.evolution-arrow').getBoundingClientRect().top),rows:document.querySelectorAll('.evolution-chain').length};})()`);
  assert.deepEqual(evo,{stages:['Dratini','Dragonair','Dragonite'],requirements:['Level 30','Level 55'],above:true,rows:1});
  await referenceDex('#species=116&scope=national');
  const horsea=await evaluate(`(() => {const d=[...document.querySelectorAll('.reference-locations details')].find(n=>n.querySelector('summary').textContent==='Whirl Islands');return d.textContent})()`);
  assert.doesNotMatch(horsea,/Lugia|Kimono|Silver Wing|Tidal Bell/);assert.match(horsea,/B2F · Surfing · Lv. 15–25 · All times · 60%/);
  if(process.env.POKEDEX_SCREENSHOT_DIR){
   await evaluate(`document.querySelector('.evolution-scroll').closest('details').scrollIntoView({block:'start'})`);
   const shot=await command('Page.captureScreenshot',{format:'png'});await require('node:fs/promises').writeFile(path.join(process.env.POKEDEX_SCREENSHOT_DIR,`pokedex-evolution-${theme}.png`),Buffer.from(shot.data,'base64'));
  }
 }
 // Branches remain individually readable rather than becoming false linear evolutions.
 await referenceDex('#species=133&scope=national');assert.equal(await evaluate(`document.querySelectorAll('.evolution-chain').length`),7);
 assert.equal(await evaluate(`[...document.querySelectorAll('.evolution-chain')].every(n=>n.querySelectorAll('.evolution-stage').length===2)`),true);
 // Long external-game requirements stay above arrows inside the horizontal region.
 await command('Emulation.setDeviceMetricsOverride',{width:320,height:700,deviceScaleFactor:1,mobile:false});
 await referenceDex('#species=470&scope=national');assert.equal(await evaluate(`document.querySelector('#reference-detail').scrollWidth<=document.querySelector('#reference-detail').clientWidth`),true);
 await command('Emulation.clearDeviceMetricsOverride');
});

test('Horsea round trip through Atlas closes back onto Horsea in the reference list',async()=>{
 await command('Emulation.setDeviceMetricsOverride',{width:390,height:740,deviceScaleFactor:1,mobile:false});
 await referenceDex('','/pokemon-reader');
 await evaluate(`document.querySelector('#species-search').value='Horsea';document.querySelector('#reference-search').requestSubmit();document.querySelector('[data-species-id="116"]').click()`);
 const atlasLink=await evaluate(`[...document.querySelectorAll('.reference-locations a')].find(a=>a.textContent.includes('Whirl Islands')).href`);
 await command('Page.navigate',{url:atlasLink});
 await until(()=>evaluate(`document.querySelector('.location-card h2')?.textContent==='Whirl Islands'`),'Whirl Islands destination');
 await evaluate(`[...document.querySelectorAll('.encounter-name')].find(a=>new URLSearchParams(new URL(a.href).hash.slice(1)).get('species')==='116').click()`);
 await until(()=>evaluate(`document.querySelector('#reference-detail')?.open&&document.querySelector('#reference-title').textContent==='Horsea'`),'Atlas Horsea card');
 await evaluate(`document.querySelector('#reference-close').click()`);
 await until(()=>evaluate(`!document.querySelector('#reference-detail').open`),'Closed linked Horsea card');
 const result=await evaluate(`(() => {const list=document.querySelector('#species-list'),row=document.querySelector('#species-116'),a=list.getBoundingClientRect(),b=row.getBoundingClientRect();return {visible:b.top>=a.top&&b.bottom<=a.bottom,highlight:row.classList.contains('search-match'),focused:document.activeElement.dataset.speciesId,offset:list.scrollTop,pageY:scrollY,path:location.pathname};})()`);
 assert.equal(result.visible,true);assert.equal(result.highlight,true);assert.equal(result.focused,'116');assert.ok(result.offset>0);assert.equal(result.pageY,0);assert.equal(result.path,'/pokemon-reader/pokedex/');
 await command('Emulation.clearDeviceMetricsOverride');
});
test('direct species and form links reveal their base species on Close or Escape, including the end of the list',async()=>{
 for(const {key,id} of [{key:116,id:116},{key:493,id:493},{key:496,id:386}]){
  // No explicit scope: out-of-regional entries must choose a list containing the species.
  await referenceDex(`#species=${key}`);
  assert.equal(await evaluate(`document.querySelector('#reference-detail').open`),true);
  if(key===493){
   await command('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
   await command('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
  }else await evaluate(`document.querySelector('#reference-close').click()`);
  await until(()=>evaluate(`!document.querySelector('#reference-detail').open`),'Closed direct card');
  const visible=await evaluate(`(() => {const list=document.querySelector('#species-list'),row=document.querySelector('#species-${id}'),a=list.getBoundingClientRect(),b=row.getBoundingClientRect();return b.top>=a.top&&b.bottom<=a.bottom&&row.classList.contains('search-match')&&document.activeElement.dataset.speciesId==='${id}';})()`);
  assert.equal(visible,true,`Linked species ${id} is visible and focused`);
 }
 // A regular regional browse can inspect a relative outside the regional Dex.
 // Its saved history must keep the original regional offset on Forward/Close.
 await referenceDex('#scope=regional');
 await evaluate(`document.querySelector('#species-search').value='Eevee';document.querySelector('#reference-search').requestSubmit()`);
 const originalY=await evaluate(`document.querySelector('#species-list').scrollTop`);
 await evaluate(`document.querySelector('[data-species-id="133"]').click();[...document.querySelectorAll('.evolution-stage')].find(n=>n.textContent==='Leafeon').click();document.querySelector('#reference-close').click()`);
 await until(()=>evaluate(`!document.querySelector('#reference-detail').open`),'Close regional family card');
 await evaluate(`history.forward()`);
 await until(()=>evaluate(`document.querySelector('#reference-detail').open&&document.querySelector('#reference-title').textContent==='Leafeon'`),'Forward to outside-regional family card');
 assert.equal(await evaluate(`document.querySelector('#reference-scope').value`),'regional');
 await evaluate(`document.querySelector('#reference-close').click()`);
 await until(()=>evaluate(`!document.querySelector('#reference-detail').open`),'Close restored family card');
 assert.equal(await evaluate(`document.querySelector('#species-list').scrollTop`),originalY);

});

let safariVisitNumber=0;
async function safariVisit(hash='#safari',prefix='') {
 await command('Page.navigate',{url:baseURL+prefix+'/pokedex-earth/?safariTest='+(++safariVisitNumber)+hash});
 await until(()=>evaluate(`document.querySelector('#safari-mini-atlas')?.dataset.safariReady==='true'&&!document.querySelector('#safari-mini-atlas').hidden&&!!document.querySelector('#safari-area-title')`),'Safari mini Atlas ready');
}
async function editSafari(position,area,{save=true}={}) {
 await evaluate(`document.querySelector('#safari-layout-editor').open=true`);
 await until(()=>evaluate(`document.querySelectorAll('#safari-layout-fields select').length===6`),'Manual layout fields');
 await evaluate(`(() => {const select=document.querySelector('[data-safari-edit-position="${position}"]');select.value='${area}';select.dispatchEvent(new Event('change'));})()`);
 if(save){await evaluate(`document.querySelector('#safari-layout-form').requestSubmit()`);await until(()=>evaluate(`!document.querySelector('#safari-layout-editor').open&&!document.querySelector('#safari-layout-save').disabled`),'Manual layout saved/applied');}
}
test('Safari Gate north enters the mini Atlas, all adjacent links preserve orientation and south-center exits back to Gate',async()=>{
 await command('Page.navigate',{url:baseURL+'/pokedex-earth/#location=Safari%20Zone%20Gate'});
 await until(()=>evaluate(`document.querySelector('.location-card h2')?.textContent==='Safari Zone Gate'`),'Safari Gate');
 await evaluate(`document.querySelector('.compass-north button').click()`);
 await until(()=>evaluate(`!document.querySelector('#safari-mini-atlas').hidden&&document.querySelector('#safari-mini-atlas').dataset.safariReady==='true'`),'Gate north mini Atlas');
 assert.equal(await evaluate(`document.querySelector('#safari-area-title').textContent`),'Peak');
 assert.match(await evaluate(`document.querySelector('#safari-layout-source').textContent`),/Example layout.*no active adventure/);
 const all=await evaluate(`(() => {const failures=[];for(let i=0;i<6;i++){
  document.querySelector('[data-safari-position="'+i+'"]').click();
  const col=i%3,row=Math.floor(i/3),expected={north:row?i-3:null,east:col<2?i+1:null,south:row===0?i+3:i===4?'gate':null,west:col?i-1:null};
  for(const [direction,target]of Object.entries(expected)){
   const button=document.querySelector('[data-safari-direction="'+direction+'"]');
   if(target===null){if(button)failures.push(i+direction+':unexpected');continue;}
   if(!button){failures.push(i+direction+':missing');continue;}
   if(target==='gate')continue;
   button.click();if(location.hash!=='#safari='+target)failures.push(i+direction+':wrong');
   document.querySelector('[data-safari-position="'+i+'"]').click();
  }
 }return failures;})()`);
 assert.deepEqual(all,[]);
 await evaluate(`document.querySelector('[data-safari-position="4"]').click();document.querySelector('[data-safari-direction="south"]').click()`);
 assert.equal(await evaluate(`document.querySelector('.location-card h2').textContent`),'Safari Zone Gate');
 assert.equal(await evaluate(`document.querySelector('#safari-mini-atlas').hidden`),true);
 await evaluate(`history.back()`);await until(()=>evaluate(`!document.querySelector('#safari-mini-atlas').hidden`),'Back to mini Atlas');
 assert.equal(await evaluate(`document.querySelector('#safari-area-title').textContent`),'Peak');
 assert.equal(await evaluate(`document.querySelectorAll('.secondary-nav a[href*="safari"]').length`),0,'Safari stays inside Atlas');
});
test('manual Safari layout swaps positions, persists separately per adventure and preserves original saves and Planner storage',async()=>{
 await safariVisit();
 await evaluate(`localStorage.setItem('pokemon-reader-soulsilver-team-planner-v1','original planner contents')`);
 await editSafari(0,2); // Reference layout: Savannah, not an assumed save layout.
 assert.equal(await evaluate(`document.querySelector('[data-safari-position="0"] strong').textContent`),'Savannah');
 await evaluate(`window.__beforeSafariReload=true`);await command('Page.reload');await until(()=>evaluate(`!window.__beforeSafariReload&&document.querySelector('#safari-mini-atlas')?.dataset.safariReady==='true'&&document.querySelector('[data-safari-position="0"] strong')?.textContent==='Savannah'`),'Manual reference layout persisted');
 const first=await evaluate(`(async()=>{const a=await import('/js/adventures.js');return(await a.persistSnapshot(a.createSnapshot(${JSON.stringify(fixture('Alpha'))},'alpha.sav'),{newAdventure:true})).id})()`);
 await until(()=>evaluate(`document.querySelector('#safari-layout-source').textContent.includes('Alpha')&&document.querySelector('[data-safari-position="0"] strong').textContent==='Plains'`),'Independent first adventure layout');
 const original=await evaluate(`(async()=>JSON.stringify(await(await import('/js/adventures.js')).getActiveProfile()))()`);
 await editSafari(0,10);
 assert.equal(await evaluate(`(async()=>JSON.stringify(await(await import('/js/adventures.js')).getActiveProfile()))()`),original);
 const second=await evaluate(`(async()=>{const a=await import('/js/adventures.js');return(await a.persistSnapshot(a.createSnapshot(${JSON.stringify(fixture('Beta'))},'beta.sav'),{newAdventure:true})).id})()`);
 assert.notEqual(first,second);
 await until(()=>evaluate(`document.querySelector('#safari-layout-source').textContent.includes('Beta')&&document.querySelector('[data-safari-position="0"] strong').textContent==='Plains'`),'Independent second adventure layout');
 await editSafari(0,3); // Peak already at entrance: swapping should move Plains there.
 assert.equal(await evaluate(`document.querySelector('[data-safari-position="4"] strong').textContent`),'Plains');
 assert.equal(await evaluate(`document.querySelector('[data-safari-position="0"] strong').textContent`),'Peak');
 await evaluate(`(async()=>{const a=await import('/js/adventures.js');await a.selectProfile(${JSON.stringify(first)});})()`);
 await until(()=>evaluate(`document.querySelector('[data-safari-position="0"] strong').textContent==='Mountain'`),'First layout restored');
 await evaluate(`(async()=>{const a=await import('/js/adventures.js');await a.clearActiveProfile();})()`);
 await until(()=>evaluate(`document.querySelector('[data-safari-position="0"] strong').textContent==='Savannah'`),'Reference layout remains separate');
 assert.equal(await evaluate(`localStorage.getItem('pokemon-reader-soulsilver-team-planner-v1')`),'original planner contents');
 const saved=await evaluate(`(async()=>{const a=await import('/js/adventures.js');return a.adventureTransaction(['settings'],'readonly',tx=>a.idbValue(tx.objectStore('settings').getAll()));})()`);
 assert.equal(saved.filter(r=>r.key.startsWith('safariManualLayout:')).length,3);
});
test('Safari area browsing presents every verified encounter and condition across all twelve areas with direct species links',async()=>{
 await safariVisit('#safari=0');
 const {safariReference,safariAreaEncounters}=await import('../js/data/safari-reference.js');
 for(const area of safariReference('soulsilver').areas){
  await editSafari(0,area.id);
  const expected=safariAreaEncounters('soulsilver',area.id);
  const result=await evaluate(`({name:document.querySelector('#safari-area-title').textContent,indices:[...new Set([...document.querySelectorAll('#safari-encounters .encounter-entry')].map(n=>Number(n.dataset.encounterIndex)))].sort((a,b)=>a-b),text:document.querySelector('#safari-encounters').textContent})`);
  assert.equal(result.name,area.name);assert.deepEqual(result.indices,expected.map(r=>r.sourceIndex));
  for(const row of expected){assert.ok(result.text.includes(row.rarity));assert.ok(result.text.includes(row.levels));}
 }
 assert.match(await evaluate(`document.querySelector('#safari-encounters .encounter-name').href`),/\/pokedex\/#species=\d+&scope=national$/);
 await command('Page.navigate',{url:baseURL+'/pokedex-earth/#location=Safari%20Zone'});
 await until(()=>evaluate(`document.querySelector('.location-card h2')?.textContent==='Safari Zone'`),'Preserved all-area Safari reference');
 assert.equal(await evaluate(`new Set([...document.querySelectorAll('.encounter-entry')].map(n=>n.dataset.encounterIndex)).size`),339);
});
test('Safari uses shared caught registrations and refreshes an updated save without resetting the current area or open encounters',async()=>{
 const data=atlasCaughtFixture();await fixtureReader(data);await command('Fetch.disable');await safariVisit('#safari=0');
 await until(()=>evaluate(`document.querySelector('#safari-encounters [data-species-id="19"] .caught-indicator')`),'Safari caught Rattata');
 await evaluate(`document.querySelector('#safari-encounters details').open=true;window.__safariSection=document.querySelector('#safari-encounters details')`);
 data.save.pokedex.allCaughtSpecies=[];data.save.pokedex.caughtSpecies=[];data.save.pokedex.caughtCount=0;data.save.pokedex.caughtPercent=0;
 await evaluate(`(async()=>{const a=await import('/js/adventures.js');const p=await a.getActiveProfile();await a.persistSnapshot(a.createSnapshot(${JSON.stringify(data)},'new.sav'),{profileId:p.id});})()`);
 await until(()=>evaluate(`!document.querySelector('#safari-encounters .caught-indicator')`),'Caught markers refresh');
 assert.equal(await evaluate(`window.__safariSection===document.querySelector('#safari-encounters details')&&window.__safariSection.open`),true);
 assert.equal(await evaluate(`document.querySelector('#safari-area-title').textContent`),'Plains');
});
test('Safari storage transactions reject stale and wrong-adventure edits without replacing a committed layout',async()=>{
 await safariVisit();
 const result=await evaluate(`(async()=>{const s=await import('/js/safari-store.js');const a=[0,7,1,5,3,6];const outcomes=await Promise.allSettled([s.saveSafariLayout('soulsilver',null,a,0),s.saveSafariLayout('soulsilver',null,[2,7,1,5,3,6],0)]);const saved=await s.loadSafariLayout('soulsilver');return {ok:outcomes.filter(o=>o.status==='fulfilled').length,errors:outcomes.filter(o=>o.status==='rejected').map(o=>o.reason.message),saved};})()`);
 assert.equal(result.ok,1);assert.match(result.errors[0],/another tab/);assert.equal(result.saved.revision,1);
 await evaluate(`(async()=>{const a=await import('/js/adventures.js');await a.persistSnapshot(a.createSnapshot(${JSON.stringify(fixture())},'profile.sav'),{newAdventure:true});})()`);
 const rejected=await evaluate(`(async()=>{const s=await import('/js/safari-store.js');try{await s.saveSafariLayout('soulsilver',null,[11,7,1,5,3,6],1);return false;}catch(e){return e.message;}})()`);
 assert.match(rejected,/active adventure changed/);
 assert.deepEqual(await evaluate(`(async()=>await(await import('/js/safari-store.js')).loadSafariLayout('soulsilver'))()`),result.saved);
});
test('Safari reference stays usable with denied storage and manual session changes preserve stored data',async()=>{
 await safariVisit();await editSafari(0,10);
 // A quota failure during a write also retains the last committed record.
 await evaluate(`globalThis.__safariOriginalPut=IDBObjectStore.prototype.put;IDBObjectStore.prototype.put=function(value,...args){if(this.name==='settings'&&value.key?.startsWith('safariManualLayout:'))throw new DOMException('Quota','QuotaExceededError');return globalThis.__safariOriginalPut.call(this,value,...args);}`);
 try {
  await editSafari(0,11);
  assert.match(await evaluate(`document.querySelector('#safari-layout-source').textContent`),/session only/);
  assert.deepEqual(await evaluate(`(async()=>{const s=await import('/js/safari-store.js');return(await s.loadSafariLayout('soulsilver')).areas;})()`),[10,7,1,5,3,6]);
 }finally{await evaluate(`IDBObjectStore.prototype.put=globalThis.__safariOriginalPut`);}
 await command('Page.enable');
 const injection=await command('Page.addScriptToEvaluateOnNewDocument',{source:`globalThis.__safariOriginalOpen=indexedDB.open;indexedDB.open=()=>{throw new DOMException('Denied','SecurityError')}`});
 try {
  await safariVisit();assert.match(await evaluate(`document.querySelector('#safari-layout-status').textContent`),/storage is unavailable/);
  await editSafari(0,11);assert.equal(await evaluate(`document.querySelector('[data-safari-position="0"] strong').textContent`),'Desert');
  assert.match(await evaluate(`document.querySelector('#safari-layout-source').textContent`),/session only/);
  await evaluate(`indexedDB.open=globalThis.__safariOriginalOpen`);
  assert.deepEqual(await evaluate(`(async()=>{const s=await import('/js/safari-store.js');return(await s.loadSafariLayout('soulsilver')).areas;})()`),[10,7,1,5,3,6]);
 }finally{await command('Page.removeScriptToEvaluateOnNewDocument',{identifier:injection.identifier});}
});
test('Safari mini Atlas keeps a true 3×2 grid, four compass slots, themes and repository paths at phone/tablet/desktop sizes',async()=>{
 for(const theme of ['dark','light'])for(const width of [320,390,768,1440]){
  await command('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});
  await safariVisit('#safari','/pokemon-reader');
  await evaluate(`localStorage.setItem('pokemon-reader-theme',${JSON.stringify(theme)});window.dispatchEvent(new Event('pageshow'))`);
  assert.equal(await evaluate(`document.documentElement.scrollWidth<=innerWidth`),true,`${theme} ${width}`);
  const geometry=await evaluate(`(() => {const r=[...document.querySelectorAll('[data-safari-position]')].map(n=>n.getBoundingClientRect());return r[0].top===r[1].top&&r[1].top===r[2].top&&r[3].top===r[4].top&&r[4].top===r[5].top&&r[0].left===r[3].left&&r[0].left<r[1].left&&r[1].left<r[2].left&&r[3].top>r[0].bottom;})()`);
  assert.equal(geometry,true);assert.equal(await evaluate(`document.querySelectorAll('#safari-compass>.compass-direction').length`),4);
  await editSafari(0,11,{save:false});
  assert.equal(await evaluate(`document.documentElement.scrollWidth<=innerWidth`),true,'Manual editor fits');
  await evaluate(`document.querySelector('#safari-layout-cancel').click()`);
  assert.equal(await evaluate(`document.querySelector('#load-save').href.endsWith('/pokemon-reader/#overview')`),true);
  if(process.env.SAFARI_SCREENSHOT_DIR&&[390,1440].includes(width)){
   await evaluate(`document.querySelector('#safari-area-title').scrollIntoView({block:'center'})`);
   const shot=await command('Page.captureScreenshot',{format:'png'});await require('node:fs/promises').writeFile(path.join(process.env.SAFARI_SCREENSHOT_DIR,`safari-${theme}-${width}.png`),Buffer.from(shot.data,'base64'));
  }
 }
 await command('Emulation.clearDeviceMetricsOverride');
});

test('Safari layout updates from another browser tab preserve scope and prevent stale editor overwrite',async()=>{
 await safariVisit('#safari=0');await editSafari(0,11,{save:false});
 const target=await command('Target.createTarget',{url:baseURL+'/tests/fixtures/reset.html'});
 try {
  const pages=await (await fetch(`http://${new URL(socket.url).host}/json/list`)).json();
  const other=new WebSocket(pages.find(page=>page.id===target.targetId).webSocketDebuggerUrl);
  await new Promise((resolve,reject)=>{other.addEventListener('open',resolve,{once:true});other.addEventListener('error',reject,{once:true});});
  const response=await new Promise((resolve,reject)=>{
   const timer=setTimeout(()=>reject(new Error('Other-tab Safari update timed out')),10000);
   other.addEventListener('message',event=>{const m=JSON.parse(event.data);if(m.id===1){clearTimeout(timer);resolve(m);}});
   other.send(JSON.stringify({id:1,method:'Runtime.evaluate',params:{expression:`(async()=>{const a=await import('/js/adventures.js');const s=await import('/js/safari-store.js');await s.saveSafariLayout('soulsilver',null,[10,7,1,5,3,6],0);a.notifyAdventureChange();return true;})()`,awaitPromise:true,returnByValue:true}}));
  });other.close();assert.equal(response.result?.exceptionDetails,undefined);
  await until(()=>evaluate(`document.querySelector('[data-safari-position="0"] strong').textContent==='Mountain'&&!document.querySelector('#safari-layout-editor').open`),'Other-tab manual layout did not refresh');
  assert.match(await evaluate(`document.querySelector('#safari-layout-status').textContent`),/unsaved edits were not applied/);
  assert.deepEqual(await evaluate(`(async()=>{const s=await import('/js/safari-store.js');return(await s.loadSafariLayout('soulsilver')).areas;})()`),[10,7,1,5,3,6]);
  assert.equal(await evaluate(`location.hash`),'#safari=0');
 }finally{await command('Target.closeTarget',{targetId:target.targetId});}
});

// A local PNG exercises decoding/layout deterministically; it is not presented as
// a downloaded Safari map. Original image URLs are checked independently above.
test('Safari maps follow all twelve area identities, open full size, fit both themes and recover from image errors',async()=>{
 safariMapFixture=(await readFile(path.join(root,'assets/maps/violet-city.png'))).toString('base64');
 await command('Fetch.enable',{patterns:[{urlPattern:'https://archives.bulbagarden.net/media/upload/*'}]});
 try {
  await safariVisit('#safari=0','/pokemon-reader');
  const {safariReference,safariAreaMap}=await import('../js/data/safari-reference.js');
  for(const area of safariReference('soulsilver').areas){
   await editSafari(0,area.id);
   await until(()=>evaluate(`document.querySelector('.safari-map')?.naturalWidth>0&&document.querySelector('.safari-map-status').hidden`),'Map fixture did not decode');
   const expected=safariAreaMap('soulsilver',area.id);
   const shown=await evaluate(`(()=>{const i=document.querySelector('.safari-map'),a=i.closest('a');return {src:i.src,href:a.href,alt:i.alt,target:a.target,rel:a.rel,referrer:i.referrerPolicy,source:document.querySelector('.safari-map-credit').href};})()`);
   assert.equal(shown.src,expected.imageUrl);assert.equal(shown.href,expected.imageUrl);
   assert.ok(shown.alt.startsWith(area.name+' area map'));assert.equal(shown.target,'_blank');assert.match(shown.rel,/noopener/);assert.equal(shown.referrer,'no-referrer');assert.equal(shown.source,expected.sourceUrl);
  }
  for(const theme of ['light','dark'])for(const width of [320,390,768,1440]){
   await command('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});
   await evaluate(`localStorage.setItem('pokemon-reader-theme',${JSON.stringify(theme)});window.dispatchEvent(new Event('pageshow'))`);
   assert.equal(await evaluate(`document.documentElement.scrollWidth<=innerWidth`),true,`${theme} ${width}`);
   assert.equal(await evaluate(`(()=>{const r=document.querySelector('.safari-map').getBoundingClientRect();return r.width>100&&r.right<=innerWidth&&r.height>0;})()`),true);
   assert.equal(await evaluate(`document.querySelectorAll('#safari-compass>.compass-direction').length`),4);
   if(process.env.SAFARI_SCREENSHOT_DIR&&[390,1440].includes(width)){
    await evaluate(`document.querySelector('#safari-area-title').scrollIntoView({block:'center'})`);
    const shot=await command('Page.captureScreenshot',{format:'png'});await require('node:fs/promises').writeFile(path.join(process.env.SAFARI_SCREENSHOT_DIR,`safari-map-fixture-${theme}-${width}.png`),Buffer.from(shot.data,'base64'));
   }
  }
  safariMapFailure=true;await editSafari(0,0);
  await until(()=>evaluate(`document.querySelector('.safari-map-link').hidden&&document.querySelector('.safari-map-status').textContent.includes('unavailable')`),'Missing-map fallback');
  assert.ok(await evaluate(`document.querySelector('.safari-map-credit').href.includes('Plains')`));
  await evaluate(`document.querySelector('[data-safari-direction="east"]').click()`);
  await until(()=>evaluate(`location.hash==='#safari=1'`),'Navigation survives image failure');
  safariMapFailure=false;await evaluate(`document.querySelector('[data-safari-direction="west"]').click()`);
  await until(()=>evaluate(`location.hash==='#safari=0'&&document.querySelector('.safari-map').naturalWidth>0&&!document.querySelector('.safari-map-link').hidden&&document.querySelector('.safari-map-status').hidden`),'Fresh area retries map after failure');
 }finally{
  await command('Fetch.disable');await command('Emulation.clearDeviceMetricsOverride');safariMapFixture=null;safariMapFailure=false;
 }
});
test('Safari shows only its short title above the map and repeated compass travel preserves the viewport',async()=>{
 safariMapFixture=(await readFile(path.join(root,'assets/maps/violet-city.png'))).toString('base64');
 await command('Fetch.enable',{patterns:[{urlPattern:'https://archives.bulbagarden.net/media/upload/*'}]});
 try {
  for(const width of [390,1440]){
   await command('Emulation.setDeviceMetricsOverride',{width,height:650,deviceScaleFactor:1,mobile:false});
   await safariVisit('#safari=4');
   await until(()=>evaluate(`document.querySelector('.safari-map')?.naturalWidth>0`),'Initial map');
   const layout=await evaluate(`(()=>{const p=document.querySelector('#safari-mini-atlas');return {title:p.querySelector('h2').textContent,first:p.children[1].id,sourceInEditor:!!p.querySelector('#safari-layout-editor #safari-layout-source'),mapBeforeGrid:!!(p.querySelector('#safari-compass').compareDocumentPosition(p.querySelector('#safari-area-grid'))&Node.DOCUMENT_POSITION_FOLLOWING)};})()`);
   assert.deepEqual(layout,{title:'Safari Zone',first:'safari-compass',sourceInEditor:true,mapBeforeGrid:true});
   await evaluate(`window.scrollTo(0,scrollY+document.querySelector('#safari-compass').getBoundingClientRect().top-20)`);
   const baseline=await evaluate(`({y:scrollY,top:document.querySelector('.safari-map-frame').getBoundingClientRect().top,height:document.querySelector('.safari-map-frame').getBoundingClientRect().height})`);
   assert.ok(baseline.y>0,'Test actually starts scrolled');
   for(const direction of ['north','east','south','west','north','west','south','east']){
    await evaluate(`document.querySelector('[data-safari-direction="${direction}"]').click()`);
    await until(()=>evaluate(`document.querySelector('.safari-map')?.naturalWidth>0`),'Next map');
    await evaluate(`new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))`);
    const now=await evaluate(`({y:scrollY,top:document.querySelector('.safari-map-frame').getBoundingClientRect().top,height:document.querySelector('.safari-map-frame').getBoundingClientRect().height})`);
    assert.ok(Math.abs(now.y-baseline.y)<=1,`${width} ${direction}: scroll changed ${baseline.y} -> ${now.y}`);
    assert.ok(Math.abs(now.top-baseline.top)<=1,'Map stays in the same viewport position');
    assert.ok(Math.abs(now.height-baseline.height)<=1,'Preview reserves the same height');
   }
   safariMapFailure=true;
   await evaluate(`document.querySelector('[data-safari-direction="north"]').click();const image=document.querySelector('.safari-map');image.src+='?testImageFailure=${width}'`);
   await until(()=>evaluate(`document.querySelector('.safari-map-link').hidden`),'Image error');
   assert.ok(Math.abs(await evaluate(`scrollY`)-baseline.y)<=1,'Image error does not jump');
   assert.ok(Math.abs(await evaluate(`document.querySelector('.safari-map-frame').getBoundingClientRect().height`)-baseline.height)<=1,'Image failure preserves preview space');
   safariMapFailure=false;
   if(process.env.SAFARI_SCREENSHOT_DIR){
    const shot=await command('Page.captureScreenshot',{format:'png'});await require('node:fs/promises').writeFile(path.join(process.env.SAFARI_SCREENSHOT_DIR,`safari-scroll-${width}.png`),Buffer.from(shot.data,'base64'));
   }
  }
 }finally{await command('Fetch.disable');await command('Emulation.clearDeviceMetricsOverride');safariMapFixture=null;safariMapFailure=false;}
});

test('Integrated Reader routes survive decoded restoration, reload and a cross-tool Back navigation',async()=>{
 await fixtureReader();await command('Fetch.disable');
 for(const view of ['party','storage','collection-details-info']){
  await command('Page.navigate',{url:baseURL+'/pokemon-reader/#'+view});
  await until(()=>evaluate(`document.querySelector('.app')?.dataset.saveLoaded==='true'`),'Decoded restoration');
  assert.equal(await evaluate(`location.hash`),'#'+view,'Restoration must retain the requested Reader route');
  assert.equal(await evaluate(`document.querySelector('.app').dataset.view`),view==='collection-details-info'?'collection':view);
  assert.equal(await evaluate(`globalThis.__parseCount||0`),0);
 }
 await command('Page.navigate',{url:baseURL+'/pokemon-reader/#party'});
 await until(()=>evaluate(`document.querySelector('.app')?.dataset.saveLoaded==='true'`),'Party restored');
 await evaluate(`document.querySelector('app-menu a[href*="team-planner/"]').click()`);
 await until(()=>evaluate(`document.querySelector('app-menu')?.getAttribute('tool')==='planner'`),'Planner');
 await evaluate(`history.back()`);
 await until(()=>evaluate(`document.querySelector('.app')?.dataset.saveLoaded==='true'`),'Return to Reader');
 assert.equal(await evaluate(`location.hash`),'#party');
 assert.equal(await evaluate(`document.querySelector('.app').dataset.view`),'party');
 await command('Page.reload');
 await until(()=>evaluate(`document.querySelector('.app')?.dataset.saveLoaded==='true'`),'Reload Reader');
 assert.equal(await evaluate(`location.hash`),'#party');
 await evaluate(`document.querySelector('#load-save').click()`);
 assert.equal(await evaluate(`location.hash`),'#overview');
 assert.equal(await evaluate(`document.querySelector('.app').dataset.saveLoaded`),'false');
 await evaluate(`(async()=>{await(await import('/js/adventures.js')).clearActiveProfile();})()`);
 await command('Page.navigate',{url:baseURL+'/pokemon-reader/#party'});
 await until(()=>evaluate(`document.querySelector('.app')?.dataset.adventureLoading==='false'`),'Empty startup completes');
 assert.equal(await evaluate(`location.hash`),'#overview','Without an active adventure, unavailable routes still fall back');
 assert.equal(await evaluate(`document.querySelector('.app').dataset.saveLoaded`),'false');
});

test('Planner URL changes and keyboard tab navigation keep panels and accessible selection synchronized',async()=>{
 await evaluate(`localStorage.removeItem('pokemon-reader-soulsilver-team-planner-v1')`);
 await command('Page.navigate',{url:baseURL+'/pokemon-reader/team-planner/#team'});
 await until(()=>evaluate(`!!document.querySelector('#team-grid .team-card')`),'Planner ready');
 await evaluate(`location.hash='hms'`);
 await until(()=>evaluate(`!document.querySelector('#panel-team').hidden && document.querySelector('#panel-hms').hidden`),'Legacy HM URL should open Main team');
 assert.equal(await evaluate(`document.querySelectorAll('.tabs .tab').length`),2);
 assert.equal(await evaluate(`document.querySelector('[data-tab="hms"], [data-tab="evs"]')`),null);
 assert.equal(await evaluate(`document.querySelector('.tabs').getAttribute('role')`),'tablist');
 for(const key of ['bench','team']){
  const state=await evaluate(`(()=>{const t=document.querySelector('[data-tab="${key}"]'),p=document.querySelector('#panel-${key}');return {role:t.getAttribute('role'),selected:t.getAttribute('aria-selected'),tabIndex:t.tabIndex,controls:t.getAttribute('aria-controls'),panelRole:p.getAttribute('role'),label:p.getAttribute('aria-labelledby'),id:t.id};})()`);
  assert.equal(state.role,'tab');assert.equal(state.selected,key==='team'?'true':'false');assert.equal(state.tabIndex,key==='team'?0:-1);assert.equal(state.controls,'panel-'+key);assert.equal(state.panelRole,'tabpanel');assert.equal(state.label,state.id);
 }
 await evaluate(`document.querySelector('[data-tab="team"]').focus()`);
 for(const [key,expected]of [['ArrowRight','bench'],['End','bench'],['ArrowRight','team'],['Home','team'],['ArrowLeft','bench']]){
  await command('Input.dispatchKeyEvent',{type:'keyDown',key});await command('Input.dispatchKeyEvent',{type:'keyUp',key});
  assert.equal(await evaluate(`document.activeElement.dataset.tab`),expected);
  assert.equal(await evaluate(`location.hash`),'#'+expected);
  assert.equal(await evaluate(`document.querySelector('[aria-selected="true"]').dataset.tab`),expected);
  assert.equal(await evaluate(`document.querySelector('#panel-${expected}').hidden`),false);
 }
 await evaluate(`location.hash='evs'`);await until(()=>evaluate(`!document.querySelector('#panel-team').hidden && document.querySelector('#panel-evs').hidden`),'Legacy EV URL opens Main team');
 await evaluate(`history.back()`);await until(()=>evaluate(`location.hash==='#bench'&&!document.querySelector('#panel-bench').hidden`),'Planner Back');
 await evaluate(`history.forward()`);await until(()=>evaluate(`location.hash==='#evs'&&!document.querySelector('#panel-team').hidden`),'Planner Forward');
 const originalPlans=await evaluate(`(async()=>JSON.stringify(await(await import('/js/planner-store.js')).listPlanners()))()`);
 await evaluate(`document.querySelector('#reset-btn').click()`);
 await until(()=>evaluate(`document.querySelector('#confirm-dialog').open`),'Reset confirmation');
 const tree=await command('Accessibility.getFullAXTree');
 assert.ok(tree.nodes.some(n=>n.role?.value==='dialog'&&n.name?.value==="Reset this planner's manual progress?"),'Reset dialog has an accessible name');
 await command('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
 await command('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
 await until(()=>evaluate(`!document.querySelector('#confirm-dialog').open`),'Cancel with Escape');
 assert.equal(await evaluate(`(async()=>JSON.stringify(await(await import('/js/planner-store.js')).listPlanners()))()`),originalPlans,'Cancel preserves all planners');
});

test('Integrated Pages-path journey keeps two adventures intact across all four tools, themes, sizes and cross-page history',async()=>{
 // Previous isolated cases deliberately leave malformed legacy text. Seed a valid
 // backup here so this journey tests persistent integration, not session fallback.
 const legacy=await evaluate(`(async()=>{const raw=JSON.stringify((await import('/js/planner-model.js')).defaultProgress());localStorage.setItem('pokemon-reader-soulsilver-team-planner-v1',raw);return raw;})()`);
 await fixtureReader(atlasCaughtFixture());await command('Fetch.disable');
 const context=await evaluate(`(async()=>{const a=await import('/js/adventures.js');const first=await a.getActiveProfile();await a.persistSnapshot(a.createSnapshot(${JSON.stringify(fixture('Second trainer'))},'second.sav'),{newAdventure:true});await a.selectProfile(first.id);return {id:first.id,profiles:JSON.stringify(await a.listProfiles())};})()`);
 try {
  for(const theme of ['dark','light'])for(const width of [320,768,1440]){
   await command('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<800});
   await command('Page.navigate',{url:baseURL+'/pokemon-reader/#party'});
   await until(()=>evaluate(`document.querySelector('.app')?.dataset.view==='party'&&document.querySelector('.app').dataset.saveLoaded==='true'`),'Reader party restored');
   await evaluate(`localStorage.setItem('pokemon-reader-theme',${JSON.stringify(theme)});dispatchEvent(new StorageEvent('storage',{key:'pokemon-reader-theme'}))`);
   for(const tool of ['reader','planner','atlas','pokedex']){
    if(tool!=='reader'){
     const destination={planner:'team-planner/',atlas:'pokedex-earth/',pokedex:'pokedex/'}[tool];
     await evaluate(`setTimeout(()=>document.querySelector('app-menu a[href$="${destination}"]').click(),0);true`);
     await until(()=>evaluate(`document.querySelector('app-menu')?.getAttribute('tool')===${JSON.stringify(tool)}`),'Menu to '+tool);
    }
    if(tool==='planner'){
     await until(()=>evaluate(`document.querySelector('#planner-adventure').value===${JSON.stringify(context.id)}`),'Planner adventure shared');
     await evaluate(`document.querySelector('[data-tab="team"]').click()`);
    }
    if(tool==='atlas'){
     await evaluate(`location.hash='location=Route%2029'`);
     await until(()=>evaluate(`document.querySelector('.location-card [data-species-id="19"] .caught-indicator')`),'Atlas caught flag shared');
    }
    if(tool==='pokedex')await until(()=>evaluate(`document.body.dataset.referenceReady==='true'`),'Reference ready');
    const state=await evaluate(`({theme:document.documentElement.dataset.theme,fit:document.documentElement.scrollWidth<=innerWidth,links:[...document.querySelectorAll('app-menu a')].map(a=>a.pathname),current:[...document.querySelectorAll('app-menu [aria-current="page"]')].map(a=>a.textContent)})`);
    assert.equal(state.theme,theme);assert.equal(state.fit,true,`${tool} ${width} ${theme}`);
    assert.ok(state.links.every(link=>link.startsWith('/pokemon-reader/')));
    if(tool!=='reader')assert.equal(state.current.length,1);
    if(process.env.INTEGRATION_SCREENSHOT_DIR&&[320,1440].includes(width)){
     const shot=await command('Page.captureScreenshot',{format:'png'});await require('node:fs/promises').writeFile(path.join(process.env.INTEGRATION_SCREENSHOT_DIR,`${tool}-${theme}-${width}.png`),Buffer.from(shot.data,'base64'));
    }
   }
   await evaluate(`setTimeout(()=>history.back(),0);true`);
   await until(()=>evaluate(`document.querySelector('app-menu')?.getAttribute('tool')==='atlas'&&document.querySelector('.location-card h2')?.textContent==='Route 29'`),'Back to Atlas location');
   await until(()=>evaluate(`document.querySelector('.location-card [data-species-id="19"] .caught-indicator')`),'Back restores registrations');
   await evaluate(`setTimeout(()=>history.forward(),0);true`);
   await until(()=>evaluate(`document.querySelector('app-menu')?.getAttribute('tool')==='pokedex'&&document.body.dataset.referenceReady==='true'`),'Forward to reference');
   await evaluate(`setTimeout(()=>document.querySelector('#load-save').click(),0);true`);
   await until(()=>evaluate(`document.querySelector('.app')?.dataset.saveLoaded==='true'`),'Menu returns to Reader');
   assert.equal(await evaluate(`location.pathname+location.hash`),'/pokemon-reader/#overview');
   assert.equal(await evaluate(`globalThis.__parseCount||0`),0);
   const after=await evaluate(`(async()=>{const a=await import('/js/adventures.js');return {id:(await a.getActiveProfile()).id,profiles:JSON.stringify(await a.listProfiles())};})()`);
   assert.deepEqual(after,context,'Navigation must not replace or merge adventures');
   assert.equal(await evaluate(`localStorage.getItem('pokemon-reader-soulsilver-team-planner-v1')`),legacy,'Original legacy backup is preserved');
  }
 }finally{await command('Emulation.clearDeviceMetricsOverride');}
 assert.deepEqual(exceptions,[]);
});

test('Planner compact cards expose combined details, exclusive nature checks and contextual gear settings',async()=>{
  const data=plannedParty();data.storage.boxes.forEach(b=>b.pokemon=b.pokemon.map(p=>({slot:p.slot,empty:true})));await openLinkedPlanner(data);
  assert.equal(await evaluate(`document.querySelector('.hero .eyebrow')`),null);
  await evaluate(`document.querySelector('.app-info summary').focus()`);
  assert.equal(await evaluate(`document.querySelector('.info-tooltip').getBoundingClientRect().height>0 && getComputedStyle(document.querySelector('.info-tooltip')).display!=='none'`),true,'Info hint should be visible on keyboard focus');
  await evaluate(`document.querySelector('.app-info summary').blur()`);
  assert.equal(await evaluate(`document.querySelectorAll('.team-card:not([open])').length`),6);
  await until(()=>evaluate(`Array.from(document.querySelectorAll('.team-card .member-button img')).every(img=>img.complete&&img.naturalWidth>0)`),'Planner sprites did not decode locally');
  assert.equal(await evaluate(`document.querySelector('.team-card[data-member="dragonite"] .member-button img').getAttribute('src').endsWith('/148.png')`),true);
  assert.equal(await evaluate(`document.querySelector('.team-card[data-member="kingdra"] .member-button img').classList.contains('unowned-sprite')`),true);
  assert.equal(await evaluate(`document.querySelector('#team-pokemon-kingdra').disabled`),true);
  assert.equal(await evaluate(`document.querySelector('#team-pokemon-kingdra').selectedOptions[0].textContent`),'No eligible Pokémon found');
  await evaluate(`document.querySelector('#member-kingdra').click()`);
  await until(()=>evaluate(`document.querySelector('#member-dialog').open`),'Card did not open');
  assert.equal(await evaluate(`Array.from(document.querySelectorAll('#member-content .member-details > h3')).map(e=>e.textContent).join('|')`),'Main team|HM plan|EV training');
  await evaluate(`document.getElementById('nature-kingdra:15').click()`);
  await until(()=>currentPlan(`plan.state.natures['kingdra:15']===true`),'Manual nature did not persist');
  await evaluate(`document.getElementById('nature-kingdra:10').click()`);
  await until(()=>currentPlan(`plan.state.natures['kingdra:10']===true && plan.state.natures['kingdra:15']===false`),'Nature priority checks were not exclusive');
  await evaluate(`document.getElementById('ability-kingdra').click()`);
  await until(()=>currentPlan('plan.state.abilities.kingdra===true'),'Manual ability did not persist');
  assert.equal(await evaluate(`document.querySelector('#member-dialog').open`),true);
  assert.equal(await evaluate(`(()=>{const ids=Array.from(document.querySelectorAll('[id]')).map(e=>e.id);return ids.length===new Set(ids).size;})()`),true,'Duplicate control IDs');
  await evaluate(`document.querySelector('#member-close').click();document.querySelector('#settings-toggle').click()`);
  assert.equal(await evaluate(`document.querySelector('#app-settings').open && document.querySelector('#app-settings').contains(document.querySelector('#export-btn')) && document.querySelector('#app-settings').contains(document.querySelector('#planner-select'))`),true);
  for(const width of [320,390,768,1440]){
    await command('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:width<800});
    for(const theme of ['light','dark']){
      await evaluate(`localStorage.setItem('pokemon-reader-theme','${theme}');dispatchEvent(new StorageEvent('storage',{key:'pokemon-reader-theme'}));`);
      assert.equal(await evaluate(`document.documentElement.scrollWidth<=innerWidth && document.querySelector('#app-settings').scrollWidth<=document.querySelector('#app-settings').clientWidth`),true,'Settings overflow '+width+theme);
    }
  }
  await evaluate(`document.querySelector('#app-settings').close();document.querySelector('#member-kingdra').click()`);
  for(const width of [320,390,768,1440]){
    await command('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:width<800});
    assert.equal(await evaluate(`document.documentElement.scrollWidth<=innerWidth && document.querySelector('#member-dialog').scrollWidth<=document.querySelector('#member-dialog').clientWidth`),true,'Details overflow '+width);
    if(process.env.PLANNER_SCREENSHOT_DIR && [390,1440].includes(width)){
      await evaluate(`scrollTo(0,0)`);const shot=await command('Page.captureScreenshot',{format:'png'});
      await require('node:fs/promises').writeFile(path.join(process.env.PLANNER_SCREENSHOT_DIR,`planner-new-${width}.png`),Buffer.from(shot.data,'base64'));
    }
  }
  await command('Emulation.clearDeviceMetricsOverride');
  await command('Page.reload');
  await until(()=>evaluate(`document.getElementById('nature-kingdra:10')?.checked && document.getElementById('ability-kingdra')?.checked`),'New checks were not restored');
  assert.deepEqual(exceptions,[]);
});

test('Planner popup keeps compact identities, concise sections, nature descriptions and keyboard focus across save updates',async()=>{
  const data=plannedParty();await openLinkedPlanner(data);
  const card=await evaluate(`(()=>{const c=document.querySelector('#member-dragonite');return {name:c.querySelector('.card-name').textContent,level:c.querySelector('.species').textContent,types:c.querySelector('.type-badges').textContent};})()`);
  assert.deepEqual(card,{name:'Mordecai',level:'Level 10',types:'Dragon'});
  assert.equal(await evaluate(`document.querySelector('#member-dragonite .card-species').textContent`),'Dragonite','Keep the planned species label under the sprite');
  assert.equal(await evaluate(`document.querySelector('#member-kingdra .card-name').textContent`),'Planned');
  assert.equal(await evaluate(`document.querySelector('#member-kingdra .species').textContent`),'No linked Pokémon');
  await command('Page.bringToFront');
  await evaluate(`document.querySelector('#member-dragonite').focus()`);
  await command('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,text:'\r'});
  await command('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
  await until(()=>evaluate(`document.querySelector('#member-dialog').open`),'Keyboard did not open popup');
  assert.equal(await evaluate(`document.activeElement.id`),'member-close');
  assert.equal(await evaluate(`document.querySelector('#member-content .pokemon-tracking').open`),false);
  assert.equal(await evaluate(`document.querySelector('#member-content .status-pill')`),null);
  assert.equal(await evaluate(`document.querySelector('#member-content .checkline:has(#ability-dragonite)').textContent`),'Planned ability: Inner Focus');
  assert.equal(await evaluate(`document.querySelector('#member-content').textContent.includes('Nature priority:') || document.querySelector('#member-content').textContent.includes('Temporary HMs:')`),false);
  await evaluate(`document.querySelector('#member-content .info-button').focus()`);
  assert.equal(await evaluate(`getComputedStyle(document.querySelector('#member-content .nature-overlay')).display`),'block');
  const descriptions=await evaluate(`document.querySelector('#member-content .nature-overlay').textContent`);
  assert.ok(descriptions.includes('Adamant: +10% Attack · −10% Special Attack'));
  assert.ok(descriptions.includes('Jolly: +10% Speed · −10% Special Attack'));
  assert.equal(await evaluate(`document.querySelectorAll('#member-content .hm-owner, #member-content .hm-actual').length`),0);
  assert.equal(await evaluate(`document.querySelector('#member-content .stack').textContent.includes('Currently knows')`),false);
  const ev=await evaluate(`document.querySelector('#member-content .ev-card').textContent`);
  assert.ok(!ev.includes('Target:') && !ev.includes('Current:') && ev.includes('Total:'));
  assert.equal(await evaluate(`document.querySelector('#member-content .ev-total').textContent`),`Total: ${Object.values(data.party[1].evs).reduce((n,v)=>n+v,0)} / 510 EVs`);
  data.party[1].nickname='Mordecai updated';await plannerSave(data);
  await until(()=>evaluate(`document.querySelector('#member-content > .card-identity .card-name')?.textContent==='Mordecai updated'`),'Popup did not refresh saved identity');
  assert.equal(await evaluate(`document.querySelector('#member-dialog').open`),true);
  for(const width of [320,390,768,1440])for(const theme of ['dark','light']){
    await command('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:width<800});
    await evaluate(`localStorage.setItem('pokemon-reader-theme','${theme}');dispatchEvent(new StorageEvent('storage',{key:'pokemon-reader-theme'}));document.querySelector('#member-close').focus();document.querySelector('#member-dialog').scrollTop=0`);
    assert.equal(await evaluate(`document.querySelector('#member-dialog').scrollWidth<=document.querySelector('#member-dialog').clientWidth && document.documentElement.scrollWidth<=innerWidth`),true,width+' '+theme);
    if(process.env.PLANNER_SCREENSHOT_DIR && [390,1440].includes(width)){
      const shot=await command('Page.captureScreenshot',{format:'png'});
      await require('node:fs/promises').writeFile(path.join(process.env.PLANNER_SCREENSHOT_DIR,`planner-popup-${width}-${theme}.png`),Buffer.from(shot.data,'base64'));
      await evaluate(`document.querySelector('#member-content .ev-card').scrollIntoView({block:'end'})`);
      const lower=await command('Page.captureScreenshot',{format:'png'});
      await require('node:fs/promises').writeFile(path.join(process.env.PLANNER_SCREENSHOT_DIR,`planner-popup-sections-${width}-${theme}.png`),Buffer.from(lower.data,'base64'));
    }
  }
  await command('Emulation.clearDeviceMetricsOverride');
  await evaluate(`document.querySelector('#member-close').focus()`);
  await command('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',modifiers:8});
  await command('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',modifiers:8});
  assert.equal(await evaluate(`document.querySelector('#member-dialog').contains(document.activeElement)`),true,'Focus escaped the modal');
  await command('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
  await command('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
  await until(()=>evaluate(`!document.querySelector('#member-dialog').open && document.activeElement.id==='member-dragonite'`),'Escape did not restore card focus');
  assert.deepEqual(exceptions,[]);
});

test('Planner shows boxed levels, adds only the current nonpreferred nature, removes main HM notes and resets new-popup scroll',async()=>{
  const data=plannedParty();
  const typhlosion={...structuredClone(data.party[0]),speciesId:157,personality:9871,slot:1,recordKind:'storage',level:null,experience:117360,natureId:5,nickname:'Boxed Typhlosion'};
  data.storage.boxes[0].pokemon[0]=typhlosion;
  await openLinkedPlanner(data);
  await evaluate(`var s=document.querySelector('#team-pokemon-typhlosion');s.value='storage:1:1';s.dispatchEvent(new Event('change'));`);
  await until(()=>evaluate(`document.querySelector('#member-typhlosion .species')?.textContent==='Level 50'`),'Boxed level was not derived from experience');
  await evaluate(`document.querySelector('#member-typhlosion').click()`);
  assert.equal(await evaluate(`document.querySelector('#member-dialog').scrollTop`),0);
  assert.equal(await evaluate(`document.getElementById('nature-typhlosion:5').checked && document.getElementById('nature-typhlosion:5').disabled`),true);
  assert.equal(await evaluate(`document.querySelector('#member-content .current-nature em').textContent.includes('not on the preferred list')`),true);
  assert.deepEqual(await currentPlan(`plan.goals.team.find(m=>m.id==='typhlosion').natureIds`),[10,15]);
  await evaluate(`document.querySelector('#member-content .info-button').focus()`);
  assert.ok((await evaluate(`document.querySelector('#member-content .nature-overlay').textContent`)).includes('Bold: +10% Defense · −10% Attack'));
  if(process.env.PLANNER_SCREENSHOT_DIR){
    await command('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
    await evaluate(`document.querySelector('#member-content .current-nature').scrollIntoView({block:'center'});document.querySelector('#member-content .info-button').focus()`);
    const shot=await command('Page.captureScreenshot',{format:'png'});
    await require('node:fs/promises').writeFile(path.join(process.env.PLANNER_SCREENSHOT_DIR,'planner-current-nature.png'),Buffer.from(shot.data,'base64'));
    await command('Emulation.clearDeviceMetricsOverride');
  }
  assert.equal(await evaluate(`document.querySelector('#member-content .member-details').textContent.includes('Cut is a sacrifice/navigation move.')`),false);
  assert.equal(await evaluate(`document.querySelector('#member-content .member-details').textContent.includes('Shadow Ball was discussed but is not locked in.')`),true);
  await evaluate(`document.querySelector('#member-content .ev-card').scrollIntoView({block:'end'})`);
  assert.equal(await evaluate(`document.querySelector('#member-dialog').scrollTop>0`),true);
  await evaluate(`document.querySelector('#member-close').click()`);
  await until(()=>evaluate(`!document.querySelector('#member-dialog').open`),'Close');
  await evaluate(`document.querySelector('#member-dragonite').click()`);
  assert.equal(await evaluate(`document.querySelector('#member-dialog').scrollTop`),0,'A different member must start at the top');
  assert.equal(await evaluate(`document.querySelector('#member-content .member-details').textContent.includes('Waterfall is exploration-only.')`),false);
  assert.equal(await evaluate(`document.querySelector('#member-content .member-details').textContent.includes('Dragon Dance should be learned before evolving Dragonair at level 55.')`),true);
  await evaluate(`document.querySelector('#member-close').click()`);
  await until(()=>evaluate(`!document.querySelector('#member-dialog').open`),'Close Dragonite');
  typhlosion.natureId=10;await plannerSave(data);
  await until(()=>evaluate(`!document.getElementById('nature-typhlosion:5') && document.getElementById('nature-typhlosion:10').checked`),'Outdated current-nature option remained');
  await evaluate(`document.querySelector('#member-typhlosion').click()`);
  assert.equal(await evaluate(`document.querySelector('#member-dialog').scrollTop`),0,'Reopening also starts at top');
  assert.equal(await evaluate(`document.querySelector('#member-content .current-nature')`),null);
  assert.deepEqual(exceptions,[]);
});

test('Interior maps and travel badges remain informative without locking reference navigation',async()=>{
 for(const width of [320,390,1440]){
  await command('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:width<800});
  await atlas({directory:false});
  const first=await evaluate(`(()=>{const b=document.querySelector('.compass-east button');return {name:b.textContent,described:document.getElementById(b.getAttribute('aria-describedby')).textContent,icon:!!b.querySelector('.travel-icon-surf'),enabled:!b.disabled,fit:document.documentElement.scrollWidth<=innerWidth};})()`);
  assert.equal(first.name,'Route 27');assert.match(first.described,/Surf.*Fog Badge/);assert.equal(first.icon,true);assert.equal(first.enabled,true);assert.equal(first.fit,true);
  await evaluate(`document.querySelector('.travel-conditions summary').click()`);
  assert.equal(await evaluate(`document.querySelector('.travel-conditions').open`),true);
  if(process.env.ATLAS_SCREENSHOT_DIR&&width!==320){
   await evaluate(`document.querySelector('.location-connections').scrollIntoView()`);const shot=await command('Page.captureScreenshot',{format:'png'});
   await require('node:fs/promises').writeFile(path.join(process.env.ATLAS_SCREENSHOT_DIR,'travel-new-bark-'+width+'.png'),Buffer.from(shot.data,'base64'));
  }
  await evaluate(`location.hash='location=Violet%20City'`);
  await until(()=>evaluate(`document.querySelector('.location-card h2')?.textContent==='Violet City'`),'Violet interiors');
  const encounters=await evaluate(`document.querySelector('.location-encounters').textContent`);
  await evaluate(`(()=>{const s=document.querySelector('.map-select');s.value=String([...s.options].findIndex(o=>o.textContent==='Gym'));s.dispatchEvent(new Event('change'));})()`);
  await until(()=>evaluate(`document.querySelector('.location-map').naturalWidth>0 && document.querySelector('.location-map-link').href.includes('violet-gym')`),'Gym map');
  assert.equal(await evaluate(`document.querySelector('.location-encounters').textContent`),encounters);
  assert.equal(await evaluate(`document.documentElement.scrollWidth<=innerWidth`),true);
  if(process.env.ATLAS_SCREENSHOT_DIR&&width!==320){
   await evaluate(`document.querySelector('.map-controls').scrollIntoView()`);const shot=await command('Page.captureScreenshot',{format:'png'});
   await require('node:fs/promises').writeFile(path.join(process.env.ATLAS_SCREENSHOT_DIR,'violet-gym-'+width+'.png'),Buffer.from(shot.data,'base64'));
  }
  await evaluate(`(()=>{const s=document.querySelector('.map-select');s.value=String([...s.options].findIndex(o=>o.textContent.includes('Pokémon Center')));s.dispatchEvent(new Event('change'));})()`);
  assert.equal(await evaluate(`document.querySelector('.map-reference-note').hidden`),false);
  assert.match(await evaluate(`document.querySelector('.map-reference-note').textContent`),/Shared HGSS room/);
  await evaluate(`document.querySelector('#location-search-panel').open=true;document.querySelector('#location-search').value='Global Terminal';document.querySelector('#location-search').dispatchEvent(new Event('input'))`);
  assert.ok((await evaluate(`[...document.querySelectorAll('.location-card h2')].map(e=>e.textContent)`)).includes('Goldenrod City'));
 }
 await command('Emulation.clearDeviceMetricsOverride');assert.deepEqual(exceptions,[]);
});

test('Missing-room terrain plans load with their source and caveat on phones and desktop',async()=>{
 for(const width of [320,390,1440]){
  await command('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:width<800});
  await atlas({directory:false});
  for(const [town,room] of [['Azalea Town','Kurt’s house'],['Cianwood City','Pharmacy'],['Ecruteak City','Dance Theater'],['New Bark Town','Southwest House'],['Magnet Train Station','Station · 1F']]){
   await evaluate(`location.hash='location='+encodeURIComponent(${JSON.stringify(town)})`);
   await until(()=>evaluate(`document.querySelector('.location-card h2')?.textContent===${JSON.stringify(town)}`),'Room location');
   const encounters=await evaluate(`document.querySelector('.location-encounters').textContent`);
   await evaluate(`(()=>{const s=document.querySelector('.map-select');s.value=String([...s.options].findIndex(o=>o.textContent===${JSON.stringify(room+' · terrain plan')}));s.dispatchEvent(new Event('change'));})()`);
   await until(()=>evaluate(`document.querySelector('.location-map').complete&&document.querySelector('.location-map').naturalWidth>0`),'Terrain plan image');
   const state=await evaluate(`({note:document.querySelector('.map-reference-note').textContent,alt:document.querySelector('.location-map').alt,source:document.querySelector('[data-map-source]').href,link:document.querySelector('.location-map-link').href,image:document.querySelector('.location-map').src,fit:document.documentElement.scrollWidth<=innerWidth,encounters:document.querySelector('.location-encounters').textContent})`);
   assert.match(state.note,/Game-data terrain plan/);assert.ok(state.note.includes(town+' as a whole'));assert.match(state.alt,/static blocked tiles and exits/);
   assert.match(state.source,/github.com\/pret\/pokeheartgold\/blob\/d2355244/);assert.equal(state.link,state.image);assert.equal(state.fit,true);assert.equal(state.encounters,encounters);
   if(process.env.ATLAS_SCREENSHOT_DIR&&width!==320){
    await evaluate(`document.querySelector('.map-controls').scrollIntoView()`);const shot=await command('Page.captureScreenshot',{format:'png'});
    await require('node:fs/promises').writeFile(path.join(process.env.ATLAS_SCREENSHOT_DIR,`interior-${town.replaceAll(' ','-')}-${width}.png`),Buffer.from(shot.data,'base64'));
   }
   // Returning to the location image clears the interior caveat and restores its source.
   await evaluate(`document.querySelector('.map-select').value='0';document.querySelector('.map-select').dispatchEvent(new Event('change'))`);
   assert.equal(await evaluate(`document.querySelector('.map-reference-note').hidden`),true);
   assert.match(await evaluate(`document.querySelector('[data-map-source]').href`),/archives.bulbagarden.net/);
  }
 }
 await command('Emulation.clearDeviceMetricsOverride');assert.deepEqual(exceptions,[]);
});

test('Whirl letters align with every entrance ladder and follow all six pairs in both directions',async()=>{
 const pairs=[['A',0],['B',1],['C',1],['D',2],['E',2],['F',3]];
 for(const width of [320,390,1440]){
  await command('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:width<800});
  await atlas({directory:false});
  await evaluate(`location.hash='location=Whirl%20Islands'`);
  await until(()=>evaluate(`document.querySelector('.location-card h2')?.textContent==='Whirl Islands'`),'Whirl stairs');
  const encounters=await evaluate(`document.querySelector('.location-encounters').textContent`);
  for(const [letter,index] of pairs){
   await evaluate(`document.querySelector('.map-select').value='${index}';document.querySelector('.map-select').dispatchEvent(new Event('change'))`);
   await until(()=>evaluate(`document.querySelector('.location-map').complete&&document.querySelector('.location-map').naturalWidth>0`),'Whirl entrance image');
   // Compare marker centres with object-fit's painted rectangle, not the image element's letterbox.
   const alignment=await evaluate(`(async()=>{
    const {mapLinksForLocation}=await import('/js/data/atlas-map-links.js');const {mapsForLocation}=await import('/js/data/atlas-maps.js');
    const map=mapsForLocation('soulsilver','Whirl Islands')[${index}];const image=document.querySelector('.location-map');const r=image.getBoundingClientRect();
    const scale=Math.min(r.width/map.width,r.height/map.height);const x=r.left+(r.width-map.width*scale)/2;const y=r.top+(r.height-map.height*scale)/2;
    return mapLinksForLocation('soulsilver','Whirl Islands').pairs.filter(p=>p.ends.some(e=>e.mapId===map.id)).map(p=>{
     const e=p.ends.find(e=>e.mapId===map.id);const b=document.querySelector('.map-marker-viewport [data-stair="'+p.id+'"]').getBoundingClientRect();
     return Math.max(Math.abs(b.left+b.width/2-x-e.x*scale),Math.abs(b.top+b.height/2-y-e.y*scale));
    });
   })()`);
   assert.ok(alignment.every(error=>error<1),`${width}px entrance ${letter}: ${alignment}`);
   await evaluate(`document.querySelector('.map-marker-viewport [data-stair="${letter}"]').click()`);
   assert.equal(await evaluate(`document.querySelector('.map-select').value`),'4');
   assert.equal(await evaluate(`document.querySelectorAll('.map-marker-viewport [data-stair]').length`),8);
   assert.equal(await evaluate(`document.activeElement.dataset.stair`),letter);
   assert.match(await evaluate(`document.querySelector('.map-announcement').textContent`),new RegExp('arrived at stair '+letter));
   assert.equal(await evaluate(`document.querySelector('.location-encounters').textContent`),encounters);
   assert.equal(await evaluate(`document.documentElement.scrollWidth<=innerWidth`),true);
   assert.equal(await evaluate(`[...document.querySelectorAll('.map-stair-links button')].every(b=>b.getBoundingClientRect().height>=44)`),true);
   await evaluate(`document.querySelector('.map-stair-links [data-stair-link="${letter}"]').click()`);
   assert.equal(await evaluate(`document.querySelector('.map-select').value`),String(index));
   assert.equal(await evaluate(`document.activeElement.dataset.stair`),letter);
  }
  await evaluate(`document.querySelector('.map-stair-links [data-stair-link="F"]').click()`);
  if(process.env.ATLAS_SCREENSHOT_DIR&&width!==320){
   await evaluate(`document.querySelector('.map-controls').scrollIntoView()`);const shot=await command('Page.captureScreenshot',{format:'png'});
   await require('node:fs/promises').writeFile(path.join(process.env.ATLAS_SCREENSHOT_DIR,`whirl-stairs-${width}.png`),Buffer.from(shot.data,'base64'));
  }
  // Lower floors now have verified passages, without reusing entrance letters.
  await evaluate(`document.querySelector('.map-select').value='5';document.querySelector('.map-select').dispatchEvent(new Event('change'))`);
  assert.equal(await evaluate(`document.querySelector('.map-stair-links').hidden`),false);
  assert.equal(await evaluate(`document.querySelector('.location-map-link').hasAttribute('aria-haspopup')`),true);
 }
 await command('Emulation.clearDeviceMetricsOverride');assert.deepEqual(exceptions,[]);
});

test('Full-size Whirl maps retain stair links, pan to arrivals and close accessibly on mobile and desktop',async()=>{
 for(const width of [320,390,1440])for(const theme of ['light','dark']){
  await command('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:width<800});
  await atlas({directory:false});
  await evaluate(`localStorage.setItem('pokemon-reader-theme','${theme}');dispatchEvent(new StorageEvent('storage',{key:'pokemon-reader-theme'}));location.hash='location=Whirl%20Islands'`);
  await until(()=>evaluate(`document.querySelector('.location-card h2')?.textContent==='Whirl Islands'`),'Whirl viewer location');
  await evaluate(`document.querySelector('.location-map-link').click()`);
  await until(()=>evaluate(`document.querySelector('.map-viewer').open`),'Whirl viewer open');
  await evaluate(`document.querySelector('.map-viewer [data-stair="A"]').click()`);
  await until(()=>evaluate(`document.querySelector('.map-viewer img').complete&&document.querySelector('.map-viewer img').naturalWidth===1088`),'B1F full-size image');
  const state=await evaluate(`(()=>{
   const d=document.querySelector('.map-viewer'),s=d.querySelector('.map-viewer-scroll'),b=d.querySelector('[data-stair="A"]'),r=s.getBoundingClientRect(),m=b.getBoundingClientRect();
   return {open:d.open,fit:document.documentElement.scrollWidth<=innerWidth,scroll:s.scrollWidth,letter:document.activeElement.dataset.stair,visible:m.left>=r.left&&m.right<=r.right&&m.top>=r.top&&m.bottom<=r.bottom,main:document.querySelector('.location-map').src,original:d.querySelector('a').href,status:d.querySelector('[role="status"]').textContent,markers:d.querySelectorAll('[data-stair]').length,theme:document.documentElement.dataset.theme};
  })()`);
  assert.equal(state.open,true);assert.equal(state.fit,true);assert.ok(state.scroll>=1088);assert.equal(state.letter,'A');assert.equal(state.visible,true);assert.equal(state.original,state.main);assert.equal(state.markers,8);assert.equal(state.theme,theme);assert.match(state.status,/Arrived at stair A on B1F/);
  if(process.env.ATLAS_SCREENSHOT_DIR&&width!==320){
   const shot=await command('Page.captureScreenshot',{format:'png'});
   await require('node:fs/promises').writeFile(path.join(process.env.ATLAS_SCREENSHOT_DIR,`whirl-viewer-${theme}-${width}.png`),Buffer.from(shot.data,'base64'));
  }
  await evaluate(`document.querySelector('.map-viewer select').value='1f-sw';document.querySelector('.map-viewer select').dispatchEvent(new Event('change'))`);
  assert.deepEqual(await evaluate(`[...document.querySelectorAll('.map-viewer [data-stair]')].map(b=>b.dataset.stair)`),['D','E']);
  await evaluate(`document.querySelector('.map-viewer [data-stair="E"]').click()`);
  assert.equal(await evaluate(`document.activeElement.dataset.stair`),'E');
  if(theme==='dark'){
   await command('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
   await command('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
  }else await evaluate(`document.querySelector('.map-viewer-header button').click()`);
  await until(()=>evaluate(`!document.querySelector('.map-viewer').open&&document.activeElement.dataset.stair==='E'`),'Viewer close and focus return');
  // A failed main image must not leave floating interactive markers over an absent map.
  await evaluate(`document.querySelector('.location-map').src='/missing-whirl-image.png'`);
  await until(()=>evaluate(`document.querySelector('.location-map-link').hidden`),'Whirl image failure');
  assert.equal(await evaluate(`document.querySelector('.map-marker-viewport').hidden`),true);
  assert.equal(await evaluate(`document.querySelector('.map-stair-links').hidden`),true);
 }
 await command('Emulation.clearDeviceMetricsOverride');assert.deepEqual(exceptions,[]);
});

test('Other caves follow every verified stair or passage in both directions at phone and desktop sizes',async()=>{
 for(const width of [320,390,1440]){
  await command('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:width<800});
  await atlas({directory:false});
  const result=await evaluate(`(async()=>{
   const {SOULSILVER_MAP_LINKS}=await import('/js/data/games/soulsilver/map-links.js');const {mapsForLocation}=await import('/js/data/atlas-maps.js');
   const wait=async fn=>{for(let i=0;i<100;i++){if(fn())return;await new Promise(r=>setTimeout(r,10));}throw Error('Cave render timed out');};
   const failures=[];let pairs=0;let locations=0;
   for(const [name,data]of Object.entries(SOULSILVER_MAP_LINKS)){
    if(name==='Whirl Islands')continue;locations++;location.hash='location='+encodeURIComponent(name);
    await wait(()=>document.querySelector('.location-card h2')?.textContent===name);
    const maps=mapsForLocation('soulsilver',name);const before=document.querySelector('.location-encounters').textContent;
    for(const pair of data.pairs){
     const [from,to]=pair.ends;const select=document.querySelector('.map-select');select.value=String(maps.findIndex(m=>m.id===from.mapId));select.dispatchEvent(new Event('change'));
     const image=document.querySelector('.location-map'),map=maps.find(m=>m.id===from.mapId),r=image.getBoundingClientRect();
     const scale=Math.min(r.width/map.width,r.height/map.height),x=r.left+(r.width-map.width*scale)/2,y=r.top+(r.height-map.height*scale)/2;
     for(const p of data.pairs.filter(p=>p.ends.some(e=>e.mapId===from.mapId))){
      const e=p.ends.find(e=>e.mapId===from.mapId);const b=document.querySelector('.map-marker-viewport [data-stair="'+p.id+'"]').getBoundingClientRect();
      if(Math.abs(b.left+b.width/2-x-e.x*scale)>1||Math.abs(b.top+b.height/2-y-e.y*scale)>1)failures.push(name+': '+p.id+' alignment');
     }
     document.querySelector('.map-marker-viewport [data-stair="'+pair.id+'"]').click();
     if(select.value!==String(maps.findIndex(m=>m.id===to.mapId)))failures.push(name+': '+pair.id+' destination');
     if(document.activeElement.dataset.stair!==pair.id)failures.push(name+': '+pair.id+' focus');
     if(!document.querySelector('.map-marker-viewport [data-stair="'+pair.id+'"]').classList.contains('is-arrival'))failures.push(name+': '+pair.id+' highlight');
     document.querySelector('.map-stair-links [data-stair-link="'+pair.id+'"]').click();
     if(select.value!==String(maps.findIndex(m=>m.id===from.mapId)))failures.push(name+': '+pair.id+' return');
     pairs++;
    }
    if(document.querySelector('.location-encounters').textContent!==before)failures.push(name+': encounters');
    if(document.documentElement.scrollWidth>innerWidth)failures.push(name+': overflow');
   }
   return {pairs,locations,failures};
  })()`);
  assert.equal(result.pairs,50);assert.equal(result.locations,10);assert.deepEqual(result.failures,[]);
  if(process.env.ATLAS_SCREENSHOT_DIR&&width!==320){
   await evaluate(`location.hash='location=Mt.%20Mortar'`);await until(()=>evaluate(`document.querySelector('.location-card h2')?.textContent==='Mt. Mortar'`),'Mt Mortar screenshot');
   await evaluate(`document.querySelector('.map-controls').scrollIntoView()`);
   await until(()=>evaluate(`document.querySelector('.location-map').complete&&document.querySelector('.location-map').naturalWidth>0`),'Mortar image');
   const shot=await command('Page.captureScreenshot',{format:'png'});await require('node:fs/promises').writeFile(path.join(process.env.ATLAS_SCREENSHOT_DIR,`cave-mortar-${width}.png`),Buffer.from(shot.data,'base64'));
  }
 }
 await command('Emulation.clearDeviceMetricsOverride');assert.deepEqual(exceptions,[]);
});

test('Cave full-size maps retain multi-floor and supplementary room links in both themes',async()=>{
 for(const width of [390,1440])for(const theme of ['light','dark']){
  await command('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:width<800});
  await atlas({directory:false});
  await evaluate(`localStorage.setItem('pokemon-reader-theme','${theme}');dispatchEvent(new StorageEvent('storage',{key:'pokemon-reader-theme'}));location.hash='location=Union%20Cave'`);
  await until(()=>evaluate(`document.querySelector('.location-card h2')?.textContent==='Union Cave'`),'Union Cave viewer');
  await evaluate(`document.querySelector('.location-map-link').click();document.querySelector('.map-viewer [data-stair="A"]').click();document.querySelector('.map-viewer [data-stair="D"]').click()`);
  await until(()=>evaluate(`document.querySelector('.map-viewer img').complete&&document.querySelector('.map-viewer img').naturalWidth>0`),'Supplementary passage plan');
  const state=await evaluate(`({open:document.querySelector('.map-viewer').open,source:document.querySelector('[data-map-source]').href,sourceLabel:document.querySelector('[data-map-source]').textContent,note:document.querySelector('.map-reference-note').textContent,main:document.querySelector('.map-select').selectedOptions[0].textContent,full:document.querySelector('.map-viewer img').src,focus:document.activeElement.dataset.stair,fit:document.documentElement.scrollWidth<=innerWidth,theme:document.documentElement.dataset.theme})`);
  assert.equal(state.open,true);assert.match(state.source,/github.com\/pret\/pokeheartgold/);assert.match(state.sourceLabel,/source events/);assert.match(state.note,/Game-data terrain plan/);assert.match(state.main,/Northern connecting passages/);assert.match(state.full,/cave-plan-union-side-passages/);assert.equal(state.focus,'D');assert.equal(state.fit,true);assert.equal(state.theme,theme);
  assert.equal(await evaluate(`(()=>{const d=document.querySelector('.map-viewer').getBoundingClientRect(),b=document.querySelector('.map-viewer-header button').getBoundingClientRect();return b.top>=d.top&&b.bottom<=d.bottom&&b.left>=d.left&&b.right<=d.right;})()`),true,'Close map remains visible after panning to a deeper room');
  if(process.env.ATLAS_SCREENSHOT_DIR){const shot=await command('Page.captureScreenshot',{format:'png'});await require('node:fs/promises').writeFile(path.join(process.env.ATLAS_SCREENSHOT_DIR,`cave-union-${theme}-${width}.png`),Buffer.from(shot.data,'base64'));}
  await evaluate(`document.querySelector('.map-viewer [data-stair="F"]').click()`);
  assert.match(await evaluate(`document.querySelector('.map-select').selectedOptions[0].textContent`),/Ruins exit alcoves/);
  await evaluate(`document.querySelector('.map-viewer-header button').click()`);await until(()=>evaluate(`!document.querySelector('.map-viewer').open&&document.activeElement.dataset.stair==='F'`),'Cave viewer close and focus return');
 }
 await command('Emulation.clearDeviceMetricsOverride');assert.deepEqual(exceptions,[]);
});

test('Touching HM and story symbols opens the matching travel requirement without navigating',async()=>{
 for(const width of [320,390]){
  await command('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:true});
  await command('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});
  for(const [from,to,expected]of [['New Bark Town','Route 27','Surf'],['Ice Path','Route 44','Strength'],['Whirl Islands','Route 41','Whirlpool'],['Mahogany Town','Route 44','Radio Tower']]){
   await atlas({directory:false});await evaluate(`location.hash='location='+encodeURIComponent(${JSON.stringify(from)})`);
   await until(()=>evaluate(`document.querySelector('.location-card h2')?.textContent===${JSON.stringify(from)}`),'Touch travel origin');
   const point=await evaluate(`(()=>{const button=[...document.querySelectorAll('.connection-link')].find(b=>b.textContent===${JSON.stringify(to)});const badge=button.querySelector('.travel-badges');badge.scrollIntoView({block:'center'});const r=badge.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2,w:r.width,h:r.height,hash:location.hash};})()`);
   assert.ok(point.w>=44&&point.h>=28);
   await command('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:point.x,y:point.y,radiusX:2,radiusY:2,id:1}]});
   await command('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
   await until(()=>evaluate(`document.querySelector('.travel-conditions').open`),'Tap did not open travel requirements');
   const state=await evaluate(`({hash:location.hash,selected:document.querySelector('.travel-conditions .is-selected')?.textContent,focused:document.activeElement===document.querySelector('.travel-conditions .is-selected'),fit:document.documentElement.scrollWidth<=innerWidth})`);
   assert.equal(state.hash,point.hash);assert.ok(state.selected.includes(to));assert.ok(state.selected.includes(expected),state.selected);assert.equal(state.focused,true);assert.equal(state.fit,true);
   if(process.env.ATLAS_SCREENSHOT_DIR&&width===390){const shot=await command('Page.captureScreenshot',{format:'png'});await require('node:fs/promises').writeFile(path.join(process.env.ATLAS_SCREENSHOT_DIR,`touch-requirements-${expected.replaceAll(' ','-')}.png`),Buffer.from(shot.data,'base64'));}
   // Keyboard readers can still open the same disclosure; the name still navigates by touch.
   await evaluate(`document.querySelector('.travel-conditions').open=false;document.querySelector('.travel-conditions summary').focus()`);
   assert.equal(await evaluate(`document.activeElement===document.querySelector('.travel-conditions summary')`),true);
   await command('Input.dispatchKeyEvent',{type:'keyDown',key:' ',code:'Space',windowsVirtualKeyCode:32});await command('Input.dispatchKeyEvent',{type:'keyUp',key:' ',code:'Space',windowsVirtualKeyCode:32});
   await until(()=>evaluate(`document.querySelector('.travel-conditions').open`),'Keyboard did not open travel requirements');
   const namePoint=await evaluate(`(()=>{const b=[...document.querySelectorAll('.connection-link')].find(b=>b.textContent===${JSON.stringify(to)});b.scrollIntoView({block:'center'});const r=b.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+12};})()`);
   await command('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:namePoint.x,y:namePoint.y,radiusX:2,radiusY:2,id:1}]});await command('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
   await until(()=>evaluate(`document.querySelector('.location-card h2')?.textContent===${JSON.stringify(to)}`),'Destination name did not navigate');
  }
 }
 await command('Emulation.setTouchEmulationEnabled',{enabled:false});await command('Emulation.clearDeviceMetricsOverride');assert.deepEqual(exceptions,[]);
});

test('Towers, lower Whirl and one-way holes navigate and focus correctly on phone and desktop',async()=>{
 for(const width of [320,390,1440])for(const theme of ['light','dark']){
  await command('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:width<800});
  await atlas({directory:false});
  const result=await evaluate(`(async()=>{
   localStorage.setItem('pokemon-reader-theme',${JSON.stringify(theme)});dispatchEvent(new StorageEvent('storage',{key:'pokemon-reader-theme'}));
   const {SOULSILVER_DUNGEON_LINKS}=await import('/js/data/games/soulsilver/dungeon-links.js');const {mapsForLocation}=await import('/js/data/atlas-maps.js');
   const wait=async fn=>{for(let i=0;i<100;i++){if(fn())return;await new Promise(r=>setTimeout(r,10));}throw Error('Dungeon render timed out');};
   const failures=[];let pairs=0,drops=0;
   for(const [name,data]of Object.entries(SOULSILVER_DUNGEON_LINKS)){
    location.hash='location='+encodeURIComponent(name);await wait(()=>document.querySelector('.location-card h2')?.textContent===name);
    const maps=mapsForLocation('soulsilver',name);const before=document.querySelector('.location-encounters').textContent;
    const select=document.querySelector('.map-select');
    for(const pair of data.pairs){
     const [from,to]=pair.ends;select.value=String(maps.findIndex(m=>m.id===from.mapId));select.dispatchEvent(new Event('change'));
     const same=from.mapId===to.mapId,fromKey=same?pair.id+'-0':pair.id,toKey=same?pair.id+'-1':pair.id;
     const start=document.querySelector('.map-marker-viewport [data-stair="'+fromKey+'"]');if(!start){failures.push(name+': missing '+fromKey);continue;}
     start.click();
     if(select.value!==String(maps.findIndex(m=>m.id===to.mapId)))failures.push(name+': destination '+pair.id);
     if(document.activeElement.dataset.stair!==toKey)failures.push(name+': focus '+pair.id);
     const landed=document.querySelector('.map-marker-viewport [data-stair="'+toKey+'"]');
     if(!landed.classList.contains('is-arrival'))failures.push(name+': highlight '+pair.id);
     if(pair.oneWay){
      if(landed.getAttribute('aria-disabled')!=='true')failures.push(name+': return offered '+pair.id);
      landed.click();document.querySelector('.map-stair-links [data-stair-link="'+toKey+'"]').click();
      if(select.value!==String(maps.findIndex(m=>m.id===to.mapId)))failures.push(name+': reversed drop '+pair.id);drops++;
     }else{
      document.querySelector('.map-stair-links [data-stair-link="'+toKey+'"]').click();
      if(select.value!==String(maps.findIndex(m=>m.id===from.mapId))||document.activeElement.dataset.stair!==fromKey)failures.push(name+': return '+pair.id);pairs++;
     }
    }
    if(before!==document.querySelector('.location-encounters').textContent)failures.push(name+': encounters changed');
    if(document.documentElement.scrollWidth>innerWidth)failures.push(name+': overflow');
   }
   return {failures,pairs,drops};
  })()`);
  assert.deepEqual(result.failures,[]);assert.equal(result.pairs,33);assert.equal(result.drops,9);
  // Same-floor pads also work inside the full-size viewer, and close retains focus.
  await evaluate(`location.hash='location=Bell%20Tower'`);
  await until(()=>evaluate(`document.querySelector('.location-card h2')?.textContent==='Bell Tower'`),'Bell Tower');
  const key=await evaluate(`(async()=>{const {mapLinksForLocation}=await import('/js/data/atlas-map-links.js');const p=mapLinksForLocation('soulsilver','Bell Tower').pairs.find(p=>p.ends[0].mapId===p.ends[1].mapId);const s=document.querySelector('.map-select');s.value='6';s.dispatchEvent(new Event('change'));document.querySelector('.location-map-link').click();document.querySelector('.map-viewer [data-stair="'+p.id+'-0"]').click();return p.id+'-1'})()`);
  assert.equal(await evaluate(`document.activeElement.dataset.stair`),key);
  assert.equal(await evaluate(`document.querySelector('.map-viewer select').value`),'7f');
  if(process.env.ATLAS_SCREENSHOT_DIR&&width!==320){
   await until(()=>evaluate(`document.querySelector('.map-viewer img').complete&&document.querySelector('.map-viewer img').naturalWidth>0`),'Bell image');
   const shot=await command('Page.captureScreenshot',{format:'png'});await require('node:fs/promises').writeFile(path.join(process.env.ATLAS_SCREENSHOT_DIR,`dungeon-bell-${theme}-${width}.png`),Buffer.from(shot.data,'base64'));
  }
  await evaluate(`document.querySelector('.map-viewer-header button').click()`);
  await until(()=>evaluate(`!document.querySelector('.map-viewer').open&&document.activeElement.dataset.stair===${JSON.stringify(key)}`),'Bell close');
  await evaluate(`location.hash='location=Ice%20Path'`);
  await until(()=>evaluate(`document.querySelector('.location-card h2')?.textContent==='Ice Path'`),'Ice holes');
  await evaluate(`document.querySelector('.map-select').value='1';document.querySelector('.map-select').dispatchEvent(new Event('change'));document.querySelector('.location-map-link').click();document.querySelector('.map-viewer [data-stair="D1"]').click()`);
  assert.equal(await evaluate(`document.querySelector('.map-viewer select').value`),'b2f');
  assert.equal(await evaluate(`document.querySelector('.map-viewer [data-stair="D1"]').getAttribute('aria-disabled')`),'true');
  await evaluate(`document.querySelector('.map-viewer [data-stair="D1"]').click()`);
  assert.equal(await evaluate(`document.querySelector('.map-viewer select').value`),'b2f');
  if(process.env.ATLAS_SCREENSHOT_DIR&&width!==320){
   await until(()=>evaluate(`document.querySelector('.map-viewer img').complete&&document.querySelector('.map-viewer img').naturalWidth>0`),'Ice landing image');
   const shot=await command('Page.captureScreenshot',{format:'png'});await require('node:fs/promises').writeFile(path.join(process.env.ATLAS_SCREENSHOT_DIR,`dungeon-ice-${theme}-${width}.png`),Buffer.from(shot.data,'base64'));
  }
  await evaluate(`document.querySelector('.map-viewer-header button').click()`);
  await until(()=>evaluate(`!document.querySelector('.map-viewer').open&&document.activeElement.dataset.stair==='D1'`),'Landing close');
 }
 await command('Emulation.clearDeviceMetricsOverride');assert.deepEqual(exceptions,[]);
});

test('Load Save info, profile visibility, consistent widths and offline Flash search',async()=>{
 const data=fixture();data.storage.boxes[0].pokemon[4].moves=[{id:148,pp:20,ppUps:0}];
 await fixtureReader(data);
 assert.equal(await evaluate(`document.querySelector('#adventure-profiles').hidden`),true);
 assert.equal(await evaluate(`document.querySelector('[data-view="pokedex"]')`),null);
 await evaluate(`document.querySelector('.view-intro .reader-info summary').click()`);
 assert.equal(await evaluate(`document.querySelector('.view-intro .reader-info').open`),true);
 await command('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
 const widths=[],headings=[];
 for(const view of ['overview','party','storage','collection']){
  await evaluate(`location.hash='${view}'`);
  await until(()=>evaluate(`document.querySelector('.app').dataset.view==='${view}'`),'Reader view');
  widths.push(await evaluate(`document.querySelector('.app').getBoundingClientRect().width`));
  await evaluate(`window.scrollTo(0,0);document.querySelector('#view-heading').focus({preventScroll:true})`);
  headings.push(await evaluate(`({top:document.querySelector('#view-heading').getBoundingClientRect().top,bottom:document.querySelector('.view-intro').getBoundingClientRect().bottom,outline:getComputedStyle(document.querySelector('#view-heading')).outlineStyle})`));
 }
 assert.equal(new Set(widths).size,1);
 assert.equal(new Set(headings.map(h=>h.top)).size,1);
 assert.equal(new Set(headings.map(h=>h.bottom)).size,1);
 assert.ok(headings.every(h=>h.outline==='none'));
 await evaluate(`location.hash='storage';var s=document.querySelector('#storage-search');s.value='fLaSh';s.dispatchEvent(new Event('input'));`);
 assert.equal(await evaluate(`document.querySelector('#storage-results').textContent.startsWith('1 matching Pokémon')`),true);
 assert.equal(await evaluate(`document.querySelectorAll('.box-grid .search-match').length`),1);
 await evaluate(`document.querySelector('#load-save').click()`);
 assert.equal(await evaluate(`document.querySelector('#adventure-profiles').hidden`),false);
 await command('Emulation.clearDeviceMetricsOverride');await command('Fetch.disable');
});

test('Dungeon arrivals pan the image without scrolling the viewer controls out of reach',async()=>{
 for(const [width,height]of[[320,844],[390,844],[844,390],[1440,900]]){
  await command('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<900});
  await atlas({directory:false});
  await evaluate(`location.hash='location=Ice%20Path'`);
  await until(()=>evaluate(`document.querySelector('.location-card h2')?.textContent==='Ice Path'`),'Ice Path arrival audit');
  await evaluate(`document.querySelector('.map-select').value='1';document.querySelector('.map-select').dispatchEvent(new Event('change'));document.querySelector('.location-map-link').click();document.querySelector('.map-viewer').scrollTop=0;document.querySelector('.map-viewer [data-stair="D1"]').click()`);
  const state=await evaluate(`(()=>{const d=document.querySelector('.map-viewer'),p=d.querySelector('.map-viewer-scroll'),r=p.getBoundingClientRect(),m=d.querySelector('[data-stair="D1"]').getBoundingClientRect();return {scroll:d.scrollTop,focused:document.activeElement.dataset.stair,inside:m.left>=r.left&&m.right<=r.right&&m.top>=r.top&&m.bottom<=r.bottom}})()`);
  assert.equal(state.scroll,0,`${width}×${height}: floor travel must only pan the map, keeping the surrounding controls in place`);
  assert.equal(state.focused,'D1');assert.equal(state.inside,true);
  await evaluate(`document.querySelector('.map-viewer-header button').click()`);
  await until(()=>evaluate(`!document.querySelector('.map-viewer').open`),'Close arrival audit');
 }
 await command('Emulation.clearDeviceMetricsOverride');assert.deepEqual(exceptions,[]);
});

test('Safari audited catalogue shows corrected species, score requirements and an honest unfiltered rate basis',async()=>{
 await safariVisit('#safari=0');await editSafari(0,11);
 assert.match(await evaluate(`document.querySelector('#safari-encounters').textContent`),/Spinda/);
 assert.match(await evaluate(`document.querySelector('#safari-encounters').textContent`),/49 Forest points/);
 assert.match(await evaluate(`document.querySelector('.safari-reference-count').textContent`),/not filtered.*slot shares before lead abilities and Repel/);
 assert.doesNotMatch(await evaluate(`document.querySelector('#safari-encounters').textContent`),/available after \d+ days|audit pending/);
 await editSafari(0,4);
 const text=await evaluate(`document.querySelector('#safari-encounters').textContent`);
 for(const species of ['Lapras','Corphish','Kingler'])assert.ok(text.includes(species),species);
 await command('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
 assert.equal(await evaluate(`document.documentElement.scrollWidth<=innerWidth`),true);
 await command('Emulation.clearDeviceMetricsOverride');
});

let safariScenarioVisitNumber=0;
async function visitSafariScenario(prefix=''){
 await command('Page.navigate',{url:baseURL+prefix+'/safari-zone/?test='+(++safariScenarioVisitNumber)});
 await until(()=>evaluate(`document.documentElement?.dataset.safariScenarioReady==='true'`),'Safari starting configuration did not initialize');
}
async function setScenarioField(key,value){
 await evaluate(`(()=>{const input=document.querySelector('[data-scenario-field="${key}"]');input.value=${JSON.stringify(value)};input.dispatchEvent(new Event('change'));})()`);
}
test('Safari save-free starting configuration supports manual completion, hypothetical changes, two resets and shared mobile themes',async()=>{
 await visitSafariScenario('/pokemon-reader');
 assert.match(await evaluate(`document.querySelector('#scenario-owner').textContent`),/No save/);
 assert.equal(await evaluate(`document.querySelector('[data-scenario-field="blockLevel"]').value`),'0');
 await setScenarioField('customizerUnlocked','true');await setScenarioField('blockLevel','4');
 assert.match(await evaluate(`document.querySelector('[data-scenario-field="blockLevel"]').nextElementSibling.textContent`),/Manually supplied/);
 await evaluate(`document.querySelector('#scenario-edit-mode').value='current';document.querySelector('#scenario-edit-mode').dispatchEvent(new Event('change'))`);
 await setScenarioField('blocks.0.peak','12');
 assert.match(await evaluate(`document.querySelector('#scenario-differences').textContent`),/12.*Hypothetical/);
 await evaluate(`document.querySelector('#scenario-reset').click()`);
 assert.equal(await evaluate(`document.querySelector('[data-scenario-field="blocks.0.peak"]').value`),'0');
 assert.equal(await evaluate(`document.querySelector('[data-scenario-field="blockLevel"]').value`),'4');
 await evaluate(`document.querySelector('#scenario-restore').click()`);
 assert.equal(await evaluate(`document.querySelector('[data-scenario-field="blockLevel"]').value`),'0');
 for(const theme of ['dark','light'])for(const width of [320,390,768,1440]){
  await command('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<800});
  await evaluate(`localStorage.setItem('pokemon-reader-theme','${theme}');window.dispatchEvent(new StorageEvent('storage',{key:'pokemon-reader-theme'}));document.querySelector('#scenario-fields details').open=true`);
  assert.equal(await evaluate(`document.documentElement.dataset.theme`),theme);
  assert.equal(await evaluate(`document.documentElement.scrollWidth<=innerWidth`),true,`${theme}/${width}`);
  assert.equal(await evaluate(`getComputedStyle(document.querySelector('.world-panel')).display`),'block','Scenario cards must not inherit Atlas search/sidebar columns');
 }
 if(process.env.SAFARI_SCENARIO_SCREENSHOT_DIR){
  await require('node:fs/promises').mkdir(process.env.SAFARI_SCENARIO_SCREENSHOT_DIR,{recursive:true});
  for(const width of [390,1440]){await command('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width<800});const shot=await command('Page.captureScreenshot',{format:'png'});await require('node:fs/promises').writeFile(path.join(process.env.SAFARI_SCENARIO_SCREENSHOT_DIR,`scenario-${width}.png`),Buffer.from(shot.data,'base64'));}
 }
 assert.ok(await evaluate(`document.querySelector('#load-save').href.endsWith('/pokemon-reader/#overview')`));
 assert.equal(await evaluate(`document.querySelectorAll('input[type=file]').length`),0,'Reuses Reader file loader');
 await command('Emulation.clearDeviceMetricsOverride');
});
test('Safari reads a constructed binary through Reader, restores fields and preserves the adventure while editing',async()=>{
 const {safariSave}=require('./fixtures/safari/save.cjs');const {bytes}=safariSave();
 await command('Fetch.disable');await command('Fetch.enable',{patterns:[{urlPattern:'https://pokeapi.co/*'}]});
 await command('Page.navigate',{url:baseURL+'/#overview'});
 await until(()=>evaluate(`document.querySelector('#app-version')?.textContent==='0.27.0'`),'Real Reader ready');
 const payload=Buffer.from(bytes).toString('base64');
 await evaluate(`(()=>{const data=Uint8Array.from(atob('${payload}'),c=>c.charCodeAt(0));const files=new DataTransfer();files.items.add(new File([data],'constructed-safari.sav'));const input=document.querySelector('#save-file');input.files=files.files;input.dispatchEvent(new Event('change'));})()`);
 await until(()=>evaluate(`(async()=>{const a=await import('/js/adventures.js');return (await a.getActiveProfile())?.snapshot.safari?.layout?.[0]===11;})()`),'Parsed Safari persisted by Reader');
 await command('Fetch.disable');await visitSafariScenario();
 assert.equal(await evaluate(`document.querySelector('[data-scenario-field="layout.0"]').value`),'11');
 assert.equal(await evaluate(`document.querySelector('[data-scenario-field="age.7"]').value`),'110');
 assert.equal(await evaluate(`document.querySelector('[data-scenario-field="blocks.0.peak"]').value`),'1');
 assert.equal(await evaluate(`document.querySelector('[data-scenario-field="open"]').value`),'');
 assert.match(await evaluate(`document.querySelector('[data-scenario-field="open"]').nextElementSibling.textContent`),/Unavailable/);
 const before=await evaluate(`(async()=>{const a=await import('/js/adventures.js');return JSON.stringify(await a.getActiveProfile());})()`);
 await setScenarioField('open','true');await setScenarioField('age.7','120');
 assert.equal(await evaluate(`(async()=>{const a=await import('/js/adventures.js');return JSON.stringify(await a.getActiveProfile());})()`),before);
 await command('Page.reload');await until(()=>evaluate(`document.querySelector('[data-scenario-field="age.7"]')?.value==='110'`),'Reload uses original saved ages, not visit edits');
});
test('Safari reinitializes on same-adventure save revision and profile changes but ignores unrelated notifications',async()=>{
 const data=fixture();const {safariSave}=require('./fixtures/safari/save.cjs');const parsed=(await import('../js/saves/soulsilver.js')).detectSoulSilver(safariSave().bytes.buffer);data.save.safari=parsed.save.safari;
 await fixtureReader(data);await command('Fetch.disable');await visitSafariScenario();
 await setScenarioField('age.7','120');
 await evaluate(`(async()=>{const a=await import('/js/adventures.js');a.notifyAdventureChange();})()`);
 assert.equal(await evaluate(`document.querySelector('[data-scenario-field="age.7"]').value`),'120');
 await evaluate(`(async()=>{const a=await import('/js/adventures.js');const p=await a.getActiveProfile();const s=structuredClone(p.snapshot);s.loadedAt=new Date(Date.parse(s.loadedAt)+1000).toISOString();s.safari.areaAges[7]=130;await a.persistSnapshot(s,{profileId:p.id});})()`);
 await until(()=>evaluate(`document.querySelector('[data-scenario-field="age.7"]').value==='130'`),'Same-adventure replacement reinitializes');
 assert.match(await evaluate(`document.querySelector('#scenario-message').textContent`),/reinitialized/);
 await evaluate(`(async()=>{const a=await import('/js/adventures.js');await a.clearActiveProfile();})()`);
 await until(()=>evaluate(`document.querySelector('#scenario-owner').textContent.includes('No save')`),'Reference scenario reinitializes');
 assert.equal(await evaluate(`document.querySelector('[data-scenario-field="age.7"]').value`),'0');
});
test('Safari starting configuration remains usable when storage is denied and older snapshots retain unknown fields',async()=>{
 await fixtureReader();await command('Fetch.disable');await visitSafariScenario();
 assert.equal(await evaluate(`document.querySelector('[data-scenario-field="layout.0"]').value`),'');
 assert.equal(await evaluate(`document.querySelector('[data-scenario-field="blockLevel"]').value`),'');
 await setScenarioField('layout.0','11');assert.equal(await evaluate(`document.querySelector('[data-scenario-field="layout.0"]').value`),'11');
 const injection=await command('Page.addScriptToEvaluateOnNewDocument',{source:`indexedDB.open=()=>{throw new DOMException('Denied','SecurityError')}`});
 try{
  await visitSafariScenario();assert.match(await evaluate(`document.querySelector('#scenario-notes').textContent`),/storage is unavailable/);
  await setScenarioField('blockLevel','4');assert.equal(await evaluate(`document.querySelector('[data-scenario-field="blockLevel"]').value`),'4');
 }finally{await command('Page.removeScriptToEvaluateOnNewDocument',{identifier:injection.identifier});}
});

async function configureSafariSimulator(){
 for(const [key,value]of Object.entries({baobaStage:'6',blockLevel:'4',nationalDex:'true',surf:'true',oldrod:'true',goodrod:'true',superrod:'true'}))await setScenarioField(key,value);
}
async function findSafariTarget(name){await evaluate(`(()=>{const i=document.querySelector('#safari-target');i.value=${JSON.stringify(name)};i.dispatchEvent(new Event('input'));document.querySelector('#safari-target-form').requestSubmit();})()`);}
test('Safari simulator previews a reference target, updates comparison and resets without rewriting the baseline',async()=>{
 await visitSafariScenario('/pokemon-reader');await configureSafariSimulator();await findSafariTarget('Bagon');
 const card=await evaluate(`document.querySelector('.safari-plan').textContent`);
 for(const text of ['Swamp','110 additional credited area days','9 Forest','19 Peak','56 Peak points','35 Forest points'])assert.ok(card.includes(text),text);
 assert.match(card,/manually supplied|default inputs/);
 await evaluate(`document.querySelector('.safari-plan button').click()`);
 assert.equal(await evaluate(`document.activeElement.id`),'safari-live-title');
 assert.match(await evaluate(`document.querySelector('#safari-proposed-encounters').textContent`),/Bagon.*10%/);
 assert.doesNotMatch(await evaluate(`document.querySelector('#safari-starting-encounters').textContent`),/Bagon/);
 assert.equal(await evaluate(`document.querySelector('#scenario-edit-mode').value`),'current');
 assert.match(await evaluate(`document.querySelector('#scenario-differences').textContent`),/110.*Hypothetical/);
 assert.match(await evaluate(`document.querySelector('#safari-target-summary').textContent`),/proposed scenario/);
 if(process.env.SAFARI_SIMULATOR_SCREENSHOT_DIR){
  await mkdir(process.env.SAFARI_SIMULATOR_SCREENSHOT_DIR,{recursive:true});
  for(const width of [390,1440]){await command('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width<800});await evaluate(`document.querySelector('#safari-live-title').scrollIntoView()`);const shot=await command('Page.captureScreenshot',{format:'png'});await require('node:fs/promises').writeFile(path.join(process.env.SAFARI_SIMULATOR_SCREENSHOT_DIR,`comparison-${width}.png`),Buffer.from(shot.data,'base64'));}
  await command('Emulation.clearDeviceMetricsOverride');
 }
 await evaluate(`document.querySelector('#scenario-reset').click()`);
 assert.doesNotMatch(await evaluate(`document.querySelector('#safari-proposed-encounters').textContent`),/Bagon/);
 assert.equal(await evaluate(`document.querySelector('[data-scenario-field="age.7"]').value`),'0');
 assert.equal(await evaluate(`document.querySelector('[data-scenario-field="blockLevel"]').value`),'4');
 assert.deepEqual(exceptions,[]);
});
test('Safari simulator handles all methods, progression locks, missing fields and unsupported targets visibly',async()=>{
 await visitSafariScenario();await findSafariTarget('Bagon');
 assert.match(await evaluate(`document.querySelector('#safari-target-results').textContent`),/Unlock object placement/);
 await configureSafariSimulator();
 await evaluate(`document.querySelector('[data-sim-position="1"]').click()`);
 for(const method of ['land','surf','oldrod','goodrod','superrod']){
  await evaluate(`document.querySelector('#safari-sim-method').value='${method}';document.querySelector('#safari-sim-method').dispatchEvent(new Event('change'))`);
  assert.match(await evaluate(`document.querySelector('#safari-proposed-status').textContent`),/Available in this scenario/);
  assert.ok(await evaluate(`document.querySelectorAll('#safari-proposed-encounters li').length>0`));
 }
 await setScenarioField('superrod','false');assert.match(await evaluate(`document.querySelector('#safari-proposed-status').textContent`),/Unavailable/);
 assert.equal(await evaluate(`document.querySelector('#safari-complete-start').hidden`),true);await setScenarioField('superrod','true');
 await setScenarioField('age.7','');await findSafariTarget('Bagon');
 assert.match(await evaluate(`document.querySelector('#safari-target-summary').textContent`),/stored age/);
 await evaluate(`document.querySelector('#safari-complete-start').click()`);assert.equal(await evaluate(`document.activeElement.dataset.scenarioField`),'age.7');
 await findSafariTarget('Arceus');assert.match(await evaluate(`document.querySelector('#safari-target-summary').textContent`),/no supported Safari Zone encounter/);
 await findSafariTarget('not-a-pokemon');assert.match(await evaluate(`document.querySelector('#safari-target-summary').textContent`),/exact Pokémon name/);
 assert.deepEqual(exceptions,[]);
});
test('Safari target plans and live comparison remain usable across mobile and desktop themes',async()=>{
 await visitSafariScenario('/pokemon-reader');await configureSafariSimulator();await findSafariTarget('Bagon');
 for(const theme of ['light','dark'])for(const width of [320,390,768,1440]){
  await command('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<800});
  await evaluate(`localStorage.setItem('pokemon-reader-theme','${theme}');dispatchEvent(new StorageEvent('storage',{key:'pokemon-reader-theme'}));document.querySelector('#safari-target-title').scrollIntoView()`);
  assert.equal(await evaluate(`document.documentElement.scrollWidth<=innerWidth`),true,`${theme}/${width}`);
  assert.ok(await evaluate(`document.querySelector('.safari-plan button').getBoundingClientRect().height>=40`));
  if(process.env.SAFARI_SIMULATOR_SCREENSHOT_DIR&&[390,1440].includes(width)){
   await mkdir(process.env.SAFARI_SIMULATOR_SCREENSHOT_DIR,{recursive:true});const shot=await command('Page.captureScreenshot',{format:'png'});await require('node:fs/promises').writeFile(path.join(process.env.SAFARI_SIMULATOR_SCREENSHOT_DIR,`simulator-${theme}-${width}.png`),Buffer.from(shot.data,'base64'));
  }
 }
 await command('Emulation.clearDeviceMetricsOverride');assert.deepEqual(exceptions,[]);
});

test('Safari final audit covers all twelve live areas, every method and time on phone and desktop',async()=>{
 await visitSafariScenario('/pokemon-reader');await configureSafariSimulator();
 await evaluate(`document.querySelector('#scenario-edit-mode').value='current';document.querySelector('#scenario-edit-mode').dispatchEvent(new Event('change'));document.querySelector('[data-sim-position="0"]').click()`);
 for(const [width,theme]of [[320,'light'],[1440,'dark']]){
  await command('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<800});
  const result=await evaluate(`(async()=>{
   localStorage.setItem('pokemon-reader-theme',${JSON.stringify(theme)});dispatchEvent(new StorageEvent('storage',{key:'pokemon-reader-theme'}));
   const failures=[];let available=0,dry=0;
   const set=(key,value)=>{const i=document.querySelector('[data-scenario-field="'+key+'"]');i.value=String(value);i.dispatchEvent(new Event('change'));};
   for(let area=0;area<12;area++){
    set('layout.0',area);set('age.'+area,250);
    for(const c of ['plains','forest','peak','water'])set('blocks.0.'+c,3);
    if(!document.querySelector('[data-sim-position="0"]').hasAttribute('aria-current'))failures.push('Lost selected position '+area);
    for(const method of ['land','surf','oldrod','goodrod','superrod'])for(const time of ['morning','day','night']){
     const select=document.querySelector('#safari-sim-method');select.value=method;select.dispatchEvent(new Event('change'));set('time',time);
     const status=document.querySelector('#safari-proposed-status').textContent,list=document.querySelector('#safari-proposed-encounters');
     if(method!=='land'&&![1,4,5,7,8].includes(area)){
      dry++;if(!status.includes('no water encounter terrain')||list.children.length)failures.push(area+'/'+method+'/'+time+': invented dry-area table');
      if(!document.querySelector('#safari-complete-start').hidden)failures.push('Unnecessary manual-completion action for dry area');
     }else{
      available++;const rates=[...list.querySelectorAll('li')].map(li=>Number(li.textContent.match(/(\\d+)%$/)?.[1]));
      if(!status.startsWith('Available')||rates.reduce((a,b)=>a+b,0)!==100)failures.push(area+'/'+method+'/'+time+': incomplete table');
      if([...list.querySelectorAll('a')].some(a=>!a.href.includes('/pokemon-reader/pokedex/#species=')))failures.push('Wrong Pages species path');
     }
     if(document.documentElement.scrollWidth>innerWidth)failures.push('Overflow '+area+'/'+method);
    }
   }
   return {failures,available,dry};
  })()`);
  assert.deepEqual(result.failures,[]);assert.equal(result.available,96);assert.equal(result.dry,84);
 }
 await command('Emulation.clearDeviceMetricsOverride');assert.deepEqual(exceptions,[]);
});
test('Safari final audit sends unknown-field completion to the correct edit mode and preserves saved baseline',async()=>{
 await visitSafariScenario();await configureSafariSimulator();
 await evaluate(`document.querySelector('#scenario-edit-mode').value='current';document.querySelector('#scenario-edit-mode').dispatchEvent(new Event('change'))`);
 await setScenarioField('age.3','');
 assert.equal(await evaluate(`document.querySelector('#safari-complete-start').hidden`),false);
 await evaluate(`document.querySelector('#safari-complete-start').click()`);
 assert.equal(await evaluate(`document.activeElement.dataset.scenarioField`),'age.3');
 assert.equal(await evaluate(`document.querySelector('#scenario-edit-mode').value`),'current');
 await evaluate(`document.querySelector('#scenario-reset').click()`);
 assert.equal(await evaluate(`document.querySelector('[data-scenario-field="age.3"]').value`),'0');
 await setScenarioField('blocks.4.peak','1');await setScenarioField('nationalDex','');
 await evaluate(`document.querySelector('#safari-complete-start').click()`);
 assert.equal(await evaluate(`document.activeElement.dataset.scenarioField`),'nationalDex');
 assert.equal(await evaluate(`document.querySelector('#scenario-edit-mode').value`),'current');
 await evaluate(`document.querySelector('#scenario-reset').click()`);
 // A missing baseline field must instead open manual baseline completion.
 await evaluate(`document.querySelector('#scenario-edit-mode').value='starting';document.querySelector('#scenario-edit-mode').dispatchEvent(new Event('change'))`);
 await setScenarioField('open','');await evaluate(`document.querySelector('#safari-complete-start').click()`);
 assert.equal(await evaluate(`document.activeElement.dataset.scenarioField`),'open');assert.equal(await evaluate(`document.querySelector('#scenario-edit-mode').value`),'starting');
 assert.deepEqual(exceptions,[]);
});
test('Safari final audit links Gate, Atlas, simulator and species reference with keyboard preview and unchanged adventure',async()=>{
 const data=fixture(),{safariSave}=require('./fixtures/safari/save.cjs');
 data.save.safari=(await import('../js/saves/soulsilver.js')).detectSoulSilver(safariSave().bytes.buffer).save.safari;
 await fixtureReader(data);await command('Fetch.disable');await visitSafariScenario('/pokemon-reader');
 const saved=await evaluate(`(async()=>JSON.stringify(await (await import('/js/adventures.js')).getActiveProfile()))()`);
 await evaluate(`document.querySelector('.scenario-return a[href*="Safari%20Zone%20Gate"]').click()`);
 await until(()=>evaluate(`document.querySelector('.location-card h2')?.textContent==='Safari Zone Gate'`),'Simulator returns to Gate');
 await evaluate(`document.querySelector('.compass-north button').click()`);
 await until(()=>evaluate(`!document.querySelector('#safari-mini-atlas').hidden`),'Gate enters Safari Atlas');
 await evaluate(`document.querySelector('#safari-mini-atlas a[href*="safari-zone/"]').click()`);
 await until(()=>evaluate(`document.documentElement?.dataset.safariScenarioReady==='true'`),'Atlas opens simulator');
 await configureSafariSimulator();await setScenarioField('open','true');await setScenarioField('time','morning');await findSafariTarget('Bagon');
 await evaluate(`document.querySelector('.safari-plan button').focus()`);
 await command('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,text:'\r'});
 await command('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
 assert.equal(await evaluate(`document.activeElement.id`),'safari-live-title');
 assert.match(await evaluate(`document.querySelector('#safari-proposed-encounters').textContent`),/Bagon/);
 assert.equal(await evaluate(`(async()=>JSON.stringify(await (await import('/js/adventures.js')).getActiveProfile()))()`),saved);
 await evaluate(`document.querySelector('#safari-proposed-encounters a[href*="species=371&"]').click()`);
 await until(()=>evaluate(`document.querySelector('#reference-detail')?.open&&document.querySelector('#reference-title')?.textContent==='Bagon'`),'Simulator species opens reference');
 await evaluate(`history.back()`);
 await until(()=>evaluate(`document.documentElement?.dataset.safariScenarioReady==='true'`),'Back returns to simulator');
 assert.doesNotMatch(await evaluate(`document.querySelector('#scenario-differences').textContent`),/Hypothetical/,'Returning reconstructs saved state rather than persisting a proposal');
 assert.equal(await evaluate(`(async()=>JSON.stringify(await (await import('/js/adventures.js')).getActiveProfile()))()`),saved);
 assert.deepEqual(exceptions,[]);
});

test('Kanto landing, border travel and region search fit phone and desktop without saved progress',async()=>{
 for(const width of [320,390,1440]){
  await command('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:width<800});
  await command('Page.navigate',{url:baseURL+'/pokedex-earth/#kanto'});
  await until(()=>evaluate(`document.querySelector('#kanto-home')&&!document.querySelector('#kanto-home').hidden`),'Kanto landing');
  await evaluate(`document.querySelector('#kanto-home a').click()`);
  await until(()=>evaluate(`document.querySelector('.location-card h2')?.textContent==='Vermilion City'`),'Kanto navigation');
  assert.equal(await evaluate(`document.documentElement.scrollWidth<=innerWidth`),true);
  await evaluate(`Array.from(document.querySelectorAll('.connection-link')).find(b=>b.textContent==='S.S. Aqua').click()`);
  assert.equal(await evaluate(`document.querySelector('.location-card h2').textContent`),'S.S. Aqua');
  await evaluate(`Array.from(document.querySelectorAll('.connection-link')).find(b=>b.textContent==='Olivine City').click()`);
  assert.equal(await evaluate(`document.querySelector('.location-card h2').textContent`),'Olivine City');
  await evaluate(`(()=>{const s=document.querySelector('#location-search');s.value='Kanto';s.dispatchEvent(new Event('input'));})()`);
  assert.ok(await evaluate(`Array.from(document.querySelectorAll('.location-card h2')).some(h=>h.textContent==='Pallet Town')`));
 }
 await command('Emulation.clearDeviceMetricsOverride');assert.deepEqual(exceptions,[]);
});

test('Kanto uses save registrations, National species links and every map choice across themes',async()=>{
 const data=atlasCaughtFixture();data.save.pokedex.allCaughtSpecies.push(150);data.save.pokedex.allSeenSpecies.push(150);
 await caughtAtlas(data,'Route 1');
 assert.equal(await evaluate(`Array.from(document.querySelectorAll('.encounter-entry')).filter(r=>r.querySelector('[data-species-id="19"]')).every(r=>r.querySelector('.caught-indicator'))`),true);
 assert.equal(await evaluate(`Array.from(document.querySelectorAll('.encounter-entry')).filter(r=>r.querySelector('[data-species-id="161"]')).some(r=>r.querySelector('.caught-indicator'))`),false);
 const before=await evaluate(`import('/js/adventures.js').then(async a=>JSON.stringify(await a.getActiveProfile()))`);
 for(const width of [320,390,1440])for(const theme of ['light','dark']){
  await command('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:width<800});
  await command('Page.navigate',{url:baseURL+'/pokedex-earth/#location=Cerulean%20Cave'});
  await until(()=>evaluate(`document.querySelector('.location-map')?.naturalWidth>0&&document.querySelector('[data-species-id="150"] .caught-indicator')`),'Kanto map and registrations');
  await evaluate(`localStorage.setItem('pokemon-reader-theme',${JSON.stringify(theme)});dispatchEvent(new StorageEvent('storage',{key:'pokemon-reader-theme'}));document.querySelector('[data-encounter-section="legendary"]').open=true;`);
  assert.equal(await evaluate(`document.documentElement.scrollWidth<=innerWidth`),true);
  assert.match(await evaluate(`document.querySelector('[data-species-id="150"]').href`),/#species=150&scope=national$/);
  if(process.env.KANTO_SCREENSHOT_DIR&&[390,1440].includes(width)){const shot=await command('Page.captureScreenshot',{format:'png'});await require('node:fs/promises').writeFile(path.join(process.env.KANTO_SCREENSHOT_DIR,`kanto-${width}-${theme}.png`),Buffer.from(shot.data,'base64'));}
 }
 assert.equal(await evaluate(`import('/js/adventures.js').then(async a=>JSON.stringify(await a.getActiveProfile()))`),before);
 await atlas();
 const decoded=await evaluate(`(async()=>{const {KANTO_MAPS}=await import('/js/data/games/soulsilver/kanto-maps.js');const failures=[];for(const m of Object.values(KANTO_MAPS.locations).flat()){const i=new Image();i.src='/assets/maps/'+m.file;try{await i.decode();if(i.naturalWidth!==m.width||i.naturalHeight!==m.height)failures.push(m.file);}catch{failures.push(m.file);}}return failures;})()`);
 assert.deepEqual(decoded,[]);
 await command('Emulation.clearDeviceMetricsOverride');assert.deepEqual(exceptions,[]);
});

test('Platinum loads PKHeX binary fixtures through shared Reader on phones and desktop and restores an isolated profile',async()=>{
 const raw=await readFile(path.join(root,'tests/fixtures/gen4/platinum/postgame.sav'));
 await command('Fetch.disable');await command('Page.navigate',{url:baseURL+'/'});
 await until(()=>evaluate(`document.querySelector('#app-version')?.textContent==='0.27.0'`),'Reader initialized');
 await evaluate(`document.querySelector('#new-adventure').checked=true;(()=>{const f=new DataTransfer();f.items.add(new File([Uint8Array.from(atob('${raw.toString('base64')}'),c=>c.charCodeAt(0))],'wrong-soulsilver-name.sav'));const input=document.querySelector('#save-file');input.files=f.files;input.dispatchEvent(new Event('change'));})()`);
 await until(()=>evaluate(`document.querySelector('#file-status').classList.contains('success')`),'Platinum read');
 assert.equal(await evaluate(`document.querySelector('#trainer-name-value').textContent`),'Cynthia');
 assert.equal(await evaluate(`document.querySelector('#badges-value').textContent`),'8 / 8');
 assert.equal(await evaluate(`document.querySelectorAll('#badge-grid .earned').length`),8);
 assert.match(await evaluate(`document.querySelector('#game-progress').textContent`),/Main story cleared: Yes/);
 for(const width of [320,390,1440]){
  await command('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<500});
  await evaluate(`location.hash='party'`);await until(()=>evaluate(`!document.querySelector('#party-info').hidden`),'Platinum party');
  assert.equal(await evaluate(`document.documentElement.scrollWidth<=innerWidth`),true);
  await evaluate(`document.querySelectorAll('#party-grid .pokemon-detail-button')[1].click()`);
  await until(()=>evaluate(`document.querySelector('#pokemon-detail-dialog').open`),'Platinum details');
  const text=await evaluate(`document.querySelector('#pokemon-detail-content').textContent`);
  assert.equal(await evaluate(`document.querySelector("#pokemon-detail-dialog-title").textContent`),"Röcky");assert.match(text,/Poké Ball/);assert.match(text,/Metal Coat/);assert.match(text,/Rock Head/);assert.match(text,/Hidden Power/);assert.match(text,/17/);
  assert.equal(await evaluate(`document.querySelector('#pokemon-detail-dialog').scrollWidth<=document.querySelector('#pokemon-detail-dialog').clientWidth`),true);
  await evaluate(`document.querySelector('#pokemon-detail-close').click()`);
 }
 const id=await evaluate(`(async()=>{const api=await import('/js/adventures.js');return (await api.getActiveProfile()).id;})()`);
 assert.equal(await evaluate(`(async()=>{const api=await import('/js/adventures.js');return (await api.getActiveProfile()).gameId;})()`),'platinum');
 await command('Page.reload');await until(()=>evaluate(`document.querySelector('#trainer-name-value')?.textContent==='Cynthia'`),'Platinum restored');
 assert.equal(await evaluate(`document.querySelector('#badges-value').textContent`),'8 / 8');
 await fixtureReader();assert.equal(await evaluate(`document.querySelector('#badges-value').textContent`),'2 / 16');
 assert.equal(await evaluate(`(async()=>{const api=await import('/js/adventures.js');return (await api.listProfiles()).some(p=>p.id===${JSON.stringify(id)}&&p.gameId==='platinum');})()`),true);
 assert.equal(await evaluate(`document.querySelector('#game-progress')===null`),true);
});

test('Platinum evolution exports preserve DSV containers and profiles, with explicit simulated night on phones',async()=>{
 const {vectors,evolutionFixture,dsv}=require('./fixtures/gen4/evolution.cjs');
 const {detectSave}=await import('../js/saves/index.js');
 for(const vector of [vectors[0],vectors.find(v=>v.from===207&&!v.blocked)]){
  const {bytes}=await evolutionFixture(vector),input=dsv(bytes);
  await fixtureReader(detectSave(bytes),input,true,'Platinum.DSV');
  await command('Emulation.setDeviceMetricsOverride',{width:320,height:900,deviceScaleFactor:1,mobile:true});
  await evaluate(`location.hash='party'`);await until(()=>evaluate(`!document.querySelector('#party-info').hidden`),'Party');
  await evaluate(`document.querySelector('#party-grid .pokemon-detail-button').click()`);
  await until(()=>evaluate(`document.querySelector('#pokemon-detail-dialog').open`),'Details');
  const before=await evaluate(`(async()=>{const api=await import('/js/adventures.js');return JSON.stringify((await api.getActiveProfile()).snapshot);})()`);
  if(vector.time){
   assert.equal(await evaluate(`document.querySelector('.evolve-button').disabled`),true);
   await evaluate(`(()=>{const select=document.querySelector('[aria-label="Simulated game time"]');select.value='day';select.dispatchEvent(new Event('change'));})()`);
   assert.equal(await evaluate(`document.querySelector('.evolve-button').disabled`),true);
   await evaluate(`(()=>{const select=document.querySelector('[aria-label="Simulated game time"]');select.value='night';select.dispatchEvent(new Event('change'));})()`);
   assert.equal(await evaluate(`document.querySelector('.evolve-button').disabled`),false);
  }
  assert.equal(await evaluate(`document.querySelector('#pokemon-detail-dialog').scrollWidth<=document.querySelector('#pokemon-detail-dialog').clientWidth`),true);
  await evaluate(`(()=>{window.confirm=()=>true;const old=URL.createObjectURL;URL.createObjectURL=blob=>{globalThis.__exportBlob=blob;return old(blob);};HTMLAnchorElement.prototype.click=function(){globalThis.__exportName=this.download;};document.querySelector('.evolve-button').click();})()`);
  await until(()=>evaluate(`document.querySelector('#file-status').textContent.includes('Downloaded Platinum.evolved.DSV')`),'Evolution export');
  const exported=await evaluate(`(async()=>Array.from(new Uint8Array(await globalThis.__exportBlob.arrayBuffer())))()`);
  assert.equal(await evaluate(`globalThis.__exportName`),'Platinum.evolved.DSV');
  const output=Uint8Array.from(exported),loaded=detectSave(output);
  assert.equal(loaded.valid,true);assert.equal(loaded.party[0].speciesId,vector.to);
  assert.deepEqual(output.subarray(0x80000),input.subarray(0x80000));
  assert.equal(await evaluate(`(async()=>{const api=await import('/js/adventures.js');return JSON.stringify((await api.getActiveProfile()).snapshot);})()`),before);
 }
});

test('Platinum Pokédex preserves native learnsets and game selection, with working Sinnoh links on phone and desktop',async()=>{
 for(const width of [320,1440]){
  await command('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<500});
  await referenceDex('#scope=regional&game=platinum');
  assert.equal(await evaluate(`document.querySelector('#reference-game').value`),'platinum');
  assert.equal(await evaluate(`document.querySelectorAll('.species-row').length`),210);
  assert.equal(await evaluate(`document.querySelector('.species-row strong').textContent`),'Turtwig');
  await evaluate(`document.querySelector('[data-species-id="387"]').click()`);
  await until(()=>evaluate(`document.querySelector('#reference-detail').open`),'Turtwig');
  assert.match(await evaluate(`document.querySelector('#reference-content').textContent`),/Sinnoh #001/);
  assert.doesNotMatch(await evaluate(`document.querySelector('#reference-content').textContent`),/Available HGSS|in SoulSilver/);
  await evaluate(`document.querySelector('#reference-close').click()`);
  await until(()=>evaluate(`!document.querySelector('#reference-detail').open`),'Close');
  await evaluate(`document.querySelector('#species-search').value='396';document.querySelector('#reference-search').requestSubmit();document.querySelector('[data-species-id="396"]').click()`);
  await until(()=>evaluate(`document.querySelector('#reference-detail').open`),'Starly');
  const href=await evaluate(`[...document.querySelectorAll('.reference-locations a')].find(a=>a.textContent==='Open Route 201 in Atlas').href`);
  assert.match(href,/game=platinum/);
  await command('Page.navigate',{url:href});
  await until(()=>evaluate(`document.querySelector('.location-card h2')?.textContent==='Route 201'`),'Platinum Atlas');
  assert.equal(await evaluate(`document.querySelector('#location-count').textContent`),'1 of 125 locations');
  assert.equal(await evaluate(`document.documentElement.scrollWidth<=innerWidth`),true);
  assert.equal(await evaluate(`!!document.querySelector('.encounter-name[href*="game=platinum"]')`),true);
  await evaluate(`document.querySelector('.connection-link').click()`);
  assert.equal(await evaluate(`location.hash.includes('game=platinum')`),true);
  await evaluate(`location.hash='johto'`);
  await until(()=>evaluate(`!document.querySelector('#johto-home').hidden`),'SoulSilver region');
  await evaluate(`location.hash='atlas'`);
  await until(()=>evaluate(`document.querySelector('#location-count').textContent==='1 of 122 locations'`),'SoulSilver navigation');
 }
 await referenceDex('#game=platinum');
 await evaluate(`document.querySelector('#reference-game').value='soulsilver';document.querySelector('#reference-game').dispatchEvent(new Event('change'))`);
 assert.equal(await evaluate(`document.querySelectorAll('.species-row').length`),256);
 assert.equal(await evaluate(`location.hash.includes('platinum')`),false);
 assert.deepEqual(exceptions,[]);
});

test('Platinum Pokédex save filters count party and PC ownership separately from registrations and hide other-game flags',async()=>{
 const bytes=await readFile(path.join(root,'tests/fixtures/gen4/platinum/postgame.sav'));const {detectSave}=await import('../js/saves/index.js');
 await fixtureReader(detectSave(bytes),bytes,true,'save.sav');
 await referenceDex('#scope=national&game=platinum');
 assert.equal(await evaluate(`document.querySelector('#save-filter').disabled`),false);
 assert.match(await evaluate(`document.querySelector('#species-487').textContent`),/Owned: 2/);
 assert.equal(await evaluate(`document.querySelector('#species-487 [aria-label="Caught: No"]')!==null`),true);
 await evaluate(`document.querySelector('#save-filter').value='owned';document.querySelector('#save-filter').dispatchEvent(new Event('change'))`);
 assert.equal(await evaluate(`document.querySelector('#species-487')!==null`),true);
 await evaluate(`document.querySelector('#reference-game').value='soulsilver';document.querySelector('#reference-game').dispatchEvent(new Event('change'))`);
 assert.equal(await evaluate(`document.querySelector('#save-filter').disabled`),true);
 assert.equal(await evaluate(`document.querySelectorAll('.save-status').length`),0);
 assert.equal(await evaluate(`document.querySelectorAll('.species-row').length`),493);
 // Legacy SoulSilver species URLs retain their meaning even with an active Pt save.
 await referenceDex('#species=25&scope=national');
 assert.equal(await evaluate(`document.querySelector('#reference-game').value`),'soulsilver');
 assert.equal(await evaluate(`document.querySelector('#save-filter').disabled`),true);
 assert.match(await evaluate(`document.querySelector('#reference-content').textContent`),/Available SoulSilver abilities/);
});

test('Platinum Atlas exposes every location and native floor plan with working warp navigation on phones and desktop',async()=>{
 for(const width of [320,1440]){
  await command('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<500});
  await command('Page.navigate',{url:baseURL+'/pokedex-earth/#location=Mt.%20Coronet&game=platinum'});
  await until(()=>evaluate(`document.querySelector('.location-card h2')?.textContent==='Mt. Coronet'`),'Sinnoh Coronet');
  await until(()=>evaluate(`document.querySelector('.location-map')?.naturalWidth>0`),'Native map');
  assert.equal(await evaluate(`document.querySelectorAll('.map-controls select option').length`),14);
  assert.equal(await evaluate(`document.documentElement.scrollWidth<=innerWidth`),true);
  assert.match(await evaluate(`document.querySelector('.map-notice')?.textContent || document.querySelector('.location-card').textContent`),/Platinum native tile plan/);
  assert.equal(await evaluate(`document.querySelector('.location-map').alt.includes('SoulSilver')`),false);
  await evaluate(`document.querySelector('.map-controls select').value='1';document.querySelector('.map-controls select').dispatchEvent(new Event('change'))`);
  await until(()=>evaluate(`document.querySelector('.location-map').src.includes('mt_coronet_2f.png')`),'Second floor');
  await until(()=>evaluate(`document.querySelector('.map-stair-marker')!==null`),'Native warp marker');
  const before=await evaluate(`document.querySelector('.map-controls select').value`);
  await evaluate(`document.querySelector('.map-stair-marker:not(.is-one-way)').click()`);
  assert.notEqual(await evaluate(`document.querySelector('.map-controls select').value`),before);
  await evaluate(`document.querySelector('.location-map-link').click()`);
  await until(()=>evaluate(`document.querySelector('.map-viewer').open`),'Full-size native map');
  assert.equal(await evaluate(`document.querySelector('.map-viewer').scrollWidth<=document.querySelector('.map-viewer').clientWidth`),true);
  await evaluate(`document.querySelector('.map-viewer-header button').click();document.querySelector('#location-search').value='Lost Tower';document.querySelector('#location-search').dispatchEvent(new Event('input'))`);
  assert.equal(await evaluate(`document.querySelector('.location-card h2').textContent`),'Lost Tower');
  assert.equal(await evaluate(`document.querySelectorAll('.map-controls select option').length`),5);
  await evaluate(`document.querySelector('#location-search').value='';document.querySelector('#location-search').dispatchEvent(new Event('input'))`);
  assert.equal(await evaluate(`document.querySelector('#location-count').textContent`),'125 of 125 locations');
  for(const n of ['Route 201','Route 230','Distortion World','Hall of Origin','Underground','Great Marsh'])assert.equal(await evaluate(`[...document.querySelectorAll('.location-card h2')].some(h=>h.textContent===${JSON.stringify(n)})`),true);
 }
 assert.deepEqual(exceptions,[]);
});

test('Great Marsh keeps unknown slots explicit and restores only matching Platinum daily state without changing the profile',async()=>{
 await command('Page.navigate',{url:baseURL+'/pokedex-earth/#great-marsh&game=platinum'});
 await until(()=>evaluate(`document.querySelector('#great-marsh-status')?.textContent.includes('unknown')`),'Unknown daily selection');
 assert.match(await evaluate(`document.querySelector('#great-marsh').textContent`),/10% daily slots remain unknown/);
 const bytes=await readFile(path.join(root,'tests/fixtures/gen4/platinum/postgame.sav'));const {detectSave}=await import('../js/saves/index.js');await fixtureReader(detectSave(bytes),bytes,true,'Pt.sav');
 const snapshot=await evaluate(`(async()=>JSON.stringify((await (await import('/js/adventures.js')).getActiveProfile()).snapshot))()`);
 for(const width of [320,1440]){
  await command('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<500});
  await command('Page.navigate',{url:baseURL+'/pokedex-earth/#great-marsh&game=platinum'});
  await until(()=>evaluate(`document.querySelector('#great-marsh-status')?.textContent.includes('Saved daily selection')`),'Loaded daily selection');
  assert.equal(await evaluate(`document.querySelectorAll('#great-marsh-area option').length`),6);
  assert.equal(await evaluate(`document.querySelector('#great-marsh-visitor').value`),'454');
  assert.match(await evaluate(`document.querySelector('#great-marsh').textContent`),/Complete 100% distribution/);
  assert.equal(await evaluate(`document.documentElement.scrollWidth<=innerWidth`),true);
  await evaluate(`document.querySelector('#great-marsh-area').value='3';document.querySelector('#great-marsh-area').dispatchEvent(new Event('change'));document.querySelector('#great-marsh-time').value='night';document.querySelector('#great-marsh-time').dispatchEvent(new Event('change'))`);
  assert.match(await evaluate(`document.querySelector('#great-marsh-status').textContent`),/Hypothetical/);
  assert.equal(await evaluate(`(async()=>JSON.stringify((await (await import('/js/adventures.js')).getActiveProfile()).snapshot))()`),snapshot);
  await evaluate(`document.querySelector('#great-marsh button').click()`);
  await until(()=>evaluate(`document.querySelector('#great-marsh-status').textContent.includes('Saved daily selection')`),'Restore saved conditions');
  await evaluate(`[...document.querySelectorAll('#great-marsh button')].find(b=>b.textContent==='Open Area 3 in Atlas').click()`);
  await until(()=>evaluate(`document.querySelector('.location-card h2')?.textContent==='Great Marsh'`),'Marsh Atlas');
  assert.equal(await evaluate(`document.querySelector('.map-controls select').selectedOptions[0].textContent.includes('Great Marsh 3')`),true);
 }
 await fixtureReader();
 await command('Page.navigate',{url:baseURL+'/pokedex-earth/#great-marsh&game=platinum'});
 await until(()=>evaluate(`document.querySelector('#great-marsh-status')?.textContent.includes('unknown')`),'SoulSilver state isolated');
 assert.equal(await evaluate(`document.querySelector('#great-marsh button').disabled`),true);
 assert.deepEqual(exceptions,[]);
});

test('Platinum reuses the existing EV finder with native badge conditions and links to exact Sinnoh map areas',async()=>{
 await command('Page.navigate',{url:baseURL+'/pokedex-earth/#ev-training&game=platinum'});
 await until(()=>evaluate(`document.querySelector('#ev-results .ev-result')!==null`),'Platinum EV results');
 assert.match(await evaluate(`document.querySelector('#ev-intro').textContent`),/Platinum/);
 assert.match(await evaluate(`document.querySelector('#ev-results .ev-result').textContent`),/Fen Badge/);
 assert.doesNotMatch(await evaluate(`document.querySelector('#ev-results .ev-result').textContent`),/Fog Badge|Johto|Kanto|Safari Zone/);
 assert.equal(await evaluate(`document.querySelector('#ev-method option[value="headbutt"]').hidden`),true);
 await evaluate(`document.querySelector('#ev-results .ev-open-location').click()`);
 await until(()=>evaluate(`document.querySelector('.location-card')!==null`),'Sinnoh EV location');
 assert.equal(await evaluate(`location.hash.includes('game=platinum')&&location.hash.includes('area=MAP_HEADER_')`),true);
 assert.equal(await evaluate(`document.querySelector('#location-count').textContent.includes('125 locations')`),true);
 await evaluate(`location.hash='ev-training'`);
 await until(()=>evaluate(`document.querySelector('#ev-intro').textContent.includes('SoulSilver')`),'SoulSilver EV restored');
 assert.equal(await evaluate(`document.querySelector('#ev-method option[value="headbutt"]').hidden`),false);
 assert.deepEqual(exceptions,[]);
});

test('unsupported game URLs show an explicit limitation and never borrow SoulSilver or Platinum reference data',async()=>{
 for(const width of [320,1440]){
  await command('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<500});
  await command('Page.navigate',{url:baseURL+'/pokedex-earth/#location=New%20Bark%20Town&game=emerald'});
  await until(()=>evaluate(`document.querySelector('#atlas-game-status')?.hidden===false`),'Unsupported Atlas state');
  assert.match(await evaluate(`document.querySelector('#atlas-game-status').textContent`),/not supported/);
  assert.equal(await evaluate(`document.querySelector('#atlas-browser').hidden`),true);
  assert.equal(await evaluate(`document.querySelector('#johto-tool-nav').hidden`),true);
  await evaluate(`document.querySelector('#atlas-home a[href="#sinnoh"]').click()`);
  await until(()=>evaluate(`document.querySelector('#sinnoh-home')?.hidden===false`),'Supported region recovers');
  for(const hash of ['safari=1&game=platinum','great-marsh&game=soulsilver']){
   await evaluate(`location.hash=${JSON.stringify(hash)}`);
   await until(()=>evaluate(`document.querySelector('#atlas-game-status')?.hidden===false`),'Wrong-game mechanic is unavailable');
   assert.match(await evaluate(`document.querySelector('#atlas-game-status').textContent`),/tool is not available/);
   assert.equal(await evaluate(`document.querySelector('#safari-mini-atlas').hidden&&document.querySelector('#great-marsh').hidden`),true);
  }
  await referenceDex('#species=25&scope=national&game=emerald');
  assert.equal(await evaluate(`document.querySelectorAll('.species-row').length`),0);
  assert.equal(await evaluate(`document.querySelector('#reference-detail').open`),false);
  assert.equal(await evaluate(`document.querySelector('#species-search').disabled`),true);
  assert.match(await evaluate(`document.querySelector('#reference-status').textContent`),/not supported/);
  await evaluate(`document.querySelector('#reference-game').value='platinum';document.querySelector('#reference-game').dispatchEvent(new Event('change'))`);
  assert.equal(await evaluate(`document.querySelectorAll('.species-row').length`),210);
  await evaluate(`location.hash='species=25&scope=national&game='`);
  await until(()=>evaluate(`document.querySelector('#species-list').hidden`),'Empty game is unsupported');
  await evaluate(`location.hash='species=25&scope=national'`);
  await until(()=>evaluate(`document.querySelector('#reference-detail').open`),'Legacy supported link recovers');
  assert.equal(await evaluate(`document.querySelector('#reference-game').value`),'soulsilver');
  assert.equal(await evaluate(`document.querySelectorAll('.species-row').length`),493);
  assert.match(await evaluate(`document.querySelector('#reference-content').textContent`),/Available SoulSilver abilities/);
  assert.equal(await evaluate(`document.documentElement.scrollWidth<=innerWidth`),true);
 }
 assert.deepEqual(exceptions,[]);
});

test('an open Platinum Pokedex refreshes only changed profile revisions and clears other-game save indicators',async()=>{
 const raw=await readFile(path.join(root,'tests/fixtures/gen4/platinum/postgame.sav'));const {detectSave}=await import('../js/saves/index.js');
 await fixtureReader(detectSave(raw),raw,true,'platinum.sav');await referenceDex('#species=487&scope=national&game=platinum');
 assert.match(await evaluate(`document.querySelector('#species-487').textContent`),/Owned: 2/);
 await evaluate(`globalThis.__originalSpeciesCard=document.querySelector('#reference-content').firstElementChild;document.querySelector('#reference-content details').open=false;`);
 const first=await evaluate(`(async()=>{const a=await import('/js/adventures.js');const p=await a.getActiveProfile();const row=document.querySelector('#species-487');globalThis.__originalDexRow=row;a.notifyAdventureChange();return p.id;})()`);
 await evaluate(`new Promise(r=>setTimeout(r,100))`);
 assert.equal(await evaluate(`document.querySelector('#species-487')===globalThis.__originalDexRow`),true);
 await evaluate(`(async()=>{const a=await import('/js/adventures.js');await a.persistSnapshot(a.createSnapshot(${JSON.stringify(fixture('Silver'))},'ss.sav'),{newAdventure:true});})()`);
 await until(()=>evaluate(`document.querySelector('#save-filter').disabled`),'Other-game profile clears indicators');
 assert.equal(await evaluate(`document.querySelector('#reference-game').value`),'platinum');
 assert.equal(await evaluate(`document.querySelectorAll('.save-status').length`),0);
 assert.equal(await evaluate(`document.querySelector('#reference-detail').open`),true);
 assert.equal(await evaluate(`document.querySelector('#reference-content').firstElementChild===globalThis.__originalSpeciesCard`),true);
 await evaluate(`(async()=>{const a=await import('/js/adventures.js');await a.selectProfile(${JSON.stringify(first)});})()`);
 await until(()=>evaluate(`document.querySelector('#species-487').textContent.includes('Owned: 2')`),'Matching Platinum profile restores ownership');
 await evaluate(`(async()=>{const a=await import('/js/adventures.js');const p=await a.getActiveProfile(),s=structuredClone(p.snapshot);s.loadedAt=new Date(Date.parse(s.loadedAt)+1000).toISOString();s.pokedex.allCaughtSpecies.push(487);s.pokedex.caughtSpecies.push(487);s.pokedex.caughtCount++;s.pokedex.caughtPercent=s.pokedex.caughtCount/s.pokedex.speciesCount*100;await a.persistSnapshot(s,{profileId:p.id});})()`);
 await until(()=>evaluate(`document.querySelector('#species-487 [aria-label="Caught: Yes"]')!==null`),'Replacement save refreshes registrations');
 assert.equal(await evaluate(`document.querySelector('#reference-detail').open`),true);
 assert.equal(await evaluate(`document.querySelector('#reference-content details').open`),false);
 await evaluate(`document.querySelector('#reference-close').click()`);
 assert.equal(await evaluate(`document.activeElement.dataset.speciesId`),'487');
 assert.deepEqual(exceptions,[]);
});

test('Platinum party and PC displayed levels and Hidden Power match fresh independent PKHeX observations',async()=>{
 const references=JSON.parse(await readFile(path.join(root,'tests/fixtures/gen4/platinum/derived.json'),'utf8'));
 const {detectSave}=await import('../js/saves/index.js');
 for(const [name,entry]of Object.entries(references.fixtures)){
  const raw=await readFile(path.join(root,`tests/fixtures/gen4/platinum/${name}.sav`));
  await fixtureReader(detectSave(raw),raw,true,'misleading-soulsilver.DSV');
  for(const p of entry.pokemon){
   if(p.box){
    await evaluate(`location.hash='storage'`);
    await until(()=>evaluate(`!document.querySelector('#storage-info').hidden`),'PC route');
    await evaluate(`document.querySelector('#box-select').value=${JSON.stringify(String(p.box))};document.querySelector('#box-select').dispatchEvent(new Event('change'))`);
    await evaluate(`document.querySelectorAll('#box-grid > article')[${p.slot-1}].querySelector('.pokemon-detail-button').click()`);
   }else{
    await evaluate(`location.hash='party'`);
    await until(()=>evaluate(`!document.querySelector('#party-info').hidden`),'Party route');
    await evaluate(`document.querySelectorAll('#party-grid .pokemon-detail-button')[${p.slot-1}].click()`);
   }
   await until(()=>evaluate(`document.querySelector('#pokemon-detail-content').getAttribute('aria-busy')==='false'`),'Derived details');
   assert.equal(await evaluate(`document.querySelector('#pokemon-detail-content .hidden-power').textContent`),`Hidden Power: ${p.hiddenPowerType} · Power ${p.hiddenPowerPower}`);
   assert.match(await evaluate(`document.querySelector('#pokemon-detail-content').textContent`),new RegExp(`Level${p.level}(?:\\D|$)`));
   await evaluate(`document.querySelector('#pokemon-detail-close').click()`);
  }
 }
 assert.deepEqual(exceptions,[]);
});
