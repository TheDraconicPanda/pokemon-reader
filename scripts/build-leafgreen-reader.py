"""Build native English FRLG Reader tables from a clean pinned pret checkout.

Usage: python scripts/build-leafgreen-reader.py /path/to/pokefirered
The input repository is public source data, not a ROM or a player save.
"""
import hashlib
import json
import pathlib
import re
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
SOURCE = pathlib.Path(sys.argv[1])
REVISION = 'ce6406d8c2eaf46d543c8a2606de0c3cb1951982'
assert subprocess.check_output(['git', '-C', str(SOURCE), 'rev-parse', 'HEAD'], text=True).strip() == REVISION
assert not subprocess.check_output(['git', '-C', str(SOURCE), 'status', '--porcelain'], text=True).strip()
inputs = {}


def read(name):
    raw = (SOURCE / name).read_bytes()
    inputs[name] = {'sha256': hashlib.sha256(raw).hexdigest(), 'url': f'https://github.com/pret/pokefirered/blob/{REVISION}/{name}'}
    return raw.decode()


def constants(name):
    return {key: int(value) for key, value in re.findall(r'^#define (\w+) (\d+)\s*$', read('include/constants/' + name + '.h'), re.M)}


species, abilities, moves, items = [constants(name) for name in ['species', 'abilities', 'moves', 'items']]
national = {name: i for i, name in enumerate(re.findall(r'\bNATIONAL_DEX_(\w+)\s*,', read('include/constants/pokedex.h').split('};')[0]))}
native_to_national = {value: national[key[8:]] for key, value in species.items() if key[8:] in national and 1 <= national[key[8:]] <= 386}
assert len(native_to_national) == 386
names = {species[key]: label for key, label in re.findall(r'\[(SPECIES_\w+)\]\s*=\s*_\("([^"]*)"\)', read('src/data/text/species_names.h'))}
ability_names = {abilities[key]: label for key, label in re.findall(r'\[(ABILITY_\w+)\]\s*=\s*_\("([^"]*)"\)', read('src/data/text/abilities.h'))}
move_names = {moves[key]: label for key, label in re.findall(r'\[(MOVE_\w+)\]\s*=\s*_\("([^"]*)"\)', read('src/data/text/move_names.h'))}
move_pp = {moves[key]: int(pp) for key, pp in re.findall(r'\[(MOVE_\w+)\]\s*=\s*\{[^}]*?\.pp\s*=\s*(\d+)', read('src/data/battle_moves.h'))}
records = {}
for key, body in re.findall(r'^    \[(SPECIES_\w+)\]\s*=\s*\{\n(.*?)\n    \}', read('src/data/pokemon/species_info.h'), re.S | re.M):
    native = species.get(key)
    if native not in native_to_national:
        continue
    def field(name):
        return re.search(r'\.' + name + r'\s*=\s*([^,]+)', body)[1].strip()
    ratio = field('genderRatio')
    if ratio.startswith('PERCENT_FEMALE'):
        ratio = min(254, int(float(re.search(r'\(([\d.]+)\)', ratio)[1]) * 255 / 100))
    else:
        ratio = {'MON_MALE': 0, 'MON_FEMALE': 254, 'MON_GENDERLESS': 255}.get(ratio, int(ratio) if ratio.isdigit() else None)
    assert ratio is not None
    records[native_to_national[native]] = {
        'nativeId': native, 'name': names[native],
        'types': list(dict.fromkeys(t.lower() for t in re.findall(r'TYPE_(\w+)', body.split('.types =')[1].split('}')[0]))),
        'stats': [int(field('base' + stat)) for stat in ['HP', 'Attack', 'Defense', 'Speed', 'SpAttack', 'SpDefense']],
        'abilities': [abilities[a] for a in re.findall(r'ABILITY_\w+', body.split('.abilities =')[1].split('}')[0])],
        'genderRatio': ratio, 'growthRate': field('growthRate').removeprefix('GROWTH_').lower().replace('_', '-'),
    }
assert len(records) == 386
# Native GetDeoxysStat supplies the host-version form instead of the ordinary
# stored species-info row. Keep both facts explicit for future writer work.
records[386]['storedStats'] = records[386]['stats']
records[386]['stats'] = [50, 70, 160, 90, 70, 160]
english_charmap, japanese_charmap = read('charmap.txt').split('@ Hiragana', 1)
def character_map(text):
    return {int(code, 16): char for char, code in re.findall(r"^'(.)'\s*=\s*([0-9A-F]{2})\s*$", text, re.M)}
characters = character_map(english_charmap)
japanese_characters = {code: chr(ord(char) + 0xFEE0) if char.isascii() and char.isalnum() else char for code, char in characters.items()}
japanese_characters.update(character_map(japanese_charmap.split('STRING =')[0]))
item_names = {items[item['itemId']]: item['english'] for item in json.loads(read('src/data/items.json'))['items'] if item['itemId'] in items}
locations = {i: section.get('name', section['id'].removeprefix('MAPSEC_').replace('_', ' ').title()) for i, section in enumerate(json.loads(read('src/data/region_map/region_map_sections.json'))['map_sections'])}
for path in ['include/save.h', 'include/global.h', 'include/pokemon.h', 'include/pokemon_storage_system.h', 'src/save.c', 'src/pokemon.c', 'src/new_game.c', 'src/pokedex_screen.c', 'src/event_data.c']:
    read(path)
output = {'nativeSpecies': native_to_national, 'species': records, 'abilities': ability_names,
          'moves': {i: {'name': name, 'basePP': move_pp[i]} for i, name in move_names.items()},
          'items': item_names, 'characters': characters, 'japaneseCharacters': japanese_characters, 'locations': locations}
target = ROOT / 'js/data/games/leafgreen/reader-reference.js'
target.parent.mkdir(parents=True, exist_ok=True)
target.write_text('// Generated from pinned native FRLG data; see docs/leafgreen-reader-sources.json.\nexport const LEAFGREEN_READER = ' + json.dumps(output, ensure_ascii=False, separators=(',', ':')) + ';\n')
(ROOT / 'docs/leafgreen-reader-sources.json').write_text(json.dumps({'repository': 'pret/pokefirered', 'revision': REVISION, 'inputs': inputs}, indent=2) + '\n')
print(f'Generated {len(records)} species and {len(move_names)} moves.')
