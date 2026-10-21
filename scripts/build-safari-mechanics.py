"""Generate SoulSilver Safari rules/tables from the pinned clean HGSS source.
Usage: python scripts/build-safari-mechanics.py work/safari-primary
No save offsets or guide-derived encounter data are inferred here.
"""
import hashlib, importlib.util, json, pathlib, re, struct, subprocess, sys
ROOT=pathlib.Path(__file__).resolve().parents[1]
source=pathlib.Path(sys.argv[1]).resolve()
REV='d2355244ac42b3c6e40d8c36aa3564ee8706dea4'
assert subprocess.check_output(['git','-C',str(source),'rev-parse','HEAD'],text=True).strip()==REV
inputs={}
def read(name):
 data=(source/name).read_bytes();inputs[name]=hashlib.sha256(data).hexdigest();return data.decode()
constants=read('include/constants/safari.h')
values={k:int(v)for k,v in re.findall(r'#define\s+(\w+)\s+(\d+)\b',constants)}
species={k:int(v)for k,v in re.findall(r'#define\s+(SPECIES_\w+)\s+(\d+)\b',read('include/constants/species.h'))}
raw=json.loads(read('files/arc/safari_enc.json'))['encounters']
read('files/arc/safari_enc.json.txt')
code=read('src/unk_02097268.c');read('src/field/encounter_check.c');zone=read('src/safari_zone.c')
read('src/unk_02055418.c');read('src/unk_02092BE8.c');read('src/application/pokegear/phone/scripts/phone_scripts_baoba.c')
read('files/fielddata/script/scr_seq/scr_seq_0119_D47R0101.s');read('src/map_matrix.c')
asm=read('asm/overlay_108_021E8850.s')
assert 'areaSet->areaLevels[szArea->area_no] / 10' in code
assert 'ret[numBonusMons].species' in code and 'i < loadedEncData[encounterType].numBonusMons' in code
assert 'LCRandom() % NUM_ENCOUNTERS_SAFARI' in (source/'src/field/encounter_check.c').read_text()
thresholds={}
for key,numbers in re.findall(r'\[SAFARI_ZONE_OBJECT_TYPE_(\w+)\s*- 1\] = \{([^}]+)',code):
 thresholds[key.lower()]=[int(n)*10 for n in re.findall(r'\d+',numbers)]+[250]
assert len(thresholds)==4
spec=importlib.util.spec_from_file_location('interiors',ROOT/'scripts/build-soulsilver-interiors.py');helper=importlib.util.module_from_spec(spec);spec.loader.exec_module(helper)
land_path='files/a/0/6/5';land=(source/land_path).read_bytes();inputs[land_path]=hashlib.sha256(land).hexdigest();members=helper.narc_members(land)
read('include/constants/metatile_behavior.h');read('src/metatile_behavior.c')
# Primary behavior 0x10 is river; 0x15 is sea. Both have surf+encounter flags.
# The five water areas have large explicit river/sea regions; no dry area does.
water=[];terrain=[]
for i in range(12):
 blob=members[652+i];assert struct.unpack_from('<I',blob)[0]==0x800
 attrs=struct.unpack('<1024H',blob[0x14:0x814]);n=sum((v&255)in[16,21] for v in attrs)
 terrain.append({'areaId':i,'model':652+i,'riverSeaTiles':n,'attributesSha256':hashlib.sha256(blob[0x14:0x814]).hexdigest()})
 if n:water.append(i)
assert water==[1,4,5,7,8]
areas=[]
for i,a in enumerate(raw):
 assert values[a['area']]==i
 methods={}
 for method in ['land','surf','oldrod','goodrod','superrod']:
  if method!='land' and i not in water:continue
  m=a[method]
  base=[[[species[x['species']],x['level']]for x in m['mons'][t]]for t in ['morn','day','nite']]
  assert all(len(x)==10 for x in base)
  bonus=[{'id':n,'requirements':{c['object_type'].removeprefix('SAFARI_ZONE_OBJECT_TYPE_').lower():c['count']for c in b['conditions']},'mons':[[species[b[t]['species']],b[t]['level']]for t in ['morn','day','nite']]}for n,b in enumerate(m['bonus_mons'])]
  assert all(1<=mon[0]<=493 and 1<=mon[1]<=100 for table in base for mon in table)
  methods[method]={'base':base,'bonus':bonus}
 areas.append({'id':i,'name':a['area'].removeprefix('SAFARI_ZONE_AREA_').replace('_',' ').title(),'methods':methods})
# Four object sets, each containing three scoring objects and three decorations.
labels=['ov108_021EACE8','ov108_021EAD00','ov108_021EACF8','ov108_021EACF0']
def bytes_at(label):
 part=asm.split(label+':')[1].split('\n\n')[0];return [int(x,16)for x in re.findall(r'0x([0-9A-Fa-f]{2})\b',part)]
groups=[bytes_at(label)for label in labels];orders=[bytes_at('ov108_021EAD28')[i:i+4]for i in range(0,40,4)]
assert all(len(x)==6 for x in groups) and len(orders)==10 and all(sorted(x)==[0,1,2,3]for x in orders)
objects=[]
for key,model,waterOnly,width,height,gender,category in re.findall(r'\[SAFARI_ZONE_OBJECTID_(\w+)\]\s*= \{\s*(\w+),\s*(TRUE|FALSE),\s*(\d+),\s*(\d+),\s*(TRUE|FALSE),\s*SAFARI_ZONE_OBJECT_TYPE_(\w+)\s*\}',code):
 objects.append({'id':values['SAFARI_ZONE_OBJECTID_'+key],'name':key.replace('_',' ').title().strip(),'category':category.lower(),'width':int(width),'height':int(height),'waterOnly':waterOnly=='TRUE','slotCost':1})
assert len(objects)==24
sets=zone.split('static const u8 sSafariZoneDefaultAreaSets')[1].split(';')[0]
layouts=[[values[k]for k in re.findall(r'SAFARI_ZONE_AREA_[A-Z_]+',row)]for row in re.findall(r'\{([^{}]+)\}',sets)]
assert len(layouts)==10 and all(len(set(x))==6 and x[4]==3 for x in layouts)
data={'gameId':'soulsilver','schemaVersion':1,'revision':REV,'maxBlocks':30,'thresholds':thresholds,'objects':objects,'objectGroups':groups,'objectGroupOrders':orders,'initialLayouts':layouts,'waterAreas':water,'areas':areas}
subprocess.run(['git','-C',str(source),'diff','--exit-code',REV,'--',*inputs],check=True,stdout=subprocess.DEVNULL)
out=ROOT/'js/data/games/soulsilver/safari-mechanics.js'
out.write_text('// Generated by scripts/build-safari-mechanics.py; see docs/safari-mechanics.md.\nconst freeze=value=>{if(value&&typeof value==="object"){Object.values(value).forEach(freeze);Object.freeze(value);}return value;};\nexport const SOULSILVER_SAFARI_MECHANICS = freeze('+json.dumps(data,ensure_ascii=False,separators=(',',':'))+');\n')
ledger={'revision':REV,'sources':{name:{'sha256':sha,'url':f'https://github.com/pret/pokeheartgold/blob/{REV}/{name}'}for name,sha in inputs.items()},'terrain':terrain,'areas':len(areas),'reachableMethodTables':sum(len(a['methods'])for a in areas),'baseSlots':sum(len(m['base'])*10 for a in areas for m in a['methods'].values()),'bonusTimeSlots':sum(len(m['bonus'])*3 for a in areas for m in a['methods'].values()),'generatedSha256':hashlib.sha256(out.read_bytes()).hexdigest()}
(ROOT/'docs/safari-mechanics-sources.json').write_text(json.dumps(ledger,indent=2)+'\n')
print({k:v for k,v in ledger.items()if k not in ['sources','terrain']})
