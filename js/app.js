import { detectSoulSilver } from "./saves/soulsilver.js";

const APP_VERSION = "0.2.1";

const fileInput = document.querySelector("#save-file");
const dropZone = document.querySelector("#drop-zone");
const fileStatus = document.querySelector("#file-status");
const filePickerText = document.querySelector(".file-picker-text");
const gameValue = document.querySelector("#game-value");
const fileValue = document.querySelector("#file-value");
const sizeValue = document.querySelector("#size-value");
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
    fileStatus.className = result.valid ? "status success" : "status error";
    fileStatus.textContent = result.reason;
  } catch (error) {
    gameValue.textContent = "Not detected";
    fileStatus.className = "status error";
    fileStatus.textContent = "Unable to read the selected file.";
    console.error(error);
  }
}

function resetFileInfo() {
  fileStatus.className = "status";
  fileStatus.textContent = "No save file loaded.";
  filePickerText.textContent = "Choose a save file or drop one here";
  gameValue.textContent = "Not detected";
  fileValue.textContent = "—";
  sizeValue.textContent = "—";
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
