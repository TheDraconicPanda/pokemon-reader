"""Reproduce missing HGSS interior terrain plans from pinned primary game data.

Usage: python scripts/build-soulsilver-interiors.py /path/to/pret/pokeheartgold
Then run build-atlas-maps.py normally. Requires Python 3 and ImageMagick with DejaVu Sans.
These are static tile diagrams, not screenshots or complete collision simulations.
"""
import argparse
import hashlib
import json
from pathlib import Path
import re
import struct
import subprocess

ROOT = Path(__file__).resolve().parents[1]


def sha(data):
    return hashlib.sha256(data).hexdigest()


def narc_members(data):
    if data[:4] != b'NARC':
        raise ValueError('Not a NARC archive')
    chunks = {}
    offset = struct.unpack_from('<H', data, 12)[0]
    while offset < len(data):
        magic, size = struct.unpack_from('<4sI', data, offset)
        if size < 8 or offset + size > len(data):
            raise ValueError('Invalid NARC chunk')
        chunks[magic] = offset
        offset += size
    fat = chunks[b'BTAF']
    base = chunks[b'GMIF'] + 8
    count = struct.unpack_from('<H', data, fat + 8)[0]
    result = []
    for i in range(count):
        start, end = struct.unpack_from('<II', data, fat + 12 + i * 8)
        if start > end or base + end > len(data):
            raise ValueError('Invalid NARC member')
        result.append(data[base + start:base + end])
    return result


def matrix_models(data):
    width, height, headers, altitudes, name_length = data[:5]
    count = width * height
    offset = 5 + name_length + count * (2 * bool(headers) + bool(altitudes))
    models = struct.unpack_from('<' + 'H' * count, data, offset)
    if offset + count * 2 != len(data):
        raise ValueError('Unexpected matrix format')
    return width, height, models


def terrain_grid(matrix, members):
    width, height, models = matrix_models(matrix)
    # All current missing rooms are one model. Fail explicitly if scope changes;
    # do not silently plot another header's cells from a shared outdoor matrix.
    if (width, height) != (1, 1) or models[0] == 65535:
        raise ValueError('An interior needs an explicit multi-model review')
    member = members[models[0]]
    if struct.unpack_from('<I', member)[0] != 0x800:
        raise ValueError('Expected 32 x 32 u16 terrain attributes')
    # HGSS TerrainAttributes_Update: offset 0x14, size 0x800 (not Platinum 0x10).
    attributes = member[0x14:0x814]
    return struct.unpack('<1024H', attributes), models[0], sha(attributes)


def crop_grid(attributes, warps):
    points = [(i % 32, i // 32) for i, value in enumerate(attributes) if value]
    for warp in warps:
        x, z = warp['x'], warp['z']
        if not (0 <= x < 32 and 0 <= z < 32):
            raise ValueError('Warp outside the reviewed room model')
        points.append((x, z))
    if not points:
        raise ValueError('Empty terrain plan')
    return [min(x for x, _ in points), min(z for _, z in points),
            max(x for x, _ in points), max(z for _, z in points)]


def diagram(attributes, warps, bounds, title):
    left, top, right, bottom = bounds
    tile = 24
    grid_width = (right - left + 1) * tile
    width = max(520, grid_width + 48)
    height = (bottom - top + 1) * tile + 164
    start_x = (width - grid_width) // 2
    exits = {(w['x'], w['z']) for w in warps}
    out = []

    def text(x, y, value, size=12):
        escaped = value.replace("\\", "\\\\").replace("'", "\\'")
        out.append(f"fill '#20362e' stroke none font-size {size} text {x},{y} '{escaped}'")

    text(24, 29, title, 16)
    text(24, 52, 'HGSS game-data terrain plan · north ↑')
    for z in range(top, bottom + 1):
        for x in range(left, right + 1):
            value = attributes[z * 32 + x]
            # sub_020548C0 reads bit 15; GetMetatileBehavior reads low byte.
            fill = '#55675e' if value & 0x8000 else '#e4eddb'
            if (x, z) in exits:
                fill = '#f4be56'
            X, Y = start_x + (x - left) * tile, 72 + (z - top) * tile
            out.append(f"fill '{fill}' stroke '#c4cebf' stroke-width 0.6 rectangle {X},{Y} {X+24},{Y+24}")
            if (x, z) in exits:
                text(X+7, Y+17, 'E', 15)
    legend_y = height - 56
    for x, color, label in [(24, '#e4eddb', 'Clear terrain'), (181, '#55675e', 'Blocked terrain'), (356, '#f4be56', 'Exit / stairs')]:
        out.append(f"fill '{color}' stroke '#88998c' rectangle {x},{legend_y-12} {x+14},{legend_y+2}")
        text(x+21, legend_y, label)
    text(24, height-24, 'Static terrain only; objects, height and scripts can affect movement.', 11)
    return '\n'.join(out), width, height


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', type=Path)
    args = parser.parse_args()
    config = json.loads((ROOT / 'scripts/soulsilver-interior-rooms.json').read_text())
    source = args.source.resolve()
    revision = subprocess.check_output(['git', '-C', str(source), 'rev-parse', 'HEAD'], text=True).strip()
    if revision != config['primaryRevision']:
        raise SystemExit('Primary repository revision differs from the reviewed revision')
    # A matching HEAD alone does not prove input bytes: reject local tracked edits.
    if subprocess.check_output(['git', '-C', str(source), 'status', '--porcelain', '--untracked-files=no'], text=True).strip():
        raise SystemExit('Primary source has tracked local changes')
    header_path = 'src/data/map_headers.h'
    header_bytes = (source / header_path).read_bytes()
    headers = {name: dict(re.findall(r'\.(\w+) = ([^,\n]+)', body))
               for name, body in re.findall(r'\[(MAP_\w+)\]\s*=\s*\{(.*?)\n\s*\},?', header_bytes.decode(), re.S)}
    land_path = 'files/a/0/6/5'
    land_bytes = (source / land_path).read_bytes()
    members = narc_members(land_bytes)
    # A complete census prevents a convenient hand-picked list from hiding gaps.
    candidate_ids = {name for name, h in headers.items() if h['mapType'] == 'MAP_TYPE_INTERIOR' and (
        h['regionNo'] == 'MAP_REGION_JOHTO' or h['mapsec'] in {
            'MAPSEC_GOLDENROD_CITY', 'MAPSEC_ROUTE_26', 'MAPSEC_ROUTE_27', 'MAPSEC_ROUTE_28', 'MAPSEC_POKEMON_LEAGUE'})}
    accounted = [r['mapId'] for r in config['rooms'] + config['excluded']]
    if len(set(accounted)) != len(accounted) or set(accounted) != candidate_ids:
        raise SystemExit('Interior census differs from primary headers')
    catalog_path = ROOT / 'scripts/atlas-map-sources.json'
    catalog = json.loads(catalog_path.read_text())
    view_order = {name: {v['id']: i for i, v in enumerate(views)} for name, views in catalog['locations'].items()}
    # Idempotent generation; retain hand-verified artwork, order and first views.
    for location, views in catalog['locations'].items():
        catalog['locations'][location] = [v for v in views if not (v.get('kind') == 'terrain-plan' and v['id'].startswith('plan-'))]
    inputs = {header_path: sha(header_bytes), land_path: sha(land_bytes)}
    rooms = []
    for room in config['rooms']:
        name = room['mapId']
        h = headers[name]
        matrix_path = 'files/fielddata/mapmatrix/map_matrix/' + h['matrixId'].removeprefix('NARC_map_matrix_').removesuffix('_bin') + '.bin'
        event_path = 'files/fielddata/eventdata/zone_event/' + h['eventsBank'].removeprefix('NARC_zone_event_').removesuffix('_bin') + '.json'
        matrix = (source / matrix_path).read_bytes()
        event = (source / event_path).read_bytes()
        inputs[matrix_path] = sha(matrix)
        inputs[event_path] = sha(event)
        evidence = dict(room, matrix=matrix_path, events=event_path)
        views = catalog['locations'][room['location']]
        if room.get('existingView'):
            view = next(v for v in views if v['id'] == room['existingView'])
            view['mapIds'] = sorted(set(view.get('mapIds', []) + [name]))
            evidence['viewId'] = view['id']
        else:
            attributes, model, attribute_hash = terrain_grid(matrix, members)
            warps = json.loads(event).get('warps', [])
            bounds = crop_grid(attributes, warps)
            title = room['label']
            # Avoid squeezing long gatehouse names into a fixed raster title.
            drawing, width, height = diagram(attributes, warps, bounds, title)
            view_id = 'plan-' + name.removeprefix('MAP_').lower().replace('_', '-')
            file = view_id + '.png'
            dest = ROOT / 'assets/maps' / file
            subprocess.run(['convert', '-size', f'{width}x{height}', 'xc:#f4f6ef', '-font', 'DejaVu-Sans', '-draw', drawing, '-strip', '-define', 'png:exclude-chunk=date,time', 'PNG24:' + str(dest)], check=True)
            url = f'https://github.com/pret/pokeheartgold/blob/{revision}/{event_path}'
            notice = 'Game-data terrain plan, not a screenshot. Clear tiles have no static terrain collision flag; objects, height, scripts and puzzles can further restrict movement. E marks exits or stairs; scripted transfers may have no E marker.'
            views.append(dict(id=view_id, label=title + ' · terrain plan', image=file, file=file,
                              generated_sha256=sha(dest.read_bytes()), width=width, height=height,
                              source=url, kind='terrain-plan', mapIds=[name], notice=notice))
            evidence.update(viewId=view_id, model=model, attributesSha256=attribute_hash,
                            bounds=bounds, warps=warps, file=file,
                            terrainRows=[''.join('E' if any(w['x']==x and w['z']==z for w in warps) else '#' if attributes[z*32+x]&0x8000 else '.' for x in range(bounds[0], bounds[2]+1)) for z in range(bounds[1], bounds[3]+1)])
        rooms.append(evidence)
    for name, views in catalog['locations'].items():
        positions = view_order[name]
        views.sort(key=lambda view: positions.get(view['id'], len(positions)))
    catalog_path.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + '\n')
    report = dict(gameId='soulsilver', primaryRevision=revision, scope=config['scope'],
                  inputSha256=inputs, rooms=rooms, excluded=config['excluded'],
                  accountedHeaders=len(accounted), coveredRooms=len(rooms),
                  existingRooms=sum('existingView' in r for r in rooms),
                  addedPlans=sum('file' in r for r in rooms), missing=[])
    (ROOT / 'docs/atlas-johto-interior-coverage.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({key:report[key] for key in ['accountedHeaders', 'coveredRooms', 'existingRooms', 'addedPlans', 'missing']}))


if __name__ == '__main__':
    main()
