using PKHeX.Core;
using System.Text.Json;

object Pokemon(PKM p) => new {
 speciesId=p.Species,personality=p.PID,nickname=p.Nickname,otName=p.OriginalTrainerName,
 otId=p.TID16,secretId=p.SID16,experience=p.EXP,abilityId=p.Ability,heldItemId=p.HeldItem,
 natureId=(int)p.Nature,friendship=p.OriginalTrainerFriendship,isEgg=p.IsEgg,shiny=p.IsShiny,
 genderId=p.Gender,metLocationId=p.MetLocation,metLevel=p.MetLevel,pokeballId=p.Ball,
 languageId=p.Language,originGameId=(int)p.Version,checksumValid=p.ChecksumValid,
 moves=new[]{new{id=p.Move1,pp=p.Move1_PP,ppUps=p.Move1_PPUps},new{id=p.Move2,pp=p.Move2_PP,ppUps=p.Move2_PPUps},new{id=p.Move3,pp=p.Move3_PP,ppUps=p.Move3_PPUps},new{id=p.Move4,pp=p.Move4_PP,ppUps=p.Move4_PPUps}},
 ivs=new{hp=p.IV_HP,attack=p.IV_ATK,defense=p.IV_DEF,speed=p.IV_SPE,specialAttack=p.IV_SPA,specialDefense=p.IV_SPD},
 evs=new{hp=p.EV_HP,attack=p.EV_ATK,defense=p.EV_DEF,speed=p.EV_SPE,specialAttack=p.EV_SPA,specialDefense=p.EV_SPD}
};
if(args[0]=="inspect") {
 var sav=new SAV3FRLG(File.ReadAllBytes(args[1]));sav.ResetPersonal(GameVersion.LG);
 var party=Enumerable.Range(0,sav.PartyCount).Select(i=>Pokemon(sav.GetPartySlotAtIndex(i))).ToArray();
 var boxes=new List<object>();
 for(int b=0;b<14;b++)for(int s=0;s<30;s++){var p=sav.GetBoxSlotAtIndex(b,s);if(p.Species!=0)boxes.Add(new{box=b+1,slot=s+1,pokemon=Pokemon(p)});}
 Console.WriteLine(JsonSerializer.Serialize(new{trainer=new{name=sav.OT,trainerId=sav.TID16,secretId=sav.SID16,money=sav.Money,badges=sav.Badges,gender=sav.Gender,playTime=new{hours=sav.PlayedHours,minutes=sav.PlayedMinutes,seconds=sav.PlayedSeconds}},nationalDex=sav.NationalDex,party,boxes}));return;
}
if(args[0]=="records") {
 var rows=new List<object>();
 for(int i=0;i<434;i++){
  var p=new PK3{Species=(ushort)(i<48?(i%2==0?252:25):i-47),PID=i<24?(uint)i:i<48?0xFFFFFFE8u+(uint)(i-24):(uint)i,TID16=12345,SID16=54321,Language=2,Version=GameVersion.LG,OriginalTrainerName="Oracle",Nickname="Native",EXP=1000,Move1=33,Move1_PP=12,Move1_PPUps=2,IV_HP=31,IV_ATK=30,IV_DEF=29,IV_SPE=28,IV_SPA=27,IV_SPD=26,EV_HP=4,EV_ATK=252,EV_SPE=252,OriginalTrainerFriendship=70,Ball=4,MetLocation=88,MetLevel=5};
  p.IsEgg=i%7==0;p.RefreshChecksum();var raw=new byte[80];p.WriteEncryptedDataStored(raw);
  rows.Add(new{raw=Convert.ToBase64String(raw),expected=Pokemon(p)});
 }
 Console.WriteLine(JsonSerializer.Serialize(rows));return;
}
throw new ArgumentException("Expected inspect SAVE or records.");
