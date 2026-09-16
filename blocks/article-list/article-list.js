import { createOptimizedPicture } from '../../scripts/aem.js';

/*
 * article-list — dynamic card grid backed by the EDS query index.
 *
 * Authored as a config block:
 *   | Article List |                    |
 *   | index        | /query-index.json  |
 *   | filter       | /us/en/magazine/   |
 *   | page-size    | 10                 |
 *
 * Reads the query index, keeps entries whose path starts with `filter`
 * (excluding the filter root itself), and renders `page-size` cards at a time
 * with a "Load more" button. Card markup mirrors the cards-teaser block so the
 * two share styling.
 */

const DEFAULTS = {
  index: '/query-index.json',
  filter: '',
  'page-size': 10,
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

export default function decorate(block) {
  const config = readConfig(block);
  block.textContent = '';

  const ul = document.createElement('ul');
  block.append(ul);

  const more = document.createElement('button');
  more.className = 'article-list-more';
  more.type = 'button';
  more.textContent = 'Load more';

  loadEntries(config)
    .then((entries) => {
      let shown = 0;
      const pageSize = config['page-size'];

      const showNext = () => {
        entries.slice(shown, shown + pageSize).forEach((e) => ul.append(renderCard(e)));
        shown += pageSize;
        if (shown >= entries.length) more.remove();
      };

      showNext();
      if (entries.length > pageSize) {
        more.addEventListener('click', showNext);
        block.append(more);
      }
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.error('article-list: could not load index', error);
      block.classList.add('article-list-empty');
    });
}
