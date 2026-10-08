import { detectSoulSilver } from "./saves/soulsilver.js";
import { HGSS_BADGES } from "./data/hgss-badges.js";

const APP_VERSION = "0.5.0";

const fileInput = document.querySelector("#save-file");
const dropZone = document.querySelector("#drop-zone");
const fileStatus = document.querySelector("#file-status");
const filePickerText = document.querySelector(".file-picker-text");
const gameValue = document.querySelector("#game-value");
const fileValue = document.querySelector("#file-value");
const sizeValue = document.querySelector("#size-value");
const partitionValue = document.querySelector("#partition-value");
const trainerNameValue = document.querySelector("#trainer-name-value");
const trainerIdValue = document.querySelector("#trainer-id-value");
const secretIdValue = document.querySelector("#secret-id-value");
const genderValue = document.querySelector("#gender-value");
const moneyValue = document.querySelector("#money-value");
const playTimeValue = document.querySelector("#play-time-value");
const badgesValue = document.querySelector("#badges-value");
const badgeGrid = document.querySelector("#badge-grid");
const trainerInfo = document.querySelector("#trainer-info");
const partyInfo = document.querySelector("#party-info");
const partyGrid = document.querySelector("#party-grid");
const storageInfo = document.querySelector("#storage-info");
const boxTabs = document.querySelector("#box-tabs");
const boxGrid = document.querySelector("#box-grid");
let currentStorage = null;
const pokemonDataCache = new Map();
const itemNameCache = new Map();
const appVersion = document.querySelector("#app-version");

appVersion.textContent = APP_VERSION;
document.title = `Pokémon Reader — v${APP_VERSION}`;

fileInput.addEventListener("change", () => {
  const [file] = fileInput.files;
  if (!file) {
    resetFileInfo();
    return;
  }
  handleFile(file);
});

["dragenter", "dragover"].forEach((eventName) => {
  dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropZone.classList.add("drag-over");
  });
});

["dragleave", "drop"].forEach((eventName) => {
  dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropZone.classList.remove("drag-over");
  });
});

dropZone.addEventListener("drop", (event) => {
  const [file] = event.dataTransfer.files;
  if (!file) {
    resetFileInfo();
    return;
  }
  handleFile(file);
});

async function handleFile(file) {
  resetFileInfo();
  fileStatus.className = "status";
  fileStatus.textContent = "Reading save file…";
  filePickerText.textContent = "Choose another save file or drop one here";
  fileValue.textContent = file.name;
  sizeValue.textContent = formatBytes(file.size);

  try {
    const buffer = await file.arrayBuffer();
    const result = detectSoulSilver(buffer);

    gameValue.textContent = result.game;
    partitionValue.textContent = result.activePartition === null
      ? "—"
      : result.activePartition === 0 ? "A" : "B";

    if (result.save) {
      const { trainer } = result.save;

      trainerNameValue.textContent = trainer.name || "—";
      trainerIdValue.textContent = trainer.trainerId;
      secretIdValue.textContent = trainer.secretId;
      genderValue.textContent = trainer.gender;
      moneyValue.textContent = formatNumber(trainer.money);
      playTimeValue.textContent = formatPlayTime(trainer.playTime);
      badgesValue.textContent = `${trainer.badgeCount} / 16`;
      renderBadges(trainer.badges);
      trainerInfo.hidden = false;
      const enrichedParty = await enrichPokemonList(result.party);
      const enrichedStorage = await enrichStorage(result.storage);
      renderParty(enrichedParty);
      renderStorage(enrichedStorage);
    }

    fileStatus.className = result.valid ? "status success" : "status error";
    fileStatus.textContent = result.reason;
  } catch (error) {
    gameValue.textContent = "Not detected";
    fileStatus.className = "status error";
    fileStatus.textContent = "Unable to read the selected file.";
    console.error(error);
  }
}

function renderBadges(badges) {
  badgeGrid.replaceChildren();

  for (const region of ["johto", "kanto"]) {
    const regionBadges = HGSS_BADGES.filter((badge) => badge.region === region);
    const section = document.createElement("section");
    section.className = "badge-region";

    const heading = document.createElement("h3");
    heading.textContent = region === "johto" ? "Johto" : "Kanto";
    section.append(heading);

    const grid = document.createElement("div");
    grid.className = "badge-list";

    for (const badge of regionBadges) {
      const earned = (badges & (1 << badge.bit)) !== 0;

      const item = document.createElement("div");
      item.className = `badge-item${earned ? " earned" : ""}`;
      item.title = `${badge.name}: ${earned ? "Obtained" : "Not obtained"}`;

      const image = document.createElement("img");
      image.src = badge.image;
      image.alt = badge.name;
      image.width = 40;
      image.height = 40;

      const name = document.createElement("span");
      name.textContent = badge.name;

      const status = document.createElement("span");
      status.className = "badge-status";
      status.textContent = earned ? "Obtained" : "Not obtained";

      item.append(image, name, status);
      grid.append(item);
    }

    section.append(grid);
    badgeGrid.append(section);
  }
}

async function enrichPokemonList(pokemonList) {
  return Promise.all(pokemonList.map((pokemon) => enrichPokemon(pokemon)));
}

async function enrichStorage(storage) {
  const boxes = await Promise.all(storage.boxes.map(async (box) => ({
    ...box,
    pokemon: await enrichPokemonList(box.pokemon),
  })));

  return { ...storage, boxes };
}

async function enrichPokemon(pokemon) {
  if (pokemon.empty) return pokemon;

  const data = await getPokemonData(pokemon.speciesId);
  const heldItemName = await getItemName(pokemon.heldItemId);

  return {
    ...pokemon,
    speciesName: data?.species?.name ? formatPokemonName(data.species.name) : null,
    gender: getGender(pokemon.personality, data?.species?.gender_rate),
    abilityName: getAbilityName(data?.pokemon, pokemon.abilitySlot),
    natureName: getNatureName(pokemon.natureId),
    statusText: getStatusText(pokemon.status),
    experienceText: formatNumber(pokemon.experience),
    heldItemName,
    pokeballName: getPokeballName(pokemon.pokeballId),
    metDateText: formatPokemonDate(pokemon.metDate),
    eggDateText: formatPokemonDate(pokemon.eggDate),
    metLocationText: formatLocation(pokemon.metLocationId),
    eggLocationText: formatLocation(pokemon.eggLocationId),
  };
}

async function getPokemonData(speciesId) {
  if (pokemonDataCache.has(speciesId)) return pokemonDataCache.get(speciesId);

  const promise = Promise.all([
    fetch(`https://pokeapi.co/api/v2/pokemon-species/${speciesId}`)
      .then((response) => response.ok ? response.json() : null)
      .catch(() => null),
    fetch(`https://pokeapi.co/api/v2/pokemon/${speciesId}`)
      .then((response) => response.ok ? response.json() : null)
      .catch(() => null),
  ]).then(([species, pokemon]) => ({ species, pokemon }));

  pokemonDataCache.set(speciesId, promise);
  return promise;
}

const NATURE_NAMES = Object.freeze([
  "Hardy", "Lonely", "Brave", "Adamant", "Naughty",
  "Docile", "Bold", "Relaxed", "Impish", "Lax",
  "Serious", "Timid", "Hasty", "Jolly", "Naive",
  "Bashful", "Modest", "Mild", "Quiet", "Rash",
  "Quirky", "Calm", "Gentle", "Sassy", "Careful",
]);

function getNatureName(natureId) {
  return NATURE_NAMES[natureId] || "Unknown";
}

function getAbilityName(data, abilitySlot) {
  if (!data?.abilities) return "Unknown";

  const ability = data.abilities.find((entry) => entry.slot === abilitySlot + 1);
  return ability?.ability?.name
    ? formatPokemonName(ability.ability.name)
    : "Unknown";
}

function getStatusText(status) {
  if (!status) return "Healthy";

  const conditions = [];
  const sleepTurns = status & 0x07;

  if (sleepTurns) {
    conditions.push("Sleep (" + sleepTurns + " turn" + (sleepTurns === 1 ? "" : "s") + ")");
  }
  if (status & 0x08) conditions.push("Poisoned");
  if (status & 0x10) conditions.push("Burned");
  if (status & 0x20) conditions.push("Frozen");
  if (status & 0x40) conditions.push("Paralyzed");
  if (status & 0x80) conditions.push("Badly Poisoned");

  return conditions.join(", ") || "Unknown";
}

const GEN4_HELD_ITEM_SLUGS = Object.freeze({
  0xD5: "bright-powder",
  0xD6: "white-herb",
  0xD7: "macho-brace",
  0xD8: "exp-share",
  0xD9: "quick-claw",
  0xDA: "soothe-bell",
  0xDB: "mental-herb",
  0xDC: "choice-band",
  0xDD: "kings-rock",
  0xDE: "silver-powder",
  0xDF: "amulet-coin",
  0xE0: "cleanse-tag",
  0xE1: "soul-dew",
  0xE2: "deep-sea-tooth",
  0xE3: "deep-sea-scale",
  0xE4: "smoke-ball",
  0xE5: "everstone",
  0xE6: "focus-band",
  0xE7: "lucky-egg",
  0xE8: "scope-lens",
  0xE9: "metal-coat",
  0xEA: "leftovers",
  0xEB: "dragon-scale",
  0xEC: "light-ball",
  0xED: "soft-sand",
  0xEE: "hard-stone",
  0xEF: "miracle-seed",
  0xF0: "black-glasses",
  0xF1: "black-belt",
  0xF2: "magnet",
  0xF3: "mystic-water",
  0xF4: "sharp-beak",
  0xF5: "poison-barb",
  0xF6: "nevermeltice",
  0xF7: "spell-tag",
  0xF8: "twisted-spoon",
  0xF9: "charcoal",
  0xFA: "dragon-fang",
  0xFB: "silk-scarf",
  0xFC: "up-grade",
  0xFD: "shell-bell",
  0xFE: "sea-incense",
  0xFF: "lax-incense",
  0x100: "lucky-punch",
  0x101: "metal-powder",
  0x102: "thick-club",
  0x103: "stick",
  0x104: "red-scarf",
  0x105: "blue-scarf",
  0x106: "pink-scarf",
  0x107: "green-scarf",
  0x108: "yellow-scarf",
  0x109: "wide-lens",
  0x10A: "muscle-band",
  0x10B: "wise-glasses",
  0x10C: "expert-belt",
  0x10D: "light-clay",
  0x10E: "life-orb",
  0x10F: "power-herb",
  0x110: "toxic-orb",
  0x111: "flame-orb",
  0x112: "quick-powder",
  0x113: "focus-sash",
  0x114: "zoom-lens",
  0x115: "metronome",
  0x116: "iron-ball",
  0x117: "lagging-tail",
  0x118: "destiny-knot",
  0x119: "black-sludge",
  0x11A: "icy-rock",
  0x11B: "smooth-rock",
  0x11C: "heat-rock",
  0x11D: "damp-rock",
  0x11E: "grip-claw",
  0x11F: "choice-scarf",
  0x120: "sticky-barb",
  0x121: "power-bracer",
  0x122: "power-belt",
  0x123: "power-lens",
  0x124: "power-band",
  0x125: "power-anklet",
  0x126: "power-weight",
  0x127: "shed-shell",
  0x128: "big-root",
  0x129: "choice-specs",
  0x12A: "flame-plate",
  0x12B: "splash-plate",
  0x12C: "zap-plate",
  0x12D: "meadow-plate",
  0x12E: "icicle-plate",
  0x12F: "fist-plate",
  0x130: "toxic-plate",
  0x131: "earth-plate",
  0x132: "sky-plate",
  0x133: "mind-plate",
  0x134: "insect-plate",
  0x135: "stone-plate",
  0x136: "spooky-plate",
  0x137: "draco-plate",
  0x138: "dread-plate",
  0x139: "iron-plate",
  0x13A: "odd-incense",
  0x13B: "rock-incense",
  0x13C: "full-incense",
  0x13D: "wave-incense",
  0x13E: "rose-incense",
  0x13F: "luck-incense",
  0x140: "pure-incense",
  0x141: "protector",
  0x142: "electirizer",
  0x143: "magmarizer",
  0x144: "dubious-disc",
  0x145: "reaper-cloth",
  0x146: "razor-claw",
  0x147: "razor-fang",
});

async function getItemName(itemId) {
  if (!itemId) return "None";
  if (itemNameCache.has(itemId)) return itemNameCache.get(itemId);

  const itemSlug = GEN4_HELD_ITEM_SLUGS[itemId];
  const endpoint = itemSlug
    ? `https://pokeapi.co/api/v2/item/${itemSlug}`
    : `https://pokeapi.co/api/v2/item/${itemId}`;

  const promise = fetch(endpoint)
    .then((response) => response.ok ? response.json() : null)
    .then((item) => item ? formatPokemonName(item.name) : `Item #${itemId}`)
    .catch(() => `Item #${itemId}`);

  itemNameCache.set(itemId, promise);
  return promise;
}

const POKEBALL_NAMES = Object.freeze({
  1: "Poké Ball", 2: "Great Ball", 3: "Ultra Ball", 4: "Master Ball",
  5: "Safari Ball", 6: "Net Ball", 7: "Dive Ball", 8: "Nest Ball",
  9: "Repeat Ball", 10: "Timer Ball", 11: "Luxury Ball", 12: "Premier Ball",
  13: "Dusk Ball", 14: "Heal Ball", 15: "Quick Ball", 16: "Cherish Ball",
  17: "Fast Ball", 18: "Level Ball", 19: "Lure Ball", 20: "Heavy Ball",
  21: "Love Ball", 22: "Friend Ball", 23: "Moon Ball", 24: "Sport Ball",
});

function getPokeballName(ballId) {
  return POKEBALL_NAMES[ballId] || (ballId ? "Ball #" + ballId : "Unknown");
}

function formatPokemonDate(date) {
  if (!date) return "Unknown";
  return String(date.month).padStart(2, "0") + "/" + String(date.day).padStart(2, "0") + "/" + date.year;
}

function formatLocation(locationId) {
  if (!locationId) return "Unknown";
  return "Location #" + locationId;
}

function formatPokemonName(name) {
  return name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getGender(personality, genderRate) {
  if (genderRate === -1) return "Genderless";
  if (genderRate === 0) return "Male";
  if (genderRate === 8) return "Female";
  if (genderRate == null) return "Unknown";

  return (personality & 0xFF) < genderRate * 32 ? "Female" : "Male";
}

function renderStorage(storage) {
  currentStorage = storage;
  boxTabs.replaceChildren();

  for (const box of storage.boxes) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "box-tab";
    button.textContent = box.name;
    button.dataset.box = box.number;
    button.addEventListener("click", () => renderBox(box.number));
    boxTabs.append(button);
  }

  renderBox(storage.currentBox + 1);
  storageInfo.hidden = false;
}

function renderBox(boxNumber) {
  if (!currentStorage) return;

  const box = currentStorage.boxes[boxNumber - 1];
  if (!box) return;

  boxTabs.querySelectorAll(".box-tab").forEach((button) => {
    button.classList.toggle("active", Number(button.dataset.box) === boxNumber);
  });

  boxGrid.replaceChildren();

  for (const pokemon of box.pokemon) {
    const item = document.createElement("article");
    item.className = `box-slot${pokemon.empty ? " empty" : ""}`;
    item.title = pokemon.empty
      ? `Empty slot ${pokemon.slot}`
      : (pokemon.nickname || pokemon.speciesName || `Pokémon #${pokemon.speciesId}`);

    if (!pokemon.empty) {
      const image = document.createElement("img");
      image.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.speciesId}.png`;
      image.alt = `Pokémon #${pokemon.speciesId}`;
      image.width = 72;
      image.height = 72;

      const name = document.createElement("span");
      name.textContent = pokemon.nickname || pokemon.speciesName || `#${pokemon.speciesId}`;
      item.append(image, name);

      if (pokemon.shiny) {
        const shiny = document.createElement("span");
        shiny.className = "shiny-marker";
        shiny.textContent = "★";
        shiny.setAttribute("aria-label", "Shiny");
        item.append(shiny);
      }
    } else {
      const slot = document.createElement("span");
      slot.textContent = pokemon.slot;
      slot.className = "empty-slot-number";
      item.append(slot);
    }

    boxGrid.append(item);
  }
}

function renderParty(party) {
  partyGrid.replaceChildren();

  for (const pokemon of party) {
    const partyItem = document.createElement("article");
    partyItem.className = "party-item";

    const image = document.createElement("img");
    image.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.speciesId}.png`;
    image.alt = `Pokémon #${pokemon.speciesId}`;
    image.width = 96;
    image.height = 96;

    const details = document.createElement("div");
    const title = document.createElement("h3");
    title.textContent = pokemon.nickname || `Species #${pokemon.speciesId}`;
    const species = document.createElement("p");
    species.className = "party-species";
    species.textContent = pokemon.speciesName || `Species #${pokemon.speciesId}`;
    const level = document.createElement("p");
    level.textContent = `Level ${pokemon.level}`;
    const gender = document.createElement("p");
    gender.textContent = `Gender ${pokemon.gender}`;
    const heldItem = document.createElement("p");
    heldItem.textContent = `Held item: ${pokemon.heldItemName || "None"}`;
    const hp = document.createElement("p");
    hp.textContent = "HP " + pokemon.currentHp + " / " + pokemon.maxHp;

    const nature = document.createElement("p");
    nature.textContent = "Nature: " + pokemon.natureName;

    const ability = document.createElement("p");
    ability.textContent = "Ability: " + pokemon.abilityName;

    const experience = document.createElement("p");
    experience.textContent = "EXP: " + pokemon.experienceText;

    const status = document.createElement("p");
    status.textContent = "Status: " + pokemon.statusText;


    const history = document.createElement("div");
    history.className = "party-history";

    const historyHeading = document.createElement("h4");
    historyHeading.textContent = "History & Identity";

    const originalTrainer = document.createElement("p");
    originalTrainer.textContent = "OT: " + (pokemon.otName || "Unknown") + " (ID " + (pokemon.otId || "—") + " / SID " + (pokemon.secretId || "—") + ")";

    const met = document.createElement("p");
    met.textContent = "Met: " + pokemon.metLocationText + " at Lv. " + (pokemon.metLevel || "—") + " on " + pokemon.metDateText;

    const ball = document.createElement("p");
    ball.textContent = "Poké Ball: " + pokemon.pokeballName;

    const egg = document.createElement("p");
    egg.textContent = pokemon.isEgg
      ? "Egg: Yes · Received " + pokemon.eggDateText + " · Location " + pokemon.eggLocationText
      : "Egg: No";

    const nicknameStatus = document.createElement("p");
    nicknameStatus.textContent = "Nickname: " + (pokemon.isNicknamed ? "Yes" : "No");

    history.append(historyHeading, originalTrainer, met, ball, egg, nicknameStatus);

    const stats = document.createElement("div");
    stats.className = "party-stats";
    const statEntries = [
      ["Attack", pokemon.stats?.attack],
      ["Defense", pokemon.stats?.defense],
      ["Speed", pokemon.stats?.speed],
      ["Sp. Atk", pokemon.stats?.specialAttack],
      ["Sp. Def", pokemon.stats?.specialDefense],
    ];

    for (const [label, value] of statEntries) {
      const stat = document.createElement("span");
      stat.textContent = label + ": " + (value ?? "—");
      stats.append(stat);
    }

    details.append(title, species, level, gender, heldItem, hp, nature, ability, experience, status, history, stats);
    partyItem.append(image, details);
    partyGrid.append(partyItem);
  }

  partyInfo.hidden = party.length === 0;
}

function resetFileInfo() {
  fileStatus.className = "status";
  fileStatus.textContent = "No save file loaded.";
  filePickerText.textContent = "Choose a save file or drop one here";
  gameValue.textContent = "Not detected";
  fileValue.textContent = "—";
  sizeValue.textContent = "—";
  partitionValue.textContent = "—";
  trainerNameValue.textContent = "—";
  trainerIdValue.textContent = "—";
  secretIdValue.textContent = "—";
  genderValue.textContent = "—";
  moneyValue.textContent = "—";
  playTimeValue.textContent = "—";
  badgesValue.textContent = "—";
  badgeGrid.replaceChildren();
  trainerInfo.hidden = true;
  partyInfo.hidden = true;
  partyGrid.replaceChildren();
  storageInfo.hidden = true;
  boxTabs.replaceChildren();
  boxGrid.replaceChildren();
  currentStorage = null;
}

function formatNumber(value) {
  return value.toLocaleString("en-US");
}

function formatPlayTime(playTime) {
  const hours = playTime.hours;
  const minutes = String(playTime.minutes).padStart(2, "0");
  const seconds = String(playTime.seconds).padStart(2, "0");

  return `${hours}h ${minutes}m ${seconds}s`;
}

function formatBytes(bytes) {
  if (bytes === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );

  return `${(bytes / 1024 ** exponent).toFixed(1)} ${units[exponent]}`;
}
