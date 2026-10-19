"""Build Planner identifier/name data from downloaded, pinned PokéAPI CSV files.

python scripts/build-planner-reference.py work/planner-reference
The input files come from the revision below; no save files are involved.
"""
import csv
import hashlib
import json
import pathlib
import sys

REVISION = '6fd69dfe90465ba96534f6816fc817737d1f97f6'
source = pathlib.Path(sys.argv[1])

def records(name):
    with (source / name).open(encoding='utf-8', newline='') as handle:
        return list(csv.DictReader(handle))

moves = {int(row['move_id']): row['name'] for row in records('move_names.csv')
         if row['local_language_id'] == '9' and int(row['move_id']) <= 467}
species = {int(row['pokemon_species_id']): row['name'] for row in records('pokemon_species_names.csv')
           if row['local_language_id'] == '9' and int(row['pokemon_species_id']) <= 493}
# PokéAPI's API nature IDs are not PID modulo 25 indices. game_index is.
natures = {int(row['game_index']): row['identifier'].title() for row in records('natures.csv')}
assert len(moves) == 467 and len(species) == 493 and len(natures) == 25
assert natures[3] == 'Adamant' and natures[10] == 'Timid' and natures[15] == 'Modest'
files = ['move_names.csv', 'pokemon_species_names.csv', 'natures.csv']
data = {
    'gameId': 'soulsilver', 'generation': 4, 'sourceRevision': REVISION,
    'sources': {name: {
        'url': f'https://github.com/PokeAPI/pokeapi/blob/{REVISION}/data/v2/csv/{name}',
        'sha256': hashlib.sha256((source / name).read_bytes()).hexdigest(),
    } for name in files},
    'moves': moves, 'species': species, 'natures': natures,
}
root = pathlib.Path(__file__).resolve().parents[1]
(root / 'js/data/games/soulsilver/planner-reference.js').write_text(
    '// Pinned identifiers/names only; no learnsets or mechanics. See docs/planner-integration.md.\n'
    + 'export const PLANNER_REFERENCE = ' + json.dumps(data, ensure_ascii=False, indent=2) + ';\n',
    encoding='utf-8',
)
