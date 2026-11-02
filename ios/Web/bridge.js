import { decodeCartridge } from './cartridge.js';
import { boundAdventure, commitCartridge } from './profiles.js';
import { snapshotResult, selectProfile, clearActiveProfile } from '../js/adventures.js';
import { sendNative } from './host.js';
export async function installNativeReader({initialized,choose,render,refresh,clear}) {
  const config=window.__readerNativeConfig;if(!config)return;
  await initialized;
  const status=document.querySelector('#native-save-status');
  const identity=`${config.name} · ${config.rom.slice(0,12)}`;
  let epoch=0,abort=new AbortController();
  clear();
  try{const profile=await boundAdventure(config.rom);if(profile){await selectProfile(profile.id);await refresh(profile.id);await render(snapshotResult(profile.snapshot));}else await clearActiveProfile();}
  catch(error){status.textContent=`${identity} · Stored adventure could not be opened: ${error.message}`;}
  window.__readerReceive=async packet=>{
    if(packet.token!==config.token)return false;
    const generation=++epoch;abort.abort();abort=new AbortController();const signal=abort.signal;
    const isCurrent=()=>generation===epoch&&!signal.aborted;
    const dialog=document.querySelector('#adventure-match-dialog');if(dialog?.open)dialog.close('superseded');
    try{
      if(!packet.base64)throw Error('No completed in-game save yet. Save normally in-game, then reopen Reader.');
      const decoded=decodeCartridge(packet,config,new Date().toISOString());
      const calculated=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',decoded.raw)),b=>b.toString(16).padStart(2,'0')).join('');
      if(calculated!==packet.digest)throw Error('Snapshot integrity check failed.');
      if(!isCurrent())return false;
      const profile=await commitCartridge(config,decoded.snapshot,packet.digest,{choose,isCurrent,signal});
      if(!isCurrent())return false;
      if(!profile){status.textContent=`${identity} · Adventure selection cancelled. Previous profiles preserved.`;return false;}
      await refresh(profile.id);if(!isCurrent())return false;await render(decoded.result);if(!isCurrent())return false;
      const age=Math.max(0,Math.floor((Date.now()-packet.capturedAt)/60000));
      status.textContent=`${identity} · In-game save captured ${new Date(packet.capturedAt).toLocaleString()} (${age} min ago) · ${packet.origin} · Read-only copy. Save states do not refresh this data.`;
      document.body.dataset.nativeDigest=packet.digest;document.body.dataset.nativeProfile=profile.id;
      sendNative('loaded',{digest:packet.digest});return true;
    }catch(error){if(isCurrent()){status.textContent=`${identity} · ${error.message} Previous adventure data preserved.`;sendNative('error',{message:error.message});}return false;}
  };
  sendNative('ready');
}
