// FRLG layout verified against pret/pokefirered ce6406d (include/save.h,
// include/global.h, src/save.c). This codec does not identify a game version.
export const FRLG_SECTOR_LENGTHS = Object.freeze([
  0xF24, 0xF80, 0xF80, 0xF80, 0xEE8,
  0xF80, 0xF80, 0xF80, 0xF80, 0xF80, 0xF80, 0xF80, 0xF80, 0x7D0,
]);
const SECTOR_SIZE = 0x1000, SLOT_SIZE = 14 * SECTOR_SIZE;
const bytesOf = input => input instanceof Uint8Array ? input : new Uint8Array(input);
const viewOf = bytes => new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

export function gen3SectorChecksum(input) {
  const bytes = bytesOf(input);
  if (bytes.length % 4) throw new Error('Sector checksum input must contain complete 32-bit words.');
  const view = viewOf(bytes);
  let sum = 0;
  for (let offset = 0; offset < bytes.length; offset += 4) sum = (sum + view.getUint32(offset, true)) >>> 0;
  return ((sum >>> 16) + (sum & 0xFFFF)) & 0xFFFF;
}

function readSlot(bytes, index) {
  const view = viewOf(bytes), sectors = new Map();
  let counter;
  for (let physical = 0; physical < 14; physical++) {
    const offset = index * SLOT_SIZE + physical * SECTOR_SIZE;
    const id = view.getUint16(offset + 0xFF4, true);
    if (id >= 14 || sectors.has(id)) return null;
    if (view.getUint32(offset + 0xFF8, true) !== 0x08012025) return null;
    const current = view.getUint32(offset + 0xFFC, true);
    if (counter !== undefined && counter !== current) return null;
    counter = current;
    const data = bytes.subarray(offset, offset + FRLG_SECTOR_LENGTHS[id]);
    if (gen3SectorChecksum(data) !== view.getUint16(offset + 0xFF6, true)) return null;
    sectors.set(id, {id, offset, length:data.length});
  }
  return {index, counter, sectors};
}

function newerSlot(a, b) {
  // Match the native special case at UINT32_MAX -> 0, then unsigned comparison.
  if (a.counter === 0xFFFFFFFF && b.counter === 0) return b;
  if (b.counter === 0xFFFFFFFF && a.counter === 0) return a;
  return b.counter > a.counter ? b : a;
}

export function readFrlgSectors(input) {
  const bytes = bytesOf(input);
  if (bytes.length !== 0x20000) throw new Error('Expected a raw 128 KiB GBA battery save. Save states and truncated saves are unsupported.');
  const slots = [readSlot(bytes, 0), readSlot(bytes, 1)];
  const valid = slots.filter(Boolean);
  if (!valid.length) throw new Error('No complete checksum-valid FRLG save slot was found.');
  const slot = valid.length === 2 ? newerSlot(...valid) : valid[0];
  function assemble(first, last) {
    const parts = Array.from({length:last - first + 1}, (_, i) => slot.sectors.get(first + i));
    const output = new Uint8Array(parts.reduce((n, part) => n + part.length, 0));
    let cursor = 0;
    for (const part of parts) { output.set(bytes.subarray(part.offset, part.offset + part.length), cursor); cursor += part.length; }
    return output;
  }
  return {
    slot:slot.index, counter:slot.counter,
    validSlots:slots.map(Boolean),
    sectors:Array.from({length:14}, (_, id) => ({...slot.sectors.get(id)})),
    small:assemble(0, 0), large:assemble(1, 4), storage:assemble(5, 13),
  };
}
