/* Shared navigation and theme for every tool; keep the existing Reader preference. */
(() => {
  const root = new URL('../', document.currentScript.src);
  const key = 'pokemon-reader-theme';
  const savedTheme = () => {
    try { return localStorage.getItem(key) === 'light' ? 'light' : 'dark'; }
    catch { return 'dark'; }
  };
  let theme = savedTheme();
  function applyTheme() {
    document.documentElement.dataset.theme = theme;
    for (const toggle of document.querySelectorAll('#theme-toggle')) {
      toggle.textContent = theme === 'dark' ? 'Light mode' : 'Dark mode';
      toggle.setAttribute('aria-pressed', String(theme === 'light'));
    }
  }
  applyTheme();
  window.addEventListener('storage', event => {
    if (event.key === key || event.key === null) { theme = savedTheme(); applyTheme(); }
  });
  window.addEventListener('pageshow', () => { theme = savedTheme(); applyTheme(); });
  customElements.define('app-menu', class extends HTMLElement {
    connectedCallback() {
      if (this.querySelector('nav')) return;
      const nav = document.createElement('nav');
      nav.className = 'secondary-nav';
      nav.setAttribute('aria-label', 'Companion tools');
      const reader = this.getAttribute('tool') === 'reader';
      const load = document.createElement(reader ? 'button' : 'a');
      load.id = 'load-save'; load.textContent = 'Load Save';
      if (reader) load.type = 'button';
      else load.href = new URL('#overview', root).href;
      nav.append(load);
      for (const [label, path, tool] of [['Team Planner', 'team-planner/', 'planner'], ['Atlas', 'pokedex-earth/', 'atlas'], ['Pokédex', 'pokedex/', 'pokedex']]) {
        const link = document.createElement('a');
        link.textContent = label; link.href = new URL(path, root).href;
        if (this.getAttribute('tool') === tool) link.setAttribute('aria-current', 'page');
        nav.append(link);
      }
      const toggle = document.createElement('button');
      toggle.id = 'theme-toggle'; toggle.type = 'button';
      toggle.addEventListener('click', () => {
        theme = theme === 'dark' ? 'light' : 'dark';
        try { localStorage.setItem(key, theme); } catch {}
        applyTheme();
      });
      const settings = document.createElement('dialog'); settings.id = 'app-settings';
      settings.setAttribute('aria-labelledby', 'app-settings-title');
      const heading = document.createElement('h2'); heading.id = 'app-settings-title'; heading.textContent = 'Settings';
      const close = document.createElement('button'); close.type = 'button'; close.textContent = 'Close';
      close.addEventListener('click', () => settings.close());
      settings.append(heading, toggle);
      const gear = document.createElement('button'); gear.id = 'settings-toggle'; gear.type = 'button'; gear.textContent = '⚙';
      gear.setAttribute('aria-label', 'Settings'); gear.setAttribute('aria-haspopup', 'dialog');
      gear.addEventListener('click', () => settings.showModal());
      settings.append(close); nav.append(gear); this.append(nav, settings); applyTheme();
      const attachSettings = () => {
        const content = document.getElementById('planner-settings');
        if (content) { content.hidden = false; settings.insertBefore(content, close); }
      };
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', attachSettings, {once:true});
      else attachSettings();
    }
  });
})();
