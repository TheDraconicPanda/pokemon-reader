"""Reproduce SoulSilver Kanto encounters from pinned primary data and a separate scope.
Usage: python scripts/build-kanto-encounters.py /path/to/pokeheartgold
Writes runtime rows and evidence with per-map/method coverage and content hashes.
"""
import argparse,collections,hashlib,importlib.util,json,pathlib,re,struct,subprocess
from soulsilver_encounters import EncounterData,merge_times,species
ROOT=pathlib.Path(__file__).resolve().parents[1]
def sha(b):return hashlib.sha256(b).hexdigest()
def main():
 p=argparse.ArgumentParser(description=__doc__);p.add_argument('primary',type=pathlib.Path);args=p.parse_args();src=EncounterData(args.primary)
 if subprocess.check_output(['git','-C',str(src.source),'status','--porcelain','--untracked-files=no'],text=True).strip():raise SystemExit('Primary checkout must be clean')
 config=json.loads((ROOT/'scripts/soulsilver-kanto-inventory.json').read_text());names={l['name'] for l in config['locations']}
 h=(src.source/'src/data/map_headers.h').read_text();headers={n:dict(re.findall(r'\.(\w+) = ([^,\n]+)',b)) for n,b in re.findall(r'\[(MAP_\w+)\]\s*=\s*\{(.*?)\n\s*\},?',h,re.S)}
 census=json.loads((ROOT/'docs/atlas-kanto-primary-census.json').read_text());groups={n:[] for n in names}
 for m in census['maps']:
  if m['location'] in groups:groups[m['location']].append(m)
 swarmtext=(src.source/'src/unk_02097F6C.c').read_text();swarms={n:['land','surf','fish'][int(i)] for n,i in re.findall(r'\{ (MAP_\w+),\s+(\d) \}',swarmtext)}
 evidence=[];locations={};inputpaths={'src/data/map_headers.h','src/unk_02097F6C.c','src/field/encounter_check.c','src/field_roamer.c','files/fielddata/encountdata/gs_enc_data.json','files/arc/headbutt.json','src/scrcmd_fossils.c','files/a/1/1/2','src/npc_trade.c','files/fielddata/script/scr_seq/scr_seq_0024_D18R0102.s'}
 for cfg in config['locations']:
  name=cfg['name'];rows=[];areas=[];done=set();notes=[]
  for m in groups[name]:
   n=m['mapId'];head=re.sub(r'^\d+_','',m['events']);head=head if head in src.trees else None;bank=m['encounterBank']
   # Monday's Clefairy dance scene uses the same map and bank as the ordinary square.
   key=(bank,head)
   if key in done:areas.append(dict(mapId=n,bank=bank,head=head,aliasOf=next(a['mapId'] for a in areas if (a['bank'],a['head'])==key)));continue
   done.add(key)
   records=src.bank(bank,head_key=head,swarm_type=swarms.get(n))
   label={'MAP_ROUTE_2':'West / south','MAP_ROUTE_2_EAST':'East / north','MAP_ROUTE_16_EAST':'East grass','MAP_ROUTE_10':'North','MAP_ROUTE_10_SOUTH':'South','MAP_MOUNT_MOON':'Cave','MAP_MOUNT_MOON_SQUARE_ENTRANCE':'Square entrance','MAP_MOUNT_MOON_SQUARE':'Square','MAP_MOUNT_MOON_SQUARE_CLEFAIRY_EVENT':'Square'}.get(n)
   if label is None:
    match=re.search(r'_(B?[1-9]F)$',n);label=match[1] if match else ''
   for row in records:
    row['area']=label
    if n in ['MAP_MOUNT_MOON_SQUARE','MAP_MOUNT_MOON_SQUARE_CLEFAIRY_EVENT']:row['conditions']=row['conditions']+['moon-square-clefairy' if n.endswith('CLEFAIRY_EVENT') else 'moon-square-ordinary']
   rows+=records
   areas.append(dict(mapId=n,bank=bank,head=head,area=label,methods=sorted({r['method'] for r in records}),rowCount=len(records),wildAbsent=not records))
   script='files/fielddata/script/scr_seq/'+headers[n]['scriptsBank'].removesuffix('_bin')+'.s';inputpaths.add(script)
  if name.startswith('Route ') and int(name[6:]) in [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,24,25]:notes.append('Roaming Pokémon: SoulSilver’s Latios (Lv. 35) roams Kanto after Steven’s Vermilion event. It is not a fixed walking-table member; check the Pokégear map.')
  if name=='Route 25':notes=[n for n in notes if not n.startswith('Roaming')]
  if name=='Route 2':notes.append('East/north and west/south sections use separate primary encounter banks; Viridian Forest is a separate location.')
  if name=='Route 10':notes.append('Wild tables belong to northern Route 10; the southern section has no separate ordinary wild bank. Zapdos is outside the Power Plant, not inside it.')
  if name=='Mt. Moon Square':notes.append('The Clefairy dance is not an additional catchable Clefairy. Ordinary and Monday-night scene water banks are listed separately; the cave entrance script switches scene warps Monday night / early Tuesday. The Moon Stone reward is separate.')
  if name=='Pal Park':notes.append('No fixed wild encounters. Catching Show Pokémon are selected by Generation III migration, not a random HGSS species table.')
  if name=='Silph Co.':notes.append('Rotom’s room changes an eligible Rotom’s form; it does not provide a wild or gift Rotom. Generation IV Rotom forms retain Electric/Ghost typing.')
  locations[name]=dict(status='verified' if rows else 'no-fixed-wild',notes=notes,encounters=merge_times(rows));evidence.append(dict(location=name,maps=areas,special=[]))
 # Specials require explicit reachable-event review: unused Route 12 Snorlax script is excluded.
 def special(name,pokemon,level,condition,area='',kind='interaction',availability='Stationary',primaryMap=None):
  r=dict(method=kind,pokemon=pokemon,levels=[] if level is None else [level],times=[],percent=None,conditions=[condition],area=area,availability=availability)
  if level is None:r['levelsLabel']='Matches offered Pokémon'
  locations[name]['encounters'].append(r);locations[name]['status']='verified'
  if primaryMap:
   path='files/fielddata/script/scr_seq/'+headers[primaryMap]['scriptsBank'].removesuffix('_bin')+'.s';inputpaths.add(path)
  else:path=None
  next(e for e in evidence if e['location']==name)['special'].append(dict(pokemon=pokemon,level=level,condition=condition,method=kind,primaryMap=primaryMap,script=path))
 for name,mon,level,cond,area,mp in [('Route 11','Snorlax',50,'kanto-snorlax','Diglett’s Cave entrance','MAP_ROUTE_11'),('Route 25','Suicune',40,'kanto-suicune','Cape','MAP_ROUTE_25'),('Route 10','Zapdos',50,'kanto-sixteen-badges','Outside Power Plant','MAP_ROUTE_10'),('Cerulean Cave','Mewtwo',70,'kanto-sixteen-badges','B1F','MAP_CERULEAN_CAVE_B1F'),('Seafoam Islands','Articuno',50,'kanto-articuno','B4F','MAP_SEAFOAM_ISLANDS_B4F'),('Pewter City','Latias',40,'enigma-stone','Museum event','MAP_PEWTER')]:special(name,mon,level,cond,area,primaryMap=mp)
 for mon in ['Bulbasaur','Charmander','Squirtle']:special('Pallet Town',mon,5,'oak-kanto-starter','Oak’s laboratory','gift','Choose one starter','MAP_PALLET_TOWN_OAKS_LAB')
 for mon in ['Treecko','Torchic','Mudkip']:special('Silph Co.',mon,5,'steven-hoenn-starter','Steven','gift','Choose one starter','MAP_SAFFRON_SILPH_CO_HQ')
 for mon,coins in [('Mr. Mime',3333),('Eevee',6666),('Porygon',9999)]:special('Celadon Game Corner',mon,15,'celadon-prize',f'{coins:,} coins','gift','Prize Pokémon','MAP_CELADON_PRIZE_CORNER')
 fossils=re.findall(r'\{ (ITEM_\w+),\s+(SPECIES_\w+)\s+\}',(src.source/'src/scrcmd_fossils.c').read_text())
 for fossil,mon in fossils:special('Pewter Museum of Science',species(mon),20,'fossil-revival',fossil.removeprefix('ITEM_').replace('_',' ').title(),'gift','Fossil revival','MAP_PEWTER_MUSEUM_OF_SCIENCE')
 # NPC trade archive has 13 fixed 0x54-byte records, inside a standard NARC.
 spec=importlib.util.spec_from_file_location('interiors',ROOT/'scripts/build-soulsilver-interiors.py');module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
 members=module.narc_members((src.source/'files/a/1/1/2').read_bytes());speciesnames={int(i):n for n,i in re.findall(r'#define SPECIES_(\w+)\s+(\d+)',(src.source/'include/constants/species.h').read_text())}
 for name,index,cond,mp in [('Power Plant',8,'trade-power-plant','MAP_ROUTE_10_POWER_PLANT_REPAIRED'),('Pewter City',9,'trade-pewter','MAP_PEWTER_POKECENTER_1F'),('Saffron Magnet Train Station',10,'trade-surge','MAP_SAFFRON_MAGNET_TRAIN_STATION_1F'),('Diglett’s Cave',11,'trade-brock','MAP_DIGLETT_CAVE'),('Silph Co.',12,'trade-steven','MAP_SAFFRON_SILPH_CO_HQ')]:
  give=struct.unpack_from('<I',members[index],0)[0];ask=struct.unpack_from('<I',members[index],0x4c)[0]
  special(name,species('SPECIES_'+speciesnames[give]),None,cond,'Offer '+species('SPECIES_'+speciesnames[ask]),'trade','In-game trade',mp)
 supplemental={'Burned Tower':[dict(method='interaction',pokemon='Suicune',levels=[40],times=[],percent=None,conditions=['suicune-return'],area='B1F',availability='Stationary · return encounter')]}
 inputs={p:sha((src.source/p).read_bytes()) for p in sorted(inputpaths)}
 for name,r in locations.items():
  if r['encounters'] and not any(row['method'] in ['walking','surfing','old_rod','good_rod','super_rod','headbutt','rock-smash'] for row in r['encounters']):r['notes'].insert(0,'No ordinary wild encounters at this location; the listed gifts, prizes or trades have their own requirements.')
 body='// Generated from pinned SoulSilver sources; see scripts/build-kanto-encounters.py.\nexport const KANTO_ENCOUNTERS = Object.freeze('+json.dumps(dict(gameId='soulsilver',locations=locations,supplemental=supplemental),ensure_ascii=False,indent=2)+');\n'
 (ROOT/'js/data/games/soulsilver/kanto-encounters.js').write_text(body)
 for e in evidence:
  r=locations[e['location']];e.update(status=r['status'],rowCount=len(r['encounters']),encountersSha256=sha(json.dumps(r['encounters'],ensure_ascii=False,separators=(',',':')).encode()))
 (ROOT/'docs/atlas-kanto-encounter-evidence.json').write_text(json.dumps(dict(gameId='soulsilver',primaryRevision=config['primaryRevision'],inputs=inputs,locations=evidence,supplemental=supplemental,excluded=[dict(location='Route 12',pokemon='Snorlax',reason='Unused battle script; no Snorlax object in the released Route 12 event table.'),dict(location='Mt. Moon Square',pokemon='Clefairy dance',reason='Scripted dance, not another catchable/static Pokémon.')]),ensure_ascii=False,indent=2)+'\n')
 print(f'{len(locations)} groups; {sum(len(r["encounters"]) for r in locations.values())} encounter rows; {sum(r["status"]=="no-fixed-wild" for r in locations.values())} without fixed wild or gift/trade encounters')
if __name__=='__main__':main()
