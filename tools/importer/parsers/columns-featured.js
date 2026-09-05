/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-featured. Base: columns.
 * Source: https://wknd.site/us/en.html (.teaser.cmp-teaser--featured)
 * Generated: 2026-09-05
 *
 * Library convention: multiple columns/rows, first row = block name.
 * This variant: one content row, two columns —
 * cell1 = image, cell2 = eyebrow ("Featured Article") + heading + description + CTA.
 */
export default function parse(element, { document }) {
  // Column 1: image.
  const image = element.querySelector('.cmp-teaser__image img, .cmp-image__image, img');

  // Column 2: text content.
  const textCell = [];
  const eyebrow = element.querySelector('.cmp-teaser__pretitle, [class*="pretitle"], [class*="eyebrow"]');
  const heading = element.querySelector('.cmp-teaser__title, h1, h2, h3, h4');
  const description = element.querySelector('.cmp-teaser__description, [class*="description"]');
  const ctaLinks = Array.from(element.querySelectorAll('.cmp-teaser__action-link, .cmp-teaser__action-container a'));

  if (eyebrow) textCell.push(eyebrow);
  if (heading) textCell.push(heading);
  if (description) textCell.push(description);
  textCell.push(...ctaLinks);

  // Empty-block guard.
  if (!image && !textCell.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [
    [image || '', textCell.length ? textCell : ''],
  ];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-featured', cells });
  element.replaceWith(block);
}
