"""Extract species growth rates from pinned HGSS personal data; pass personal.json."""
import hashlib, json, pathlib, sys
source=pathlib.Path(sys.argv[1]);raw=source.read_bytes()
expected='8efcb2a809186a8ba85eb9dd123f4d210e06444405b613f9aa04876f19567f29'
assert hashlib.sha256(raw).hexdigest()==expected,'Unexpected personal.json revision'
rows=json.loads(raw)['baseStats']
rates={i:rows[i]['growthRate'].lower().replace('_','-') for i in range(1,494)}
data={'gameId':'soulsilver','source':'https://github.com/pret/pokeheartgold/blob/d2355244ac42b3c6e40d8c36aa3564ee8706dea4/files/poketool/personal/personal.json','sourceSha256':expected,'species':rates}
pathlib.Path('js/data/games/soulsilver/growth-rates.js').write_text('// Generated from pinned HGSS personal data; see scripts/build-soulsilver-growth-rates.py.\nexport const SOULSILVER_GROWTH_RATES = '+json.dumps(data,separators=(',',':'))+';\n')
