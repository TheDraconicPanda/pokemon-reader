"""Rebuild Platinum's native geographic/header and encounter inventory, offline.
Usage: python scripts/build-platinum-atlas.py PINNED_POKEPLATINUM_CHECKOUT
All rates are conditional slot shares, not per-step/capture probabilities.
"""
import collections,hashlib,json,pathlib,re,subprocess,sys
ROOT=pathlib.Path(__file__).resolve().parents[1];src=pathlib.Path(sys.argv[1]);REV='49f78f35ccd8c6880e189d23a630eef2976c44ac'
assert subprocess.check_output(['git','-C',str(src),'rev-parse','HEAD'],text=True).strip()==REV
sources={}
def read(path):
 raw=(src/path).read_bytes();sources[path]={'url':f'https://github.com/pret/pokeplatinum/blob/{REV}/{path}','sha256':hashlib.sha256(raw).hexdigest()};return raw.decode()
def doc(path):return json.loads(read(path))
sp={s:i for i,s in enumerate(read('generated/species.txt').splitlines())}
reader=json.loads((ROOT/'js/data/games/platinum/pokedex-reference.js').read_text().split(' = ',1)[1].rstrip(';\n'))
names={int(i):r['name'] for i,r in reader['species'].items() if int(i)<=493}
labels={m['id']:m['en_US'] for m in doc('res/text/location_names.json')['messages']}
headers={key:dict(re.findall(r'\.(\w+) = (\w+)',body)) for key,body in re.findall(r'\[(MAP_HEADER_\w+)\] = \{(.*?)\n    \}',read('include/data/map_headers.h'),re.S)}
assert len(headers)==593
allids=read('generated/map_headers.txt').splitlines();assert set(allids)-set(headers)=={'MAP_HEADER_COUNT','MAP_HEADER_DYNAMIC = 4095','MAP_HEADER_INVALID = MAP_HEADER_COUNT'}
excluded={};groups=collections.defaultdict(list);owner={}
for key,h in headers.items():
 name=labels[h['mapLabelTextID']]
 reason='Mystery Zone/system/unused header' if name=='Mystery Zone' else 'Explicit unused/Diamond-Pearl legacy header' if '_UNUSED_' in key or '_DP_' in key or name=='Battle Park' else None
 if reason:excluded[key]=reason;continue
 groups[name].append(key);owner[key]=name
links={n:set() for n in groups};edges=[];seen=set()
def link(a,b,kind,source):
 if a not in owner or b not in owner:return
 key=(a,b,kind)
 if key in seen:return
 seen.add(key);edges.append({'from':a,'to':b,'kind':kind,'source':source})
 if owner[a]!=owner[b]:links[owner[a]].add(owner[b])
for key,h in headers.items():
 if key not in owner:continue
 path='res/field/events/'+h['eventsArchiveID']+'.json'
 if not (src/path).exists():continue
 for w in doc(path).get('warp_events',[]):link(key,w['dest_header_id'],'warp',path)
# Shared outdoor matrices establish geographic adjacency; these edges do not assert
# passability. Water, ledges, object blockers and script gates remain independent.
for matrix in sorted({h['mapMatrixID'] for key,h in headers.items() if key in owner}):
 path='res/field/matrices/'+matrix+'.json'
 d=doc(path)
 for y,row in enumerate(d.get('headers',[])):
  for x,a in enumerate(row):
   for dx,dy in [(1,0),(0,1)]:
    if y+dy>=len(d['headers']) or x+dx>=len(d['headers'][y+dy]):continue
    b=d['headers'][y+dy][x+dx]
    if a!=b:link(a,b,'geographic-adjacency',path);link(b,a,'geographic-adjacency',path)
for path in ['src/overlay006/wild_encounters.c','src/overlay006/dual_slot_encounters.c','src/overlay006/great_marsh_daily_encounters.c','src/overlay006/trophy_garden_daily_encounters.c']:read(path)
marsh=doc('res/field/encounters/encounters_great_marsh_lookout.json')
swarm_code=read('src/overlay006/swarm.c')
swarm_headers=set(re.findall(r'MAP_HEADER_\w+',swarm_code.split('sSwarmMapIdTable[NUM_SWARMS] = {',1)[1].split('};',1)[0]))
assert len(swarm_headers)==22
read('src/item_use_functions.c')
land_weights=[20,20,10,10,10,10,5,5,4,4,1,1];water=[60,30,5,4,1];rod=[40,40,15,4,1]
rows={n:[] for n in groups};tables={};referenced=set()
def area_label(key,name):
 text=key.removeprefix('MAP_HEADER_').replace('_',' ').title()
 return re.sub(r'\b(B?\d+)F\b',lambda m:m[0].upper(),text,flags=re.I)
def emit(name,area,method,slots,weights,times,condition,path):
 combined={}
 for i,s in enumerate(slots):
  if s is None:continue
  sid=sp[s['species']];assert 1<=sid<=493,(path,sid)
  low=s.get('level',s.get('level_min'));high=s.get('level',s.get('level_max'));assert 1<=low<=high<=100
  k=(sid,low,high);combined[k]=combined.get(k,0)+weights[i]
 for (sid,low,high),percent in combined.items():
  rows[name].append({'area':area,'method':method,'speciesId':sid,'pokemon':names[sid],'levels':list(range(low,high+1)),'percent':percent,'times':times,'conditions':condition,'source':path,'validationStatus':'primary-verified'})
for name,keys in groups.items():
 for key in keys:
  enc=headers[key]['wildEncountersArchiveID']
  if enc=='ENCOUNTERS_NONE':continue
  path='res/field/encounters/'+enc+'.json';d=doc(path);referenced.add(path)
  area=area_label(key,name);tables[key]={'source':path,'data':d}
  if d['land_rate']:
   for time in ['morning','day','night']:
    slots=[dict(s) for s in d['land_encounters']]
    if time!='morning':
     for i,s in zip([2,3],d[time]):slots[i]['species']=s
    if name=='Great Marsh':slots[6]=slots[7]=None
    emit(name,area,'walking',slots,land_weights,[time],['Ordinary slots; no swarm, Radar-exclusive replacement or GBA dual-slot replacement'],path)
   for field,indices,condition in [('swarms',[0,1],['Active outbreak on this map']),('radar',[4,5,10,11],['Vigorous Poké Radar patch; new chain, before lead abilities']),*[(g,[8,9],[f'National Pokédex; {g.title()} in GBA slot']) for g in ['ruby','sapphire','emerald','firered','leafgreen']]]:
    # Replacement fields also exist as placeholders on unreachable habitats.
    # Swarm selection has an explicit 22-header whitelist. Radar requires actual
    # tall grass: cave/indoor tables cannot be used; Eterna Forest is the native
    # cave-typed forest exception. The independent Atlas audit checks habitats.
    if field=='swarms' and key not in swarm_headers:continue
    if field=='radar' and headers[key]['mapType'] not in ['MAP_TYPE_OUTDOORS','MAP_TYPE_TOWN_CITY'] and key!='MAP_HEADER_ETERNA_FOREST':continue
    # A no-op replacement is not an additional availability condition.
    if all(d[field][j]==d['land_encounters'][i]['species'] for j,i in enumerate(indices)):continue
    emit(name,area,'walking',[dict(d['land_encounters'][i],species=d[field][j]) for j,i in enumerate(indices)],[land_weights[i] for i in indices],[],condition,path)
   if name=='Great Marsh':
    for pool,label in [('before_national_dex','Before National Pokédex'),('after_national_dex','National Pokédex')]:
     for s in sorted(set(marsh[pool])):emit(name,area,'walking',[dict(d['land_encounters'][i],species=s) for i in [6,7]],[5,5],[],[label,'Daily selection for this area: replaces slots 6 and 7; conditional share, not daily selection probability'],path)
  for field,method,weights in [('surf','surfing',water),('old_rod','old_rod',water),('good_rod','good_rod',rod),('super_rod','super_rod',rod)]:
   if d[field+'_rate']:emit(name,area,method,d[field+'_encounters'],weights,[],[],path)
locations=[]
for name,keys in groups.items():
 kinds={headers[k]['mapType'] for k in keys}
 typ='route' if name.startswith('Route ') else 'town' if 'MAP_TYPE_TOWN_CITY' in kinds else 'landmark' if kinds&{'MAP_TYPE_CAVE','MAP_TYPE_OUTDOORS'} else 'facility'
 locations.append({'id':re.sub(r'[^a-z0-9]+','-',name.lower()).strip('-'),'name':name,'region':'Sinnoh','gameId':'platinum','type':typ,'details':f'{len(keys)} native map area'+('s' if len(keys)!=1 else '')+'.','landmarks':[area_label(k,name) for k in keys], 'access':['Connections are reference links; geographic adjacency does not establish a traversable tile path or automatic progression access.'],'connections':sorted(links[name]),'headers':keys,'sources':[{'url':f'https://github.com/pret/pokeplatinum/blob/{REV}/include/data/map_headers.h','label':'Platinum native map headers'}],'validationStatus':'primary-verified'})
allenc={p.relative_to(src).as_posix() for p in (src/'res/field/encounters').glob('encounters_*.json') if 'land_rate' in json.loads(p.read_text())}
report={'gameId':'platinum','revision':REV,'totalHeaders':len(headers),'includedHeaders':len(owner),'excludedHeaders':excluded,'locations':len(locations),'encounterTables':len(tables),'uniqueEncounterFiles':len(referenced),'unreferencedEncounterFiles':sorted(allenc-referenced),'connections':len(edges),'sources':sources}
data={'gameId':'platinum','schemaVersion':1,'revision':REV,'locations':locations,'encounters':rows,'headers':{k:{**v,'location':owner.get(k),'excludedReason':excluded.get(k)} for k,v in headers.items()},'connections':edges,'tables':tables,'greatMarshPools':{k:[sp[s] for s in marsh[k]] for k in ['before_national_dex','after_national_dex']}}
(ROOT/'js/data/games/platinum/atlas.js').write_text('// Generated by scripts/build-platinum-atlas.py; native Platinum inventory.\nexport const PLATINUM_ATLAS = '+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n')
(ROOT/'docs/platinum-atlas-inventory.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(f'{len(locations)} locations, {len(owner)}/{len(headers)} included headers, {len(tables)} encounter tables, {sum(map(len,rows.values()))} rows, {len(edges)} connections.')
