"""Verify cave warp pairs and reproduce supplementary terrain plans from pinned HGSS data.
Usage: python scripts/build-cave-links.py /path/to/pokeheartgold
Then run scripts/build-atlas-maps.py with the existing map source archives.
"""
import argparse
import hashlib
import importlib.util
import json
from pathlib import Path
import re
import struct
import subprocess

ROOT = Path(__file__).resolve().parents[1]


def sha(data):
    return hashlib.sha256(data).hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('primary', type=Path)
    args = parser.parse_args()
    primary = args.primary.resolve()
    config = json.loads((ROOT / 'scripts/soulsilver-cave-links.json').read_text())
    revision = subprocess.check_output(['git', '-C', str(primary), 'rev-parse', 'HEAD'], text=True).strip()
    if revision != config['primaryRevision'] or subprocess.check_output(['git', '-C', str(primary), 'status', '--porcelain', '--untracked-files=no'], text=True).strip():
        raise SystemExit('Expected the pinned, clean primary game repository')
    spec = importlib.util.spec_from_file_location('interiors', ROOT / 'scripts/build-soulsilver-interiors.py')
    renderer = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(renderer)
    header_path = 'src/data/map_headers.h'
    header_bytes = (primary / header_path).read_bytes()
    headers = {name: dict(re.findall(r'\.(\w+) = ([^,\n]+)', body))
               for name, body in re.findall(r'\[(MAP_\w+)\]\s*=\s*\{(.*?)\n\s*\},?', header_bytes.decode(), re.S)}
    inputs = {header_path: sha(header_bytes)}
    sources = {}

    def events(name):
        h = headers[name]
        path = 'files/fielddata/eventdata/zone_event/' + h['eventsBank'].removeprefix('NARC_zone_event_').removesuffix('_bin') + '.json'
        if name not in sources:
            body = (primary / path).read_bytes()
            sources[name] = dict(path=path, sha256=sha(body), warps=json.loads(body).get('warps', []))
        return sources[name]['warps']

    def group(name, index):
        warps = events(name)
        start = warps[index]
        # Two adjacent warp tiles may represent a single upward staircase.
        indices = [i for i, w in enumerate(warps) if w['header'] == start['header'] and w['anchor'] == start['anchor']
                   and w.get('y', 0) == start.get('y', 0) and abs(w['x']-start['x'])+abs(w['z']-start['z']) <= 1]
        return indices

    catalog_path = ROOT / 'scripts/atlas-map-sources.json'
    catalog = json.loads(catalog_path.read_text())
    view_order = {name: {v['id']: i for i, v in enumerate(views)} for name, views in catalog['locations'].items()}
    for name, views in catalog['locations'].items():
        catalog['locations'][name] = [v for v in views if not v['id'].startswith('cave-plan-')]
    land_path = 'files/a/0/6/5'
    land = (primary / land_path).read_bytes()
    inputs[land_path] = sha(land)
    members = renderer.narc_members(land)
    plans = {}
    plan_evidence = []
    for plan in config['plans']:
        name = plan['primaryMap']
        matrix_path = 'files/fielddata/mapmatrix/map_matrix/' + headers[name]['matrixId'].removeprefix('NARC_map_matrix_').removesuffix('_bin') + '.bin'
        matrix = (primary / matrix_path).read_bytes()
        inputs[matrix_path] = sha(matrix)
        width, height, models = renderer.matrix_models(matrix)
        cell = plan['modelCell']
        if width != 1 or cell != 0 or 65535 in models:
            raise ValueError('An explicit multi-column/empty-cell review is required')
        terrain = b''.join(members[model][0x14:0x814] for model in models)
        if any(struct.unpack_from('<I', members[model])[0] != 0x800 for model in models):
            raise ValueError('Unexpected HGSS terrain attributes')
        attributes = struct.unpack('<' + 'H' * (1024*height), terrain)
        origin_x, origin_z = 0, 0
        bounds = plan['bounds']
        if not (0 <= bounds[0] <= bounds[2] < 32 and 0 <= bounds[1] <= bounds[3] < 32*height):
            raise ValueError('Plan crop must be within its explicitly reviewed map matrix')
        warps = [dict(w, x=w['x']-origin_x, z=w['z']-origin_z) for w in events(name)
                 if bounds[0] <= w['x']-origin_x <= bounds[2] and bounds[1] <= w['z']-origin_z <= bounds[3]]
        drawing, image_width, image_height = renderer.diagram(attributes, warps, bounds, plan['label'])
        file = plan['id'] + '.png'
        dest = ROOT / 'assets/maps' / file
        subprocess.run(['convert', '-size', f'{image_width}x{image_height}', 'xc:#f4f6ef', '-font', 'DejaVu-Sans', '-draw', drawing, '-strip', '-define', 'png:exclude-chunk=date,time', 'PNG24:' + str(dest)], check=True)
        notice = 'Game-data terrain plan. Pale tiles have no static terrain collision flag; objects, height and scripts can restrict movement.'
        if plan.get('notice'):
            notice += ' ' + plan['notice']
        catalog['locations'][plan['location']].append(dict(id=plan['id'], label=plan['label'] + ' · terrain plan',
            image=file, file=file, generated_sha256=sha(dest.read_bytes()), width=image_width, height=image_height,
            source=f'https://github.com/pret/pokeheartgold/blob/{revision}/{sources[name]["path"]}',
            kind='terrain-plan', mapIds=[name], notice=notice))
        plans[plan['id']] = dict(plan, width=image_width, height=image_height, originX=origin_x, originZ=origin_z)
        plan_evidence.append(dict(plan, matrix=matrix_path, models=models,
            attributesSha256=sha(terrain), file=file, sha256=sha(dest.read_bytes()),
            terrainRows=[''.join('#' if attributes[z*32+x]&0x8000 else '.' for x in range(bounds[0], bounds[2]+1)) for z in range(bounds[1], bounds[3]+1)]))
    for name, views in catalog['locations'].items():
        positions = view_order[name]
        views.sort(key=lambda view: positions.get(view['id'], len(positions)))
    legacy = json.loads((ROOT / 'docs/whirl-islands-stair-links.json').read_text())
    runtime = {'Whirl Islands': dict(heading='Stairs · 1F ↔ B1F', arrivalLabel='stair',
        help='Scroll the map to explore. Matching letters connect the same ladder between 1F and B1F.',
        pairs=[{k:p[k] for k in ['id', 'label', 'ends']} for p in legacy['pairs']])}
    locations = {}
    for name, location in config['locations'].items():
        used = set()
        pairs = []
        runtime_pairs = []
        nodes = {e['primaryMap'] for p in location['pairs'] for e in p['ends']}
        for pair in location['pairs']:
            ends = []
            runtime_ends = []
            for e in pair['ends']:
                event = events(e['primaryMap'])[e['warp']]
                indices = group(e['primaryMap'], e['warp'])
                for i in indices:
                    key = (e['primaryMap'], i)
                    if key in used:
                        raise ValueError(f'Duplicate physical endpoint: {name} {key}')
                    used.add(key)
                if e['mapId'] in plans:
                    plan = plans[e['mapId']]
                    left, top, right, bottom = plan['bounds']
                    x, z = event['x']-plan['originX'], event['z']-plan['originZ']
                    if not (left <= x <= right and top <= z <= bottom):
                        raise ValueError('An anchor is outside its reviewed plan crop')
                    grid_width = (right-left+1)*24
                    pixel_x = (plan['width']-grid_width)/2 + (x-left+0.5)*24
                    pixel_y = 72 + (z-top+0.5)*24
                else:
                    pixel_x, pixel_y = e['x'], e['y']
                end = dict(mapId=e['mapId'], x=pixel_x, y=pixel_y)
                view = next(v for v in catalog['locations'][name] if v['id'] == end['mapId'])
                if not (0 <= pixel_x < view['width'] and 0 <= pixel_y < view['height']):
                    raise ValueError(f'Image anchor outside {name}: {end}')
                runtime_ends.append(end)
                ends.append(dict(end, primaryMap=e['primaryMap'], warpIndices=indices))
            a, b = ends
            if a['mapId'] == b['mapId']:
                raise ValueError('Use distinct displayed rooms for a map-changing connection')
            for start, target in [(a, b), (b, a)]:
                for i in start['warpIndices']:
                    warp = events(start['primaryMap'])[i]
                    if warp['header'] != target['primaryMap'] or warp['anchor'] not in target['warpIndices']:
                        raise ValueError(f'Non-reciprocal warp: {name} {pair["id"]}')
            pairs.append(dict(id=pair['id'], label=pair['label'], ends=ends))
            runtime_pairs.append(dict(id=pair['id'], label=pair['label'], ends=runtime_ends))
        expected = {(node, i) for node in nodes for i, w in enumerate(events(node)) if w['header'] in nodes}
        if used != expected:
            raise ValueError(f'Unaccounted cave warps: {name}: missing {expected-used}; unexpected {used-expected}')
        runtime[name] = dict(heading='Stairs & passages', pairs=runtime_pairs)
        images = {v['id']:dict(file=v['file'], width=v['width'], height=v['height'], sha256=sha((ROOT/'assets/maps'/v['file']).read_bytes()))
                  for v in catalog['locations'][name] if any(e['mapId']==v['id'] for p in pairs for e in p['ends'])}
        locations[name] = dict(pairs=pairs, images=images, primaryMaps=sorted(nodes), coveredWarpTiles=len(used), missing=[])
    catalog_path.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + '\n')
    (ROOT / 'js/data/games/soulsilver/map-links.js').write_text('// Verified HGSS cave warp pairs; source snapshots and image anchors: docs/cave-map-links.json.\nexport const SOULSILVER_MAP_LINKS = Object.freeze(' + json.dumps(runtime, ensure_ascii=False, indent=2) + ');\n')
    report = dict(gameId='soulsilver', primaryRevision=revision, inputSha256=inputs, sources=sources,
        supplementaryPlans=plan_evidence, locations=locations,
        addedPairs=sum(len(l['pairs']) for l in locations.values()), addedLocations=len(locations), missing=[],
        exclusions=['Safari and new Kanto locations are excluded.',
                    'Embedded Tower maps are story variants, not connected floors; no link is invented.',
                    'Only paired map-changing stairs/passages are marked. In-floor steps, ledges and scripted one-way falls are not paired warp routes.',
                    'The accepted Whirl Islands six-pair overlay is retained; its lower-floor expansion remains separate.',
                    'Exterior route/region exits and Pokémon Center rooms use existing navigation rather than internal cave markers.'])
    (ROOT / 'docs/cave-map-links.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({key:report[key] for key in ['addedPairs', 'addedLocations', 'missing']}))


if __name__ == '__main__':
    main()
