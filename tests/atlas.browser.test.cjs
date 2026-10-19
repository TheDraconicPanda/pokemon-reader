const { before, beforeEach, after, test } = require("node:test");
const assert = require("node:assert/strict");
const { spawn, spawnSync } = require("node:child_process");
const { mkdtemp, readFile, rm, mkdir } = require("node:fs/promises");
const { tmpdir } = require("node:os");
const path = require("node:path");
const httpServer = require("http-server");
const { fixture } = require("./fixtures/reader.cjs");
const { syntheticSave } = require('./fixtures/soulsilver.cjs');

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

let atlasVisit = 0;
async function atlas({ directory = true } = {}) {
  await command("Page.navigate", { url: `${baseURL}/pokedex-earth/?test=${++atlasVisit}#atlas` });
  await until(() => evaluate(`document.querySelector('#location-count')?.textContent === '1 of 70 locations'`),
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

// Profiles persist across page navigation within a test; tests start independently.
beforeEach(async () => {
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
  assert.equal(cards.length, 70);
  const names = new Set(cards.map((card) => card.name));
  assert.equal(names.size, 70);
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
  assert.deepEqual(result.searchResults, ["Route 39", "Route 47", "Route 48", "Safari Zone Gate", "Safari Zone"]);
  assert.equal(result.empty, true);
  assert.equal(result.routes.length, 23);
  assert.ok(result.routes.every((name) => /^Route \d+$/.test(name)));
  assert.equal(result.reset, 70);
  assert.equal(result.emptyHidden, true);
});

test("all Atlas locations display static information, sources, and mobile layouts", async () => {
  await atlas();
  const result = await evaluate(`(() => {
    const cards = Array.from(document.querySelectorAll('.location-card'));
    const complete = cards.every(card => card.querySelectorAll('.location-static h3').length === 1 && card.querySelectorAll('.location-static > div li').length >= 1 && !card.querySelector('.location-overview > div > p') && !card.querySelector('.compass-current figcaption') && card.querySelectorAll('.location-sources a').length >= 2);
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
    version: document.title.includes('v0.25.54') && document.querySelector('.eyebrow').textContent.includes('v0.25.54'),
    safari: new Set(Array.from(Array.from(document.querySelectorAll('.location-card')).find(c => c.querySelector('h2').textContent === 'Safari Zone').querySelectorAll('.encounter-entry'),r=>r.dataset.encounterIndex)).size,
    route32: new Set(Array.from(Array.from(document.querySelectorAll('.location-card')).find(c => c.querySelector('h2').textContent === 'Route 32').querySelectorAll('.encounter-entry'),r=>r.dataset.encounterIndex)).size
  })`);
  assert.equal(result.version, true);
  assert.equal(result.safari, 269);
  assert.equal(result.route32, 33);
  const html = await readFile(path.join(root, "index.html"), "utf8");
  assert.match(html, /<title>Pokémon Reader — v0\.25\.54<\/title>/);
  await command("Page.navigate", { url: `${baseURL}/` });
  await until(() => evaluate(`document.querySelector('#app-version')?.textContent === '0.25.54'`), "Save reader did not initialize");
  assert.equal(await evaluate("document.title"), "Pokémon Reader — v0.25.54");
  assert.deepEqual(exceptions, []);
});

test("Reader rejects an invalid save without crashing", async () => {
  await command("Page.navigate", { url: `${baseURL}/` });
  await until(() => evaluate(`document.querySelector('#app-version')?.textContent === '0.25.54'`), "Reader did not initialize");
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


async function fixtureReader(data = fixture(), bytes = null) {
  await command('Fetch.enable', {patterns:[{urlPattern:'*/js/saves/soulsilver.js'},{urlPattern:'https://pokeapi.co/*'}]});
  await command('Page.navigate', {url:baseURL + '/'});
  await until(() => evaluate(`document.querySelector('#app-version')?.textContent === '0.25.54'`), 'Reader did not initialize');
  await uploadFixture(data, true, bytes);
}
async function uploadFixture(data, separateAdventure = true, bytes = null) {
  const payload = bytes ? `Uint8Array.from(atob('${Buffer.from(bytes).toString('base64')}'),c=>c.charCodeAt(0))` : 'new Uint8Array(512*1024)';
  await evaluate(`globalThis.__readerFixture = ${JSON.stringify(data)}; document.querySelector('#new-adventure').checked = ${separateAdventure}; (() => {
    const files = new DataTransfer(); files.items.add(new File([${payload}], 'ui-fixture.sav'));
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
  await until(() => evaluate(`document.querySelector('#app-version')?.textContent === '0.25.54'`),'Reader ready');
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
  await until(() => evaluate(`document.querySelector('#app-version')?.textContent === '0.25.54'`),'Reader ready');
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
    const layout=await evaluate(`({overflow:document.documentElement.scrollWidth>innerWidth,heading:document.activeElement.textContent,nav:document.querySelector('.location-connections').getBoundingClientRect().bottom,encounters:document.querySelector('.location-encounters').getBoundingClientRect().top,button:document.querySelector('.connection-link').getBoundingClientRect().bottom,rows:new Set(Array.from(document.querySelectorAll('.encounter-entry'),r=>r.dataset.encounterIndex)).size})`);
    assert.equal(layout.overflow,false); assert.equal(layout.heading,'Safari Zone');
    assert.ok(layout.nav<=layout.encounters); assert.ok(layout.button<=844); assert.equal(layout.rows,269);
    assert.equal(await evaluate(`document.querySelector('.location-connections').getBoundingClientRect().bottom <= document.querySelector('.location-static').getBoundingClientRect().top`),true);
    await evaluate(`document.querySelector('#location-search').value='New Bark Town';document.querySelector('#location-search').dispatchEvent(new Event('input'));document.querySelector('.compass-west button').click()`);
  }
  await command('Emulation.clearDeviceMetricsOverride');
  await atlas({directory:false});
  assert.equal(await evaluate(`document.querySelector('.location-card h2').textContent`),'New Bark Town');
});


test('Atlas separates overview and encounters for every location at mobile and desktop widths', async () => {
  await atlas();
  const baseline = await evaluate(`Array.from(document.querySelectorAll('.location-card'), card => ({name:card.querySelector('h2').textContent,entries:Array.from(card.querySelectorAll('.encounter-entry'),row=>row.textContent)}))`);
  assert.equal(baseline.filter(location=>location.entries.length).length,54);
  for (const width of [320,390,768,1440]) {
    await command('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:width<800});
    assert.deepEqual(await evaluate(`Array.from(document.querySelectorAll('.location-card')).filter(card => {
      const overview=card.querySelector('.location-overview');
      const encounters=card.querySelector('.location-encounters');
      return !overview || encounters.parentElement!==card || overview.parentElement!==card ||
        !overview.contains(card.querySelector('.location-connections')) || !overview.contains(card.querySelector('.location-static')) ||
        overview.contains(encounters) || overview.getBoundingClientRect().bottom+8>encounters.getBoundingClientRect().top ||
        !card.getAttribute('aria-labelledby') || !encounters.getAttribute('aria-label') ||
        (encounters.querySelectorAll('.encounter-entry').length===0 && !encounters.textContent.includes('No fixed wild encounters'));
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
      const routes = Array.from(document.querySelectorAll('.location-card')).filter(card => /^Route \\d+$/.test(card.querySelector('h2').textContent));
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
  assert.equal(cards.length,70);
  assert.equal(cards.filter(c=>c.rows===0).length,16);
  assert.ok(cards.every(c=>!c.text.includes('not been added')));
  for (const name of ['Cherrygrove City','Dark Cave','Ilex Forest','Mt. Mortar','Ice Path']) assert.ok(cards.find(c=>c.name===name).rows>0,name);
  assert.match(cards.find(c=>c.name==='Goldenrod City').text,/No fixed wild encounters/);
  assert.equal(cards.find(c=>c.name==='Safari Zone').rows,269);
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
      locations++;
      const select=card.querySelector('.map-select');
      if(!maps.length||!!select!==(maps.length>1))failures.push(name+': controls');
      for(const [index,map] of maps.entries()) {
        if(select){select.value=String(index);select.dispatchEvent(new Event('change'));}
        views++;
        const image=card.querySelector('.location-map');
        const source=card.querySelector('.location-sources a[href*="archives.bulbagarden.net"]');
        if(!image?.src.endsWith('/'+map.file)||source?.href!==new URL(map.source,location.href).href)
          failures.push(name+': '+map.label);
      }
    }
    return {locations,views,failures};
  })()`);
  assert.equal(result.locations,69);assert.equal(result.views,150);assert.deepEqual(result.failures,[]);
  assert.deepEqual(exceptions,[]);
});

test('structured location details expand, search and fit mobile without changing encounters',async()=>{
  for(const width of [320,390,1440]) {
    await command('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:width<800});
    await atlas();
    const coverage=await evaluate(`Array.from(document.querySelectorAll('.location-card')).filter(c=>c.querySelector('h2').textContent!=='Safari Zone').map(c=>({name:c.querySelector('h2').textContent,count:c.querySelectorAll('.location-reference').length}))`);
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
  await until(()=>evaluate(`document.querySelector('#location-count')?.textContent==='1 of 70 locations'`),'Direct Atlas location');
  assert.equal(await evaluate(`document.querySelector('.location-card h2').textContent`),'Violet City');
  await command('Page.navigate',{url:baseURL+'/pokedex-earth/#location=%E0%A4%A'});
  await until(()=>evaluate(`document.querySelector('#location-count')?.textContent==='1 of 70 locations'`),'Invalid deep link fallback');
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
      const expected=locationEncounterReference('soulsilver',name)?.encounters.length??(name==='Safari Zone'?269:0);
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
    assert.equal(await evaluate(`document.querySelector('#johto-home button').disabled`),true);
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
        assert.deepEqual(state.labels,['Load Save','Team Planner','Atlas',theme==='dark'?'Light mode':'Dark mode']);
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
    assert.equal(await evaluate(`document.querySelector('#location-count').textContent`),'3 of 70 locations');
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
  const {bytes}=syntheticSave(64);
  await fixtureReader(detectSoulSilver(bytes.buffer), bytes);
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
  assert.equal(await evaluate(`globalThis.__parseCount`),1,'Export must not implicitly reload the generated file');
  await command('Fetch.disable');
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
  assert.equal(await evaluate(`document.querySelector('[data-hm="Strength"] .hm-actual').textContent.includes('in PC')`),true);
  assert.deepEqual(await currentPlan('plan.links.machamp.identity'),original);
  data.storage.boxes[5].pokemon[0]={slot:1,empty:true};
  data.party.push({...structuredClone(pokemon),slot:4,recordKind:'party',personality:999,nickname:'Different Machamp'});
  await plannerSave(data);
  await until(()=>evaluate(`document.querySelector('[data-member="machamp"] .link-status')?.textContent.includes('Not found')`),'Missing link was silently reassigned');
  assert.equal(await evaluate(`document.querySelector('[data-member="machamp"] .ev-last-known').textContent.includes('Attack 252')`),true);
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
      for(const tab of ['team','hms','evs','bench']) {
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
