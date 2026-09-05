export default function decorate(block) {
  // WKND adventure attribute panel: each row is a label/value pair.
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (cells[0]) cells[0].classList.add('columns-metadata-label');
    if (cells[1]) cells[1].classList.add('columns-metadata-value');
  });
}
