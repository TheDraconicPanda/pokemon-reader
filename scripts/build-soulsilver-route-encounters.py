"""Rebuild route reference data from a local pret/pokeheartgold checkout.
Usage: python scripts/build-soulsilver-route-encounters.py /path/to/pokeheartgold
Source revision and rules are documented in docs/atlas-route-audit.md.
No network access or third-party Python packages are required.
"""
import collections
import json
import pathlib
import subprocess
import sys

REVISION = 'd2355244ac42b3c6e40d8c36aa3564ee8706dea4'
source = pathlib.Path(sys.argv[1])
assert subprocess.check_output(['git', '-C', str(source), 'rev-parse', 'HEAD'], text=True).strip() == REVISION
land_weights = [20, 20, 10, 10, 10, 10, 5, 5, 4, 4, 1, 1]
water_weights = [60, 30, 5, 4, 1]
rod_weights = [40, 30, 15, 10, 5]
head_weights = [50, 15, 15, 10, 5, 5]
encounters = {x['map']: x for x in json.loads((source / 'files/fielddata/encountdata/gs_enc_data.json').read_text())['encounters']}
trees = {x['Map']: x for x in json.loads((source / 'files/arc/headbutt.json').read_text())['tables']}
# Only maps in sSwarmMapLUT can actually receive an outbreak.
swarms = {27: 'surf', 32: 'fish', 34: 'land', 35: 'land', 38: 'land', 44: 'fish', 45: 'land', 47: 'land'}

def version(value):
    if isinstance(value, dict) and 'SOULSILVER' in value:
        return value['SOULSILVER']
    if isinstance(value, dict) and 'silver' in value:
        return value['silver']
    return value

def species(value):
    name = version(value).removeprefix('SPECIES_')
    return {'NIDORAN_F': 'Nidoran♀', 'NIDORAN_M': 'Nidoran♂', 'FARFETCHD': "Farfetch'd", 'MR_MIME': 'Mr. Mime'}.get(name, name.replace('_', ' ').title())

def level_range(value):
    value = version(value)
    return list(range(version(value['min']), version(value['max']) + 1)) if isinstance(value, dict) else [value]

def aggregate(slots, weights, method, times, conditions):
    groups = collections.OrderedDict()
    for slot, weight in zip(slots, weights, strict=True):
        name = species(slot['species'])
        g = groups.setdefault(name, {'levels': set(), 'percent': 0})
        g['levels'].update(level_range(slot['level']))
        g['percent'] += weight
    return [dict(method=method, pokemon=name, levels=sorted(g['levels']), times=list(times),
                 percent=g['percent'], conditions=conditions) for name, g in groups.items()]

routes = {}
for n in range(26, 49):
    key = f'W{n}' if n in [40, 41] else f'R{n}'
    data = encounters[key]
    rows = []
    for time in ['morn', 'day', 'nite'] if data['land']['rate'] else []:
        slots = [dict(level=version(x['level']), species=version(x['species'][time])) for x in data['land']['mons']]
        rows += aggregate(slots, land_weights, 'walking', [time], [])
        for region, condition in [('hoenn', 'hoenn-sound'), ('sinnoh', 'sinnoh-sound')]:
            sound_slots = [dict(level=slots[i]['level'], species=data[region][k]) for i, k in [(2, 0), (3, 0), (4, 1), (5, 1)]]
            rows += aggregate(sound_slots, [10] * 4, 'walking', [time], [condition])
        if swarms.get(n) == 'land':
            rows += aggregate([dict(level=x['level'], species=data['landSwarm']) for x in slots[:2]], [20, 20], 'walking', [time], ['swarm'])
    if data['surf']['rate']:
        rows += aggregate(data['surf']['mons'], water_weights, 'surfing', [], [])
        if swarms.get(n) == 'surf':
            rows += aggregate([dict(level=data['surf']['mons'][0]['level'], species=data['surfSwarm'])], [60], 'surfing', [], ['swarm'])
    for rod, group in data['fishing'].items():
        if not group['rate']:
            continue
        night = data.get('nightFish')
        night_differs = night and rod != 'old_rod' and version(night) != version(group['mons'][3 if rod == 'good_rod' else 1]['species'])
        for times in [['morn', 'day'], ['nite']] if night_differs else [[]]:
            slots = [dict(x) for x in group['mons']]
            if times == ['nite']:
                idx = 3 if rod == 'good_rod' else 1
                slots[idx] = dict(slots[idx], species=night)
            rows += aggregate(slots, rod_weights, rod, times, [])
        if swarms.get(n) == 'fish':
            indices = {'old_rod': [2], 'good_rod': [0, 2, 3], 'super_rod': [0, 1, 2, 3, 4]}[rod]
            rows += aggregate([dict(level=group['mons'][i]['level'], species=data['fishSwarm']) for i in indices], [rod_weights[i] for i in indices], rod, [], ['swarm'])
    if data['rock_smash']['rate']:
        rows += aggregate(data['rock_smash']['mons'], [80, 20], 'rock-smash', [], [])
    head = trees.get(key)
    if head:
        for field, condition in [('CommonMons', 'tree-a'), ('RareMons', 'tree-b'), ('SecretMons', 'special-tree')]:
            if head[field] and head['SecretTrees' if field == 'SecretMons' else 'Trees']:
                slots = [dict(species=x['species'], level={'min': x['minLevel'], 'max': x['maxLevel']}) for x in head[field]]
                rows += aggregate(slots, head_weights, 'headbutt', [], [condition])
    if n == 35:
        rows.append(dict(method='gift', pokemon='Spearow', levels=[20], times=[], percent=None, conditions=['kenya-mail']))
    if n == 36:
        rows.append(dict(method='interaction', pokemon='Sudowoodo', levels=[20], times=[], percent=None, conditions=['squirtbottle']))
    # Merge identical distributions across times, retaining precise discrete level sets.
    merged = collections.OrderedDict()
    for row in rows:
        key = json.dumps({k: v for k, v in row.items() if k != 'times'}, sort_keys=True)
        if key in merged:
            merged[key]['times'] += row['times']
        else:
            merged[key] = row
    routes[f'Route {n}'] = list(merged.values())

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
