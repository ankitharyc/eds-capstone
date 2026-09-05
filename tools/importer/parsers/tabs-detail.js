/* eslint-disable */
/* global WebImporter */
/**
 * Parser for tabs-detail. Base: tabs (Block Collection).
 * Source: https://wknd.site/us/en/adventures/bali-surf-camp.html (.tabs.panelcontainer)
 * Generated: 2026-09-05
 *
 * Library convention: tabs table has 2 columns and multiple rows; first row = block name.
 * Each subsequent row is one tab — tab label (mandatory) in cell1, tab content (mandatory) in cell2.
 * This variant: tab labels come from the .cmp-tabs__tablist <li> items; panel content comes from the
 * matching .cmp-tabs__tabpanel (rich content: headings, paragraphs, images, lists, links). Labels and
 * panels are paired by index. Empty AEM grid scaffolding divs inside panels are stripped.
 */
export default function parse(element, { document }) {
  // Tab labels, in order.
  const tabLabels = Array.from(element.querySelectorAll('.cmp-tabs__tablist .cmp-tabs__tab, .cmp-tabs__tablist li'));
  // Tab panels, in order (pairs with labels by index).
  const tabPanels = Array.from(element.querySelectorAll('.cmp-tabs__tabpanel'));

  const cells = [];
  tabLabels.forEach((labelEl, i) => {
    const panel = tabPanels[i];
    if (!panel) return;

    const label = labelEl.textContent.trim();

    // Pull the meaningful rich content from the panel. Prefer paragraphs, headings, images,
    // lists and links; skip the empty AEM grid scaffolding divs (aem-Grid) that carry no content.
    const contentCell = [];
    const contentNodes = panel.querySelectorAll('p, h1, h2, h3, h4, h5, h6, ul, ol, img, a');
    contentNodes.forEach((node) => {
      // Avoid double-adding: skip images/links that live inside a paragraph or list already captured.
      if (node.closest('p, li') && (node.tagName === 'IMG' || node.tagName === 'A')) return;
      // Skip empty text nodes.
      if (node.tagName === 'IMG' || node.querySelector('img') || node.textContent.trim()) {
        contentCell.push(node);
      }
    });

    // Skip the panel's own contentfragment title (h3 "Bali Surf Camp") which is boilerplate,
    // not tab content — remove it if it appears as the first heading.
    const titleHeading = panel.querySelector('.cmp-contentfragment__title');
    const filtered = contentCell.filter((n) => n !== titleHeading);

    if (label || filtered.length) {
      cells.push([label, filtered.length ? filtered : '']);
    }
  });

  // Empty-block guard: no tabs found.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-detail', cells });
  element.replaceWith(block);
}
