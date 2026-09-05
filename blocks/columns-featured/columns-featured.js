export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-featured-${cols.length}-cols`);

  // setup image / content columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic && pic.closest('div').children.length === 1) {
        // picture is only content in column
        col.classList.add('columns-featured-img-col');
      } else {
        // text/content column (eyebrow, heading, description, CTA)
        col.classList.add('columns-featured-content');
      }
    });
  });
}
