const SOULSILVER = Object.freeze({
  game: "Pokémon SoulSilver",
  fileSize: 0x80000,
  partitionSize: 0x40000,
  generalSize: 0xF628,
  storageOffset: 0xF700,
  storageSize: 0x12310,
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

  const generalValid = generalBlocks.some((block) => block.valid);
  const storageValid = storageBlocks.some((block) => block.valid);
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

  if (!generalValid || !storageValid || !romCodeValid || !magicValid) {
    result.reason =
      "The file is 512.0 KB, but its SoulSilver save structure could not be validated.";
    return result;
  }

  result.game = SOULSILVER.game;
  result.supported = true;
  result.valid = true;
  result.reason = "Valid SoulSilver save structure detected.";
  return result;
}

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
