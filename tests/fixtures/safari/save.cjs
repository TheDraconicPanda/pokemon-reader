// Synthetic, not a real-game save. Literal offsets are independently transcribed
// from the format sources in docs/safari-save-sources.json, not imported from code.
const {syntheticSave}=require('../soulsilver.cjs');
function safariSave({partition=0}={}){
 const fixture=syntheticSave(),{bytes,sealBlock}=fixture,view=new DataView(bytes.buffer);
 const layout=[11,4,1,7,3,6],ages=[0,10,20,30,40,50,60,110,80,90,100,255];
 layout.forEach((area,i)=>{bytes[0xC13C+122*i]=area;bytes[0xC13D+122*i]=i===0?3:0;});
 bytes.set([0,2,3,4,6,5,6,7,12,8,9,10],0xC13E); // shrubbery, small rock, bench
 bytes.set(ages,0xC418);bytes[0xC735]=4;bytes[0xC734]=0;
 view.setUint16(0xE92,6,true);bytes[0x81]|=2;sealBlock(0,0xF628);
 if(partition===1){bytes.copyWithin(0x40000,0,0xF628);bytes.copyWithin(0x4F700,0xF700,0x21A10);bytes[0x4F614]=1;sealBlock(0x40000,0xF628);}
 return {...fixture,layout,ages};
}
module.exports={safariSave};
