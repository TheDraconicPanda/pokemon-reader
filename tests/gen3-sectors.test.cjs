const {test} = require('node:test');
const assert = require('node:assert/strict');

// Independent fixture implementation: structure lengths transcribed from native
// C structs. Do not import codec constants/checksum into the fixture generator.
const lengths = [0xF24,0xF80,0xF80,0xF80,0xEE8,0xF80,0xF80,0xF80,0xF80,0xF80,0xF80,0xF80,0xF80,0x7D0];
function seal(bytes, base, length) {
  const view = new DataView(bytes.buffer);
  let sum = 0n;
  for(let i=0;i<length;i+=4) sum += BigInt(view.getUint32(base+i,true));
  sum &= 0xFFFFFFFFn;
  view.setUint16(base+0xFF6, Number(((sum>>16n)+(sum&65535n))&65535n),true);
}
function fixture(counters=[8,9], rotations=[0,3]) {
  const bytes = new Uint8Array(0x20000).fill(0xFF), view = new DataView(bytes.buffer);
  for(let slot=0;slot<2;slot++)for(let id=0;id<14;id++) {
    const base=(slot*14+(id+rotations[slot])%14)*0x1000;
    bytes.fill(id+slot*16,base,base+lengths[id]);
    view.setUint16(base+0xFF4,id,true);view.setUint32(base+0xFF8,0x08012025,true);view.setUint32(base+0xFFC,counters[slot],true);
    seal(bytes,base,lengths[id]);
  }
  return bytes;
}

test('FRLG sectors reassemble rotated IDs and exact native block lengths without changing input',async()=>{
  const {readFrlgSectors}=await import('../js/saves/gen3-sectors.js');
  for(let rotation=0;rotation<14;rotation++) {
    const bytes=fixture([8,9],[0,rotation]),before=bytes.slice(),result=readFrlgSectors(bytes);
    assert.equal(result.slot,1);assert.equal(result.counter,9);assert.deepEqual(result.validSlots,[true,true]);
    assert.equal(result.small.length,0xF24);assert.equal(result.large.length,0x3D68);assert.equal(result.storage.length,0x83D0);
    assert.equal(result.small[0],16);assert.equal(result.large[0],17);assert.equal(result.large[0xF80],18);assert.equal(result.storage[0],21);assert.equal(result.storage.at(-1),29);
    assert.deepEqual(bytes,before);
    result.small[0]=0;assert.deepEqual(bytes,before);
  }
});
test('FRLG selects complete backup for corrupt, duplicate, missing, mixed-counter or unsigned-invalid sectors',async()=>{
  const {readFrlgSectors}=await import('../js/saves/gen3-sectors.js');
  for(const corrupt of [
    (b,v)=>{b[0xE000]^=1;},
    (b,v)=>v.setUint16(0xE000+0xFF4,0xFFFF,true),
    (b,v)=>v.setUint16(0xE000+0xFF4,12,true), // duplicate another ID
    (b,v)=>v.setUint32(0xE000+0xFF8,0,true),
    (b,v)=>v.setUint32(0xE000+0xFFC,10,true),
  ]) {
    const bytes=fixture(),v=new DataView(bytes.buffer);corrupt(bytes,v);
    const result=readFrlgSectors(bytes);assert.equal(result.slot,0);assert.deepEqual(result.validSlots,[true,false]);
    bytes[0]^=1;assert.throws(()=>readFrlgSectors(bytes),/No complete/);
  }
});
test('FRLG counter selection matches native unsigned ordering and rollover in either slot',async()=>{
  const {readFrlgSectors}=await import('../js/saves/gen3-sectors.js');
  for(const [counters,slot] of [[[0xFFFFFFFF,0],1],[[0,0xFFFFFFFF],0],[[0x80000000,7],0],[[7,7],0],[[8,7],0]])assert.equal(readFrlgSectors(fixture(counters)).slot,slot);
});
test('FRLG rejects unsupported containers/sizes, accepts byte-offset views, and ignores unused tail bytes',async()=>{
  const {readFrlgSectors}=await import('../js/saves/gen3-sectors.js');
  for(const size of [0,0x10000,0x20001,0x80000])assert.throws(()=>readFrlgSectors(new Uint8Array(size)),/128 KiB/);
  const bytes=fixture(),wrapped=new Uint8Array(bytes.length+17);wrapped.set(bytes,17);
  assert.equal(readFrlgSectors(wrapped.subarray(17)).slot,1);
  // Footer padding and Hall of Fame / Trainer Tower are outside these checksums.
  bytes[0xE000+0xF80]=0;bytes[0x1C000]=0;
  assert.equal(readFrlgSectors(bytes).slot,1);
});
test('native checksum folds halves once after u32 overflow; known independent arithmetic vectors',async()=>{
  const {gen3SectorChecksum}=await import('../js/saves/gen3-sectors.js');
  assert.equal(gen3SectorChecksum(Uint8Array.from([0x78,0x56,0x34,0x12])),0x68AC);
  assert.equal(gen3SectorChecksum(new Uint8Array(8).fill(0xFF)),0xFFFD);
  assert.throws(()=>gen3SectorChecksum(new Uint8Array(3)),/complete/);
});
