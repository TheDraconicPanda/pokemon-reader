// SPDX-License-Identifier: GPL-3.0-or-later
// No network storage. Each transaction atomically retains current and previous.
export async function digest(bytes){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(v=>v.toString(16).padStart(2,'0')).join('');}
export class Store {
  constructor(db,owner=crypto.randomUUID()){this.db=db;this.owner=owner;}
  static async open(){return new Promise((resolve,reject)=>{
    const r=indexedDB.open('reader-browser-b1',1);
    r.onupgradeneeded=()=>{for(const n of ['roms','saves','leases'])r.result.createObjectStore(n);};
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
