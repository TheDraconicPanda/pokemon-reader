import { detectSave } from './index.js';
import { splitSaveContainer, joinSaveContainer } from './gen4-container.js';
import { gameProfile } from './profiles.js';
import { decryptGen4Record, pokemonChecksum } from './gen4-pokemon.js';
import { writeGen4Record } from './gen4-record-writer.js';
import { readUint16, readUint32, writeUint16 } from './gen4-binary.js';
import { setGen3PokemonShiny } from './gen3-pokemon.js';
import { gen3SectorChecksum } from './gen3-sectors.js';

const records = result => [...result.party, ...result.storage.boxes.flatMap(box => box.pokemon)];

function findDisplayedRecord(source, displayed, gameId) {
  return records(source).find(record => !record.empty && record.recordKind === displayed?.recordKind &&
    (gameId === 'leafgreen'
      ? record.slot === displayed.slot && (record.recordKind !== 'storage' || record.boxNumber === displayed.boxNumber)
      : record.saveOffset === displayed?.saveOffset));
}

function findGen4Personality(logical, shiny) {
  const originalPid = readUint32(logical, 0);
  const trainerXor = readUint16(logical, 0x0C) ^ readUint16(logical, 0x0E);
  const targetXor = shiny ? 0 : 8;
  const nature = originalPid % 25;
  for (let low = 0; low <= 0xFFFF; low++) {
    const high = low ^ trainerXor ^ targetXor;
    const candidate = (((high << 16) | low) >>> 0);
    if (candidate % 25 === nature) return candidate;
  }
  throw new Error('No personality value could preserve this Pokémon’s nature.');
}

function writeGen3Region(output, sectors, firstId, lastId, logicalOffset, record) {
  const segments = sectors.filter(sector => sector.id >= firstId && sector.id <= lastId).sort((a,b)=>a.id-b.id);
  let cursor = 0;
  const changed = new Set();
  for (const sector of segments) {
    const start = Math.max(logicalOffset, cursor);
    const end = Math.min(logicalOffset + record.length, cursor + sector.length);
    if (start < end) {
      output.set(record.subarray(start - logicalOffset, end - logicalOffset), sector.offset + start - cursor);
      changed.add(sector.id);
    }
    cursor += sector.length;
  }
  if (logicalOffset + record.length > cursor) throw new Error('The Pokémon record extends beyond its validated save region.');
  for (const id of changed) {
    const sector = sectors.find(item => item.id === id);
    const checksum = gen3SectorChecksum(output.subarray(sector.offset, sector.offset + sector.length));
    writeUint16(output, sector.offset + 0xFF6, checksum);
  }
}

function setLeafGreenShiny(input, source, actual, desired) {
  const output = new Uint8Array(input);
  const sectors = source.blockMetadata?.sectors;
  if (!Array.isArray(sectors) || sectors.length !== 14 || sectors.some(sector => !Number.isInteger(sector.offset) || !Number.isInteger(sector.length))) {
    throw new Error('The active LeafGreen save sectors could not be verified.');
  }
  const party = actual.recordKind === 'party';
  const logicalOffset = party ? 0x38 + (actual.slot - 1) * 100 :
    4 + ((actual.boxNumber - 1) * 30 + actual.slot - 1) * 80;
  const length = party ? 100 : 80;
  const region = party ? source.blockMetadata.sectors.filter(s => s.id >= 1 && s.id <= 4) :
    source.blockMetadata.sectors.filter(s => s.id >= 5 && s.id <= 13);
  const regionLength = region.reduce((sum, sector) => sum + sector.length, 0);
  if (!Number.isInteger(logicalOffset) || logicalOffset < 0 || logicalOffset + length > regionLength) {
    throw new Error('The selected Pokémon is outside the validated LeafGreen record region.');
  }
  const current = new Uint8Array(length);
  let cursor = 0;
  for (const sector of region.sort((a,b)=>a.id-b.id)) {
    const start = Math.max(logicalOffset, cursor), end = Math.min(logicalOffset + length, cursor + sector.length);
    if (start < end) current.set(input.subarray(sector.offset + start - cursor, sector.offset + end - cursor), start - logicalOffset);
    cursor += sector.length;
  }
  const changed = setGen3PokemonShiny(current, desired, party);
  writeGen3Region(output, sectors, party ? 1 : 5, party ? 4 : 13, logicalOffset, changed);
  return output;
}

// Produces a separate validated save revision. The caller's input and loaded
// Adventure Profile are never mutated.
export function setPokemonShiny(input, displayed, desiredShiny) {
  const bytes = input instanceof Uint8Array ? new Uint8Array(input) : new Uint8Array(input);
  const isLeafGreen = bytes.length === 0x20000;
  const container = isLeafGreen ? null : splitSaveContainer(bytes);
  const raw = isLeafGreen ? bytes : container.raw;
  const source = detectSave(raw, {gameId:isLeafGreen ? 'leafgreen' : null});
  const gameId = source.gameId || 'soulsilver';
  if (!source.valid || source.decodeComplete === false || !['leafgreen','soulsilver','platinum'].includes(gameId)) {
    throw new Error('Reload a complete validated original save before editing shiny status.');
  }
  const actual = findDisplayedRecord(source, displayed, gameId);
  if (!actual || ['personality','speciesId','otId','secretId','experience'].some(key => actual[key] !== displayed[key])) {
    throw new Error('The save record no longer matches the displayed Pokémon. Reload the save and try again.');
  }
  if (!actual.checksumValid) throw new Error('The Pokémon checksum is invalid. No changes were made.');
  if (actual.shiny === Boolean(desiredShiny)) return new Uint8Array(bytes);

  let output;
  if (gameId === 'leafgreen') {
    output = setLeafGreenShiny(raw, source, actual, Boolean(desiredShiny));
  } else {
    const profile = gameProfile(gameId);
    const length = actual.recordKind === 'party' ? 236 : 136;
    const offset = actual.saveOffset;
    if (!Number.isInteger(offset) || offset < 0 || offset + length > raw.length) throw new Error('The selected Pokémon record is outside the validated save.');
    const before = decryptGen4Record(raw.subarray(offset, offset + length), actual.recordKind === 'party');
    if (pokemonChecksum(before) !== readUint16(before, 6)) throw new Error('The Pokémon checksum is invalid. No changes were made.');
    const logical = before.slice();
    const nextPid = findGen4Personality(logical, Boolean(desiredShiny));
    new DataView(logical.buffer, logical.byteOffset, logical.byteLength).setUint32(0, nextPid, true);
    output = raw.slice();
    const partition = actual.recordKind === 'storage' && profile.independentStorage
      ? source.activeStoragePartition : source.activePartition;
    writeGen4Record(output, logical, offset, actual.recordKind, profile, partition);
    const after = decryptGen4Record(output.subarray(offset, offset + length), actual.recordKind === 'party');
    if (pokemonChecksum(after) !== readUint16(after, 6) || readUint32(after, 0) !== nextPid) {
      throw new Error('The updated Pokémon record failed checksum validation. No save was changed.');
    }
    for (let i = 0; i < before.length; i++) {
      if (![0,1,6,7].includes(i) && before[i] !== after[i]) throw new Error('Unrelated Pokémon data changed. No save was changed.');
    }
  }

  const verified = detectSave(output, {gameId:isLeafGreen ? 'leafgreen' : null});
  const updated = verified.valid && findDisplayedRecord(verified, actual, gameId);
  if (!updated || !updated.checksumValid || updated.shiny !== Boolean(desiredShiny) ||
      updated.speciesId !== actual.speciesId || updated.natureId !== actual.natureId ||
      updated.otId !== actual.otId || updated.secretId !== actual.secretId ||
      updated.experience !== actual.experience) {
    throw new Error('The modified save failed independent Reader validation. No export was created.');
  }
  return isLeafGreen ? output : joinSaveContainer(output, container);
}

export function shinyExportName(name = 'pokemon-save.sav') {
  const match = name.match(/(\\.[^./\\\\]+)$/);
  const extension = match ? match[1] : '.sav';
  const base = match ? name.slice(0, -extension.length) : name;
  const previous = base.match(/^(.*)\\.shiny(?:-(\\d+))?$/i);
  const next = previous ? `${previous[1]}.shiny-${BigInt(previous[2] || '1') + 1n}` : `${base}.shiny`;
  return `${next}${extension}`;
}
