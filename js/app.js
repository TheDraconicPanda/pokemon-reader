import { detectSoulSilver } from "./saves/soulsilver.js";
import { HGSS_BADGES } from "./data/hgss-badges.js";

const APP_VERSION = "0.3.3";

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
    speciesName: data?.name ? formatPokemonName(data.name) : null,
    gender: getGender(pokemon.personality, data?.gender_rate),
    heldItemName,
  };
}

async function getPokemonData(speciesId) {
  if (pokemonDataCache.has(speciesId)) return pokemonDataCache.get(speciesId);

  const promise = fetch(`https://pokeapi.co/api/v2/pokemon-species/${speciesId}`)
    .then((response) => response.ok ? response.json() : null)
    .catch(() => null);

  pokemonDataCache.set(speciesId, promise);
  return promise;
}

async function getItemName(itemId) {
  if (!itemId) return "None";
  if (itemNameCache.has(itemId)) return itemNameCache.get(itemId);

  const promise = fetch(`https://pokeapi.co/api/v2/item/${itemId}`)
    .then((response) => response.ok ? response.json() : null)
    .then((item) => item ? formatPokemonName(item.name) : `Item #${itemId}`)
    .catch(() => `Item #${itemId}`);

  itemNameCache.set(itemId, promise);
  return promise;
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
    const item = document.createElement("article");
    item.className = "party-item";

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
    const item = document.createElement("p");
    item.textContent = `Held item: ${pokemon.heldItemName || "None"}`;
    const hp = document.createElement("p");
    hp.textContent = `HP ${pokemon.currentHp} / ${pokemon.maxHp}`;
    details.append(title, species, level, gender, item, hp);
    item.append(image, details);
    partyGrid.append(item);
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
