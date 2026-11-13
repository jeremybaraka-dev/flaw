// Roller-shutter page transition: horizontal slats drop shut, then roll back up.
import { gsap, reduced } from './scroll.js';

const el = document.getElementById('shutter');
const SLATS = 9;
el.innerHTML = `${'<i></i>'.repeat(SLATS)}<span class="shutter__label mono"></span>`;
const slats = [...el.querySelectorAll('i')];
const label = el.querySelector('.shutter__label');

export function cover(text = '') {
  el.classList.add('is-active');
  label.textContent = text;
  if (reduced) { gsap.set(slats, { scaleY: 1 }); return Promise.resolve(); }
  gsap.set(slats, { transformOrigin: 'top', scaleY: 0 });
  return gsap
    .timeline()
    .to(slats, { scaleY: 1, duration: 0.38, ease: 'power3.inOut', stagger: 0.025 })
    .to(label, { opacity: 0.7, duration: 0.15 }, '-=0.15')
    .then();
}

/** Remove the shutter instantly (the loader opens the page on its own). */
export function clearNow() {
  gsap.set(slats, { scaleY: 0 });
  gsap.set(label, { opacity: 0 });
  el.classList.remove('is-active');
}

export function reveal() {
  if (reduced) { gsap.set(slats, { scaleY: 0 }); el.classList.remove('is-active'); return Promise.resolve(); }
  gsap.set(slats, { transformOrigin: 'bottom' });
  return gsap
    .timeline({ onComplete: () => {el.classList.remove('is-active'); } })
    .to(label, { opacity: 0, duration: 0.15 })
    .to(slats, { scaleY: 0, duration: 0.6, ease: 'power4.inOut', stagger: { each: 0.035, from: 'end' } }, 0.05)
    .then();
}
