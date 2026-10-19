import { snapshotSave, rememberSave } from './planner-save.js';
import { createSnapshot, snapshotResult, listProfiles, getActiveProfile, persistSnapshot, selectProfile, preserveLegacyPlanner, trainerKey } from './adventures.js';
import { detectSoulSilver } from "./saves/soulsilver.js";
import { getAvailableEvolutions, evolveSoulSilverPokemon } from "./saves/soulsilver-evolution.js";
import { GEN4_LOCATION_NAMES } from "./data/gen4-locations.js";
import { HGSS_BADGES } from "./data/hgss-badges.js";

const APP_VERSION = "0.25.54";

const fileInput = document.querySelector("#save-file");
const dropZone = document.querySelector("#drop-zone");
const fileStatus = document.querySelector("#file-status");
const filePickerText = document.querySelector(".file-picker-text");
const trainerNameValue = document.querySelector("#trainer-name-value");
const trainerIdValue = document.querySelector("#trainer-id-value");
const secretIdValue = document.querySelector("#secret-id-value");
const genderValue = document.querySelector("#gender-value");
const moneyValue = document.querySelector("#money-value");
const playTimeValue = document.querySelector("#play-time-value");
const badgesValue = document.querySelector("#badges-value");
const badgeGrid = document.querySelector("#badge-grid");
const pokedexInfo = document.querySelector("#pokedex-info");
const pokedexModeValue = document.querySelector("#pokedex-mode-value");
const pokedexSeenValue = document.querySelector("#pokedex-seen-value");
const pokedexCaughtValue = document.querySelector("#pokedex-caught-value");
const collectionInfo = document.querySelector("#collection-info");
const collectionTotalValue = document.querySelector("#collection-total-value");
const collectionPartyValue = document.querySelector("#collection-party-value");
const collectionPcValue = document.querySelector("#collection-pc-value");
const collectionSpeciesValue = document.querySelector("#collection-species-value");
const collectionShinyValue = document.querySelector("#collection-shiny-value");
const collectionEggsValue = document.querySelector("#collection-eggs-value");
const collectionBoxCounts = document.querySelector("#collection-box-counts");
const collectionDetailsInfo = document.querySelector("#collection-details-info");
const collectionListMode = document.querySelector("#collection-list-mode");
const collectionSearch = document.querySelector("#collection-search");
const collectionSort = document.querySelector("#collection-sort");
const collectionDetailsCount = document.querySelector("#collection-details-count");
const collectionSpeciesList = document.querySelector("#collection-species-list");
const collectionShowMore = document.querySelector("#collection-show-more");
let currentCollectionDetails = null;
let speciesIndexPromise = null;
let currentPokedex = null;
let dexRevision = 0;
let dexVisibleLimit = 40;
let collectionVisibleLimit = 40;
const trainerInfo = document.querySelector("#trainer-info");
const collectionNav = document.querySelector("#collection-nav");
const pokemonDetailDialog = document.querySelector("#pokemon-detail-dialog");
const pokemonDetailContent = document.querySelector("#pokemon-detail-content");
const pokemonDetailClose = document.querySelector("#pokemon-detail-close");
const partyInfo = document.querySelector("#party-info");
const partyGrid = document.querySelector("#party-grid");
const storageInfo = document.querySelector("#storage-info");
const boxTabs = document.querySelector("#box-tabs");
const boxGrid = document.querySelector("#box-grid");
let currentStorage = null;
let activeBoxNumber = 1;
const pokemonDataCache = new Map();
let loadRevision = 0;
let detailRevision = 0;
let collectionRevision = 0;
let currentSaveBytes = null;
let currentSaveFileName = "pokemon-save.sav";
let currentActivePartition = null;
const itemNameCache = new Map();
const moveDataCache = new Map();
const appVersion = document.querySelector("#app-version");

appVersion.textContent = APP_VERSION;
document.title = `Pokémon Reader — v${APP_VERSION}`;

fileInput.addEventListener("change", () => {
  const [file] = fileInput.files;
  fileInput.value = "";
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
  const newAdventure = document.querySelector('#new-adventure').checked;
  resetFileInfo();
  const revision = loadRevision;
  const loadedAt = new Date().toISOString();
  document.querySelector(".app").setAttribute("aria-busy", "true");
  fileStatus.className = "status";
  fileStatus.textContent = "Reading save file…";
  filePickerText.textContent = "Choose another save file or drop one here";

  try {
    const buffer = await file.arrayBuffer();
    if (revision !== loadRevision) return;
    const result = detectSoulSilver(buffer);
    currentSaveBytes = result.valid ? new Uint8Array(buffer) : null;
    currentSaveFileName = file.name || "pokemon-save.sav";
    currentActivePartition = result.valid ? result.activePartition : null;

    if (result.valid) {
      let decodedSnapshot = null;
      try {
        const snapshot = createSnapshot(result, currentSaveFileName, loadedAt);
        decodedSnapshot = snapshot;
        const matches = (await listProfiles()).filter(profile => profile.trainerKey === trainerKey(snapshot));
        if (revision !== loadRevision) return;
        let profileId = null;
        if (!newAdventure && (matches.length > 1 || matches.length === 1 && (matches[0].snapshot.trainer.name !== snapshot.trainer.name || matches[0].snapshot.trainer.gender !== snapshot.trainer.gender))) {
          const choice = await chooseAdventure(matches);
          if (revision !== loadRevision) return;
          if (choice === null) {
            resetFileInfo();
            fileStatus.textContent = 'Save loading cancelled. Stored adventures were preserved.';
            return;
          }
          profileId = choice || null;
          const profile = await persistSnapshot(snapshot, {profileId, newAdventure:!choice});
          if (revision !== loadRevision) return;
          await refreshProfiles(profile.id);
        } else {
          const profile = await persistSnapshot(snapshot, {newAdventure});
          if (revision !== loadRevision) return;
          await refreshProfiles(profile.id);
        }
        adventureStatus.textContent = `Progress saved locally · ${new Date(loadedAt).toLocaleString()}. Original save file is held only for this session.`;
        document.querySelector('#new-adventure').checked = false;
      } catch (error) {
        if (revision !== loadRevision) return;
        adventureStatus.textContent = `This save could not update your stored adventure: ${error.message} Previous profiles are preserved. Reader remains usable for this session.`;
      }
      if (revision !== loadRevision) return;
      if (decodedSnapshot) rememberSave(snapshotSave(result, currentSaveFileName));
    }

    await renderDecodedSave(result, revision);

    if (revision !== loadRevision) return;
    document.querySelector(".app").dataset.saveLoaded = String(result.valid);
    fileStatus.className = result.valid ? "status success" : "status error";
    fileStatus.textContent = result.reason;
  } catch (error) {
    if (revision !== loadRevision) return;
    resetFileInfo();
    fileStatus.className = "status error";
    fileStatus.textContent = "Unable to read the selected file. Stored adventures were preserved.";
    console.error(error);
  } finally {
    if (revision === loadRevision) document.querySelector(".app").setAttribute("aria-busy", "false");
  }
}

async function renderDecodedSave(result, revision) {
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
      renderPokedex(result.save.pokedex);
      renderCollectionStats(result.party, result.storage);
      renderCollectionDetails(result.save.pokedex, result.party, result.storage);
      renderOverview(result);
      document.querySelector("#upload-heading").textContent = "Load another save";
      document.querySelector("#upload-help").hidden = true;
      document.querySelector("#upload-area").hidden = true;
      trainerInfo.hidden = false;
      collectionNav.hidden = false;
      const enrichedParty = await enrichPokemonList(result.party, true);
      const enrichedStorage = await enrichStorage(result.storage);
      if (revision !== loadRevision) return;
      renderParty(enrichedParty);
      renderStorage(enrichedStorage);
      renderCollectionGender(enrichedParty, enrichedStorage);
      renderAlternateForms(enrichedParty, enrichedStorage);
    }

}

const adventureStatus = document.querySelector('#adventure-status');
const adventureSelect = document.querySelector('#adventure-select');
const adventureRestore = document.querySelector('#adventure-restore');
async function refreshProfiles(selectedId) {
  const profiles = await listProfiles();
  adventureSelect.replaceChildren();
  if (!profiles.length) adventureSelect.add(new Option('No saved adventures', ''));
  for (const profile of profiles.sort((a,b) => b.updatedAt.localeCompare(a.updatedAt))) {
    const trainer = profile.snapshot.trainer;
    adventureSelect.add(new Option(`${trainer.name || 'Trainer'} · SoulSilver · ${trainer.trainerId} · ${new Date(profile.updatedAt).toLocaleString()} · ${profile.id.slice(0,8)}`, profile.id));
  }
  if (selectedId) adventureSelect.value = selectedId;
  adventureRestore.disabled = !adventureSelect.value;
}
adventureSelect.addEventListener('change', () => { adventureRestore.disabled = !adventureSelect.value; });

function chooseAdventure(matches) {
  const dialog = document.querySelector('#adventure-match-dialog');
  const select = document.querySelector('#adventure-match-select');
  select.replaceChildren(new Option('Keep as a separate adventure', ''));
  for (const profile of matches) select.add(new Option(`${profile.snapshot.trainer.name} · ${new Date(profile.updatedAt).toLocaleString()} · ${profile.id.slice(0,8)}`, profile.id));
  return new Promise(resolve => {
    dialog.returnValue = '';
    dialog.addEventListener('close', () => resolve(dialog.returnValue === 'confirm' ? select.value : null), {once:true});
    dialog.showModal();
  });
}

async function restoreAdventure(profile, revision) {
  if (!profile || revision !== loadRevision) return;
  const result = snapshotResult(profile.snapshot);
  document.querySelector('.app').setAttribute('aria-busy', 'true');
  await renderDecodedSave(result, revision);
  if (revision !== loadRevision) return;
  document.querySelector('.app').dataset.saveLoaded = 'true';
  document.querySelector('.app').setAttribute('aria-busy', 'false');
  rememberSave(snapshotSave(result, profile.snapshot.fileName));
  adventureStatus.textContent = `Restored ${profile.snapshot.trainer.name}'s progress from ${new Date(profile.snapshot.loadedAt).toLocaleString()}. Reload the original save to export an evolution. Original save files are never stored.`;
}
adventureRestore.addEventListener('click', async () => {
  const id = adventureSelect.value;
  resetFileInfo();
  const revision = loadRevision;
  try {
    const profile = await selectProfile(id);
    await restoreAdventure(profile, revision);
  } catch (error) {
    if (revision === loadRevision) {
      document.querySelector('.app').setAttribute('aria-busy','false');
      adventureStatus.textContent = `Could not restore adventure: ${error.message}`;
    }
  }
});

async function initializeAdventures() {
  const revision = loadRevision;
  try {
    await preserveLegacyPlanner();
  } catch (error) {
    const warning = document.querySelector('#adventure-migration-status');
    warning.hidden = false;
    warning.textContent = `Existing Planner data was kept unchanged; its migration copy could not be created: ${error.message}`;
  }
  try {
    const profile = await getActiveProfile();
    if (revision !== loadRevision) return;
    await refreshProfiles(profile?.id);
    await restoreAdventure(profile, revision);
  } catch (error) {
    if (revision === loadRevision) {
      document.querySelector('.app').setAttribute('aria-busy','false');
      adventureStatus.textContent = `Adventure storage is unavailable: ${error.message} You can still load a save for this session.`;
    }
  }
}
initializeAdventures();

document.querySelector("#load-save").addEventListener("click", () => {
  resetFileInfo();
  location.hash = "overview";
  fileInput.focus();
});

function renderOverview(result) {
  const list = document.querySelector("#overview-stats");
  list.replaceChildren();
  const metrics = [
    ["Party", collectionPartyValue.textContent, "party"],
    ["PC Pokémon", collectionPcValue.textContent, "storage"],
    ["Unique Species", collectionSpeciesValue.textContent, "owned"],
    ["Shiny", collectionShinyValue.textContent, "shiny"],
    ["Seen", result.save.pokedex.seenCount, "seen"],
    ["Caught", result.save.pokedex.caughtCount, "caught"],
  ];
  for (const [label, value, destination] of metrics) {
    const button = document.createElement("button"); button.type = "button";
    button.className = "summary-button"; button.dataset.destination = destination;
    const title = document.createElement("span"); title.textContent = label;
    const count = document.createElement("strong"); count.textContent = value;
    button.append(title, count);
    button.addEventListener("click", () => {
      if (destination === "party" || destination === "storage") location.hash = destination;
      else if (destination === "seen" || destination === "caught") {
        document.querySelector("#dex-search").value = "";
        document.querySelector("#dex-filter").value = destination;
        dexVisibleLimit = 40; renderPokedexList(); location.hash = "pokedex";
      } else {
        collectionListMode.value = destination; collectionSearch.value = "";
        collectionVisibleLimit = 40; renderCollectionSpeciesList(); location.hash = "collection-details-info";
      }
    });
    list.append(button);
  }
  document.querySelector("#overview-summary").hidden = false;
}

function renderCollectionGender(party, storage) {
  const ownedPokemon = [
    ...party.filter((pokemon) => !pokemon.empty),
    ...storage.boxes.flatMap((box) => box.pokemon.filter((pokemon) => !pokemon.empty)),
  ].filter((pokemon) => !pokemon.isEgg);

  const counts = { Male: 0, Female: 0, Genderless: 0, Unknown: 0 };
  for (const pokemon of ownedPokemon) {
    const gender = counts[pokemon.gender] === undefined ? "Unknown" : pokemon.gender;
    counts[gender]++;
  }

  document.querySelector("#collection-gender-total").textContent = formatNumber(ownedPokemon.length);
  document.querySelector("#collection-gender-male").textContent = formatNumber(counts.Male);
  document.querySelector("#collection-gender-female").textContent = formatNumber(counts.Female);
  document.querySelector("#collection-genderless").textContent = formatNumber(counts.Genderless);
  document.querySelector("#collection-gender-unknown").textContent = formatNumber(counts.Unknown);
  document.querySelector("#collection-gender-info").hidden = false;
}



const ALTERNATE_FORM_SPECIES = Object.freeze([
  { id: 172, name: "Pichu", forms: ["Normal", "Spiky-eared"] },
  { id: 201, name: "Unown", forms: [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ", "!", "?"] },
  { id: 386, name: "Deoxys", forms: ["Normal", "Attack", "Defense", "Speed"] },
  { id: 412, name: "Burmy", forms: ["Plant", "Sandy", "Trash"] },
  { id: 413, name: "Wormadam", forms: ["Plant", "Sandy", "Trash"] },
  { id: 422, name: "Shellos", forms: ["West Sea", "East Sea"] },
  { id: 423, name: "Gastrodon", forms: ["West Sea", "East Sea"] },
  { id: 479, name: "Rotom", forms: ["Normal", "Heat", "Wash", "Frost", "Fan", "Mow"] },
  { id: 487, name: "Giratina", forms: ["Altered", "Origin"] },
  { id: 492, name: "Shaymin", forms: ["Land", "Sky"] },
  { id: 493, name: "Arceus", forms: ["Normal", "Fighting", "Flying", "Poison", "Ground", "Rock", "Bug", "Ghost", "Steel", "???", "Fire", "Water", "Grass", "Electric", "Psychic", "Ice", "Dragon", "Dark"] },
]);

const ALTERNATE_FORM_BY_SPECIES = new Map(
  ALTERNATE_FORM_SPECIES.map((entry) => [entry.id, entry])
);

function getPokemonFormName(pokemon) {
  const species = ALTERNATE_FORM_BY_SPECIES.get(pokemon.speciesId);
  if (!species || !Number.isInteger(pokemon.formId)) return null;
  return species.forms[pokemon.formId] || null;
}

function renderAlternateForms(party, storage) {
  const counts = new Map();
  for (const species of ALTERNATE_FORM_SPECIES) {
    counts.set(species.id, species.forms.map(() => 0));
  }

  const ownedPokemon = [
    ...party.filter((pokemon) => !pokemon.empty),
    ...storage.boxes.flatMap((box) => box.pokemon.filter((pokemon) => !pokemon.empty)),
  ];

  let total = 0;
  for (const pokemon of ownedPokemon) {
    if (pokemon.isEgg) continue;
    const species = ALTERNATE_FORM_BY_SPECIES.get(pokemon.speciesId);
    if (!species || !Number.isInteger(pokemon.formId)) continue;
    const speciesCounts = counts.get(species.id);
    if (pokemon.formId < 0 || pokemon.formId >= speciesCounts.length) continue;
    speciesCounts[pokemon.formId]++;
    total++;
  }

  const list = document.querySelector("#unown-form-list");
  list.className = "alternate-form-groups";
  list.replaceChildren();
  for (const species of ALTERNATE_FORM_SPECIES) {
    const group = document.createElement("section");
    group.className = "alternate-form-group";

    const heading = document.createElement("h3");
    heading.textContent = species.name;

    const forms = document.createElement("div");
    forms.className = "alternate-form-options";
    species.forms.forEach((form, index) => {
      const item = document.createElement("div");
      item.className = "unown-form-item";

      const label = document.createElement("span");
      label.className = "unown-form-letter";
      label.textContent = form;

      const count = document.createElement("span");
      count.className = "unown-form-count";
      count.textContent = formatNumber(counts.get(species.id)[index]);

      item.append(label, count);
      forms.append(item);
    });

    group.append(heading, forms);
    list.append(group);
  }

  document.querySelector("#unown-form-total").textContent = formatNumber(total);
  document.querySelector("#unown-form-info").hidden = false;
}

function renderCollectionStats(party, storage) {
  const partyPokemon = party.filter((pokemon) => !pokemon.empty);
  const boxPokemon = storage.boxes.flatMap((box) => box.pokemon.filter((pokemon) => !pokemon.empty));
  const allPokemon = [...partyPokemon, ...boxPokemon];
  const uniqueSpecies = new Set(
    allPokemon.filter((pokemon) => !pokemon.isEgg && pokemon.speciesId > 0)
      .map((pokemon) => pokemon.speciesId)
  );

  collectionTotalValue.textContent = formatNumber(allPokemon.length);
  collectionPartyValue.textContent = `${partyPokemon.length} / 6`;
  collectionPcValue.textContent = `${boxPokemon.length} / ${storage.boxes.length * 30}`;
  collectionSpeciesValue.textContent = formatNumber(uniqueSpecies.size);
  collectionShinyValue.textContent = formatNumber(allPokemon.filter((pokemon) => pokemon.shiny).length);
  collectionEggsValue.textContent = formatNumber(allPokemon.filter((pokemon) => pokemon.isEgg).length);

  collectionBoxCounts.replaceChildren();
  for (const box of storage.boxes) {
    const occupied = box.pokemon.filter((pokemon) => !pokemon.empty).length;
    const item = document.createElement("div");
    item.className = "collection-box-count";

    const name = document.createElement("span");
    name.textContent = box.name;

    const count = document.createElement("span");
    count.textContent = `${occupied} / 30`;

    item.append(name, count);
    collectionBoxCounts.append(item);
  }

  collectionInfo.hidden = false;
}


function renderCollectionDetails(pokedex, party, storage) {
  const ownedCounts = new Map();
  const allPokemon = [
    ...party.filter((pokemon) => !pokemon.empty),
    ...storage.boxes.flatMap((box) => box.pokemon.filter((pokemon) => !pokemon.empty).map(pokemon => ({...pokemon, boxName:box.name}))),
  ];

  for (const pokemon of allPokemon) {
    if (pokemon.isEgg || !pokemon.speciesId) continue;
    ownedCounts.set(pokemon.speciesId, (ownedCounts.get(pokemon.speciesId) || 0) + 1);
  }

  currentCollectionDetails = {
    speciesIds: pokedex.speciesIds || [],
    caughtSpecies: new Set(pokedex.caughtSpecies || []),
    ownedCounts,
    allPokemon,
  };
  collectionListMode.value = "caught";
  collectionSearch.value = "";
  collectionVisibleLimit = 40;
  collectionDetailsInfo.hidden = false;
  renderCollectionSpeciesList();
  renderPokedexList();
}

collectionListMode.addEventListener("change", () => {
  collectionVisibleLimit = 40;
  renderCollectionSpeciesList();
});

collectionSort.addEventListener("change", () => {
  collectionVisibleLimit = 40;
  renderCollectionSpeciesList();
});

collectionSearch.addEventListener("input", () => {
  collectionVisibleLimit = 40;
  renderCollectionSpeciesList();
});

collectionShowMore.addEventListener("click", () => {
  collectionVisibleLimit += 40;
  renderCollectionSpeciesList();
});

function fetchMetadata(url) {
  return fetch(url, { signal: AbortSignal.timeout(8000) });
}

function getSpeciesIndex() {
  if (!speciesIndexPromise) {
    speciesIndexPromise = fetchMetadata("https://pokeapi.co/api/v2/pokemon-species?limit=493")
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        const names = new Map();
        for (const species of data?.results || []) {
          const match = species.url.match(/\/(\d+)\/?$/);
          if (match) names.set(Number(match[1]), formatPokemonName(species.name));
        }
        return names;
      })
      .catch(() => new Map());
  }
  return speciesIndexPromise;
}

async function renderCollectionSpeciesList() {
  if (!currentCollectionDetails) return;

  const revision = ++collectionRevision;
  const context = currentCollectionDetails;
  const { speciesIds, caughtSpecies, ownedCounts, allPokemon } = context;
  const sortMode = collectionSort.value;
  const mode = collectionListMode.value;
  const query = collectionSearch.value.trim().toLowerCase();
  const speciesIndex = await getSpeciesIndex();
  if (revision !== collectionRevision || context !== currentCollectionDetails) return;
  let entries = [];

  if (mode === "caught") {
    entries = speciesIds.filter((id) => caughtSpecies.has(id)).map((id) => ({ id, count: ownedCounts.get(id) || 0 }));
  } else if (mode === "missing") {
    entries = speciesIds.filter((id) => !caughtSpecies.has(id)).map((id) => ({ id, count: ownedCounts.get(id) || 0 }));
  } else if (mode === "shiny") {
    entries = allPokemon.filter(pokemon => pokemon.shiny).map(pokemon => ({id:pokemon.speciesId,pokemon,count:1}));
  } else {
    entries = [...ownedCounts.entries()]
      .filter(([, count]) => mode === "owned" || count > 1)
      .map(([id, count]) => ({ id, count }))
      .sort((a, b) => b.count - a.count || a.id - b.id);
  }

  entries = entries.filter(({ id, pokemon }) => {
    const name = `${speciesIndex.get(id) || ""} ${pokemon?.nickname || ""}`.toLowerCase();
    return !query || name.includes(query) || String(id).includes(query.replace(/^#/, ""));
  });

  entries.sort((a, b) => {
    if (sortMode === "name") {
      return (a.pokemon?.nickname || speciesIndex.get(a.id) || `Pokémon #${a.id}`).localeCompare(
        b.pokemon?.nickname || speciesIndex.get(b.id) || `Pokémon #${b.id}`
      ) || a.id - b.id;
    }
    if (sortMode === "priority") {
      const aOwned = a.count || 0;
      const bOwned = b.count || 0;
      return bOwned - aOwned || a.id - b.id;
    }
    return a.id - b.id;
  });

  collectionDetailsCount.textContent = query
    ? `${formatNumber(entries.length)} matching ${mode === "shiny" ? "shiny Pokémon" : "species"}`
    : `${formatNumber(entries.length)} ${mode === "shiny" ? "shiny Pokémon" : "species"}`;
  collectionSpeciesList.replaceChildren();

  const visibleEntries = entries.slice(0, collectionVisibleLimit);
  for (const entry of visibleEntries) {
    const row = document.createElement("div");
    row.className = "collection-species-row";

    const image = document.createElement("img");
    image.src = entry.pokemon ? pokemonSprite(entry.pokemon) : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${entry.id}.png`;
    image.alt = "";
    image.loading = "lazy";

    const info = document.createElement("div");
    const name = document.createElement("div");
    name.className = "collection-species-name";
    name.textContent = entry.pokemon?.nickname || speciesIndex.get(entry.id) || `Pokémon #${entry.id}`;

    const id = document.createElement("div");
    id.className = "collection-species-id";
    id.textContent = `${entry.pokemon ? `${speciesIndex.get(entry.id) || "Pokémon"} · ` : ""}National Dex #${entry.id}`;
    info.append(name, id);

    const meta = document.createElement("div");
    meta.className = "collection-species-meta";
    if (mode === "shiny") {
      meta.textContent = `★ Shiny · ${entry.pokemon.boxName || "Party"}, slot ${entry.pokemon.slot}${entry.pokemon.isEgg ? " · Egg" : ""}`;
      const inspect = document.createElement("button"); inspect.type = "button"; inspect.className = "pokemon-detail-button";
      inspect.textContent = `Inspect ${name.textContent}`; inspect.addEventListener("click", () => openPokemonDetails(entry.pokemon)); info.append(inspect);
    } else if (mode === "duplicates") {
      meta.textContent = `Owned ×${entry.count}`;
    } else {
      const count = ownedCounts.get(entry.id) || 0;
      meta.textContent = count ? `Owned: ${count}` : "Not currently in party/PC";
    }

    row.append(image, info, meta);
    collectionSpeciesList.append(row);
  }

  collectionShowMore.hidden = entries.length <= collectionVisibleLimit;
  if (visibleEntries.length === 0) {
    const empty = document.createElement("p");
    empty.className = "collection-details-count";
    empty.textContent = query ? "No matching species." : "Nothing to show in this category yet.";
    collectionSpeciesList.append(empty);
  }
}

function renderPokedex(pokedex) {
  currentPokedex = pokedex;
  dexVisibleLimit = 40;
  if (!pokedex) {
    pokedexInfo.hidden = true;
    return;
  }

  pokedexModeValue.textContent = pokedex.nationalDex
    ? "National Dex"
    : "Regional Dex";
  pokedexSeenValue.textContent =
    pokedex.seenCount + " / " + pokedex.speciesCount + " (" + formatPercent(pokedex.seenPercent) + ")";
  pokedexCaughtValue.textContent =
    pokedex.caughtCount + " / " + pokedex.speciesCount + " (" + formatPercent(pokedex.caughtPercent) + ")";
  pokedexInfo.hidden = false;
}

async function renderPokedexList() {
  if (!currentPokedex || !currentCollectionDetails) return;
  const revision = ++dexRevision;
  const dex = currentPokedex;
  const ownership = currentCollectionDetails.ownedCounts;
  const query = document.querySelector("#dex-search").value.trim().toLowerCase();
  const filter = document.querySelector("#dex-filter").value;
  const names = await getSpeciesIndex();
  if (revision !== dexRevision || dex !== currentPokedex) return;
  const seen = new Set(dex.seenSpecies || []), caught = new Set(dex.caughtSpecies || []);
  const entries = dex.speciesIds.filter(id => {
    const matches = !query || `${names.get(id) || ""} #${id}`.toLowerCase().includes(query);
    return matches && (filter === "all" || filter === "seen" && seen.has(id) || filter === "caught" && caught.has(id) || filter === "owned" && ownership.has(id) || filter === "missing" && !caught.has(id) || filter === "unseen" && !seen.has(id));
  });
  const list = document.querySelector("#dex-list"); list.replaceChildren();
  document.querySelector("#dex-count").textContent = `${entries.length} matching species${names.size ? "" : " · Species names unavailable; search by number"}`;
  for (const id of entries.slice(0, dexVisibleLimit)) {
    const card = document.createElement("article"); card.className = "dex-entry"; card.dataset.species = id;
    const image = document.createElement("img"); image.src = pokemonSprite({speciesId:id}); image.alt = ""; image.loading = "lazy"; image.width = 80; image.height = 80;
    const name = document.createElement("h3"); name.textContent = names.get(id) || `Pokémon #${id}`;
    const number = document.createElement("p"); number.textContent = `National Dex #${id}`;
    const flags = document.createElement("div"); flags.className = "dex-flags";
    for (const [label, active] of [["Seen", seen.has(id)], ["Caught", caught.has(id)], ["Currently Owned", ownership.has(id)]]) {
      const flag = document.createElement("span"); flag.className = active ? "registered" : "unregistered";
      flag.textContent = `${label}: ${active ? "Yes" : "No"}${label === "Currently Owned" && active ? ` (${ownership.get(id)})` : ""}`; flags.append(flag);
    }
    card.append(image, name, number, flags); list.append(card);
  }
  if (!entries.length) { const empty = document.createElement("p"); empty.textContent = "No species match these filters."; list.append(empty); }
  document.querySelector("#dex-more").hidden = entries.length <= dexVisibleLimit;
}
for (const [id, event] of [["dex-search", "input"], ["dex-filter", "change"]]) {
  document.querySelector(`#${id}`).addEventListener(event, () => { dexVisibleLimit = 40; renderPokedexList(); });
}
document.querySelector("#dex-more").addEventListener("click", () => { dexVisibleLimit += 40; renderPokedexList(); });

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

async function enrichPokemonList(pokemonList, includeMoves = false) {
  return Promise.all(pokemonList.map((pokemon) => enrichPokemon(pokemon, includeMoves)));
}

async function enrichStorage(storage) {
  const boxes = await Promise.all(storage.boxes.map(async (box) => ({
    ...box,
    pokemon: await enrichPokemonList(box.pokemon),
  })));

  return { ...storage, boxes };
}

function getSoulSilverTypes(data) {
  // PokeAPI past_types records the last generation using each historical typing.
  const generations = ["generation-i", "generation-ii", "generation-iii", "generation-iv", "generation-v", "generation-vi", "generation-vii", "generation-viii", "generation-ix"];
  const historical = (data?.past_types || []).filter(entry => generations.indexOf(entry.generation.name) >= 3)
    .sort((a, b) => generations.indexOf(a.generation.name) - generations.indexOf(b.generation.name))[0];
  return (historical?.types || data?.types || []).map(entry => entry.type.name);
}

async function enrichPokemon(pokemon, includeMoves = false) {
  if (pokemon.empty) return pokemon;

  const data = await getPokemonData(pokemon.speciesId);
  const heldItemName = await getItemName(pokemon.heldItemId);

  return {
    ...pokemon,
    types: getSoulSilverTypes(data?.pokemon),
    speciesName: data?.species?.name ? formatPokemonName(data.species.name) : null,
    growthRate: data?.species?.growth_rate?.name || null,
    level: pokemon.level ?? estimateLevelFromExperience(
      pokemon.experience,
      data?.species?.growth_rate?.name
    ),
    formName: getPokemonFormName(pokemon),
    gender: getGender(pokemon.personality, data?.species?.gender_rate),
    abilityName: getAbilityName(data?.pokemon, pokemon.abilityId),
    natureName: getNatureName(pokemon.natureId),
    statusText: pokemon.status === undefined ? "Not stored in PC record" : getStatusText(pokemon.status),
    experienceText: formatNumber(pokemon.experience),
    heldItemName,
    pokeballName: getPokeballName(pokemon.pokeballId),
    metDateText: formatPokemonDate(pokemon.metDate),
    eggDateText: formatPokemonDate(pokemon.eggDate),
    metLocationText: formatLocation(pokemon.metLocationId),
    eggLocationText: formatLocation(pokemon.eggLocationId),
    moves: includeMoves ? await enrichMoves(pokemon.moves) : pokemon.moves,
    hiddenPower: getHiddenPower(pokemon.ivs),
  };
}

async function enrichMoves(moves) {
  if (!moves) return [];

  return Promise.all(moves.map(async (move) => {
    if (!move.id) return { ...move, name: "—", maxPP: null };
    const details = await getMoveData(move.id);
    const ppUps = Math.min(3, Math.max(0, Number(move.ppUps) || 0));
    const maxPP = Number.isFinite(details.basePP)
      ? Math.floor(details.basePP * (5 + ppUps) / 5)
      : null;

    return {
      ...move,
      name: details.name,
      maxPP,
    };
  }));
}

async function getMoveData(moveId) {
  if (!moveId) return { name: "—", basePP: null };
  if (moveDataCache.has(moveId)) return moveDataCache.get(moveId);

  const promise = fetchMetadata(`https://pokeapi.co/api/v2/move/${moveId}`)
    .then((response) => response.ok ? response.json() : null)
    .then((move) => ({
      name: move?.name ? formatPokemonName(move.name) : `Move #${moveId}`,
      basePP: Number.isFinite(move?.pp) ? move.pp : null,
    }))
    .catch(() => ({ name: `Move #${moveId}`, basePP: null }));

  moveDataCache.set(moveId, promise);
  return promise;
}

function formatMovePP(move) {
  const currentPP = Number.isFinite(move.pp) ? move.pp : "—";
  const maxPP = Number.isFinite(move.maxPP) ? move.maxPP : "?";
  const ppUps = move.ppUps ?? 0;
  return `PP ${currentPP} / ${maxPP} · PP Ups: ${ppUps}`;
}

const HIDDEN_POWER_TYPES = Object.freeze([
  "Fighting", "Flying", "Poison", "Ground", "Rock", "Bug", "Ghost",
  "Steel", "Fire", "Water", "Grass", "Electric", "Psychic", "Ice",
  "Dragon", "Dark",
]);

function getHiddenPower(ivs) {
  if (!ivs) return null;

  const bits = [ivs.hp, ivs.attack, ivs.defense, ivs.speed, ivs.specialAttack, ivs.specialDefense];
  const typeValue = Math.floor(
    bits.reduce((sum, iv, index) => sum + (iv % 2) * (2 ** index), 0) * 15 / 63
  );
  const powerValue = Math.floor(
    (bits.reduce((sum, iv, index) => sum + (Math.floor(iv / 2) % 2) * (2 ** index), 0) * 40 / 63) + 30
  );

  return {
    type: HIDDEN_POWER_TYPES[typeValue],
    power: powerValue,
  };
}

async function getPokemonData(speciesId) {
  if (pokemonDataCache.has(speciesId)) return pokemonDataCache.get(speciesId);

  const promise = Promise.all([
    fetchMetadata(`https://pokeapi.co/api/v2/pokemon-species/${speciesId}`)
      .then((response) => response.ok ? response.json() : null)
      .catch(() => null),
    fetchMetadata(`https://pokeapi.co/api/v2/pokemon/${speciesId}`)
      .then((response) => response.ok ? response.json() : null)
      .catch(() => null),
  ]).then(([species, pokemon]) => ({ species, pokemon }));

  pokemonDataCache.set(speciesId, promise);
  return promise;
}

const NATURE_NAMES = Object.freeze([
  "Hardy", "Lonely", "Brave", "Adamant", "Naughty",
  "Bold", "Docile", "Relaxed", "Impish", "Lax",
  "Timid", "Hasty", "Serious", "Jolly", "Naive",
  "Modest", "Mild", "Quiet", "Bashful", "Rash",
  "Calm", "Gentle", "Sassy", "Careful", "Quirky",
]);

function getNatureName(natureId) {
  return NATURE_NAMES[natureId] || "Unknown";
}

function getAbilityName(data, abilityId) {
  if (!data?.abilities || abilityId == null) return "Unknown";

  const ability = data.abilities.find((entry) => {
    const match = entry.ability?.url?.match(/\/(\d+)\/?$/);
    return match && Number(match[1]) === abilityId;
  });

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

  const promise = fetchMetadata(endpoint)
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
  return GEN4_LOCATION_NAMES[locationId] || "Location #" + locationId;
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

function getDisplaySpeciesName(pokemon) {
  const speciesName = pokemon.speciesName || `Species #${pokemon.speciesId}`;
  return pokemon.formName ? `${speciesName} (${pokemon.formName})` : speciesName;
}

function renderStorage(storage) {
  currentStorage = storage;
  boxTabs.replaceChildren();
  document.querySelector("#box-select").replaceChildren();

  for (const box of storage.boxes) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "box-tab";
    const occupied = box.pokemon.filter(p => !p.empty).length;
    button.textContent = `${box.name} (${occupied})`;
    const option = document.createElement("option"); option.value = box.number; option.textContent = `${box.name} · ${occupied}/30`;
    document.querySelector("#box-select").append(option);
    button.dataset.box = box.number;
    button.addEventListener("click", () => renderBox(box.number));
    boxTabs.append(button);
  }

  renderBox(storage.boxes[storage.currentBox] ? storage.currentBox + 1 : 1);
  renderStorageSearch();
  storageInfo.hidden = false;
}

function renderBox(boxNumber) {
  if (!currentStorage) return;

  const box = currentStorage.boxes[boxNumber - 1];
  if (!box) return;

  activeBoxNumber = boxNumber;
  document.querySelector("#box-select").value = String(boxNumber);
  document.querySelector("#box-previous").disabled = boxNumber === 1;
  document.querySelector("#box-next").disabled = boxNumber === currentStorage.boxes.length;
  document.querySelector("#box-occupancy").textContent = `${box.name} · ${box.pokemon.filter(p => !p.empty).length} / 30 occupied`;
  boxTabs.querySelectorAll(".box-tab").forEach((button) => {
    const selected = Number(button.dataset.box) === boxNumber;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-current", selected ? "true" : "false");
  });

  boxGrid.replaceChildren();

  for (const pokemon of box.pokemon) {
    const item = document.createElement("article");
    item.className = `box-slot${pokemon.empty ? " empty" : ""}`;
    item.dataset.slot = pokemon.slot;
    const query = document.querySelector("#storage-search").value.trim().toLowerCase();
    if (query && !pokemon.empty) item.classList.add(storageMatches(pokemon, query) ? "search-match" : "search-muted");
    const position = document.createElement("span"); position.className = "slot-label"; position.textContent = `Slot ${pokemon.slot}`; item.append(position);
    item.title = pokemon.empty
      ? `Empty slot ${pokemon.slot}`
      : (pokemon.nickname || getDisplaySpeciesName(pokemon) || `Pokémon #${pokemon.speciesId}`);

    if (!pokemon.empty) {
      const image = document.createElement("img");
      image.src = pokemonSprite(pokemon);
      image.alt = `Pokémon #${pokemon.speciesId}`;
      image.width = 72;
      image.height = 72;

      const name = document.createElement("span");
      name.textContent = pokemon.nickname || getDisplaySpeciesName(pokemon) || `#${pokemon.speciesId}`;
      item.append(image, name);

      const detailButton = document.createElement("button");
      detailButton.type = "button";
      detailButton.className = "pokemon-detail-button";
      detailButton.textContent = "Inspect";
      detailButton.setAttribute("aria-label", `Inspect ${name.textContent}, slot ${pokemon.slot}`);
      detailButton.addEventListener("click", (event) => {
        event.stopPropagation();
        openPokemonDetails(pokemon);
      });
      item.append(detailButton);
      item.addEventListener("click", event => { if (!event.target.closest("button, select")) { detailButton.focus(); openPokemonDetails(pokemon); } });

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


function storageMatches(pokemon, query) {
  return !pokemon.empty && `${pokemon.nickname || ""} ${getDisplaySpeciesName(pokemon)} #${pokemon.speciesId}`.toLowerCase().includes(query);
}
function renderStorageSearch() {
  const results = document.querySelector("#storage-results"); results.replaceChildren();
  const query = document.querySelector("#storage-search").value.trim().toLowerCase();
  results.hidden = !query || !currentStorage;
  if (results.hidden) return;
  const matches = currentStorage.boxes.flatMap(box => box.pokemon.filter(p => storageMatches(p, query)).map(pokemon => ({box,pokemon})));
  const count = document.createElement("p"); count.textContent = `${matches.length} matching Pokémon across all boxes`; results.append(count);
  for (const {box,pokemon} of matches) {
    const button = document.createElement("button"); button.type = "button";
    button.textContent = `${pokemon.nickname || getDisplaySpeciesName(pokemon)} · ${box.name}, slot ${pokemon.slot}`;
    button.addEventListener("click", () => {
      renderBox(box.number);
      const target = boxGrid.querySelector(`[data-slot="${pokemon.slot}"] .pokemon-detail-button`);
      target.focus(); target.scrollIntoView({block:"nearest"});
    }); results.append(button);
  }
}
document.querySelector("#box-select").addEventListener("change", event => renderBox(Number(event.target.value)));
document.querySelector("#box-previous").addEventListener("click", () => renderBox(activeBoxNumber - 1));
document.querySelector("#box-next").addEventListener("click", () => renderBox(activeBoxNumber + 1));
document.querySelector("#storage-search").addEventListener("input", () => { renderBox(activeBoxNumber); renderStorageSearch(); });
boxTabs.addEventListener("keydown", event => {
  if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key) || !event.target.matches(".box-tab")) return;
  event.preventDefault();
  const next = event.key === "Home" ? 1 : event.key === "End" ? 18 : Math.min(18, Math.max(1, activeBoxNumber + (event.key === "ArrowRight" ? 1 : -1)));
  renderBox(next); boxTabs.querySelector(`[data-box="${next}"]`).focus();
});


async function openPokemonDetails(pokemon) {
  if (!pokemon || pokemon.empty) return;
  document.querySelector("#pokemon-detail-dialog-title").textContent = pokemon.nickname || getDisplaySpeciesName(pokemon);
  const revision = ++detailRevision;
  pokemonDetailContent.replaceChildren();
  pokemonDetailContent.setAttribute("aria-busy", "true");
  const loading = document.createElement("p");
  loading.textContent = "Loading Pokémon details…";
  pokemonDetailContent.append(loading);
  if (typeof pokemonDetailDialog.showModal === "function") {
    pokemonDetailDialog.showModal();
  } else {
    pokemonDetailDialog.setAttribute("open", "");
  }
  try {
    const detailedPokemon = await enrichPokemon(pokemon, true);
    if (revision !== detailRevision || !pokemonDetailDialog.open) return;
    renderPokemonDetail(detailedPokemon);
  } catch (error) {
    if (revision !== detailRevision || !pokemonDetailDialog.open) return;
    pokemonDetailContent.replaceChildren();
    const message = document.createElement("p");
    message.textContent = "Some Pokémon details could not be loaded. Parsed save data is shown where available.";
    pokemonDetailContent.append(message);
    renderPokemonDetail(pokemon);
    console.error(error);
  }
}

function renderPokemonDetail(pokemon) {
  pokemonDetailContent.setAttribute("aria-busy", "false");
  pokemonDetailContent.replaceChildren();
  document.querySelector("#pokemon-detail-dialog-title").textContent = pokemon.nickname || getDisplaySpeciesName(pokemon);

  const header = document.createElement("div");
  header.className = "pokemon-detail-header";
  const image = document.createElement("img");
  image.src = pokemonSprite(pokemon);
  image.alt = "";
  image.width = 112;
  image.height = 112;
  const identity = document.createElement("div");
  const species = document.createElement("p");
  species.className = "party-species";
  species.textContent = `${getDisplaySpeciesName(pokemon) || `Pokémon #${pokemon.speciesId}`} · National Dex #${pokemon.speciesId}`;
  const level = document.createElement("p");
  level.textContent = `Level ${pokemon.level ?? "—"} · ${pokemon.gender || "Gender unknown"}`;
  identity.append(species, level);
  appendTypeBadges(identity, pokemon, false);
  const icons = document.createElement("div"); icons.className = "detail-icons";
  for (const [active, symbol, label] of [[pokemon.shiny, "★", "Shiny Pokémon"], [pokemon.isEgg, "🥚", "Egg"]]) {
    if (!active) continue;
    const icon = document.createElement("span"); icon.textContent = symbol; icon.setAttribute("role", "img"); icon.setAttribute("aria-label", label); icon.title = label; icons.append(icon);
  }
  header.append(image, identity, icons);
  pokemonDetailContent.append(header);
  if (pokemon.recordKind === "storage") {
    const note = document.createElement("p"); note.className = "detail-record-note";
    note.textContent = "PC records do not store current HP, battle stats, or status. Level is estimated from experience when species metadata is available.";
    pokemonDetailContent.append(note);
  }

  const addSection = (headingText, rows, className = "") => {
    const section = document.createElement("section");
    section.className = `pokemon-detail-section ${className}`.trim();
    const heading = document.createElement("h3");
    heading.textContent = headingText;
    section.append(heading);
    const list = document.createElement("dl");
    list.className = "pokemon-detail-list";
    for (const [label, value] of rows) {
      const term = document.createElement("dt");
      term.textContent = label;
      const description = document.createElement("dd");
      if (value instanceof Node) description.append(value);
      else description.textContent = value === undefined || value === null || value === "" ? "—" : String(value);
      list.append(term, description);
    }
    section.append(list);
    pokemonDetailContent.append(section);
    return section;
  };

  addSection("Summary", [
    ["Level", pokemon.level],
    ["Trainer", `${pokemon.otName || "Unknown"} · ID ${pokemon.otId ?? "—"}`],
    ["HP", `${pokemon.currentHp ?? "—"} / ${pokemon.maxHp ?? "—"}`],
    ["Status", pokemon.statusText],
    ["Nature", pokemon.natureName],
    ["Nature modifiers", natureModifiers(pokemon.natureId)],
    ["Ability", pokemon.abilityName],
    ["Held item", pokemon.heldItemName || "None"],
    ["Experience", pokemon.experienceText],
    ["Shiny", pokemon.shiny ? "Yes" : "No"],
    ["Egg", pokemon.isEgg ? "Yes" : "No"],
  ]);

  addSection("Stats", [
    ["HP", `${pokemon.currentHp ?? "—"} / ${pokemon.maxHp ?? "—"}`],
    ["Attack", pokemon.stats?.attack],
    ["Defense", pokemon.stats?.defense],
    ["Speed", pokemon.stats?.speed],
    ["Special Attack", pokemon.stats?.specialAttack],
    ["Special Defense", pokemon.stats?.specialDefense],
  ]);

  const addTable = (title, columns, rows, className) => {
    const section = document.createElement("section"); section.className = `pokemon-detail-section ${className}`;
    const heading = document.createElement("h3"); heading.textContent = title;
    const table = document.createElement("table"); table.className = "detail-table"; table.setAttribute("aria-label", title);
    const head = document.createElement("thead"), headRow = document.createElement("tr");
    for (const column of columns) { const cell = document.createElement("th"); cell.scope = "col"; cell.textContent = column; headRow.append(cell); }
    head.append(headRow); const body = document.createElement("tbody");
    for (const row of rows) {
      const line = document.createElement("tr");
      row.forEach((value, index) => { const cell = document.createElement(index === 0 ? "th" : "td"); if (index === 0) cell.scope = "row"; cell.textContent = value ?? "—"; line.append(cell); });
      body.append(line);
    }
    table.append(head, body); section.append(heading, table); pokemonDetailContent.append(section); return section;
  };
  const moves = Array.from({length: 4}, (_, index) => {
    const move = pokemon.moves?.[index];
    return [move?.id ? move.name || `Move #${move.id}` : "Empty move slot",
      move?.id ? `${Number.isFinite(move.pp) ? move.pp : "—"}/${Number.isFinite(move.maxPP) ? move.maxPP : "?"}` : "—", move?.id ? move.ppUps ?? 0 : "—"];
  });
  addTable("Moves", ["Name", "PP", "PP Ups"], moves, "moves-section");
  const stats = [["HP", "hp"], ["Attack", "attack"], ["Defense", "defense"], ["Special Attack", "specialAttack"], ["Special Defense", "specialDefense"], ["Speed", "speed"]];
  const trainingRows = stats.map(([label, key]) => [label, pokemon.ivs?.[key], pokemon.evs?.[key]]);
  const total = values => values.every(Number.isFinite) ? values.reduce((sum, value) => sum + value, 0) : "—";
  trainingRows.push(["Total", total(trainingRows.map(row => row[1])), total(trainingRows.map(row => row[2]))]);
  const training = addTable("Training", ["Stat", "IV", "EV"], trainingRows, "training-section");
  if (pokemon.hiddenPower) { const power = document.createElement("p"); power.className = "hidden-power"; power.textContent = `Hidden Power: ${pokemon.hiddenPower.type} · Power ${pokemon.hiddenPower.power}`; training.append(power); }

  const history = [
    ["Friendship", Number.isFinite(pokemon.friendship) ? `${pokemon.friendship} / 255` : "—"],
    ["Personality (PID)", pokemon.personality],
    ["Original Trainer", pokemon.otName || "Unknown"],
    ["Trainer ID / Secret ID", `${pokemon.otId ?? "—"} / ${pokemon.secretId ?? "—"}`],
    ["Met location", pokemon.metLocationText],
    ["Met level", pokemon.metLevel],
    ["Met date", pokemon.metDateText],
    ["Poké Ball", pokemon.pokeballName],
    ["Nickname changed", pokemon.isNicknamed ? "Yes" : "No"],
  ];
  if (pokemon.formName && !["-", "—", "Unknown"].includes(pokemon.formName)) history.push(["Form", pokemon.formName]);
  if (pokemon.eggDate) history.push(["Egg received", pokemon.eggDateText]);
  if (pokemon.eggLocationId > 0 && GEN4_LOCATION_NAMES[pokemon.eggLocationId]) history.push(["Egg location", pokemon.eggLocationText]);
  addSection("History & identity", history);
  addEvolutionControl(pokemonDetailContent, pokemon);
}

function natureModifiers(natureId) {
  const rows = document.createElement("div"); rows.className = "nature-modifiers";
  if (!Number.isInteger(natureId) || natureId < 0 || natureId > 24) { rows.textContent = "Unknown"; return rows; }
  const stats = ["Attack", "Defense", "Speed", "Special Attack", "Special Defense"];
  const raised = Math.floor(natureId / 5), lowered = natureId % 5;
  if (raised === lowered) { rows.textContent = "Neutral · no stat changes"; return rows; }
  for (const [className, arrow, stat, amount] of [["nature-up", "↑", stats[raised], "+10%"], ["nature-down", "↓", stats[lowered], "−10%"]]) {
    const row = document.createElement("span"); row.className = className;
    row.textContent = `${arrow} ${amount} ${stat}`; rows.append(row);
  }
  return rows;
}

pokemonDetailDialog.addEventListener("keydown", event => {
  if (event.key !== "Tab") return;
  const controls = [...pokemonDetailDialog.querySelectorAll('button:not(:disabled), select:not(:disabled), a[href], input:not(:disabled), [tabindex="0"]')].filter(node => node.getClientRects().length);
  const first = controls[0], last = controls.at(-1);
  if (!first) { event.preventDefault(); return; }
  if (event.shiftKey && (document.activeElement === first || !pokemonDetailDialog.contains(document.activeElement))) {
    event.preventDefault(); last.focus();
  } else if (!event.shiftKey && (document.activeElement === last || !pokemonDetailDialog.contains(document.activeElement))) {
    event.preventDefault(); first.focus();
  }
});

pokemonDetailDialog.addEventListener("close", () => { detailRevision++; });

pokemonDetailClose.addEventListener("click", () => {
  if (typeof pokemonDetailDialog.close === "function") pokemonDetailDialog.close();
  else pokemonDetailDialog.removeAttribute("open");
});

pokemonDetailDialog.addEventListener("click", (event) => {
  if (event.target === pokemonDetailDialog) {
    if (typeof pokemonDetailDialog.close === "function") pokemonDetailDialog.close();
    else pokemonDetailDialog.removeAttribute("open");
  }
});

function pokemonSprite(pokemon) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iv/heartgold-soulsilver/${pokemon.shiny ? "shiny/" : ""}${pokemon.speciesId}.png`;
}

function appendTypeBadges(container, pokemon, showMarkers = true) {
  const types = document.createElement("div"); types.className = "type-badges";
  for (const type of pokemon.types || []) {
    const badge = document.createElement("span"); badge.className = `type-badge type-${type}`;
    badge.textContent = formatPokemonName(type); types.append(badge);
  }
  if (showMarkers && pokemon.shiny) {
    const shiny = document.createElement("span"); shiny.className = "shiny-label"; shiny.textContent = "★ Shiny"; types.append(shiny);
  }
  if (showMarkers && pokemon.isEgg) {
    const egg = document.createElement("span"); egg.textContent = "Egg"; types.append(egg);
  }
  container.append(types);
}

function renderParty(party) {
  partyGrid.replaceChildren();
  for (let slot = 1; slot <= 6; slot++) {
    const pokemon = party.find(entry => entry.slot === slot && !entry.empty);
    const card = document.createElement("button"); card.type = "button";
    card.className = "party-item dashboard-party-card";
    if (!pokemon) {
      card.disabled = true; card.classList.add("empty-party-slot"); card.textContent = `Empty slot ${slot}`;
      card.setAttribute("aria-label", `Empty party slot ${slot}`); partyGrid.append(card); continue;
    }
    card.classList.add("pokemon-detail-button");
    const nickname = pokemon.nickname || getDisplaySpeciesName(pokemon);
    card.setAttribute("aria-label", `${nickname}, party slot ${slot}. Open Pokémon details`);
    const image = document.createElement("img"); image.src = pokemonSprite(pokemon); image.alt = ""; image.width = 96; image.height = 96;
    const title = document.createElement("span"); title.className = "party-nickname"; title.textContent = nickname; title.title = nickname;
    card.append(image, title); appendTypeBadges(card, pokemon, false);
    if (Number.isFinite(pokemon.currentHp) && pokemon.maxHp > 0) {
      const ratio = pokemon.currentHp / pokemon.maxHp;
      const bar = document.createElement("progress"); bar.max = pokemon.maxHp; bar.value = pokemon.currentHp;
      bar.setAttribute("aria-label", `${nickname} HP`); bar.setAttribute("aria-valuetext", `${Math.round(ratio * 100)}% HP`);
      bar.className = `hp-bar ${ratio > .5 ? "hp-green" : ratio > .35 ? "hp-yellow" : ratio > .2 ? "hp-orange" : ratio > .1 ? "hp-red" : "hp-critical"}`; card.append(bar);
    }
    card.addEventListener("click", () => openPokemonDetails(pokemon)); partyGrid.append(card);
  }
  partyInfo.hidden = false;
}

function estimateLevelFromExperience(experience, growthRate) {
  if (!Number.isFinite(experience) || !growthRate) return null;
  let level = 1;
  for (let candidate = 2; candidate <= 100; candidate++) {
    if (experience < experienceForLevel(candidate, growthRate)) break;
    level = candidate;
  }
  return level;
}

function experienceForLevel(level, growthRate) {
  const n = level;
  switch (growthRate) {
    case "fast": return Math.floor(4 * n ** 3 / 5);
    case "medium-fast": return n ** 3;
    case "medium-slow": return Math.floor(6 * n ** 3 / 5 - 15 * n ** 2 + 100 * n - 140);
    case "slow": return Math.floor(5 * n ** 3 / 4);
    case "erratic":
      if (n <= 50) return Math.floor(n ** 3 * (100 - n) / 50);
      if (n <= 68) return Math.floor(n ** 3 * (150 - n) / 100);
      if (n <= 98) return Math.floor(n ** 3 * Math.floor((1911 - 10 * n) / 3) / 500);
      return Math.floor(n ** 3 * (160 - n) / 100);
    case "fluctuating":
      if (n <= 15) return Math.floor(n ** 3 * (Math.floor((n + 1) / 3) + 24) / 50);
      if (n <= 36) return Math.floor(n ** 3 * (n + 14) / 50);
      return Math.floor(n ** 3 * (Math.floor(n / 2) + 32) / 50);
    default: return null;
  }
}

function addEvolutionControl(container, pokemon) {
  const options = getAvailableEvolutions(pokemon);
  if (!options.length) return;
  if (!currentSaveBytes) {
    const note = document.createElement('p');
    note.className = 'collection-note';
    note.textContent = 'Reload the original save file to export an evolution. Restored adventures contain decoded progress only.';
    container.append(note);
    return;
  }

  const wrapper = document.createElement("div");
  wrapper.className = "evolution-control";
  const select = document.createElement("select");
  select.setAttribute("aria-label", "Evolution target");
  for (const option of options) {
    const item = document.createElement("option");
    item.value = String(option.to);
    item.textContent = `Evolve to ${getKnownSpeciesName(option.to)}${option.consumesItem ? ` (consume ${option.itemName})` : ""}`;
    select.append(item);
  }

  const button = document.createElement("button");
  button.type = "button";
  button.className = "evolve-button";
  button.textContent = "Evolve";
  button.addEventListener("click", async () => {
    const evolution = options.find((option) => option.to === Number(select.value));
    if (!evolution || !currentSaveBytes || currentActivePartition === null) return;
    const targetName = getKnownSpeciesName(evolution.to);
    const itemNote = evolution.consumesItem ? `\n\nThis will consume the held ${evolution.itemName}.` : "";
    const locationNote = evolution.method === "location-level-up"
      ? "\n\nThis simulates the unavailable location's level-up trigger. The Pokémon's level and experience will not change."
      : "";
    if (!window.confirm(`Evolve ${pokemon.nickname || getDisplaySpeciesName(pokemon)} into ${targetName}?${itemNote}${locationNote}\n\nA separate modified save will be downloaded. Your original file is not overwritten.`)) return;

    const revision = loadRevision;
    button.disabled = true;
    button.textContent = "Evolving…";
    try {
      let evolvedStats = null;
      if (pokemon.recordKind === "party") {
        const data = await getPokemonData(evolution.to);
        evolvedStats = data?.pokemon?.stats || null;
        if (!evolvedStats) throw new Error("Could not load the evolved species' base stats. No changes were made.");
      }
      if (revision !== loadRevision) return;
      const output = evolveSoulSilverPokemon(
        currentSaveBytes,
        pokemon,
        evolution,
        currentActivePartition,
        evolvedStats
      );
      const extensionMatch = currentSaveFileName.match(/(\.[^./\\]+)$/);
      const extension = extensionMatch ? extensionMatch[1] : ".sav";
      const baseName = (extensionMatch
        ? currentSaveFileName.slice(0, -extension.length)
        : currentSaveFileName
      ).replace(/\.evolved$/i, "");
      const outputName = `${baseName}.evolved${extension}`;
      const blob = new Blob([output], { type: "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = outputName;
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      fileStatus.className = "status success";
      fileStatus.textContent = `Downloaded ${outputName}. Load that file explicitly to update your adventure. Your loaded progress is unchanged.`;
      feedback.textContent = fileStatus.textContent;
      adventureStatus.textContent = fileStatus.textContent;
      button.disabled = false;
      button.textContent = 'Evolve';
    } catch (error) {
      if (revision !== loadRevision) return;
      fileStatus.className = "status error";
      fileStatus.textContent = error?.message || "Evolution failed; the save was not changed.";
      feedback.textContent = fileStatus.textContent;
      button.disabled = false;
      button.textContent = "Evolve";
    }
  });

  const feedback = document.createElement("p"); feedback.className = "status error"; feedback.setAttribute("aria-live", "polite");
  wrapper.append(select, button, feedback);
  container.append(wrapper);
}

const KNOWN_SPECIES_NAMES = Object.freeze({
  65: "Alakazam", 68: "Machamp", 76: "Golem", 94: "Gengar", 186: "Politoed",
  199: "Slowking", 208: "Steelix", 212: "Scizor", 230: "Kingdra", 233: "Porygon2",
  367: "Huntail", 368: "Gorebyss", 462: "Magnezone", 464: "Rhyperior",
  466: "Electivire", 467: "Magmortar", 470: "Leafeon", 471: "Glaceon",
  474: "Porygon-Z", 476: "Probopass", 477: "Dusknoir",
});

function getKnownSpeciesName(speciesId) {
  return KNOWN_SPECIES_NAMES[speciesId] || `Pokémon #${speciesId}`;
}

function resetFileInfo() {
  document.querySelector('#adventure-match-dialog')?.close('cancel');
  document.querySelector(".app").dataset.saveLoaded = "false";
  currentSaveFileName = "pokemon-save.sav";
  activeBoxNumber = 1;
  dexVisibleLimit = 40;
  collectionVisibleLimit = 40;
  document.querySelectorAll(".app details").forEach(details => { details.open = false; });
  document.querySelector("#upload-area").hidden = false;
  document.querySelector("#dex-search").value = "";
  document.querySelector("#dex-filter").value = "all";
  collectionListMode.value = "caught";
  collectionSort.value = "priority";
  fileInput.value = "";
  document.querySelector("#upload-heading").textContent = "Your adventure starts here";
  document.querySelector("#upload-help").hidden = false;
  document.querySelector(".app").setAttribute("aria-busy", "false");
  loadRevision++;
  detailRevision++;
  collectionRevision++;
  dexRevision++;
  currentPokedex = null;
  document.querySelector("#dex-list").replaceChildren();
  document.querySelector("#dex-count").textContent = "";
  document.querySelector("#dex-more").hidden = true;
  pokemonDetailDialog.close();
  pokemonDetailContent.replaceChildren();
  document.querySelector("#overview-summary").hidden = true;
  document.querySelector("#overview-stats").replaceChildren();
  fileStatus.className = "status";
  fileStatus.textContent = "No save file loaded.";
  filePickerText.textContent = "Choose a save file or drop one here";
  trainerNameValue.textContent = "—";
  trainerIdValue.textContent = "—";
  secretIdValue.textContent = "—";
  genderValue.textContent = "—";
  moneyValue.textContent = "—";
  playTimeValue.textContent = "—";
  badgesValue.textContent = "—";
  badgeGrid.replaceChildren();
  pokedexModeValue.textContent = "—";
  pokedexSeenValue.textContent = "—";
  pokedexCaughtValue.textContent = "—";
  pokedexInfo.hidden = true;
  collectionTotalValue.textContent = "—";
  collectionPartyValue.textContent = "—";
  collectionPcValue.textContent = "—";
  collectionSpeciesValue.textContent = "—";
  collectionShinyValue.textContent = "—";
  collectionEggsValue.textContent = "—";
  collectionBoxCounts.replaceChildren();
  collectionInfo.hidden = true;
  document.querySelector("#collection-gender-total").textContent = "—";
  document.querySelector("#collection-gender-male").textContent = "—";
  document.querySelector("#collection-gender-female").textContent = "—";
  document.querySelector("#collection-genderless").textContent = "—";
  document.querySelector("#collection-gender-unknown").textContent = "—";
  document.querySelector("#collection-gender-info").hidden = true;
  document.querySelector("#unown-form-total").textContent = "—";
  document.querySelector("#unown-form-list").replaceChildren();
  document.querySelector("#unown-form-info").hidden = true;
  collectionDetailsInfo.hidden = true;
  collectionDetailsCount.textContent = "—";
  collectionSpeciesList.replaceChildren();
  collectionShowMore.hidden = true;
  currentCollectionDetails = null;
  collectionSearch.value = "";
  trainerInfo.hidden = true;
  collectionNav.hidden = true;
  partyInfo.hidden = true;
  partyGrid.replaceChildren();
  storageInfo.hidden = true;
  boxTabs.replaceChildren();
  boxGrid.replaceChildren();
  currentStorage = null;
  document.querySelector("#storage-search").value = "";
  document.querySelector("#storage-results").replaceChildren();
  document.querySelector("#storage-results").hidden = true;
  document.querySelector("#box-select").replaceChildren();
  document.querySelector("#box-occupancy").textContent = "";
  currentSaveBytes = null;
  currentActivePartition = null;
}

function formatNumber(value) {
  return value.toLocaleString("en-US");
}

function formatPercent(value) {
  return value.toFixed(1) + "%";
}

function formatPlayTime(playTime) {
  const hours = playTime.hours;
  const minutes = String(playTime.minutes).padStart(2, "0");
  const seconds = String(playTime.seconds).padStart(2, "0");

  return `${hours}h ${minutes}m ${seconds}s`;
}
