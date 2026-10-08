const APP_VERSION = "0.0.1";

const fileInput = document.querySelector("#save-file");
const fileStatus = document.querySelector("#file-status");
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

  fileStatus.textContent = "File selected. Save parsing is not implemented yet.";
  fileValue.textContent = file.name;
  sizeValue.textContent = formatBytes(file.size);
});

function resetFileInfo() {
  fileStatus.textContent = "No save file loaded.";
  gameValue.textContent = "Not detected";
  fileValue.textContent = "—";
  sizeValue.textContent = "—";
}

function formatBytes(bytes) {
  if (bytes === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);

  return `${(bytes / 1024 ** exponent).toFixed(1)} ${units[exponent]}`;
}
