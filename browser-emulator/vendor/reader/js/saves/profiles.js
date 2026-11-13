import { PLATINUM_READER } from '../data/games/platinum/reader-reference.js';
// Explicit layouts; unsupported games never inherit another game's data.
const REGIONAL_DEX = Object.freeze([
  152, 153, 154, 155, 156, 157, 158, 159, 160, 16, 17, 18, 21, 22,
  163, 164, 19, 20, 161, 162, 172, 25, 26, 10, 11, 12, 13, 14, 15,
  165, 166, 167, 168, 74, 75, 76, 41, 42, 169, 173, 35, 36, 174, 39,
  40, 175, 176, 27, 28, 23, 24, 206, 179, 180, 181, 194, 195, 92, 93,
  94, 201, 95, 208, 69, 70, 71, 187, 188, 189, 46, 47, 60, 61, 62,
  186, 129, 130, 118, 119, 79, 80, 199, 43, 44, 45, 182, 96, 97, 63,
  64, 65, 132, 204, 205, 29, 30, 31, 32, 33, 34, 193, 469, 191, 192,
  102, 103, 185, 202, 48, 49, 123, 212, 127, 214, 109, 110, 88, 89,
  81, 82, 100, 101, 190, 424, 209, 210, 37, 38, 58, 59, 234, 183,
  184, 50, 51, 56, 57, 52, 53, 54, 55, 66, 67, 68, 236, 106, 107,
  237, 203, 128, 241, 240, 126, 238, 124, 239, 125, 122, 235, 83,
  177, 178, 211, 72, 73, 98, 99, 213, 120, 121, 90, 91, 222, 223,
  224, 170, 171, 86, 87, 108, 463, 114, 465, 133, 134, 135, 136, 196,
  197, 116, 117, 230, 207, 225, 220, 221, 473, 216, 217, 231, 232,
  226, 227, 84, 85, 77, 78, 104, 105, 115, 111, 112, 198, 228, 229,
  218, 219, 215, 200, 137, 233, 113, 242, 131, 138, 139, 140, 141, 142,
  143, 1, 2, 3, 4, 5, 6, 7, 8, 9, 144, 145, 146, 243, 244, 245, 147,
  148, 149, 246, 247, 248, 249, 250, 150, 151, 251,
]);


export const SOULSILVER_PROFILE = Object.freeze({
  id: "soulsilver",
  shortName: "SoulSilver",
  regions: Object.freeze(["Johto", "Kanto"]),
  badgeCount: 16,
  footerSize: 0x10,
  partyOffset: 0x94,
  boxDataOffset: 0,
  boxNamesOffset: 0x12008,
  boxNameSize: 40,
  currentBoxOffset: 0x12000,
  totalCountOffset: 0x12004,
  pokedexOffset: 0x12B8,
  nationalFlagOffset: 0x81,
  regionalDex: REGIONAL_DEX,
  game: "Pokémon SoulSilver",
  fileSize: 0x80000,
  partitionSize: 0x40000,
  generalSize: 0xF628,
  storageOffset: 0xF700,
  storageSize: 0x12310,
  boxCount: 18,
  boxSlots: 30,
  boxSize: 0x1000,
  trainerOffset: 0x64,
  romCodeOffset: 0x1C,
  romCode: 0x08,
  magic: 0x20060623,
  koreanMagic: 0x20070903,
});


export const PLATINUM_PROFILE = Object.freeze({
  id: 'platinum', shortName: 'Platinum', game: 'Pokémon Platinum',
  regions: Object.freeze(['Sinnoh']), badgeCount: 8,
  fileSize: 0x80000, partitionSize: 0x40000,
  generalSize: 0xCF2C, storageOffset: 0xCF2C, storageSize: 0x121E4,
  footerSize: 0x14, trainerOffset: 0x68, romCodeOffset: 0x1C, romCode: 12,
  partyOffset: 0x9C, boxCount: 18, boxSlots: 30, boxSize: 0xFF0,
  boxDataOffset: 4, boxNamesOffset: 0x11EE4, boxNameSize: 40,
  currentBoxOffset: 0, totalCountOffset: null,
  pokedexOffset: 0x1328, nationalFlagOffset: 0x85,
  regionalDex: Object.freeze([...PLATINUM_READER.regional]),
  magic: 0x20060623, koreanMagic: 0x20070903,
  independentStorage: true, strictFooter: true, extendedPokemonFields: true,
});

export const LEAFGREEN_PROFILE = Object.freeze({
  id:'leafgreen',shortName:'LeafGreen',game:'Pokémon LeafGreen',generation:3,
  regions:Object.freeze(['Kanto']),badgeCount:8,fileSize:0x20000,
  boxCount:14,boxSlots:30,maxSpecies:386,maxMove:354,
  regionalDex:Object.freeze(Array.from({length:151},(_,i)=>i+1)),
});
export const GAME_PROFILES = Object.freeze({soulsilver: SOULSILVER_PROFILE, platinum: PLATINUM_PROFILE,leafgreen:LEAFGREEN_PROFILE});
export function gameProfile(id) { return GAME_PROFILES[id] || null; }
