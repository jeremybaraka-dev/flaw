import { cart, lineImage } from '../store/cart.js';
import { srcOf } from '../img.js';
import { byHandle } from '../data/products.js';
import { kes } from '../data/pricing.js';
import { lockScroll } from '../fx/scroll.js';
import { esc } from '../fx/text.js';

const root = document.getElementById('drawer-root');
let el;
let toastEl;
let toastTimer;

const lines = () =>
  cart.items.length
    ? cart.items
        .map((it, i) => {
          const p = byHandle[it.handle];
          return `
        <div class="line">
          <a class="line__img" href="/product/${p.handle}"><img src="${srcOf(lineImage(it), 360)}" alt="" loading="lazy" decoding="async" /></a>
          <div>
            <a class="line__title c" href="/product/${p.handle}">${esc(p.title)}</a>
            <div class="line__meta mono">${esc(it.variant)} / ${esc(it.size)}</div>
            <div class="qty"><button data-dec="${i}" aria-label="Decrease quantity">−</button><span>${it.qty}</span><button data-inc="${i}" aria-label="Increase quantity">+</button></div>
          </div>
          <div>
            <div class="line__price">${kes(p.price * it.qty)}</div>
            <button class="line__rm mono link" data-rm="${i}">Remove</button>
          </div>
        </div>`;
        })
        .join('')
    : `<div class="drawer__empty"><p class="d">Nothing<br />on you.</p><span class="mono">Your evidence bag is empty.</span></div>`;

function paint() {
  el.querySelector('[data-lines]').innerHTML = lines();
  el.querySelector('[data-sub]').textContent = kes(cart.subtotal());
  el.querySelector('[data-count]').textContent = `${cart.count()} ${cart.count() === 1 ? 'item' : 'items'}`;
  el.querySelector('[data-checkout]').toggleAttribute('disabled', !cart.items.length);
  el.querySelector('[data-checkout]').classList.toggle('is-off', !cart.items.length);
}

export function initDrawer() {
  root.innerHTML = `
    <div class="drawer" aria-hidden="true">
      <div class="drawer__veil" data-close></div>
      <aside class="drawer__panel" role="dialog" aria-label="Evidence bag">
        <div class="drawer__head">
          <div><div class="mono" data-count></div><h2 class="d">Evidence bag</h2></div>
          <button class="mono link" data-close>Close ✕</button>
        </div>
        <div class="drawer__body" data-lines data-lenis-prevent></div>
        <div class="drawer__foot">
          <div class="drawer__sum"><span class="mono">Subtotal</span><b data-sub></b></div>
          <div class="drawer__note mono">Delivery worked out at checkout. M-Pesa, card and PayPal accepted.</div>
          <a class="btn btn--ink btn--wide" href="/checkout" data-checkout>Proceed to checkout <span>→</span></a>
        </div>
      </aside>
    </div>
    <div class="toast mono" role="status"><i></i><span></span></div>`;
  el = root.querySelector('.drawer');
  toastEl = root.querySelector('.toast');

  el.addEventListener('click', (e) => {
    const t = e.target.closest('button, a, [data-close]');
    if (!t) return;
    if (t.hasAttribute('data-close') || t.tagName === 'A') closeDrawer();
    if (t.dataset.inc) cart.setQty(+t.dataset.inc, cart.items[+t.dataset.inc].qty + 1);
    if (t.dataset.dec) cart.setQty(+t.dataset.dec, cart.items[+t.dataset.dec].qty - 1);
    if (t.dataset.rm) cart.remove(+t.dataset.rm);
  });
  addEventListener('keydown', (e) => e.key === 'Escape' && closeDrawer());
  cart.subscribe(paint);
  paint();
}

export function openDrawer() {
  el.classList.add('is-open');
  el.setAttribute('aria-hidden', 'false');
  lockScroll(true);
}
export function closeDrawer() {
  if (!el.classList.contains('is-open')) return;
  el.classList.remove('is-open');
  el.setAttribute('aria-hidden', 'true');
  lockScroll(false);
}

export function toast(text) {
  toastEl.querySelector('span').textContent = text;
  toastEl.classList.add('is-on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('is-on'), 2600);
}
