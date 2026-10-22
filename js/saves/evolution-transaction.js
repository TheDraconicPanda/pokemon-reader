import { detectSave } from './index.js';
import { gameProfile } from './profiles.js';
import { splitSaveContainer, joinSaveContainer } from './gen4-container.js';
import { evolveGen4Pokemon, getAvailableEvolutions } from './gen4-evolution.js';
import { PLATINUM_READER as platinum } from '../data/games/platinum/reader-reference.js';
import { GEN4_DEFAULT_NAMES } from '../data/gen4-default-names.js';
import { savedLevel } from '../pokemon-level.js';
import { SOULSILVER_POKEDEX as soulSilver } from '../data/games/soulsilver/pokedex-reference.js';
import { decryptGen4Record, decryptGen4PartyPokemon, decryptGen4StoredPokemon, decodeTrainerName } from './gen4-pokemon.js';
import { writeUint16, crc16Ccitt } from './gen4-binary.js';
import { gen4AbilityForPid } from './gen4-abilities.js';

const records = result => [...result.party, ...result.storage.boxes.flatMap(box => box.pokemon)];
const statNames = ['hp','attack','defense','special-attack','special-defense','speed'];

// A transaction starts from freshly validated bytes, never from presentation data.
// Only after every prerequisite, PK4 and save block validates do bytes reach export.
export function evolveSavePokemon(input, displayed, selected, context = {}) {
  const container = splitSaveContainer(input);
  const source = detectSave(container.raw);
  if (!source.valid || source.decodeComplete === false) throw new Error('Reload a complete validated save before evolving.');
  if (records(source).some(p => !p.empty && (!p.checksumValid || p.speciesId < 1 || p.speciesId > 493 || Object.values(p.evs).reduce((sum,n)=>sum+n,0) > 510))) throw new Error('The source contains a corrupt Pokémon record. No changes were made.');
  const gameId = source.gameId || 'soulsilver', profile = gameProfile(gameId);
  const actual = records(source).find(p => !p.empty && p.saveOffset === displayed?.saveOffset && p.recordKind === displayed?.recordKind);
  if (!actual || ['personality','speciesId','heldItemId','otId','secretId','experience'].some(key => actual[key] !== displayed[key])) {
    throw new Error('The save record no longer matches the displayed Pokémon. Reload the save and try again.');
  }
  if (JSON.stringify(actual.moves.map(({id,pp,ppUps}) => [id,pp,ppUps])) !== JSON.stringify(displayed.moves?.map(({id,pp,ppUps}) => [id,pp,ppUps]))) {
    throw new Error('The saved moves changed. Reload the save before evolving.');
  }
  const pokemon = {...actual, level:savedLevel(actual)};
  if (pokemon.isEgg || !Number.isInteger(pokemon.level) || pokemon.level < 1 || pokemon.level > 100) throw new Error('This Pokémon cannot use the evolution simulator.');
  const sourceLogical = decryptGen4Record(container.raw.subarray(actual.saveOffset,actual.saveOffset+(actual.recordKind==='party'?236:136)),actual.recordKind==='party');
  if (sourceLogical[0x40] >>> 3) throw new Error('This source form cannot use the evolution simulator.');
  if (actual.moves.some(move=>move.id<0||move.id>467||move.ppUps>3)) throw new Error('The saved move data is invalid. No export was created.');
  const trustedContext = {time:context.time, party:source.party};
  const rule = getAvailableEvolutions(pokemon, gameId, trustedContext).find(r => r.to === selected?.to && r.method === selected?.method);
  if (!rule) throw new Error('This Pokémon does not meet the selected evolution requirements.');
  if (rule.requiredTime && context.time !== rule.requiredTime) throw new Error(`Choose ${rule.requiredTime} as the simulated game time for this evolution.`);

  const target = gameId === 'platinum' ? platinum.species[rule.to] : soulSilver.species[rule.to];
  const baseStats = target?.stats?.map((base_stat, index) => ({base_stat,stat:{name:statNames[index]}}));
  let transform, evolvedGender = actual.genderId, expectedAbility, expectedNickname = actual.nickname;
  {
    if (!target || target.stats?.length !== 6 || !target.stats.every(n=>Number.isInteger(n)&&n>0&&n<=255) || !target.abilities?.length) throw new Error('The evolved species data could not be validated.');
    const language = container.raw[source.activePartition * profile.partitionSize + profile.trainerOffset + 0x19];
    const name = actual.isNicknamed ? null : GEN4_DEFAULT_NAMES[language]?.[rule.to];
    if (!actual.isNicknamed && (!name || name.length > 11 || name.at(-1) !== 0xFFFF)) throw new Error('The save language has no verified default species name. No export was created.');
    // Gender thresholds are intrinsic Gen IV species data in both games.
    expectedAbility = gen4AbilityForPid(actual.personality, target.abilities);
    if (expectedAbility === null) throw new Error('The evolved ability could not be established. No changes were made.');
    if (name) {
      const encoded = new Uint8Array(name.length * 2); name.forEach((value,i)=>writeUint16(encoded,i*2,value));
      expectedNickname = decodeTrainerName(encoded,0,encoded.length);
    }
    const ratio = target.genderRatio ?? platinum.species[rule.to]?.genderRatio;
    evolvedGender = ratio === 255 ? 2 : ratio === 254 ? 1 : ratio === 0 ? 0 : (actual.personality & 0xFF) < ratio ? 1 : 0;
    transform = logical => {
      logical[0x40] = (logical[0x40] & ~0x06) | (evolvedGender << 1);
      logical[0x15] = expectedAbility;
      if (name) name.forEach((value, i) => writeUint16(logical, 0x48 + i * 2, value));
    };
  }

  const output = evolveGen4Pokemon(container.raw, pokemon, rule, source.activePartition, baseStats, profile, {
    context:trustedContext, transform, storagePartition:source.activeStoragePartition ?? source.activePartition,
  });
  {
    registerEvolution(output, source.activePartition * profile.partitionSize + profile.pokedexOffset, {...pokemon, genderId:evolvedGender}, rule.to);
    const base = source.activePartition * profile.partitionSize, end = base + profile.generalSize;
    writeUint16(output, end - 2, crc16Ccitt(output.subarray(base, end - profile.footerSize)));
  }
  const verified = detectSave(output);
  const evolved = verified.valid && records(verified).find(p => p.saveOffset === actual.saveOffset && p.recordKind === actual.recordKind);
  if (!evolved || evolved.speciesId !== rule.to || !evolved.checksumValid || rule.consumesItem && evolved.heldItemId !== 0) throw new Error('The generated save failed validation. No export was created.');
  const packet = output.subarray(actual.saveOffset, actual.saveOffset + (actual.recordKind === 'party' ? 236 : 136));
  const interpreted = actual.recordKind === 'party' ? decryptGen4PartyPokemon(packet,true) : decryptGen4StoredPokemon(packet,true);
  if (interpreted.abilityId !== expectedAbility || interpreted.genderId !== evolvedGender || interpreted.nickname !== expectedNickname) throw new Error('The evolved identity failed validation. No export was created.');
  for (const key of ['personality','otId','secretId','experience','friendship','isEgg','isNicknamed','metLocationId','eggLocationId','metLevel','pokeballId']) {
    if (interpreted[key] !== actual[key]) throw new Error('Unrelated Pokémon identity changed. No export was created.');
  }
  for (const key of ['moves','ivs','evs']) if (JSON.stringify(interpreted[key]) !== JSON.stringify(actual[key])) throw new Error('Unrelated Pokémon training data changed. No export was created.');
  const before = sourceLogical;
  const after = decryptGen4Record(packet,actual.recordKind==='party');
  const allowed = new Set([6,7,8,9,21,64]);
  if (rule.consumesItem) { allowed.add(10); allowed.add(11); }
  if (!actual.isNicknamed) for (let i=0x48;i<0x5E;i++) allowed.add(i);
  if (actual.recordKind==='party') for (let i=0x8E;i<=0x9B;i++) allowed.add(i);
  if ((before[0x40]&~6)!==(after[0x40]&~6) || before.some((byte,i)=>!allowed.has(i)&&byte!==after[i])) throw new Error('Unrelated Pokémon bytes changed. No export was created.');
  return joinSaveContainer(output, container);
}

function registerEvolution(bytes, dex, pokemon, species) {
  const bit = species - 1, index = bit >> 3, mask = 1 << (bit & 7);
  const caught = dex + 4 + index, seen = caught + 0x40;
  const first = caught + 0x80, second = caught + 0xC0;
  const wasSeen = Boolean(bytes[seen] & mask), female = pokemon.genderId === 1;
  const setGender = offset => { bytes[offset] = female ? bytes[offset] | mask : bytes[offset] & ~mask; };
  if (!wasSeen) { setGender(first); setGender(second); }
  else if (Boolean(bytes[first] & mask) !== female) setGender(second);
  bytes[caught] |= mask; bytes[seen] |= mask;
}
