const fs=require('node:fs');
const path=require('node:path');
const vectors=require('./evolution-vectors.json').vectors;
const oracle=require('./evolution-oracle.json');
const byLabel=new Map(oracle.map(row=>[row.label,row]));
async function evolutionFixture(vector,kind='party'){
 const {crc16Ccitt}=await import('../../../js/saves/gen4-binary.js');
 const bytes=new Uint8Array(fs.readFileSync(path.join(__dirname,'platinum/postgame.sav')));
 const row=byLabel.get(vector.label),base=0x40000;
 bytes[base+0x81]=vector.gameLanguage;
 const offset=base+(kind==='party'?0xA0:0xCF30);
 bytes.set(Buffer.from(kind==='party'?row.party:row.stored,'base64'),offset);
 if(row.companion&&!vector.missingParty)bytes.set(Buffer.from(row.companion,'base64'),base+0xA0+236);
 const view=new DataView(bytes.buffer);
 for(const [start,size]of [[base,0xCF2C],[base+0xCF2C,0x121E4]])view.setUint16(start+size-2,crc16Ccitt(bytes.subarray(start,start+size-20)),true);
 return {bytes,offset,oracle:row,vector,kind};
}
function comparePokemon(actual,reference,party){
 const assert=require('node:assert/strict');
 const keys=Object.keys(reference).filter(k=>party||!['level','currentHp','maxHp','status','stats'].includes(k));
 const result=Object.fromEntries(keys.map(k=>[k,k==='formId'?(actual[k]??0):actual[k]]));
 assert.deepEqual(result,Object.fromEntries(keys.map(k=>[k,reference[k]])));
}
function dsv(raw){const footer=Uint8Array.from({length:122},(_,i)=>(i*37)&255);footer.set(Buffer.from('|-DESMUME SAVE-|'),122-Buffer.byteLength('|-DESMUME SAVE-|'));const bytes=new Uint8Array(raw.length+122);bytes.set(raw);bytes.set(footer,raw.length);return bytes;}
module.exports={vectors,evolutionFixture,comparePokemon,dsv};
