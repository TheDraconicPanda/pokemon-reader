// Verified HGSS warp pairs; pixel anchors refer to the unmodified local PNGs.
// Primary indices, coordinates and source hashes: docs/whirl-islands-stair-links.json.
export const SOULSILVER_MAP_LINKS = Object.freeze({
  'Whirl Islands': {
    pairs: [
      { id: 'A', label: 'NW ladder', ends: [{ mapId: '1f-nw', x: 70, y: 72 }, { mapId: 'b1f', x: 168, y: 110 }] },
      { id: 'B', label: 'NE · north ladder', ends: [{ mapId: '1f-ne', x: 375, y: 71 }, { mapId: 'b1f', x: 968, y: 74 }] },
      { id: 'C', label: 'NE · south ladder', ends: [{ mapId: '1f-ne', x: 295, y: 223 }, { mapId: 'b1f', x: 824, y: 182 }] },
      { id: 'D', label: 'SW · west ladder', ends: [{ mapId: '1f-sw', x: 70, y: 86 }, { mapId: 'b1f', x: 264, y: 650 }] },
      { id: 'E', label: 'SW · east ladder', ends: [{ mapId: '1f-sw', x: 406, y: 86 }, { mapId: 'b1f', x: 536, y: 650 }] },
      { id: 'F', label: 'SE ladder', ends: [{ mapId: '1f-se', x: 134, y: 112 }, { mapId: 'b1f', x: 856, y: 600 }] }
    ]
  }
});
