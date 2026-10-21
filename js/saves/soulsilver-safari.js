// Read-only HGSS fields; callers use the Reader's already-validated partition.
// Offsets and their independent derivation: docs/safari-save-initialization.md.
import { SOULSILVER_SAFARI_MECHANICS as rules } from '../data/games/soulsilver/safari-mechanics.js';
const uint=(v,max)=>Number.isInteger(v)&&v>=0&&v<=max;
const clone=v=>JSON.parse(JSON.stringify(v));
const validArray=(v,length,predicate)=>Array.isArray(v)&&v.length===length&&Array.from(v).every(predicate);
const categories=['plains','forest','peak','water','none'];
export function sanitizeSafariSave(input){
 if(input?.schemaVersion!==1||input.supported!==true)return {supported:false,reason:'Safari fields are unavailable in this adventure. Reload a save or supply them manually.'};
 const out={schemaVersion:1,supported:true,evidence:'hgss-safari-save-v1'};
 for(const [field,max]of Object.entries({baobaStage:7,blockLevel:4,activeSet:1,pendingDays:255}))out[field]=uint(input[field],max)?input[field]:null;
 out.layout=validArray(input.layout,6,v=>uint(v,11))&&new Set(input.layout).size===6?[...input.layout]:null;
 out.areaAges=validArray(input.areaAges,12,v=>uint(v,255))?[...input.areaAges]:null;
 out.areaObjects=Array.from({length:6},(_,i)=>{
  const objects=input.areaObjects?.[i];
  if(!Array.isArray(objects)||objects.length>30||!Array.from(objects).every(o=>o&&uint(o.id,23)&&['x','y','z'].every(k=>uint(o[k],255))))return null;
  return objects.map(o=>({id:o.id,x:o.x,y:o.y,z:o.z}));
 });
 out.areaBlocks=Array.from({length:6},(_,i)=>{
  const objects=out.areaObjects[i];if(objects===null)return null;
  const blocks=Object.fromEntries(categories.map(c=>[c,0]));
  for(const object of objects)blocks[rules.objects[object.id].category]++;
  return blocks;
 });
 // A linked set has separate timers/ownership and expiry semantics. Do not
 // initialize it with the local trainer's areas or quietly treat it as local.
 if(out.activeSet!==0){out.layout=null;out.areaAges=null;out.areaBlocks.fill(null);out.areaObjects.fill(null);}
 out.reason=out.activeSet!==0?'Linked or invalid active Safari selection: use manual configuration.':'Stored counters are read as saved; elapsed time and pending days are not applied automatically.';
 return clone(out);
}
export function readSoulSilverSafari(data,partition){
 if(!(data instanceof Uint8Array)||data.length!==0x80000||![0,1].includes(partition))return {supported:false,reason:'A validated SoulSilver partition is required.'};
 const base=partition*0x40000,zone=base+0xC13C,view=new DataView(data.buffer,data.byteOffset,data.byteLength);
 const packed=data[zone+0x5F9],activeSet=packed>>>6;
 const layout=Array.from({length:6},(_,i)=>data[zone+i*0x7A]);
 const areaObjects=Array.from({length:6},(_,i)=>{
  const offset=zone+i*0x7A,count=data[offset+1];if(count>30)return null;
  return Array.from({length:count},(_,j)=>{const o=offset+2+j*4;return {id:data[o],x:data[o+1],y:data[o+2],z:data[o+3]};});
 });
 return sanitizeSafariSave({schemaVersion:1,supported:true,activeSet,blockLevel:packed&0x3F,pendingDays:data[zone+0x5F8],baobaStage:view.getUint16(base+0xE92,true),layout,areaObjects,areaAges:Array.from(data.subarray(zone+0x2DC,zone+0x2E8))});
}
