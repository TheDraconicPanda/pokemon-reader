import {GEN4_TRADE_ITEMS} from '../data/gen4-trade-items.js';
import {detectSave} from './index.js';
import {gameProfile} from './profiles.js';
import {splitSaveContainer,joinSaveContainer} from './gen4-container.js';
import {decryptGen4Record,decryptGen4PartyPokemon} from './gen4-pokemon.js';
import {writeGen4Record} from './gen4-record-writer.js';
import {readUint16,writeUint16,crc16Ccitt} from './gen4-binary.js';
import {getAvailableEvolutions} from './gen4-evolution.js';
import {gen4AbilityForPid} from './gen4-abilities.js';
import {recalculatePartyStats} from './gen4-stats.js';
import {registerTradePokemon} from './trade-pokedex.js';
import {GEN4_DEFAULT_NAMES} from '../data/gen4-default-names.js';
import {PLATINUM_READER as reference} from '../data/games/platinum/reader-reference.js';
import {SOULSILVER_POKEDEX as ss} from '../data/games/soulsilver/pokedex-reference.js';
import {PLATINUM_POKEDEX as pt} from '../data/games/platinum/pokedex-reference.js';

const forms={172:2,201:28,386:4,412:3,413:3,422:2,423:2,479:6,487:2,492:2,493:18};
const formKeys={386:[386,496,497,498],413:[413,499,500],479:[479,503,504,505,506,507],487:[487,501],492:[492,502]};
const statNames=['hp','attack','defense','special-attack','special-defense','speed'];
export const tradeHmMoves = gameId => [15,19,57,70,127,249,431,gameId==='soulsilver'?250:432];
export const tradeSpeciesName = id => ss.species[id]?.name || `Pokémon #${id}`;
export const tradeMoveName = id => reference.moves[id]?.name || `Move #${id}`;
export const tradeItemName = id => id ? reference.items[id] || `Item #${id}` : 'None';

export function loadTradeSave(input) {
  const container=splitSaveContainer(input), source=detectSave(container.raw);
  if(!source.valid || source.decodeComplete===false) throw new Error('Load a complete, valid SoulSilver or Platinum save.');
  const gameId=source.gameId || 'soulsilver';
  if(!['soulsilver','platinum'].includes(gameId)) throw new Error('Trade supports SoulSilver and Platinum only.');
  const profile=gameProfile(gameId), base=source.activePartition*profile.partitionSize;
  const all=[...source.party,...source.storage.boxes.flatMap(b=>b.pokemon)].filter(p=>!p.empty);
  if(all.some(p=>!p.checksumValid || p.speciesId<1 || p.speciesId>493 || Object.values(p.evs).reduce((s,n)=>s+n,0)>510)) throw new Error('A Pokémon record is corrupt. No trade can be exported.');
  if(!container.raw[base+profile.pokedexOffset+(gameId==='soulsilver'?0x336:0x31A)]) throw new Error('Obtain the Pokédex in this game before using the communication room.');
  const party=source.party.map(p=>({...p,...decryptGen4PartyPokemon(container.raw.subarray(p.saveOffset,p.saveOffset+236),true)}));
  if(party.length<2) throw new Error('Bring at least two Pokémon in your party; another non-Egg must remain when you trade.');
  for(const p of party) {
    if(p.speciesId===172 && p.formId===1) throw new Error('Spiky-eared Pichu cannot enter the communication room. Put it in a PC box and save again.');
    if(p.heldItemId===112) throw new Error('Remove the Griseous Orb from your party before trading, then save again.');
    if([479,487,492].includes(p.speciesId) && p.formId) throw new Error('Return party Rotom, Giratina and Shaymin to their base forms in-game before trading, then save again.');
  }
  return {container,source,gameId,profile,base,party};
}

export function tradeEligibility(save, slot) {
  const p=save.party.find(p=>p.slot===slot);
  if(!p) return 'Choose a party Pokémon.';
  if(!save.party.some(q=>q.slot!==slot && !q.isEgg)) return 'Another non-Egg Pokémon must remain in this party.';
  if((p.formId??0)>=(forms[p.speciesId]??1)) return 'This form is invalid for Generation IV.';
  if(p.moves.some(m=>m.id<0 || m.id>467 || m.ppUps>3 || m.pp>(reference.moves[m.id]?.basePP??0)*((5+m.ppUps)/5))) return 'The saved move data is invalid.';
  if(p.heldItemId && !GEN4_TRADE_ITEMS.has(p.heldItemId)) return 'This held item is not supported in these games.';
  const key=formKeys[p.speciesId]?.[p.formId??0]??p.speciesId;
  const personal=(save.gameId==='soulsilver'?ss:pt).species[key];
  if(!p.isEgg && !personal?.abilities.includes(p.abilityId)) return 'This Pokémon has an invalid ability. Check or repair it in Reader before trading.';
  if(p.level<1 || p.level>100) return 'The saved level is invalid.';
  return null;
}

function receipt(from,to,slot,date) {
  const reason=tradeEligibility(from,slot); if(reason) throw new Error(reason);
  const mon=from.party.find(p=>p.slot===slot), logical=decryptGen4Record(from.container.raw.subarray(mon.saveOffset,mon.saveOffset+236),true);
  const hgss=to.gameId==='soulsilver', data=hgss?ss:pt;
  const originalSpecies=mon.speciesId;
  const rule=getAvailableEvolutions(mon,to.gameId).find(r=>r.method==='trade'||r.method==='trade-item') || null;
  if(!mon.isEgg) { logical[0x14]=70; if(hgss) logical[0x87]=0; }
  if(mon.isEgg) {
    if(!/^20\d\d-\d\d-\d\d$/.test(date || '') || Number.isNaN(Date.parse(date+'T00:00:00Z')) || new Date(date+'T00:00:00Z').toISOString().slice(0,10)!==date) throw new Error('Choose the receiving console date (2000–2099) for the Egg trade.');
    const [year,month,day]=date.split('-').map(Number);
    logical.set([year-2000,month,day],0x7B); writeUint16(logical,0x46,2002);writeUint16(logical,0x80,2002);
  }
  logical[0x8D]=0; logical.fill(0,0xD4,0xEC); // capsule ID and seal coordinates
  const species=rule?.to??originalSpecies;
  const key=formKeys[species]?.[mon.formId??0]??species;
  const personal=data.species[key];
  if(!personal) throw new Error('The receiving game has no verified data for this species/form.');
  const ratio=reference.species[key]?.genderRatio??reference.species[species]?.genderRatio;
  const gender=ratio===255?2:ratio===254?1:ratio===0?0:(mon.personality&255)<ratio?1:0;
  logical[0x40]=(logical[0x40]&~6)|(gender<<1);
  if(rule) {
    writeUint16(logical,8,species); if(rule.consumesItem) writeUint16(logical,10,0);
    logical[0x15]=gen4AbilityForPid(mon.personality,personal.abilities);
    if(!mon.isNicknamed) {
      const language=to.container.raw[to.base+to.profile.trainerOffset+0x19];
      const name=GEN4_DEFAULT_NAMES[language]?.[species];
      if(!name) throw new Error('The receiving save language has no verified evolution name.');
      logical.fill(0,0x48,0x5E);name.forEach((v,i)=>writeUint16(logical,0x48+2*i,v));
    }
    recalculatePartyStats(logical,personal.stats.map((base_stat,i)=>({base_stat,stat:{name:statNames[i]}})),mon.maxHp,mon.currentHp);
  }
  const prompts=rule ? personal.levelMoves.filter(([level,id])=>level===mon.level&&!mon.moves.some(m=>m.id===id)).map(([,id])=>id) : [];
  return {logical,mon,originalSpecies,species,rule,gender,prompts,languageId:logical[0x17]};
}

// Preview and commit both reparse original bytes; no caller-supplied identity,
// evolution, item, or replacement data is trusted.
export function previewTrade(inputA,inputB,slotA,slotB,dates={}) {
  const a=loadTradeSave(inputA), b=loadTradeSave(inputB);
  if(a.gameId===b.gameId) throw new Error('This release requires one SoulSilver save and one Platinum save.');
  const languageA=a.container.raw[a.base+a.profile.trainerOffset+0x19],languageB=b.container.raw[b.base+b.profile.trainerOffset+0x19];
  if((languageA===8)!==(languageB===8)) throw new Error('Direct local trades require both games to be Korean or both non-Korean.');
  const toA=receipt(b,a,slotB,dates.a),toB=receipt(a,b,slotA,dates.b);
  return {a,b,toA,toB};
}

function learnMoves(receipt,choices=[],gameId) {
  const record=receipt.logical;
  for(const [index,id] of receipt.prompts.entries()) {
    const current=Array.from({length:4},(_,slot)=>readUint16(record,0x28+slot*2));
    if(current.includes(id)) continue;
    const empty=current.indexOf(0),choice=empty>=0?empty:choices[index];
    if(choice==='skip') continue;
    if(!Number.isInteger(choice)||choice<0||choice>3) throw new Error(`Choose a move to replace or decline ${tradeMoveName(id)}.`);
    if(empty<0 && tradeHmMoves(gameId).includes(current[choice])) throw new Error('An HM move cannot be forgotten during evolution.');
    writeUint16(record,0x28+choice*2,id);record[0x30+choice]=reference.moves[id].basePP;record[0x34+choice]=0;
  }
}

function writeReceipt(save,received,slot,choices) {
  const output=new Uint8Array(save.container.raw),outgoing=save.party.find(p=>p.slot===slot);
  learnMoves(received,choices,save.gameId);
  const dex=save.base+save.profile.pokedexOffset;
  const original={...received.mon,genderId:received.gender,languageId:received.languageId};
  registerTradePokemon(output,dex,original,save.gameId==='soulsilver');
  if(received.rule) registerTradePokemon(output,dex,{...original,speciesId:received.species,formId:0},save.gameId==='soulsilver');
  if(save.gameId==='soulsilver') output.fill(0,save.base+save.profile.partyOffset+4+6*236+(slot-1)*5,save.base+save.profile.partyOffset+4+6*236+slot*5);
  writeGen4Record(output,received.logical,outgoing.saveOffset,'party',save.profile,save.source.activePartition);
  // Includes Dex and Aprijuice changes in the general checksum.
  const end=save.base+save.profile.generalSize;
  writeUint16(output,end-2,crc16Ccitt(output.subarray(save.base,end-save.profile.footerSize)));
  const verified=detectSave(output),actual=verified.party?.find(p=>p.slot===slot);
  if(!verified.valid || actual?.personality!==received.mon.personality || actual?.speciesId!==received.species || !actual?.checksumValid) throw new Error('The traded save failed validation. Neither save was exported.');
  const roundtrip=decryptGen4Record(output.subarray(outgoing.saveOffset,outgoing.saveOffset+236),true);
  if(received.logical.some((byte,i)=>i!==6&&i!==7&&roundtrip[i]!==byte)) throw new Error('The incoming Pokémon failed byte validation. Neither save was exported.');
  return joinSaveContainer(output,save.container);
}

export function tradeSaves(inputA,inputB,slotA,slotB,{dates={},movesA=[],movesB=[]}={}) {
  const preview=previewTrade(inputA,inputB,slotA,slotB,dates);
  const a=writeReceipt(preview.a,preview.toA,slotA,movesA),b=writeReceipt(preview.b,preview.toB,slotB,movesB);
  return {a,b};
}
export function tradeExportName(name,side) {
  const match=name.match(/^(.*?)(\.[^./\\]+)?$/);return `${match[1]}.traded-${side}${match[2]||'.sav'}`;
}
