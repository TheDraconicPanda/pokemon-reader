// SPDX-License-Identifier: GPL-3.0-or-later
// No network storage. Each transaction atomically retains current and previous.
export const STATE_SCHEMA=1;
export const STATE_MAJOR=13;
export const STATE_MINOR=0;
export async function digest(bytes){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(v=>v.toString(16).padStart(2,'0')).join('');}
function validStateBytes(bytes,meta,romHash,slot,coreRevision){
  if(!(bytes instanceof Uint8Array)||bytes.length<16||bytes.length>64*1024*1024)return false;
  if(String.fromCharCode(...bytes.subarray(0,4))!=='MELN')return false;
  const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
  return view.getUint16(4,true)===STATE_MAJOR&&view.getUint16(6,true)<=STATE_MINOR&&
    view.getUint32(8,true)===bytes.length&&meta?.schema===STATE_SCHEMA&&meta?.length===bytes.length&&
    meta?.romHash===romHash&&meta?.slot===slot&&meta?.coreRevision===coreRevision&&
    meta?.major===STATE_MAJOR&&meta?.minor===view.getUint16(6,true);
}
export class Store {
  constructor(db,owner=crypto.randomUUID()){this.db=db;this.owner=owner;}
  static async open(name='reader-browser-b1'){return new Promise((resolve,reject)=>{
    const r=indexedDB.open(name,2);
    r.onupgradeneeded=()=>{for(const n of ['roms','saves','leases','states'])if(!r.result.objectStoreNames.contains(n))r.result.createObjectStore(n);};
    r.onsuccess=()=>resolve(new Store(r.result));r.onerror=()=>reject(r.error);
    r.onblocked=()=>reject(Error('Close other B1 windows before opening storage.'));
  });}
  get(store,key){return new Promise((resolve,reject)=>{const r=this.db.transaction(store).objectStore(store).get(key);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
  put(store,key,value){return new Promise((resolve,reject)=>{const tx=this.db.transaction(store,'readwrite');tx.objectStore(store).put(value,key);tx.oncomplete=resolve;tx.onabort=()=>reject(tx.error||Error('Storage transaction aborted'));});}
  lease(key,release=false,exclusiveLock=false){return new Promise((resolve,reject)=>{
    const tx=this.db.transaction('leases','readwrite'),s=tx.objectStore('leases'),r=s.get(key);let denied=false;
    r.onsuccess=()=>{const old=r.result;if(!exclusiveLock&&old&&old.owner!==this.owner&&old.until>Date.now()){denied=true;tx.abort();return;}
      if(release)s.delete(key);else s.put({owner:this.owner,until:Date.now()+20000},key);};
    tx.oncomplete=resolve;tx.onabort=()=>reject(denied?Error('This ROM is open in another B1 window. Close it and wait 20 seconds.'):tx.error||Error('Storage lease failed'));
  });}
  async save(key,bytes,revision){
    const snapshot={bytes:new Uint8Array(bytes),hash:await digest(bytes),at:Date.now(),revision};
    return new Promise((resolve,reject)=>{
      const tx=this.db.transaction(['saves','leases'],'readwrite');let denied=false;
      const lease=tx.objectStore('leases').get(key);
      lease.onsuccess=()=>{if(lease.result?.owner!==this.owner||lease.result.until<Date.now()){denied=true;tx.abort();return;}
        const s=tx.objectStore('saves'),r=s.get(key);r.onsuccess=()=>s.put({current:snapshot,previous:r.result?.current},key);
      };
      tx.oncomplete=()=>resolve(snapshot);tx.onabort=()=>reject(denied?Error('Save writer lost its storage lease; pause and reopen.'):tx.error||Error('Save transaction aborted'));
    });
  }
  async loadSave(key){const record=await this.get('saves',key);if(!record)return null;
    for(const name of ['current','previous']){const s=record[name];if(s&&s.hash===await digest(s.bytes))return {...s,recovered:name==='previous'};}
    throw Error('Stored save checksums failed. Import an exported backup; existing records were preserved.');
  }
  async saveState(romHash,slot,bytes,metadata){
    if(!['auto','quick'].includes(slot))throw Error('Unknown emulator checkpoint slot.');
    const data=new Uint8Array(bytes),at=Date.now();
    const meta={...metadata,schema:STATE_SCHEMA,romHash,slot,length:data.length,at};
    if(!validStateBytes(data,meta,romHash,slot,meta.coreRevision))throw Error('Core produced an invalid or incompatible full-state checkpoint.');
    const snapshot={bytes:data,hash:await digest(data),meta};
    const recordKey=`${romHash}:${slot}`;
    return new Promise((resolve,reject)=>{
      const tx=this.db.transaction(['states','leases'],'readwrite');let denied=false;
      const lease=tx.objectStore('leases').get(romHash);
      lease.onsuccess=()=>{if(lease.result?.owner!==this.owner||lease.result.until<Date.now()){denied=true;tx.abort();return;}
        const states=tx.objectStore('states'),r=states.get(recordKey);
        r.onsuccess=()=>states.put({current:snapshot,previous:r.result?.current},recordKey);
      };
      tx.oncomplete=()=>resolve(snapshot);tx.onabort=()=>reject(denied?Error('Checkpoint writer lost its ROM storage lease.'):tx.error||Error('Full-state checkpoint transaction aborted'));
    });
  }
  async loadState(romHash,slot,coreRevision){
    if(!['auto','quick'].includes(slot))throw Error('Unknown emulator checkpoint slot.');
    const record=await this.get('states',`${romHash}:${slot}`);if(!record)return null;
    for(const name of ['current','previous']){
      const state=record[name];if(!state||!validStateBytes(state.bytes,state.meta,romHash,slot,coreRevision))continue;
      if(state.hash===await digest(state.bytes))return {...state,recovered:name==='previous'};
    }
    throw Error(`The ${slot==='quick'?'Quick Save':'automatic recovery'} checkpoint is corrupt or incompatible. The stored record was preserved.`);
  }
  async stateOptions(romHash,coreRevision){
    const options={};
    for(const slot of ['auto','quick']){
      try{const state=await this.loadState(romHash,slot,coreRevision);if(state)options[slot]={at:state.meta.at,recovered:state.recovered,length:state.meta.length};}
      catch(error){options[slot]={error:error.message};}
    }
    return options;
  }
}
export class SaveQueue {
  constructor(commit,notify=()=>{}){this.commit=commit;this.notify=notify;this.pending=null;this.running=null;this.error=null;}
  enqueue(bytes,revision){this.pending={bytes:new Uint8Array(bytes),revision};return this.flush();}
  async flush(){if(this.running)return this.running;
    this.running=(async()=>{while(this.pending){const item=this.pending;this.pending=null;
      const start=performance.now();this.notify({state:'writing',revision:item.revision});
      try{await this.commit(item.bytes,item.revision);this.error=null;this.notify({state:'persisted',revision:item.revision,ms:performance.now()-start,at:Date.now()});}
      catch(error){if(!this.pending)this.pending=item;this.error=error;this.notify({state:'failed',revision:item.revision,ms:performance.now()-start});throw error;}
    }})();
    try{return await this.running;}finally{this.running=null;}
  }
}
export class StateQueue {
  constructor(commit,notify=()=>{}){this.commit=commit;this.notify=notify;this.pending=null;this.running=null;this.error=null;}
  enqueue(bytes,metadata){this.pending={bytes:new Uint8Array(bytes),metadata:{...metadata}};return this.flush();}
  async flush(){if(this.running)return this.running;
    this.running=(async()=>{while(this.pending){const item=this.pending;this.pending=null;const start=performance.now();
      this.notify({state:'writing',at:Date.now()});
      try{const saved=await this.commit(item.bytes,item.metadata);this.error=null;this.notify({state:'persisted',at:saved.meta.at,ms:performance.now()-start,captureMs:item.metadata.captureMs,length:saved.meta.length,recovered:false});}
      catch(error){if(!this.pending)this.pending=item;this.error=error;this.notify({state:'failed',at:Date.now(),message:error.message,ms:performance.now()-start,captureMs:item.metadata.captureMs,length:item.bytes.length});throw error;}
    }})();
    try{return await this.running;}finally{this.running=null;}
  }
}
