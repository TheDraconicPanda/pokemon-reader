import { LEAFGREEN_READER as reference } from '../data/games/leafgreen/reader-reference.js';

// Canonical Growth/Attacks/EVs/Misc -> physical block positions, transcribed
// from native GetSubstruct. Generation III uses PID % 24 (not Gen IV's shuffle).
const POSITIONS = Object.freeze([
  [0,1,2,3],[0,1,3,2],[0,2,1,3],[0,3,1,2],[0,2,3,1],[0,3,2,1],
  [1,0,2,3],[1,0,3,2],[2,0,1,3],[3,0,1,2],[2,0,3,1],[3,0,2,1],
  [1,2,0,3],[1,3,0,2],[2,1,0,3],[3,1,0,2],[2,3,0,1],[3,2,0,1],
  [1,2,3,0],[1,3,2,0],[2,1,3,0],[3,1,2,0],[2,3,1,0],[3,2,1,0],
]);
const STATS = ['hp','attack','defense','speed','specialAttack','specialDefense'];
const viewOf = bytes => new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

export function decodeGen3Text(bytes, languageId = 2) {
  const characters = languageId === 1 ? reference.japaneseCharacters : reference.characters;
  let result = '';
  for (const byte of bytes) {
    if (byte === 0xFF) break;
    result += characters[byte] ?? '�';
  }
  return result;
}

export function decodeGen3Pokemon(input, party = false) {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  if (bytes.length !== (party ? 100 : 80)) throw new Error('Invalid PK3 record length.');
  if (bytes.every(byte => byte === 0)) return {empty:true};
  const view = viewOf(bytes), pid = view.getUint32(0, true), ot = view.getUint32(4, true);
  const key = (pid ^ ot) >>> 0, decrypted = new Uint8Array(48), raw = viewOf(decrypted);
  for(let i=0;i<48;i+=4) raw.setUint32(i, (view.getUint32(32+i,true) ^ key) >>> 0,true);
  let checksum = 0;
  for(let i=0;i<48;i+=2) checksum = (checksum + raw.getUint16(i,true)) & 0xFFFF;
  const canonical = new Uint8Array(48);
  POSITIONS[pid % 24].forEach((physical, logical) => canonical.set(decrypted.subarray(physical*12,physical*12+12), logical*12));
  const data = viewOf(canonical), nativeSpeciesId = data.getUint16(0,true);
  if (!(bytes[19] & 2) && nativeSpeciesId === 0 && checksum === view.getUint16(28,true)) return {empty:true};
  const speciesId = reference.nativeSpecies[nativeSpeciesId] ?? null;
  const species = reference.species[speciesId], ivBits = data.getUint32(40,true), origins = data.getUint16(38,true);
  const isEgg = Boolean(ivBits & 0x40000000), languageId = bytes[18];
  const abilitySlot = ivBits >>> 31;
  const moves = Array.from({length:4}, (_, i) => ({id:data.getUint16(12+i*2,true),pp:canonical[20+i],ppUps:(canonical[8] >>> (i*2)) & 3}));
  const result = {
    empty:false, checksumValid:checksum === view.getUint16(28,true) && !(bytes[19]&1),
    nativeSpeciesId, speciesId, personality:pid, otId:ot&0xFFFF, secretId:ot>>>16,
    heldItemId:data.getUint16(2,true), experience:data.getUint32(4,true), friendship:canonical[9],
    abilityId:species ? species.abilities[abilitySlot] : null,
    abilitySlot, isEgg, languageId,
    genderId:species?.genderRatio===255 ? 2 : species?.genderRatio===254 ? 1 : species ? ((pid&255)<species.genderRatio ? 1 : 0) : null,
    nickname:decodeGen3Text(bytes.subarray(8,18),languageId),
    otName:decodeGen3Text(bytes.subarray(20,27),languageId),
    natureId:pid%25, shiny:((pid ^ (pid>>>16) ^ ot ^ (ot>>>16)) & 0xFFFF) < 8,
    moves, evs:Object.fromEntries(STATS.map((stat,i)=>[stat,canonical[24+i]])),
    ivs:Object.fromEntries(STATS.map((stat,i)=>[stat,(ivBits >>> (i*5))&31])),
    pokerus:canonical[36], metLocationId:canonical[37], metLevel:origins&127,
    originGameId:(origins>>>7)&15, pokeballId:(origins>>>11)&15, otGenderId:origins>>>15,
    fatefulEncounter:Boolean(data.getUint32(44,true)&0x80000000), contestBeauty:canonical[31],
    formId:speciesId===201 ? (((pid>>>24)&3)*64+((pid>>>16)&3)*16+((pid>>>8)&3)*4+(pid&3))%28 : speciesId===386 ? 2 : null,
  };
  if(party) Object.assign(result,{
    status:view.getUint32(80,true),level:bytes[84],currentHp:view.getUint16(86,true),maxHp:view.getUint16(88,true),
    stats:Object.fromEntries(STATS.slice(1).map((stat,i)=>[stat,view.getUint16(90+i*2,true)])),
  });
  return result;
}


// Rebuild a native PK3 after changing only its personality value. The search
// preserves nature, gender, ability slot, Unown form and Wurmple's evolution
// branch. Spinda's visible spot pattern is encoded across the PID, so editing
// its shiny state is deliberately refused rather than silently changing it.
export function setGen3PokemonShiny(input, desiredShiny, party = false) {
  const bytes = input instanceof Uint8Array ? new Uint8Array(input) : new Uint8Array(input);
  const original = decodeGen3Pokemon(bytes, party);
  if (original.empty || !original.checksumValid || !Number.isInteger(original.speciesId)) {
    throw new Error('The Pokémon record is empty, invalid or has a bad checksum.');
  }
  if (original.shiny === Boolean(desiredShiny)) return bytes;
  if (original.speciesId === 327) {
    throw new Error("Spinda's spot pattern is encoded in its personality value; its shiny status cannot be changed without changing its appearance.");
  }
  const species = reference.species[original.speciesId];
  if (!species) throw new Error('The species metadata required to preserve this Pokémon is unavailable.');
  const view = viewOf(bytes), oldPid = view.getUint32(0, true), ot = view.getUint32(4, true);
  const trainerXor = ((ot & 0xFFFF) ^ (ot >>> 16)) & 0xFFFF;
  const targetXor = desiredShiny ? 0 : 8;
  let nextPid = null;
  for (let low = 0; low <= 0xFFFF; low++) {
    const high = low ^ trainerXor ^ targetXor;
    const candidate = (((high << 16) | low) >>> 0);
    if (candidate % 25 !== original.natureId) continue;
    const ratio = species.genderRatio;
    const gender = ratio === 255 ? 2 : ratio === 254 ? 1 : ((candidate & 0xFF) < ratio ? 1 : 0);
    if (gender !== original.genderId) continue;
    if (original.speciesId === 201) {
      const form = ((((candidate >>> 24) & 3) * 64) + (((candidate >>> 16) & 3) * 16) +
        (((candidate >>> 8) & 3) * 4) + (candidate & 3)) % 28;
      if (form !== original.formId) continue;
    }
    if (original.speciesId === 265 && candidate % 10 !== oldPid % 10) continue;
    nextPid = candidate;
    break;
  }
  if (nextPid === null) throw new Error('No safe personality value preserves this Pokémon’s nature, gender and form. No save was changed.');

  const key = (oldPid ^ ot) >>> 0;
  const physical = new Uint8Array(48), encryptedView = viewOf(bytes), physicalView = viewOf(physical);
  for (let offset = 0; offset < 48; offset += 4) {
    physicalView.setUint32(offset, (encryptedView.getUint32(32 + offset, true) ^ key) >>> 0, true);
  }
  const canonical = new Uint8Array(48);
  POSITIONS[oldPid % 24].forEach((physicalIndex, logicalIndex) =>
    canonical.set(physical.subarray(physicalIndex * 12, physicalIndex * 12 + 12), logicalIndex * 12));
  let checksum = 0;
  const canonicalView = viewOf(canonical);
  for (let offset = 0; offset < 48; offset += 2) checksum = (checksum + canonicalView.getUint16(offset, true)) & 0xFFFF;

  const output = bytes.slice(), outputView = viewOf(output);
  outputView.setUint32(0, nextPid, true);
  outputView.setUint16(28, checksum, true);
  const shuffled = new Uint8Array(48);
  POSITIONS[nextPid % 24].forEach((physicalIndex, logicalIndex) =>
    shuffled.set(canonical.subarray(logicalIndex * 12, logicalIndex * 12 + 12), physicalIndex * 12));
  const nextKey = (nextPid ^ ot) >>> 0, shuffledView = viewOf(shuffled);
  for (let offset = 0; offset < 48; offset += 4) {
    outputView.setUint32(32 + offset, (shuffledView.getUint32(offset, true) ^ nextKey) >>> 0, true);
  }
  const verified = decodeGen3Pokemon(output, party);
  if (!verified.checksumValid || verified.shiny !== Boolean(desiredShiny) ||
      verified.natureId !== original.natureId || verified.genderId !== original.genderId ||
      verified.abilitySlot !== original.abilitySlot || verified.formId !== original.formId) {
    throw new Error('The updated Pokémon record failed identity validation. No save was changed.');
  }
  return output;
}
