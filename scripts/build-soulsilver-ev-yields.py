"""Extract Generation IV EV yields from the pinned HGSS personal data.
Usage: python scripts/build-soulsilver-ev-yields.py /path/to/pokeheartgold
"""
import hashlib
import json
import pathlib
import subprocess
import sys
from soulsilver_encounters import REVISION, species

source=pathlib.Path(sys.argv[1])
revision=subprocess.check_output(['git','-C',str(source),'rev-parse','HEAD'],text=True).strip()
if revision!=REVISION:raise SystemExit(f'Expected {REVISION}; got {revision}')
file=source/'files/poketool/personal/personal.json'
body=file.read_bytes()
fields={'hp':'hp_yield','attack':'atk_yield','defense':'def_yield','spAttack':'spatk_yield','spDefense':'spdef_yield','speed':'speed_yield'}
records=json.loads(body)['baseStats'][1:494]
assert len(records)==493
entries={species(row['species']):{stat:row[field] for stat,field in fields.items()} for row in records}
assert len(entries)==493
for name,yields in entries.items():
 assert all(isinstance(v,int) and 0<=v<=3 for v in yields.values()),name
 assert 1<=sum(yields.values())<=3,name
root=pathlib.Path(__file__).resolve().parents[1]
data=dict(gameId='soulsilver',generation=4,source=f'https://github.com/pret/pokeheartgold/blob/{REVISION}/files/poketool/personal/personal.json',sourceSha256=hashlib.sha256(body).hexdigest(),species=entries)
(root/'js/data/games/soulsilver/ev-yields.js').write_text('// Generated Generation IV base EV yields; see docs/atlas-ev-training.md.\nexport const SOULSILVER_EV_YIELDS = Object.freeze('+json.dumps(data,ensure_ascii=False,indent=2)+');\n')
print('Verified and exported',len(entries),'Gen IV species EV yields')
