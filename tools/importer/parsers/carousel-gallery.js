/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-gallery. Base: carousel.
 * Source: https://wknd.site/us/en/adventures/bali-surf-camp.html (.carousel.cmp-carousel--mini)
 * Generated: 2026-09-05
 *
 * Library convention: carousel table has 2 columns and multiple rows; first row = block name.
 * Each subsequent row is one slide — image (mandatory) in the first cell, optional text in the second.
 * This variant: full-width, image-only gallery. Each slide row contains only the image (no title,
 * description, or CTA), so rows are single-cell and the table stays a consistent 1 column.
 */
export default function parse(element, { document }) {
  // Each carousel item is one slide.
  const items = Array.from(element.querySelectorAll('.cmp-carousel__item'));

  const cells = [];
  items.forEach((item) => {
    // Image lives inside a .cmp-image wrapper; grab the <img> directly.
    const image = item.querySelector('.cmp-image__image, .cmp-image img, img');
    if (image) cells.push([image]);
  });

  // Empty-block guard: no slides with images found.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-gallery', cells });
  element.replaceWith(block);
}
