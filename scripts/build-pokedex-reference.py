"""Build audited HGSS reference records, never modern mechanics.

python scripts/build-pokedex-reference.py work/pokedex-source
Input: pinned pret/pokeheartgold archive extracted here, plus pinned PokéAPI CSVs.
No network access occurs in this generator. See docs/reference-pokedex.md.
"""
import csv, io, hashlib, json, pathlib, re, struct, sys
ROOT = pathlib.Path(__file__).resolve().parents[1]
source = pathlib.Path(sys.argv[1])
HGSS = 'd2355244ac42b3c6e40d8c36aa3564ee8706dea4'
API = '6fd69dfe90465ba96534f6816fc817737d1f97f6'
pret = source / ('pokeheartgold-' + HGSS)
used = {}
def read(path, origin='pret'):
    file = (pret if origin == 'pret' else source) / path
    data = file.read_bytes()
    used[origin+':'+path] = {'url': f'https://github.com/{"pret/pokeheartgold" if origin=="pret" else "PokeAPI/pokeapi"}/blob/{HGSS if origin=="pret" else API}/{path if origin=="pret" else "data/v2/csv/"+path}', 'sha256': hashlib.sha256(data).hexdigest()}
    return data

def rows(name): return list(csv.DictReader(io.StringIO(read(name+'.csv','api').decode())))
def constants(name):return {a:int(b) for a,b in re.findall(r'^#define\s+(\w+)\s+(\d+)\s*$',read('include/constants/'+name+'.h').decode(),re.M)}
def narc(path):
    data=read(path); offset=16; parts={}
    for _ in range(3):
        size=struct.unpack_from('<I',data,offset+4)[0];parts[data[offset:offset+4]]=data[offset+8:offset+size];offset+=size
    fat=parts[b'BTAF']
    return [parts[b'GMIF'][a:b]for a,b in [struct.unpack_from('<II',fat,4+8*i)for i in range(struct.unpack_from('<H',fat)[0])]]
def words(data):return struct.unpack('<'+'H'*(len(data)//2),data)
def localized(name,idkey):return {int(r[idkey]):r['name']for r in rows(name)if r['local_language_id']=='9'}
normalize=lambda s:re.sub('[^a-z0-9]','',s.lower())
sp=localized('pokemon_species_names','pokemon_species_id');mn=localized('move_names','move_id');an=localized('ability_names','ability_id');it=localized('item_names','item_id')
item_names={normalize(n):n for n in it.values()}
item_names['stick']='Stick';item_names['thunderstone']='Thunderstone';item_names['deepseascale']='Deep Sea Scale';item_names['deepseatooth']='Deep Sea Tooth'
def item(k):
    if k=='ITEM_NONE':return None
    key=normalize(k.removeprefix('ITEM_')); assert key in item_names,k
    return item_names[key]
sc=constants('species');mc=constants('moves');ac=constants('abilities')
personal=json.loads(read('files/poketool/personal/personal.json'))['baseStats']
learn=narc('files/poketool/personal/wotbl.narc')
eggs={}; sid=None
for w in words(narc('files/fielddata/sodateya/kowaza_list.narc')[0]):
    if w==65535:break
    if w>20000:sid=w-20000;eggs[sid]=[]
    else: assert 1<=w<=467;eggs[sid].append(w)
tutor={sc[r['mon']]:[mc[m.replace('TUTOR_','MOVE_')]for m in r['moves']]for r in json.loads(read('files/fielddata/wazaoshie/waza_oshie.json'))['tutor']}
tutor_code=read('src/field/scrcmd_move_tutor.c').decode()
tutor_info={mc[m]:{'cost':int(cost),'location':'Ilex Forest' if npc=='HEADBUTT' else 'Frontier Access'}for m,cost,npc in re.findall(r'\{\s*(MOVE_\w+),\s*(\d+),\s*MOVE_TUTOR_NPC_(\w+)\s*}',tutor_code)}
# Blackthorn tutors are separate from the BP/Headbutt bitset; source script checks
# final starter species and Dragon typing, plus friendship 255 (including Arceus).
read('files/fielddata/script/scr_seq/scr_seq_0948_T30R0601.s')
for m in [307,308,338,434]:tutor_info[m]={'cost':0,'location':'Blackthorn City','condition':'Friendship 255; Draco Meteor requires Dragon typing (Draco Plate for Arceus)' if m==434 else 'Final starter evolution; friendship 255'}
for move,ids in [(307,[6,157,257,392]),(308,[9,160,260,395]),(338,[3,154,254,389])]:
    for i in ids:tutor.setdefault(i,[]).append(move)
for i,p in enumerate(personal):
    if 'TYPE_DRAGON' in p['types'] or i==493:tutor.setdefault(i,[]).append(434)
# Machine assignments come from the game, compatibility from personal.json.
item_code=read('src/item.c').decode();block=item_code.split('static const u16 sTMHMMoves[] = {')[1].split('};')[0]
tm_moves=[mc[m]for m in re.findall(r'^\s*(MOVE_\w+)',block,re.M)]; assert len(tm_moves)==100
machines={('TM'+str(i+1).zfill(2) if i<92 else 'HM'+str(i-91).zfill(2)):m for i,m in enumerate(tm_moves)}
ability_text={int(r['ability_id']):r['flavor_text'].replace('\n',' ').replace('\f',' ') for r in rows('ability_flavor_text') if r['version_group_id']=='10'and r['language_id']=='9'}
abilities={i:{'name':an[i],'description':ability_text[i]}for i in range(1,124)}
assert len(ability_text)==123
# Only gen IV type IDs. Past entries name the LAST generation that used a pair.
type_names={int(r['type_id']):r['name'].lower()for r in rows('type_names')if r['local_language_id']=='9'}
chart={(int(r['damage_type_id']),int(r['target_type_id'])):int(r['damage_factor'])/100 for r in rows('type_efficacy')if int(r['damage_type_id'])<=17 and int(r['target_type_id'])<=17}
for r in rows('type_efficacy_past'):
    if int(r['generation_id'])>=4:chart[int(r['damage_type_id']),int(r['target_type_id'])]=int(r['damage_factor'])/100
chart={type_names[a]:{type_names[b]:v for (x,b),v in chart.items()if x==a}for a in range(1,18)}
regional=[int(r['species_id'])for r in sorted([r for r in rows('pokemon_dex_numbers')if r['pokedex_id']=='7'],key=lambda r:int(r['pokedex_number']))]; assert len(regional)==256 and regional[0]==152
edges=[]
for r in json.loads(read('files/poketool/personal/evo.json'))['evoTable']:
    for e in r['evos']:
        param=e['param']; method=e['method']
        if isinstance(param,str):param=item(param) if param.startswith('ITEM_') else mn[mc[param]] if param.startswith('MOVE_') else sp[sc[param]]
        edge={'from':sc[r['baseSpecies']],'to':sc[e['target']],'method':method,'param':param}
        if edge not in edges:edges.append(edge)
# Record implementation evidence for held odds, stat floors and evolution predicates.
read('src/pokemon.c')
form_meta={496:(386,'Attack Forme',10001),497:(386,'Defense Forme',10002),498:(386,'Speed Forme',10003),499:(413,'Sandy Cloak',10004),500:(413,'Trash Cloak',10005),501:(487,'Origin Forme',10007),502:(492,'Sky Forme',10006),503:(479,'Heat Rotom',10008),504:(479,'Wash Rotom',10009),505:(479,'Frost Rotom',10010),506:(479,'Fan Rotom',10011),507:(479,'Mow Rotom',10012)}
records={}
for i,p in enumerate(personal):
    if i==0 or i in [494,495]:continue
    base,label,sprite=form_meta.get(i,(i,'Standard',i))
    if base>493:continue
    level=[]
    for w in words(learn[i]):
        if w==65535:break
        level.append([w>>9,w&511])
    assert all(1<=m<=467 and 1<=l<=100 for l,m in level)
    records[i]={'id':base,'name':sp[base],'form':label,'sprite':sprite,'types':list(dict.fromkeys(t.removeprefix('TYPE_').lower()for t in p['types'])),'stats':[p[k]for k in ['hp','atk','def','spatk','spdef','speed']],'evYield':[p[k+'_yield']for k in ['hp','atk','def','spatk','spdef','speed']],'abilities':list(dict.fromkeys(ac[a]for a in p['abilities']if a!='ABILITY_NONE')),'items':[item(k)for k in p['items']],'machines':['TM'+str(n).zfill(2)for n in p['tms']]+['HM'+str(n).zfill(2)for n in p['hms']],'levelMoves':level,'eggMoves':eggs.get(base,[]),'tutorMoves':sorted(set(tutor.get(i,[])))}
# Independent all-species cross-check against PokéAPI HGSS, kept as evidence of
# differences rather than silently overwriting primary game records.
comparison={}; checks={'level':0,'egg':0,'machines':0,'tutor':0}
for r in rows('pokemon_moves'):
    i=int(r['pokemon_id']); method=int(r['pokemon_move_method_id'])
    if r['version_group_id']!='10' or i>493 or method not in [1,2,3,4]:continue
    comparison.setdefault((i,method),set()).add((int(r['level']),int(r['move_id'])) if method==1 else int(r['move_id']))
differences=[]
for i in range(1,494):
    r=records[i]
    for method,key,actual in [(1,'level',{tuple(m)for m in r['levelMoves']}),(2,'egg',set(r['eggMoves'])),(3,'tutor',set(r['tutorMoves'])),(4,'machines',{machines[m]for m in r['machines']})]:
        expected=comparison.get((i,method),set());checks[key]+=1
        if actual!=expected:differences.append({'species':i,'section':key,'primaryOnly':sorted(actual-expected),'apiOnly':sorted(expected-actual)})
assert not differences, 'HGSS move-list discrepancy: inspect comparison before regenerating reference data'
data={'gameId':'soulsilver','generation':4,'schemaVersion':1,'sources':used,'regional':regional,'species':records,'abilities':abilities,'machines':machines,'tutors':tutor_info,'typeChart':chart,'evolutions':edges}
(ROOT/'js/data/games/soulsilver/pokedex-reference.js').write_text('// Generated by scripts/build-pokedex-reference.py; primary HGSS mechanics.\nexport const SOULSILVER_POKEDEX = '+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n')
(source/'comparison.json').write_text(json.dumps({'checks':checks,'differences':differences},indent=2))
print('Built',len(records),'species/form records;',len(edges),'evolution edges;',len(used),'sources. Cross-check differences:',len(differences))
