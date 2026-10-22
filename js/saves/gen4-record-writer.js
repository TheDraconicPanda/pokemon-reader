import { cryptGen4, GEN4_BLOCK_UNSHUFFLES, pokemonChecksum } from './gen4-pokemon.js';
import { readUint32, writeUint16, crc16Ccitt } from './gen4-binary.js';

// Callers supply a freshly validated logical PK4 and its validated save location.
// Work on a copy so neither the input save nor the logical record is mutated.
export function writeGen4Record(output, logical, offset, kind, profile, partition) {
  const record = new Uint8Array(logical), pid = readUint32(record, 0);
  const checksum = pokemonChecksum(record), shuffle = GEN4_BLOCK_UNSHUFFLES[(pid >>> 13) & 31];
  writeUint16(record, 6, checksum);
  const blocks = record.slice(8, 136);
  for (let i = 0; i < 4; i++) record.set(blocks.subarray(i * 32, i * 32 + 32), 8 + shuffle[i] * 32);
  cryptGen4(record, 8, 136, checksum);
  if (kind === 'party') cryptGen4(record, 136, 236, pid);
  output.set(record, offset);
  const block = partition * profile.partitionSize + (kind === 'party' ? 0 : profile.storageOffset);
  const end = block + (kind === 'party' ? profile.generalSize : profile.storageSize);
  writeUint16(output, end - 2, crc16Ccitt(output.subarray(block, end - profile.footerSize)));
}
