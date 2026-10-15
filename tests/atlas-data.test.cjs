const { test } = require("node:test");
const assert = require("node:assert/strict");
const { readFile } = require("node:fs/promises");
const path = require("node:path");

async function locations() {
  const source = await readFile(path.join(__dirname, "../js/data/atlas-locations.js"), "utf8");
  return (await import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`)).ATLAS_LOCATIONS;
}

test("all 70 location groups have static information and pinned sources", async () => {
  const data = await locations();
  assert.equal(data.length, 70);
  assert.equal(new Set(data.map((entry) => entry.name)).size, 70);
  for (const entry of data) {
    for (const field of ["name", "region", "details"]) assert.ok(entry[field].trim(), `${entry.name}: ${field}`);
    assert.ok(["town", "route", "landmark", "facility"].includes(entry.type));
    for (const field of ["landmarks", "access"]) {
      assert.ok(entry[field].length >= 2, `${entry.name}: ${field}`);
      for (const text of entry[field]) assert.ok(text.trim() && !/TODO|TBD|placeholder/i.test(text));
    }
    assert.ok(entry.mapIds.length > 0);
    assert.ok(entry.sources.length >= 2);
    for (const source of entry.sources) {
      assert.ok(source.label.trim());
      assert.match(source.url, /^https:\/\/github\.com\/pret\/pokeheartgold\/blob\/e3f671ad1d060140c587f925f4ab8ec3596f62b9\/files\//);
    }
  }
});

test("Johto and border routes form one connected graph without unknown destinations", async () => {
  const data = await locations();
  const byName = new Map(data.map((entry) => [entry.name, entry]));
  for (let number = 26; number <= 48; number++) assert.ok(byName.has(`Route ${number}`));
  for (const entry of data) {
    assert.ok(entry.connections.length > 0, entry.name);
    assert.equal(new Set(entry.connections).size, entry.connections.length);
    for (const destination of entry.connections) {
      assert.notEqual(destination, entry.name);
      assert.ok(byName.has(destination), `${entry.name} → ${destination}`);
      assert.ok(byName.get(destination).connections.includes(entry.name), `${destination} lacks adjacency to ${entry.name}`);
    }
  }
  const visited = new Set();
  const queue = ["New Bark Town"];
  while (queue.length) {
    const next = queue.pop();
    if (visited.has(next)) continue;
    visited.add(next);
    queue.push(...byName.get(next).connections);
  }
  assert.equal(visited.size, data.length, "Every group must be navigable from New Bark Town");
});

test("corrected junctions retain their gates and remove misleading shortcuts", async () => {
  const data = new Map((await locations()).map((entry) => [entry.name, entry.connections]));
  for (const [from, to] of [
    ["Ruins of Alph", "Route 36"], ["Ruins of Alph", "Union Cave"],
    ["Route 34", "Ilex Forest"], ["Cianwood City", "Cliff Edge Gate"],
    ["Violet City", "Sprout Tower"], ["Ecruteak City", "Bellchime Trail"],
    ["Mt. Silver", "Route 28"], ["Route 40", "Frontier Access"],
    ["New Bark Town", "Route 27"]
  ]) assert.ok(data.get(from).includes(to), `${from} → ${to}`);
  for (const [from, to] of [
    ["Route 30", "Ruins of Alph"], ["Cianwood City", "Route 47"],
    ["Route 47", "Safari Zone"], ["Goldenrod City", "Pokémon Day Care"],
    ["Mt. Silver", "Indigo Plateau"], ["Ecruteak City", "Bell Tower"]
  ]) assert.equal(data.get(from).includes(to), false, `${from} must not bypass ${to}'s approach`);
});
