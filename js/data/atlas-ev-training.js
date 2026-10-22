import { KANTO_ENCOUNTERS } from "./games/soulsilver/kanto-encounters.js";
import { ATLAS_LOCATIONS } from './atlas-locations.js';
import { SOULSILVER_ROUTE_ENCOUNTERS } from './games/soulsilver/route-encounters.js';
import { SOULSILVER_LOCATION_ENCOUNTERS } from './games/soulsilver/location-encounters.js';
import { speciesEvYield } from './game-reference.js';

export const EV_STATS = Object.freeze({hp:'HP',attack:'Attack',defense:'Defense',spAttack:'Special Attack',spDefense:'Special Defense',speed:'Speed'});
export const EV_METHODS = Object.freeze({surfing:'Surfing',walking:'Walking',old_rod:'Old Rod',good_rod:'Good Rod',super_rod:'Super Rod',headbutt:'Headbutt','rock-smash':'Rock Smash'});
const CONDITIONS = Object.freeze({'tree-a':'Headbutt tree group A','tree-b':'Headbutt tree group B','special-tree':'Special Headbutt trees · Rock Climb required','unown-puzzle':'At least one Ruins of Alph tile puzzle solved','unown-complete':'All 26 letters, four puzzles, four secret rooms and entrance panel unlocked'});
const GAMES = new Map([['soulsilver', {
  locations: ATLAS_LOCATIONS,
  encounters: {...SOULSILVER_ROUTE_ENCOUNTERS.routes, ...Object.fromEntries(Object.entries({...SOULSILVER_LOCATION_ENCOUNTERS.locations,...KANTO_ENCOUNTERS.locations}).map(([name, reference])=>[name,reference.encounters]))},
  notes: Object.fromEntries(Object.entries({...SOULSILVER_LOCATION_ENCOUNTERS.locations,...KANTO_ENCOUNTERS.locations}).map(([name, reference])=>[name,reference.notes]))
}]]);

export function evYieldForSpecies(gameId, name) {
  return GAMES.has(gameId)?speciesEvYield(gameId,name):null;
}

// Scores a complete distribution, never a list of conditional replacement slots.
export function scoreEvEncounters(gameId, rows, stat) {
  if(!GAMES.has(gameId)||!Object.hasOwn(EV_STATS,stat)) return null;
  if(!rows.length||rows.some(row=>!Number.isFinite(row.percent)||row.percent<=0)||rows.reduce((sum,row)=>sum+row.percent,0)!==100)
    throw new Error('EV recommendations require a complete 100% encounter table.');
  const species=new Map();
  for(const row of rows) {
    const yields=evYieldForSpecies(gameId,row.pokemon);
    if(!yields)throw new Error(`Missing Generation IV EV yield: ${row.pokemon}`);
    const current=species.get(row.pokemon)||{pokemon:row.pokemon,percent:0,levels:[],yields,targetYield:yields[stat],unwanted:Object.entries(yields).some(([key,value])=>key!==stat&&value>0)};
    current.percent+=row.percent;
    current.levels=[...new Set([...current.levels,...row.levels])].sort((a,b)=>a-b);
    species.set(row.pokemon,current);
  }
  const encounters=[...species.values()];
  return {
    encounters,
    usefulPercent:encounters.filter(row=>row.targetYield>0).reduce((sum,row)=>sum+row.percent,0),
    cleanPercent:encounters.filter(row=>row.targetYield>0&&!row.unwanted).reduce((sum,row)=>sum+row.percent,0),
    expectedEv:encounters.reduce((sum,row)=>sum+row.percent*row.targetYield,0)/100,
    minLevel:Math.min(...encounters.flatMap(row=>row.levels)),
  };
}

export function evEncounterTables(gameId,time='day') {
  const game=GAMES.get(gameId);
  if(!game||!['morn','day','nite'].includes(time))return [];
  const tables=[];
  for(const location of game.locations) {
    if(location.name==='Safari Zone')continue;
    const groups=new Map();
    for(const row of game.encounters[location.name]||[]) {
      if(!Object.hasOwn(EV_METHODS,row.method)||row.conditions.some(condition=>!Object.hasOwn(CONDITIONS,condition)))continue;
      if(row.times.length&&!row.times.includes(time))continue;
      const key=JSON.stringify([row.area||'',row.method,row.conditions]);
      if(!groups.has(key))groups.set(key,[]);
      groups.get(key).push(row);
    }
    for(const [key,rows] of groups) {
      const [area,method,conditions]=JSON.parse(key);
      tables.push({id:JSON.stringify([location.name,area,method,conditions]),location:location.name,area,method,conditions:conditions.map(key=>CONDITIONS[key]),access:location.access,notes:game.notes[location.name]||[],rows});
    }
  }
  return tables;
}

export function rankEvTraining(gameId,{stat='speed',time='day',method='all',cleanOnly=true}={}) {
  if(!Object.hasOwn(EV_STATS,stat)||(method!=='all'&&!Object.hasOwn(EV_METHODS,method)))return [];
  const results=evEncounterTables(gameId,time).filter(table=>method==='all'||table.method===method).map(table=>({...table,...scoreEvEncounters(gameId,table.rows,stat)})).filter(table=>table.usefulPercent>0&&(!cleanOnly||table.cleanPercent===100));
  return results.sort((a,b)=> Number(b.method==='surfing')-Number(a.method==='surfing') || Number(b.cleanPercent===100)-Number(a.cleanPercent===100) || b.usefulPercent-a.usefulPercent || b.expectedEv-a.expectedEv || a.minLevel-b.minLevel || a.location.localeCompare(b.location) || a.area.localeCompare(b.area) || a.method.localeCompare(b.method));
}
