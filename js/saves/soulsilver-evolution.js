const GEN4_BLOCK_UNSHUFFLES = Object.freeze([
  [0, 1, 2, 3], [0, 1, 3, 2], [0, 2, 1, 3], [0, 3, 1, 2],
  [0, 2, 3, 1], [0, 3, 2, 1], [1, 0, 2, 3], [1, 0, 3, 2],
  [2, 0, 1, 3], [3, 0, 1, 2], [2, 0, 3, 1], [3, 0, 2, 1],
  [1, 2, 0, 3], [1, 3, 0, 2], [2, 1, 0, 3], [3, 1, 0, 2],
  [2, 3, 0, 1], [3, 2, 0, 1], [1, 2, 3, 0], [1, 3, 2, 0],
  [2, 1, 3, 0], [3, 1, 2, 0], [2, 3, 1, 0], [3, 2, 1, 0],
  [0, 1, 2, 3], [0, 1, 3, 2], [0, 2, 1, 3], [0, 3, 1, 2],
  [0, 2, 3, 1], [0, 3, 2, 1], [1, 0, 2, 3], [1, 0, 3, 2],
]);

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

export function getAvailableEvolutions(pokemon) {
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

export function evolveSoulSilverPokemon(buffer, pokemon, evolution, activePartition, evolvedBaseStats = null) {
  if (!(buffer instanceof Uint8Array) || buffer.length !== 0x80000) {
    throw new Error("Only a validated 512 KB SoulSilver save can be modified.");
  }
  if (!pokemon || !Number.isInteger(pokemon.saveOffset) || !["party", "storage"].includes(pokemon.recordKind)) {
    throw new Error("This Pokémon does not have a supported save location.");
  }
  if (!Number.isInteger(activePartition) || ![0, 1].includes(activePartition)) {
    throw new Error("The active save partition is unknown.");
  }

  const rule = getAvailableEvolutions(pokemon).find((entry) =>
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

  const record = output.slice(offset, offset + length);
  const pid = readUint32(record, 0);
  const shuffle = GEN4_BLOCK_UNSHUFFLES[(pid >>> 13) & 0x1F];

  if (pokemon.recordKind === "party") cryptGen4(record, 136, 236, pid);
  const oldChecksum = readUint16(record, 6);
  cryptGen4(record, 8, 136, oldChecksum);

  const storedBlocks = [
    record.slice(8, 40),
    record.slice(40, 72),
    record.slice(72, 104),
    record.slice(104, 136),
  ];
  const logicalBlocks = new Uint8Array(128);
  for (let i = 0; i < 4; i++) logicalBlocks.set(storedBlocks[shuffle[i]], i * 32);
  record.set(logicalBlocks, 8);

  const currentSpecies = readUint16(record, 8);
  const currentItem = readUint16(record, 10);
  if (currentSpecies !== pokemon.speciesId || currentItem !== pokemon.heldItemId) {
    throw new Error("The save record no longer matches the displayed Pokémon. Reload the save and try again.");
  }

  writeUint16(record, 8, rule.to);
  if (rule.consumesItem) writeUint16(record, 10, 0);
  const oldMaxHp = pokemon.recordKind === "party" ? readUint16(record, 0x90) : 0;
  const oldHp = pokemon.recordKind === "party" ? readUint16(record, 0x8E) : 0;

  if (pokemon.recordKind === "party") {
    recalculatePartyStats(record, evolvedBaseStats, oldMaxHp, oldHp);
  }

  let checksum = 0;
  for (let i = 8; i < 136; i += 2) checksum = (checksum + readUint16(record, i)) & 0xFFFF;
  writeUint16(record, 6, checksum);

  const shuffledBlocks = new Uint8Array(128);
  for (let i = 0; i < 4; i++) shuffledBlocks.set(record.slice(8 + i * 32, 40 + i * 32), shuffle[i] * 32);
  record.set(shuffledBlocks, 8);
  cryptGen4(record, 8, 136, checksum);
  if (pokemon.recordKind === "party") cryptGen4(record, 136, 236, pid);
  output.set(record, offset);

  const partitionBase = activePartition * 0x40000;
  if (pokemon.recordKind === "party") {
    writeBlockChecksum(output, partitionBase, 0xF628);
  } else {
    writeBlockChecksum(output, partitionBase + 0xF700, 0x12310);
  }
  return output;
}

function recalculatePartyStats(record, baseStats, oldMaxHp, oldHp) {
  const level = record[0x8C];
  const ivBits = readUint32(record, 0x38);
  const iv = {
    hp: ivBits & 31,
    attack: (ivBits >>> 5) & 31,
    defense: (ivBits >>> 10) & 31,
    speed: (ivBits >>> 15) & 31,
    specialAttack: (ivBits >>> 20) & 31,
    specialDefense: (ivBits >>> 25) & 31,
  };
  const ev = {
    hp: record[0x18], attack: record[0x19], defense: record[0x1A],
    speed: record[0x1B], specialAttack: record[0x1C], specialDefense: record[0x1D],
  };
  const nature = readUint32(record, 0) % 25;
  const bases = {
    hp: baseStat(baseStats, "hp"),
    attack: baseStat(baseStats, "attack"),
    defense: baseStat(baseStats, "defense"),
    speed: baseStat(baseStats, "speed"),
    specialAttack: baseStat(baseStats, "special-attack"),
    specialDefense: baseStat(baseStats, "special-defense"),
  };
  const calcHp = Math.floor(((2 * bases.hp + iv.hp + Math.floor(ev.hp / 4)) * level) / 100) + level + 10;
  const calcOther = (stat, base, ivValue, evValue) => {
    const raw = Math.floor(((2 * base + ivValue + Math.floor(evValue / 4)) * level) / 100) + 5;
    return Math.floor(raw * natureMultiplier(nature, stat));
  };
  const stats = {
    attack: calcOther("attack", bases.attack, iv.attack, ev.attack),
    defense: calcOther("defense", bases.defense, iv.defense, ev.defense),
    speed: calcOther("speed", bases.speed, iv.speed, ev.speed),
    specialAttack: calcOther("specialAttack", bases.specialAttack, iv.specialAttack, ev.specialAttack),
    specialDefense: calcOther("specialDefense", bases.specialDefense, iv.specialDefense, ev.specialDefense),
  };
  writeUint16(record, 0x90, calcHp);
  writeUint16(record, 0x92, stats.attack);
  writeUint16(record, 0x94, stats.defense);
  writeUint16(record, 0x96, stats.speed);
  writeUint16(record, 0x98, stats.specialAttack);
  writeUint16(record, 0x9A, stats.specialDefense);
  const hp = oldHp === 0 ? 0 : Math.max(1, Math.min(calcHp, calcHp - Math.max(0, oldMaxHp - oldHp)));
  writeUint16(record, 0x8E, hp);
}

function natureMultiplier(nature, stat) {
  const statIndex = { attack: 0, defense: 1, speed: 2, specialAttack: 3, specialDefense: 4 }[stat];
  const raised = Math.floor(nature / 5);
  const lowered = nature % 5;
  if (raised === lowered || raised !== statIndex && lowered !== statIndex) return 1;
  return raised === statIndex ? 1.1 : 0.9;
}

function baseStat(stats, name) {
  const entry = stats.find((stat) => stat.stat?.name === name);
  if (!entry || !Number.isInteger(entry.base_stat)) throw new Error("Invalid evolved species base stats.");
  return entry.base_stat;
}

function validBaseStats(stats) {
  return Array.isArray(stats) && ["hp", "attack", "defense", "speed", "special-attack", "special-defense"]
    .every((name) => stats.some((stat) => stat.stat?.name === name && Number.isInteger(stat.base_stat)));
}

function writeBlockChecksum(data, offset, size) {
  const end = offset + size;
  writeUint16(data, end - 2, crc16Ccitt(data.subarray(offset, end - 0x10)));
}

function crc16Ccitt(data) {
  let crc = 0xFFFF;
  for (const byte of data) {
    crc ^= byte << 8;
    for (let bit = 0; bit < 8; bit++) {
      crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) & 0xFFFF : (crc << 1) & 0xFFFF;
    }
  }
  return crc;
}

function cryptGen4(data, start, end, seed) {
  let value = seed >>> 0;
  for (let offset = start; offset < end; offset += 2) {
    value = (Math.imul(value, 0x41C64E6D) + 0x6073) >>> 0;
    const xor = value >>> 16;
    const current = data[offset] | (data[offset + 1] << 8);
    data[offset] = (current ^ xor) & 0xFF;
    data[offset + 1] = ((current ^ xor) >>> 8) & 0xFF;
  }
}

function readUint16(data, offset) {
  return data[offset] | (data[offset + 1] << 8);
}
function readUint32(data, offset) {
  return (data[offset] | (data[offset + 1] << 8) | (data[offset + 2] << 16) | (data[offset + 3] << 24)) >>> 0;
}
function writeUint16(data, offset, value) {
  data[offset] = value & 0xFF;
  data[offset + 1] = (value >>> 8) & 0xFF;
}
