import { PLATINUM_READER } from '../data/games/platinum/reader-reference.js';
import { readUint16, readUint32 } from './gen4-binary.js';

const GEN4_FORM_SPECIES = new Set([172, 201, 386, 412, 413, 422, 423, 479, 487, 492, 493]);

function getGen4FormId(speciesId, formByte) {
  // Generation IV stores alternate-form indices in bits 3–7 of byte 0x40
  // in the decrypted, unshuffled Pokémon structure.
  if (!GEN4_FORM_SPECIES.has(speciesId)) return null;
  return formByte >>> 3;
}

export function decryptGen4StoredPokemon(data, extended = false) {
  if (data.every(byte => byte === 0)) return {empty: true};
  const result = decryptGen4Record(data, false);
  const pid = readUint32(result, 0), checksum = readUint16(result, 6);

  if (readUint16(result, 8) === 0 && pokemonChecksum(result) === checksum) return {empty: true};

  return {
    empty: false,
    checksumValid: pokemonChecksum(result) === checksum,
    ...(extended ? extendedFields(result) : {}),
    personality: pid,
    formId: getGen4FormId(readUint16(result, 8), result[0x40]),
    speciesId: readUint16(result, 8),
    heldItemId: readUint16(result, 10),
    otId: readUint16(result, 12),
    secretId: readUint16(result, 14),
    experience: readUint32(result, 16),
    friendship: result[20],
    abilityId: result[21],
    isEgg: (readUint32(result, 0x38) & 0x40000000) !== 0,
    isNicknamed: (readUint32(result, 0x38) & 0x80000000) !== 0,
    nickname: decodePokemonNickname(result, 0x48, 20),
    otName: decodeTrainerName(result, 0x68, 16),
    eggDate: readPokemonDate(result, 0x78),
    metDate: readPokemonDate(result, 0x7B),
    eggLocationId: readUint16(result, 0x44) || readUint16(result, 0x7E),
    metLocationId: readUint16(result, 0x46) || readUint16(result, 0x80),
    pokeballId: Math.max(result[0x83], result[0x86]),
    metLevel: result[0x84] & 0x7F,
    shiny: (((pid ^ (pid >>> 16) ^ readUint16(result, 0x0C) ^ readUint16(result, 0x0E)) & 0xFFFF) < 8),
    natureId: pid % 25,
    moves: readGen4Moves(result),
    evs: readGen4EVs(result),
    ivs: readGen4IVs(result),
  };
}

export function decryptGen4PartyPokemon(data, extended = false) {
  const result = decryptGen4Record(data, true);
  const pid = readUint32(result, 0), checksum = readUint16(result, 6);

  return {
    ...(extended ? extendedFields(result) : {}),
    personality: pid,
    checksumValid: pokemonChecksum(result) === checksum,
    formId: getGen4FormId(readUint16(result, 8), result[0x40]),
    speciesId: readUint16(result, 8),
    heldItemId: readUint16(result, 10),
    otId: readUint16(result, 12),
    secretId: readUint16(result, 14),
    experience: readUint32(result, 16),
    friendship: result[20],
    abilityId: result[21],
    isEgg: (readUint32(result, 0x38) & 0x40000000) !== 0,
    isNicknamed: (readUint32(result, 0x38) & 0x80000000) !== 0,
    nickname: decodePokemonNickname(result, 0x48, 20),
    otName: decodeTrainerName(result, 0x68, 16),
    eggDate: readPokemonDate(result, 0x78),
    metDate: readPokemonDate(result, 0x7B),
    eggLocationId: readUint16(result, 0x44) || readUint16(result, 0x7E),
    metLocationId: readUint16(result, 0x46) || readUint16(result, 0x80),
    pokeballId: Math.max(result[0x83], result[0x86]),
    metLevel: result[0x84] & 0x7F,
    shiny: (((pid ^ (pid >>> 16) ^ readUint16(result, 0x0C) ^ readUint16(result, 0x0E)) & 0xFFFF) < 8),
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
    moves: readGen4Moves(result),
    evs: readGen4EVs(result),
    ivs: readGen4IVs(result),
  };
}


// One logical PK4 representation serves both the Reader and transactional writer.
export function decryptGen4Record(data, party = data.length === 236) {
  if (data.length !== (party ? 236 : 136)) throw new Error('Invalid Generation IV Pokémon record length.');
  const result = new Uint8Array(data), pid = readUint32(result, 0), checksum = readUint16(result, 6);
  if (party) cryptGen4(result, 136, 236, pid);
  cryptGen4(result, 8, 136, checksum);
  const stored = result.slice(8, 136), shuffle = GEN4_BLOCK_UNSHUFFLES[(pid >>> 13) & 31];
  for (let i = 0; i < 4; i++) result.set(stored.subarray(shuffle[i] * 32, shuffle[i] * 32 + 32), 8 + i * 32);
  return result;
}

export function pokemonChecksum(data) {
  let sum = 0;
  for (let offset = 8; offset < 136; offset += 2) sum = (sum + readUint16(data, offset)) & 0xFFFF;
  return sum;
}

function readGen4Moves(data) {
  return [0, 1, 2, 3].map((index) => ({
    id: readUint16(data, 0x28 + index * 2),
    pp: data[0x30 + index],
    ppUps: data[0x34 + index],
  }));
}

function readGen4EVs(data) {
  return {
    hp: data[0x18],
    attack: data[0x19],
    defense: data[0x1A],
    speed: data[0x1B],
    specialAttack: data[0x1C],
    specialDefense: data[0x1D],
  };
}

function readGen4IVs(data) {
  const ivs = readUint32(data, 0x38);
  return {
    hp: ivs & 0x1F,
    attack: (ivs >>> 5) & 0x1F,
    defense: (ivs >>> 10) & 0x1F,
    speed: (ivs >>> 15) & 0x1F,
    specialAttack: (ivs >>> 20) & 0x1F,
    specialDefense: (ivs >>> 25) & 0x1F,
  };
}

export function cryptGen4(data, start, end, seed) {
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

  if (!month || !day) return null;

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

export const GEN4_BLOCK_UNSHUFFLES = Object.freeze([
  [0, 1, 2, 3], [0, 1, 3, 2], [0, 2, 1, 3], [0, 3, 1, 2],
  [0, 2, 3, 1], [0, 3, 2, 1], [1, 0, 2, 3], [1, 0, 3, 2],
  [2, 0, 1, 3], [3, 0, 1, 2], [2, 0, 3, 1], [3, 0, 2, 1],
  [1, 2, 0, 3], [1, 3, 0, 2], [2, 1, 0, 3], [3, 1, 0, 2],
  [2, 3, 0, 1], [3, 2, 0, 1], [1, 2, 3, 0], [1, 3, 2, 0],
  [2, 1, 3, 0], [3, 1, 2, 0], [2, 3, 1, 0], [3, 2, 1, 0],
  [0, 1, 2, 3], [0, 1, 3, 2], [0, 2, 1, 3], [0, 3, 1, 2],
  [0, 2, 3, 1], [0, 3, 2, 1], [1, 0, 2, 3], [1, 0, 3, 2],
]);


export function decodeTrainerName(data, offset, byteLength) {
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

  if (value >= 0x145 && value <= 0x15E) {
    return String.fromCharCode(0x61 + value - 0x145);
  }

  // Primary character data includes punctuation and both international/Korean
  // alphabets; preserve the canonical apostrophe used by PKHeX's decoder.
  if (value === 0x1B3) return "'";
  return PLATINUM_READER.characters[value] ?? "�";
}


function extendedFields(data) {
  return {genderId: (data[0x40] >>> 1) & 3, fatefulEncounter: Boolean(data[0x40] & 1),
    contestBeauty: data[0x1F], originGameId: data[0x5F], languageId: data[0x17], pokerus: data[0x82],
    otGenderId: data[0x84] >>> 7, groundTile: data[0x85]};
}
