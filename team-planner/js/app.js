"use strict";

const STORAGE_KEY = "pokemon-reader-soulsilver-team-planner-v1";
const TEAM = [
  { id:"kingdra", name:"Kingdra", origin:"Horsea", role:"Special attacker and water traversal", ability:"Swift Swim", nature:"Modest (preferred) · Timid alternative", moves:[["Surf","Final set · locked"],["Ice Beam","Coverage"],["Dragon Pulse","Clair's TM59 reward"],["Rain Dance","Final set · weather control"]], temporary:["Whirlpool"], evs:[["Special Attack",252],["Speed",252],["HP",4]], note:"Whirlpool temporarily replaces Rain Dance during exploration." },
  { id:"typhlosion", name:"Typhlosion", origin:"Cyndaquil", role:"Fast special attacker; answers Venusaur", ability:"Blaze", nature:"Timid (preferred) · Modest alternative", moves:[["Flamethrower","Priority 1"],["Focus Blast","Coverage"],["Dig","Coverage"],["Fourth move — undecided","Choose before locking the final set"]], temporary:["Cut"], evs:[["Special Attack",252],["Speed",252],["HP",4]], note:"Cut is a sacrifice/navigation move. Shadow Ball was discussed but is not locked in." },
  { id:"machamp", name:"Machamp", origin:"Machop", role:"Physical attacker; Fighting coverage for Snorlax", ability:"No Guard", nature:"Adamant", moves:[["DynamicPunch","Fighting STAB · preferred"],["Stone Edge","Postgame TM71 · 80 BP"],["Payback","Coverage"],["Fourth move — undecided","Choose one distinct move; Cross Chop is an alternative to DynamicPunch, not an extra slot"]], temporary:["Rock Climb","Strength"], evs:[["Attack",252],["HP",252],["Special Defense",4]], note:"No Guard makes Rock Climb reliable during exploration. Both HMs are temporary." },
  { id:"dragonite", name:"Dragonite", origin:"Dratini", role:"Physical setup sweeper; answers Pikachu", ability:"Inner Focus", nature:"Adamant (preferred) · Jolly alternative", moves:[["Dragon Dance","Teach as Dragonair at level 53"],["Earthquake","TM26 reserved"],["Dragon Claw","TM02 · Route 27"],["Fly","Final set · locked"]], temporary:["Waterfall"], evs:[["Attack",252],["Speed",252],["HP",4]], note:"Waterfall is exploration-only. Dragon Dance should be learned before evolving Dragonair at level 55." },
  { id:"ampharos", name:"Ampharos", origin:"Mareep", role:"Special Electric coverage; answers Lapras and Blastoise", ability:"Static", nature:"Modest", moves:[["Thunderbolt","Repeatable Game Corner TM"],["Signal Beam","Coverage"],["Focus Blast","Coverage"],["Thunder Wave","Utility"]], temporary:[], evs:[["Special Attack",252],["HP",252],["Defense",4]], note:"No HM assigned." },
  { id:"gengar", name:"Gengar", origin:"Gastly", role:"Fast special attacker and broad coverage", ability:"Levitate", nature:"Timid (preferred) · Modest alternative", moves:[["Shadow Ball","TM30 reserved"],["Sludge Bomb","TM36 · Route 43"],["Focus Blast","Coverage"],["Thunderbolt","Repeatable Game Corner TM"]], temporary:["Rock Smash"], evs:[["Special Attack",252],["Speed",252],["HP",4]], note:"Rock Smash is temporary. Trading is available for the evolution." }
];
const HMS = [
  { move:"Surf", owner:"Kingdra", status:"Final set", why:"Strong special STAB; remains in the Red configuration." },
  { move:"Whirlpool", owner:"Kingdra", status:"Temporary", why:"Exploration access; replace Rain Dance while travelling." },
  { move:"Fly", owner:"Dragonite", status:"Final set", why:"Travel convenience; planned to remain in the final set." },
  { move:"Waterfall", owner:"Dragonite", status:"Temporary", why:"Exploration access; remove for Red." },
  { move:"Rock Climb", owner:"Machamp", status:"Temporary", why:"No Guard removes its accuracy concern in this plan; remove for Red." },
  { move:"Strength", owner:"Machamp", status:"Temporary", why:"Useful exploration move; remove for Red." },
  { move:"Cut", owner:"Typhlosion", status:"Temporary", why:"Sacrifice/navigation slot; remove for Red." },
  { move:"Rock Smash", owner:"Gengar", status:"Temporary", why:"Exploration access; remove for Red." },
  { move:"Flash", owner:"Unassigned", status:"Situational", why:"Not assigned; only teach if a specific route requires it." }
];
const BENCH = [
  { id:"metagross", name:"Metagross", role:"Durable physical attacker with Steel typing.", note:"Potentially overlaps Dragonite/Machamp. Beldum acquisition is awkward; Meteor Mash is learned by Metang at level 48." },
  { id:"roserade", name:"Roserade", role:"Special Grass/Poison specialist.", note:"Budew evolves through daytime friendship; evolve Roselia with a Shiny Stone after learning any desired pre-evolution moves." },
  { id:"electivire", name:"Electivire", role:"Physical Electric coverage.", note:"Competes with Ampharos for the Electric role. Electabuzz evolves by trading while holding an Electirizer." }
];
const EV_LOCATIONS = {
  "HP":"Slowpoke Well (Slowpoke)",
  "Attack":"Route 42 surfing (Goldeen / Seaking)",
  "Defense":"Route 45 (Geodude / Graveler)",
  "Special Attack":"Route 35 grass (Psyduck / Golduck)",
  "Special Defense":"Surf Route 27 (Tentacool / Tentacruel)",
  "Speed":"Sprout Tower daytime or Diglett's Cave (Rattata / Diglett)"
};
const $ = (selector) => document.querySelector(selector);
const defaultState = () => ({ version:1, ready:{}, moves:{}, hmDone:{}, evDone:{}, benchNotes:{} });
let state = loadState();

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return parsed && parsed.version === 1 ? { ...defaultState(), ...parsed } : defaultState();
  } catch { return defaultState(); }
}
function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    $("#save-status").textContent = "Saved in this browser";
  } catch {
    $("#save-status").textContent = "Browser storage unavailable — export a backup";
  }
  updateSummary();
}
function checked(key, label, text, group) {
  const input = document.createElement("input");
  input.type = "checkbox";
  input.checked = Boolean(state[group]?.[key]);
  input.addEventListener("change", () => {
    state[group][key] = input.checked;
    saveState();
    renderAll();
  });
  input.id = key;
  const wrapper = document.createElement("label");
  wrapper.className = "checkline";
  wrapper.htmlFor = key;
  wrapper.append(input, document.createTextNode(text || label));
  return wrapper;
}
function renderTeam() {
  const grid = $("#team-grid");
  grid.replaceChildren();
  for (const pokemon of TEAM) {
    const card = document.createElement("article");
    card.className = "team-card";
    const complete = Boolean(state.ready[pokemon.id]);
    const head = document.createElement("div"); head.className = "card-head";
    const titles = document.createElement("div");
    const h = document.createElement("h3"); h.textContent = pokemon.name;
    const species = document.createElement("p"); species.className = "species"; species.textContent = "Started as " + pokemon.origin;
    titles.append(h, species);
    const pill = document.createElement("span"); pill.className = "status-pill" + (complete ? " done" : ""); pill.textContent = complete ? "Ready" : "Planned";
    head.append(titles, pill);
    const role = document.createElement("p"); role.className = "role"; role.textContent = pokemon.role;
    const meta = document.createElement("p"); meta.className = "small"; meta.innerHTML = "<strong>Ability:</strong> " + pokemon.ability + " &nbsp; <strong>Nature:</strong> " + pokemon.nature;
    const moveBox = document.createElement("div"); moveBox.className = "moves";
    const mh = document.createElement("h4"); mh.textContent = "Final move priorities";
    moveBox.append(mh);
    pokemon.moves.forEach(([move, detail], i) => {
      const row = document.createElement("div"); row.className = "move" + (move.includes("undecided") ? " unsettled" : "");
      const priority = document.createElement("span"); priority.className = "priority"; priority.textContent = String(i + 1) + ".";
      const name = document.createElement("span"); name.textContent = move;
      const info = document.createElement("small"); info.textContent = detail;
      row.append(priority, name, info); moveBox.append(row);
      const key = pokemon.id + ":" + i;
      const line = checked(key, move, "Learned / confirmed: " + move, "moves");
      line.classList.add("small");
      moveBox.append(line);
    });
    const chips = document.createElement("div"); chips.className = "hm-chips";
    for (const move of pokemon.temporary) { const chip = document.createElement("span"); chip.className = "chip"; chip.textContent = "Temporary HM: " + move; chips.append(chip); }
    const note = document.createElement("p"); note.className = "small muted"; note.textContent = pokemon.note;
    card.append(head, role, meta, moveBox);
    if (pokemon.temporary.length) card.append(chips);
    card.append(note, checked(pokemon.id, pokemon.name, "Mark " + pokemon.name + " ready for the final team", "ready"));
    grid.append(card);
  }
}
function renderHms() {
  const list = $("#hm-list"); list.replaceChildren();
  HMS.forEach((hm, i) => {
    const row = document.createElement("article"); row.className = "hm-row";
    const name = document.createElement("div"); const title = document.createElement("h3"); title.textContent = hm.move; const status = document.createElement("p"); status.textContent = hm.status; name.append(title, status);
    const info = document.createElement("div"); const owner = document.createElement("div"); owner.className = "hm-owner"; owner.textContent = hm.owner; const why = document.createElement("p"); why.textContent = hm.why; info.append(owner, why);
    const done = checked("hm:" + i, hm.move, hm.status === "Temporary" ? "HM taught / handled" : "Confirmed", "hmDone");
    row.append(name, info, done); list.append(row);
  });
}
function renderEvs() {
  const list = $("#ev-list"); list.replaceChildren();
  TEAM.forEach(pokemon => {
    const card = document.createElement("article"); card.className = "ev-card";
    const title = document.createElement("h3"); title.textContent = pokemon.name;
    const target = document.createElement("p"); target.textContent = "Target: " + pokemon.evs.map(([stat, value]) => stat + " " + value).join(" · ");
    const grid = document.createElement("div"); grid.className = "ev-checks";
    pokemon.evs.forEach(([stat, value]) => grid.append(checked(pokemon.id + ":" + stat, stat + " " + value, stat + " — " + value + " EVs target reached", "evDone")));
    const location = document.createElement("p"); location.className = "small muted"; location.style.marginTop = ".8rem"; location.textContent = "Training reference: " + [...new Set(pokemon.evs.map(([stat]) => EV_LOCATIONS[stat]))].join("; ");
    card.append(title, target, grid, location); list.append(card);
  });
}
function renderBench() {
  const list = $("#bench-list"); list.replaceChildren();
  BENCH.forEach(candidate => {
    const card = document.createElement("article"); card.className = "bench-card";
    const title = document.createElement("h3"); title.textContent = candidate.name;
    const role = document.createElement("p"); role.textContent = candidate.role;
    const note = document.createElement("p"); note.textContent = candidate.note;
    card.append(title, role, note, checked(candidate.id, candidate.name, "Keep as a candidate to revisit", "benchNotes")); list.append(card);
  });
}
function updateSummary() {
  const partyReady = TEAM.filter(p => state.ready[p.id]).length;
  const moveGoals = TEAM.reduce((n,p) => n + p.moves.filter((_,i) => state.moves[p.id + ":" + i]).length,0);
  const moveTotal = TEAM.reduce((n,p) => n + p.moves.length,0);
  const evTotal = TEAM.reduce((n,p) => n + p.evs.length,0);
  const evDone = TEAM.reduce((n,p) => n + p.evs.filter(([stat]) => state.evDone[p.id + ":" + stat]).length,0);
  $("#party-count").textContent = partyReady + " / 6 ready";
  $("#party-meter").style.width = (partyReady/6*100) + "%";
  $("#move-count").textContent = moveGoals + " / " + moveTotal + " complete";
  $("#move-meter").style.width = (moveGoals/moveTotal*100) + "%";
  $("#ev-count").textContent = evDone + " / " + evTotal + " targets";
  $("#ev-meter").style.width = (evDone/evTotal*100) + "%";
}
function renderAll() { renderTeam(); renderHms(); renderEvs(); renderBench(); updateSummary(); }
document.querySelectorAll(".tab").forEach(button => button.addEventListener("click", () => {
  document.querySelectorAll(".tab").forEach(tab => tab.classList.toggle("active", tab === button));
  document.querySelectorAll(".panel").forEach(panel => {
    const active = panel.id === "panel-" + button.dataset.tab;
    panel.hidden = !active; panel.classList.toggle("active", active);
  });
}));
$("#export-btn").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify({ app:"Pokemon Reader SoulSilver Team Planner", exportedAt:new Date().toISOString(), state }, null, 2)], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = "soulsilver-team-planner-backup.json"; a.click(); URL.revokeObjectURL(url);
  $("#save-status").textContent = "Backup exported";
});
$("#import-file").addEventListener("change", async event => {
  const [file] = event.target.files || [];
  if (!file) return;
  try {
    const parsed = JSON.parse(await file.text());
    const imported = parsed.state || parsed;
    if (imported.version !== 1 || typeof imported !== "object") throw new Error("Unrecognized backup");
    state = { ...defaultState(), ...imported };
    saveState(); renderAll(); $("#save-status").textContent = "Backup imported";
  } catch { $("#save-status").textContent = "Could not import: select a planner JSON backup"; }
  event.target.value = "";
});
$("#reset-btn").addEventListener("click", () => $("#confirm-dialog").showModal());
$("#confirm-reset").addEventListener("click", () => {
  state = defaultState();
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
  saveState(); renderAll();
});
renderAll();
