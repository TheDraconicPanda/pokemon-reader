const { before, after, test } = require("node:test");
const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const { mkdtemp, readFile, rm } = require("node:fs/promises");
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
  browser = spawn(process.env.CHROMIUM_PATH || "chromium", [
    "--headless", "--no-sandbox", "--no-first-run", "--disable-extensions",
    "--disable-gpu", "--disable-dev-shm-usage", "--remote-debugging-port=0",
    `--user-data-dir=${profile}`, "about:blank"
  ], { stdio: ["ignore", "ignore", "pipe"] });
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
      else if (request.url.includes('/pokemon/')) body = JSON.stringify({types:[{type:{name:'electric'}}],abilities:[{ability:{name:'static',url:'https://pokeapi.co/api/v2/ability/9/'}}]});
      else if (request.url.includes('/move/')) body = JSON.stringify({name:'pound',pp:35});
      else body = '{}';
      command('Fetch.fulfillRequest', {requestId,responseCode:200,responseHeaders:[{name:'Content-Type',value:request.url.includes('.js')?'text/javascript':'application/json'},{name:'Access-Control-Allow-Origin',value:'*'}],body:Buffer.from(body).toString('base64')}).catch(error => browserLog += error.message);
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
  assert.match(html, /<title>Pokémon Reader — v0\.25\.29<\/title>/);
  await command("Page.navigate", { url: `${baseURL}/` });
  await until(() => evaluate(`document.querySelector('#app-version')?.textContent === '0.25.29'`), "Save reader did not initialize");
  assert.equal(await evaluate("document.title"), "Pokémon Reader — v0.25.29");
  assert.deepEqual(exceptions, []);
});

test("Reader rejects an invalid save without crashing", async () => {
  await command("Page.navigate", { url: `${baseURL}/` });
  await until(() => evaluate(`document.querySelector('#app-version')?.textContent === '0.25.29'`), "Reader did not initialize");
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
  for (const view of ["party", "storage", "pokedex", "collection", "overview"]) {
    await evaluate(`document.querySelector('[data-view="${view}"]').click()`);
    await until(() => evaluate(`document.querySelector('[data-view="${view}"]').getAttribute('aria-current') === 'page'`), "View did not switch");
    assert.equal(await evaluate(`document.activeElement.id`), "view-heading");
    assert.equal(await evaluate(`Array.from(document.querySelectorAll('[data-reader-view]')).every(p => p.classList.contains('inactive-view') === (p.dataset.readerView !== '${view}'))`), true);
    assert.equal(await evaluate(`document.querySelector('#view-empty').hidden`), view === "overview");
  }
  await evaluate(`document.querySelector('#theme-toggle').click()`);
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
  await until(() => evaluate(`document.querySelector('#app-version')?.textContent === '0.25.29'`), 'Reader did not initialize');
  await uploadFixture(data);
}
async function uploadFixture(data) {
  await evaluate(`globalThis.__readerFixture = ${JSON.stringify(data)}; (() => {
    const files = new DataTransfer(); files.items.add(new File([new Uint8Array(512*1024)], 'ui-fixture.sav'));
    const input=document.querySelector('#save-file'); input.files=files.files; input.dispatchEvent(new Event('change'));
  })()`);
  await until(() => evaluate(`document.querySelector('#file-status').classList.contains('success')`), 'Fixture save did not render');
}
test('Overview displays parsed summaries and replaces stale save state', async () => {
  await fixtureReader();
  assert.equal(await evaluate(`document.querySelector('#trainer-name-value').textContent`),'Test Trainer');
  assert.equal(await evaluate(`document.querySelector('#overview-summary').hidden`),false);
  assert.equal(await evaluate(`document.querySelector('#overview-stats').textContent.includes('PC Pokémon2')`),true);
  assert.equal(await evaluate(`document.querySelectorAll('.overview-shortcuts a').length`),4);
  await uploadFixture(fixture('Replacement'));
  assert.equal(await evaluate(`document.querySelector('#trainer-name-value').textContent`),'Replacement');
  assert.equal(await evaluate(`document.querySelector('.app').getAttribute('aria-busy')`),'false');
  await command('Fetch.disable');
});

test('Party keeps six slots and shared details retain fields, moves, and focus', async () => {
  await fixtureReader();
  await evaluate(`location.hash='party'`);
  await until(() => evaluate(`document.querySelector('[data-view="party"]').getAttribute('aria-current') === 'page'`), 'Party route');
  assert.equal(await evaluate(`document.querySelectorAll('#party-grid > article').length`),6);
  assert.equal(await evaluate(`document.querySelectorAll('.empty-party-slot').length`),4);
  assert.equal(await evaluate(`document.querySelectorAll('#party-grid > article')[2].textContent.includes('Buddy')`),true);
  assert.equal(await evaluate(`document.querySelector('.hp-bar').value`),25);
  assert.equal(await evaluate(`document.querySelector('.shiny-label').textContent`),'★ Shiny');
  await evaluate(`document.querySelector('#party-grid .pokemon-detail-button').focus(); document.activeElement.click()`);
  await until(() => evaluate(`document.querySelector('#pokemon-detail-content').getAttribute('aria-busy') === 'false'`), 'Detail loaded');
  const content=await evaluate(`document.querySelector('#pokemon-detail-content').textContent`);
  for (const value of ['Summary','Stats','Moves','Training','History','Original','PP 20 / 49','PP Ups: 2','Empty move slot','Hidden Power']) assert.ok(content.includes(value),value);
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
