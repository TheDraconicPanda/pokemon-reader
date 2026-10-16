// Presentation only: retain the original encounter and its source index in each view.
export function encounterSections(encounters) {
  const sections = new Map([
    ['morning', {title:'Morning · Walking', entries:[]}],
    ['day', {title:'Day · Walking', entries:[]}],
    ['night', {title:'Night · Walking', entries:[]}],
    ['surfing', {title:'Surfing', entries:[]}],
    ['fishing', {title:'Fishing', entries:[]}],
    ['headbutt', {title:'Headbutt', entries:[]}],
    ['rock-smash', {title:'Rock Smash', entries:[]}],
    ['contest', {title:'Bug-Catching Contest', entries:[]}],
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
    } else {
      keys=[method.includes('Surfing')?'surfing':method.some(part=>['Old Rod','Good Rod','Super Rod'].includes(part))?'fishing':method.includes('Headbutt')?'headbutt':method.includes('Rock Smash')?'rock-smash':method.includes('Bug-Catching Contest')?'contest':'special'];
    }
    for(const key of keys)sections.get(key).entries.push({encounter,index});
  });
  return [...sections].filter(([,section])=>section.entries.length).map(([id,section])=>({id,...section}));
}
