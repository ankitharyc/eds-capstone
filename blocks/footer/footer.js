/**
 * Loads the footer plain-html fragment's DOM, trying the localhost path first
 * and then the DA/EDS production root path. Metadata-independent by design.
 * @returns {Promise<Document|null>}
 */
async function loadFooterFragment() {
  // metadata-independent: /content first (localhost), then root (DA/EDS prod)
  let resp = await fetch('/content/footer.plain.html');
  if (!resp.ok) resp = await fetch('/footer.plain.html');
  if (!resp.ok) return null;
  const html = await resp.text();
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc;
}

/**
 * Loads and decorates the footer.
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const doc = await loadFooterFragment();
  if (!doc) return;

  block.textContent = '';
  const footer = document.createElement('div');
  footer.className = 'footer-content';
  while (doc.body.firstElementChild) footer.append(doc.body.firstElementChild);

  // Resolve relative image paths (images/...) to a root-relative path so they
  // load regardless of the current page's URL depth. The dev server and DA/EDS
  // both serve uploaded assets at the site root (/images/...).
  footer.querySelectorAll('img[src]').forEach((img) => {
    const src = img.getAttribute('src');
    if (src && !/^(https?:)?\/\//.test(src) && !src.startsWith('/')) {
      img.setAttribute('src', `/${src.replace(/^\.?\/*/, '')}`);
    }
  });

  // Label sections so CSS can style them (brand, nav, social, legal)
  const sections = footer.children;
  const classNames = ['footer-brand', 'footer-nav', 'footer-social', 'footer-legal'];
  [...sections].forEach((section, i) => {
    if (classNames[i]) section.classList.add(classNames[i]);
  });

  block.append(footer);
}
