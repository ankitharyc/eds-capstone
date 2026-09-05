/*
 * breadcrumb — WKND trail. The content pipeline imports the trail as a leading
 * <ol> (parent links + current page as plain text); scripts.js wraps it in this
 * block. We normalise it to a labelled <nav> and flag the current page so the
 * CSS can render the WKND style (uppercase links, yellow arrow separators).
 */

export default function decorate(block) {
  const ol = block.querySelector('ol');
  if (!ol || !ol.querySelector('a')) {
    block.closest('.breadcrumb-wrapper')?.remove();
    block.remove();
    return;
  }

  // last item with no link is the current page
  const items = [...ol.children];
  const last = items[items.length - 1];
  if (last && !last.querySelector('a')) {
    last.setAttribute('aria-current', 'page');
  }

  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Breadcrumb');
  nav.append(ol);

  block.textContent = '';
  block.append(nav);
}
