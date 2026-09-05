/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-metadata. Base: columns.
 * Source: https://wknd.site/us/en/adventures/bali-surf-camp.html (.contentfragment.cmp-contentfragment--elements)
 * Generated: 2026-09-05
 *
 * Library convention: columns table has multiple columns/rows; first row = block name.
 * Rows after the first define the grid; every row must have the same number of columns.
 * This variant: a text-only attribute panel. Each source element (a <dt> label + <dd> value pair)
 * becomes one 2-column row: cell1 = label, cell2 = value. No images.
 */
export default function parse(element, { document }) {
  // Each attribute is a .cmp-contentfragment__element containing a <dt> (label) and <dd> (value).
  const attributes = Array.from(element.querySelectorAll('.cmp-contentfragment__element'));

  const cells = [];
  attributes.forEach((attr) => {
    const label = attr.querySelector('.cmp-contentfragment__element-title, dt');
    const value = attr.querySelector('.cmp-contentfragment__element-value, dd');

    const labelText = label ? label.textContent.trim() : '';
    const valueText = value ? value.textContent.trim() : '';

    // Only emit rows that carry a label or a value.
    if (labelText || valueText) {
      cells.push([labelText, valueText]);
    }
  });

  // Empty-block guard: no attribute pairs found.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-metadata', cells });
  element.replaceWith(block);
}
