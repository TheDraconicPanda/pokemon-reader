const { test } = require('node:test');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const { readFile } = require('node:fs/promises');
const path = require('node:path');
const load = relative => import(pathToFileURL(path.join(__dirname, '..', relative)).href);
const dataset = async () => (await load('js/data/games/soulsilver/location-encounters.js')).SOULSILVER_LOCATION_ENCOUNTERS;

test('all 69 non-Safari locations have explicit verified encounter coverage', async () => {
  const { ATLAS_LOCATIONS } = await load('js/data/atlas-locations.js');
  const { locationEncounterReference } = await load('js/data/atlas-route-reference.js');
  let empty = 0;
  for (const location of ATLAS_LOCATIONS) {
    const reference = locationEncounterReference('soulsilver', location.name);
    if (location.name === 'Safari Zone') { assert.equal(reference, null); continue; }
    assert.ok(reference, location.name);
    assert.ok(['verified', 'no-fixed-wild'].includes(reference.status));
    assert.equal(reference.encounters.length === 0, reference.status === 'no-fixed-wild', location.name);
    if (!reference.encounters.length) empty++;
    assert.ok(reference.encounters.every(row => row.pokemon && row.levels && row.method && row.rate));
    assert.equal(locationEncounterReference('heartgold', location.name), null);
  }
  assert.equal(empty, 16);
  assert.equal(locationEncounterReference('soulsilver', 'Unknown cave'), null);
});

test('every floor/method/time distribution is valid and no bank placeholders become Pokémon', async () => {
  const { gameId, locations } = await dataset();
  assert.equal(gameId, 'soulsilver');
  for (const [name, reference] of Object.entries(locations)) {
    const distributions = new Map();
    for (const row of reference.encounters) {
      assert.doesNotMatch(row.pokemon, /^(None|Missingno)$/i);
      assert.deepEqual(row.levels, [...new Set(row.levels)].sort((a,b)=>a-b));
      assert.ok(row.levels.length && row.levels.every(n=>Number.isInteger(n)&&n>=1&&n<=100), name);
      assert.equal(new Set(row.times).size, row.times.length, name);
      if (row.percent === null || row.conditions.includes('swarm')) continue;
      assert.ok(Number.isInteger(row.percent) && row.percent>0 && row.percent<=100);
      for (const time of row.times.length ? row.times : ['morn','day','nite']) {
        const key = [row.area,row.method,row.conditions.join(','),time].join('|');
        distributions.set(key,(distributions.get(key)||0)+row.percent);
      }
    }
    for (const [key, percent] of distributions) {
      assert.equal(percent, /hoenn-sound|sinnoh-sound/.test(key) ? 40 : 100, `${name}: ${key}`);
    }
  }
});

test('Cherrygrove coast includes Surf, nighttime fishing and its special tree', async () => {
  const rows = (await dataset()).locations['Cherrygrove City'].encounters;
  assert.equal(rows.find(r=>r.method==='surfing'&&r.pokemon==='Tentacool').percent,90);
  assert.equal(rows.find(r=>r.method==='surfing'&&r.pokemon==='Tentacruel').percent,10);
  assert.ok(rows.some(r=>r.method==='good_rod'&&r.pokemon==='Corsola'&&r.times.includes('day')&&!r.times.includes('nite')));
  assert.ok(rows.some(r=>r.method==='good_rod'&&r.pokemon==='Staryu'&&r.times.join()==='nite'));
  assert.ok(rows.some(r=>r.method==='headbutt'&&r.pokemon==='Taillow'&&r.conditions.includes('special-tree')));
});

test('caves retain all actual floors, two Dark Cave sides, and gated method ownership', async () => {
  const { locations } = await dataset();
  const areas = name => new Set(locations[name].encounters.map(r=>r.area));
  for (const floor of ['1F','B1F','B2F','B3F']) assert.ok(areas('Ice Path').has(floor));
  for (const floor of ['1F · entrance','1F · back','2F','B1F']) assert.ok(areas('Mt. Mortar').has(floor));
  assert.ok(areas('Dark Cave').has('Route 31 / Route 46 side'));
  assert.ok(areas('Dark Cave').has('Route 45 side'));
  assert.ok(locations['Dark Cave'].encounters.some(r=>r.pokemon==='Dunsparce'&&r.area==='Route 31 / Route 46 side'&&r.conditions.includes('swarm')));
  assert.ok(locations['Mt. Mortar'].encounters.some(r=>r.pokemon==='Marill'&&r.conditions.includes('swarm')&&r.area==='1F · entrance'));
  assert.deepEqual(areas('Sprout Tower'),new Set(['2F','3F']));
  assert.ok(locations['Victory Road'].encounters.some(r=>r.method==='rock-smash'&&r.pokemon==='Geodude'&&r.area==='3F'));
  assert.ok(locations['Cliff Cave'].encounters.filter(r=>r.method==='rock-smash').every(r=>r.area==='B1F'));
  assert.ok(locations['Violet City'].encounters.some(r=>r.conditions.includes('swarm')&&r.method==='super_rod'&&r.pokemon==='Whiscash'));
});

test('contest distributions use the actual cumulative thresholds and National Dex weekday sets', async () => {
  const rows = (await dataset()).locations['National Park'].encounters.filter(r=>r.method==='contest');
  assert.equal(rows.length,40);
  for (const condition of ['contest-pre-dex','contest-tuesday','contest-thursday','contest-saturday']) {
    const group = rows.filter(r=>r.conditions.includes(condition));
    assert.equal(group.length,10);
    assert.equal(group.reduce((sum,r)=>sum+r.percent,0),100);
  }
  assert.equal(rows.find(r=>r.conditions.includes('contest-pre-dex')&&r.pokemon==='Caterpie').percent,20);
  assert.equal(rows.find(r=>r.conditions.includes('contest-pre-dex')&&r.pokemon==='Butterfree').percent,10);
  assert.ok(rows.some(r=>r.conditions.includes('contest-thursday')&&r.pokemon==='Volbeat'));
  assert.ok(rows.some(r=>r.conditions.includes('contest-saturday')&&r.pokemon==='Illumise'));
});

test('stationary, weekly and story encounters preserve SoulSilver levels and conditions', async () => {
  const { locations } = await dataset();
  for (const [name,pokemon,level] of [['Bell Tower','Ho-Oh',70],['Whirl Islands','Lugia',45],['Embedded Tower','Groudon',50],['Embedded Tower','Rayquaza',50],['Mt. Silver','Moltres',50],['Lake of Rage','Gyarados (shiny)',30]]) {
    const row = locations[name].encounters.find(r=>r.pokemon===pokemon);
    assert.ok(row, pokemon);assert.deepEqual(row.levels,[level]);assert.equal(row.percent,null);
    assert.ok(row.conditions.length);
  }
  assert.ok(!locations['Embedded Tower'].encounters.some(r=>r.pokemon==='Kyogre'));
  const { locationEncounterReference } = await load('js/data/atlas-route-reference.js');
  assert.equal(locationEncounterReference('soulsilver','Union Cave').encounters.find(r=>r.pokemon==='Lapras').rate,'Weekly');
  assert.equal(locations['Team Rocket HQ'].encounters.find(r=>r.pokemon==='Voltorb').levels[0],23);
  assert.match(locationEncounterReference('soulsilver','Route 29').notes.join(' '),/Raikou and Entei.*40/);
  assert.match(locationEncounterReference('soulsilver','Route 26').notes.join(' '),/Latios.*35/);
  assert.ok(!locationEncounterReference('soulsilver','Route 27').notes.some(n=>/Roaming/.test(n)));
});

test('Unown has a gated hall and separately gated punctuation forms', async () => {
  const reference = (await dataset()).locations['Ruins of Alph'];
  const hall = reference.encounters.filter(r=>r.area==='Underground hall');
  assert.equal(hall.length,1);
  assert.equal(hall[0].pokemon,'Unown');assert.equal(hall[0].percent,100);
  assert.ok(hall[0].conditions.includes('unown-puzzle'));
  const entrance = reference.encounters.filter(r=>r.area==='Hall entrance');
  assert.equal(entrance.length,2);
  assert.ok(entrance.every(r=>r.percent===50&&r.conditions.includes('unown-complete')));
  assert.match(reference.notes.join(' '),/Kabuto.*A–J.*Omanyte.*K–Q.*Aerodactyl.*R–V.*Ho-Oh.*W–Z/);
});

test('scope inventory includes every dungeon floor and records special Unown map variants', async () => {
  const scope = JSON.parse(await readFile(path.join(__dirname,'../js/data/games/soulsilver/encounter-scope.json'),'utf8'));
  assert.equal(Object.keys(scope).length,46);
  assert.equal(scope['Safari Zone'],undefined);
  assert.ok(scope['Victory Road'].maps.some(m=>m.mapId==='MAP_VICTORY_ROAD_3F'));
  assert.ok(scope['Ruins of Alph'].maps.some(m=>m.mapId==='MAP_RUINS_OF_ALPH_HALL_ENTRANCE_SINJOH_EVENT'&&m.specialOnly));
  assert.ok(scope['Mt. Silver'].maps.some(m=>m.mapId==='MAP_MOUNT_SILVER_CAVE_MOLTRES_CHAMBER'));
});

test('the published audit accounts for every non-Safari location with current counts and reference evidence', async () => {
  const audit = JSON.parse(await readFile(path.join(__dirname,'../docs/atlas-encounter-audit.json'),'utf8'));
  const { ATLAS_LOCATIONS } = await load('js/data/atlas-locations.js');
  const { locationEncounterReference } = await load('js/data/atlas-route-reference.js');
  assert.equal(audit.locations.length,69);
  assert.deepEqual(audit.locations.map(r=>r.location).sort(),ATLAS_LOCATIONS.filter(l=>l.name!=='Safari Zone').map(l=>l.name).sort());
  for (const row of audit.locations) {
    const current = locationEncounterReference('soulsilver',row.location);
    assert.equal(row.encounter_status,current.status);
    assert.equal(row.encounter_records,current.encounters.length,row.location);
    assert.deepEqual(row.unresolved_wild_gaps,[]);
    for (const source of ['serebii','bulbapedia']) {
      assert.ok(row.references.some(r=>r.source===source&&r.http_status===200&&/^[a-f0-9]{64}$/.test(r.sha256)));
    }
    if (row.notes) assert.deepEqual(row.notes,current.notes);
  }
});
