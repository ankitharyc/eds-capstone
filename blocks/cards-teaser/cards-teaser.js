import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Adventure category taxonomy (matches the WKND source adventures filter).
 * Keyed by adventure slug; a slug may belong to several categories.
 */
const ADVENTURE_CATEGORIES = {
  'climbing-new-zealand': ['climbing'],
  'colorado-rock-climbing': ['climbing'],
  'cycling-southern-utah': ['cycling'],
  'cycling-tuscany': ['cycling', 'travel'],
  'west-coast-cycling': ['cycling'],
  'whistler-mountain-biking': ['cycling'],
  'downhill-skiing-wyoming': ['skiing'],
  'ski-touring-mont-blanc': ['skiing'],
  'tahoe-skiing': ['skiing'],
  'bali-surf-camp': ['surfing'],
  'surf-camp-costa-rica': ['surfing'],
  'beervana-portland': ['travel'],
  'gastronomic-marais-tour': ['travel'],
  'napa-wine-tasting': ['travel'],
  'riverside-camping-australia': ['travel'],
  'yosemite-backpacking': ['travel'],
};

const TAB_ORDER = ['all', 'climbing', 'cycling', 'skiing', 'surfing', 'travel'];
const TAB_LABELS = {
  all: 'All',
  climbing: 'Climbing',
  cycling: 'Cycling',
  skiing: 'Skiing',
  surfing: 'Surfing',
  travel: 'Travel',
};

/**
 * Adds a category filter tab strip above an adventures card grid and wires up
 * click filtering. Only applied to the adventures listing (a large grid whose
 * cards all link to /adventures/ detail pages) — not the homepage teaser grid.
 * @param {Element} block the cards-teaser block
 * @param {Element} ul the card list
 */
function addAdventureTabs(block, ul) {
  const items = [...ul.children];
  const slugOf = (li) => {
    const a = li.querySelector('a[href*="/adventures/"]');
    if (!a) return null;
    return a.getAttribute('href').replace(/^.*\/adventures\//, '').replace(/\/$/, '').replace(/\.html$/, '');
  };

  // Only engage for the adventures listing: 10+ cards, all adventure detail links.
  const slugs = items.map(slugOf);
  const isAdventureList = items.length >= 10 && slugs.every((s) => s && ADVENTURE_CATEGORIES[s]);
  if (!isAdventureList) return;

  // tag each card with its categories
  items.forEach((li, i) => {
    li.dataset.categories = (ADVENTURE_CATEGORIES[slugs[i]] || []).join(' ');
  });

  const tablist = document.createElement('div');
  tablist.className = 'cards-teaser-tabs';
  tablist.setAttribute('role', 'tablist');

  const applyFilter = (cat) => {
    items.forEach((li) => {
      const show = cat === 'all' || li.dataset.categories.split(' ').includes(cat);
      li.hidden = !show;
    });
  };

  TAB_ORDER.forEach((cat, idx) => {
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'cards-teaser-tab';
    tab.textContent = TAB_LABELS[cat];
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-selected', idx === 0 ? 'true' : 'false');
    tab.addEventListener('click', () => {
      tablist.querySelectorAll('.cards-teaser-tab').forEach((t) => t.setAttribute('aria-selected', 'false'));
      tab.setAttribute('aria-selected', 'true');
      applyFilter(cat);
    });
    tablist.append(tab);
  });

  block.prepend(tablist);
}

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-teaser-card-image';
      else div.className = 'cards-teaser-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';
  block.append(ul);

  addAdventureTabs(block, ul);
}
