"""Extract Safari identities/topology evidence from the pinned HGSS checkout.
Usage: python scripts/build-safari-reference.py work/safari-source/pokeheartgold-<revision>
This reads source files only; it does not decode a user's Safari save state.
"""
import hashlib,json,pathlib,re,sys
root=pathlib.Path(__file__).resolve().parents[1]
source=pathlib.Path(sys.argv[1]);rev='d2355244ac42b3c6e40d8c36aa3564ee8706dea4'
files=['include/constants/safari.h','src/safari_zone.c','src/map_matrix.c','files/fielddata/eventdata/zone_event/314_D47R0102.json','files/fielddata/script/scr_seq/scr_seq_0119_D47R0101.s']
texts={f:(source/f).read_text()for f in files}
constants={k:int(v)for k,v in re.findall(r'#define\s+(SAFARI_ZONE_AREA_\w+)\s+(\d+)',texts[files[0]])}
assert constants['SAFARI_ZONE_AREA_SET_COLS']==3 and constants['SAFARI_ZONE_AREA_SET_ROWS']==2
areas=sorted([(n,k.removeprefix('SAFARI_ZONE_AREA_').replace('_',' ').title())for k,n in constants.items()if not k.startswith('SAFARI_ZONE_AREA_SET_')])
assert len(areas)==12 and [i for i,n in areas]==list(range(12))
first=texts['src/safari_zone.c'].split('static const u8 sSafariZoneDefaultAreaSets')[1].split('\n    {')[1].split('}')[0]
example=[constants[k]for k in re.findall('SAFARI_ZONE_AREA_[A-Z_]+',first)];assert len(example)==len(set(example))==6
assert '(y * SAFARI_ZONE_AREA_SET_COLS) + x' in texts['src/map_matrix.c']
assert 'models[width * (y + 1) + x + 1]' in texts['src/map_matrix.c']
assert '79, 100, DIR_NORTH' in texts[files[-1]]
warps=json.loads(texts[files[-2]])['warps'];assert [(w['x'],w['z'])for w in warps]==[(79,100),(80,100)]
# Active models occupy x=1..3/y=1..2 in 32-tile blocks; gate warp
# is x=2/y=3, immediately south of active bottom-center slot 4.
assert 79//32==2 and 100//32==3
output={'gameId':'soulsilver','schemaVersion':1,'columns':3,'rows':2,'entrancePosition':4,'areas':[{'id':i,'name':n}for i,n in areas],'exampleAreas':example,'sources':{f:{'url':f'https://github.com/pret/pokeheartgold/blob/{rev}/{f}','sha256':hashlib.sha256((source/f).read_bytes()).hexdigest()}for f in files}}
(root/'js/data/games/soulsilver/safari-reference.js').write_text('// Topology/identities only; example arrangement is NOT a decoded save.\nexport const SOULSILVER_SAFARI_REFERENCE = '+json.dumps(output,ensure_ascii=False,indent=2)+';\n')
print('Verified 12 areas, 3 columns × 2 rows, row-major order, south-center entrance; example:',example)
