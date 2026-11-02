#!/usr/bin/env python3
"""Build native-only HGSS offline facts from pinned primary files in INPUT."""
import hashlib,json,pathlib,re,struct,sys
source=pathlib.Path(sys.argv[1]);root=pathlib.Path(__file__).resolve().parents[2]
pin='d2355244ac42b3c6e40d8c36aa3564ee8706dea4'
personal=json.loads((source/'personal.json').read_text())['baseStats']
raw=(source/'waza_tbl.narc').read_bytes();parts={};offset=16
for _ in range(3):
    size=struct.unpack_from('<I',raw,offset+4)[0];parts[raw[offset:offset+4]]=raw[offset+8:offset+size];offset+=size
fat=parts[b'BTAF'];entries=[parts[b'GMIF'][a:b] for a,b in [struct.unpack_from('<II',fat,4+8*i) for i in range(struct.unpack_from('<H',fat)[0])]]
assert all(len(entries[i])==16 for i in range(1,468))
growth={'MEDIUM_FAST':'medium-fast','MEDIUM_SLOW':'medium-slow','ERRATIC':'erratic','FLUCTUATING':'fluctuating','FAST':'fast','SLOW':'slow'}
species={i:{'types':list(dict.fromkeys(t.removeprefix('TYPE_').lower() for t in p['types'])),'growthRate':growth[p['growthRate']],
            'genderRate':-1 if p['genderRatio']==2 else int(p['genderRatio']*8)} for i,p in enumerate(personal) if 1<=i<=493}
item_section=re.split(r'^#define ITEM_MIN\s', (source/'items.h').read_text().split('#define ITEM_NONE',1)[1],maxsplit=1,flags=re.M)[0]
items={0:'None',**{int(id):symbol.replace('_',' ').title() for symbol,id in re.findall(r'^#define ITEM_(\w+)\s+(\d+)\s*$',item_section,re.M)}}
assert items[1]=='Master Ball' and items[17]=='Potion' and items[536]=='Enigma Stone'
data={'schema':1,'revision':pin,'species':species,'movePP':{i:entries[i][6] for i in range(1,468)},'items':items}
out=root/'ios/Web/hgss-offline.json';out.write_text(json.dumps(data,separators=(',',':'))+'\n')
paths={'personal.json':'files/poketool/personal/personal.json','waza_tbl.narc':'files/poketool/waza/waza_tbl.narc','items.h':'include/constants/items.h','move.h':'include/move.h'}
ledger={'revision':pin,'sources':{name:{'url':f'https://github.com/pret/pokeheartgold/blob/{pin}/{path}','sha256':hashlib.sha256((source/name).read_bytes()).hexdigest()} for name,path in paths.items()},
        'moveLayout':'include/move.h MoveTbl is 16 bytes; pp is byte 6','saveLayout':'include/save.h SaveChunkFooter is 16 bytes; src/save.c writes bodies/PC deltas then footers. Platinum uses a 20-byte footer and independent block counters.',
        'generatedSHA256':hashlib.sha256(out.read_bytes()).hexdigest()}
(root/'ios/Web/hgss-offline-sources.json').write_text(json.dumps(ledger,indent=2)+'\n')
print(f'HGSS: {len(species)} species, 467 PP values, {len(items)} item symbols')
