import { createOptimizedPicture } from '../../scripts/aem.js';

/*
 * article-list — dynamic card grid backed by the EDS query index.
 *
 * Authored as a config block:
 *   | Article List |                    |
 *   | index        | /query-index.json  |
 *   | filter       | /us/en/magazine/   |
 *   | page-size    | 10                 |
 *   | tabs         | adventures         |  (optional)
 *   | load-more    | false              |  (optional; default true)
 *
 * Reads the query index, keeps entries whose path starts with `filter`
 * (excluding the filter root itself), and renders `page-size` cards at a time
 * with a "Load more" button. Card markup mirrors the cards-teaser block so the
 * two share styling. When `tabs` names a known taxonomy, a category tab strip
 * is shown above the grid and filters the entries (each tab re-paginates).
 */

const DEFAULTS = {
  index: '/query-index.json',
  filter: '',
  'page-size': 10,
  tabs: '',
  'load-more': 'true',
};

/**
 * Category taxonomies for optional tab filtering, keyed by taxonomy name (the
 * `tabs` config value). Each maps an entry slug (last path segment) to the
 * categories it belongs to. Mirrors the WKND adventures source filter.
 */
const TAXONOMIES = {
  adventures: {
    order: ['all', 'climbing', 'cycling', 'skiing', 'surfing', 'travel'],
    labels: {
      all: 'All',
      climbing: 'Climbing',
      cycling: 'Cycling',
      skiing: 'Skiing',
      surfing: 'Surfing',
      travel: 'Travel',
    },
    slugs: {
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
    },
  },
};

/* read the key/value config rows the author entered */
function readConfig(block) {
  const config = { ...DEFAULTS };
  [...block.children].forEach((row) => {
    const cells = row.children;
    if (cells.length < 2) return;
    const key = cells[0].textContent.trim().toLowerCase();
    const value = cells[1].textContent.trim();
    if (key) config[key] = value;
  });
  config['page-size'] = parseInt(config['page-size'], 10) || DEFAULTS['page-size'];
  return config;
}

/* fetch and filter the index entries for this list */
async function loadEntries(config) {
  const resp = await fetch(config.index);
  if (!resp.ok) throw new Error(`query index ${config.index} -> ${resp.status}`);
  const json = await resp.json();
  const all = Array.isArray(json.data) ? json.data : [];
  const filter = config.filter.replace(/\/$/, '');
  const entries = all.filter((e) => {
    if (!e.path || !filter) return !!e.path;
    // keep descendants of the filter path, not the listing page itself
    return e.path.startsWith(`${filter}/`) && e.path !== filter && e.path !== `${filter}/`;
  });
  // newest first when the index exposes a last-modified timestamp
  entries.sort((a, b) => (Number(b.lastModified) || 0) - (Number(a.lastModified) || 0));
  return entries;
}

/* build a single card matching the cards-teaser markup */
function renderCard(entry) {
  const li = document.createElement('li');

  const imageCell = document.createElement('div');
  imageCell.className = 'article-list-card-image';
  if (entry.image) {
    const pic = createOptimizedPicture(entry.image, entry.title || '', false, [{ width: '750' }]);
    const a = document.createElement('a');
    a.href = entry.path;
    a.setAttribute('aria-hidden', 'true');
    a.setAttribute('tabindex', '-1');
    a.append(pic);
    imageCell.append(a);
  }

  const body = document.createElement('div');
  body.className = 'article-list-card-body';
  const titleLink = document.createElement('a');
  titleLink.href = entry.path;
  titleLink.textContent = entry.title || entry.path;
  body.append(titleLink);
  if (entry.description) body.append(document.createTextNode(entry.description));

  li.append(imageCell, body);
  return li;
}

/* the last path segment, used to look an entry up in a taxonomy */
function slugOf(entry) {
  return (entry.path || '').replace(/\/$/, '').split('/').pop();
}

/* build the category tab strip and wire it to re-render the (filtered) list */
function buildTabs(taxonomy, entries, render) {
  const tablist = document.createElement('div');
  tablist.className = 'article-list-tabs';
  tablist.setAttribute('role', 'tablist');

  taxonomy.order.forEach((cat, idx) => {
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'article-list-tab';
    tab.textContent = taxonomy.labels[cat];
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-selected', idx === 0 ? 'true' : 'false');
    tab.addEventListener('click', () => {
      tablist.querySelectorAll('.article-list-tab').forEach((t) => t.setAttribute('aria-selected', 'false'));
      tab.setAttribute('aria-selected', 'true');
      const filtered = cat === 'all'
        ? entries
        : entries.filter((e) => (taxonomy.slugs[slugOf(e)] || []).includes(cat));
      render(filtered);
    });
    tablist.append(tab);
  });

  return tablist;
}

export default function decorate(block) {
  const config = readConfig(block);
  const taxonomy = TAXONOMIES[config.tabs.toLowerCase()];
  block.textContent = '';

  const ul = document.createElement('ul');
  const more = document.createElement('button');
  more.className = 'article-list-more';
  more.type = 'button';
  more.textContent = 'Load more';

  const pageSize = config['page-size'];
  const loadMore = String(config['load-more']).toLowerCase() !== 'false';
  let showNext = () => {};
  more.addEventListener('click', () => showNext());

  // (re)render a set of entries from scratch. With load-more off, show only the
  // first page and no button (a fixed teaser row); otherwise paginate.
  const render = (list) => {
    ul.textContent = '';
    more.remove();
    if (!loadMore) {
      list.slice(0, pageSize).forEach((e) => ul.append(renderCard(e)));
      return;
    }
    let shown = 0;
    showNext = () => {
      list.slice(shown, shown + pageSize).forEach((e) => ul.append(renderCard(e)));
      shown += pageSize;
      if (shown >= list.length) more.remove();
    };
    showNext();
    if (list.length > pageSize) block.append(more);
  };

  loadEntries(config)
    .then((entries) => {
      if (taxonomy) block.append(buildTabs(taxonomy, entries, render));
      block.append(ul);
      render(entries);
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.error('article-list: could not load index', error);
      block.classList.add('article-list-empty');
    });
}
