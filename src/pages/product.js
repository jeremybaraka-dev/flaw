import { gsap, reduced, touch } from '../fx/scroll.js';
import { esc } from '../fx/text.js';
import { products, byHandle } from '../data/products.js';
import { kes } from '../data/pricing.js';
import { cart } from '../store/cart.js';
import { card } from '../components/card.js';
import { openDrawer, toast } from '../components/drawer.js';
import { config, waLink } from '../config.js';
import missing from './missing.js';
import { pic, setPic, srcOf } from '../img.js';

const usd = (n) => `$${(n / config.paypal.kesPerUsd).toFixed(0)}`;

/** Clone the product image and throw it into the bag icon in the header. */
function flyToBag(img) {
  const bag = document.querySelector('[data-bag-count]');
  if (!bag || reduced) return Promise.resolve();
  const a = img.getBoundingClientRect();
  const b = bag.getBoundingClientRect();
  const ghost = img.cloneNode();
  Object.assign(ghost.style, { position: 'fixed', left: `${a.left}px`, top: `${a.top}px`, width: `${a.width}px`, height: `${a.height}px`, objectFit: 'contain', zIndex: 640, pointerEvents: 'none', margin: 0, opacity: 1, transform: 'none', inset: 'auto' });
  ghost.style.left = `${a.left}px`;
  ghost.style.top = `${a.top}px`;
  document.body.appendChild(ghost);
  document.getElementById('header').classList.remove('is-hidden');
  const dx = b.left + b.width / 2 - (a.left + a.width / 2);
  const dy = b.top + b.height / 2 - (a.top + a.height / 2);
  return gsap
    .timeline({ onComplete: () => ghost.remove() })
    .to(ghost, { x: dx, duration: 0.85, ease: 'power2.in' }, 0)
    .to(ghost, { y: dy, duration: 0.85, ease: 'back.in(1.6)' }, 0)
    .to(ghost, { scale: 0.06, rotation: 24, duration: 0.85, ease: 'power3.in' }, 0)
    .fromTo(bag, { scale: 1.9 }, { scale: 1, duration: 0.5, ease: 'elastic.out(1,0.4)' })
    .then();
}

export default {
  title: ([handle]) => byHandle[handle]?.title || 'File not found',

  render(params, url) {
    const p = byHandle[params[0]];
    if (!p) return missing.render();
    const v0 = p.variants[0];
    const others = products.filter((x) => x.handle !== p.handle && x.category === p.category).concat(products.filter((x) => x.category !== p.category && x.handle !== p.handle)).slice(0, 4);

    return `
    <div class="page pdp t-paper">
      <div class="pdp__grid">
        <div class="pdp__gallery">
          <div class="pdp__stage brk" data-stage>
            <div class="pdp__wall" aria-hidden="true"></div>
            <span class="pdp__tag mono">Exh. ${p.exhibit}</span>
            <span class="pdp__tag pdp__tag--r mono" data-view>View 01</span>
            ${pic(v0.images[0], { sizes: '(max-width: 900px) 92vw, 50vw', alt: esc(p.title), lazy: false, high: true, attrs: 'data-main' })}
          </div>
          <div class="pdp__thumbs" data-thumbs></div>
        </div>

        <div class="pdp__info">
          <a class="mono link pdp__back" href="/shop">← Evidence locker</a>
          <div class="mono pdp__kick">Exhibit ${p.exhibit} · ${p.category} · Case 001</div>
          <h1 class="d">${esc(p.title)}</h1>
          <div class="pdp__price"><b>${kes(p.price)}</b><span class="mono">approx. ${usd(p.price)} USD</span></div>
          <p class="pdp__hook c">${esc(p.hook)}</p>
          <p class="pdp__body">${esc(p.body)}</p>

          <fieldset class="pdp__opt" ${p.variants.length < 2 ? 'hidden' : ''}>
            <legend class="mono">Colourway: <b data-vname>${esc(v0.name)}</b></legend>
            <div class="pdp__sw" data-variants>
              ${p.variants.map((v, i) => `<button type="button" class="${i ? '' : 'is-on'}" data-v="${i}" aria-label="${esc(v.name)}" title="${esc(v.name)}"><img src="${srcOf(v.images[0], 360)}" alt="" decoding="async" /></button>`).join('')}
            </div>
          </fieldset>

          <fieldset class="pdp__opt" data-sizebox>
            <legend class="mono">Size: <b data-sname>select</b></legend>
            <div class="pdp__sizes" data-sizes>
              ${p.sizes.map((s) => `<button type="button" data-s="${s}">${s}</button>`).join('')}
            </div>
          </fieldset>

          <div class="pdp__buy">
            <div class="qty" data-qty><button type="button" data-d="-1" aria-label="Decrease quantity">−</button><span>1</span><button type="button" data-d="1" aria-label="Increase quantity">+</button></div>
            <button class="btn btn--red" data-add>Add to evidence bag <span>+</span></button>
          </div>
          <a class="btn btn--ghost btn--wide" data-wa target="_blank" rel="noopener" href="#">Order on WhatsApp ↗</a>

          <ul class="pdp__assure mono">
            <li><b class="paymark paymark--mpesa">M-PESA</b><b class="paymark">CARD</b><b class="paymark">PAYPAL</b></li>
            <li>Delivery across Kenya · No restocks</li>
          </ul>

          <div class="acc">
            <details open>
              <summary class="c">The details</summary>
              <dl class="pdp__specs">${Object.entries(p.specs).map(([k, val]) => `<div><dt class="mono">${k}</dt><dd>${esc(val)}</dd></div>`).join('')}</dl>
            </details>
            <details>
              <summary class="c">Shipping</summary>
              <p>Anywhere in Kenya: 3 to 7 business days (Nairobi usually 1 to 2). International: 7 to 21 business days depending on where you are. You get a tracking update once it ships.</p>
            </details>
            <details>
              <summary class="c">Size guide</summary>
              <p>Most pieces are cut relaxed. Take your usual size for the intended fit, or size down for a closer one. Need exact measurements for this piece? Message us on WhatsApp and we will send them.</p>
            </details>
          </div>
          <img class="pdp__rated" src="/brand/rated-fe.webp" alt="Product rated FE" width="543" height="764" loading="lazy" />
        </div>
      </div>

      <section class="pdp__more">
        <header><h2 class="d">Known associates</h2><a class="mono link" href="/shop">View all exhibits →</a></header>
        <div class="pdp__morgrid">${others.map((o) => card(o)).join('')}</div>
      </section>
    </div>`;
  },

  mount(root, params) {
    const p = byHandle[params[0]];
    if (!p) return;
    const state = { v: 0, img: 0, size: null, qty: 1 };
    const main = root.querySelector('[data-main]');
    const thumbs = root.querySelector('[data-thumbs]');
    const stage = root.querySelector('[data-stage]');
    const wa = root.querySelector('[data-wa]');

    const setImage = (i, animate = true) => {
      state.img = i;
      const src = p.variants[state.v].images[i];
      root.querySelector('[data-view]').textContent = `View 0${i + 1}`;
      thumbs.querySelectorAll('button').forEach((b, n) => b.classList.toggle('is-on', n === i));
      if (!animate || reduced) { setPic(main, src); return; }
      gsap.timeline()
        .to(main, { opacity: 0, scale: 0.94, rotation: -3, duration: 0.2, ease: 'power2.in' })
        .add(() => { setPic(main, src); })
        .to(main, { opacity: 1, scale: 1, rotation: 0, duration: 0.55, ease: 'power3.out' });
    };
    const paintThumbs = () => {
      const imgs = p.variants[state.v].images;
      thumbs.innerHTML = imgs.map((s, i) => `<button type="button" data-i="${i}" class="${i ? '' : 'is-on'}" aria-label="View ${i + 1}"><img src="${srcOf(s, 360)}" alt="" decoding="async" /></button>`).join('');
      thumbs.hidden = imgs.length < 2;
    };
    const paintWa = () => {
      const v = p.variants[state.v].name;
      wa.href = waLink(`Hi, I would like to order from FLAW ENFORCEMENT:\n${p.title} (${v}${state.size ? `, size ${state.size}` : ''}) x${state.qty}\n${kes(p.price * state.qty)}`);
    };
    paintThumbs();
    paintWa();

    thumbs.addEventListener('click', (e) => { const b = e.target.closest('[data-i]'); if (b) setImage(+b.dataset.i); });
    stage.addEventListener('click', () => { const n = p.variants[state.v].images.length; if (n > 1) setImage((state.img + 1) % n); });

    root.querySelector('[data-variants]').addEventListener('click', (e) => {
      const b = e.target.closest('[data-v]');
      if (!b) return;
      state.v = +b.dataset.v;
      root.querySelectorAll('[data-v]').forEach((x) => x.classList.toggle('is-on', x === b));
      root.querySelector('[data-vname]').textContent = p.variants[state.v].name;
      paintThumbs();
      setImage(0);
      paintWa();
    });
    root.querySelector('[data-sizes]').addEventListener('click', (e) => {
      const b = e.target.closest('[data-s]');
      if (!b) return;
      state.size = b.dataset.s;
      root.querySelectorAll('[data-s]').forEach((x) => x.classList.toggle('is-on', x === b));
      root.querySelector('[data-sname]').textContent = state.size;
      paintWa();
    });
    root.querySelector('[data-qty]').addEventListener('click', (e) => {
      const b = e.target.closest('[data-d]');
      if (!b) return;
      state.qty = Math.max(1, Math.min(10, state.qty + +b.dataset.d));
      root.querySelector('[data-qty] span').textContent = state.qty;
      paintWa();
    });

    const add = root.querySelector('[data-add]');
    add.addEventListener('click', async () => {
      if (!state.size) {
        toast('Pick a size first');
        const box = root.querySelector('[data-sizebox]');
        if (!reduced) gsap.fromTo(box, { x: -8 }, { x: 0, duration: 0.5, ease: 'elastic.out(1.2,0.25)' });
        box.classList.add('is-missing');
        return;
      }
      add.disabled = true;
      cart.add({ handle: p.handle, variant: p.variants[state.v].name, size: state.size, qty: state.qty });
      await Promise.race([flyToBag(main), new Promise((r) => setTimeout(r, 1800))]);
      add.disabled = false;
      openDrawer();
    });

    // the garment leans toward the cursor
    if (!touch && !reduced) {
      const rx = gsap.quickTo(main, 'rotationY', { duration: 0.8, ease: 'power3.out' });
      const ry = gsap.quickTo(main, 'rotationX', { duration: 0.8, ease: 'power3.out' });
      gsap.set(main, { transformPerspective: 900 });
      stage.addEventListener('pointermove', (e) => {
        const r = stage.getBoundingClientRect();
        rx(((e.clientX - r.left) / r.width - 0.5) * 16);
        ry(((e.clientY - r.top) / r.height - 0.5) * -12);
      });
      stage.addEventListener('pointerleave', () => { rx(0); ry(0); });
      gsap.from(main, { y: 60, opacity: 0, rotation: 6, duration: 1.1, ease: 'power4.out', delay: 0.35 });
      gsap.from(root.querySelectorAll('.pdp__info > *'), { opacity: 0, y: 24, duration: 0.8, ease: 'power3.out', stagger: 0.045, delay: 0.3 });
    }
  },
};
