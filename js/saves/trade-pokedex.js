import {readUint32, writeUint16} from './gen4-binary.js';

function writeUint32(bytes,offset,value) {
  writeUint16(bytes,offset,value); writeUint16(bytes,offset+2,value>>>16);
}

// Native Pokedex_Capture / Pokedex_SetMonCaughtFlag layouts. Registration is
// monotonic: trading away never clears history, and Eggs register on hatching.
export function registerTradePokemon(bytes, dex, mon, hgss) {
  if (mon.isEgg) return;
  const species = mon.speciesId, bit = species - 1, index = bit >> 3, mask = 1 << (bit & 7);
  const seen = dex + 0x44 + index, wasSeen = Boolean(bytes[seen] & mask);
  const gender = mon.genderId === 1 ? 1 : 0;
  const setGender = offset => { bytes[offset] = gender ? bytes[offset] | mask : bytes[offset] & ~mask; };
  if (!wasSeen) { setGender(dex + 0x84 + index); setGender(dex + 0xC4 + index); }
  else if (Boolean(bytes[dex + 0x84 + index] & mask) !== Boolean(gender)) setGender(dex + 0xC4 + index);
  if (!wasSeen && species === 327) writeUint32(bytes, dex + 0x104, mon.personality);
  const language = [1,2,3,5,4,7].indexOf(mon.languageId);
  if (language >= 0) bytes[dex + (hgss ? 0x144 : 0x128) + species] |= 1 << language;
  const form = mon.formId ?? 0;
  const append = (offset, count, width, value, sentinel) => {
    let packed = width === 3 ? readUint32(bytes, offset) : bytes[offset];
    const values = Array.from({length:count}, (_,i)=>(packed >>> (i*width)) & ((1<<width)-1));
    if (values.includes(value)) return;
    const slot = values.indexOf(sentinel);
    if (slot < 0) return;
    packed = (packed & ~(((1<<width)-1) << (slot*width))) | (value << (slot*width));
    if (width === 3) writeUint32(bytes,offset,packed >>> 0); else bytes[offset]=packed;
  };
  if (species === 201) {
    for (const start of hgss ? [0x10C,0x128] : [0x10C]) {
      const values = bytes.subarray(dex+start,dex+start+28);
      if (!values.includes(form)) { const slot=values.indexOf(255); if(slot>=0) bytes[dex+start+slot]=form; }
    }
  }
  if ([422,423,487,492].includes(species)) {
    const offset = {422:0x108,423:0x109,487:hgss?0x33D:0x321,492:hgss?0x33C:0x320}[species];
    if (!wasSeen) bytes[dex+offset]=(bytes[dex+offset]&~3)|(form ? 3 : 0);
    else if ((bytes[dex+offset]&1)!==form) bytes[dex+offset]=(bytes[dex+offset]&~2)|(form<<1);
  }
  if (species===412 || species===413) append(dex+(species===412?0x10A:0x10B),3,2,form,3);
  if (species===172 && hgss) append(dex+0x33E,3,2,gender,3);
  if (species===479) append(dex+(hgss?0x338:0x31C),6,3,form,7);
  if (species===386) {
    const offsets=[0x43,0x43,0x83,0x83];
    const values=offsets.map((o,i)=>(bytes[dex+o]>>>((i%2)*4))&15);
    if(!values.includes(form)){ const slot=values.indexOf(15); if(slot>=0) bytes[dex+offsets[slot]]=(bytes[dex+offsets[slot]]&~(15<<((slot%2)*4)))|(form<<((slot%2)*4)); }
  }
  bytes[dex+4+index]|=mask; bytes[seen]|=mask;
}
