/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-teaser. Base: cards.
 * Source: https://wknd.site/us/en.html (.image-list.list)
 * Generated: 2026-09-05
 *
 * Library convention: 2 columns, multiple rows. First row = block name.
 * Each subsequent row = one card: cell1 = image (mandatory),
 * cell2 = text content (title as linked heading + description).
 */
export default function parse(element, { document }) {
  // Each list item is a card.
  const items = Array.from(element.querySelectorAll('.cmp-image-list__item, li'));

  const cells = [];

  items.forEach((item) => {
    // Column 1: image.
    const image = item.querySelector('.cmp-image-list__item-image img, .cmp-image__image, img');

    // Column 2: text content — linked title + description.
    const textCell = [];
    const titleLink = item.querySelector('.cmp-image-list__item-title-link');
    const titleText = item.querySelector('.cmp-image-list__item-title, [class*="title"]');
    const description = item.querySelector('.cmp-image-list__item-description, [class*="description"], p');

    // Prefer the anchor (preserves the link) that points to the article.
    if (titleLink) {
      textCell.push(titleLink);
    } else if (titleText) {
      textCell.push(titleText);
    }
    if (description) textCell.push(description);

    if (image || textCell.length) {
      cells.push([image || '', textCell.length ? textCell : '']);
    }
  });

  // Empty-block guard.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-teaser', cells });
  element.replaceWith(block);
}
