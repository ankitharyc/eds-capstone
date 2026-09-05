/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-hero. Base: carousel.
 * Source: https://wknd.site/us/en.html (.carousel.cmp-carousel--hero)
 * Generated: 2026-09-05
 *
 * Library convention: 2 columns, multiple rows. First row = block name.
 * Each subsequent row = one slide: cell1 = slide image (only),
 * cell2 = text content (title heading, description, CTA link).
 */
export default function parse(element, { document }) {
  // Each carousel item is a slide.
  const slides = Array.from(element.querySelectorAll('.cmp-carousel__item'));

  const cells = [];

  slides.forEach((slide) => {
    // Image (mandatory) — first cell.
    const image = slide.querySelector('.cmp-teaser__image img, .cmp-image__image, img');

    // Text content — second cell.
    const contentCell = [];
    const title = slide.querySelector('.cmp-teaser__title, h1, h2, h3, [class*="title"]');
    const description = slide.querySelector('.cmp-teaser__description, p, [class*="description"]');
    const ctaLinks = Array.from(slide.querySelectorAll('.cmp-teaser__action-link, .cmp-teaser__action-container a, a'));

    if (title) contentCell.push(title);
    if (description) contentCell.push(description);
    contentCell.push(...ctaLinks);

    // Only add the slide row if it has an image or some content.
    if (image || contentCell.length) {
      cells.push([image || '', contentCell.length ? contentCell : '']);
    }
  });

  // Empty-block guard: no slides found, unwrap.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-hero', cells });
  element.replaceWith(block);
}
