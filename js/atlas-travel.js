import { travelConnection, travelHm } from './data/atlas-travel.js';

const usage = {passage:'Passage',through:'Through-route',alternative:'Alternative route',optional:'Side/deeper areas'};
const icon = (id,title,scope='passage') => {
  const badge=document.createElement('span');
  badge.className='travel-badge'; badge.dataset.usage=scope; badge.title=title;
  badge.setAttribute('aria-hidden','true');
  const symbol=document.createElement('span');
  symbol.className='travel-icon travel-icon-'+id;
  badge.append(symbol);return badge;
};

export function createTravelConditions(gameId, from) {
  const panel=document.createElement('details');panel.className='travel-conditions';
  const summary=document.createElement('summary');summary.textContent='Travel conditions';
  const help=document.createElement('p');
  help.textContent='Solid HM symbols mark passage requirements. Outlined symbols mark through-route or alternative-path requirements; entering an area may be possible without them. A lock marks a story condition; “i” marks a path note. Tap symbols to read their requirements here; tap a destination’s name to open its guide.';
  const list=document.createElement('ul');
  panel.append(summary,help,list);
  function decorate(button,to,index) {
    const reference=travelConnection(gameId,from,to);
    if(!reference||(!reference.hms.length&&!reference.conditions.length&&!reference.notes.length))return;
    const badges=document.createElement('span');badges.className='travel-badges';
    const descriptions=[];
    for(const hm of reference.hms) {
      const rule=travelHm(gameId,hm.id);
      const text=`${usage[hm.usage]}: ${rule.label} (${rule.badge}).`;
      descriptions.push(text);
      if(hm.usage!=='optional')badges.append(icon(hm.id,text,hm.usage));
    }
    if(reference.conditions.length)badges.append(icon('story','Story/access condition: '+reference.conditions.join(' '),reference.conditionUsage||'passage'));
    else if(reference.notes.length)badges.append(icon('info','Path notes: '+reference.notes.join(' '),'through'));
    descriptions.push(...reference.conditions,...reference.notes);
    const entry=document.createElement('li');
    const title=document.createElement('strong');title.textContent=to;
    const text=document.createElement('p');text.id='travel-'+index;
    text.textContent=descriptions.join(' ');
    entry.append(title,text);list.append(entry);
    button.setAttribute('aria-describedby',text.id);
    button.title=descriptions.join(' ');
    if(badges.childElementCount) {
      // The existing disclosure is also the keyboard/screen-reader route to help.
      // Touching its duplicate symbols must not activate the navigation button.
      badges.title='Read travel requirements for '+to;
      badges.addEventListener('click', event => {
        event.preventDefault(); event.stopPropagation();
        panel.open=true;
        for(const old of list.querySelectorAll('.is-selected'))old.classList.remove('is-selected');
        entry.classList.add('is-selected'); entry.tabIndex=-1;
        entry.focus({preventScroll:true}); entry.scrollIntoView({block:'nearest'});
      });
      button.append(badges);
    }
  }
  return {panel,decorate,hasConditions:()=>list.childElementCount>0};
}
