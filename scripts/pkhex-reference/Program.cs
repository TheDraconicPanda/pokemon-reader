using PKHeX.Core;
using System.Buffers.Binary;
using System.Text.Json;

object Pokemon(PKM p) => new {
 speciesId=p.Species, personality=p.PID, nickname=p.Nickname, otName=p.OriginalTrainerName,
 otId=p.TID16, secretId=p.SID16, experience=p.EXP, abilityId=p.Ability, heldItemId=p.HeldItem,
 formId=p.Form, genderId=p.Gender, shiny=p.IsShiny, isEgg=p.IsEgg, isNicknamed=p.IsNicknamed,
 natureId=(int)p.Nature, friendship=p.OriginalTrainerFriendship, metLocationId=p.MetLocation,
 eggLocationId=p.EggLocation, pokeballId=p.Ball, metLevel=p.MetLevel,
 level=p.Stat_Level, currentHp=p.Stat_HPCurrent, maxHp=p.Stat_HPMax, status=p.Status_Condition,
 stats=new {attack=p.Stat_ATK,defense=p.Stat_DEF,speed=p.Stat_SPE,specialAttack=p.Stat_SPA,specialDefense=p.Stat_SPD},
 moves=new[]{new{id=p.Move1,pp=p.Move1_PP,ppUps=p.Move1_PPUps},new{id=p.Move2,pp=p.Move2_PP,ppUps=p.Move2_PPUps},new{id=p.Move3,pp=p.Move3_PP,ppUps=p.Move3_PPUps},new{id=p.Move4,pp=p.Move4_PP,ppUps=p.Move4_PPUps}},
 ivs=new {hp=p.IV_HP,attack=p.IV_ATK,defense=p.IV_DEF,speed=p.IV_SPE,specialAttack=p.IV_SPA,specialDefense=p.IV_SPD},
 evs=new {hp=p.EV_HP,attack=p.EV_ATK,defense=p.EV_DEF,speed=p.EV_SPE,specialAttack=p.EV_SPA,specialDefense=p.EV_SPD},
 checksumValid=p.ChecksumValid
};
if (args[0]=="read") {
 var raw=File.ReadAllBytes(args[1]);var sav=new SAV4Pt(raw);
 var pcs=new List<object>();for(int b=0;b<18;b++)for(int s=0;s<30;s++){var p=sav.GetBoxSlotAtIndex(b,s);if(p.Species!=0)pcs.Add(new{box=b+1,slot=s+1,pokemon=Pokemon(p)});}
 Console.WriteLine(JsonSerializer.Serialize(new {trainer=new{name=sav.OT,trainerId=sav.TID16,secretId=sav.SID16,money=sav.Money,gender=sav.Gender==0?"Male":"Female",badges=sav.Badges,playTime=new{hours=sav.PlayedHours,minutes=sav.PlayedMinutes,seconds=sav.PlayedSeconds}},party=Enumerable.Range(0,sav.PartyCount).Select(i=>Pokemon(sav.GetPartySlotAtIndex(i))),pc=pcs,checksumsValid=sav.ChecksumsValid}));
 return;
}
if(args[0]!="generate")throw new ArgumentException("Use generate DIRECTORY or read SAVE");
Directory.CreateDirectory(args[1]);
for(int stage=0;stage<3;stage++){
 var raw=new byte[0x80000];
 for(int partition=0;partition<2;partition++){
  int start=partition*0x40000;
  var sav=new SAV4Pt(raw);sav.OT=new[]{"Dawn","Lucas","Cynthia"}[stage];sav.TID16=(ushort)(12345+stage);sav.SID16=(ushort)(54321-stage);sav.Money=(uint)(3000+stage*10000);sav.Gender=(byte)(stage%2);sav.Badges=(byte)new[]{0,21,255}[stage];sav.PlayedHours=stage*123;sav.PlayedMinutes=stage*17;sav.PlayedSeconds=stage*23;
  // Trainer is copied from PKHeX's decoded general buffer, through export.
  var written=sav.Write();written.Span[..0xCF2C].CopyTo(raw.AsSpan(start,0xCF2C));
  raw[start+0x84]=12;raw[start+0x85]=(byte)(stage==2?3:0);
  raw[start+0x9C]=(byte)(stage+1);
  // Cartridge BoxPokemon_Init stores an encrypted empty record, not raw zeros.
  var empty = new PK4();
  for(int slot=0;slot<540;slot++)empty.WriteEncryptedDataStored(raw.AsSpan(start+0xCF30+slot*136,136));
  for(int i=0;i<=stage;i++){
   var p=new PK4{Species=(ushort)(i==0?387:i==1?95:487),PID=(uint)(i==0?(stage==0?0:0x12345678):i==1?0x00010001:((12345^54321)<<16)),TID16=12345,SID16=54321,Language=2,Version=GameVersion.Pt,OriginalTrainerName="Dawn",Nickname=i==1?"Röcky":i==2?"Giratina":"Turtwig",IsNicknamed=i==1,Ability=i==0?65:i==1?69:26,Gender=(byte)(i==2?2:0),HeldItem=i==1?233:0,Move1=33,Move1_PP=17,Move1_PPUps=2,Move2=237,Move2_PP=12,Move2_PPUps=1,IV_HP=31,IV_ATK=30,IV_DEF=29,IV_SPE=28,IV_SPA=27,IV_SPD=26,EV_HP=4,EV_ATK=252,EV_SPE=252,MetLevel=5,MetLocation=16,Ball=4};
   if(i==2)p.Form=1;
   p.MetYear=0;p.MetMonth=1;p.MetDay=2;
   p.CurrentLevel=(byte)(10+stage*20+i);p.ResetPartyStats();p.Stat_HPCurrent=i==2?0:p.Stat_HPMax-3;p.Status_Condition=i==2?8:0;
   if(i==2)p.Form=1;
   p.RefreshChecksum();p.WriteEncryptedDataParty(raw.AsSpan(start+0xA0+i*236,236));
   p.IsEgg=i==1;p.WriteEncryptedDataStored(raw.AsSpan(start+0xCF30+i*30*136+29*136,136));
  }
  // A counted registration is independent of ownership; put #387 in dex.
  raw[start+0x1328+4+48]|=4;raw[start+0x1328+4+64+48]|=4;
  foreach(var block in new[]{(offset:0,size:0xCF2C,id:0),(offset:0xCF2C,size:0x121E4,id:1)}){
   var footer=raw.AsSpan(start+block.offset+block.size-20,20);
   BinaryPrimitives.WriteUInt32LittleEndian(footer,(uint)(stage+1));BinaryPrimitives.WriteUInt32LittleEndian(footer[4..],(uint)(partition+1));BinaryPrimitives.WriteUInt32LittleEndian(footer[8..],(uint)block.size);BinaryPrimitives.WriteUInt32LittleEndian(footer[12..],0x20060623);footer[16]=(byte)block.id;
   BinaryPrimitives.WriteUInt16LittleEndian(footer[18..],Checksums.CRC16_CCITT(raw.AsSpan(start+block.offset,block.size-20)));
  }
 }
 File.WriteAllBytes(Path.Combine(args[1],new[]{"early","middle","postgame"}[stage]+".sav"),raw);
}

var shuffleCases = new List<object>();
for(int index=0;index<32;index++){
 var p=new PK4 {Species=25,PID=(uint)(index==0?0:(index<<13)|1),TID16=42,SID16=84,Language=2,Version=GameVersion.Pt,Nickname="Pikachu",OriginalTrainerName="Oracle",Gender=1,Ability=9,Move1=84,Move1_PP=29,Move1_PPUps=3,IV_HP=31,IV_DEF=17,EV_SPE=252,MetLocation=16,Ball=4};
 p.CurrentLevel=25;p.ResetPartyStats();p.RefreshChecksum();
 var stored=new byte[136];var party=new byte[236];p.WriteEncryptedDataStored(stored);p.WriteEncryptedDataParty(party);
 shuffleCases.Add(new{index,stored=Convert.ToBase64String(stored),party=Convert.ToBase64String(party),expected=Pokemon(p)});
}
File.WriteAllText(Path.Combine(args[1],"shuffles.json"),JsonSerializer.Serialize(shuffleCases));
