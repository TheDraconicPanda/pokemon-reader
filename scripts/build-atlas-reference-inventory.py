"""Build the separate expected HGSS inventory from reference recipes and primary data.
Usage: python scripts/build-atlas-reference-inventory.py /path/to/pokeheartgold
Never reads the current Atlas location list or compiled encounter datasets.
Updating this inventory is a source-review operation, not part of routine validation.
"""
import csv,hashlib,json,pathlib,re,subprocess,sys
from soulsilver_encounters import EncounterData,merge_times,species
ROOT=pathlib.Path(__file__).resolve().parents[1]
def digest(b):return hashlib.sha256(b).hexdigest()
def rowhash(rows):return digest(json.dumps(rows,ensure_ascii=False,separators=(',',':')).encode())
def main():
 src=EncounterData(sys.argv[1])
 if subprocess.check_output(['git','-C',str(src.source),'status','--porcelain','--untracked-files=no'],text=True).strip():raise SystemExit('Expected pinned clean primary data')
 scope=json.loads((ROOT/'js/data/games/soulsilver/encounter-scope.json').read_text());cfg=json.loads((ROOT/'scripts/soulsilver-kanto-inventory.json').read_text());kanto=json.loads((ROOT/'docs/atlas-kanto-encounter-evidence.json').read_text());historical=json.loads((ROOT/'docs/atlas-integrated-audit-2026-10-20.json').read_text());oldrefs=json.loads((ROOT/'docs/atlas-encounter-audit.json').read_text());checks=json.loads((ROOT/'docs/atlas-kanto-reference-checks.json').read_text());census=json.loads((ROOT/'docs/atlas-kanto-primary-census.json').read_text());rooms=json.loads((ROOT/'scripts/soulsilver-interior-rooms.json').read_text())
 headerbytes=(src.source/'src/data/map_headers.h').read_bytes();headers={n:dict(re.findall(r'\.(\w+) = ([^,\n]+)',b)) for n,b in re.findall(r'\[(MAP_\w+)\]\s*=\s*\{(.*?)\n\s*\},?',headerbytes.decode(),re.S)}
 oldrows={};mapowners={};maps={};swarms={'T22':'fish','D42R0102':'land','D38R0101':'land'}
 for name,config in scope.items():
  rows=[];maps[name]=[]
  for a in config['maps']:
   maps[name].append(a['mapId']);mapowners[a['mapId']]=name
   if a.get('specialOnly') or a.get('aliasOf'):continue
   records=src.bank(a['bank'],head_key=a['head'],swarm_type=swarms.get(a['bank']))
   if a['bank']=='D24R0205':records=[dict(r,conditions=['unown-puzzle']) for r in records if not r['conditions']]
   for r in records:r['area']='B1F' if name=='Cliff Cave' and r['method']=='rock-smash' else a['area']
   rows+=records
  rows+=config['special']
  if name=='National Park':
   with (src.source/'files/data/mushi/mushi_encount.csv').open() as f:contests=list(csv.DictReader(f))
   for group,condition in enumerate(['contest-pre-dex','contest-tuesday','contest-thursday','contest-saturday']):
    threshold=100
    for entry in contests[group*10:(group+1)*10]:
     probability=threshold-int(entry['rate']);threshold=int(entry['rate'])
     rows.append(dict(method='contest',pokemon=species(entry['species']),levels=list(range(int(entry['lvlmin']),int(entry['lvlmax'])+1)),times=[],percent=probability,conditions=[condition],area='Contest grounds'))
  oldrows[name]=merge_times(rows)
 for n in range(26,49):
  name=f'Route {n}';key=f'W{n}' if n in [40,41] else f'R{n}';rows=src.bank(key,swarm_type={27:'surf',32:'fish',34:'land',35:'land',38:'land',44:'fish',45:'land',47:'land'}.get(n))
  if n==35:rows.append(dict(method='gift',pokemon='Spearow',levels=[20],times=[],percent=None,conditions=['kenya-mail']))
  if n==36:rows.append(dict(method='interaction',pokemon='Sudowoodo',levels=[20],times=[],percent=None,conditions=['squirtbottle']))
  oldrows[name]=merge_times(rows);maps[name]=[f'MAP_ROUTE_{n}'];mapowners[f'MAP_ROUTE_{n}']=name
 expectedold={l['name'] for l in historical['locations']}
 if set(oldrows)!=expectedold:raise ValueError('Reference recipes do not match the independently audited 69-group inventory')
 for a in rooms['rooms']:mapowners[a['mapId']]=a['location']
 for m in census['maps']:
  if m['location']:mapowners[m['mapId']]=m['location'];maps.setdefault(m['location'],[])
  if m['location'] and m['mapId'] not in maps[m['location']]:maps[m['location']].append(m['mapId'])
 # Johto sections whose rooms are grouped under an existing city/facility.
 sectionparents={'MAPSEC_GLOBAL_TERMINAL':'Goldenrod City','MAPSEC_BATTLE_TOWER':'Battle Frontier','MAPSEC_BATTLE_FACTORY':'Battle Frontier','MAPSEC_BATTLE_HALL':'Battle Frontier','MAPSEC_BATTLE_CASTLE':'Battle Frontier','MAPSEC_BATTLE_ARCADE':'Battle Frontier','MAPSEC_POKEMON_LEAGUE':'Indigo Plateau','MAPSEC_SAFARI_ZONE':'Safari Zone'}
 sectionowners={}
 for n,name in mapowners.items():
  if n in headers:sectionowners.setdefault(headers[n]['mapsec'],set()).add(name)
 sectionowners.update({sec:{owner} for sec,owner in sectionparents.items()})
 excludedSections={'MAPSEC_MYSTERY_ZONE':'Online, battle/communication and placeholder maps outside the geographic Atlas.','MAPSEC_JUBILIFE_CITY':'Unused imported/placeholder headers; not released HGSS Sinnoh geography.','MAPSEC_FIGHT_AREA':'Unused imported Sinnoh headers.','MAPSEC_BATTLE_PARK':'Unused imported Sinnoh headers.','MAPSEC_SINJOH_RUINS':'Event-only Sinjoh region outside the requested Johto/Kanto inventory.'}
 sections={};primary=[]
 for n,h in headers.items():
  sec=h['mapsec'];region=h['regionNo'].removeprefix('MAP_REGION_').title();owner=mapowners.get(n)
  reason=excludedSections.get(sec)
  if h['mapType']=='MAP_TYPE_INVALID':reason='Invalid/placeholder header.'
  if 'UNUSED' in n:reason='Unused primary header.'
  if not owner and not reason and len(sectionowners.get(sec,[]))==1:owner=next(iter(sectionowners[sec]))
  if not owner and not reason and sec in sectionowners:owner=next((x for x in sectionowners[sec] if x in ['Goldenrod City','Saffron City','Celadon City','Vermilion City','Pewter City','Fuchsia City','Cerulean City','New Bark Town','Violet City','Ecruteak City','Olivine City','Cianwood City','Azalea Town','Blackthorn City','Mahogany Town']),sorted(sectionowners[sec])[0])
  if not owner and not reason:raise ValueError('Unaccounted named section: '+sec+' / '+n)
  primary.append(dict(mapId=n,section=sec,region=region,location=None if reason else owner,status='excluded' if reason else 'grouped',reason=reason))
  key=(region,sec)
  if key not in sections:sections[key]=dict(region=region,section=sec,locations=sorted(sectionowners.get(sec,[])),excluded=sec in excludedSections,reason=excludedSections.get(sec))
 records=[];refbyname={r['location']:r for r in oldrefs['locations']};historicalbyname={r['name']:r for r in historical['locations']}
 borders={'Route 26','Route 27','Route 28','Tohjo Falls','Pokémon League Reception Gate','Victory Road','Indigo Plateau'}
 for name in [r['name'] for r in historical['locations']]:
  rows=oldrows[name];refs=[dict(site=r['source'],url=r['url'],status='verified-at-prior-audit',evidence='docs/atlas-encounter-audit.json',sha256=r['sha256']) for r in refbyname[name]['references'] if r['source'] in ['serebii','bulbapedia']]
  extra=kanto.get('supplemental',{}).get(name,[])
  records.append(dict(name=name,region='Kanto' if name in borders else 'Johto',expectedMapIds=maps[name],expectedEncounters=dict(kind='ordinary',baseRowCount=len(rows),baseSha256=rowhash(rows),supplemental=extra),references=refs,requiredConnections=historicalbyname[name]['connections']))
 # Safari remains a single named group with its 12 area sublocations and dynamic topology.
 safari=json.loads((ROOT/'docs/safari-v1-audit.json').read_text());safariref={'areas':[dict(id=i,name=a['area'].removeprefix('SAFARI_ZONE_AREA_').replace('_',' ').title()) for i,a in enumerate(json.loads((src.source/'files/arc/safari_enc.json').read_text())['encounters'])]}
 records.append(dict(name='Safari Zone',region='Johto',expectedMapIds=[],expectedEncounters=dict(kind='safari',catalogueRows=339,areas=[dict(id=a['id'],name=a['name']) for a in safariref['areas']],methodTables=safari['reachableMethodTables'],mechanicsSha256=safari['mechanicsSha256']),references=[dict(site='primary',status='verified-at-prior-audit',url='https://github.com/pret/pokeheartgold/blob/'+cfg['primaryRevision']+'/files/arc/safari_enc.json',evidence='docs/safari-v1-audit.json'),dict(site='serebii',url='https://www.serebii.net/heartgoldsoulsilver/safarizone.shtml',status='partially-verified-prior-audit',evidence='docs/safari-mechanics.md',uncertainty='safari-secondary-scope'),dict(site='bulbapedia',url='https://bulbapedia.bulbagarden.net/wiki/Johto_Safari_Zone',status='indexed-examples-prior-audit',evidence='docs/safari-mechanics.md',uncertainty='safari-secondary-scope')],requiredConnections=['Safari Zone Gate']))
 byname={r['name']:r for r in records};byname['Safari Zone Gate']['requiredConnections'].append('Safari Zone') if 'Safari Zone' not in byname['Safari Zone Gate']['requiredConnections'] else None
 kbyname={r['location']:r for r in kanto['locations']}
 # Reference URLs are retained from the reviewed source-page manifest, not current Atlas records.
 sourceSlugs={'Diglett’s Cave':'diglett%27scave','Mt. Moon':'mt.moon','Mt. Moon Square':'mt.moon','Kanto Radio Tower':'lavendertown','Saffron Magnet Train Station':'saffroncity','Fighting Dojo':'saffroncity','Silph Co.':'saffroncity','Celadon Department Store':'celadoncity','Celadon Game Corner':'celadoncity','Trainer House':'viridiancity','Pewter Museum of Science':'pewtercity','Underground Path':'undergroundpath5-6','Pal Park':'fuchsiacity'}
 bulb={'Diglett’s Cave':'Diglett%27s_Cave','Mt. Moon Square':'Mt._Moon','Kanto Radio Tower':'Lavender_Radio_Tower','Saffron Magnet Train Station':'Magnet_Train','Power Plant':'Kanto_Power_Plant','Trainer House':'Trainer_House','Pewter Museum of Science':'Pewter_Museum_of_Science'}
 pagebyurl={p['url']:p for p in checks['pages']}
 for c in cfg['locations']:
  name=c['name'];e=kbyname[name];serebii='https://www.serebii.net/pokearth/kanto/4th/'+sourceSlugs.get(name,re.sub('[^a-z0-9]','',name.lower()))+'.shtml';burl='https://bulbapedia.bulbagarden.net/wiki/'+bulb.get(name,('Kanto_' if name.startswith('Route ') else '')+name.replace(' ','_'))
  refs=[dict(site=site,url=url,status=pagebyurl.get(url,{}).get('status','not-checked'),evidence='docs/atlas-kanto-reference-checks.json',uncertainty='secondary-full-table-comparison') for site,url in [('serebii',serebii),('bulbapedia',burl)]]
  r=dict(name=name,region='Kanto',expectedMapIds=maps[name],expectedEncounters=dict(kind='ordinary',baseRowCount=e['rowCount'],baseSha256=e['encountersSha256'],supplemental=[]),references=refs,requiredConnections=[]);records.append(r);byname[name]=r
 for edge in cfg['connections']:
  for x,y in [(edge['fromLocation'],edge['toLocation']),(edge['toLocation'],edge['fromLocation'])]:
   if y not in byname[x]['requiredConnections']:byname[x]['requiredConnections'].append(y)
 johto=json.loads((ROOT/'docs/atlas-johto-completion.json').read_text())
 kmap=json.loads((ROOT/'docs/atlas-kanto-map-evidence.json').read_text())
 expectedAssets={**johto['mapAssetSha256'],**{m['file']:m['sha256'] for m in kmap.get('artworkAssets',[])+kmap['terrainPlans']}}
 links={}
 for path in ['docs/cave-map-links.json','docs/dungeon-map-links.json']:
  data=json.loads((ROOT/path).read_text())
  for name,details in data['locations'].items():
   links.setdefault(name,{})
   for pair in details['pairs']:links[name][pair['id']]=dict(id=pair['id'],oneWay=pair.get('oneWay',False),ends=[dict(mapId=e['mapId'],x=e['x'],y=e['y']) for e in pair['ends']])
 for rec in records:
  rec['expectedMapLinks']=list(links.get(rec['name'],{}).values())
  rec['expectedMapViewIds']=kmap.get('locationViews',{}).get(rec['name'],[])
  rec['minimumMapViews']=next((l['mapViews'] for l in johto['locations'] if l['name']==rec['name']),0 if rec['name']=='Safari Zone' else 1)
 sources=['docs/atlas-kanto-map-evidence.json','docs/atlas-johto-completion.json','docs/cave-map-links.json','docs/dungeon-map-links.json','js/data/games/soulsilver/encounter-scope.json','scripts/soulsilver-kanto-inventory.json','scripts/soulsilver-interior-rooms.json','docs/atlas-integrated-audit-2026-10-20.json','docs/atlas-encounter-audit.json','docs/atlas-kanto-primary-census.json','docs/atlas-kanto-encounter-evidence.json','docs/atlas-kanto-reference-checks.json','docs/safari-v1-audit.json']
 report=dict(schemaVersion=1,gameId='soulsilver',primaryRevision=cfg['primaryRevision'],primaryHeadersSha256=digest(headerbytes),granularity='Named geographic/facility groups. Floors and related rooms are inventoried as grouped primary headers; Safari areas are explicit sublocations. S.S. Aqua is counted once under Johto with cross-region travel. Mt. Silver follows the primary Johto region flag.',sources={p:digest((ROOT/p).read_bytes()) for p in sources},expectedAssetHashes=expectedAssets,primaryHeaderCount=len(headers),locations=records,primaryMaps=primary,namedSections=sorted(sections.values(),key=lambda x:(x['region'],x['section'])),expectedCompass=cfg['connections'],excluded=cfg['excluded'])
 (ROOT/'scripts/soulsilver-atlas-reference-inventory.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
 print(f'{len(records)} expected groups; {len(primary)} primary headers; {len(sections)} named region/section entries')
if __name__=='__main__':main()
