// Presentation only: retain the original encounter and its source index in each view.
export function encounterSections(encounters) {
  const sections = new Map([
    ['morning', {title:'Morning · 04:00–09:59 · Walking', entries:[]}],
    ['day', {title:'Day · 10:00–19:59 · Walking', entries:[]}],
    ['night', {title:'Night · 20:00–03:59 · Walking', entries:[]}],
    ['surfing', {title:'Surfing', entries:[]}],
    ['fishing', {title:'Fishing', entries:[]}],
    ['headbutt', {title:'Headbutt', entries:[]}],
    ['rock-smash', {title:'Rock Smash', entries:[]}],
    ['contest', {title:'Bug-Catching Contest', entries:[]}],
    ['legendary', {title:'Legendary encounters', entries:[]}],
    ['special', {title:'Special encounters', entries:[]}]
  ]);
  encounters.forEach((encounter,index) => {
    const method=encounter.method.split(' · ');
    let keys;
    if(method.includes('Walking')) {
      const times=encounter.times.toLowerCase();
      keys=['morning','day','night'].filter(time=>/all times|any time/.test(times)||times.includes(time));
      // Retain any unexpected time label without silently assigning a time.
      if(!keys.length)keys=['special'];
    } else if (['Ho-Oh','Lugia','Moltres','Groudon','Rayquaza'].includes(encounter.pokemon)) {
      keys=['legendary'];
    } else {
      keys=[method.includes('Surfing')?'surfing':method.some(part=>['Old Rod','Good Rod','Super Rod'].includes(part))?'fishing':method.includes('Headbutt')?'headbutt':method.includes('Rock Smash')?'rock-smash':method.includes('Bug-Catching Contest')?'contest':'special'];
    }
    for(const key of keys)sections.get(key).entries.push({encounter,index});
  });
  return [...sections].filter(([,section])=>section.entries.length).map(([id,section])=>({id,...section}));
}
