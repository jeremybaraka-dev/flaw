import { kes } from '../data/pricing.js';
import { esc } from '../fx/text.js';
import { pic } from '../img.js';

const CARD_SIZES = '(max-width: 760px) 44vw, (max-width: 1100px) 30vw, 24vw';

/** Exhibit card used on the home page and in the shop. */
export function card(p, { eager = false } = {}) {
  const n = p.variants.length;
  return `
    <a class="exh brk" href="/product/${p.handle}" data-cursor="VIEW" data-cat="${p.category}">
      <div class="exh__top mono"><span>Exh. ${p.exhibit}</span><span>${n > 1 ? `${n} colourways` : p.category}</span></div>
      <div class="exh__img">
        <i class="exh__spot" aria-hidden="true"></i>
        <b class="exh__mark" aria-hidden="true">${Number(p.exhibit)}</b>
        ${pic(p.image, { sizes: CARD_SIZES, alt: esc(p.title), cls: 'exh__a', lazy: !eager })}
        ${pic(p.alt, { sizes: CARD_SIZES, cls: 'exh__b' })}
      </div>
      <div class="exh__bot">
        <h3 class="c">${esc(p.title)}</h3>
        <span class="mono">${kes(p.price)}</span>
      </div>
    </a>`;
}
