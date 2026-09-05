// media query match that indicates desktop width
const isDesktop = window.matchMedia('(min-width: 900px)');

/**
 * Loads the nav plain-html fragment's DOM, trying the localhost path first and
 * then the DA/EDS production root path. Metadata-independent by design.
 * @returns {Promise<Document|null>}
 */
async function loadNavFragment() {
  // metadata-independent: /content first (localhost), then root (DA/EDS prod)
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) resp = await fetch('/nav.plain.html');
  if (!resp.ok) return null;
  const html = await resp.text();
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc;
}

/**
 * Toggles the mobile nav drawer open/closed.
 * @param {Element} nav
 * @param {boolean|null} forceExpanded
 */
function toggleMenu(nav, forceExpanded = null) {
  const expanded = forceExpanded !== null
    ? !forceExpanded
    : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  if (button) {
    button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  }
}

/**
 * Loads and decorates the header nav.
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const doc = await loadNavFragment();
  if (!doc) return;

  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (doc.body.firstElementChild) nav.append(doc.body.firstElementChild);

  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  // Resolve relative image paths (images/...) to a root-relative path so they
  // load regardless of the current page's URL depth (localhost + DA/EDS).
  nav.querySelectorAll('img[src]').forEach((img) => {
    const src = img.getAttribute('src');
    if (src && !/^(https?:)?\/\//.test(src) && !src.startsWith('/')) {
      img.setAttribute('src', `/${src.replace(/^\.?\/*/, '')}`);
    }
  });

  // Brand: strip button styling from the logo link
  const navBrand = nav.querySelector('.nav-brand');
  if (navBrand) {
    const brandLink = navBrand.querySelector('a');
    if (brandLink) brandLink.className = '';
  }

  // Sections: promote the inner <ul> to a direct child of <nav>.
  let navSections = nav.querySelector('.nav-sections');
  if (navSections && navSections.tagName === 'DIV') {
    const ul = navSections.querySelector(':scope > ul');
    if (ul) {
      ul.classList.add('nav-sections');
      navSections.replaceWith(ul);
      navSections = ul;
    }
  }

  // Tools: split the search box (white main bar) from the utility items
  // (Sign In + locale, dark strip). Search becomes its own grid child.
  const navTools = nav.querySelector('.nav-tools');
  if (navTools) {
    const localeList = navTools.querySelector('ul');
    if (localeList) {
      localeList.classList.add('nav-locale-list');
      const current = localeList.querySelector(':scope > li > a');
      const toggle = document.createElement('a');
      toggle.href = current ? current.getAttribute('href') : '#';
      toggle.className = 'nav-locale-toggle';
      toggle.setAttribute('aria-expanded', 'false');
      // preserve the flag image (if any) + current locale label
      toggle.innerHTML = current ? current.innerHTML : 'en-US';
      const wrapper = document.createElement('div');
      wrapper.className = 'nav-locale';
      localeList.replaceWith(wrapper);
      wrapper.append(toggle, localeList);
      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        const open = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', open ? 'false' : 'true');
      });
    }
  }

  // Search box lives on the white main bar (its own grid child, not in tools)
  const search = document.createElement('div');
  search.className = 'nav-search';
  search.innerHTML = '<span class="nav-search-icon" aria-hidden="true"></span><input type="search" aria-label="Search" placeholder="SEARCH">';

  // Hamburger (mobile) opens the left drawer
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav));

  // Order in DOM: hamburger, brand, sections, tools, search
  nav.prepend(hamburger);
  if (navBrand) navBrand.after(navSections);
  nav.append(search);
  nav.setAttribute('aria-expanded', 'false');

  // Reset state on breakpoint change (close mobile drawer when crossing to desktop)
  toggleMenu(nav, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, isDesktop.matches));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
