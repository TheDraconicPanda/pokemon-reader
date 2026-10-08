import { detectSoulSilver } from "./saves/soulsilver.js";
import { HGSS_BADGES } from "./data/hgss-badges.js";

const APP_VERSION = "0.3.0";

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
      renderParty(result.party);
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
    species.textContent = `Species #${pokemon.speciesId}`;
    const level = document.createElement("p");
    level.textContent = `Level ${pokemon.level}`;
    const hp = document.createElement("p");
    hp.textContent = `HP ${pokemon.currentHp} / ${pokemon.maxHp}`;
    details.append(title, species, level, hp);
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
