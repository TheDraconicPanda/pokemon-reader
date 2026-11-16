const fs=require('node:fs'),path=require('node:path');
const {syntheticSave}=require('../../tests/fixtures/soulsilver.cjs');
(async()=>{
  const {detectSave}=await import('../../js/saves/index.js');
  const folder=process.argv[2];
  for(const game of ['soulsilver','platinum'])for(const [which,counter]of [['before',1],['after',2]]){
    let data,sourceGeneral=0,sourceStorage=0;
    if(game==='soulsilver')data=syntheticSave(which==='before'?25:133).bytes;
    else{data=new Uint8Array(fs.readFileSync(path.join(__dirname,'../../tests/fixtures/gen4/platinum',which==='before'?'early.sav':'middle.sav')));const result=detectSave(data);sourceGeneral=result.activePartition;sourceStorage=result.activeStoragePartition;}
    const ss=game==='soulsilver',general=ss?0xF628:0xCF2C,storageAt=ss?0xF700:0xCF2C,storage=ss?0x12310:0x121E4,footer=ss?16:20;
    const generalBytes=data.slice(sourceGeneral*0x40000,sourceGeneral*0x40000+general),pcBytes=data.slice(sourceStorage*0x40000+storageAt,sourceStorage*0x40000+storageAt+storage);
    if(!ss&&which==='after'){
      // Existing synthetic stage fixtures have different trainers. This sequence
      // models one trainer saving twice while retaining the later party/PC.
      const early=new Uint8Array(fs.readFileSync(path.join(__dirname,'../../tests/fixtures/gen4/platinum/early.sav'))),start=detectSave(early).activePartition*0x40000+0x68;
      generalBytes.set(early.slice(start,start+0x14),0x68);generalBytes[0x80]=early[start+0x18];
      let crc=0xFFFF;for(let i=0;i<general-footer;i++){crc^=generalBytes[i]<<8;for(let bit=0;bit<8;bit++)crc=((crc<<1)^((crc&0x8000)?0x1021:0))&0xFFFF;}
      new DataView(generalBytes.buffer).setUint16(general-2,crc,true);
    }
    for(const partition of [0,0x40000]){data.set(generalBytes,partition);data.set(pcBytes,partition+storageAt);const view=new DataView(data.buffer);
      for(const [start,size,id]of [[partition,general,0],[partition+storageAt,storage,1]]){view.setUint32(start+size-footer,counter,true);if(!ss)view.setUint32(start+size-footer+4,counter,true);data[start+size-4]=id;data[start+size-3]=0;}}
    fs.writeFileSync(path.join(folder,`reader-${game}-${which}.sav`),data);
  }
})();
