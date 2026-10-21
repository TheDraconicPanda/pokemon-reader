// Static scope/coverage audit; run from any directory with Node.js 22+.
// Browser checks and pinned-source reproduction are separate validation steps.
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { ATLAS_LOCATIONS } from '../js/data/atlas-locations.js';
import { locationDetails } from '../js/data/atlas-location-reference.js';
import { locationEncounterReference } from '../js/data/atlas-route-reference.js';
import { mapsForLocation } from '../js/data/atlas-maps.js';
import { mapLinksForLocation } from '../js/data/atlas-map-links.js';
import { travelConnection } from '../js/data/atlas-travel.js';
import { EV_STATS, evEncounterTables, rankEvTraining, scoreEvEncounters } from '../js/data/atlas-ev-training.js';
import { encounterSections } from '../js/atlas-encounter-sections.js';
const game = 'soulsilver';
const root = new URL('../', import.meta.url);
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const locations = ATLAS_LOCATIONS.filter(l => l.name !== 'Safari Zone');
const names = new Set(locations.map(l => l.name));
assert.equal(names.size, 69);
assert.ok(names.has('Safari Zone Gate'));
const visited = new Set();
function visit(name) {
  if (visited.has(name)) return;
  visited.add(name);
  for (const next of locations.find(l => l.name === name).connections) if (names.has(next)) visit(next);
}
visit('New Bark Town');
assert.equal(visited.size, names.size, 'Disconnected Johto reference group');
const assets = new Map();
const records = [];
for (const location of locations) {
  const name = location.name;
  const reference = locationEncounterReference(game, name);
  const details = locationDetails(game, name);
  const maps = mapsForLocation(game, name);
  assert.ok(maps.length, `${name}: no map reference`);
  assert.equal(new Set(maps.map(m => m.id)).size, maps.length, `${name}: duplicate map IDs`);
  const covered = new Set(encounterSections(reference.encounters).flatMap(s => s.entries.map(r => r.index)));
  assert.equal(covered.size, reference.encounters.length, `${name}: undisplayed encounter`);
  assert.ok(reference.encounters.length || reference.status === 'no-fixed-wild', `${name}: missing absence status`);
  const edges = location.connections.filter(to => to !== 'Safari Zone');
  for (const to of edges) {
    assert.ok(names.has(to), `${name}: unknown destination ${to}`);
    assert.ok(travelConnection(game, name, to), `${name}: missing directed travel annotation for ${to}`);
  }
  for (const map of maps) {
    if (!assets.has(map.file)) {
      const bytes = await readFile(new URL('assets/maps/' + map.file, root));
      assert.equal(sha(bytes), map.sha256, map.file);
      assert.equal(bytes.readUInt32BE(16), map.width, map.file);
      assert.equal(bytes.readUInt32BE(20), map.height, map.file);
      assets.set(map.file, map.sha256);
    }
  }
  const pairs = mapLinksForLocation(game, name)?.pairs || [];
  assert.equal(new Set(pairs.map(p => p.id)).size, pairs.length, `${name}: duplicate connection letters`);
  for (const pair of pairs) {
    assert.equal(pair.ends.length, 2);
    for (const end of pair.ends) {
      const map = maps.find(m => m.id === end.mapId);
      assert.ok(map, `${name}: unknown endpoint map`);
      assert.ok(end.x > 0 && end.x < map.width && end.y > 0 && end.y < map.height, `${name}: marker outside map`);
    }
  }
  records.push({name, mapViews:maps.length, encounterRecords:reference.encounters.length,
    encounterStatus:reference.status, directedEdges:edges.length,
    reciprocalConnections:pairs.filter(p => !p.oneWay).length,
    oneWayHoles:pairs.filter(p => p.oneWay).length,
    references:Object.fromEntries(['items','gifts','offers','services','trainers'].map(k => [k, details[k].length]))});
}
const evTables = {};
for (const time of ['morn','day','nite']) {
  const tables = evEncounterTables(game, time);
  evTables[time] = tables.length;
  for (const table of tables) for (const stat of Object.keys(EV_STATS)) scoreEvEncounters(game, table.rows, stat);
}
const baseline = JSON.parse(await readFile(new URL('docs/atlas-integrated-audit-2026-10-20.json', root)));
const unchangedContent = {};
for (const [file, expected] of Object.entries(baseline.datasetHashes)) {
  if (file.endsWith('/maps.js')) continue; // Map expansions are covered by their newer source ledgers.
  unchangedContent[file] = sha(await readFile(new URL(file, root))) === expected;
  assert.ok(unchangedContent[file], `${file}: content changed since the source-page audit; re-audit required`);
}
const report = {
  gameId:game, scope:'Existing Johto and League/Mt. Silver approach groups; Safari Zone Gate included',
  excluded:['Safari area data/mechanics/calculator','New Kanto and Sinjoh locations'],
  counts:{locations:records.length, mapViews:records.reduce((n,r)=>n+r.mapViews,0), uniqueMapAssets:assets.size,
    encounters:records.reduce((n,r)=>n+r.encounterRecords,0), noFixedWild:records.filter(r=>r.encounterStatus==='no-fixed-wild').length,
    directedEdges:records.reduce((n,r)=>n+r.directedEdges,0), reciprocalConnections:records.reduce((n,r)=>n+r.reciprocalConnections,0),
    oneWayHoles:records.reduce((n,r)=>n+r.oneWayHoles,0),
    ...Object.fromEntries(['items','gifts','offers','services','trainers'].map(k=>[k,records.reduce((n,r)=>n+r.references[k],0)]))},
  evTablesByTime:evTables,
  evCleanDayResults:Object.fromEntries(Object.keys(EV_STATS).map(stat=>[stat,rankEvTraining(game,{stat}).length])),
  sourcePageAudit:'docs/atlas-integrated-audit-2026-10-20.json', unchangedContent,
  browserTests:'Run npm test separately', primaryReproduction:'Run the pinned-source generators separately',
  realSaveOrInGameValidation:false, locations:records, mapAssetSha256:Object.fromEntries(assets), missing:[]
};
if (process.argv[2]) await writeFile(process.argv[2], JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report.counts));
