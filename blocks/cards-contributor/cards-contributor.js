import { createOptimizedPicture } from '../../scripts/aem.js';

/* Inline social glyphs (fill: currentColor so the CSS bar colour drives them).
   Matched by the link label/href so authored copy stays the source of truth. */
const SOCIAL_ICONS = {
  facebook: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5H16.7V3.6c-.3 0-1.3-.12-2.46-.12-2.43 0-4.1 1.49-4.1 4.2v2.34H7.4V13h2.74v8h3.36z"/></svg>',
  twitter: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M22 5.9c-.7.32-1.5.53-2.3.63.83-.5 1.46-1.28 1.76-2.22-.78.46-1.64.8-2.55.98A4.02 4.02 0 0 0 12 8.7c0 .32.03.63.1.92-3.34-.17-6.3-1.77-8.28-4.2a4.02 4.02 0 0 0 1.24 5.37c-.65-.02-1.27-.2-1.8-.5v.05c0 1.95 1.38 3.58 3.22 3.95-.34.09-.7.14-1.06.14-.26 0-.51-.03-.76-.07.51 1.6 2 2.76 3.76 2.8A8.07 8.07 0 0 1 2 18.4a11.38 11.38 0 0 0 6.16 1.8c7.4 0 11.44-6.13 11.44-11.44l-.01-.52A8.18 8.18 0 0 0 22 5.9z"/></svg>',
  instagram: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><g fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/></g><circle cx="17.5" cy="6.5" r="1.3" fill="currentColor"/></svg>',
};

function socialKey(a) {
  const hint = `${a.getAttribute('href') || ''} ${a.textContent || ''}`.toLowerCase();
  if (hint.includes('facebook')) return 'facebook';
  if (hint.includes('twitter')) return 'twitter';
  if (hint.includes('insta')) return 'instagram';
  return null;
}

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
          const key = socialKey(a);
          if (key) {
            a.setAttribute('aria-label', a.textContent.trim());
            a.innerHTML = SOCIAL_ICONS[key];
          }
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
