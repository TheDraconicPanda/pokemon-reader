import { readFrlgSectors } from './gen3-sectors.js';
import { decodeGen3Pokemon, decodeGen3Text } from './gen3-pokemon.js';

// A valid FRLG structure identifies the family; the host version requires the
// user's explicit selection. Never infer it from filenames or traded origins.
export function detectLeafGreen(input, {confirmed = false} = {}) {
  const failure = reason => ({game:'Not detected',supported:false,valid:false,reason,activePartition:null,trainer:null,party:[],save:null});
  try {
    const blocks = readFrlgSectors(input), {small,large,storage:pc} = blocks;
    const smallView=new DataView(small.buffer),largeView=new DataView(large.buffer);
    if(small[0xAC]!==1 || small[0xAD]!==0) return failure('The save does not match the original FRLG trainer layout.');
    const flag = id => Boolean(large[0xEE0+(id>>>3)] & (1<<(id&7)));
    const badges=Array.from({length:8},(_,i)=>flag(0x820+i)?1<<i:0).reduce((a,b)=>a|b,0);
    const trainer={name:decodeGen3Text(small.subarray(0,8)),gender:small[8]===0?'Male':'Female',
      trainerId:smallView.getUint16(0xA,true),secretId:smallView.getUint16(0xC,true),
      money:(largeView.getUint32(0x290,true)^smallView.getUint32(0xF20,true))>>>0,
      badges,badgeCount:Array.from({length:8},(_,i)=>(badges>>>i)&1).reduce((a,b)=>a+b,0),
      playTime:{hours:smallView.getUint16(0xE,true),minutes:small[0x10],seconds:small[0x11]}};
    if(small[8]>1 || trainer.playTime.minutes>59 || trainer.playTime.seconds>59 || trainer.money>999999 || trainer.name.includes('�')) return failure('Invalid original-English FRLG trainer data.');
    const count=large[0x34];
    if(count>6 || pc[0]>=14) return failure('Invalid party count or current PC box.');
    const party=Array.from({length:count},(_,i)=>({...decodeGen3Pokemon(large.subarray(0x38+i*100,0x38+(i+1)*100),true),slot:i+1,recordKind:'party'}));
    const boxes=Array.from({length:14},(_,box)=>({number:box+1,name:decodeGen3Text(pc.subarray(0x8344+box*9,0x8344+(box+1)*9)) || `Box ${box+1}`,
      pokemon:Array.from({length:30},(_,slot)=>({...decodeGen3Pokemon(pc.subarray(4+(box*30+slot)*80,4+(box*30+slot+1)*80)),slot:slot+1,boxNumber:box+1,recordKind:'storage'}))}));
    const occupied=[...party,...boxes.flatMap(box=>box.pokemon)].filter(p=>!p.empty);
    if(party.some(p=>p.empty || p.level<1 || p.level>100) || occupied.some(p=>!p.checksumValid || !p.speciesId || p.moves.some(m=>m.id>354) || Object.values(p.evs).reduce((a,b)=>a+b,0)>510)) return failure('Invalid Pokémon record, checksum, identifier or EV total.');
    const storage={currentBox:pc[0],totalCount:boxes.flatMap(box=>box.pokemon).filter(p=>!p.empty).length,boxes};
    const nationalDex=small[0x1B]===0xB9 && flag(0x840) && largeView.getUint16(0x109C,true)===0x6258;
    const speciesIds=Array.from({length:nationalDex?386:151},(_,i)=>i+1);
    const has=(data,offset,id)=>Boolean(data[offset+((id-1)>>>3)]&(1<<((id-1)&7)));
    const allIds=Array.from({length:386},(_,i)=>i+1);
    // DexScreen_GetSetPokedexFlag requires all Seen copies, and Owned requires
    // that same Seen consensus. Checksum-valid edits can still violate this.
    const allSeenSpecies=allIds.filter(id=>has(small,0x5C,id)&&has(large,0x5F8,id)&&has(large,0x3A18,id));
    const allCaughtSpecies=allSeenSpecies.filter(id=>has(small,0x28,id));
    const caughtSpecies=allCaughtSpecies.filter(id=>speciesIds.includes(id)),seenSpecies=allSeenSpecies.filter(id=>speciesIds.includes(id));
    const pokedex={nationalDex,speciesIds,speciesCount:speciesIds.length,caughtSpecies,seenSpecies,allCaughtSpecies,allSeenSpecies,
      caughtCount:caughtSpecies.length,seenCount:seenSpecies.length,caughtPercent:caughtSpecies.length/speciesIds.length*100,seenPercent:seenSpecies.length/speciesIds.length*100};
    const progress={mainStoryCleared:flag(0x82C),nationalDex};
    return {game:'Pokémon LeafGreen',gameId:'leafgreen',supported:true,valid:confirmed,requiresGameConfirmation:!confirmed,
      reason:confirmed?'Valid LeafGreen save structure; game selected by you.':'FRLG save detected. Confirm that the game is original English LeafGreen.',
      activePartition:blocks.slot,decodeComplete:true,trainer,party,storage,progress,
      blockMetadata:{slot:blocks.slot,counter:blocks.counter,validSlots:blocks.validSlots,sectors:blocks.sectors},
      save:confirmed?{game:'Pokémon LeafGreen',activePartition:blocks.slot,trainer,party,storage,pokedex,progress}:null};
  } catch(error) { return failure(error.message); }
}
