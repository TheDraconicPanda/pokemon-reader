// Synthetic native-layout fixtures, generated independently of production code.
// These are not real player saves and do not establish in-game acceptance.
const orders = [];
function permutations(prefix, rest) {
  if(!rest.length) orders.push(prefix);
  for(const n of rest) permutations([...prefix,n],rest.filter(i=>i!==n));
}
permutations([], [0,1,2,3]);
function pokemon({pid=0,species=277,party=false,egg=false,abilitySlot=0}={}) {
  const bytes=new Uint8Array(party?100:80),v=new DataView(bytes.buffer);
  const ot=0xAABBCCDD;
  v.setUint32(0,pid,true);v.setUint32(4,ot,true);
  bytes.fill(0xFF,8,18);bytes[8]=0xCE; // T
  bytes[18]=2;bytes[19]=2;
  bytes.fill(0xFF,20,27);bytes[20]=0xBB; // A
  const plain=new Uint8Array(48),p=new DataView(plain.buffer);
  p.setUint16(0,species,true);p.setUint16(2,13,true);p.setUint32(4,1000,true);
  plain[8]=0xE4;plain[9]=70;
  p.setUint16(12,1,true);p.setUint16(14,15,true);plain[20]=12;plain[21]=20;
  for(let i=0;i<6;i++)plain[24+i]=i*3;
  plain[31]=43;plain[36]=0x12;plain[37]=88;
  p.setUint16(38,17+(5<<7)+(4<<11)+(1<<15),true);
  p.setUint32(40,((abilitySlot?0x80000000:0)|(egg?0x40000000:0)|1|(2<<5)|(3<<10)|(4<<15)|(5<<20)|(6<<25))>>>0,true);
  p.setUint32(44,0x80000000,true);
  let sum=0;for(let i=0;i<48;i+=2)sum+=p.getUint16(i,true);v.setUint16(28,sum&65535,true);
  for(let physical=0;physical<4;physical++) {
    const logical=orders[pid%24][physical];
    for(let word=0;word<3;word++)v.setUint32(32+physical*12+word*4,(p.getUint32(logical*12+word*4,true)^pid^ot)>>>0,true);
  }
  if(party){bytes[84]=10;v.setUint16(86,22,true);v.setUint16(88,30,true);for(let i=0;i<5;i++)v.setUint16(90+i*2,31+i,true);}
  return bytes;
}
const lengths=[0xF24,0xF80,0xF80,0xF80,0xEE8,0xF80,0xF80,0xF80,0xF80,0xF80,0xF80,0xF80,0xF80,0x7D0];
function save({national=false,counters=[5,6],rotations=[0,5],partyCount=1,badgeMask=5,cleared=false}={}) {
  const bytes=new Uint8Array(0x20000).fill(0xFF),view=new DataView(bytes.buffer);
  for(let slot=0;slot<2;slot++) {
    const small=new Uint8Array(0xF24),large=new Uint8Array(0x3D68),pc=new Uint8Array(0x83D0);
    const sv=new DataView(small.buffer),lv=new DataView(large.buffer);
    small.fill(0xFF,0,8);small[0]=0xBB;small[0xAC]=1;
    sv.setUint16(0xA,12345,true);sv.setUint16(0xC,54321,true);sv.setUint16(0xE,25,true);small[0x10]=30;small[0x11]=45;
    sv.setUint32(0xF20,0x12345678,true);lv.setUint32(0x290,(50000^0x12345678)>>>0,true);
    large[0x34]=partyCount;
    for(let i=0;i<Math.min(partyCount,6);i++)large.set(pokemon({party:true,pid:i}),0x38+i*100);
    large[0xEE0+(0x820>>>3)]=badgeMask;
    if(cleared)large[0xEE0+(0x82C>>>3)]|=1<<(0x82C&7);
    if(national){small[0x1B]=0xB9;large[0xEE0+(0x840>>>3)]|=1<<(0x840&7);lv.setUint16(0x109C,0x6258,true);}
    small[0x28]=1;small[0x5C]=3;small[0x28+31]=8;small[0x5C+31]=8;
    large.set(small.subarray(0x5C,0x5C+52),0x5F8);large.set(small.subarray(0x5C,0x5C+52),0x3A18);
    pc[0]=13;pc.set(pokemon({species:410,pid:7}),4+419*80);
    for(let box=0;box<14;box++){pc.fill(0xFF,0x8344+box*9,0x8344+(box+1)*9);pc[0x8344+box*9]=0xBC;}
    const parts=[small,...[0,1,2,3].map(i=>large.subarray(i*0xF80,Math.min((i+1)*0xF80,large.length))),...[0,1,2,3,4,5,6,7,8].map(i=>pc.subarray(i*0xF80,Math.min((i+1)*0xF80,pc.length)))];
    for(let id=0;id<14;id++) {
      const base=(slot*14+(id+rotations[slot])%14)*0x1000;
      bytes.set(parts[id],base);view.setUint16(base+0xFF4,id,true);view.setUint32(base+0xFF8,0x08012025,true);view.setUint32(base+0xFFC,counters[slot],true);
      let sum=0n;for(let i=0;i<lengths[id];i+=4)sum+=BigInt(view.getUint32(base+i,true));sum&=0xFFFFFFFFn;
      view.setUint16(base+0xFF6,Number(((sum>>16n)+(sum&65535n))&65535n),true);
    }
  }
  return bytes;
}
function editSector(bytes,id,edit) {
 const view=new DataView(bytes.buffer);
 for(let i=0;i<28;i++) {
  const base=i*0x1000;if(view.getUint16(base+0xFF4,true)!==id)continue;
  edit(bytes.subarray(base,base+lengths[id]));
  let sum=0n;for(let k=0;k<lengths[id];k+=4)sum+=BigInt(view.getUint32(base+k,true));sum&=0xFFFFFFFFn;
  view.setUint16(base+0xFF6,Number(((sum>>16n)+(sum&65535n))&65535n),true);
 }
 return bytes;
}
module.exports={pokemon,save,editSector};
