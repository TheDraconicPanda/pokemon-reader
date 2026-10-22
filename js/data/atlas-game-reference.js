import {ATLAS_LOCATIONS} from './atlas-locations.js';
import {PLATINUM_ATLAS} from './games/platinum/atlas.js';
// Catalogue/navigation selection is independent of the uploaded save. Each
// supported game explicitly supplies its own locations and starting point.
const GAMES=new Map([
 ['soulsilver',Object.freeze({gameId:'soulsilver',name:'SoulSilver',regions:['Kanto','Johto'],homeLocation:'New Bark Town',locations:ATLAS_LOCATIONS})],
 ['platinum',Object.freeze({gameId:'platinum',name:'Platinum',regions:['Sinnoh'],homeLocation:'Twinleaf Town',locations:PLATINUM_ATLAS.locations})]
]);
export function atlasGameReference(gameId){return GAMES.get(gameId)||null;}
