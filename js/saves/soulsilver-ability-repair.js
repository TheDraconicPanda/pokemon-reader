import { detectSave } from './index.js';
import { SOULSILVER_PROFILE as profile } from './profiles.js';
import { splitSaveContainer, joinSaveContainer } from './gen4-container.js';
import { decryptGen4Record, pokemonChecksum } from './gen4-pokemon.js';
import { readUint16 } from './gen4-binary.js';
import { validateSoulSilverAbility } from './gen4-abilities.js';
import { writeGen4Record } from './gen4-record-writer.js';

const records = result => [...result.party, ...result.storage.boxes.flatMap(box => box.pokemon)];

// The UI requests confirmation before calling this transaction. Only party and
// PC PK4s from the active validated SoulSilver partition can be repaired.
export function repairSoulSilverAbility(input, displayed) {
  const container = splitSaveContainer(input), source = detectSave(container.raw);
  if (!source.valid || (source.gameId || 'soulsilver') !== 'soulsilver' || source.decodeComplete === false) {
    throw new Error('Reload a complete validated SoulSilver save before repairing an ability.');
  }
  const actual = records(source).find(p => !p.empty && p.saveOffset === displayed?.saveOffset && p.recordKind === displayed?.recordKind);
  if (!actual || ['personality','speciesId','abilityId','heldItemId','otId','secretId','experience','formId'].some(key => actual[key] !== displayed[key])) {
    throw new Error('The save record no longer matches the displayed Pokémon. Reload the save and try again.');
  }
  const validation = validateSoulSilverAbility(actual);
  if (validation.status === 'valid') return new Uint8Array(input);
  if (validation.status !== 'invalid') throw new Error(validation.reason || 'This Pokémon does not have a supported ability repair.');
  const length = actual.recordKind === 'party' ? 236 : 136, offset = actual.saveOffset;
  const before = decryptGen4Record(container.raw.subarray(offset, offset + length), actual.recordKind === 'party');
  if (pokemonChecksum(before) !== readUint16(before, 6) || (before[0x40] >>> 3) !== (actual.formId ?? 0)) {
    throw new Error('The Pokémon checksum or form could not be verified. No changes were made.');
  }
  const logical = before.slice(), output = container.raw.slice();
  logical[0x15] = validation.replacement;
  writeGen4Record(output, logical, offset, actual.recordKind, profile, source.activePartition);
  const verified = detectSave(output), repaired = verified.valid && records(verified).find(p => p.saveOffset === offset && p.recordKind === actual.recordKind);
  if (!repaired?.checksumValid || repaired.abilityId !== validation.replacement || validateSoulSilverAbility(repaired).status !== 'valid') {
    throw new Error('The repaired save failed validation. No export was created.');
  }
  const after = decryptGen4Record(output.subarray(offset, offset + length), actual.recordKind === 'party');
  if (before.some((byte, i) => ![6, 7, 0x15].includes(i) && byte !== after[i])) throw new Error('Unrelated Pokémon data changed. No export was created.');
  const crc = source.activePartition * profile.partitionSize + (actual.recordKind === 'party' ? profile.generalSize : profile.storageOffset + profile.storageSize) - 2;
  if (container.raw.some((byte, i) => byte !== output[i] && !(i >= offset && i < offset + length) && i !== crc && i !== crc + 1)) {
    throw new Error('Unrelated save data changed. No export was created.');
  }
  return joinSaveContainer(output, container);
}
