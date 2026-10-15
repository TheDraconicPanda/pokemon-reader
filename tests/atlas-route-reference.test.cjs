const { test } = require('node:test');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
const load = relative => import(pathToFileURL(path.join(__dirname, '..', relative)).href);
const data = async () => (await load('js/data/games/soulsilver/route-encounters.js')).SOULSILVER_ROUTE_ENCOUNTERS.routes;

test('all existing routes have game-scoped encounters and feature coverage', async () => {
  const routes = await data();
  const { SOULSILVER_ROUTE_FEATURES: features } = await load('js/data/games/soulsilver/route-features.js');
  assert.equal(features.gameId, 'soulsilver');
  assert.equal(Object.keys(routes).length, 23);
  for (let n = 26; n <= 48; n++) {
    const name = `Route ${n}`;
    assert.ok(routes[name].length > 0, name);
    assert.ok(features.routes[name].items.length > 0, name);
    assert.ok(features.routes[name].npcs.length > 0, name);
    for (const item of features.routes[name].items) {
      assert.ok(item.name && item.location);
      assert.doesNotMatch(item.location, /onlyC|partyC|TODO|TBD/);
    }
  }
});

test('normal method/time distributions total 100%; radio replacements total 40%', async () => {
  for (const [name, rows] of Object.entries(await data())) {
    const distributions = new Map();
    for (const row of rows) {
      assert.deepEqual(row.times, [...new Set(row.times)], `${name}: duplicate time`);
      assert.deepEqual(row.levels, [...new Set(row.levels)].sort((a, b) => a - b));
      assert.ok(row.levels.every(value => Number.isInteger(value) && value >= 1 && value <= 100));
      if (row.percent === null || row.conditions.includes('swarm')) continue;
      assert.ok(Number.isInteger(row.percent) && row.percent > 0 && row.percent <= 100);
      for (const time of row.times.length ? row.times : ['morn', 'day', 'nite']) {
        const key = [row.method, row.conditions.join(','), time].join('|');
        distributions.set(key, (distributions.get(key) || 0) + row.percent);
      }
    }
    for (const [key, total] of distributions) {
      assert.equal(total, /hoenn-sound|sinnoh-sound/.test(key) ? 40 : 100, `${name}: ${key}`);
    }
  }
});

test('Route 29 has SoulSilver day/night and Headbutt Pokémon, without invented water encounters', async () => {
  const rows = (await data())['Route 29'];
  assert.deepEqual(rows.find(r => r.pokemon === 'Hoothoot' && r.method === 'walking'), {
    method: 'walking', pokemon: 'Hoothoot', levels: [2, 3, 4], times: ['nite'], percent: 85, conditions: []
  });
  assert.ok(rows.some(r => r.pokemon === 'Pidgey' && r.percent === 55 && r.times.includes('day')));
  assert.ok(rows.some(r => r.pokemon === 'Ledyba' && r.conditions.includes('tree-b') && r.percent === 30));
  assert.ok(!rows.some(r => r.pokemon === 'Spinarak' || ['surfing', 'old_rod', 'good_rod', 'super_rod'].includes(r.method)));
  const { routeFeatures } = await load('js/data/atlas-route-reference.js');
  const features = routeFeatures('soulsilver', 'Route 29');
  assert.ok(features.items.some(item => item.name === 'Grn Apricorn' && /daily/.test(item.location)));
  assert.match(features.npcs.join(' '), /Tuscany.*Tuesdays.*TwistedSpoon.*Shock Ribbon/);
});

test('conditional encounters use actual method, version, unlock and discrete level rules', async () => {
  const routes = await data();
  for (const [method, rate] of [['old_rod', 15], ['good_rod', 65], ['super_rod', 100]]) {
    const qwilfish = routes['Route 32'].find(r => r.pokemon === 'Qwilfish' && r.method === method && r.conditions.includes('swarm'));
    assert.equal(qwilfish.percent, rate);
  }
  assert.ok(routes['Route 35'].some(r => r.pokemon === 'Spearow' && r.method === 'gift' && r.levels[0] === 20));
  assert.ok(routes['Route 36'].some(r => r.pokemon === 'Sudowoodo' && r.conditions.includes('squirtbottle')));
  assert.ok(routes['Route 38'].some(r => r.pokemon === 'Burmy' && r.conditions.includes('special-tree')));
  assert.ok(routes['Route 47'].some(r => r.pokemon === 'Ditto' && r.conditions.includes('swarm')));
  assert.ok(!routes['Route 41'].some(r => r.pokemon === 'Mantine'));
  assert.ok(!routes['Route 46'].some(r => r.pokemon === 'Ekans'));
  const { formatLevels, routeEncounters } = await load('js/data/atlas-route-reference.js');
  assert.equal(formatLevels([2, 4]), '2, 4');
  assert.equal(formatLevels([15,16,17,18,19,20,21,22,23,24,25,36]), '15–25, 36');
  const headings = routeEncounters('soulsilver', 'Route 29').map(r => r.method).join(' ');
  assert.match(headings, /Wednesday.*National Pokédex/);
  assert.match(headings, /Thursday.*National Pokédex/);
});

test('future games never silently inherit SoulSilver route information', async () => {
  const { routeEncounters, routeFeatures } = await load('js/data/atlas-route-reference.js');
  for (const game of ['heartgold', 'platinum', '__proto__', 'constructor', '', undefined]) {
    assert.equal(routeEncounters(game, 'Route 29'), null);
    assert.equal(routeFeatures(game, 'Route 29'), null);
  }
  assert.equal(routeEncounters('soulsilver', 'Dark Cave'), null);
  assert.equal(routeEncounters('soulsilver', '__proto__'), null);
});
