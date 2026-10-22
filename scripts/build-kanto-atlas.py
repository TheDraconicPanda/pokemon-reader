"""Build HGSS Kanto geography and primary map census from a pinned clean checkout.
Usage: python scripts/build-kanto-atlas.py /path/to/pokeheartgold
Encounter generation is separate: scripts/build-kanto-encounters.py.
"""
import argparse,hashlib,json,pathlib,re,subprocess
ROOT=pathlib.Path(__file__).resolve().parents[1]
def main():
 p=argparse.ArgumentParser(description=__doc__);p.add_argument('primary',type=pathlib.Path);args=p.parse_args();primary=args.primary
 cfg=json.loads((ROOT/'scripts/soulsilver-kanto-inventory.json').read_text());rev=cfg['primaryRevision']
 if subprocess.check_output(['git','-C',str(primary),'rev-parse','HEAD'],text=True).strip()!=rev or subprocess.check_output(['git','-C',str(primary),'status','--porcelain','--untracked-files=no'],text=True).strip():raise SystemExit('Expected pinned clean primary checkout')
 raw=(primary/'src/data/map_headers.h').read_bytes()
 headers={n:dict(re.findall(r'\.(\w+) = ([^,\n]+)',b)) for n,b in re.findall(r'\[(MAP_\w+)\]\s*=\s*\{(.*?)\n\s*\},?',raw.decode(),re.S)}
 runtime=ROOT/'js/data/atlas-locations.js';old=json.loads(runtime.read_text().split('Object.freeze(',1)[1].rsplit(');',1)[0]);newnames={l['name'] for l in cfg['locations']};old=[l for l in old if l['name'] not in newnames]
 # Remove only generator-owned added connections; source Johto records remain intact.
 for l in old:l['connections']=[n for n in l['connections'] if n not in newnames]
 assignments={}
 for c in cfg['locations']:
  if c.get('section'):
   for n,h in headers.items():
    if h['mapsec']==c['section']:assignments[n]=c['name']
 for c in cfg['locations']:
  if c.get('pattern'):
   for n in headers:
    if re.match(c['pattern'],n):assignments[n]=c['name']
 ignored={n:'Unused primary header; not a traversable released-HGSS location.' for n in assignments if 'UNUSED' in n}
 for n in ignored:del assignments[n]
 def sources(name,c):
  slug={'Diglett’s Cave':'diglett%27scave','Underground Path':'undergroundpath5-6','Pal Park':'fuchsiacity','Mt. Moon':'mt.moon','Mt. Moon Square':'mt.moon','Kanto Radio Tower':'lavendertown','Saffron Magnet Train Station':'saffroncity','Fighting Dojo':'saffroncity','Silph Co.':'saffroncity','Celadon Department Store':'celadoncity','Celadon Game Corner':'celadoncity','Trainer House':'viridiancity','Pewter Museum of Science':'pewtercity'}.get(name,re.sub('[^a-z0-9]','',name.lower()))
  bulb={'Diglett’s Cave':"Diglett%27s_Cave",'Mt. Moon Square':'Mt._Moon','Kanto Radio Tower':'Lavender_Radio_Tower','Saffron Magnet Train Station':'Magnet_Train','Power Plant':'Kanto_Power_Plant','Trainer House':'Trainer_House','Pewter Museum of Science':'Pewter_Museum_of_Science'}.get(name,('Kanto_' if name.startswith('Route ') else '')+name.replace(' ','_'))
  return [dict(label='Serebii HGSS location reference',url=f'https://www.serebii.net/pokearth/kanto/4th/{slug}.shtml'),dict(label='Bulbapedia HGSS location reference',url=f'https://bulbapedia.bulbagarden.net/wiki/{bulb}'),dict(label='Pinned HGSS map headers',url=f'https://github.com/pret/pokeheartgold/blob/{rev}/src/data/map_headers.h')]
 new=[]
 for c in cfg['locations']:
  name=c['name'];ids=[n for n in headers if assignments.get(n)==name]
  if not ids:raise ValueError('No primary maps for '+name)
  landmarks=c['landmarks']
  if len(landmarks)<2:landmarks=landmarks+['HeartGold/SoulSilver location reference']
  new.append(dict(name=name,type=c['type'],region='Kanto',details='; '.join(c['landmarks']),landmarks=landmarks,access=['Postgame Kanto access follows the first Pokémon League victory and S.S. Aqua voyage.','Reference navigation remains available regardless of saved story progress.'],connections=[],sources=sources(name,c),mapIds=ids,audit=dict(scope='primary geography; secondary verification tracked separately',primaryRevision=rev)))
 byname={l['name']:l for l in old+new}
 travel=[]
 for edge in cfg['connections']:
  a,b=edge['fromLocation'],edge['toLocation']
  for x,y in [(a,b),(b,a)]:
   if y not in byname[x]['connections']:byname[x]['connections'].append(y)
   travel.append(dict(fromLocation=x,toLocation=y,hms=edge['hms'],conditions=edge['conditions'],notes=edge['notes'],sources=[s['url'] for s in byname[a]['sources'][:2]]))
  for x in [a,b]:
   for note in edge['conditions']+edge['notes']:
    if note not in byname[x]['access']:byname[x]['access'].append(note)
 runtime.write_text('// Johto and Kanto HGSS location groups. Kanto reproduction: scripts/build-kanto-atlas.py.\nexport const ATLAS_LOCATIONS = Object.freeze('+json.dumps(old+new,ensure_ascii=False,indent=2)+');\n')
 (ROOT/'js/data/games/soulsilver/kanto-travel.js').write_text('// Generated from the separate HGSS Kanto reference inventory.\nexport const KANTO_TRAVEL = Object.freeze('+json.dumps(travel,ensure_ascii=False,indent=2)+');\n')
 (ROOT/'js/data/games/soulsilver/kanto-compass.js').write_text('// Explicit group orientation; not movement or progression gating.\nexport const KANTO_COMPASS = '+json.dumps([[e['fromLocation'],e['toLocation'],e['direction']] for e in cfg['connections']],ensure_ascii=False,indent=2)+';\n')
 census=[]
 for n,h in headers.items():
  if h['regionNo']!='MAP_REGION_KANTO':continue
  owner=assignments.get(n) or next((l['name'] for l in old if n in l['mapIds']),None)
  if not owner:
   sec=h['mapsec'];owner={'MAPSEC_ROUTE_26':'Route 26','MAPSEC_ROUTE_27':'Route 27','MAPSEC_ROUTE_28':'Route 28','MAPSEC_INDIGO_PLATEAU':'Indigo Plateau','MAPSEC_POKEMON_LEAGUE':'Indigo Plateau','MAPSEC_VICTORY_ROAD_JK':'Victory Road','MAPSEC_TOHJO_FALLS':'Tohjo Falls','MAPSEC_GOLDENROD_CITY':'Goldenrod City','MAPSEC_ROTOMS_ROOM':'Silph Co.'}.get(sec)
  status='assigned' if owner else 'excluded'
  reason=ignored.get(n) if n in ignored else ('Unused primary header; not traversable in HGSS.' if 'UNUSED' in n else None)
  if reason:owner=None;status='excluded'
  if not owner and not reason:raise ValueError('Unaccounted Kanto map '+n)
  census.append(dict(mapId=n,section=h['mapsec'],location=owner,status=status,reason=reason,encounterBank=h['wildEncounterBank'].removeprefix('ENCDATA_'),events=h['eventsBank'].removeprefix('NARC_zone_event_').removesuffix('_bin')))
 (ROOT/'docs/atlas-kanto-primary-census.json').write_text(json.dumps(dict(primaryRevision=rev,headersSha256=hashlib.sha256(raw).hexdigest(),maps=census),ensure_ascii=False,indent=2)+'\n')
 print(f'{len(new)} Kanto location groups; {len(census)} primary Kanto headers; {len(travel)} directed connections')
if __name__=='__main__':main()
