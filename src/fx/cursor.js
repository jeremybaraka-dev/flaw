// Custom cursor: red dot + ring. Elements with data-cursor="LABEL" turn the ring into a labelled disc.
import { gsap, touch, reduced } from './scroll.js';

export function initCursor() {
  if (touch || reduced) return;
  const el = document.getElementById('cursor');
  const dot = el.querySelector('.cur__dot');
  const ring = el.querySelector('.cur__ring');
  const label = ring.querySelector('b');
  document.documentElement.classList.add('has-cursor');

  const pos = { x: innerWidth / 2, y: innerHeight / 2 };
  const ringPos = { ...pos };
  const setDot = gsap.quickSetter(dot, 'css');
  const setRing = gsap.quickSetter(ring, 'css');

  addEventListener('pointermove', (e) => {
    pos.x = e.clientX;
    pos.y = e.clientY;
    el.classList.remove('is-hidden');
  }, { passive: true });
  document.addEventListener('pointerleave', () => el.classList.add('is-hidden'));
  addEventListener('pointerdown', () => el.classList.add('is-down'));
  addEventListener('pointerup', () => el.classList.remove('is-down'));

  gsap.ticker.add(() => {
    ringPos.x += (pos.x - ringPos.x) * 0.18;
    ringPos.y += (pos.y - ringPos.y) * 0.18;
    setDot({ x: pos.x, y: pos.y });
    setRing({ x: ringPos.x, y: ringPos.y });
  });

  document.addEventListener('pointerover', (e) => {
    const t = e.target.closest?.('[data-cursor], a, button, label, summary');
    const text = t?.closest('[data-cursor]')?.dataset.cursor;
    el.classList.toggle('is-label', !!text);
    el.classList.toggle('is-link', !!t && !text);
    if (text) label.textContent = text;
  });
}
