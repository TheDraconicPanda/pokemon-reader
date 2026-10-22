"""Platinum special systems: primary extraction plus reviewed script prerequisites."""
import collections,json,re

def add_specials(root,src,revision,species,names,headers,owner,scripts,read,doc,emit,rows,tables):
 config=json.loads((root/'scripts/platinum-special-encounters.json').read_text());assert config['primaryRevision']==revision
 conditions=config['conditions'];inventory=[];seen=set()
 def special(location,area,method,symbol,levels,requirements,path,availability='One-time',percent=None):
  ident=species[symbol];assert ident in names
  rows[location].append({'area':area,'method':method,'speciesId':ident,'pokemon':names[ident],'levels':levels,'percent':percent,'times':[],'conditions':requirements,'source':path,'availability':availability,**({'levelsLabel':'Matches offered Pokémon'} if method=='trade' else {}),'validationStatus':'primary-verified'})
 # Every literal fixed encounter/gift command in assigned scripts must be covered.
 for header,script in scripts.items():
  path=script['source'];slug=path.rsplit('/',1)[1][8:-2]
  for command,symbol,level in re.findall(r'^    (StartLegendaryBattle|StartWildBattle|StartGiratinaOriginBattle|StartFatefulEncounter|GivePokemon|GiveEgg) (SPECIES_\w+)(?:, (\d+))?',script['code'],re.M):
   key=(path,command,symbol,level)
   if key in seen:continue
   seen.add(key);assert slug in conditions,(slug,command)
   req=conditions[slug];kind='gift' if command.startswith('Give') else 'interaction'
   # Gen IV Eggs hatch at level 1; the Egg is not currently a levelled encounter.
   levels=[int(level)] if level else [1]
   special(owner[header],header,kind,symbol,levels,req,path,'Egg (hatches at Lv. 1)' if command=='GiveEgg' else 'Unreleased event' if slug=='hall_of_origin' else 'Historical distribution required' if slug in ['flower_paradise','newmoon_island_forest'] else 'Weekly encounter' if slug=='valley_windworks_outside' else 'Once per save; retry rules apply')
   inventory.append({'source':path,'command':command,'species':species[symbol],'levels':levels,'location':owner[header]})
 assert len(inventory)==21,len(inventory)
 # Variable-species gift paths are resolved from the source selection/revival data.
 starter='res/field/scripts/scripts_route_201.s';code=read(starter);assert 'GivePokemon VAR_0x8000, 5' in code
 read('src/scrcmd.c')
 for symbol in ['SPECIES_TURTWIG','SPECIES_CHIMCHAR','SPECIES_PIPLUP']:special('Route 201','MAP_HEADER_ROUTE_201','gift',symbol,[5],['Choose exactly one starter from Rowan’s briefcase'],starter,'Choose one starter')
 museum='res/field/scripts/scripts_mining_museum.s';code=read(museum);assert 'GivePokemon VAR_REVIVED_POKEMON_SPECIES, 20' in code
 fossil_code=read('src/scrcmd_fossil.c')
 # The source implementation table binds item and species; no random wild rate.
 fossils=re.findall(r'\{\s*\.item = (ITEM_(?:HELIX_FOSSIL|DOME_FOSSIL|OLD_AMBER|ROOT_FOSSIL|CLAW_FOSSIL|SKULL_FOSSIL|ARMOR_FOSSIL)),\s*\.species = (SPECIES_\w+)\s*}',fossil_code)
 assert len(fossils)==7,len(fossils)
 for item,symbol in fossils:special('Mining Museum','MAP_HEADER_MINING_MUSEUM','gift',symbol,[20],[f'Revive {item[5:].replace("_"," ").title()}; leave and return; party space required; Underground fossil availability depends on Trainer ID parity and National Pokédex'],museum,'Fossil revival')
 # Four NPC trades scale level to the offered Pokémon; no invented fixed level.
 trades=[]
 for file in sorted((src/'res/npc_trades').glob('*.json')):
  t=doc(file.relative_to(src).as_posix());symbol=t['species']
  matching=[(h,s) for h,s in scripts.items() if 'NPC_TRADE_'+file.stem.upper() in s['code']];assert matching,file
  header,script=matching[0];req=[f'Offer {names[species[t["requestedSpecies"]]]}; received level matches the offered Pokémon',f'Held item: {t["heldItem"][5:].replace("_"," ").title()}']
  if symbol=='SPECIES_HAUNTER':req.append('Holds Everstone: does not evolve during this NPC trade')
  special(owner[header],header,'trade',symbol,[],req,script['source'],'NPC trade; offered Pokémon’s level')
  trades.append({'location':owner[header],'species':species[symbol],'requestedSpecies':species[t['requestedSpecies']],'source':file.relative_to(src).as_posix()})
 assert len(trades)==4
 # Roamer release points are not stationary battles. Darkrai's unused roaming slot
 # is excluded because no native script activates it.
 roamer_code=read('src/roaming_pokemon.c');roamers=[]
 for header,script in scripts.items():
  for slot in sorted(set(re.findall(r'ActivateRoamingPokemon (ROAMING_SLOT_\w+)',script['code']))):
   match=re.search(r'case '+slot+r':\s*species = (SPECIES_\w+);\s*level = (\d+);',roamer_code);assert match,slot
   symbol,level=match.groups();key=(slot,owner[header])
   if key in seen:continue
   seen.add(key);req=['Roaming after release here; use the Pokétch Marking Map; not a fixed walking-table slot']
   if slot=='ROAMING_SLOT_MESPRIT':req.append('Interact in Verity Cavern after the Galactic / Distortion World story')
   elif slot=='ROAMING_SLOT_CRESSELIA':req.append('Fullmoon Island / sailor’s son Lunar Wing event after the National Pokédex')
   else:req.append('National Pokédex; meet Professor Oak at Pal Park, then his Eterna City house')
   special(owner[header],header,'roaming',symbol,[int(level)],req,script['source'],'Roaming after release; one capture')
   roamers.append({'slot':slot,'species':species[symbol],'level':int(level),'releaseLocation':owner[header],'source':script['source']})
 assert len(roamers)==5,len(roamers)
 # Trophy Garden slots remain today/yesterday, independently selected and retained
 # until the next successful Backlot selection; they are not host-clock forecasts.
 tg='res/field/encounters/encounters_trophy_garden.json';garden=doc(tg)
 for symbol in garden['daily_encounters']:
  for slot,label in [(6,'Current announced visitor'),(7,'Previous announced visitor')]:
   emit('Trophy Garden','MAP_HEADER_TROPHY_GARDEN','walking',[dict(garden['land_encounters'][slot],species=symbol)],[5],[],['National Pokédex',label+'; speak with Mr. Backlot; this replaces one ordinary 5% slot'],tg)
 # Feebas overrides fishing on four record-mixed RNG tiles at 50%, before lead
 # level effects; other catches use the ordinary table at half its normal share.
 feebas=read('src/overlay006/feebas_fishing.c');assert 'LCRNG_RandMod(2)' in feebas
 assert '(*minLevel) = 10' in feebas and '(*maxLevel) = 20' in feebas
 for method in ['old_rod','good_rod','super_rod']:special('Mt. Coronet','MAP_HEADER_MT_CORONET_B1F',method,'SPECIES_FEEBAS',list(range(10,21)),['Four special fishing tiles in B1F; Record Mixing changes them; other rod-table species retain half of their ordinary share'],'src/overlay006/feebas_fishing.c','50% on a selected Feebas tile',50)
 honey_code=read('src/overlay005/honey_tree.c');honey=doc('res/field/encounters/encounters_honey_tree.json')
 tree_headers=re.findall(r'MAP_HEADER_\w+',honey_code.split('sHoneyTreeMapHeaderIDs[NUM_HONEY_TREES] = {')[1].split('};')[0]);assert len(tree_headers)==21
 for index,header in enumerate(tree_headers):
  for group in ['common','uncommon','rare']:
   condition=['Honey Tree '+str(index+1),'Check after 6 hours and before 24 hours; tree timer is not advanced by this app',{'common':'Group A selected (70% fresh ordinary tree / 20% fresh Munchlax-eligible tree)','uncommon':'Group B selected (20% fresh ordinary tree / 70% fresh Munchlax-eligible tree)','rare':'Group C selected (1% fresh Munchlax-eligible tree only; eligibility depends on full Trainer ID)'}[group],'Percent below is within the selected group; 90% group retention can apply to consecutive slathering of the same tree']
   emit(owner[header],header,'honey_tree',[{'species':symbol,'level_min':5,'level_max':15} for symbol in honey[group]],[40,20,20,10,5,5],[],condition,'res/field/encounters/encounters_honey_tree.json')
 # Structured progression annotations: optional uses stay distinct from passage
 # requirements and never automatically lock reference browsing.
 access={
 'Underground':[{'kind':'item','id':'explorer-kit','text':'Explorer Kit from Eterna City; use from eligible Sinnoh outdoor areas and return to the entry point. The Eterna link is a reference access point. Local DS wireless Underground; no random wild encounters'}],
 'Pal Park':[{'kind':'progress','id':'national-dex','text':'National Pokédex; migrate eligible Generation III Pokémon using a DS/GBA slot; Catching Show species depend on transferred Pokémon'}],
 'Great Marsh':[{'kind':'mechanic','id':'safari-game','text':'Pastoria gate: pay 500; session starts with 30 Safari Balls and 500 steps; six fixed areas, no Johto blocks or aging'}],
 'Newmoon Island':[{'kind':'event','id':'member-card','text':'Historical Member Card distribution; sailor’s son Lunar Wing event; event flag required'}],
 'Flower Paradise':[{'kind':'event','id':'oaks-letter','text':'Historical Oak’s Letter distribution and event flag; National Pokédex'}],
 'Seabreak Path':[{'kind':'event','id':'oaks-letter','text':'Historical Oak’s Letter event opens the path north of Route 224'}],
 'Hall of Origin':[{'kind':'unreleased','id':'azure-flute','text':'Azure Flute was never officially distributed in Generation IV; reference-only unreleased encounter'}],
 'ROTOM’s Room':[{'kind':'event','id':'secret-key','text':'Historical Secret Key distribution; Galactic Eterna Building appliance room'}],
 'Fullmoon Island':[{'kind':'progress','id':'lunar-wing','text':'National Pokédex; investigate the sailor’s son in Canalave and take the sailor’s boat'}],
 'Snowpoint Temple':[{'kind':'progress','id':'national-dex','text':'National Pokédex; temple access after the Pokémon League'}],
 'Victory Road':[{'kind':'hm','id':'surf','text':'Surf, Waterfall, Strength and Rock Smash along the main League approach; postgame east extension requires National Pokédex'}],
 'Mt. Coronet':[{'kind':'hm','id':'rock-climb','text':'Upper Spear Pillar approach uses Surf, Strength and Rock Climb; Defog helps the foggy northern route but does not unlock a passage'}],
 'Wayward Cave':[{'kind':'hm','id':'cut','text':'Cut for the main entrance approach; hidden Cycling Road entrance reaches B1F; Bicycle for B1F ramps; Platinum removes the Diamond/Pearl Strength obstruction'}],
 'Lost Tower':[{'kind':'hm','id':'defog','text':'Defog clears the upper-floor fog and enables the old women’s rewards'}],
 'Eterna Forest':[{'kind':'hm','id':'cut','text':'Cut for Old Chateau and the outside bypass; ordinary forest traversal is separate'}],
 }
 for name in ['Fight Area','Survival Area','Resort Area','Stark Mountain','Battle Frontier','Battle Tower','Battle Factory','Battle Hall','Battle Castle','Battle Arcade']:
  access.setdefault(name,[]).append({'kind':'progress','id':'postgame','text':'Battle Zone / postgame; first reach Fight Area by boat from Snowpoint; National Pokédex unlocks onward routes'})
 for n in range(225,231):access[f'Route {n}']=[{'kind':'progress','id':'national-dex','text':'Battle Zone postgame; National Pokédex for onward routes'}]
 for n in [220,223,226,230]:access.setdefault(f'Route {n}',[]).append({'kind':'hm','id':'surf','text':'Surf for the water crossing; shoreline access is separate'})
 for name in ['Iron Ruins','Iceberg Ruins','Rock Peak Ruins']:access[name]=[{'kind':'event','id':'fateful-regigigas','text':'Hall of Fame and fateful-encounter distribution Regigigas in party for the special Regi room'}]
 move_code=read('src/field_move_tasks.c');hms={}
 for ident,function in [('cut','Cut'),('fly','Fly'),('surf','Surf'),('strength','Strength'),('defog','Defog'),('rock-smash','RockSmash'),('waterfall','Waterfall'),('rock-climb','RockClimb')]:
  body=move_code.split('static enum FieldMoveError FieldMoves_Check'+function+'(const FieldMoveContext *fieldMoveContext)\n{')[1].split('\n}',1)[0]
  badge=re.search(r'PlayerHasRequiredBadge\(fieldMoveContext, BADGE_ID_(\w+)\)',body)[1]
  hms[ident]={'label':ident.replace('-',' ').title(),'badge':badge.title()+' Badge','source':'src/field_move_tasks.c'}
 assert hms['fly']['badge']=='Cobble Badge' and hms['defog']['badge']=='Relic Badge'
 for name,rules in access.items():
  evidence=sorted({s['source'] for h,s in scripts.items() if owner[h]==name}|{'src/field_move_tasks.c','src/item_use_functions.c'})
  for r in rules:r['sources']=evidence
 travel=[]
 # Every geographic edge explains its evidence; location access notes are retained
 # on each outgoing destination rather than inferred from compass direction.
 systems={'fixedScriptCommands':inventory,'npcTrades':trades,'roamers':roamers,'honeyTrees':tree_headers,'honeyGroups':{k:[species[v] for v in vals] for k,vals in honey.items()},'trophyGardenVisitors':[species[v] for v in garden['daily_encounters']],'feebas':{'speciesId':349,'levels':[10,20],'tileChancePercent':50,'tilesPerDay':4}}
 return access,systems,{'hms':hms,'connections':travel}
