import { atlasGameReference } from './data/atlas-game-reference.js';
import { travelHm } from './data/atlas-travel.js';
import { EV_STATS, EV_METHODS, rankEvTraining } from './data/atlas-ev-training.js';
import { formatLevels } from './data/atlas-route-reference.js';

const number = new Intl.NumberFormat('en',{maximumFractionDigits:2});
const el = (tag,text,className) => {
  const node=document.createElement(tag);
  if(text!==undefined)node.textContent=text;
  if(className)node.className=className;
  return node;
};
const yieldText = yields => Object.entries(yields).filter(([,value])=>value).map(([key,value])=>`${value} ${EV_STATS[key]}`).join(' + ')+' EVs';

export function mountEvTraining({panel,onOpenLocation,decorateSpecies=node=>node,gameId='soulsilver'}) {
  const currentGame=()=>typeof gameId==='function'?gameId():gameId;
  const stat=panel.querySelector('#ev-stat');
  const time=panel.querySelector('#ev-time');
  const method=panel.querySelector('#ev-method');
  const clean=panel.querySelector('#ev-clean');
  const status=panel.querySelector('#ev-result-count');
  const list=panel.querySelector('#ev-results');
  const more=panel.querySelector('#ev-more');
  let results=[];
  let shown=0;
  function appendPage() {
    const page=results.slice(shown,shown+12);
    for(const result of page) {
      const card=el('article',undefined,'ev-result');
      card.dataset.location=result.location;
      card.dataset.method=result.method;
      card.dataset.useful=String(result.usefulPercent);
      const title=el('h3',[result.location,result.area].filter(Boolean).join(' · '));
      title.tabIndex=-1;
      const methodLabel=el('p',`${EV_METHODS[result.method]} · ${time.selectedOptions[0].textContent}`,'ev-method');
      const badge=el('p',`${result.usefulPercent}% useful encounters${result.cleanPercent===100?' · No unwanted EVs':' · Mixed EVs'}`,'ev-chance');
      badge.classList.toggle('ev-mixed',result.cleanPercent!==100);
      const expected=el('p',`${number.format(result.expectedEv)} base ${EV_STATS[stat.value]} EVs per encounter on average.`);
      const eligible=result.encounters.filter(row=>row.targetYield>0);
      const other=result.encounters.filter(row=>!row.targetYield);
      const speciesList=(rows,label)=>{
        const section=el('div');
        section.append(el('h4',label));
        const entries=el('ul');
        for(const row of rows) {
          const item=el('li');
          item.append(decorateSpecies(el('strong',`${row.pokemon} · ${row.percent}%`),row.pokemon),el('span',`Lv. ${formatLevels(row.levels)} · ${yieldText(row.yields)}${row.unwanted&&row.targetYield?' · Also awards unwanted EVs':''}`));
          entries.append(item);
        }
        section.append(entries);
        return section;
      };
      card.append(title,methodLabel,badge,expected,speciesList(eligible,`Defeat for ${EV_STATS[stat.value]}`));
      if(other.length)card.append(speciesList(other,'Other encounters · flee to avoid their EVs'));
      const requirements=el('details',undefined,'ev-access');
      requirements.append(el('summary','Requirements & location notes'));
      const notes=el('ul');
      const methodNote=result.method==='surfing'?`Surf requires HM03 and the ${travelHm(currentGame(),'surf')?.badge || 'matching Badge'}.`:result.method.includes('rod')?`Requires the ${EV_METHODS[result.method]}; percentages apply to Pokémon hooked, not each cast.`:result.method==='headbutt'?'Teach Headbutt to an eligible Pokémon and use the matching tree group.':result.method==='rock-smash'?'Requires Rock Smash and the Zephyr Badge; percentages apply when a Pokémon appears, not every rock.':'Walking encounters include grass, caves and forests.';
      for(const note of [...new Set([methodNote,...result.conditions,...result.access,...result.notes])])notes.append(el('li',note));
      requirements.append(notes);
      const open=el('button','Open in Atlas','ev-open-location');
      open.type='button';
      open.setAttribute('aria-label',`Open ${result.location}${result.area?' · '+result.area:''} in Atlas`);
      open.addEventListener('click',()=>onOpenLocation(result.location,result.areaId));
      card.append(requirements,open);
      list.append(card);
    }
    shown+=page.length;
    more.hidden=shown>=results.length;
    more.textContent=`Show ${Math.min(12,results.length-shown)} more spots`;
    status.textContent=results.length?`${results.length} matching training spots · showing ${shown}. Surfing is listed first.`:'No matching training spots. Try another method or turn off “No unwanted EVs”.';
  }
  function render() {
    list.replaceChildren();shown=0;
    try {
      const game=currentGame();
      for(const o of method.options)o.hidden=game==='platinum'&&['headbutt','rock-smash'].includes(o.value);
      if(method.selectedOptions[0].hidden)method.value='all';
      const intro=panel.querySelector('#ev-intro');if(intro)intro.textContent=`Choose a stat to find training spots in ${atlasGameReference(game).name}. Surfing comes first. “100% useful” describes the listed reference conditions, not a guaranteed encounter each step.`;
      results=rankEvTraining(game,{stat:stat.value,time:time.value,method:method.value,cleanOnly:clean.checked});
      appendPage();
    } catch {
      more.hidden=true;
      status.textContent='Training recommendations could not be loaded. The Atlas location guide is still available.';
    }
  }
  for(const control of [stat,time,method,clean])control.addEventListener('change',render);
  more.addEventListener('click',()=>{
    const firstNew=shown;
    appendPage();
    const heading=list.children[firstNew]?.querySelector('h3');
    heading?.focus();
  });
  return {render};
}
