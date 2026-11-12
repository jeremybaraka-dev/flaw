import { kes } from '../data/pricing.js';
import { esc } from '../fx/text.js';

/** Exhibit card used on the home page and in the shop. */
export function card(p, { eager = false } = {}) {
  const n = p.variants.length;
  return `
    <a class="exh brk" href="/product/${p.handle}" data-cursor="VIEW" data-cat="${p.category}">
      <div class="exh__top mono"><span>Exh. ${p.exhibit}</span><span>${n > 1 ? `${n} colourways` : p.category}</span></div>
      <div class="exh__img">
        <img class="exh__a" src="${p.image}" alt="${esc(p.title)}" loading="${eager ? 'eager' : 'lazy'}" draggable="false" />
        <img class="exh__b" src="${p.alt}" alt="" loading="lazy" draggable="false" />
      </div>
      <div class="exh__bot">
        <h3 class="c">${esc(p.title)}</h3>
        <span class="mono">${kes(p.price)}</span>
      </div>
    </a>`;
}
