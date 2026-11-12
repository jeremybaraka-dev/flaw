import { kes } from '../data/pricing.js';
import { esc } from '../fx/text.js';
import { pic } from '../img.js';

/** Six strips of tape around the garment's edge; the layout comes from the product handle, so each piece is taped differently. */
function tapes(seed) {
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const rnd = () => { h = (h * 1664525 + 1013904223) >>> 0; return h / 4294967296; };
  const base = [-150, -95, -35, 25, 140, 205]; // degrees round the garment: shoulders, collar, sides, hem
  return base.map((a) => {
    const ang = a + (rnd() - 0.5) * 26;
    const r = (ang * Math.PI) / 180;
    const x = 50 + Math.cos(r) * (33 + rnd() * 6);
    const y = 52 + Math.sin(r) * (36 + rnd() * 6);
    const rot = ang + 90 + (rnd() - 0.5) * 40;
    const len = 12 + rnd() * 6;
    return `<i class="exh__tape" style="left:${x.toFixed(1)}%;top:${y.toFixed(1)}%;width:${len.toFixed(1)}%;transform:translate(-50%,-50%) rotate(${rot.toFixed(0)}deg)"></i>`;
  }).join('');
}

const CARD_SIZES = '(max-width: 760px) 44vw, (max-width: 1100px) 30vw, 24vw';

/** Exhibit card used on the home page and in the shop. */
export function card(p, { eager = false } = {}) {
  const n = p.variants.length;
  return `
    <a class="exh brk" href="/product/${p.handle}" data-cursor="VIEW" data-cat="${p.category}">
      <div class="exh__top mono"><span>Exh. ${p.exhibit}</span><span>${n > 1 ? `${n} colourways` : p.category}</span></div>
      <div class="exh__img">
        <span class="exh__tapes" aria-hidden="true">${tapes(p.handle)}</span>
        ${pic(p.image, { sizes: CARD_SIZES, alt: esc(p.title), cls: 'exh__a', lazy: !eager })}
        ${pic(p.alt, { sizes: CARD_SIZES, cls: 'exh__b' })}
      </div>
      <div class="exh__bot">
        <h3 class="c">${esc(p.title)}</h3>
        <span class="mono">${kes(p.price)}</span>
      </div>
    </a>`;
}
