/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-teaser. Base: hero.
 * Source: WKND adventure-listing "Experience the world with us" hero teaser.
 * Structure (from library-description.txt): 1 column, 3 rows.
 *   Row 1: block name (handled by createBlock)
 *   Row 2: background image (optional)
 *   Row 3: title (heading) + description (subheading). NO CTA in this light page-intro variant.
 * Generated: 2026-09-05
 */
export default function parse(element, { document }) {
  // Background image — cmp-teaser__image holds the hero photo.
  const bgImage = element.querySelector(
    '.cmp-teaser__image img, .cmp-image__image, img[class*="image"], img',
  );

  // Heading — teaser title, rendered as a heading.
  const heading = element.querySelector(
    '.cmp-teaser__title, h1, h2, [class*="title"]',
  );

  // Description — teaser description paragraph(s).
  const descriptionEl = element.querySelector(
    '.cmp-teaser__description, [class*="description"]',
  );
  // Prefer the inner paragraph so we don't carry the wrapper's classes/markup.
  const description = descriptionEl
    ? (descriptionEl.querySelector('p') || descriptionEl)
    : element.querySelector('p');

  // Empty-block guard: bail gracefully if there is no real content.
  if (!heading && !description && !bgImage) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row 2: background image (only if present).
  if (bgImage) {
    cells.push([bgImage]);
  }

  // Row 3: single cell holding heading + description (1-column block).
  const contentCell = [];
  if (heading) contentCell.push(heading);
  if (description) contentCell.push(description);
  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-teaser', cells });
  element.replaceWith(block);
}
