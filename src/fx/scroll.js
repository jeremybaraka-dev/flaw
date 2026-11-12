import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const touch = matchMedia('(hover: none), (pointer: coarse)').matches;
if (reduced) document.documentElement.classList.add('no-motion');

export const lenis = new Lenis({ lerp: 0.11, smoothWheel: !reduced });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);

export const lockScroll = (on) => {
  document.body.classList.toggle('is-locked', on);
  on ? lenis.stop() : lenis.start();
};

/** Scroll-triggered reveals shared by every page. Call inside a gsap.context. */
export function reveals(root) {
  if (reduced) return;
  ScrollTrigger.batch(root.querySelectorAll('[data-reveal]'), {
    start: 'top 90%',
    once: true,
    onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.07, overwrite: true }),
  });
  root.querySelectorAll('[data-split]').forEach((el) => {
    const words = el.querySelectorAll('.w > i');
    if (!words.length) return;
    gsap.from(words, {
      yPercent: 110,
      duration: 1,
      ease: 'power4.out',
      stagger: 0.045,
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });
}

export { gsap, ScrollTrigger };
