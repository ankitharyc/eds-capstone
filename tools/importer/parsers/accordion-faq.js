/* eslint-disable */
/* global WebImporter */
/**
 * Parser for accordion-faq. Base: accordion (Block Collection).
 * Source: https://wknd.site/us/en/faqs.html (.accordion.panelcontainer)
 * Generated: 2026-09-05
 *
 * Block library structure (Accordion): 2 columns, multiple rows.
 * Row 1 = block name. Each subsequent row = one accordion item:
 *   cell 1 = Title (clickable question/label), cell 2 = Content (answer/panel body).
 *
 * Source is Adobe Core Components accordion markup:
 *   .cmp-accordion__item        → one Q&A item (one row)
 *   .cmp-accordion__title       → the question text (title cell)
 *   .cmp-accordion__panel       → the answer/body content (content cell)
 */
export default function parse(element, { document }) {
  // Each accordion item becomes one 2-cell row.
  const items = element.querySelectorAll('.cmp-accordion__item');

  const cells = [];

  items.forEach((item) => {
    // Title cell: the question text from the accordion button title.
    const titleEl = item.querySelector('.cmp-accordion__title, .cmp-accordion__button, .cmp-accordion__header');
    const titleText = titleEl ? titleEl.textContent.trim() : '';

    // Content cell: the panel body. Prefer the inner text component(s) so we
    // drop the CC wrapper divs, but fall back to the whole panel if needed.
    const panel = item.querySelector('.cmp-accordion__panel');
    let contentNodes = [];
    if (panel) {
      const textParts = panel.querySelectorAll('.cmp-text');
      if (textParts.length) {
        contentNodes = Array.from(textParts).map((t) => {
          // Unwrap the .cmp-text wrapper: keep its child elements (p, h3, etc.).
          const kids = Array.from(t.children);
          return kids.length ? kids : [t];
        }).flat();
      } else {
        // Fallback: use the panel's own child nodes.
        contentNodes = Array.from(panel.childNodes);
      }
    }

    // Build the title cell as a heading element to preserve semantics.
    let titleCell = titleText;
    if (titleText) {
      const h = document.createElement('h3');
      h.textContent = titleText;
      titleCell = h;
    }

    // Skip fully empty items.
    if (!titleText && contentNodes.length === 0) return;

    cells.push([titleCell, contentNodes.length ? contentNodes : '']);
  });

  // Empty-block guard: no items found, leave content in place.
  if (cells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-faq', cells });
  element.replaceWith(block);
}
