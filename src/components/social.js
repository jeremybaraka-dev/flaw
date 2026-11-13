// Social wall: columns of phones (TikTok-style posts) and stat cards that drift at different speeds.
// Tap the heart to like, double-tap a post for the big heart; videos play only while on screen.
import { gsap, reduced } from '../fx/scroll.js';
import { esc } from '../fx/text.js';
import { srcOf } from '../img.js';
import { posts, stats } from '../data/social.js';

const n = (v) => (v >= 1e6 ? `${(v / 1e6).toFixed(1)}M` : v >= 1e3 ? `${(v / 1e3).toFixed(1).replace(/\.0$/, '')}K` : String(v));
const ICON = {
  heart: '<svg viewBox="0 0 24 24"><path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.3 3 4.5 6.7 4.5c2.1 0 3.6 1.2 5.3 3.1 1.7-1.9 3.2-3.1 5.3-3.1 3.7 0 5.8 3.8 4.3 7.3C19.5 16.4 12 21 12 21z"/></svg>',
  chat: '<svg viewBox="0 0 24 24"><path d="M12 3C6.5 3 2 6.9 2 11.6c0 2.6 1.4 4.9 3.6 6.5L5 22l4.3-2.3c.9.2 1.8.3 2.7.3 5.5 0 10-3.9 10-8.6S17.5 3 12 3z"/></svg>',
  share: '<svg viewBox="0 0 24 24"><path d="M14 4v4C7 9 4 13 3 19c2.5-3.5 6-5 11-5v4l7-7-7-7z"/></svg>',
};

// phones and slow connections get the small video
const SMALL = typeof window !== 'undefined' && (innerWidth <= 860 || !!navigator.connection?.saveData);

function phone(p, i) {
  const media = p.video
    ? `<video muted loop playsinline preload="none" poster="${(SMALL && p.posterSm) || p.poster || srcOf(p.img, 480)}" data-src="${(SMALL && p.videoSm) || p.video}"></video>`
    : `<img src="${srcOf(p.img, 480)}" alt="" loading="lazy" decoding="async" />`;
  return `
    <div class="ph" data-post="${i}" style="--d:${(i % 4) * -2.3}s;--t:${8 + (i % 3) * 2}s">
      <div class="ph__screen">
        ${media}
        <i class="ph__shade"></i>
        <div class="ph__status mono"><span>12:22</span><span class="ph__notch"></span><span>●●● ▮</span></div>
        <div class="ph__tabs"><span>Following</span><b>For You</b></div>
        <div class="ph__rail">
          <span class="ph__ava"><img src="/favicon.png" alt="" /><i>+</i></span>
          <button class="ph__act" data-like aria-label="Like">${ICON.heart}<small data-count="${p.likes}">${n(p.likes)}</small></button>
          <span class="ph__act">${ICON.chat}<small>${n(p.comments)}</small></span>
          <span class="ph__act">${ICON.share}<small>${n(p.shares)}</small></span>
          <span class="ph__disc"></span>
        </div>
        <div class="ph__cap"><b>@${esc(p.user)}</b><p>${esc(p.caption)}</p><span class="mono">♫ ${esc(p.sound)}</span></div>
        <div class="ph__nav"><span>⌂</span><span>⌕</span><span class="ph__plus">+</span><span>✉</span><span>◯</span></div>
        <i class="ph__burst" aria-hidden="true">${ICON.heart}</i>
        <span class="ph__floats" aria-hidden="true">${ICON.heart}${ICON.heart}${ICON.heart}</span>
        <i class="ph__prog" aria-hidden="true"></i>
      </div>
    </div>`;
}

const stat = (s) => `<div class="sc"><b class="sc__big">${esc(s.big)}</b><span class="sc__label">${esc(s.label)}</span><span class="sc__on mono">${esc(s.on)}</span></div>`;

/** Five columns; each alternates phone and stat card, offset so the wall looks staggered. */
export function socialWall() {
  const cols = [[], [], [], [], []];
  let p = 0;
  let s = 0;
  cols.forEach((col, c) => {
    const startWithStat = c % 2 === 0;
    // columns that start with a stat card get a fourth item, so every column runs the full height
    for (let k = 0; k < (startWithStat ? 4 : 3); k++) {
      const wantStat = (k % 2 === 0) === startWithStat;
      col.push(wantStat ? stat(stats[s++ % stats.length]) : phone(posts[p % posts.length], p++));
    }
  });
  return `<div class="soc__wall" data-soc>${cols.map((col, c) => `<div class="soc__col" data-col="${c}">${col.join('')}</div>`).join('')}</div>`;
}

export function mountSocial(root) {
  const wall = root.querySelector('[data-soc]');
  if (!wall) return () => {};
  const cleanups = [];

  // columns drift at different speeds as the section scrolls past
  if (!reduced) {
    // alternate columns travel in opposite directions: some phones rise while others sink
    const small = innerWidth <= 860;
    const speeds = small ? [-70, 60, 0, 60, -70] : [-120, 100, 0, 100, -120];
    wall.querySelectorAll('.soc__col').forEach((col, i) => {
      gsap.fromTo(col, { y: -speeds[i] }, { y: speeds[i], ease: 'none', scrollTrigger: { trigger: wall, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  }

  // likes: tap the heart, or double-tap the post
  const like = (ph) => {
    const btn = ph.querySelector('[data-like]');
    const c = btn.querySelector('small');
    const on = btn.classList.toggle('is-on');
    const v = Number(c.dataset.count) + (on ? 1 : 0);
    c.textContent = n(v);
    if (on && !reduced) gsap.fromTo(btn.querySelector('svg'), { scale: 1.5 }, { scale: 1, duration: 0.5, ease: 'back.out(3)' });
  };
  const onClick = (e) => {
    const btn = e.target.closest('[data-like]');
    if (btn) like(btn.closest('.ph'));
  };
  const onDbl = (e) => {
    const ph = e.target.closest('.ph');
    if (!ph) return;
    if (!ph.querySelector('[data-like]').classList.contains('is-on')) like(ph);
    const burst = ph.querySelector('.ph__burst');
    if (!reduced) gsap.fromTo(burst, { opacity: 1, scale: 0.4, rotation: -14 }, { opacity: 0, scale: 1.3, rotation: 0, duration: 0.9, ease: 'power2.out' });
  };
  wall.addEventListener('click', onClick);
  wall.addEventListener('dblclick', onDbl);
  cleanups.push(() => { wall.removeEventListener('click', onClick); wall.removeEventListener('dblclick', onDbl); });

  // videos load and play only while their phone is on screen
  const vids = [...wall.querySelectorAll('video')];
  if (vids.length) {
    const io = new IntersectionObserver((es) => es.forEach(({ target: v, isIntersecting }) => {
      if (isIntersecting) { if (!v.src) v.src = v.dataset.src; v.play().catch(() => {}); } else v.pause();
    }), { rootMargin: '120% 0px' });
    vids.forEach((v) => io.observe(v));
    cleanups.push(() => { io.disconnect(); vids.forEach((v) => v.pause()); });
  }
  return () => cleanups.forEach((f) => f());
}
