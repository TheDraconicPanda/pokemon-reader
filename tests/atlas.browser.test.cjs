const { before, after, test } = require("node:test");
const assert = require("node:assert/strict");
const { spawn, spawnSync } = require("node:child_process");
const { mkdtemp, readFile, rm, mkdir } = require("node:fs/promises");
const { tmpdir } = require("node:os");
const path = require("node:path");
const httpServer = require("http-server");
const { fixture } = require("./fixtures/reader.cjs");

const root = path.resolve(__dirname, "..");
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let server, browser, profile, socket, baseURL;
let nextId = 0;
const pending = new Map();
const exceptions = [];
let browserLog = "";
let apiUnavailable = false;

async function until(operation, message) {
  const deadline = Date.now() + 15000;
  while (Date.now() < deadline) {
    const result = await operation();
    if (result) return result;
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

async function atlas() {
  await command("Page.navigate", { url: `${baseURL}/pokedex-earth/` });
  await until(() => evaluate(`document.querySelector('#location-count')?.textContent === '58 of 58 locations'`),
    "Atlas did not finish rendering");
}

before(async () => {
  assert.equal(typeof WebSocket, "function", "Use Node.js 22 or later");
  server = httpServer.createServer({ root, cache: -1 });
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
    "--headless", "--no-sandbox", "--no-first-run", "--disable-extensions",
    "--disable-gpu", "--disable-dev-shm-usage", "--remote-debugging-port=0",
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
  assert.equal(cards.length, 58);
  const names = new Set(cards.map((card) => card.name));
  assert.equal(names.size, 58);
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
  assert.deepEqual(result.searchResults, ["Route 47", "Route 48", "Safari Zone Gate", "Safari Zone"]);
  assert.equal(result.empty, true);
  assert.equal(result.routes.length, 20);
  assert.ok(result.routes.every((name) => /^Route \d+$/.test(name)));
  assert.equal(result.reset, 58);
  assert.equal(result.emptyHidden, true);
});

test("encounter sections remain populated and release labels agree", async () => {
  await atlas();
  const result = await evaluate(`({
    version: document.title.includes('v0.25.27') && document.querySelector('.eyebrow').textContent.includes('v0.25.27'),
    safari: Array.from(document.querySelectorAll('.location-card')).find(c => c.querySelector('h2').textContent === 'Safari Zone').querySelectorAll('.encounter-entry').length,
    route32: Array.from(document.querySelectorAll('.location-card')).find(c => c.querySelector('h2').textContent === 'Route 32').querySelectorAll('.encounter-entry').length
  })`);
  assert.equal(result.version, true);
  assert.equal(result.safari, 269);
  assert.equal(result.route32, 38);
  const html = await readFile(path.join(root, "index.html"), "utf8");
  assert.match(html, /<title>Pokémon Reader — v0\.25\.35<\/title>/);
  await command("Page.navigate", { url: `${baseURL}/` });
  await until(() => evaluate(`document.querySelector('#app-version')?.textContent === '0.25.35'`), "Save reader did not initialize");
  assert.equal(await evaluate("document.title"), "Pokémon Reader — v0.25.35");
  assert.deepEqual(exceptions, []);
});

test("Reader rejects an invalid save without crashing", async () => {
  await command("Page.navigate", { url: `${baseURL}/` });
  await until(() => evaluate(`document.querySelector('#app-version')?.textContent === '0.25.35'`), "Reader did not initialize");
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
  assert.equal(await evaluate(`document.querySelector('#party-count').textContent`), "1 / 6 ready");
  await command("Page.reload");
  await until(() => evaluate(`document.querySelector('#party-count')?.textContent === '1 / 6 ready'`), "Planner did not restore progress");
  assert.equal(await evaluate(`document.querySelector('#kingdra').checked`), true);
  for (const tab of ["hms", "evs", "bench", "team"]) {
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
  for (const view of ["party", "storage", "pokedex", "collection", "overview"]) {
    await evaluate(`document.querySelector('[data-view="${view}"]').click()`);
    await until(() => evaluate(`document.querySelector('[data-view="${view}"]').getAttribute('aria-current') === 'page'`), "View did not switch");
    assert.equal(await evaluate(`document.activeElement.id`), "view-heading");
    assert.equal(await evaluate(`Array.from(document.querySelectorAll('[data-reader-view]')).every(p => p.classList.contains('inactive-view') === (p.dataset.readerView !== '${view}'))`), true);
    assert.equal(await evaluate(`document.querySelector('#view-empty').hidden`), true);
  }
  await evaluate(`document.querySelector('#theme-toggle').click()`);
  await command("Fetch.disable");
  await command("Page.reload");
  await until(() => evaluate(`document.documentElement.dataset.theme === 'light'`), "Theme was not persisted");
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


async function fixtureReader(data = fixture()) {
  await command('Fetch.enable', {patterns:[{urlPattern:'*/js/saves/soulsilver.js'},{urlPattern:'https://pokeapi.co/*'}]});
  await command('Page.navigate', {url:baseURL + '/'});
  await until(() => evaluate(`document.querySelector('#app-version')?.textContent === '0.25.35'`), 'Reader did not initialize');
  await uploadFixture(data);
}
async function uploadFixture(data) {
  await evaluate(`globalThis.__readerFixture = ${JSON.stringify(data)}; (() => {
    const files = new DataTransfer(); files.items.add(new File([new Uint8Array(512*1024)], 'ui-fixture.sav'));
    const input=document.querySelector('#save-file'); input.files=files.files; input.dispatchEvent(new Event('change'));
  })()`);
  await until(() => evaluate(`document.querySelector('#file-status').classList.contains('${data.valid ? 'success' : 'error'}')`), 'Fixture save did not render');
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

test('Pokédex separates registrations from ownership and preserves regional scope', async () => {
  const data = fixture(); data.save.pokedex.caughtSpecies=[25,152]; data.save.pokedex.caughtCount=2;
  await fixtureReader(data);
  await evaluate(`location.hash='pokedex'`);
  await until(() => evaluate(`document.querySelectorAll('.dex-entry').length === 3`),'Dex entries');
  assert.equal(await evaluate(`document.querySelector('[data-species="152"]').textContent.includes('Currently Owned: No')`),true);
  assert.equal(await evaluate(`document.querySelector('[data-species="133"]').textContent.includes('Caught: No')`),true);
  assert.equal(await evaluate(`document.querySelector('[data-species="133"]').textContent.includes('Currently Owned: Yes (1)')`),true);
  await evaluate(`var filter=document.querySelector('#dex-filter'); filter.value='owned'; filter.dispatchEvent(new Event('change'));`);
  await until(() => evaluate(`document.querySelectorAll('.dex-entry').length === 2`),'Owned filter');
  await evaluate(`var search=document.querySelector('#dex-search'); search.value='EEVEE'; search.dispatchEvent(new Event('input'));`);
  await until(() => evaluate(`document.querySelectorAll('.dex-entry').length === 1`),'Dex search');
  assert.equal(await evaluate(`document.querySelector('.dex-entry').dataset.species`),'133');
  const regional=fixture('Regional'); regional.save.pokedex={...regional.save.pokedex,nationalDex:false,speciesIds:[25]};
  await evaluate(`document.querySelector('#dex-search').value=''; document.querySelector('#dex-filter').value='all';`);
  await uploadFixture(regional);
  await until(() => evaluate(`document.querySelectorAll('.dex-entry').length === 1`),'Regional scope');
  assert.equal(await evaluate(`document.querySelector('#pokedex-mode-value').textContent`),'Regional Dex');
  assert.equal(await evaluate(`document.querySelector('.dex-entry').dataset.species`),'25');
  await command('Fetch.disable');
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
      for (const view of ['overview','party','storage','pokedex','collection']) {
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

test('Metadata outage retains parsed data with honest fallback labels', async () => {
  apiUnavailable=true;
  try {
    await fixtureReader();
    assert.equal(await evaluate(`document.querySelector('#trainer-name-value').textContent`),'Test Trainer');
    assert.equal(await evaluate(`document.querySelector('#party-grid').textContent.includes('Sparky')`),true);
    assert.equal(await evaluate(`document.querySelector('#dex-count').textContent.includes('Species names unavailable')`),true);
    await evaluate(`location.hash='party'`);
    await until(() => evaluate(`document.querySelector('[data-view="party"]').getAttribute('aria-current') === 'page'`),'Party route');
    await evaluate(`document.querySelector('#party-grid .pokemon-detail-button').click()`);
    await until(() => evaluate(`document.querySelector('#pokemon-detail-content').getAttribute('aria-busy') === 'false'`),'Fallback detail');
    const content=await evaluate(`document.querySelector('#pokemon-detail-content').textContent`);
    assert.ok(content.includes('AbilityUnknown'));
    assert.ok(content.includes('20/?'));
    assert.equal(await evaluate(`document.querySelector('.training-section tbody tr').textContent`),'HP311');
  } finally { apiUnavailable=false; await command('Fetch.disable'); }
});

test('Pagination and rapid replacement do not reparse or resurrect stale information', async () => {
  const data=fixture(); data.save.pokedex.speciesIds=Array.from({length:100},(_,i)=>i+1);
  await fixtureReader(data);
  await until(() => evaluate(`document.querySelectorAll('.dex-entry').length === 40`),'Initial Dex page');
  await evaluate(`document.querySelector('#dex-more').click()`);
  await until(() => evaluate(`document.querySelectorAll('.dex-entry').length === 80`),'More Dex entries');
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
  for (const id of ['trainer-info','party-info','storage-info','pokedex-info','collection-info','collection-gender-info','unown-form-info','collection-details-info','overview-summary']) {
    assert.equal(await evaluate(`document.querySelector('#${id}').hidden`),true,id);
  }
  assert.equal(await evaluate(`document.querySelector('#party-grid').childElementCount`),0);
  assert.equal(await evaluate(`document.querySelector('#dex-list').childElementCount`),0);
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
  await until(() => evaluate(`document.querySelector('#app-version')?.textContent === '0.25.35'`),'Reader ready');
  assert.equal(await evaluate(`document.querySelector('.header-actions, #dashboard-save-status, #game-value')`),null);
  assert.equal(await evaluate(`document.querySelector('.secondary-nav').firstElementChild.id`),'load-save');
  assert.equal(await evaluate(`document.querySelector('.secondary-nav').lastElementChild.id`),'theme-toggle');
  assert.equal(await evaluate(`document.querySelector('.dashboard-nav').nextElementSibling.className`),'view-intro');
  assert.equal(await evaluate(`document.querySelector('#upload-area').hidden`),false);
  await fixtureReader();
  assert.equal(await evaluate(`document.querySelector('#upload-area').hidden`),true);
  assert.equal(await evaluate(`document.querySelector('#overview-summary').hidden`),false);
  await evaluate(`location.hash='pokedex'; document.querySelector('#dex-search').value='pikachu'; document.querySelector('#load-save').click()`);
  await until(() => evaluate(`document.querySelector('[data-view="overview"]').getAttribute('aria-current') === 'page'`),'Reset route');
  for (const id of ['overview-summary','trainer-info','party-info','storage-info','pokedex-info','collection-info']) {
    assert.equal(await evaluate(`document.querySelector('#${id}').hidden`),true,id);
  }
  assert.equal(await evaluate(`document.querySelector('#upload-area').hidden`),false);
  assert.equal(await evaluate(`document.querySelector('#file-status').textContent`),'No save file loaded.');
  assert.equal(await evaluate(`document.querySelector('#dex-search').value`),'');
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
  for (const [destination, view] of [['party','party'],['storage','storage'],['seen','pokedex'],['caught','pokedex'],['owned','collection'],['shiny','collection']]) {
    await evaluate(`location.hash='overview'`);
    await until(() => evaluate(`document.querySelector('[data-view="overview"]').getAttribute('aria-current') === 'page'`),'Overview route');
    await evaluate(`document.querySelector('.summary-button[data-destination="${destination}"]').click()`);
    await until(() => evaluate(`document.querySelector('[data-view="${view}"]').getAttribute('aria-current') === 'page'`),'Summary destination');
    if (destination === 'seen' || destination === 'caught') assert.equal(await evaluate(`document.querySelector('#dex-filter').value`),destination);
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
  for (const view of ['party','storage','pokedex','collection']) {
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
  assert.equal(await evaluate(`document.querySelectorAll('.dashboard-nav [aria-disabled="true"]').length`),4);
  await uploadFixture({valid:false,game:'Not detected',activePartition:null,reason:'Invalid test save',party:[],save:null});
  assert.equal(await evaluate(`document.querySelectorAll('.dashboard-nav [aria-disabled="true"]').length`),4);
  await command('Fetch.disable');
});

test('Top ribbon links and actions share the same vertical alignment', async () => {
  await command('Page.navigate',{url:baseURL+'/'});
  await until(() => evaluate(`document.querySelector('#app-version')?.textContent === '0.25.35'`),'Reader ready');
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
