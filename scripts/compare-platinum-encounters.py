"""Independent Platinum slot comparison. No network. Usage: python ... CSV_DIR.
Compares each ordinary PokéAPI area with native tables in the SAME location.
This does not infer floor names from equal tables or overwrite primary facts.
"""
import collections,csv,hashlib,json,pathlib,re,sys,unicodedata
ROOT=pathlib.Path(__file__).resolve().parents[1];api=pathlib.Path(sys.argv[1]);REV='6fd69dfe90465ba96534f6816fc817737d1f97f6';sources={}
def rows(name):
 p=api/(name+'.csv');raw=p.read_bytes();sources[name]={'sha256':hashlib.sha256(raw).hexdigest(),'url':f'https://github.com/PokeAPI/pokeapi/blob/{REV}/data/v2/csv/{name}.csv'};return list(csv.DictReader(raw.decode().splitlines()))
def bundled(path):return json.loads((ROOT/path).read_text().split(' = ',1)[1].rstrip(';\n'))
d=bundled('js/data/games/platinum/atlas.js');sp=bundled('js/data/games/platinum/species-identifiers.js')
norm=lambda n:re.sub('[^a-z0-9]','',unicodedata.normalize('NFKD',n.lower().removeprefix('sinnoh-')))
locations={norm(l['name']):l['name'] for l in d['locations']};loc={r['id']:r for r in rows('locations')};areas={r['id']:r for r in rows('location_areas')};slots={r['id']:r for r in rows('encounter_slots')}
entries=[r for r in rows('encounters') if r['version_id']=='14'];cond=collections.defaultdict(set)
for r in rows('encounter_condition_value_map'):cond[r['encounter_id']].add(int(r['encounter_condition_value_id']))
rows('encounter_condition_values');rows('encounter_methods')
allowed={2,3,4,5,7,8,181,202};ordinary={};weights={'land':[20,20,10,10,10,10,5,5,4,4,1,1],'surf':[60,30,5,4,1],'old_rod':[60,30,5,4,1],'good_rod':[40,40,15,4,1],'super_rod':[40,40,15,4,1]};fields={1:'land',2:'old_rod',3:'good_rod',4:'super_rod',5:'surf'}
for r in entries:
 slot=slots[r['encounter_slot_id']];method=int(slot['encounter_method_id']);conditions=cond[r['id']]
 if method not in fields or not conditions.issubset(allowed):continue
 for time,timeid in [('morning',3),('day',4),('night',5)]:
  if conditions&{3,4,5} and timeid not in conditions:continue
  key=(fields[method],time,int(slot['slot'])-1)
  ordinary.setdefault(r['location_area_id'],{}).setdefault(key,set()).add((int(r['pokemon_id']),int(r['min_level']),int(r['max_level']),int(slot['rarity'])))
def native(table):
 result={}
 for field in weights:
  if not table[field+'_rate']:continue
  for time in ['morning','day','night']:
   values=[dict(s) for s in table[field+'_encounters']]
   if field=='land' and time!='morning':
    for i,v in zip([2,3],table[time]):values[i]['species']=v
   for i,v in enumerate(values):result[field,time,i]={(sp[v['species']],v.get('level',v.get('level_min')),v.get('level',v.get('level_max')),weights[field][i])}
 return result
natives={key:native(v['data']) for key,v in d['tables'].items()}
compared=[];diffs=[];matched=set()
for ident,expected in sorted(ordinary.items(),key=lambda r:int(r[0])):
 a=areas[ident];slug=loc[a['location_id']]['identifier'];name=locations.get(norm(slug.replace('sea-route','route')));candidates=[h for h in natives if d['headers'][h]['location']==name]
 if not candidates:diffs.append({'apiArea':ident,'apiLocation':slug,'area':a['identifier'],'reason':'No matching native location group'});continue
 distance=lambda h:sum(natives[h].get(k,set())!=expected.get(k,set()) for k in natives[h].keys()|expected.keys())
 exact=[h for h in candidates if distance(h)==0]
 if exact:compared.append({'apiArea':int(ident),'location':name,'apiSection':a['identifier'],'matchingNativeHeaders':exact,'slotComparisons':len(expected)});matched.update(exact)
 else:
  best=min(candidates,key=distance);actual=natives[best]
  diffs.append({'apiArea':int(ident),'location':name,'apiSection':a['identifier'],'closestNativeHeader':best,'differentSlots':[{'method':k[0],'time':k[1],'slot':k[2],'primary':sorted(actual.get(k,set())),'independent':sorted(expected.get(k,set()))} for k in sorted(actual.keys()|expected.keys()) if actual.get(k,set())!=expected.get(k,set())]})
report={'gameId':'platinum','independentRevision':REV,'atlasInputSha256':hashlib.sha256((ROOT/'js/data/games/platinum/atlas.js').read_bytes()).hexdigest(),'versionId':14,'ordinaryAreaCount':len(ordinary),'exactAreas':len(compared),'slotComparisons':sum(r['slotComparisons'] for r in compared),'matches':compared,'differences':diffs,'nativeHeadersWithoutExactIndependentMatch':sorted(set(natives)-matched),'sources':sources,'scope':'Ordinary grass time tables and Surf / all rods, comparing slot species, min/max levels and weights. Matching tables within one location do not establish floor-name equivalence. Dynamic replacement and scripted systems have separate audits.'}
(ROOT/'docs/platinum-encounter-comparison.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(f'{len(compared)}/{len(ordinary)} independent ordinary areas match exactly; {len(diffs)} differences; {report["slotComparisons"]} slot/time/method comparisons.')
for diff in diffs:print(json.dumps(diff,ensure_ascii=False)[:1200])
