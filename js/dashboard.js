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
const hasSave = () => document.querySelector(".app").dataset.saveLoaded === "true";
function route(focus = false) {
  const requested = location.hash.slice(1);
  // Existing collection jump links keep their section context.
  let section = document.getElementById(requested);
  let view = Object.hasOwn(views, requested) ? requested : section?.dataset.readerView || 'overview';
  if (view !== "overview" && !hasSave()) {
    view = "overview"; section = null;
    // An initial decoded-profile restore is asynchronous. Keep the requested
    // route until it finishes; empty/denied storage still falls back to Overview.
    if (document.querySelector(".app").dataset.adventureLoading !== "true")
      history.replaceState(null, "", `${location.pathname}${location.search}#overview`);
  }
  activeView = view;
  document.querySelector(".app").dataset.view = view;
  if (section?.dataset.readerView) section.querySelector("details")?.setAttribute("open", "");
  heading.textContent = views[view][0];
  document.querySelector('#view-description').textContent = views[view][1];
  for (const panel of panels) panel.classList.toggle('inactive-view', panel.dataset.readerView !== view);
  for (const link of document.querySelectorAll('[data-view]')) {
    if (link.dataset.view === view) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
  updateState();
  if (focus) {
    const target = section?.querySelector('h2') || heading;
    target.tabIndex = -1; target.focus();
  }
}
function updateState() {
  const loaded = hasSave();
  if (!loaded && activeView !== "overview") { route(); return; }
  for (const link of document.querySelectorAll(".dashboard-nav [data-view]")) {
    const disabled = link.dataset.view !== "overview" && !loaded;
    if (disabled) {
      link.setAttribute("aria-disabled", "true"); link.tabIndex = -1; link.removeAttribute("href");
      link.title = "Load a save to open this view";
    } else {
      link.removeAttribute("aria-disabled"); link.removeAttribute("tabindex");
      link.href = `#${link.dataset.view}`; link.removeAttribute("title");
    }
  }
  for (const button of document.querySelectorAll(".summary-button")) button.disabled = !loaded;
  const empty = document.querySelector('#view-empty');
  const hideEmpty = activeView === 'overview' || panels.some(panel => panel.dataset.readerView === activeView && !panel.hidden);
  if (empty.hidden !== hideEmpty) empty.hidden = hideEmpty;
  document.querySelector('#view-description').textContent = activeView === 'overview' && loaded ? 'Your party, collection, and Pokédex at a glance.' : views[activeView][1];
}
new MutationObserver(records => {
  if (records.some(record => record.attributeName === 'data-adventure-loading')) route();
  else updateState();
}).observe(document.querySelector('.app'), {subtree:true, attributes:true, attributeFilter:['hidden','data-save-loaded','data-adventure-loading']});
new MutationObserver(updateState).observe(document.querySelector('#file-status'), {subtree:true, childList:true, attributes:true, attributeFilter:['class']});
window.addEventListener('hashchange', () => route(true));
route();
