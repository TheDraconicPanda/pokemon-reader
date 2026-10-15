"""Rebuild route reference data from a local pret/pokeheartgold checkout.
Usage: python scripts/build-soulsilver-route-encounters.py /path/to/pokeheartgold
Source revision and rules are documented in docs/atlas-route-audit.md.
No network access or third-party Python packages are required.
"""
import json
import pathlib
import sys
from soulsilver_encounters import EncounterData, merge_times

source = EncounterData(sys.argv[1])
swarms = {27: 'surf', 32: 'fish', 34: 'land', 35: 'land', 38: 'land', 44: 'fish', 45: 'land', 47: 'land'}
routes = {}
for n in range(26, 49):
    key = f'W{n}' if n in [40, 41] else f'R{n}'
    rows = source.bank(key, swarm_type=swarms.get(n))
    if n == 35:
        rows.append(dict(method='gift', pokemon='Spearow', levels=[20], times=[], percent=None, conditions=['kenya-mail']))
    if n == 36:
        rows.append(dict(method='interaction', pokemon='Sudowoodo', levels=[20], times=[], percent=None, conditions=['squirtbottle']))
    routes[f'Route {n}'] = merge_times(rows)

out = pathlib.Path(__file__).resolve().parents[1] / 'js/data/games/soulsilver/route-encounters.js'
with out.open('w') as f:
    f.write('// Generated from pinned game data; see scripts/build-soulsilver-route-encounters.py.\n')
    f.write('export const SOULSILVER_ROUTE_ENCOUNTERS = Object.freeze({\n  gameId: "soulsilver",\n  routes: {\n')
    for name, rows in routes.items():
        f.write(f'    "{name}": [\n')
        for row in rows:
            f.write('      ' + json.dumps(row, ensure_ascii=False) + ',\n')
        f.write('    ],\n')
    f.write('  }\n});\n')
print(f'{len(routes)} routes; {sum(map(len, routes.values()))} encounter records')
