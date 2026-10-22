import { decodePlatinumGreatMarsh } from './platinum-special.js';
import { PLATINUM_PROFILE } from './profiles.js';
import { detectGen4Save } from './gen4-save.js';
export function detectPlatinum(buffer) { const result=detectGen4Save(buffer, PLATINUM_PROFILE);if(result.valid)result.greatMarsh=decodePlatinumGreatMarsh(new Uint8Array(buffer),result);return result; }
