import { SOULSILVER_GROWTH_RATES } from './data/games/soulsilver/growth-rates.js';
// Generation IV growth curves; level 1 starts at zero experience.
export function experienceForLevel(n,rate) {
  if(!Number.isInteger(n)||n<1||n>100)return null;
  if(n===1)return 0;
  switch(rate) {
    case 'fast':return Math.floor(4*n**3/5);
    case 'medium-fast':return n**3;
    case 'medium-slow':return Math.floor(6*n**3/5-15*n**2+100*n-140);
    case 'slow':return Math.floor(5*n**3/4);
    case 'erratic':
      if(n<=50)return Math.floor(n**3*(100-n)/50);
      if(n<=68)return Math.floor(n**3*(150-n)/100);
      if(n<=98)return Math.floor(n**3*Math.floor((1911-10*n)/3)/500);
      return Math.floor(n**3*(160-n)/100);
    case 'fluctuating':
      if(n<=15)return Math.floor(n**3*(Math.floor((n+1)/3)+24)/50);
      if(n<=36)return Math.floor(n**3*(n+14)/50);
      return Math.floor(n**3*(Math.floor(n/2)+32)/50);
    default:return null;
  }
}
export function savedLevel(pokemon) {
  if(Number.isInteger(pokemon.level)&&pokemon.level>=1&&pokemon.level<=100)return pokemon.level;
  const rate=SOULSILVER_GROWTH_RATES.species[pokemon.speciesId],xp=pokemon.experience;
  if(!rate||!Number.isInteger(xp)||xp<0)return null;
  let level=1;
  while(level<100 && xp>=experienceForLevel(level+1,rate))level++;
  return level;
}
