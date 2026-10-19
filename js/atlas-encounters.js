import { encounterSections } from './atlas-encounter-sections.js';
import { speciesIdForName } from './data/game-reference.js';

// Shared Atlas/mini-Atlas presentation; encounter records and conditions stay intact.
export function renderAtlasEncounters({gameId,locationName,encounters,status,notes=[],decorateSpecies}) {
  const section = document.createElement("section");
  section.className = "location-encounters";
  section.setAttribute("aria-label", `${locationName} encounters`);
  const heading = document.createElement("h3");
  heading.textContent = "Pokémon encounters";
  if (!encounters || encounters.length === 0) {
    const message = document.createElement("p");
    message.className = "encounter-note";
    message.textContent = status === "no-fixed-wild" ? "No fixed wild encounters at this location. Gifts, trades and Trainer battles are separate from wild encounters." : "Encounter data has not been added for this location yet.";
    section.append(heading, message);
    for (const text of notes) {
      const detail = document.createElement("p");
      detail.className = "encounter-note";
      detail.textContent = text;
      section.append(detail);
    }
    return section;
  }
  section.append(heading);
  const sourceNotes = notes;
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
        row.dataset.encounterIndex = String(encounter.sourceIndex ?? index);
        row.dataset.encounterTimes = encounter.times;
        const name = document.createElement("a");
        name.href = `../pokedex/#species=${encounter.speciesId ?? speciesIdForName(gameId,encounter.pokemon)}&scope=national`;
        name.className = "encounter-name";
        name.textContent = encounter.pokemon;
        decorateSpecies(name,encounter.speciesId ?? speciesIdForName(gameId,encounter.pokemon));
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
