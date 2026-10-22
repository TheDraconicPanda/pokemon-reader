"""Offline, pinned Platinum Pokédex. Usage: python scripts/build-platinum-pokedex.py CHECKOUT CSV_DIR.
Primary facts win over reference aggregations; every discrepancy is reported.
"""
import csv, hashlib, json, pathlib, re, subprocess, sys
ROOT=pathlib.Path(__file__).resolve().parents[1]
source,api=map(pathlib.Path,sys.argv[1:3])
REV='49f78f35ccd8c6880e189d23a630eef2976c44ac'; API='6fd69dfe90465ba96534f6816fc817737d1f97f6'
assert subprocess.check_output(['git','-C',str(source),'rev-parse','HEAD'],text=True).strip()==REV
assert not subprocess.check_output(['git','-C',str(source),'status','--porcelain','--untracked-files=no'],text=True).strip()
used={}
def read(path,origin='primary'):
 raw=((source if origin=='primary' else api)/path).read_bytes()
 used[origin+':'+path]={'sha256':hashlib.sha256(raw).hexdigest(),'url':f'https://github.com/{"pret/pokeplatinum" if origin=="primary" else "PokeAPI/pokeapi"}/blob/{REV if origin=="primary" else API}/{path if origin=="primary" else "data/v2/csv/"+path}'}
 return raw.decode()
def doc(path):return json.loads(read(path))
def ids(name):return {v:i for i,v in enumerate(read(f'generated/{name}.txt').splitlines())}
sp,mv,ab,it=map(ids,['species','moves','abilities','items'])
def bundled(path):return json.loads((ROOT/path).read_text().split(' = ',1)[1].rstrip(';\n'))
shared=bundled('js/data/games/soulsilver/pokedex-reference.js')
names={int(i):p['name'] for i,p in shared['species'].items() if int(i)<=493}
move_names={i:doc('res/moves/'+key[5:].lower()+'/data.json')['name'] for key,i in mv.items() if 1<=i<=467}
def item(key):return None if key=='ITEM_NONE' else doc('res/items/data/'+key[5:].lower()+'.json')['name']
keys=['hp','attack','defense','special_attack','special_defense','speed']
forms={496:(386,'attack','Attack Forme',10001),497:(386,'defense','Defense Forme',10002),498:(386,'speed','Speed Forme',10003),499:(413,'sandy','Sandy Cloak',10004),500:(413,'trash','Trash Cloak',10005),501:(487,'origin','Origin Forme',10007),502:(492,'sky','Sky Forme',10006),503:(479,'heat','Heat Rotom',10008),504:(479,'wash','Wash Rotom',10009),505:(479,'frost','Frost Rotom',10010),506:(479,'fan','Fan Rotom',10011),507:(479,'mow','Mow Rotom',10012)}
slugs={i:key[8:].lower() for key,i in sp.items() if 1<=i<=493}
machines={f'{prefix}{i:02}':mv[doc(f'res/items/data/{prefix.lower()}{i:02}.json')['teachesMove']] for prefix,n in [('TM',92),('HM',8)] for i in range(1,n+1)}
tutors={mv[t['move']]:{'location':t['location'].removeprefix('TUTOR_LOCATION_').replace('_',' ').title(),'costLabel':', '.join(f'{t[c+"Cost"]} {c}' for c in ['red','blue','yellow','green'] if t[c+'Cost'])+' Shards'} for t in doc('res/pokemon/move_tutors.json')}
for path in ['res/field/scripts/scripts_route_210_grandma_wilma_house.s','res/field/scripts/scripts_route_228_north_house.s']:read(path)
for m in [307,308,338,434]:tutors[m]={'location':'Route 210 — Grandma Wilma' if m==434 else 'Route 228 — north house','condition':'Friendship 255; Dragon typing (Draco Plate for Arceus)' if m==434 else 'Final starter evolution; friendship 255'}
method_map={'EVO_LEVEL_HAPPINESS':'EVO_FRIENDSHIP','EVO_LEVEL_HAPPINESS_DAY':'EVO_FRIENDSHIP_DAY','EVO_LEVEL_HAPPINESS_NIGHT':'EVO_FRIENDSHIP_NIGHT','EVO_TRADE_WITH_HELD_ITEM':'EVO_TRADE_ITEM','EVO_USE_ITEM':'EVO_STONE','EVO_USE_ITEM_MALE':'EVO_STONE_MALE','EVO_USE_ITEM_FEMALE':'EVO_STONE_FEMALE','EVO_LEVEL_WITH_HELD_ITEM_DAY':'EVO_ITEM_DAY','EVO_LEVEL_WITH_HELD_ITEM_NIGHT':'EVO_ITEM_NIGHT','EVO_LEVEL_KNOW_MOVE':'EVO_HAS_MOVE','EVO_LEVEL_SPECIES_IN_PARTY':'EVO_OTHER_PARTY_MON','EVO_LEVEL_PID_LOW':'EVO_LEVEL_PID_LO','EVO_LEVEL_PID_HIGH':'EVO_LEVEL_PID_HI','EVO_LEVEL_BEAUTY':'EVO_BEAUTY','EVO_LEVEL_MAGNETIC_FIELD':'EVO_CORONET','EVO_LEVEL_MOSS_ROCK':'EVO_ETERNA','EVO_LEVEL_ICE_ROCK':'EVO_ROUTE217'}
records={};edges=[]
for key in list(range(1,494))+list(forms):
 base,form,label,sprite=forms.get(key,(key,None,'Standard',key))
 p=doc(f'res/pokemon/{slugs[base]}/'+(f'forms/{form}/' if form else '')+'data.json');learn=p['learnset']
 tutor=[mv[m] for m in learn.get('by_tutor',[])]
 for m,allowed in [(307,[6,157,257,392]),(308,[9,160,260,395]),(338,[3,154,254,389])]:
  if base in allowed:tutor.append(m)
 if 'TYPE_DRAGON' in p['types'] or base==493:tutor.append(434)
 records[key]={'id':base,'name':names[base],'form':label,'sprite':sprite,'types':list(dict.fromkeys(t[5:].lower() for t in p['types'])),'stats':[p['base_stats'][k] for k in keys],'evYield':[p['ev_yields'][k] for k in keys],'abilities':list(dict.fromkeys(ab[a] for a in p['abilities'] if a!='ABILITY_NONE')),'items':[item(p['held_items'][k]) for k in ['common','rare']],'machines':learn.get('by_tm',[]),'levelMoves':[[l,mv[m]] for l,m in learn.get('by_level',[])],'eggMoves':[mv[m] for m in learn.get('egg_moves',[])],'tutorMoves':sorted(set(tutor))}
 if form:continue
 for edge in p.get('evolutions',[]):
  method,target=edge[0],edge[-1];param=edge[1] if len(edge)>2 else 0
  if isinstance(param,str):param=item(param) if param.startswith('ITEM_') else move_names[mv[param]] if param.startswith('MOVE_') else names[sp[param]]
  edges.append({'from':base,'to':sp[target],'method':method_map.get(method,method),'param':param})
def text(m):return (''.join(m['en_US']) if isinstance(m['en_US'],list) else m['en_US']).replace('\n',' ')
an=doc('res/text/ability_names.json')['messages'];ad=doc('res/text/ability_descriptions.json')['messages']
abilities={i:{'name':text(an[i]),'description':text(ad[i])} for i in range(1,124)}
regional=[sp[s] for s in doc('res/pokemon/sinnoh_pokedex.json')[1:]]
comp={}
for r in csv.DictReader(read('pokemon_moves.csv','api').splitlines()):
 i,m=int(r['pokemon_id']),int(r['pokemon_move_method_id'])
 if r['version_group_id']!='9' or i>493 or m not in [1,2,3,4]:continue
 comp.setdefault((i,m),set()).add((int(r['level']),int(r['move_id'])) if m==1 else int(r['move_id']))
differences=[]
for i in range(1,494):
 r=records[i]
 for method,k,actual in [(1,'level',{tuple(m) for m in r['levelMoves']}),(2,'egg',set(r['eggMoves'])),(3,'tutor',set(r['tutorMoves'])),(4,'machines',{machines[m] for m in r['machines']})]:
  expected=comp.get((i,method),set())
  if actual!=expected:differences.append({'species':i,'section':k,'primaryOnly':sorted(actual-expected),'apiOnly':sorted(expected-actual)})
api_regional=[int(r['species_id']) for r in sorted([r for r in csv.DictReader(read('pokemon_dex_numbers.csv','api').splitlines()) if r['pokedex_id']=='6'],key=lambda r:int(r['pokedex_number']))]
assert regional==api_regional and len(regional)==210
report={'gameId':'platinum','primaryRevision':REV,'independentRevision':API,'moveListComparisons':493*4,'regionalOrderingMatches':True,'differences':differences,'sources':used}
(ROOT/'docs/platinum-pokedex-audit.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
assert not differences, 'Inspect documented differences; do not overwrite primary facts to match aggregation'
data={'gameId':'platinum','generation':4,'schemaVersion':1,'regional':regional,'species':records,'abilities':abilities,'machines':machines,'tutors':tutors,'typeChart':shared['typeChart'],'evolutions':edges}
(ROOT/'js/data/games/platinum/pokedex-reference.js').write_text('// Generated by scripts/build-platinum-pokedex.py; pinned Platinum mechanics.\nexport const PLATINUM_POKEDEX = '+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n')
print(f'Built {len(records)} records, {len(edges)} edges; {493*4} independent move-list comparisons, {len(differences)} differences.')
