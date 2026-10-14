const views = {
  overview: ['Overview', 'Load a save to explore your adventure. Your file stays in this browser.'],
  party: ['Party', 'Your travelling team, in its original party order.'],
  storage: ['PC Storage', 'Browse your boxes and inspect each Pokémon.'],
  pokedex: ['Pokédex', 'Your save’s Seen and Caught registrations.'],
  collection: ['Collection', 'Explore current ownership, registrations, forms, and collection statistics.'],
};
const heading = document.querySelector('#view-heading');
const panels = [...document.querySelectorAll('[data-reader-view]')];
let activeView;
function route(focus = false) {
  const requested = location.hash.slice(1);
  // Existing collection jump links keep their section context.
  const section = document.getElementById(requested);
  const view = Object.hasOwn(views, requested) ? requested : section?.dataset.readerView || 'overview';
  activeView = view;
  if (section?.dataset.readerView) section.querySelector("details")?.setAttribute("open", "");
  heading.textContent = views[view][0];
  document.querySelector('#view-description').textContent = views[view][1];
  for (const panel of panels) panel.classList.toggle('inactive-view', panel.dataset.readerView !== view);
  for (const link of document.querySelectorAll('[data-view]')) {
    if (link.dataset.view === view) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
  updateState();
  if (focus) heading.focus();
}
function updateState() {
  const empty = document.querySelector('#view-empty');
  const hideEmpty = activeView === 'overview' || panels.some(panel => panel.dataset.readerView === activeView && !panel.hidden);
  if (empty.hidden !== hideEmpty) empty.hidden = hideEmpty;
  const status = document.querySelector('#file-status');
  document.querySelector('#dashboard-save-status').textContent = status.classList.contains('success') ? 'Save loaded' : status.classList.contains('error') ? 'Save needs attention' : status.textContent.includes('Reading') ? 'Loading save…' : 'No save loaded';
}
new MutationObserver(updateState).observe(document.querySelector('.app'), {subtree:true, attributes:true, attributeFilter:['hidden']});
new MutationObserver(updateState).observe(document.querySelector('#file-status'), {subtree:true, childList:true, attributes:true, attributeFilter:['class']});
window.addEventListener('hashchange', () => route(true));
const toggle = document.querySelector('#theme-toggle');
let theme = 'dark';
try { if (localStorage.getItem('pokemon-reader-theme') === 'light') theme = 'light'; } catch {}
function applyTheme() {
  document.documentElement.dataset.theme = theme;
  toggle.textContent = theme === 'dark' ? 'Light mode' : 'Dark mode';
  toggle.setAttribute('aria-pressed', String(theme === 'light'));
}
toggle.addEventListener('click', () => {
  theme = theme === 'dark' ? 'light' : 'dark';
  try { localStorage.setItem('pokemon-reader-theme', theme); } catch {}
  applyTheme();
});
applyTheme();
route();
