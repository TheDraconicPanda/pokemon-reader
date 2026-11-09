const {syntheticSave}=require('../soulsilver.cjs');
const {vectors,evolutionFixture}=require('./evolution.cjs');
const api=Promise.all([import('../../../js/saves/trade-transaction.js'),import('../../../js/saves/index.js'),import('../../../js/saves/gen4-pokemon.js'),import('../../../js/saves/gen4-record-writer.js'),import('../../../js/saves/gen4-binary.js'),import('../../../js/saves/profiles.js')]);
async function fixture(vector=vectors[0]){
 const [, {detectSave},{decryptGen4Record},{writeGen4Record},{writeUint16,crc16Ccitt},{SOULSILVER_PROFILE:profile,PLATINUM_PROFILE:ptProfile}]=await api;
 const pt=(await evolutionFixture(vector)).bytes;
 pt[0x40000+0x1328+0x31A]=1;
 writeUint16(pt,0x40000+0xCF2C-2,crc16Ccitt(pt.subarray(0x40000,0x40000+0xCF2C-20)));
 const synthetic=syntheticSave(),ss=synthetic.bytes;
 ss[0x7D]=vector.gameLanguage;ss[profile.pokedexOffset+0x336]=1;
 ss[0x94]=2;
 // Independent PKHeX vector supplies an actual trade-evolution record.
 const party=detectSave(pt).party[0],logical=decryptGen4Record(pt.subarray(party.saveOffset,party.saveOffset+236),true);
 writeGen4Record(ss,logical,0x98,'party',profile,0);
 writeGen4Record(ss,logical,0x98+236,'party',profile,0);
 // Leave distinct non-Egg companions on both sides.
 const companion=decryptGen4Record(syntheticSave().bytes.subarray(0x98,0x98+236),true);
 writeGen4Record(ss,companion,0x98+236,'party',profile,0);
 pt[0x40000+0x9C]=2;
 writeGen4Record(pt,companion,0x40000+0xA0+236,'party',ptProfile,1);
 synthetic.sealBlock(0,profile.generalSize);
 return {ss,pt,vector};
}
async function patch(bytes,slot,transform){
 const [, {detectSave},{decryptGen4Record},{writeGen4Record},, {gameProfile}]=await api;
 const result=detectSave(bytes),p=result.party.find(p=>p.slot===slot),profile=gameProfile(result.gameId||'soulsilver');
 const logical=decryptGen4Record(bytes.subarray(p.saveOffset,p.saveOffset+236),true);transform(logical);
 writeGen4Record(bytes,logical,p.saveOffset,'party',profile,result.activePartition);return bytes;
}
module.exports={fixture,patch};
