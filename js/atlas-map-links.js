import { mapLinksForLocation } from './data/atlas-map-links.js';

// DOM markers preserve original source images and stay interactive at full size.
export function createMapLinks(gameId, locationName, maps, onSelect) {
  const data = mapLinksForLocation(gameId, locationName);
  if (!data) return null;
  let activeMap;
  let arrival;
  let opener;
  const overlay = document.createElement('div');
  overlay.className = 'map-marker-viewport';
  const panel = document.createElement('section');
  panel.className = 'map-stair-links';
  panel.setAttribute('aria-label', 'Map connections');
  const dialog = document.createElement('dialog');
  dialog.className = 'map-viewer';
  dialog.setAttribute('aria-label', `${locationName} map with connections`);
  const header = document.createElement('div');
  header.className = 'map-viewer-header';
  const title = document.createElement('h3');
  const close = document.createElement('button');
  close.type = 'button'; close.textContent = 'Close map';
  close.addEventListener('click', () => dialog.close());
  header.append(title, close);
  const selectLabel = document.createElement('label');
  selectLabel.textContent = 'Map / area';
  const select = document.createElement('select');
  select.className = 'map-select';
  for (const map of maps.filter(m => data.pairs.some(p => p.ends.some(e => e.mapId === m.id)))) {
    const option = document.createElement('option');
    option.value = map.id; option.textContent = map.label; select.append(option);
  }
  select.addEventListener('change', () => onSelect(select.value, null));
  selectLabel.append(select);
  const help = document.createElement('p');
  help.className = 'map-hint';
  help.textContent = data.help || 'Scroll the map to explore. Matching letters connect the same stairs or passage between maps.';
  const viewport = document.createElement('div');
  viewport.className = 'map-viewer-scroll';
  viewport.tabIndex = 0; viewport.setAttribute('aria-label', 'Scrollable full-size map');
  const viewerLinks = document.createElement('div');
  const status = document.createElement('p');
  status.className = 'map-viewer-status'; status.setAttribute('role', 'status');
  const original = document.createElement('a');
  original.textContent = 'Open original image'; original.target = '_blank'; original.rel = 'noopener noreferrer';
  dialog.append(header, selectLabel, help, viewport, status, viewerLinks, original);
  dialog.addEventListener('close', () => {
    const target = overlay.querySelector(`[data-stair="${arrival}"]`) || opener;
    if (target?.isConnected) target.focus({ preventScroll: true });
  });

  function connections(map) {
    return data.pairs.flatMap(pair => pair.ends.flatMap((end, index) => end.mapId === map.id
      ? [{ ...pair, endIndex: index, key: pair.ends[0].mapId === pair.ends[1].mapId ? `${pair.id}-${index}` : pair.id }] : []));
  }
  function destination(pair) {
    return pair.ends[1 - pair.endIndex];
  }
  function description(pair) {
    const target = maps.find(map => map.id === destination(pair).mapId);
    return pair.oneWay && pair.endIndex === 1
      ? `${pair.id} · Landing only · return using another route`
      : `${pair.id} · ${pair.label}${pair.ends[pair.endIndex].side ? ' · ' + pair.ends[pair.endIndex].side + ' → ' + destination(pair).side : ''}${pair.oneWay ? ' · one-way ↓' : ''} → ${target.label}`;
  }
  function travel(pair) {
    if (pair.oneWay && pair.endIndex === 1) return;
    const key = pair.ends[0].mapId === pair.ends[1].mapId ? `${pair.id}-${1 - pair.endIndex}` : pair.id;
    onSelect(destination(pair).mapId, key);
  }
  function markers(map, large = false) {
    const layer = document.createElement('div');
    layer.className = 'map-marker-layer';
    if (large) layer.classList.add('map-marker-layer-large');
    layer.style.setProperty('--map-ratio', String(map.width / map.height));
    for (const pair of connections(map)) {
      const end = pair.ends[pair.endIndex];
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'map-stair-marker';
      button.textContent = pair.id + (pair.oneWay ? (pair.endIndex === 0 ? '↓' : '·') : ''); button.dataset.stair = pair.key;
      button.classList.toggle('is-one-way', !!pair.oneWay);
      if (pair.oneWay && pair.endIndex === 1) { button.setAttribute('aria-disabled', 'true'); button.tabIndex = -1; }
      button.style.left = `${end.x / map.width * 100}%`;
      button.style.top = `${end.y / map.height * 100}%`;
      button.title = description(pair); button.setAttribute('aria-label', description(pair));
      button.classList.toggle('is-arrival', pair.key === arrival);
      button.addEventListener('click', () => travel(pair));
      layer.append(button);
    }
    return layer;
  }
  function linkList() {
    const fragment = document.createDocumentFragment();
    const label = document.createElement('strong'); label.textContent = data.heading || 'Stairs & passages';
    const list = document.createElement('div'); list.className = 'map-stair-list';
    for (const pair of connections(activeMap)) {
      const button = document.createElement('button');
      button.type = 'button'; button.textContent = description(pair);
      button.dataset.stairLink = pair.key;
      if (pair.oneWay && pair.endIndex === 1) { button.setAttribute('aria-disabled', 'true'); button.tabIndex = -1; }
      button.classList.toggle('is-arrival', pair.key === arrival);
      button.addEventListener('click', () => travel(pair)); list.append(button);
    }
    fragment.append(label, list);
    return fragment;
  }
  function focusArrival() {
    if (!arrival) return;
    const scope = dialog.open ? viewport : overlay;
    const target = scope.querySelector(`[data-stair="${arrival}"]`);
    target?.focus({ preventScroll: true });
    if (dialog.open && target) {
      // Pan only the image: scrollIntoView also scrolls the dialog and can hide
      // its floor selector and help, especially on a phone.
      const marker = target.getBoundingClientRect();
      const bounds = viewport.getBoundingClientRect();
      viewport.scrollTo({
        left: viewport.scrollLeft + marker.left - bounds.left + marker.width / 2 - viewport.clientWidth / 2,
        top: viewport.scrollTop + marker.top - bounds.top + marker.height / 2 - viewport.clientHeight / 2
      });
    }
  }
  function updateViewer() {
    title.textContent = `${locationName} · ${activeMap.label}`;
    select.value = activeMap.id;
    const picture = document.createElement('div'); picture.className = 'map-viewer-picture';
    picture.style.width = `${activeMap.width}px`; picture.style.height = `${activeMap.height}px`;
    const image = document.createElement('img');
    image.src = `../assets/maps/${activeMap.file}`;
    image.width = activeMap.width; image.height = activeMap.height;
    image.alt = `${locationName} · ${activeMap.label}; north is up; lettered markers link matching connections`;
    const layer = markers(activeMap, true);
    status.textContent = arrival ? `Arrived at ${data.arrivalLabel || "connection"} ${arrival.replace(/-[01]$/, '')} on ${activeMap.label}.` : '';
    image.addEventListener('error', () => {
      if (!picture.isConnected) return;
      layer.hidden = true; status.textContent = 'Map unavailable. Use the stair links or select another map.';
    }, { once: true });
    picture.append(image, layer); viewport.replaceChildren(picture);
    viewerLinks.replaceChildren(linkList()); original.href = image.src;
    viewport.scrollTo(0, 0);
    focusArrival();
  }
  return {
    overlay, panel, dialog, arrivalLabel: data.arrivalLabel || "connection",
    update(map, selectedPair = null) {
      activeMap = map; arrival = selectedPair;
      const available = connections(map).length > 0;
      overlay.hidden = panel.hidden = !available;
      overlay.replaceChildren(available ? markers(map) : document.createDocumentFragment());
      panel.replaceChildren(available ? linkList() : document.createDocumentFragment());
      if (dialog.open && available) updateViewer();
      else if (dialog.open) dialog.close();
      focusArrival();
      return available;
    },
    unavailable() { overlay.hidden = true; panel.hidden = true; },
    openViewer(trigger) {
      if (!connections(activeMap).length) return;
      opener = trigger; updateViewer(); dialog.showModal();
      focusArrival();
    }
  };
}
