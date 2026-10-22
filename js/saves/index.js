import { splitSaveContainer } from './gen4-container.js';
import { detectPlatinum } from './platinum.js';
import { detectSoulSilver } from './soulsilver.js';

// Registry is intentionally explicit: game identification never uses a filename.
const readers = Object.freeze([detectSoulSilver, detectPlatinum]);
export function detectSave(buffer) {
  let container;
  try { container = splitSaveContainer(buffer); }
  catch (error) { return {game:'Not detected', supported:false, valid:false, reason:error.message, activePartition:null, trainer:null, party:[], save:null}; }
  buffer = container.raw;
  let failure;
  for (const read of readers) { const result = read(buffer); if (result.valid) { if (container.footer) result.container = {format:container.format, footerLength:container.footer.length}; return result; } failure ??= result; }
  if (failure && new Uint8Array(buffer).length === 0x80000) failure.reason = 'No valid supported SoulSilver or Platinum save blocks were detected.';
  return failure;
}
