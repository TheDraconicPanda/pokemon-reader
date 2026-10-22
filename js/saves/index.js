import { detectPlatinum } from './platinum.js';
import { detectSoulSilver } from './soulsilver.js';

// Registry is intentionally explicit: game identification never uses a filename.
const readers = Object.freeze([detectSoulSilver, detectPlatinum]);
export function detectSave(buffer) {
  let failure;
  for (const read of readers) { const result = read(buffer); if (result.valid) return result; failure ??= result; }
  if (failure && new Uint8Array(buffer).length === 0x80000) failure.reason = 'No valid supported SoulSilver or Platinum save blocks were detected.';
  return failure;
}
