const SOULSILVER = Object.freeze({
  game: "Pokémon SoulSilver",
  fileSize: 0x80000,
  partitionSize: 0x40000,
  generalSize: 0xF628,
  storageOffset: 0xF700,
  storageSize: 0x12310,
  boxCount: 18,
  boxSlots: 30,
  boxSize: 0x1000,
  trainerOffset: 0x64,
  romCodeOffset: 0x1C,
  romCode: 0x08,
  magic: 0x20060623,
  koreanMagic: 0x20070903,
});

export function detectSoulSilver(buffer) {
  const data = new Uint8Array(buffer);
  const result = {
    game: "Not detected",
    supported: false,
    valid: false,
    reason: "",
    activePartition: null,
    trainer: null,
    party: [],
    save: null,
  };

  if (data.length !== SOULSILVER.fileSize) {
    result.reason = `Unsupported save size. Expected 512.0 KB, received ${formatBytes(data.length)}.`;
    return result;
  }

  const partitions = [0, SOULSILVER.partitionSize];
  const generalBlocks = partitions.map((partition) =>
    validateBlock(data, partition, SOULSILVER.generalSize)
  );
  const storageBlocks = partitions.map((partition) =>
    validateBlock(
      data,
      partition + SOULSILVER.storageOffset,
      SOULSILVER.storageSize
    )
  );

  const romCodeValid = partitions.some(
    (partition) =>
      data[partition + SOULSILVER.trainerOffset + SOULSILVER.romCodeOffset] ===
      SOULSILVER.romCode
  );
  const activePartition = getActivePartition(data, generalBlocks);
  const magicValid = generalBlocks.some(
    (block) =>
      block.magic === SOULSILVER.magic ||
      block.magic === SOULSILVER.koreanMagic
  );
  const activeStorageValid =
    activePartition !== null && storageBlocks[activePartition].valid;

  if (
    activePartition === null ||
    !generalBlocks[activePartition].valid ||
    !activeStorageValid ||
    !romCodeValid ||
    !magicValid
  ) {
    result.reason =
      "The file is 512.0 KB, but its active SoulSilver save partition could not be validated.";
    return result;
  }

  const trainer = readTrainerInfo(data, activePartition);
  const party = readParty(data, activePartition);
  const storage = readStorage(data, activePartition);

  result.game = SOULSILVER.game;
  result.activePartition = activePartition;
  result.trainer = trainer;
  result.party = party;
  result.storage = storage;
  result.save = {
    game: SOULSILVER.game,
    activePartition,
    trainer,
    party,
    storage,
  };
  result.supported = true;
  result.valid = true;
  result.reason = "Valid SoulSilver save structure detected.";
  return result;
}



function readParty(data, activePartition) {
  const base = activePartition * SOULSILVER.partitionSize;
  const partyBase = base + SOULSILVER.trainerOffset + 0x30;
  const count = data[partyBase];
  const party = [];

  for (let slot = 0; slot < Math.min(count, 6); slot++) {
    const offset = partyBase + 0x04 + slot * 236;
    if (offset + 236 > data.length) break;

    const encrypted = data.slice(offset, offset + 236);
    const pokemon = decryptGen4PartyPokemon(encrypted);

    if (pokemon.speciesId === 0) continue;
    party.push({
      slot: slot + 1,
      ...pokemon,
    });
  }

  return party;
}

function readStorage(data, activePartition) {
  const base = activePartition * SOULSILVER.partitionSize + SOULSILVER.storageOffset;
  const boxes = [];

  for (let box = 0; box < SOULSILVER.boxCount; box++) {
    const boxBase = base + box * SOULSILVER.boxSize;
    const pokemon = [];

    for (let slot = 0; slot < SOULSILVER.boxSlots; slot++) {
      const offset = boxBase + slot * 136;
      const encrypted = data.slice(offset, offset + 136);
      const parsed = decryptGen4StoredPokemon(encrypted);

      pokemon.push({
        slot: slot + 1,
        ...parsed,
      });
    }

    boxes.push({
      number: box + 1,
      name: decodeStorageText(data, base + 0x12008 + box * 40, 40) || `Box ${box + 1}`,
      pokemon,
    });
  }

  return {
    currentBox: readUint32(data, base + 0x12000),
    totalCount: readUint32(data, base + 0x12004),
    boxes,
  };
}

function decryptGen4StoredPokemon(data) {
  const result = new Uint8Array(data);
  const pid = readUint32(result, 0);

  if (pid === 0) {
    return { empty: true };
  }

  const checksum = readUint16(result, 6);
  const shuffle = GEN4_BLOCK_UNSHUFFLES[(pid >> 13) & 0x1F];

  cryptGen4(result, 8, 136, checksum);

  const blocks = [
    result.slice(8, 40),
    result.slice(40, 72),
    result.slice(72, 104),
    result.slice(104, 136),
  ];
  const unshuffled = new Uint8Array(128);

  for (let i = 0; i < 4; i++) {
    unshuffled.set(blocks[shuffle[i]], i * 32);
  }
  result.set(unshuffled, 8);

  return {
    empty: false,
    personality: pid,
    speciesId: readUint16(result, 8),
    heldItemId: readUint16(result, 10),
    otId: readUint16(result, 12),
    secretId: readUint16(result, 14),
    experience: readUint32(result, 16),
    friendship: result[20],
    abilitySlot: result[21] & 1,
    isEgg: (readUint32(result, 0x38) & 0x40000000) !== 0,
    isNicknamed: (readUint32(result, 0x38) & 0x80000000) !== 0,
    nickname: decodePokemonNickname(result, 0x48, 20),
    otName: decodeTrainerName(result, 0x68, 16),
    eggDate: readPokemonDate(result, 0x78),
    metDate: readPokemonDate(result, 0x7B),
    eggLocationId: readUint16(result, 0x44),
    metLocationId: readUint16(result, 0x46),
    pokeballId: result[0x86],
    metLevel: result[0x84] & 0x7F,
    shiny: (((pid ^ readUint16(result, 0x0C) ^ readUint16(result, 0x0E)) & 0xFFFF) < 8),
    natureId: pid % 25,
  };
}

function decodeStorageText(data, offset, byteLength) {
  return decodeTrainerName(data, offset, byteLength);
}

function decryptGen4PartyPokemon(data) {
  const result = new Uint8Array(data);
  const pid = readUint32(result, 0);
  const checksum = readUint16(result, 6);
  const shuffle = GEN4_BLOCK_UNSHUFFLES[(pid >> 13) & 0x1F];

  // Party data after the first 136 bytes is encrypted with the PID.
  cryptGen4(result, 136, 236, pid);

  // The four 32-byte data blocks are encrypted with the checksum and
  // stored in a PID-dependent order.
  cryptGen4(result, 8, 136, checksum);

  const blocks = [
    result.slice(8, 40),
    result.slice(40, 72),
    result.slice(72, 104),
    result.slice(104, 136),
  ];
  const unshuffled = new Uint8Array(128);

  for (let i = 0; i < 4; i++) {
    unshuffled.set(blocks[shuffle[i]], i * 32);
  }
  result.set(unshuffled, 8);

  return {
    personality: pid,
    speciesId: readUint16(result, 8),
    heldItemId: readUint16(result, 10),
    otId: readUint16(result, 12),
    secretId: readUint16(result, 14),
    experience: readUint32(result, 16),
    friendship: result[20],
    abilitySlot: result[21] & 1,
    isEgg: (readUint32(result, 0x38) & 0x40000000) !== 0,
    isNicknamed: (readUint32(result, 0x38) & 0x80000000) !== 0,
    nickname: decodePokemonNickname(result, 0x48, 20),
    otName: decodeTrainerName(result, 0x68, 16),
    eggDate: readPokemonDate(result, 0x78),
    metDate: readPokemonDate(result, 0x7B),
    eggLocationId: readUint16(result, 0x44),
    metLocationId: readUint16(result, 0x46),
    pokeballId: result[0x86],
    metLevel: result[0x84] & 0x7F,
    shiny: (((pid ^ readUint16(result, 0x0C) ^ readUint16(result, 0x0E)) & 0xFFFF) < 8),
    natureId: pid % 25,
    level: result[0x8C],
    currentHp: readUint16(result, 0x8E),
    maxHp: readUint16(result, 0x90),
    stats: {
      attack: readUint16(result, 0x92),
      defense: readUint16(result, 0x94),
      speed: readUint16(result, 0x96),
      specialAttack: readUint16(result, 0x98),
      specialDefense: readUint16(result, 0x9A),
    },
    status: readUint32(result, 0x88),
  };
}

function cryptGen4(data, start, end, seed) {
  let value = seed >>> 0;

  for (let offset = start; offset < end; offset += 2) {
    value = Math.imul(value, 0x41C64E6D) + 0x6073;
    const xor = (value >>> 16) & 0xFFFF;
    const current = data[offset] | (data[offset + 1] << 8);
    data[offset] = (current ^ xor) & 0xFF;
    data[offset + 1] = (current ^ xor) >>> 8;
  }
}

function readPokemonDate(data, offset) {
  const year = data[offset];
  const month = data[offset + 1];
  const day = data[offset + 2];

  if (!year || !month || !day) return null;

  return {
    year: 2000 + year,
    month,
    day,
  };
}

function decodePokemonNickname(data, offset, byteLength) {
  const chars = [];

  for (let i = 0; i < byteLength; i += 2) {
    const value = readUint16(data, offset + i);
    if (value === 0 || value === 0xFFFF) break;
    chars.push(decodeGen4Character(value));
  }

  return chars.join("");
}

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

function getActivePartition(data, blocks) {
  if (blocks[0].valid && !blocks[1].valid) return 0;
  if (blocks[1].valid && !blocks[0].valid) return 1;
  if (!blocks[0].valid && !blocks[1].valid) return null;

  const footer0 = SOULSILVER.generalSize - 0x14;
  const footer1 = SOULSILVER.partitionSize + footer0;
  const major0 = readUint32(data, footer0);
  const major1 = readUint32(data, footer1);

  const majorComparison = compareCounters(major0, major1);
  if (majorComparison !== 2) return majorComparison;

  const minor0 = readUint32(data, footer0 + 0x04);
  const minor1 = readUint32(data, footer1 + 0x04);
  const minorComparison = compareCounters(minor0, minor1);

  return minorComparison === 1 ? 1 : 0;
}

function compareCounters(counter0, counter1) {
  if (counter0 === 0xFFFFFFFF && counter1 !== 0xFFFFFFFE) return 1;
  if (counter1 === 0xFFFFFFFF && counter0 !== 0xFFFFFFFE) return 0;
  if (counter0 > counter1) return 0;
  if (counter0 < counter1) return 1;
  return 2;
}

function readTrainerInfo(data, activePartition) {
  if (activePartition === null) return null;

  const base = activePartition * SOULSILVER.partitionSize;
  const trainer = base + SOULSILVER.trainerOffset;
  const badgesJohto = data[trainer + 0x1A];
  const badgesKanto = data[trainer + 0x1F];
  const badges = badgesJohto | (badgesKanto << 8);

  return {
    name: decodeTrainerName(data, trainer, 16),
    trainerId: readUint16(data, trainer + 0x10),
    secretId: readUint16(data, trainer + 0x12),
    money: readUint32(data, trainer + 0x14),
    gender: data[trainer + 0x18] === 0 ? "Male" : "Female",
    badges,
    badgeCount: countBits(badges),
    playTime: {
      hours: readUint16(data, trainer + 0x22),
      minutes: data[trainer + 0x24],
      seconds: data[trainer + 0x25],
    },
  };
}

function countBits(value) {
  let count = 0;

  while (value !== 0) {
    count += value & 1;
    value >>>= 1;
  }

  return count;
}

function decodeTrainerName(data, offset, byteLength) {
  const chars = [];

  for (let i = 0; i < byteLength; i += 2) {
    const value = readUint16(data, offset + i);

    if (value === 0 || value === 0xFFFF) break;

    const character = decodeGen4Character(value);
    chars.push(character);
  }

  return chars.join("");
}

function decodeGen4Character(value) {
  if (value >= 0x121 && value <= 0x12A) {
    return String.fromCharCode(0x30 + value - 0x121);
  }

  if (value >= 0x12B && value <= 0x144) {
    return String.fromCharCode(0x41 + value - 0x12B);
  }

  if (value >= 0x145 && value <= 0x16E) {
    return String.fromCharCode(0x61 + value - 0x145);
  }

  const punctuation = new Map([
    [0x1D0, "@"],
    [0x1D2, "%"],
    [0x1D4, "!"],
    [0x1D5, "?"],
    [0x1D6, ","],
    [0x1D7, "."],
    [0x1DE, " "],
    [0x1B3, "'"],
    [0x1B4, "'"],
    [0x1B5, "'"],
    [0x1BC, "+"],
    [0x1BD, "-"],
  ]);

  return punctuation.get(value) ?? "?";
}

function validateBlock(data, offset, size) {
  const end = offset + size;
  if (end > data.length || size < 0x10) {
    return { valid: false, magic: null };
  }

  const footerOffset = end - 0x10;
  const storedSize = readUint32(data, footerOffset + 0x04);
  const magic = readUint32(data, footerOffset + 0x08);
  const storedChecksum = readUint16(data, end - 0x02);
  const calculatedChecksum = crc16Ccitt(
    data.subarray(offset, end - 0x10)
  );

  return {
    valid: storedSize === size && storedChecksum === calculatedChecksum,
    magic,
  };
}

function readUint16(data, offset) {
  return data[offset] | (data[offset + 1] << 8);
}

function readUint32(data, offset) {
  return (
    data[offset] |
    (data[offset + 1] << 8) |
    (data[offset + 2] << 16) |
    (data[offset + 3] << 24)
  ) >>> 0;
}

function crc16Ccitt(data) {
  let crc = 0xFFFF;

  for (const byte of data) {
    crc ^= byte << 8;

    for (let bit = 0; bit < 8; bit++) {
      crc = (crc & 0x8000)
        ? ((crc << 1) ^ 0x1021) & 0xFFFF
        : (crc << 1) & 0xFFFF;
    }
  }

  return crc;
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
