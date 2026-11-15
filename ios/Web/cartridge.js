import { detectSave } from '../js/saves/index.js';
import { createSnapshot } from '../js/adventures.js';
const requireValue=(value,message)=>{if(!value)throw Error(message);};
export function decodeCartridge(packet,config,loadedAt) {
  requireValue(packet.rom===config.rom && packet.game===config.game,'Snapshot belongs to another ROM.');
  requireValue(['soulsilver','platinum'].includes(packet.game),'Unsupported cartridge.');
  requireValue(Number.isSafeInteger(packet.capturedAt)&&packet.capturedAt>0&&packet.capturedAt<=8640000000000000,'Invalid save capture time.');
  requireValue(/^[a-f0-9]{64}$/.test(packet.digest),'Missing snapshot identity.');
  requireValue([0,1].includes(packet.general)&&[0,1].includes(packet.storage),'Invalid committed save blocks.');
  const raw=Uint8Array.from(atob(packet.base64),c=>c.charCodeAt(0));
  requireValue(raw.length===0x80000,'Expected a 512 KiB cartridge save.');
  const ss=packet.game==='soulsilver',footer=ss?16:20,general=ss?0xF628:0xCF2C,pcAt=ss?0xF700:0xCF2C,pc=ss?0x12310:0x121E4;
  const view=new DataView(raw.buffer);
  function block(partition,at,size,id) {
    const start=partition*0x40000+at,end=start+size;
    requireValue(view.getUint32(end-12,true)===size&&[0x20060623,0x20070903].includes(view.getUint32(end-8,true))&&raw[end-4]===id&&(!ss||raw[end-3]===0),'Invalid cartridge footer.');
    let crc=0xFFFF;for(let i=start;i<end-footer;i++){crc^=raw[i]<<8;for(let bit=0;bit<8;bit++)crc=((crc<<1)^((crc&0x8000)?0x1021:0))&0xFFFF;}
    requireValue(crc===view.getUint16(end-2,true),'Cartridge checksum failed.');
    return {bytes:raw.slice(start,end),counter:view.getUint32(end-footer,true)};
  }
  const g=block(packet.general,0,general,0),s=block(packet.storage,pcAt,pc,1);
  requireValue(g.counter===s.counter&&(!ss||packet.general===packet.storage),'Cartridge save is unfinished.');
  requireValue(g.bytes[ss?0x80:0x84]===(ss?8:12),'Cartridge game does not match this ROM.');
  // Decode the exact committed blocks. Duplicate them in a read-only copy so the
  // shared Reader's historical HGSS partition heuristic cannot select old data.
  // This copy is never exported or written back to the emulated cartridge.
  const canonical=raw.slice();for(const p of [0,0x40000]){canonical.set(g.bytes,p);canonical.set(s.bytes,p+pcAt);}
  const result=detectSave(canonical.buffer);
  requireValue(result.valid && (result.gameId||'soulsilver')===packet.game,'Reader rejected the cartridge save.');
  return {raw,result,snapshot:createSnapshot(result,`${config.name} · in-game save`,loadedAt)};
}
