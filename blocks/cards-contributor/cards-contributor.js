import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-contributor-card-image';
      else div.className = 'cards-contributor-card-body';
    });

    /* group the social links (Facebook / Twitter / Instagram) into a single dark bar */
    const body = li.querySelector('.cards-contributor-card-body');
    if (body) {
      const links = [...body.querySelectorAll('a')];
      if (links.length) {
        const social = document.createElement('div');
        social.className = 'cards-contributor-social';
        links.forEach((a) => {
          a.classList.remove('button');
          const wrapper = a.closest('p');
          social.append(a);
          if (wrapper && !wrapper.textContent.trim() && !wrapper.querySelector('img, picture')) wrapper.remove();
        });
        body.append(social);
      }
    }

    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';
  block.append(ul);
}
