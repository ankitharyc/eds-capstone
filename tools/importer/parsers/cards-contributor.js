/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-contributor. Base: cards.
 * Source: https://wknd.site/us/en/about-us.html
 * Generated: 2026-09-05
 *
 * The import maps this parser to EACH individual contributor <section>
 * (.experiencefragment.cmp-experience-fragment--contributor). So `element`
 * is ONE contributor profile. Base cards convention: 2 columns per row —
 * cell 1 = image, cell 2 = text content (title heading, role, CTA links).
 * This parser produces a cards block with a single card row for the person.
 */
export default function parse(element, { document }) {
  // Cell 1: portrait image
  const image = element.querySelector('.cmp-image__image, .image img, img');

  // Cell 2 content: name (h3), role/title (h5), and social links
  // Name — first title heading in the profile
  const name = element.querySelector('.title .cmp-title__text, h3, h2');

  // Role/title — the secondary title heading (e.g. "Skater, Writer").
  // Collect all title headings and treat any after the name as role text.
  const titleHeadings = Array.from(
    element.querySelectorAll('.title .cmp-title__text'),
  );
  const role = titleHeadings.find((h) => h !== name)
    || element.querySelector('h5, h6');

  // Social links — the button list anchors within the profile
  const socialLinks = Array.from(
    element.querySelectorAll('.cmp-buildingblock--btn-list a.cmp-button, .buildingblock a'),
  );

  // Empty-block guard: nothing meaningful to render
  if (!image && !name && !role && socialLinks.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Build the text cell (cell 2): name heading, role, then social links
  const textCell = [];
  if (name) textCell.push(name);
  if (role) textCell.push(role);
  socialLinks.forEach((a) => textCell.push(a));

  const cells = [];
  // Single card row: [image cell, text cell] (2-column cards convention)
  cells.push([image || '', textCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-contributor', cells });
  element.replaceWith(block);
}
