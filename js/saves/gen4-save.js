import { readUint16, readUint32, validateBlock } from './gen4-binary.js';
import { decryptGen4StoredPokemon, decryptGen4PartyPokemon, decodeTrainerName } from './gen4-pokemon.js';

export function detectGen4Save(buffer, profile, mechanics = {}) {
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

  if (data.length !== profile.fileSize) {
    result.reason = `Unsupported save size. Expected 512.0 KB, received ${formatBytes(data.length)}.`;
    return result;
  }

  const partitions = [0, profile.partitionSize];
  const generalBlocks = partitions.map((partition) =>
    validateBlock(data, partition, profile.generalSize, profile.footerSize, profile.strictFooter ? 0 : null)
  );
  const storageBlocks = partitions.map((partition) =>
    validateBlock(
      data,
      partition + profile.storageOffset,
      profile.storageSize, profile.footerSize, profile.strictFooter ? 1 : null
    )
  );

  const romCodeValid = partitions.some(
    (partition) =>
      data[partition + profile.trainerOffset + profile.romCodeOffset] ===
      profile.romCode
  );
  let activePartition = getActivePartition(data, generalBlocks, profile);
  const magicValid = generalBlocks.some(
    (block) =>
      block.magic === profile.magic ||
      block.magic === profile.koreanMagic
  );
  let storagePartition = profile.independentStorage
    ? getActivePartition(data, storageBlocks, profile, profile.storageOffset, profile.storageSize)
    : activePartition;
  if (profile.independentStorage && activePartition !== null && storagePartition !== null) {
    const generalOrder = [activePartition, 1 - activePartition].filter(i => generalBlocks[i].valid);
    const storageOrder = [storagePartition, 1 - storagePartition].filter(i => storageBlocks[i].valid);
    const pair = generalOrder.flatMap(g => storageOrder.map(b => [g, b])).find(([g, b]) =>
      readUint32(data, g * profile.partitionSize + profile.generalSize - 0x14) ===
      readUint32(data, b * profile.partitionSize + profile.storageOffset + profile.storageSize - 0x14));
    if (pair) [activePartition, storagePartition] = pair;
    else { result.reason = 'Platinum general and PC save counters disagree; no coherent backup pair is available.'; return result; }
  }
  const activeStorageValid = storagePartition !== null && storageBlocks[storagePartition].valid;
  const selectedGameValid = activePartition !== null && (!profile.strictFooter ||
    data[activePartition * profile.partitionSize + profile.trainerOffset + profile.romCodeOffset] === profile.romCode);
  const selectedMagicValid = !profile.strictFooter || [generalBlocks[activePartition], storageBlocks[storagePartition]]
    .every(block => block && [profile.magic, profile.koreanMagic].includes(block.magic));

  if (
    activePartition === null ||
    !generalBlocks[activePartition].valid ||
    !activeStorageValid ||
    !romCodeValid || !selectedGameValid || !selectedMagicValid ||
    !magicValid
  ) {
    result.reason =
      `The file is 512.0 KB, but its active ${profile.shortName} save partition could not be validated.`;
    return result;
  }

  const trainer = readTrainerInfo(data, activePartition, profile);
  const party = readParty(data, activePartition, profile);
  const storage = readStorage(data, storagePartition, profile);
  const pokedex = readPokedex(data, activePartition, profile);

  if (profile.extendedPokemonFields) {
    const records = [...party, ...storage.boxes.flatMap(box => box.pokemon)].filter(p => !p.empty);
    if (records.some(p => !p.checksumValid || p.speciesId < 1 || p.speciesId > 493) || data[activePartition * profile.partitionSize + profile.partyOffset] > 6) {
      result.reason = 'Platinum contains an invalid Pokémon checksum, identifier or party count.';
      return result;
    }
    result.gameId = profile.id;
    result.progress = {mainStoryCleared: Boolean(data[activePartition * profile.partitionSize + profile.nationalFlagOffset] & 1), nationalDex: pokedex.nationalDex};
    result.activeStoragePartition = storagePartition;
    result.blockMetadata = {general: blockMetadata(data, activePartition, 0, profile.generalSize, profile), storage: blockMetadata(data, storagePartition, profile.storageOffset, profile.storageSize, profile)};
    result.limitations = ['Hall of Fame, Battle Frontier records, Underground and linked-game communication are not decoded.'];
  }
  result.game = profile.game;
  result.activePartition = activePartition;
  result.trainer = trainer;
  result.party = party;
  result.storage = storage;
  result.save = {
    game: profile.game,
    activePartition,
    trainer,
    party,
    storage,
    pokedex,
    safari: mechanics.safari?.(data, activePartition),
  };
  result.supported = true;
  result.valid = true;
  const partyCount = data[activePartition * profile.partitionSize + profile.partyOffset];
  result.decodeComplete = partyCount <= 6 && party.length === partyCount;
  result.reason = `Valid ${profile.shortName} save structure detected.`;
  return result;
}



function readParty(data, activePartition, profile) {
  const base = activePartition * profile.partitionSize;
  const partyBase = base + profile.partyOffset;
  const count = data[partyBase];
  const party = [];

  for (let slot = 0; slot < Math.min(count, 6); slot++) {
    const offset = partyBase + 0x04 + slot * 236;
    if (offset + 236 > data.length) break;

    const encrypted = data.slice(offset, offset + 236);
    const pokemon = decryptGen4PartyPokemon(encrypted, profile.extendedPokemonFields);

    if (pokemon.speciesId === 0) continue;
    party.push({
      slot: slot + 1,
      ...pokemon,
      saveOffset: offset,
      recordKind: "party",
    });
  }

  return party;
}

function readStorage(data, activePartition, profile) {
  const base = activePartition * profile.partitionSize + profile.storageOffset;
  const boxes = [];

  for (let box = 0; box < profile.boxCount; box++) {
    const boxBase = base + profile.boxDataOffset + box * profile.boxSize;
    const pokemon = [];

    for (let slot = 0; slot < profile.boxSlots; slot++) {
      const offset = boxBase + slot * 136;
      const encrypted = data.slice(offset, offset + 136);
      const parsed = decryptGen4StoredPokemon(encrypted, profile.extendedPokemonFields);

      pokemon.push({
        slot: slot + 1,
        ...parsed,
        saveOffset: offset,
        recordKind: "storage",
        boxNumber: box + 1,
      });
    }

    boxes.push({
      number: box + 1,
      name: decodeTrainerName(data, base + profile.boxNamesOffset + box * profile.boxNameSize, profile.boxNameSize) || `Box ${box + 1}`,
      pokemon,
    });
  }

  return {
    currentBox: readUint32(data, base + profile.currentBoxOffset),
    totalCount: profile.totalCountOffset === null ? boxes.reduce((sum, box) => sum + box.pokemon.filter(p => !p.empty).length, 0) : readUint32(data, base + profile.totalCountOffset),
    boxes,
  };
}

function getActivePartition(data, blocks, profile, blockOffset = 0, blockSize = profile.generalSize) {
  if (blocks[0].valid && !blocks[1].valid) return 0;
  if (blocks[1].valid && !blocks[0].valid) return 1;
  if (!blocks[0].valid && !blocks[1].valid) return null;

  const footer0 = blockOffset + blockSize - 0x14;
  const footer1 = profile.partitionSize + footer0;
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

function readPokedex(data, activePartition, profile) {
  const base = activePartition * profile.partitionSize;
  const offset = base + profile.pokedexOffset;
  const regionSize = 0x40;
  const progressFlags = data[base + profile.nationalFlagOffset];
  const nationalDex = (progressFlags & 0x02) !== 0;
  const species = nationalDex
    ? Array.from({ length: 493 }, (_, index) => index + 1)
    : profile.regionalDex;
  let seenCount = 0;
  let caughtCount = 0;
  const caughtSpecies = [];
  const seenSpecies = [];
  const allCaughtSpecies = [];
  const allSeenSpecies = [];
  for (let speciesId = 1; speciesId <= 493; speciesId++) {
    const bit = speciesId - 1;
    const byteOffset = offset + 4 + (bit >> 3);
    const mask = 1 << (bit & 7);
    if (data[byteOffset] & mask) allCaughtSpecies.push(speciesId);
    if (data[byteOffset + regionSize] & mask) allSeenSpecies.push(speciesId);
  }

  for (const speciesId of species) {
    const bit = speciesId - 1;
    const byteOffset = offset + 4 + (bit >> 3);
    const mask = 1 << (bit & 7);

    if (data[byteOffset] & mask) {
      caughtCount++;
      caughtSpecies.push(speciesId);
    }
    if (data[byteOffset + regionSize] & mask) {
      seenCount++;
      seenSpecies.push(speciesId);
    }
  }

  const speciesCount = species.length;

  return {
    seenCount,
    caughtCount,
    speciesCount,
    seenPercent: (seenCount / speciesCount) * 100,
    caughtPercent: (caughtCount / speciesCount) * 100,
    nationalDex,
    speciesIds: species,
    caughtSpecies,
    seenSpecies,
    allCaughtSpecies,
    allSeenSpecies,
  };
}

function readTrainerInfo(data, activePartition, profile) {
  if (activePartition === null) return null;

  const base = activePartition * profile.partitionSize;
  const trainer = base + profile.trainerOffset;
  const badgesJohto = data[trainer + 0x1A];
  const badgesKanto = profile.badgeCount === 16 ? data[trainer + 0x1F] : 0;
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

function formatBytes(bytes) {
  if (bytes === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );

  return `${(bytes / 1024 ** exponent).toFixed(1)} ${units[exponent]}`;
}

function blockMetadata(data, partition, offset, size, profile) {
  const footer = partition * profile.partitionSize + offset + size - 0x14;
  return {partition, offset: partition * profile.partitionSize + offset, size,
    saveCounter: readUint32(data, footer), blockCounter: readUint32(data, footer + 4)};
}
