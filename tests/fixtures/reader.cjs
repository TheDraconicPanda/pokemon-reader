// Synthetic parsed records for UI tests only. These do not validate the binary parser.
const pokemon = (slot, speciesId, nickname, extra = {}) => ({
 slot, speciesId, nickname, empty:false, personality:0, natureId:0, abilityId:9,
 experience:1000, level:10, gender:'Male', currentHp:25, maxHp:50, status:0,
 heldItemId:0, otName:'Original', otId:123, secretId:456, metLevel:5,
 metLocationId:1, pokeballId:4, metDate:{year:2020,month:1,day:1},
 ivs:{hp:31,attack:30,defense:29,speed:28,specialAttack:27,specialDefense:26},
 evs:{hp:1,attack:2,defense:3,speed:4,specialAttack:5,specialDefense:6},
 stats:{attack:20,defense:21,speed:22,specialAttack:23,specialDefense:24},
 moves:[{id:1,pp:20,ppUps:2},{id:0},{id:0},{id:0}], ...extra
});
function fixture(name='Test Trainer') {
 const party=[pokemon(1,25,'Sparky',{shiny:true}),pokemon(3,133,'Buddy')];
 const storage={currentBox:0,boxes:Array.from({length:18},(_,i)=>({number:i+1,name:`Box ${i+1}`,pokemon:Array.from({length:30},(_,j)=>({slot:j+1,empty:true}))}))};
 storage.boxes[0].pokemon[4]=pokemon(5,25,'Thunder',{recordKind:'storage'});
 storage.boxes[17].pokemon[29]=pokemon(30,133,'Egg friend',{isEgg:true});
 const pokedex={nationalDex:true,speciesIds:[25,133,152],seenSpecies:[25,133],caughtSpecies:[25],speciesCount:3,seenCount:2,caughtCount:1,seenPercent:2/3*100,caughtPercent:1/3*100};
 const trainer={name,trainerId:123,secretId:456,gender:'Male',money:5000,playTime:{hours:12,minutes:34,seconds:0},badges:[],badgeCount:0};
 return {valid:true,game:'Pokémon SoulSilver',activePartition:0,reason:'Valid SoulSilver save structure detected.',party,storage,save:{trainer,pokedex}};
}
module.exports={fixture};
