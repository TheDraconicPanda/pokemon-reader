import { getActiveProfile, subscribeAdventureChanges } from './adventures.js';
import { caughtRegistrations, speciesReference } from './data/game-reference.js';

const iconUrl=new URL('../assets/icons/caught-gen4.svg',import.meta.url).href;
export function mountCaughtIndicators({gameId,root,status}) {
  let caught=new Set(), revision=0;
  function update(node) {
    const registered=node.dataset.speciesGame===gameId && caught.has(Number(node.dataset.speciesId));
    const marker=node.querySelector('.caught-indicator');
    if(registered && !marker) {
      const icon=document.createElement('img');icon.className='caught-indicator';
      icon.src=iconUrl;icon.width=12;icon.height=12;icon.alt='Registered caught';icon.title='Registered caught in this adventure’s Pokédex';
      node.append(icon);
    } else if(!registered && marker)marker.remove();
  }
  function decorate(node,speciesId) {
    if(speciesReference(gameId,speciesId)) {
      node.dataset.speciesGame=gameId;node.dataset.speciesId=String(speciesId);update(node);
    }
    return node;
  }
  async function refresh() {
    const current=++revision;
    try {
      const profile=await getActiveProfile();if(current!==revision)return;
      const flags=caughtRegistrations(profile,gameId);caught=flags.species;
      status.hidden=!profile || profile.gameId!==gameId;
      status.textContent=status.hidden ? '' : `Poké Ball = registered caught · ${profile.snapshot.trainer.name || 'Trainer'}${flags.full ? '' : ' · Reload your save in Reader for full National Pokédex flags.'}`;
    } catch {
      if(current!==revision)return;
      caught=new Set();status.hidden=false;status.textContent='Caught registrations are unavailable. Atlas reference information remains available.';
    }
    root.querySelectorAll('[data-species-game]').forEach(update);
  }
  subscribeAdventureChanges(refresh);
  window.addEventListener('pageshow',refresh);
  window.addEventListener('focus',refresh);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')refresh();});
  refresh();
  return {decorate,refresh};
}
