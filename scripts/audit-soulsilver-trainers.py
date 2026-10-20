"""Compare Atlas species/level rosters with pinned primary HGSS trainer data.

Usage: python scripts/audit-soulsilver-trainers.py /path/to/pokeheartgold [report.json]
Requires Python and Node.js only. Safari and generated Frontier teams are excluded.
This checks species/levels, not moves, held items, trainer placement or availability.
"""
import collections
import itertools
import json
import pathlib
import re
import subprocess
import sys
import unicodedata

REVISION = 'd2355244ac42b3c6e40d8c36aa3564ee8706dea4'
root = pathlib.Path(__file__).resolve().parents[1]
source = pathlib.Path(sys.argv[1]).resolve()
revision = subprocess.check_output(['git', '-C', str(source), 'rev-parse', 'HEAD'], text=True).strip()
if revision != REVISION:
    raise SystemExit(f'Expected primary revision {REVISION}; got {revision}')
primary_file = source / 'files/poketool/trainer/trainers.json'
# Reject local primary edits, as a matching HEAD alone does not pin the file bytes.
committed = subprocess.check_output(['git', '-C', str(source), 'show', 'HEAD:files/poketool/trainer/trainers.json'])
if primary_file.read_bytes() != committed:
    raise SystemExit('Primary trainer data differs from its pinned revision')
primary = json.loads(committed)['trainers']
module = (root / 'js/data/games/soulsilver/location-details.js').as_uri()
records = json.loads(subprocess.check_output(['node', '--input-type=module', '-e',
    f'import {{SOULSILVER_LOCATION_DETAILS as data}} from {json.dumps(module)}; console.log(JSON.stringify(data.locations));'], text=True))


def normalize(name):
    name = unicodedata.normalize('NFKD', name).replace('♀', 'F').replace('♂', 'M').lower()
    return re.sub('[^a-z0-9]', '', name)


def reference_party(record):
    party = []
    for member in record['party']:
        species, tail = member.split(' Lv.', 1)
        if not species.startswith('Nidoran'):
            species = re.sub('[♂♀]', '', species)
        party.append((normalize(species), int(re.search(r'\d+', tail)[0])))
    return tuple(sorted(party))


by_party = collections.defaultdict(list)
for index, trainer in enumerate(primary):
    party = tuple(sorted((normalize(p['species'].removeprefix('SPECIES_')), p['level']) for p in trainer['party']))
    if party:
        by_party[party].append(index)

rows = []
facilities = []
for location, reference in records.items():
    if location == 'Safari Zone':
        continue
    for record in reference['trainers']:
        if not record['party'] and record.get('role') == 'facility':
            facilities.append({'location': location, 'id': record['id'], 'name': record['name']})
            continue
        signature = reference_party(record)
        ids = by_party.get(signature, [])
        combined = []
        # These two records explicitly combine the opposing sides of a Multi Battle.
        if not ids and (location, record['name']) in {
            ("Dragon's Den", 'Clair & Lance'), ('Team Rocket HQ', 'Ariana & Team Rocket Grunt')
        }:
            for size in range(1, len(signature)):
                for indices in itertools.combinations(range(len(signature)), size):
                    chosen = set(indices)
                    left = tuple(p for i, p in enumerate(signature) if i in chosen)
                    right = tuple(p for i, p in enumerate(signature) if i not in chosen)
                    if by_party.get(left) and by_party.get(right):
                        pair = sorted([by_party[left], by_party[right]])
                        if pair not in combined:
                            combined.append(pair)
        rows.append({'location': location, 'id': record['id'], 'name': record['name'],
                     'primaryTrainerIds': ids, 'combinedTrainerIds': combined})

failed = [row for row in rows if not row['primaryTrainerIds'] and not row['combinedTrainerIds']]
report = {'primaryRevision': revision, 'primaryFile': str(primary_file.relative_to(source)),
          'checkedRosters': len(rows), 'matchedRosters': len(rows) - len(failed),
          'facilityReferencesNotFixedRosters': facilities, 'failures': failed, 'rosters': rows}
if len(sys.argv) > 2:
    pathlib.Path(sys.argv[2]).write_text(json.dumps(report, indent=2, ensure_ascii=False) + '\n')
print(f'{len(rows) - len(failed)}/{len(rows)} Atlas rosters match pinned primary species/levels; '
      f'{len(facilities)} facility references have no fixed roster.')
if failed:
    raise SystemExit(json.dumps(failed, indent=2, ensure_ascii=False))
