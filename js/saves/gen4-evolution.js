import { platinumEvolutions } from './platinum-evolution-rules.js';
import { readUint16, readUint32, writeUint16, crc16Ccitt } from './gen4-binary.js';
import { cryptGen4, GEN4_BLOCK_UNSHUFFLES, pokemonChecksum, decryptGen4Record } from './gen4-pokemon.js';
import { recalculatePartyStats, validBaseStats } from './gen4-stats.js';

const TRADE_EVOLUTIONS = Object.freeze([
  { from: 64, to: 65, method: "trade" },
  { from: 67, to: 68, method: "trade" },
  { from: 75, to: 76, method: "trade" },
  { from: 93, to: 94, method: "trade" },
  { from: 95, to: 208, method: "trade-item", item: 233, itemName: "Metal Coat" },
  { from: 123, to: 212, method: "trade-item", item: 233, itemName: "Metal Coat" },
  { from: 117, to: 230, method: "trade-item", item: 235, itemName: "Dragon Scale" },
  { from: 79, to: 199, method: "trade-item", item: 221, itemName: "King's Rock" },
  { from: 61, to: 186, method: "trade-item", item: 221, itemName: "King's Rock" },
  { from: 137, to: 233, method: "trade-item", item: 252, itemName: "Up-Grade" },
  { from: 366, to: 367, method: "trade-item", item: 226, itemName: "DeepSeaTooth" },
  { from: 366, to: 368, method: "trade-item", item: 227, itemName: "DeepSeaScale" },
  { from: 112, to: 464, method: "trade-item", item: 321, itemName: "Protector" },
  { from: 125, to: 466, method: "trade-item", item: 322, itemName: "Electirizer" },
  { from: 126, to: 467, method: "trade-item", item: 323, itemName: "Magmarizer" },
  { from: 356, to: 477, method: "trade-item", item: 325, itemName: "Reaper Cloth" },
  { from: 233, to: 474, method: "trade-item", item: 324, itemName: "Dubious Disc" },
]);

const LOCATION_EVOLUTIONS = Object.freeze([
  { from: 82, to: 462, method: "location-level-up", location: "Mt. Coronet" },
  { from: 299, to: 476, method: "location-level-up", location: "Mt. Coronet" },
  { from: 133, to: 470, method: "location-level-up", location: "Moss Rock" },
  { from: 133, to: 471, method: "location-level-up", location: "Ice Rock" },
]);

export function getAvailableEvolutions(pokemon, gameId = 'soulsilver', context = {}) {
  if (gameId === 'platinum') return platinumEvolutions(pokemon, context);
  if (gameId !== 'soulsilver') return [];
  if (pokemon?.heldItemId === 229 && pokemon?.speciesId !== 64) return [];
  if (!pokemon || pokemon.empty || pokemon.isEgg || !pokemon.speciesId) return [];
  const options = TRADE_EVOLUTIONS.filter((rule) =>
    rule.from === pokemon.speciesId &&
    (rule.method === "trade" || pokemon.heldItemId === rule.item)
  ).map((rule) => ({ ...rule, consumesItem: rule.method === "trade-item" }));

  const locationOptions = LOCATION_EVOLUTIONS.filter((rule) =>
    rule.from === pokemon.speciesId && Number.isInteger(pokemon.level) && pokemon.level < 100
  ).map((rule) => ({ ...rule, consumesItem: false }));

  // The location trigger is emulated; the Pokémon's level and experience remain unchanged.
  return [...options, ...locationOptions];
}

export function evolveGen4Pokemon(buffer, pokemon, evolution, activePartition, evolvedBaseStats, profile, options = {}) {
  if (!(buffer instanceof Uint8Array) || buffer.length !== profile.fileSize) {
    throw new Error(`Only a validated 512 KB ${profile.shortName} save can be modified.`);
  }
  if (!pokemon || !Number.isInteger(pokemon.saveOffset) || !["party", "storage"].includes(pokemon.recordKind)) {
    throw new Error("This Pokémon does not have a supported save location.");
  }
  if (!Number.isInteger(activePartition) || ![0, 1].includes(activePartition)) {
    throw new Error("The active save partition is unknown.");
  }

  const rule = getAvailableEvolutions(pokemon, profile.id, options.context).find((entry) =>
    entry.to === evolution.to && entry.method === evolution.method
  );
  if (!rule) throw new Error("This Pokémon does not meet the selected evolution requirements.");
  if (rule.method === "location-level-up" && pokemon.level >= 100) {
    throw new Error("A level-100 Pokémon cannot trigger a level-up evolution.");
  }
  if (pokemon.recordKind === "party" && !validBaseStats(evolvedBaseStats)) {
    throw new Error("The evolved species' base stats could not be loaded. No changes were made.");
  }

  const output = new Uint8Array(buffer);
  const length = pokemon.recordKind === "party" ? 236 : 136;
  const offset = pokemon.saveOffset;
  if (offset < 0 || offset + length > output.length) throw new Error("Pokémon record is outside the save file.");

  const record = decryptGen4Record(output.slice(offset, offset + length), pokemon.recordKind === 'party');
  const pid = readUint32(record, 0), shuffle = GEN4_BLOCK_UNSHUFFLES[(pid >>> 13) & 31];

  const currentSpecies = readUint16(record, 8);
  const currentItem = readUint16(record, 10);
  if (currentSpecies !== pokemon.speciesId || currentItem !== pokemon.heldItemId) {
    throw new Error("The save record no longer matches the displayed Pokémon. Reload the save and try again.");
  }

  writeUint16(record, 8, rule.to);
  if (rule.consumesItem) writeUint16(record, 10, 0);
  options.transform?.(record);
  const oldMaxHp = pokemon.recordKind === "party" ? readUint16(record, 0x90) : 0;
  const oldHp = pokemon.recordKind === "party" ? readUint16(record, 0x8E) : 0;

  if (pokemon.recordKind === "party") {
    recalculatePartyStats(record, evolvedBaseStats, oldMaxHp, oldHp);
  }

  const checksum = pokemonChecksum(record);
  writeUint16(record, 6, checksum);

  const shuffledBlocks = new Uint8Array(128);
  for (let i = 0; i < 4; i++) shuffledBlocks.set(record.slice(8 + i * 32, 40 + i * 32), shuffle[i] * 32);
  record.set(shuffledBlocks, 8);
  cryptGen4(record, 8, 136, checksum);
  if (pokemon.recordKind === "party") cryptGen4(record, 136, 236, pid);
  output.set(record, offset);

  const partitionBase = activePartition * profile.partitionSize;
  if (pokemon.recordKind === "party") {
    writeBlockChecksum(output, partitionBase, profile.generalSize, profile.footerSize);
  } else {
    writeBlockChecksum(output, (options.storagePartition ?? activePartition) * profile.partitionSize + profile.storageOffset, profile.storageSize, profile.footerSize);
  }
  return output;
}

function writeBlockChecksum(data, offset, size, footerSize) {
  const end = offset + size;
  writeUint16(data, end - 2, crc16Ccitt(data.subarray(offset, end - footerSize)));
}

