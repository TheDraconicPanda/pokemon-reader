// Shared presentation only: save individuals and reference species keep separate data.
const root = new URL('../', import.meta.url);
export function hgssSprite(speciesId, shiny = false) {
  return shiny
    ? `https://raw.githubusercontent.com/PokeAPI/sprites/7a7d66b1620e646f69afd48dc1273da9033ede9c/sprites/pokemon/versions/generation-iv/heartgold-soulsilver/shiny/${speciesId}.png`
    : new URL(`assets/pokemon/hgss/${speciesId}.png`, root).href;
}
export function typeBadges(values) {
  const types = document.createElement('div'); types.className = 'type-badges';
  for (const type of values || []) {
    const badge = document.createElement('span'); badge.className = `type-badge type-${type}`;
    badge.textContent = type[0].toUpperCase() + type.slice(1); types.append(badge);
  }
  return types;
}
export function speciesHeading(record) {
  const header = document.createElement('div'); header.className = 'pokemon-detail-header';
  const image = document.createElement('img'); image.src = hgssSprite(record.sprite || record.id);
  image.width = 96; image.height = 96; image.alt = '';
  const identity = document.createElement('div');
  const name = document.createElement('p'); name.className = 'party-species';
  name.textContent = `${record.name} · National #${String(record.id).padStart(3,'0')}`;
  identity.append(name, typeBadges(record.types)); header.append(image,identity); return header;
}
