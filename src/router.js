// Tiny client-side router with the shutter transition between pages.
import { gsap, ScrollTrigger, lenis, reveals } from './fx/scroll.js';
import { cover, reveal } from './fx/shutter.js';
import { bindScramble } from './fx/text.js';
import { markLoaded, warmProduct } from './img.js';
import { byHandle } from './data/products.js';
import { MAIN_SIZES } from './pages/product.js';
import { setActiveNav, syncFooterReveal } from './components/chrome.js';
import { closeDrawer } from './components/drawer.js';

import home from './pages/home.js';
import shop from './pages/shop.js';
import product from './pages/product.js';
import checkout from './pages/checkout.js';
import about from './pages/about.js';
import support from './pages/support.js';
import missing from './pages/missing.js';

const routes = [
  [/^\/$/, home],
  [/^\/shop\/?$/, shop],
  [/^\/product\/([\w-]+)\/?$/, product],
  [/^\/checkout\/?$/, checkout],
  [/^\/about\/?$/, about],
  [/^\/support\/?$/, support],
];

const app = document.getElementById('app');
let ctx;
let cleanup;
let current;
let busy = false;

function match(pathname) {
  for (const [re, page] of routes) {
    const m = pathname.match(re);
    if (m) return { page, params: m.slice(1) };
  }
  return { page: missing, params: [] };
}

function swap(url) {
  cleanup?.();
  ctx?.revert();
  ScrollTrigger.getAll().forEach((t) => t.kill());

  const { page, params } = match(url.pathname);
  current = page;
  app.innerHTML = page.render(params, url);
  document.title = `${page.title(params)} | FLAW ENFORCEMENT™`;
  setActiveNav(url.pathname);
  document.getElementById('footer').hidden = !!page.bare;
  lenis.scrollTo(0, { immediate: true, force: true });
  window.scrollTo(0, 0);

  ctx = gsap.context(() => {
    cleanup = page.mount?.(app, params, url);
    reveals(app);
  }, app);
  bindScramble();
  markLoaded(app);
  ScrollTrigger.refresh();
  syncFooterReveal();
  if (url.hash) requestAnimationFrame(() => scrollToHash(url.hash, true));
}

function scrollToHash(hash, immediate = false) {
  const target = document.querySelector(hash);
  if (!target) return;
  // Work out the position from the real scroll offset, so calling this twice lands in the same place.
  lenis.resize();
  const y = Math.max(0, target.getBoundingClientRect().top + window.scrollY - 40);
  lenis.scrollTo(y, { immediate, force: true });
}

export async function go(href, { push = true } = {}) {
  const url = new URL(href, location.origin);
  const samePage = url.pathname === location.pathname && url.search === location.search;
  if (push && samePage) {
    if (url.hash) scrollToHash(url.hash);
    else lenis.scrollTo(0);
    return;
  }
  if (busy) return;
  busy = true;
  closeDrawer();
  await cover(`Opening file ${url.pathname === '/' ? '/home' : url.pathname}`);
  if (push) history.pushState({}, '', url.pathname + url.search + url.hash);
  swap(url);
  const done = reveal();
  current.enter?.(app);
  await done;
  busy = false;
}

export function startRouter() {
  history.scrollRestoration = 'manual';
  // hovering or touching a product link starts its pictures downloading, so the page opens with them ready
  const warm = (e) => {
    const a = e.target.closest?.('a[href^="/product/"]');
    if (!a) return;
    const handle = a.getAttribute('href').split('/')[2];
    // remember the exact picture this link is already showing: the product page uses it as its instant stand-in
    const shown = a.querySelector('img')?.currentSrc;
    if (shown) (window.__feShown ||= {})[handle] = shown;
    warmProduct(byHandle[handle], MAIN_SIZES);
  };
  document.addEventListener('pointerover', warm, { passive: true });
  document.addEventListener('touchstart', warm, { passive: true });
  document.addEventListener('focusin', warm);
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest('a[href]');
    if (!a || a.target || a.hasAttribute('download') || a.hasAttribute('data-native')) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return;
    e.preventDefault();
    go(url.href);
  });
  addEventListener('popstate', () => go(location.href, { push: false }));
  swap(new URL(location.href));
  // called when the loader lifts: play the page intro, then honour a #hash in the address
  return () => {
    current.enter?.(app);
    if (location.hash) setTimeout(() => scrollToHash(location.hash, true), 60);
  };
}
