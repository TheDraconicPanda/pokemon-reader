// Existing SoulSilver / Mando goals, preserved from the original Planner.
export const TEAM = [
  { id:"kingdra", name:"Kingdra", origin:"Horsea", role:"Special attacker and water traversal", ability:"Swift Swim", nature:"Modest (+Special Attack, −Attack; preferred) · Timid (+Speed, −Attack; alternative)", moves:[["Surf","Final set · locked"],["Ice Beam","Coverage"],["Dragon Pulse","Clair's TM59 reward"],["Rain Dance","Final set · weather control"]], temporary:["Whirlpool"], evs:[["Special Attack",252],["Speed",252],["HP",4]], note:"Whirlpool temporarily replaces Rain Dance during exploration." },
  { id:"typhlosion", name:"Typhlosion", origin:"Cyndaquil", role:"Fast special attacker; answers Venusaur", ability:"Blaze", nature:"Timid (+Speed, −Attack; preferred) · Modest (+Special Attack, −Attack; alternative)", moves:[["Flamethrower","Priority 1"],["Focus Blast","Coverage"],["Dig","Coverage"],["Fourth move — undecided","Choose before locking the final set"]], temporary:["Cut"], evs:[["Special Attack",252],["Speed",252],["HP",4]], note:"Cut is a sacrifice/navigation move. Shadow Ball was discussed but is not locked in." },
  { id:"machamp", name:"Machamp", origin:"Machop", role:"Physical attacker; Fighting coverage for Snorlax", ability:"No Guard", nature:"Adamant (+Attack, −Special Attack)", moves:[["DynamicPunch","Fighting STAB · preferred"],["Stone Edge","Postgame TM71 · 80 BP"],["Payback","Coverage"],["Fourth move — undecided","Choose one distinct move; Cross Chop is an alternative to DynamicPunch, not an extra slot"]], temporary:["Rock Climb","Strength"], evs:[["Attack",252],["HP",252],["Special Defense",4]], note:"No Guard makes Rock Climb reliable during exploration. Both HMs are temporary." },
  { id:"dragonite", name:"Dragonite", origin:"Dratini", role:"Physical setup sweeper; answers Pikachu", ability:"Inner Focus", nature:"Adamant (+Attack, −Special Attack; preferred) · Jolly (+Speed, −Special Attack; alternative)", moves:[["Dragon Dance","Teach as Dragonair at level 53"],["Earthquake","TM26 reserved"],["Dragon Claw","TM02 · Route 27"],["Fly","Final set · locked"]], temporary:["Waterfall"], evs:[["Attack",252],["Speed",252],["HP",4]], note:"Waterfall is exploration-only. Dragon Dance should be learned before evolving Dragonair at level 55." },
  { id:"ampharos", name:"Ampharos", origin:"Mareep", role:"Special Electric coverage; answers Lapras and Blastoise", ability:"Static", nature:"Modest (+Special Attack, −Attack)", moves:[["Thunderbolt","Repeatable Game Corner TM"],["Signal Beam","Coverage"],["Focus Blast","Coverage"],["Thunder Wave","Utility"]], temporary:[], evs:[["Special Attack",252],["HP",252],["Defense",4]], note:"No HM assigned." },
  { id:"gengar", name:"Gengar", origin:"Gastly", role:"Fast special attacker and broad coverage", ability:"Levitate", nature:"Timid (+Speed, −Attack; preferred) · Modest (+Special Attack, −Attack; alternative)", moves:[["Shadow Ball","TM30 reserved"],["Sludge Bomb","TM36 · Route 43"],["Focus Blast","Coverage"],["Thunderbolt","Repeatable Game Corner TM"]], temporary:["Rock Smash"], evs:[["Special Attack",252],["Speed",252],["HP",4]], note:"Rock Smash is temporary. Trading is available for the evolution." }
];
export const HMS = [
  { move:"Surf", owner:"Kingdra", status:"Final set", why:"Strong special STAB; remains in the Red configuration." },
  { move:"Whirlpool", owner:"Kingdra", status:"Temporary", why:"Exploration access; replace Rain Dance while travelling." },
  { move:"Fly", owner:"Dragonite", status:"Final set", why:"Travel convenience; planned to remain in the final set." },
  { move:"Waterfall", owner:"Dragonite", status:"Temporary", why:"Exploration access; remove for Red." },
  { move:"Rock Climb", owner:"Machamp", status:"Temporary", why:"No Guard removes its accuracy concern in this plan; remove for Red." },
  { move:"Strength", owner:"Machamp", status:"Temporary", why:"Useful exploration move; remove for Red." },
  { move:"Cut", owner:"Typhlosion", status:"Temporary", why:"Sacrifice/navigation slot; remove for Red." },
  { move:"Rock Smash", owner:"Gengar", status:"Temporary", why:"Exploration access; remove for Red." },
  { move:"Flash", owner:"Unassigned", status:"Situational", why:"Not assigned; only teach if a specific route requires it." }
];
export const BENCH = [
  { id:"metagross", name:"Metagross", role:"Durable physical attacker with Steel typing.", note:"Potentially overlaps Dragonite/Machamp. Beldum acquisition is awkward; Meteor Mash is learned by Metang at level 48." },
  { id:"roserade", name:"Roserade", role:"Special Grass/Poison specialist.", note:"Budew evolves through daytime friendship; evolve Roselia with a Shiny Stone after learning any desired pre-evolution moves." },
  { id:"electivire", name:"Electivire", role:"Physical Electric coverage.", note:"Competes with Ampharos for the Electric role. Electabuzz evolves by trading while holding an Electirizer." }
];
export const EV_LOCATIONS = {
  "HP":"Slowpoke Well (Slowpoke)",
  "Attack":"Route 42 surfing (Goldeen / Seaking)",
  "Defense":"Route 45 (Geodude / Graveler)",
  "Special Attack":"Route 35 grass (Psyduck / Golduck)",
  "Special Defense":"Surf Route 27 (Tentacool / Tentacruel)",
  "Speed":"Sprout Tower daytime or Diglett's Cave (Rattata / Diglett)"
};
