// Responsive images. Every picture exists in a few widths as AVIF and WebP (see scripts/optimize-images.mjs);
// the browser downloads only the one that fits the screen.
import manifest from './data/images.json';

const widths = (base) => manifest[base]?.w || [];
const set = (base, fmt) => widths(base).map((w) => `${base}-${w}.${fmt} ${w}w`).join(', ');

/** A single WebP URL close to the requested width (for canvases, thumbnails and preloads). */
export function srcOf(base, want = 640) {
  const ws = widths(base);
  if (!ws.length) return `${base}.webp`;
  return `${base}-${ws.find((w) => w >= want) || ws[ws.length - 1]}.webp`;
}

/** Width / height of the source image. */
export const ratioOf = (base) => manifest[base]?.ar || 1;

/**
 * <picture> markup with AVIF + WebP srcsets.
 * opts: sizes, alt, cls, lazy (default true), high (fetchpriority), attrs (extra attributes), fade (default true)
 */
export function pic(base, { sizes = '100vw', alt = '', cls = '', lazy = true, high = false, attrs = '', fade = true } = {}) {
  const ar = ratioOf(base);
  const w = 1000;
  const h = Math.round(w / ar);
  return `<picture><source type="image/avif" srcset="${set(base, 'avif')}" sizes="${sizes}" /><img${cls ? ` class="${cls}"` : ''} src="${srcOf(base)}" srcset="${set(base, 'webp')}" sizes="${sizes}" alt="${alt}" width="${w}" height="${h}" loading="${lazy ? 'lazy' : 'eager'}" decoding="async"${high ? ' fetchpriority="high"' : ''}${fade ? ' data-fade' : ''} draggable="false"${attrs ? ` ${attrs}` : ''} /></picture>`;
}

/** Point an existing <picture> (or plain <img>) at a different image. */
export function setPic(img, base) {
  const source = img.parentElement?.tagName === 'PICTURE' ? img.parentElement.querySelector('source') : null;
  if (source) source.srcset = set(base, 'avif');
  img.srcset = set(base, 'webp');
  img.src = srcOf(base);
}

/** Mark images as loaded so they fade in instead of painting line by line. */
export function watchImages() {
  const done = (e) => { if (e.target.tagName === 'IMG') e.target.classList.add('is-loaded'); };
  document.addEventListener('load', done, true);
  document.addEventListener('error', done, true);
}
export function markLoaded(root = document) {
  root.querySelectorAll('img[data-fade]').forEach((i) => { if (i.complete) i.classList.add('is-loaded'); });
}

/** Switch lazy images inside `el` to eager once it is within `margin` of the screen (for sideways tracks). */
export function loadAhead(el, margin = '150% 0px') {
  const io = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    el.querySelectorAll('img[loading="lazy"]').forEach((i) => { i.loading = 'eager'; });
    io.disconnect();
  }, { rootMargin: margin });
  io.observe(el);
  return () => io.disconnect();
}
