// Shared little-endian access and Gen IV save CRC.
export function validateBlock(data, offset, size) {
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

export function readUint16(data, offset) {
  return data[offset] | (data[offset + 1] << 8);
}

export function readUint32(data, offset) {
  return (
    data[offset] |
    (data[offset + 1] << 8) |
    (data[offset + 2] << 16) |
    (data[offset + 3] << 24)
  ) >>> 0;
}

export function crc16Ccitt(data) {
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


export function writeUint16(data, offset, value) {
  data[offset] = value & 0xFF; data[offset + 1] = (value >>> 8) & 0xFF;
}
