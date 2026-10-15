"""Build non-route SoulSilver encounter coverage; Safari Zone is intentionally excluded.
Usage: python scripts/build-soulsilver-location-encounters.py /path/to/pokeheartgold
"""
import csv
import json
import pathlib
import sys
from soulsilver_encounters import EncounterData, merge_times, species

root = pathlib.Path(__file__).resolve().parents[1]
source = EncounterData(sys.argv[1])
scope = json.loads((root / 'js/data/games/soulsilver/encounter-scope.json').read_text())
swarms = {'T22': 'fish', 'D42R0102': 'land', 'D38R0101': 'land'}
locations = {}
for name, config in scope.items():
    rows = []
    for area in config['maps']:
        if area.get('specialOnly') or area.get('aliasOf'):
            continue
        records = source.bank(area['bank'], head_key=area['head'], swarm_type=swarms.get(area['bank']))
        if area['bank'] == 'D24R0205':
            # Unown-only replacement slots add no species; form selection has its own rules.
            records = [r for r in records if not r['conditions']]
            records = [dict(r, conditions=['unown-puzzle']) for r in records]
        for row in records:
            row['area'] = 'B1F' if name == 'Cliff Cave' and row['method'] == 'rock-smash' else area['area']
        rows.extend(records)
    rows += config['special']
    if name == 'National Park':
        with (source.source / 'files/data/mushi/mushi_encount.csv').open() as f:
            contests = list(csv.DictReader(f))
        for group, condition in enumerate(['contest-pre-dex', 'contest-tuesday', 'contest-thursday', 'contest-saturday']):
            threshold = 100
            for entry in contests[group * 10:(group + 1) * 10]:
                probability = threshold - int(entry['rate'])
                threshold = int(entry['rate'])
                rows.append(dict(method='contest', pokemon=species(entry['species']), levels=list(range(int(entry['lvlmin']), int(entry['lvlmax']) + 1)), times=[], percent=probability, conditions=[condition], area='Contest grounds'))
    records = merge_times(rows)
    locations[name] = dict(status='verified' if records else 'no-fixed-wild', notes=config['notes'], encounters=records)

out = root / 'js/data/games/soulsilver/location-encounters.js'
with out.open('w') as f:
    f.write('// Generated from pinned SoulSilver game data; see docs/atlas-encounter-audit.md.\n')
    f.write('export const SOULSILVER_LOCATION_ENCOUNTERS = Object.freeze({\n  gameId: "soulsilver",\n  locations: {\n')
    for name, reference in locations.items():
        f.write('    ' + json.dumps(name, ensure_ascii=False) + ': {\n')
        f.write('      status: ' + json.dumps(reference['status']) + ',\n')
        f.write('      notes: ' + json.dumps(reference['notes'], ensure_ascii=False) + ',\n      encounters: [\n')
        for row in reference['encounters']:
            f.write('        ' + json.dumps(row, ensure_ascii=False) + ',\n')
        f.write('      ]\n    },\n')
    f.write('  }\n});\n')
print(f"{len(locations)} groups, {sum(len(r['encounters']) for r in locations.values())} records, {sum(r['status']=='no-fixed-wild' for r in locations.values())} without fixed wild encounters")
