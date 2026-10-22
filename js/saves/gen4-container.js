const RAW_SIZE = 0x80000;
const DESMUME_FOOTER_SIZE = 0x7A;
const signature = new TextEncoder().encode('|-DESMUME SAVE-|');

// Recognition matches PKHeX's SaveHandlerDeSmuME. Never truncate unknown files.
export function splitSaveContainer(input) {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  if (bytes.length !== RAW_SIZE + DESMUME_FOOTER_SIZE) return {raw:bytes, footer:null, format:'raw'};
  if (!signature.every((byte, i) => bytes[bytes.length - signature.length + i] === byte)) {
    throw new Error('The file has a DeSmuME container size but no valid DeSmuME footer. Export a raw 512 KB save from the emulator.');
  }
  return {raw:bytes.subarray(0, RAW_SIZE), footer:bytes.subarray(RAW_SIZE), format:'desmume'};
}

export function joinSaveContainer(raw, container) {
  if (!container.footer) return new Uint8Array(raw);
  const output = new Uint8Array(raw.length + container.footer.length);
  output.set(raw); output.set(container.footer, raw.length);
  return output;
}

export function evolutionExportName(name = 'pokemon-save.sav') {
  const match = name.match(/(\.[^./\\]+)$/);
  const extension = match ? match[1] : '.sav';
  const base = match ? name.slice(0, -extension.length) : name;
  const previous = base.match(/^(.*)\.evolved(?:-(\d+))?$/i);
  const next = previous ? `${previous[1]}.evolved-${BigInt(previous[2] || '1') + 1n}` : `${base}.evolved`;
  return `${next}${extension}`;
}
