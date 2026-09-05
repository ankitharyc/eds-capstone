/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-banner. Base: hero.
 * Source: https://wknd.site/us/en.html (.teaser.cmp-teaser--hero)
 * Generated: 2026-09-05
 *
 * Library convention: 1 column, 3 rows. Row 1 = block name.
 * Row 2 = background image (optional, single cell).
 * Row 3 = title (heading) + subheading/paragraph + CTA link (single cell).
 */
export default function parse(element, { document }) {
  // Row 2: background image.
  const bgImage = element.querySelector('.cmp-teaser__image img, .cmp-image__image, img');

  // Row 3: text content — all in one cell.
  const contentCell = [];
  const title = element.querySelector('.cmp-teaser__title, h1, h2, h3, [class*="title"]');
  const description = element.querySelector('.cmp-teaser__description, [class*="description"], p');
  const ctaLinks = Array.from(element.querySelectorAll('.cmp-teaser__action-link, .cmp-teaser__action-container a'));

  if (title) contentCell.push(title);
  if (description) contentCell.push(description);
  contentCell.push(...ctaLinks);

  // Empty-block guard.
  if (!bgImage && !contentCell.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  // Row 2: background image (single-cell row).
  if (bgImage) cells.push([bgImage]);
  // Row 3: content (single-cell row holding all text elements).
  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-banner', cells });
  element.replaceWith(block);
}
