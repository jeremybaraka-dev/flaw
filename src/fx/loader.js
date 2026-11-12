// First-visit intro. Police lights sweep the screen while "LAW ENFORCEMENT" rises letter by letter,
// a red F slams in to make it FLAW ENFORCEMENT, the rest drops away leaving FE, and the screen splits open.
// The stage is drawn twice, once in each half, so the split cuts the type cleanly in two.
import { gsap, reduced } from './scroll.js';
import { reveal, clearNow } from './shutter.js';

const LOGS = ['Scanning subject for flaws', 'Scars located', 'Setbacks verified', 'Flaws confirmed. Entry approved'];
const letters = (t) => t.split('').map((c) => `<span class="lc"><span>${c}</span></span>`).join('');

const STAGE = `
  <div class="ldr__lights"><i class="ldr__beam ldr__beam--r"></i><i class="ldr__beam ldr__beam--b"></i></div>
  <span class="ldr__bar"><i></i><i></i></span>
  <span class="ldr__tag ldr__tag--tl mono">Flaw Enforcement Dept.</span>
  <span class="ldr__tag ldr__tag--tr mono">Unit 254 · Kenya</span>
  <span class="ldr__tag ldr__tag--bl mono" data-log>${LOGS[0]}</span>
  <span class="ldr__count"><b data-n>000</b>%</span>
  <div class="ldr__word">
    <span class="lw"><span class="lg lg--f">${letters('F')}</span><span class="lg lg--law">${letters('LAW')}</span></span>
    <span class="lw"><span class="lg lg--e">${letters('E')}</span><span class="lg lg--rest">${letters('NFORCEMENT')}</span></span>
  </div>
  <span class="ldr__sub mono">Case 001 · <b>Cleared</b></span>`;

export async function runLoader(onReveal) {
  const el = document.getElementById('loader');
  const done = () => {
    el.classList.add('is-done');
    el.innerHTML = '';
    document.body.classList.remove('is-loading');
  };

  let seen = false;
  try { seen = !!sessionStorage.getItem('fe_seen'); sessionStorage.setItem('fe_seen', '1'); } catch { /* storage blocked */ }

  // Return visits in the same session (and reduced motion) get the quick shutter open instead.
  if (seen || reduced) {
    done();
    const r = reveal();
    onReveal?.();
    await r;
    return;
  }

  el.innerHTML = `
    <div class="ldr__half ldr__half--top"><div class="ldr__stage">${STAGE}</div></div>
    <div class="ldr__half ldr__half--bot"><div class="ldr__stage">${STAGE}</div></div>
    <span class="ldr__line"></span>`;
  const q = (s) => el.querySelectorAll(s);

  await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1500))]);

  const nums = q('[data-n]');
  const logs = q('[data-log]');
  const count = { v: 0 };
  let lastLog = 0;

  gsap.set(q('.lc > span'), { yPercent: 115 });
  gsap.set(q('.lg--f'), { opacity: 0, scale: 3.6 });
  gsap.set(q('.lg--f .lc > span'), { yPercent: 0 });
  gsap.set(q('.ldr__tag, .ldr__count, .ldr__bar, .ldr__sub'), { opacity: 0 });

  // F and E slide together into a centred FE monogram
  const lockup = () => {
    const top = el.querySelector('.ldr__half--top .ldr__stage');
    const rf = top.querySelector('.lg--f').getBoundingClientRect();
    const re = top.querySelector('.lg--e').getBoundingClientRect();
    const h = rf.height;
    const k = Math.min((innerHeight * 0.36) / h, (innerWidth * 0.62) / (rf.width + re.width));
    const gap = h * 0.04 * k;
    const left = innerWidth / 2 - (rf.width * k + gap + re.width * k) / 2;
    const cy = innerHeight / 2 - h * k * 0.06;
    const move = { duration: 0.95, ease: 'power4.inOut', scale: k };
    gsap.to(q('.lg--f'), { ...move, x: left + (rf.width * k) / 2 - (rf.left + rf.width / 2), y: cy - (rf.top + rf.height / 2) });
    gsap.to(q('.lg--e'), { ...move, x: left + rf.width * k + gap + (re.width * k) / 2 - (re.left + re.width / 2), y: cy - (re.top + re.height / 2) });
  };

  const tl = gsap.timeline();
  tl.to(q('.ldr__bar, .ldr__tag, .ldr__count'), { opacity: 1, duration: 0.6, stagger: 0.05 }, 0)
    .to(count, {
      v: 100,
      duration: 4.1,
      ease: 'power1.inOut',
      onUpdate: () => {
        const n = String(Math.round(count.v)).padStart(3, '0');
        nums.forEach((x) => { x.textContent = n; });
        const i = Math.min(LOGS.length - 1, Math.floor((count.v / 100) * LOGS.length));
        if (i !== lastLog) { lastLog = i; logs.forEach((x) => { x.textContent = LOGS[i]; }); }
      },
    }, 0)
    .to(q('.lg--law .lc > span, .lg--e .lc > span, .lg--rest .lc > span'), { yPercent: 0, duration: 0.8, ease: 'power4.out', stagger: 0.026 }, 0.15)
    // LAW ENFORCEMENT is held long enough to read, then the F slams in: LAW becomes FLAW
    .to(q('.lg--f'), { opacity: 1, scale: 1, duration: 0.32, ease: 'power4.in' }, 1.9)
    .add(() => el.classList.add('is-alarm'), 2.22)
    .fromTo(q('.ldr__word'), { x: -12 }, { x: 0, duration: 0.55, ease: 'elastic.out(1.3, 0.2)' }, 2.22)
    // FLAW ENFORCEMENT is held for a beat, then everything but F and E drops away
    .to(q('.lg--law .lc > span, .lg--rest .lc > span'), { yPercent: 115, duration: 0.5, ease: 'power3.in', stagger: 0.022 }, 3.25)
    .to(q('.ldr__tag, .ldr__count'), { opacity: 0, duration: 0.4 }, 3.8)
    .add(lockup, 3.85)
    .to(q('.ldr__sub'), { opacity: 1, duration: 0.5 }, 4.6)
    .to(q('.ldr__line'), { scaleX: 1, duration: 0.45, ease: 'power3.inOut' }, 4.95)
    .add(() => {
      clearNow();
      el.classList.add('is-split');
      onReveal?.();
    }, 5.35)
    .to(q('.ldr__half--top'), { yPercent: -101, duration: 0.95, ease: 'power4.inOut' }, 5.35)
    .to(q('.ldr__half--bot'), { yPercent: 101, duration: 0.95, ease: 'power4.inOut' }, 5.35)
    .to(q('.ldr__line'), { opacity: 0, duration: 0.3 }, 5.5);

  await tl.then();
  done();
}
