"""Export verified HGSS source-map layers without compositing Ironmon overlays.
Usage: python scripts/build-atlas-maps.py /path/to/archive-directory
Directory must contain Johto.zip, Kanto.zip and originals/<source image name>.
--available-only is for unfinished local work; it reports omitted required views.
"""
import argparse
import concurrent.futures
import hashlib
import json
import pathlib
import shutil
import struct
import subprocess
import urllib.parse
import zipfile

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('source', type=pathlib.Path)
parser.add_argument('--available-only', action='store_true')
args = parser.parse_args()
root = pathlib.Path(__file__).resolve().parents[1]
catalog = json.loads((root / 'scripts/atlas-map-sources.json').read_text())
output = root / 'assets/maps'
missing = [(name, entry['label'], entry['image']) for name, entries in catalog['locations'].items() for entry in entries if entry.get('original_required') and not (args.source / 'originals' / entry['image']).is_file()]
if missing and not args.available_only:
    raise SystemExit('Required original images are missing; no complete map build is possible:\n' + '\n'.join(str(x) for x in missing))
for archive, expected in catalog['archives'].items():
    path = args.source / (archive + '.zip')
    if hashlib.sha256(path.read_bytes()).hexdigest() != expected:
        raise SystemExit(f'Archive checksum mismatch: {archive}')
    xcf = args.source / archive / (archive + '.xcf')
    if not xcf.exists():
        with zipfile.ZipFile(path) as source:
            source.extract(archive + '/' + archive + '.xcf', args.source)

unique = {entry['file']: entry for entries in catalog['locations'].values() for entry in entries if not entry.get('original_required') or (args.source / 'originals' / entry['image']).is_file()}
def export(item):
    file, entry = item
    dest = output / file
    if entry.get('existing'):
        assert hashlib.sha256(dest.read_bytes()).hexdigest() == entry['existing']['sha256']
    elif entry.get('archive'):
        xcf = args.source / entry['archive'] / (entry['archive'] + '.xcf')
        subprocess.run(['convert', f'{xcf}[{entry["layer"]}]', '+repage', '-define', 'png:exclude-chunk=date,time', str(dest)], check=True)
    else:
        original = args.source / 'originals' / entry['image']
        expected = entry.get('original_sha256')
        if not expected or hashlib.sha256(original.read_bytes()).hexdigest() != expected:
            raise ValueError(f'Original image provenance/checksum not verified: {entry["image"]}')
        shutil.copyfile(original, dest)
    body = dest.read_bytes()
    if body[:8] != b'\x89PNG\r\n\x1a\n':
        raise ValueError(f'Not a PNG: {file}')
    width, height = struct.unpack('>II', body[16:24])
    if entry.get('width') and (width, height) != (entry['width'], entry['height']):
        raise ValueError(f'Unexpected dimensions: {file}')
    return file, dict(file=file, width=width, height=height, sha256=hashlib.sha256(body).hexdigest(), source='https://archives.bulbagarden.net/wiki/File:' + urllib.parse.quote(entry['image'], safe='._'), **({k: entry[k] for k in ['archive', 'layer'] if k in entry}))
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
    assets = dict(pool.map(export, unique.items()))
locations = {}
for name, entries in catalog['locations'].items():
    locations[name] = [dict(id=entry['id'], label=entry['label'], **assets[entry['file']]) for entry in entries if entry['file'] in assets]
(root / 'js/data/games/soulsilver/maps.js').write_text('// Verified HGSS map images; provenance: assets/maps/README.md.\nexport const SOULSILVER_MAPS = Object.freeze(' + json.dumps(dict(gameId='soulsilver', locations=locations), ensure_ascii=False, indent=2) + ');\n')
report = dict(gameId='soulsilver', expectedLocations=len(locations), expectedViews=sum(map(len, catalog['locations'].values())), availableViews=sum(map(len, locations.values())), uniqueAssets=len(assets), missing=[dict(location=n,label=l,image=i) for n,l,i in missing])
(root / 'docs/atlas-map-coverage.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
print(json.dumps(report, ensure_ascii=False), flush=True)
