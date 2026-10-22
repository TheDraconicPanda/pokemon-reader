import { detectSoulSilver } from './soulsilver.js';

// Registry is intentionally explicit: game identification never uses a filename.
const readers = Object.freeze([detectSoulSilver]);
export function detectSave(buffer) {
  let failure;
  for (const read of readers) { const result = read(buffer); if (result.valid) return result; failure ??= result; }
  return failure;
}
