// Constructed records for parser checks only; this is not an actual game save.
function syntheticSave(pcSpecies = 25) {
  const bytes = new Uint8Array(0x80000);
  const view = new DataView(bytes.buffer);
  const w16 = (offset, value) => view.setUint16(offset, value, true);
  const w32 = (offset, value) => view.setUint32(offset, value, true);
  bytes[0x64] = 0x2B; bytes[0x65] = 1; // Gen IV 'A'
  w16(0x74, 123); w16(0x76, 456);
  bytes[0x80] = 8;
  bytes[0x94] = 1;
  function record(species, party) {
    const data = new Uint8Array(party ? 236 : 136);
    const v = new DataView(data.buffer);
    v.setUint32(0, 1, true); // PID 1 uses the identity block order.
    v.setUint16(8, species, true);
    v.setUint16(12, 123, true); v.setUint16(14, 456, true);
    v.setUint32(16, 1000, true);
    data[21] = 50;
    v.setUint16(0x28, 1, true); data[0x30] = 35;
    v.setUint32(0x38, 0x3FFFFFFF, true);
    data[0x48] = 0x2B; data[0x49] = 1;
    let checksum = 0;
    for (let offset = 8; offset < 136; offset += 2) checksum = (checksum + v.getUint16(offset, true)) & 0xFFFF;
    v.setUint16(6, checksum, true);
    if (party) { data[0x8C] = 10; v.setUint16(0x8E, 25, true); v.setUint16(0x90, 50, true); }
    function crypt(start, end, initial) {
      let seed = initial;
      for (let offset = start; offset < end; offset += 2) {
        seed = (Math.imul(seed, 0x41C64E6D) + 0x6073) >>> 0;
        v.setUint16(offset, v.getUint16(offset, true) ^ (seed >>> 16), true);
      }
    }
    crypt(8, 136, checksum);
    if (party) crypt(136, 236, 1);
    return data;
  }
  bytes.set(record(133, true), 0x98);
  bytes.set(record(pcSpecies, false), 0xF700);
  function sealBlock(offset, size) {
    w32(offset + size - 12, size);
    w32(offset + size - 8, 0x20060623);
    let crc = 0xFFFF;
    for (const byte of bytes.subarray(offset, offset + size - 16)) {
      crc ^= byte << 8;
      for (let bit = 0; bit < 8; bit++) crc = ((crc << 1) ^ (crc & 0x8000 ? 0x1021 : 0)) & 0xFFFF;
    }
    w16(offset + size - 2, crc);
  }
  sealBlock(0, 0xF628); sealBlock(0xF700, 0x12310);
  return { bytes, sealBlock };
}
module.exports = { syntheticSave };
