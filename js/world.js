import { SOULSILVER_SAFARI_ENCOUNTERS as SAFARI_ZONE_ENCOUNTERS } from './data/games/soulsilver/safari-encounters.js';
import { mountCaughtIndicators } from './caught-indicators.js';
import { speciesIdForName } from './data/game-reference.js';
import { encounterSections } from "./atlas-encounter-sections.js";
import { mountEvTraining } from "./atlas-ev-training.js";
import { locationEncounterReference } from "./data/atlas-route-reference.js";
import { locationDetails, locationDetailSearchText } from "./data/atlas-location-reference.js";
const ATLAS_GAME_ID = "soulsilver";
import { ATLAS_LOCATIONS as LOCATIONS } from "./data/atlas-locations.js";
import { mapsForLocation } from "./data/atlas-maps.js";

// Explicit orientation for existing overland links. Unresolved links and interiors
// remain available under Other connections; never infer direction from list order.
const COMPASS_PAIRS = [
  ["New Bark Town", "Route 29", "west"],
  ["New Bark Town", "Route 27", "east"],
  ["Route 27", "Route 26", "east"],
  ["Route 26", "Pokémon League Reception Gate", "north"],
  ["Pokémon League Reception Gate", "Victory Road", "north"],
  ["Victory Road", "Indigo Plateau", "north"],
  ["Pokémon League Reception Gate", "Route 28", "west"],
  ["Route 28", "Mt. Silver", "west"],
  ["Route 34", "Ilex Forest", "south"],
  ["Route 35", "Route 36", "north"],
  ["Route 40", "Frontier Access", "north"],
  ["Frontier Access", "Battle Frontier", "north"],
  ["Cianwood City", "Cliff Edge Gate", "west"],
  ["Cliff Edge Gate", "Route 47", "west"],
  ["Route 29", "Cherrygrove City", "west"],
  ["Route 29", "Route 46", "north"],
  ["Cherrygrove City", "Route 30", "north"],
  ["Route 30", "Route 31", "north"],
  ["Route 31", "Violet City", "west"],
  ["Violet City", "Route 32", "south"],
  ["Violet City", "Route 36", "west"],
  ["Route 32", "Union Cave", "south"],
  ["Union Cave", "Route 33", "south"],
  ["Route 33", "Azalea Town", "west"],
  ["Azalea Town", "Ilex Forest", "west"],
  ["Route 34", "Goldenrod City", "north"],
  ["Goldenrod City", "Route 35", "north"],
  ["Route 35", "National Park", "north"],
  ["National Park", "Route 36", "east"],
  ["Route 36", "Route 37", "north"],
  ["Route 37", "Ecruteak City", "north"],
  ["Ecruteak City", "Route 38", "west"],
  ["Route 38", "Route 39", "west"],
  ["Route 39", "Olivine City", "south"],
  ["Olivine City", "Route 40", "west"],
  ["Route 40", "Route 41", "south"],
  ["Route 41", "Cianwood City", "west"],
  ["Ecruteak City", "Route 42", "east"],
  ["Route 42", "Mahogany Town", "east"],
  ["Mahogany Town", "Route 43", "north"],
  ["Route 43", "Lake of Rage", "north"],
  ["Mahogany Town", "Route 44", "east"],
  ["Route 44", "Ice Path", "east"],
  ["Ice Path", "Blackthorn City", "south"],
  ["Blackthorn City", "Route 45", "south"],
  ["Route 45", "Route 46", "south"],
  ["Route 47", "Route 48", "north"],
  ["Route 48", "Safari Zone Gate", "north"],
  ["Safari Zone Gate", "Safari Zone", "north"]
];
const OPPOSITE = { north: "south", south: "north", east: "west", west: "east" };
function connectionDirection(source, target) {
  for (const [from, to, direction] of COMPASS_PAIRS) {
    if (source === from && target === to) return direction;
    if (source === to && target === from) return OPPOSITE[direction];
  }
  return "other";
}



function renderEncounters(locationName) {
  const reference = locationEncounterReference(ATLAS_GAME_ID, locationName);
  const encounters = reference ? reference.encounters : locationName === "Safari Zone" ? SAFARI_ZONE_ENCOUNTERS : null;
  const section = document.createElement("section");
  section.className = "location-encounters";
  section.setAttribute("aria-label", `${locationName} encounters`);
  const heading = document.createElement("h3");
  heading.textContent = "Pokémon encounters";
  if (!encounters || encounters.length === 0) {
    const message = document.createElement("p");
    message.className = "encounter-note";
    message.textContent = reference?.status === "no-fixed-wild" ? "No fixed wild encounters at this location. Gifts, trades and Trainer battles are separate from wild encounters." : "Encounter data has not been added for this location yet.";
    section.append(heading, message);
    for (const text of reference?.notes || []) {
      const detail = document.createElement("p");
      detail.className = "encounter-note";
      detail.textContent = text;
      section.append(detail);
    }
    return section;
  }
  section.append(heading);
  const sourceNotes = reference?.notes || ["Safari encounters still require their dedicated data/mechanics audit."];
  const legendaryNotes = sourceNotes.filter(text => /Roaming Pokémon:|legendary beasts|Ho-Oh encounter|Lugia is level/.test(text));
  const otherNotes = sourceNotes.filter(text => !legendaryNotes.includes(text));
  const buckets = encounterSections(encounters);
  if (legendaryNotes.length && !buckets.some(bucket => bucket.id === "legendary")) {
    buckets.push({id:"legendary",title:"Legendary encounters",entries:[]});
  }
  for (const bucket of buckets) {
    const disclosure = document.createElement("details");
    disclosure.className = "encounter-section";
    disclosure.dataset.encounterSection = bucket.id;
    const summary = document.createElement("summary");
    summary.textContent = bucket.entries.length ? `${bucket.title} (${bucket.entries.length})` : bucket.title;
    disclosure.append(summary);
    if (bucket.id === "legendary") {
      for (const text of legendaryNotes) {
        const note = document.createElement("p");
        note.className = "encounter-note";
        note.textContent = text;
        disclosure.append(note);
      }
    }
    const methods = [...new Set(bucket.entries.map(({encounter}) => encounter.method))];
    for (const method of methods) {
      const group = document.createElement("div");
      group.className = "encounter-method";
      const methodHeading = document.createElement("h4");
      methodHeading.textContent = method;
      const entries = document.createElement("div");
      entries.className = "encounter-entries";
      for (const {encounter, index} of bucket.entries.filter(({encounter}) => encounter.method === method)) {
        const row = document.createElement("div");
        row.className = "encounter-entry";
        row.dataset.encounterIndex = String(index);
        row.dataset.encounterTimes = encounter.times;
        const name = document.createElement("a");
        name.href = `../pokedex/#species=${encounter.speciesId ?? speciesIdForName(ATLAS_GAME_ID,encounter.pokemon)}&scope=national`;
        name.className = "encounter-name";
        name.textContent = encounter.pokemon;
        caughtIndicators.decorate(name,encounter.speciesId ?? speciesIdForName(ATLAS_GAME_ID,encounter.pokemon));
        const info = document.createElement("span");
        info.className = "encounter-info";
        info.textContent = [`Lv. ${encounter.levels}`, ...(["morning", "day", "night"].includes(bucket.id) ? [] : [encounter.times]), encounter.rate || encounter.rarity].filter(Boolean).join(" · ");
        row.append(name, info);
        entries.append(row);
      }
      group.append(methodHeading, entries);
      disclosure.append(group);
    }
    section.append(disclosure);
  }
  if (otherNotes.length) {
    const notes = document.createElement("details");
    notes.className = "encounter-section encounter-notes";
    const summary = document.createElement("summary");
    summary.textContent = "Location encounter notes";
    notes.append(summary);
    for (const text of otherNotes) {
      const note = document.createElement("p");
      note.className = "encounter-note";
      note.textContent = text;
      notes.append(note);
    }
    section.append(notes);
  }
  return section;
}

const searchInput = document.querySelector("#location-search");
const typeSelect = document.querySelector("#location-type");
const countLabel = document.querySelector("#location-count");
const list = document.querySelector("#location-list");
const emptyMessage = document.querySelector("#empty-message");

const TYPE_LABELS = Object.freeze({
  town: "Town / city",
  route: "Route",
  landmark: "Landmark",
  facility: "Facility"
});

function renderLocations({ exactName = null } = {}) {
  const query = searchInput.value.trim().toLowerCase();
  const selectedType = typeSelect.value;
  const matches = LOCATIONS.filter((location) => {
    if (exactName !== null) return location.name === exactName;
    const matchesType = selectedType === "all" || location.type === selectedType;
    const routeText = locationDetailSearchText(ATLAS_GAME_ID, location.name);
    const searchable = `${routeText} ${location.name} ${(location.aliases || []).join(" ")} ${location.region} ${location.details} ${location.landmarks.join(" ")} ${location.access.join(" ")} ${TYPE_LABELS[location.type]}`.toLowerCase();
    return matchesType && searchable.includes(query);
  });

  countLabel.textContent = `${matches.length} of ${LOCATIONS.length} locations`;
  list.replaceChildren();

  for (const location of matches) {
    const card = document.createElement("article");
    card.className = "location-card";
    const overview = document.createElement("section");
    overview.className = "location-overview";

    const text = document.createElement("div");
    const heading = document.createElement("h2");
    heading.textContent = location.name;
    heading.tabIndex = -1;
    heading.id = `location-${LOCATIONS.indexOf(location)}`;
    card.setAttribute("aria-labelledby", heading.id);
    overview.setAttribute("aria-labelledby", heading.id);
    text.append(heading);

    const badge = document.createElement("span");
    badge.className = "location-type";
    badge.textContent = TYPE_LABELS[location.type];

    overview.append(text, badge);

    const staticSection = document.createElement("section");
    staticSection.className = "location-static";
    staticSection.setAttribute("aria-label", `${location.name} location information`);
    for (const [title, items] of [["Landmarks & features", location.landmarks]]) {
      const group = document.createElement("div");
      const titleElement = document.createElement("h3");
      titleElement.textContent = title;
      const itemsList = document.createElement("ul");
      for (const item of items) {
        const entry = document.createElement("li");
        entry.textContent = item;
        itemsList.append(entry);
      }
      group.append(titleElement, itemsList);
      staticSection.append(group);
    }
    const reference = locationDetails(ATLAS_GAME_ID, location.name);
    if (reference) {
      const isRoute = location.type === "route";
      const describe = (entry) => {
        const area = (entry.section || "").split(" · ").filter(part => !["Items", "Items & Apricorns", "Floors", "Rewards & services"].includes(part)).join(" · ");
        return [entry.location, area, ...(entry.conditions || []).filter(condition => !(entry.location || "").toLowerCase().includes(condition.toLowerCase()))].filter(Boolean).join(" · ");
      };
      const groups = [
        ["Items & Apricorns", "items", reference.items.filter(item => item.kind !== "machine")],
        ["TMs & HMs", "machines", reference.items.filter(item => item.kind === "machine")],
        ["Gifts & trades", "gifts", reference.gifts],
        ["Shops & exchanges", "offers", reference.offers],
        ["NPCs & trainers", "people", [...reference.services.map(item => ({...item, recordType: "service"})), ...reference.trainers.map(item => ({...item, recordType: "trainer"}))]]
      ];
      for (const [title, key, records] of groups) {
        const group = document.createElement("details");
        group.className = "location-reference";
        group.dataset.reference = key;
        if (isRoute && ["items", "people"].includes(key)) group.classList.add("route-features");
        const summary = document.createElement("summary");
        summary.textContent = `${title} (${records.length})`;
        group.append(summary);
        if (!records.length) {
          const note = document.createElement("p");
          note.className = "reference-empty";
          note.textContent = reference.emptyNotes[key === "machines" ? "items" : key] || "No records in this category in the reviewed SoulSilver references.";
          group.append(note);
        } else {
          const entries = document.createElement("ul");
          entries.className = "reference-entries";
          for (const record of records) {
            const item = document.createElement("li");
            item.dataset.referenceId = record.id;
            const name = document.createElement("strong");
            name.textContent = record.name;
            const detail = document.createElement("p");
            if (key === "gifts") {
              const level = /^\d+$/.test(record.level) ? `Lv. ${record.level}` : record.level;
              detail.textContent = [record.kind === "egg" ? "Egg" : record.kind === "trade" ? "NPC trade" : record.kind === "prize" ? "Prize Pokémon" : record.kind === "event" ? "Event gift" : "Gift Pokémon", level, describe(record), record.availability].filter(Boolean).join(" · ");
            } else if (key === "people") {
              detail.textContent = [record.role === "ally" ? "Ally" : "", record.area, record.detail, ...(record.conditions || [])].filter(Boolean).join(" · ");
            } else {
              detail.textContent = [record.cost, describe(record)].filter(Boolean).join(" · ");
            }
            item.append(name, detail);
            if (record.party?.length) {
              const party = document.createElement("p");
              party.className = "reference-party";
              party.textContent = `Team: ${record.party.join("; ")}`;
              item.append(party);
            }
            entries.append(item);
          }
          group.append(entries);
        }
        staticSection.append(group);
      }
    }
    const sources = document.createElement("details");
    sources.className = "location-sources";
    const sourcesHeading = document.createElement("summary");
    sourcesHeading.textContent = "Sources";
    const sourceList = document.createElement("ul");
    for (const source of [...location.sources, ...(reference?.sources || []).map(url => ({url, label: url.includes("github.com") ? "Game event reference" : `Reference · ${decodeURIComponent(url.split("/wiki/")[1] || "Location").replaceAll("_", " ")}`}))]) {
      const entry = document.createElement("li");
      const link = document.createElement("a");
      link.href = source.url;
      link.textContent = source.label;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      entry.append(link);
      sourceList.append(entry);
    }
    if (locationEncounterReference(ATLAS_GAME_ID, location.name)) {
      for (const [label, file] of [
        ["SoulSilver encounter slots", "files/fielddata/encountdata/gs_enc_data.json"],
        ["HGSS encounter selection rules", "src/field/encounter_check.c"],
        ["SoulSilver Headbutt groups", "files/arc/headbutt.json"],
        ["HGSS map encounter banks", "src/data/map_headers.h"],
        ["HGSS roaming rules", "src/field_roamer.c"]
      ]) {
        const entry = document.createElement("li");
        const link = document.createElement("a");
        link.href = `https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/${file}`;
        link.textContent = label;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        entry.append(link);
        sourceList.append(entry);
      }
    }
    const maps = mapsForLocation(ATLAS_GAME_ID, location.name);
    const map = maps[0];
    let mapSourceLink;
    if (map) {
      const entry = document.createElement("li");
      const link = document.createElement("a");
      mapSourceLink = link;
      link.href = map.source;
      link.textContent = "HGSS map image · Bulbagarden Archives";
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      entry.append(link);
      sourceList.append(entry);
    }
    sources.append(sourcesHeading, sourceList);
    staticSection.append(sources);

    const connectedNames = location.connections.filter((name) =>
      LOCATIONS.some((candidate) => candidate.name === name)
    );
    if (connectedNames.length) {
      const connections = document.createElement("div");
      connections.className = "location-connections";
      const label = document.createElement("strong");
      label.textContent = "Connected locations";
      const links = document.createElement("div");
      links.className = "connection-links";
      const groups = {};
      for (const direction of ["north", "west", "east", "south", "other"]) {
        const group = document.createElement("div");
        group.className = `compass-${direction}`;
        if (direction === "other") {
          const caption = document.createElement("span");
          caption.className = "direction-label";
          caption.textContent = "Other connections";
          group.append(caption);
        } else {
          group.classList.add("compass-direction");
        }
        groups[direction] = group;
      }
      const current = document.createElement("figure");
      current.className = "compass-current";
      current.setAttribute("aria-labelledby", heading.id);
      let mapControls;
      if (maps.length) {
        links.classList.add("has-map");
        const mapLink = document.createElement("a");
        mapLink.className = "location-map-link";
        mapLink.target = "_blank";
        mapLink.rel = "noopener noreferrer";
        const fallback = document.createElement("p");
        fallback.className = "map-hint";
        fallback.textContent = "Map unavailable. Choose another map or use the connections to continue.";
        fallback.hidden = true;
        const announcement = document.createElement("span");
        announcement.className = "map-announcement";
        announcement.setAttribute("role", "status");
        let activeImage;
        let selection;
        let previous;
        let next;
        function showMap(index, userSelected = false) {
          const selected = maps[index];
          const description = `${location.name} · ${selected.label}`;
          const image = document.createElement("img");
          activeImage = image;
          image.className = "location-map";
          image.alt = selected.label.includes("reference view")
            ? `${description} in HeartGold and SoulSilver`
            : `${description} map in HeartGold and SoulSilver; north is up`;
          image.width = selected.width;
          image.height = selected.height;
          image.decoding = "async";
          image.loading = userSelected || matches.length === 1 ? "eager" : "lazy";
          mapLink.href = `../assets/maps/${selected.file}`;
          mapLink.setAttribute("aria-label", `Open full-size ${description} map in a new tab`);
          const hint = document.createElement("span");
          hint.className = "map-hint";
          hint.textContent = "Open full-size map";
          mapLink.replaceChildren(image, hint);
          mapLink.hidden = false;
          fallback.hidden = true;
          if (mapSourceLink) mapSourceLink.href = selected.source;
          if (selection) {
            selection.value = String(index);
            previous.disabled = index === 0;
            next.disabled = index === maps.length - 1;
          }
          image.addEventListener("error", () => {
            if (activeImage !== image) return;
            mapLink.hidden = true;
            fallback.hidden = false;
            announcement.textContent = `${description}: map unavailable.`;
          }, { once: true });
          image.src = mapLink.href;
          if (userSelected) announcement.textContent = `Showing ${description}.`;
        }
        if (maps.length > 1) {
          const controls = document.createElement("div");
          controls.className = "map-controls";
          const label = document.createElement("label");
          label.textContent = "Map / area";
          selection = document.createElement("select");
          selection.className = "map-select";
          selection.setAttribute("aria-label", `${location.name} map or floor`);
          for (const [index, map] of maps.entries()) {
            const option = document.createElement("option");
            option.value = String(index);
            option.textContent = map.label;
            selection.append(option);
          }
          label.append(selection);
          previous = document.createElement("button");
          next = document.createElement("button");
          for (const [button, text, offset] of [[previous, "Previous map", -1], [next, "Next map", 1]]) {
            button.type = "button";
            button.textContent = text;
            button.addEventListener("click", () => showMap(Number(selection.value) + offset, true));
          }
          selection.addEventListener("change", () => showMap(Number(selection.value), true));
          controls.append(label, previous, next);
          mapControls = controls;
        }
        current.append(mapLink, fallback, announcement);
        showMap(0);
      }
      links.append(current);
      for (const name of connectedNames) {
        const link = document.createElement("button");
        link.type = "button";
        link.className = "connection-link";
        link.textContent = name;
        const direction = connectionDirection(location.name, name);
        link.setAttribute("aria-label", `${direction === "other" ? "Go to" : direction}: ${name}`);
        link.addEventListener("click", () => {
          openAtlasLocation(name);
        });
        groups[direction].append(link);
      }
      for (const group of Object.values(groups)) {
        if (!group.classList.contains("compass-other") || group.querySelector("button")) links.append(group);
      }
      connections.append(label);
      if (mapControls) connections.append(mapControls);
      connections.append(links);
      overview.append(connections);
    }

    overview.append(staticSection);
    card.append(overview, renderEncounters(location.name));
    list.append(card);
  }

  emptyMessage.hidden = matches.length !== 0;
}

const atlasPanel = document.querySelector("#atlas-browser");
const evPanel = document.querySelector("#ev-training");
const homePanel = document.querySelector("#atlas-home");
const johtoPanel = document.querySelector("#johto-home");
const toolNav = document.querySelector("#johto-tool-nav");
function setAtlasView(panel) {
  for (const view of [homePanel, johtoPanel, atlasPanel, evPanel]) view.hidden = view !== panel;
  toolNav.hidden = panel === homePanel;
}
const caughtIndicators = mountCaughtIndicators({gameId:ATLAS_GAME_ID,root:document.querySelector('.world-app'),status:document.querySelector('#atlas-save-status')});
const evFinder = mountEvTraining({panel: evPanel, onOpenLocation: openAtlasLocation,decorateSpecies:(node,name)=>caughtIndicators.decorate(node,speciesIdForName(ATLAS_GAME_ID,name))});

function openAtlasLocation(name, push = true, focus = true) {
  if (!LOCATIONS.some(location => location.name === name)) name = "New Bark Town";
  if (push) history.pushState(null, "", `#location=${encodeURIComponent(name)}`);
  setAtlasView(atlasPanel);
  searchInput.value = name;
  typeSelect.value = "all";
  renderLocations({exactName: name});
  if (focus) {
    const destination = list.querySelector("h2");
    destination.focus({preventScroll: true});
    destination.scrollIntoView({block: "start"});
  }
}

function showAtlasRoute(focus = true) {
  if (location.hash === "#ev-training") {
    setAtlasView(evPanel);
    evFinder.render();
    if (focus) document.querySelector("#ev-training-title").focus();
  } else if (location.hash.startsWith("#location=")) {
    let name;
    try { name = decodeURIComponent(location.hash.slice(10)); } catch { name = "New Bark Town"; }
    openAtlasLocation(name, false, focus);
  } else if (location.hash === "#atlas") {
    const name = LOCATIONS.some(location => location.name === searchInput.value) ? searchInput.value : "New Bark Town";
    openAtlasLocation(name, false, focus);
  } else {
    const johto = location.hash === "#johto";
    setAtlasView(johto ? johtoPanel : homePanel);
    if (focus) document.querySelector(johto ? "#johto-home-title" : "#atlas-home-title").focus();
  }
}
function searchLocations() {
  if (location.hash.startsWith("#location=")) history.replaceState(null, "", "#atlas");
  renderLocations();
}
searchInput.addEventListener("input", searchLocations);
typeSelect.addEventListener("change", searchLocations);
window.addEventListener("hashchange", () => showAtlasRoute());
window.addEventListener("popstate", () => showAtlasRoute());
showAtlasRoute(false);
