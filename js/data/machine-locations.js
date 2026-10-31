import { atlasGameReference } from './atlas-game-reference.js';
import { locationDetails } from './atlas-location-reference.js';
import { routeFeatures } from './atlas-route-reference.js';

const indexes = new Map();

// Reuse the Atlas's reviewed records; never infer availability from compatibility.
export function machineObtainInfo(gameId, machine) {
  if (!atlasGameReference(gameId) || !/^(TM(?:0[1-9]|[1-8][0-9]|9[0-2])|HM0[1-8])$/.test(machine)) return null;
  if (!indexes.has(gameId)) {
    const index = new Map();
    for (const place of atlasGameReference(gameId).locations) {
      const seen = new Set();
      // Structured records first: they carry costs, conditions and source links.
      for (const details of [locationDetails(gameId, place.name), routeFeatures(gameId, place.name)]) {
        for (const category of ['items', 'offers']) for (const row of details?.[category] || []) {
          const id = row.name?.match(/^(TM\d{2}|HM\d{2})\b/)?.[1];
          if (!id) continue;
          const key = JSON.stringify([id, row.location, row.cost || '']);
          if (seen.has(key)) continue;
          seen.add(key);
          const entries = index.get(id) || [];
          entries.push({ location: place.name, instruction: row.location, section: row.section || '', cost: row.cost || '', conditions: [...(row.conditions || [])], source: row.source || '', href: `../pokedex-earth/#location=${encodeURIComponent(place.name)}${gameId === 'platinum' ? '&game=platinum' : ''}` });
          index.set(id, entries);
        }
      }
    }
    indexes.set(gameId, index);
  }
  return { locations: indexes.get(gameId).get(machine) || [] };
}
