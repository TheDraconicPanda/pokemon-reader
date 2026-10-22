const { test } = require("node:test");
const assert = require("node:assert/strict");
const { readFile } = require("node:fs/promises");
const path = require("node:path");

async function locations() {
  const source = await readFile(path.join(__dirname, "../js/data/atlas-locations.js"), "utf8");
  return (await import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`)).ATLAS_LOCATIONS;
}

test("all 122 location groups have static information and pinned sources", async () => {
  const data = await locations();
  assert.equal(data.length, 122);
  assert.equal(new Set(data.map((entry) => entry.name)).size, 122);
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
      const url = new URL(source.url);
      assert.equal(url.protocol, "https:");
      assert.ok(["github.com", "www.serebii.net", "bulbapedia.bulbagarden.net"].includes(url.hostname));
      if (url.hostname === "github.com") assert.match(url.pathname, /^\/pret\/pokeheartgold\/blob\/(?:e3f671ad1d060140c587f925f4ab8ec3596f62b9|d2355244ac42b3c6e40d8c36aa3564ee8706dea4)\/(?:files|src)\//);
    }
    assert.ok(entry.sources.some((source) => source.url.startsWith("https://www.serebii.net/pokearth/")));
    assert.ok(entry.sources.some((source) => source.url.startsWith("https://bulbapedia.bulbagarden.net/wiki/")));
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
    ["New Bark Town", "Route 27"], ["Route 35", "Route 36"]
  ]) assert.ok(data.get(from).includes(to), `${from} → ${to}`);
  for (const [from, to] of [
    ["Route 30", "Ruins of Alph"], ["Cianwood City", "Route 47"],
    ["Route 47", "Safari Zone"], ["Goldenrod City", "Pokémon Day Care"],
    ["Mt. Silver", "Indigo Plateau"], ["Ecruteak City", "Bell Tower"]
  ]) assert.equal(data.get(from).includes(to), false, `${from} must not bypass ${to}'s approach`);
});

test("the static audit accounts for every location with two reviewed reference sites", async () => {
  const data = await locations();
  const audit = JSON.parse(await readFile(path.join(__dirname, "../docs/atlas-static-audit.json"), "utf8"));
  assert.equal(audit.release, "0.25.37");
  assert.equal(audit.locations.length, 70);
  assert.deepEqual(audit.locations.map((row) => row.location).sort(), data.filter(row=>!row.audit.primaryRevision).map((row) => row.name).sort());
  for (const row of audit.locations) {
    assert.equal(row.status, "reviewed");
    assert.deepEqual(row.checked, ["name", "summary", "landmarks", "access", "connections"]);
    assert.ok(row.notes.length > 30);
    assert.deepEqual(row.references.map((ref) => ref.source).sort(), ["bulbapedia", "serebii"]);
    for (const ref of row.references) {
      assert.equal(ref.http_status, 200);
      assert.match(ref.sha256, /^[a-f0-9]{64}$/);
      assert.ok(ref.title.trim());
    }
  }
});

test("audited HGSS gates and the Tunnel alias remain represented", async () => {
  const data = new Map((await locations()).map((entry) => [entry.name, entry]));
  assert.deepEqual(data.get("Goldenrod Tunnel").aliases, ["Goldenrod Underground"]);
  for (const [name, pattern] of [
    ["Route 30", /Mystery Egg/], ["Route 35", /Route 36.*Cut/],
    ["Route 47", /SecretPotion.*Jasmine/], ["Dark Cave", /Strength/],
    ["Pokéathlon Dome", /Whitney/], ["Lake of Rage", /transmitter.*Wednesday/],
    ["Ice Path", /picked up.*teaching or using Waterfall/],
    ["MooMoo Farm", /seven Oran Berries/], ["Mt. Silver", /Flash is not needed/]
  ]) assert.match(data.get(name).access.join(" "), pattern, name);
});
