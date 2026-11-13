import { readSoulSilverSafari } from './soulsilver-safari.js';
import { SOULSILVER_PROFILE } from './profiles.js';
import { detectGen4Save } from './gen4-save.js';

// Compatibility entry point for existing consumers and saved fixtures.
export function detectSoulSilver(buffer) {
  return detectGen4Save(buffer, SOULSILVER_PROFILE, {safari: readSoulSilverSafari});
}
