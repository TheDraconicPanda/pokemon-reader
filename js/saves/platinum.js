import { PLATINUM_PROFILE } from './profiles.js';
import { detectGen4Save } from './gen4-save.js';
export function detectPlatinum(buffer) { return detectGen4Save(buffer, PLATINUM_PROFILE); }
