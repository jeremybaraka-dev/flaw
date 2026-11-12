import { gsap, ScrollTrigger, lenis, reduced, touch } from '../fx/scroll.js';
import { initRail } from '../fx/rail.js';
import { halftone } from '../fx/halftone.js';
import { flow } from '../fx/flow.js';
import { words, esc } from '../fx/text.js';
import { products, byHandle } from '../data/products.js';
import { lineup } from '../data/lineup.js';
import { kes } from '../data/pricing.js';
import { pic, srcOf, loadAhead } from '../img.js';
import { nairobiTime } from '../components/chrome.js';

// [handle, image file, height factor, hanger type]
const RAIL = [
  ['tribal-zip-up', 'TZU', 1],
  ['racer-jacket', 'frbf', 1.02],
  ['camo-flawge-pants', 'Laer3', 1.3, 'clip'],
  ['irezumi-demi-crop', 'dragon_irezumi', 0.96],
  ['spawn-jersey', 'WHITEMESH', 0.98],
  ['broken-angel-sweats', 'Layer31', 1.3, 'clip'],
  ['ralph-flaw-ren', 'rf', 0.86],
  ['void-raglan', 'RRF', 0.86],
  ['distortion-zip-up', 'dstrtfront', 1],
  ['broken-angel', 'Layer0copy', 1.06],
];

const HOOK = `<svg class="hang__hook" viewBox="0 0 200 74" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M100 36V24c0-4 12-5 12-13a12 12 0 1 0-24 0"/><path d="M100 36 10 66h180Z"/></svg>`;
const CLIP = `<svg class="hang__hook" viewBox="0 0 200 74" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M100 50V24c0-4 12-5 12-13a12 12 0 1 0-24 0"/><path d="M34 52h132"/><path d="M46 44v22M154 44v22" stroke-width="9"/></svg>`;

const hang = ([handle, file, f, type], i) => {
  const p = byHandle[handle];
  return `
    <a class="hang ${type ? 'hang--clip' : ''}" href="/product/${handle}" style="--f:${f}" data-cursor="OPEN" draggable="false">
      ${type ? CLIP : HOOK}
      ${pic(`/products/${file}`, { sizes: '(max-width: 860px) 46vw, 24vw', alt: esc(p.title), lazy: false, high: i < 5 })}
      <span class="hang__tag mono"><b>Exh. ${p.exhibit}</b>${esc(p.title)}<i>${kes(p.price)}</i></span>
    </a>`;
};

const MARKS = ["6'6", "6'4", "6'2", "6'0", "5'10", "5'8", "5'6", "5'4", "5'2", "5'0", "4'10", "4'8", "4'6", "4'4"];
const marks = (side) =>
  `<div class="hero__marks hero__marks--${side} mono" aria-hidden="true">${MARKS.map((m, i) => `<span style="--i:${i}">${m}"</span>`).join('')}</div>`;

const tape = (text, cls = '') => {
  const set = `<div class="tape__in">${`<span class="d">${text}</span>`.repeat(8)}</div>`;
  return `<div class="tape ${cls}" data-tape aria-hidden="true">${set}${set}</div>`;
};

const MANIFESTO = "Every scar, setback and wrong turn is *evidence.* We don't hide it. We *enforce* it.";

// where each lineup photo should be cropped so faces stay in frame
const FOCAL = { 1: '50% 30%', 2: '38% 22%', 3: '50% 34%', 4: '42% 22%', 5: '42% 28%', 6: '40% 24%', 7: '52% 26%', 8: '30% 28%', 9: '50% 36%', 10: '56% 24%', 11: '50% 16%' };

const strip = (s, i) => {
  const p = byHandle[s.wearing];
  const pos = String(i + 1).padStart(2, '0');
  return `
    <div class="lus" data-strip="${i}" style="--fp:${FOCAL[s.img] || '50% 30%'}" role="button" tabindex="0" aria-label="Suspect ${s.no}, ${esc(s.charge)}">
      ${pic(`/lineup/${s.img}`, { sizes: '(max-width: 860px) 60vw, 48vw', cls: 'lus__img' })}
      <i class="lus__dots"></i>
      <span class="lus__pos mono">${pos}</span>
      <span class="lus__tag c">№ ${s.no}</span>
      <div class="lus__card">
        <span class="lus__k mono">Suspect ${pos} / ${String(lineup.length).padStart(2, '0')} · Booked</span>
        <b class="lus__no d">№ ${s.no}</b>
        <dl class="lus__dl mono">
          <div><dt>Charge</dt><dd>${esc(s.charge)}</dd></div>
          <div><dt>Wearing</dt><dd>${esc(p.title)}</dd></div>
        </dl>
        <a class="btn btn--red lus__cta" href="/product/${p.handle}">Shop the fit <span>→</span></a>
      </div>
      <i class="lus__bar"><b></b></i>
      <i class="lus__flash"></i>
    </div>`;
};

const LINEUP_DUR = 3800;

const CLASS = { outerwear: 'Outerwear', tops: 'Top', tees: 'Tee', bottoms: 'Bottoms', sets: 'Set' };
const BAG_SIZES = '(max-width: 860px) 70vw, 24vw';

/** An exhibit sealed in an evidence bag: red header band, hand-filled form, the garment behind plastic. */
const bag = (p) => {
  const n = p.variants.length;
  return `
    <a class="evb" href="/product/${p.handle}" data-cursor="OPEN">
      <span class="evb__zip" aria-hidden="true"></span>
      <div class="evb__band"><b class="d">Evidence</b><span class="mono">Exh. ${p.exhibit} / ${products.length}</span></div>
      <dl class="evb__form mono">
        <div><dt>Class</dt><dd class="mk">${CLASS[p.category] || p.category}</dd></div>
        <div><dt>${n > 1 ? 'Colourways' : 'Colourway'}</dt><dd class="mk">${n > 1 ? n : esc(p.variants[0].name)}</dd></div>
        <div class="evb__note"><dt>Notes</dt><dd class="mk">${esc(p.hook)}</dd></div>
      </dl>
      <div class="evb__seal mono" aria-hidden="true"><span>${'Sealed · FE · Do not perfect · '.repeat(4)}</span><span>Break the seal →</span></div>
      <div class="evb__win">
        ${pic(p.image, { sizes: BAG_SIZES, alt: esc(p.title), cls: 'evb__a' })}
        ${pic(p.alt, { sizes: BAG_SIZES, cls: 'evb__b' })}
        <i class="evb__glare" aria-hidden="true"></i>
        <i class="evb__scale" aria-hidden="true"></i>
        <b class="evb__mark" aria-hidden="true">${Number(p.exhibit)}</b>
      </div>
      <div class="evb__bot">
        <h3>${esc(p.title)}</h3>
        <span class="evb__price mono">${kes(p.price)}</span>
        <i class="evb__go" aria-hidden="true">→</i>
      </div>
    </a>`;
};

const now = new Date();
const stampDate = now.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }).toUpperCase();
const filed = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();

// photos the pinned polaroid cycles through on the correction notice
const EXHIBITS = [
  [11, 'exhibit A. no passengers.'],
  [1, 'exhibit B. still flawless.'],
  [9, 'exhibit C. the whole crew.'],
  [3, 'exhibit D. the wall took the L.'],
  [2, 'exhibit E. caught walking.'],
  [10, 'exhibit F. lights, camera.'],
  [5, 'exhibit G. no faces, no case.'],
  [7, 'exhibit H. repeat offenders.'],
];

/** Each character in its own span so it can be typed out. */
const typed = (str) => str.split('').map((c) => `<span class="ch">${c === ' ' ? '&nbsp;' : c}</span>`).join('');

/** Phones: size each hero title line to the full column width, then sit the rail just below. */
function fitHero(root) {
  const hero = root.querySelector('.hero');
  if (!hero) return;
  const lines = [...hero.querySelectorAll('[data-fit]')];
  if (innerWidth > 860) {
    lines.forEach((l) => { l.style.fontSize = ''; });
    hero.style.removeProperty('--rail-y');
    hero.style.removeProperty('--gh');
    hero.style.height = '';
    return;
  }
  const head = hero.querySelector('.hero__head');
  const avail = head.clientWidth - parseFloat(getComputedStyle(head).paddingLeft) * 2;
  lines.forEach((l) => {
    l.style.fontSize = '100px';
    l.style.fontSize = `${Math.floor((100 * avail) / l.scrollWidth) - 1}px`;
  });
  const railY = Math.round(head.offsetTop + head.offsetHeight + 28);
  const gh = Math.round(Math.min(innerHeight * 0.29, innerWidth * 0.52, 300));
  hero.style.setProperty('--rail-y', `${railY}px`);
  hero.style.setProperty('--gh', `${gh}px`);
  hero.style.height = `${Math.round(Math.min(innerHeight, railY + gh * 1.32 + 118))}px`;
}

let killRail;

export default {
  title: () => 'Imperfection worn with purpose',

  render() {
    const set = RAIL.map(hang).join('');
    const setCopy = RAIL.map((r) => hang(r, 99)).join('');
    const featured = products.slice(0, 9);
    const rest = products.slice(featured.length);

    return `
    <section class="hero" id="top">
      <div class="hero__wall" aria-hidden="true"></div>
      ${marks('l')}${marks('r')}
      <div class="hero__corner hero__corner--tl mono"><span>Case 001</span><span>Limited release</span></div>
      <div class="hero__corner hero__corner--tr mono"><span>Kenya · 254</span><span>${stampDate}</span></div>

      <div class="hero__head">
        <div class="hero__star mono" aria-hidden="true">✦ File no. 001 ✦</div>
        <h1 class="hero__title d" data-hero-title><span class="hl hl--a" data-fit><span class="w"><i>Scars</i></span> <span class="w"><i>built</i></span></span> <span class="hl hl--b" data-fit><span class="w"><i>this.</i></span></span></h1>
        <p class="hero__sub">Imperfection worn with purpose. <span>Fifteen exhibits, no restocks,</span> <br /><span>built for those who were never going to fit the mould.</span></p>
      </div>

      <div class="rail" data-rail data-cursor="DRAG">
        <div class="rail__bar"></div>
        <div class="rail__track">${set}${setCopy}</div>
        <div class="rail__shadow"></div>
      </div>

      <div class="hero__corner hero__corner--bl d"><span>Never</span><span>perfect</span></div>
      <p class="hero__hint mono"><span>↔ Drag the rail</span><span>Brush the pieces</span><span>Click to open the file</span></p>
      <a class="hero__corner hero__corner--br d" href="/shop"><span>Shop</span><span>now →</span></a>
    </section>

    <div class="tapes">
      ${tape('You were never perfect', '')}
      ${tape('Flaw scene · do not perfect', 'tape--caution')}
    </div>

    <section class="lineup t-ink" id="lineup" data-lineup>
      <canvas class="lineup__flow" aria-hidden="true"></canvas>
      <header class="lineup__head">
        <h2 class="d" data-split>${words('The lineup')}</h2>
        <div class="lineup__meta">
          <p class="mono">${lineup.length} suspects booked. All guilty of the same thing: <span class="red">refusing to be perfect.</span></p>
          <div class="lineup__count"><b data-l-i>01</b><span>/${String(lineup.length).padStart(2, '0')}</span></div>
        </div>
      </header>
      <div class="lwall" data-wall style="--dur:${LINEUP_DUR}ms;--n:${lineup.length}">${lineup.map(strip).join('')}</div>
      <div class="lineup__foot">
        <p class="mono lineup__hint">${touch ? 'Tap a suspect to pull their file' : 'Hover a suspect to pull their file'}</p>
        <p class="d">Got booked in <span class="red">FE?</span></p>
        <a class="btn" href="https://www.instagram.com/flawenforcement/" target="_blank" rel="noopener">Tag @flawenforcement ↗</a>
      </div>
    </section>

    <section class="mani t-blood rnd" data-mani-sec>
      <canvas class="mani__flow" aria-hidden="true"></canvas>
      <div class="mani__kick mono"><span>File 001 / Statement</span><span>Classification: public</span></div>
      <p class="mani__text d" data-mani>${MANIFESTO.split(' ')
        .map((w) => (w.startsWith('*') ? `<span class="is-red">${w.replaceAll('*', '')}</span>` : `<span>${w}</span>`))
        .join(' ')}</p>

      <div class="mani__grid">
        <div class="cctv brk" data-cctv>
          <video muted loop playsinline preload="none" poster="/media/hero-poster.webp" data-src-sm="/media/cctv.mp4" data-src-lg="/media/cctv.mp4"></video>
          <div class="cctv__lines" aria-hidden="true"></div>
          <div class="cctv__hud mono" aria-hidden="true">
            <span><b class="cctv__rec">●</b> Rec · Cam 01</span>
            <span data-cctv-time>${nairobiTime()}</span>
            <span>Evidence room</span>
            <span>Case 001: "Scars built this."</span>
          </div>
        </div>
        <div class="mani__copy">
          <p data-reveal>Started in Nairobi, worn across Kenya. Flaw Enforcement is more than a streetwear label. It is a movement rooted in authenticity, identity and real human experience.</p>
          <p data-reveal>Every scar, mistake, setback and flaw tells a story. We don't hide those stories. We wear them.</p>
          <ul class="mani__facts mono" data-reveal>
            <li><b class="d">15</b>Exhibits on file</li>
            <li><b class="d">00</b>Restocks, ever</li>
            <li><b class="d">47</b>Counties, one movement</li>
          </ul>
          <a class="btn btn--ghost" href="/about" data-reveal>Read the full file <span>→</span></a>
        </div>
      </div>
    </section>

    <section class="evi t-paper rnd" data-evi>
      <div class="evi__pin">
        <header class="evi__head">
          <div>
            <div class="mono evi__kick">Case 001 · Evidence locker</div>
            <h2 class="d" data-split>${words('The evidence')}<sup>(${products.length})</sup></h2>
          </div>
          <div class="evi__side">
            <p class="mono">Bagged, tagged and sealed.<br />Limited pieces. No restocks.</p>
            <a class="btn btn--ink" href="/shop">View all ${products.length} <span>→</span></a>
          </div>
        </header>
        <div class="evi__track" data-evi-track>
          <svg class="evi__string" aria-hidden="true"><path /></svg>
          <div class="evi__pins" aria-hidden="true"></div>
          ${featured.map(bag).join('')}
          <div class="evl">
            <span class="evb__zip" aria-hidden="true"></span>
            <div class="evl__top mono"><span><b>+ ${rest.length}</b> more on file</span><span>Locker 02</span></div>
            <div class="evl__grid">
              ${rest.map((p) => `
                <a class="evl__it" href="/product/${p.handle}" data-cursor="OPEN" aria-label="${esc(p.title)}, ${kes(p.price)}">
                  ${pic(p.image, { sizes: '(max-width: 860px) 26vw, 11vw', alt: '' })}
                  <span class="mono">${p.exhibit}</span>
                </a>`).join('')}
            </div>
            <a class="evl__cta" href="/shop" data-cursor="ALL"><span class="d">Open the<br />locker</span><i aria-hidden="true">→</i></a>
          </div>
        </div>
        <div class="evi__foot mono" aria-hidden="true">
          <span class="evi__hint">${touch ? 'Swipe the evidence' : 'Keep scrolling'} <b>→</b></span>
          <div class="evi__prog"><i data-evi-prog></i></div>
          <span class="evi__n"><b data-evi-n>01</b> / ${products.length}</span>
        </div>
      </div>
    </section>

    <section class="stmt t-ink rnd" data-stmt aria-label="Flaws aren't mistakes. They're the design.">
      <div class="aura" aria-hidden="true"></div>
      <div class="stmt__kick mono"><span>File 002 / Correction notice</span><span>Filed ${filed}</span></div>
      <div class="stmt__desk">
        <article class="doc" aria-hidden="true">
          <i class="doc__clip"></i>
          <header class="doc__head mono">
            <div><b>Flaw Enforcement Dept.</b><span>Division 254 · Kenya</span></div>
            <div><b>Form FE-47</b><span>Correction notice</span></div>
          </header>
          <dl class="doc__meta mono">
            <div><dt>Subject</dt><dd>Everyone who was ever told to be perfect</dd></div>
            <div><dt>Reported by</dt><dd>The world</dd></div>
          </dl>
          <div class="doc__label mono">Statement on record</div>
          <p class="doc__line">${typed('Flaws are')} <span class="doc__x">${typed('mistakes.')}<svg class="doc__strike" viewBox="0 0 300 60" preserveAspectRatio="none"><path d="M6 36 C40 22 70 46 104 30 S170 16 206 33 S268 44 294 22" /><path d="M14 44 C58 30 96 50 140 36 S214 26 290 38" /></svg><span class="doc__ins mk">the design.</span></span></p>
          <footer class="doc__foot mono">
            <div>Reviewed by <span class="mk doc__sign">F.E.</span></div>
            <div>Status <b data-doc-status>Under review</b></div>
          </footer>
          <span class="doc__stamp stamp">Enforced</span>
        </article>
        <figure class="stmt__pola" aria-hidden="true" data-pola>
          <span class="stmt__shot"><img src="${srcOf(`/lineup/${EXHIBITS[0][0]}`, 480)}" alt="" width="480" height="600" loading="lazy" decoding="async" /><i class="stmt__flash"></i></span>
          <figcaption class="mk">${EXHIBITS[0][1]}</figcaption>
        </figure>
      </div>
      <p class="stmt__plain d" data-reveal>Flaws aren't mistakes. <span class="red">They're the design.</span></p>
    </section>

    <section class="rated t-paper rnd">
      <div class="rated__media" data-rated>
        ${pic('/lineup/5', { sizes: '(max-width: 860px) 100vw, 50vw', alt: 'Two people back to back in black Tribal Zip-Up hoodies', fade: false })}
        <canvas aria-hidden="true"></canvas>
        <span class="rated__cap mono">Fig. 05 · Tribal Zip-Up · print proof</span>
      </div>
      <div class="rated__copy">
        <div class="mono rated__kick">Content advisory</div>
        <h2 class="d" data-split>${words('Perfectly imperfect.')}</h2>
        <p data-reveal>Each piece is built through imperfection. Distressed, raw, and intentional. Nothing is random.</p>
        <ul class="rated__facts c" data-reveal>
          <li>Distressed by design</li>
          <li>No two pieces the same</li>
          <li>Limited. Never restocked</li>
        </ul>
        <div class="rated__row" data-reveal>
          <img class="rated__badge" src="/brand/rated-fe.webp" alt="Product rated FE for Flaw Enforcement" width="543" height="764" loading="lazy" />
          <a class="btn btn--ink" href="/product/tribal-zip-up">Shop the Tribal Zip-Up <span>→</span></a>
        </div>
      </div>
    </section>

`;
  },

  enter(root) {
    fitHero(root);
    const rail = root.querySelector('[data-rail]');
    killRail?.();
    killRail = initRail(rail);
    if (reduced) return;
    gsap.from(root.querySelectorAll('.hero__title .w > i'), { yPercent: 115, duration: 1.2, ease: 'power4.out', stagger: 0.09, delay: 0.15 });
    gsap.from(root.querySelectorAll('.hero__sub, .hero__star, .hero__corner, .hero__hint, .hero__marks'), { opacity: 0, y: 14, duration: 0.9, ease: 'power2.out', stagger: 0.05, delay: 0.5 });
    gsap.from(root.querySelector('.rail__bar'), { scaleX: 0, duration: 1.1, ease: 'power3.inOut' });
  },

  mount(root) {
    const cleanups = [];

    /* hero drifts away as you scroll past */
    if (!reduced && innerWidth > 860) {
      gsap.to(root.querySelector('.hero__head'), { yPercent: -35, opacity: 0.2, ease: 'none', scrollTrigger: { trigger: root.querySelector('.hero'), start: 'top top', end: 'bottom top', scrub: true } });
      gsap.to(root.querySelector('.rail'), { yPercent: 9, ease: 'none', scrollTrigger: { trigger: root.querySelector('.hero'), start: 'top top', end: 'bottom top', scrub: true } });
    }

    /* tapes: marquee that speeds up and reverses with the scroll */
    const tapes = [...root.querySelectorAll('[data-tape]')].map((el, i) => ({ el, set: el.firstElementChild, x: 0, w: 1, dir: i % 2 ? 1 : -1 }));
    const tapeBox = root.querySelector('.tapes');
    const tapeRo = new ResizeObserver(() => tapes.forEach((t) => { t.w = t.set.offsetWidth || 1; }));
    tapes.forEach((t) => tapeRo.observe(t.set));
    let tapesSeen = true;
    const tapeIo = new IntersectionObserver(([e]) => { tapesSeen = e.isIntersecting; }, { rootMargin: '120px' });
    tapeIo.observe(tapeBox);
    let boost = 0;
    const onScroll = ({ velocity }) => { boost = velocity; };
    lenis.on('scroll', onScroll);
    const tapeTick = () => {
      boost *= 0.92;
      if (!tapesSeen) return;
      for (const t of tapes) {
        const w = t.w;
        t.x += (reduced ? 0 : 0.9 + Math.abs(boost) * 0.5) * t.dir * (boost < -0.5 ? -1 : 1);
        if (t.x <= -w) t.x += w;
        if (t.x > 0) t.x -= w;
        t.el.children[0].style.transform = t.el.children[1].style.transform = `translate3d(${t.x.toFixed(1)}px,0,0)`;
      }
    };
    gsap.ticker.add(tapeTick);
    cleanups.push(() => { gsap.ticker.remove(tapeTick); lenis.off('scroll', onScroll); tapeRo.disconnect(); tapeIo.disconnect(); });

    /* phones: hero title lines fill the column; refit on resize */
    fitHero(root);
    document.fonts.ready.then(() => fitHero(root));
    const onResize = () => fitHero(root);
    addEventListener('resize', onResize);
    cleanups.push(() => removeEventListener('resize', onResize));

    /* correction notice: the statement is typed, struck out, corrected in marker, then stamped */
    const stmt = root.querySelector('[data-stmt]');
    const doc = stmt.querySelector('.doc');
    const chars = doc.querySelectorAll('.doc__line .ch');
    const paths = [...doc.querySelectorAll('.doc__strike path')];
    const status = doc.querySelector('[data-doc-status]');
    if (reduced) {
      doc.classList.add('is-done');
      status.textContent = 'Corrected';
    } else {
      paths.forEach((p) => { const l = p.getTotalLength(); p.style.strokeDasharray = l; p.style.strokeDashoffset = l; });
      gsap.set(chars, { opacity: 0 });
      gsap.set(doc.querySelector('.doc__ins'), { clipPath: 'inset(-20% 100% -20% 0)' });
      gsap.set(doc.querySelector('.doc__sign'), { clipPath: 'inset(-30% 100% -30% 0)' });
      gsap.set(doc.querySelector('.doc__stamp'), { opacity: 0, scale: 3.2, rotation: -24 });
      gsap.timeline({ scrollTrigger: { trigger: doc, start: 'top 72%', once: true } })
        .to(chars, { opacity: 1, duration: 0.01, stagger: { each: 0.07, ease: 'none' } })
        .to(paths, { strokeDashoffset: 0, duration: 0.42, ease: 'power2.inOut', stagger: 0.18 }, '+=0.35')
        .to(doc.querySelector('.doc__ins'), { clipPath: 'inset(-20% 0% -20% 0)', duration: 0.75, ease: 'power1.inOut' }, '+=0.1')
        .to(doc.querySelector('.doc__sign'), { clipPath: 'inset(-30% 0% -30% 0)', duration: 0.5, ease: 'power1.inOut' }, '+=0.15')
        .add(() => { status.textContent = 'Corrected'; })
        .to(doc.querySelector('.doc__stamp'), { opacity: 1, scale: 1, rotation: -12, duration: 0.3, ease: 'power4.in' }, '+=0.15')
        .fromTo(doc, { x: -6 }, { x: 0, duration: 0.5, ease: 'elastic.out(1.4, 0.2)' });
      gsap.fromTo(stmt.querySelector('.stmt__pola'), { y: 50, rotation: 11 }, { y: -40, rotation: 4, ease: 'none', scrollTrigger: { trigger: stmt, start: 'top bottom', end: 'bottom top', scrub: true } });
      gsap.fromTo(doc, { rotation: 1.6 }, { rotation: -1.4, ease: 'none', scrollTrigger: { trigger: stmt, start: 'top bottom', end: 'bottom top', scrub: true } });
    }

    /* the polaroid swaps to a new suspect every 4 seconds, with a camera flash */
    const pola = stmt.querySelector('[data-pola]');
    const polaImg = pola.querySelector('img');
    const polaCap = pola.querySelector('figcaption');
    const polaFlash = pola.querySelector('.stmt__flash');
    const polaIo = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      EXHIBITS.forEach(([n]) => { const im = new Image(); im.src = srcOf(`/lineup/${n}`, 480); });
      polaIo.disconnect();
    }, { rootMargin: '100% 0px' });
    polaIo.observe(stmt);
    cleanups.push(() => polaIo.disconnect());
    let ex = 0;
    const nextExhibit = () => {
      if (!pola.offsetParent) return;
      ex = (ex + 1) % EXHIBITS.length;
      const [n, cap] = EXHIBITS[ex];
      if (reduced) { polaImg.src = srcOf(`/lineup/${n}`, 480); polaCap.textContent = cap; return; }
      gsap.timeline()
        .to(polaFlash, { opacity: 1, duration: 0.08, ease: 'none' })
        .add(() => { polaImg.src = srcOf(`/lineup/${n}`, 480); polaCap.textContent = cap; })
        .to(polaFlash, { opacity: 0, duration: 0.7, ease: 'power2.out' })
        .fromTo(pola, { scale: 1.05 }, { scale: 1, duration: 0.6, ease: 'back.out(2)' }, 0);
    };
    const exTimer = setInterval(nextExhibit, 4000);
    cleanups.push(() => clearInterval(exTimer));

    /* statement section: wavy contour bands that slowly morph and bend around the pointer */
    const maniSec = root.querySelector('[data-mani-sec]');
    let stopGlow = () => {};
    const glowIo = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      glowIo.disconnect();
      stopGlow = flow(maniSec.querySelector('.mani__flow'), maniSec, { mode: 'contour', colors: ['#0a0a0b', '#7a0a10', '#c8121c', '#ff2e3a', '#f2f0ea'] });
    }, { rootMargin: '60% 0px' });
    glowIo.observe(maniSec);
    cleanups.push(() => { glowIo.disconnect(); stopGlow(); });

    /* manifesto: words light up as you read */
    const maniWords = root.querySelectorAll('[data-mani] span');
    if (!reduced) {
      gsap.fromTo(maniWords, { opacity: 0.12 }, { opacity: 1, ease: 'none', stagger: 0.5, scrollTrigger: { trigger: root.querySelector('[data-mani]'), start: 'top 82%', end: 'bottom 45%', scrub: true } });
    }

    /* cctv: lazy video + opening clip */
    const cctv = root.querySelector('[data-cctv]');
    const video = cctv.querySelector('video');
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        // on Data Saver or a slow connection the poster stays up instead of streaming the clip
        const net = navigator.connection;
        if (net && (net.saveData || /(^|-)2g|3g/.test(net.effectiveType || ''))) return;
        if (!video.src) video.src = innerWidth > 1100 && !touch ? video.dataset.srcLg : video.dataset.srcSm;
        video.play().catch(() => {});
      } else video.pause();
    }, { rootMargin: '200px' });
    io.observe(cctv);
    const clock = setInterval(() => { const t = cctv.querySelector('[data-cctv-time]'); if (t) t.textContent = nairobiTime(); }, 1000);
    cleanups.push(() => { io.disconnect(); clearInterval(clock); video.pause(); });
    if (!reduced) {
      gsap.fromTo(cctv, { clipPath: 'inset(14% 10% 14% 10%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { trigger: cctv, start: 'top 92%', end: 'top 35%', scrub: true } });
      gsap.fromTo(video, { scale: 1.25 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: cctv, start: 'top bottom', end: 'bottom top', scrub: true } });
    }

    /* evidence: pinned horizontal scroll on desktop, native swipe on touch */
    const evi = root.querySelector('[data-evi]');
    cleanups.push(loadAhead(evi, '120% 0px'));
    const track = root.querySelector('[data-evi-track]');
    const prog = root.querySelector('[data-evi-prog]');
    const eviN = root.querySelector('[data-evi-n]');
    const bags = [...track.querySelectorAll('.evb')];
    const setProg = (p) => {
      prog.style.transform = `scaleX(${p})`;
      eviN.textContent = String(1 + Math.round(Math.min(1, p * 1.12) * (bags.length - 1))).padStart(2, '0');
    };
    // the bags hang from their top edge and sway with the speed of the scroll
    let sway = 0;
    const lean = bags.map(() => 0);
    const setLean = bags.map((b) => gsap.quickSetter(b, 'rotation', 'deg'));
    const swayTick = () => {
      sway *= 0.9;
      const target = Math.max(-3.2, Math.min(3.2, sway / -700));
      if (Math.abs(target) < 0.01 && lean.every((l) => Math.abs(l) < 0.01)) return;
      lean.forEach((l, i) => {
        lean[i] = l + (target - l) * (0.16 - (i % 4) * 0.025);
        setLean[i](lean[i]);
      });
    };
    if (!reduced) {
      gsap.from(track.querySelectorAll('.evb, .evl'), { y: 110, opacity: 0, duration: 1, ease: 'power4.out', stagger: 0.07, scrollTrigger: { trigger: track, start: 'top 82%', once: true } });
      // the pins go in once the bags have landed, then the string is pulled tight
      gsap.from(track.querySelectorAll('.evi__tack'), { scale: 0, opacity: 0, duration: 0.45, ease: 'back.out(3)', stagger: 0.07, delay: 0.55, scrollTrigger: { trigger: track, start: 'top 82%', once: true } });
      gsap.from(track.querySelector('.evi__string'), { opacity: 0, duration: 0.8, delay: 1.1, scrollTrigger: { trigger: track, start: 'top 82%', once: true } });
    }
    // Desktop: the bags fill the height that is left under the heading, and their width follows from it,
    // so the garment window keeps its shape on short laptop screens instead of being squashed flat.
    const fitBags = () => {
      if (!evi.classList.contains('is-pinned')) return;
      evi.classList.remove('is-tight', 'is-tighter');
      const vh = innerHeight;
      if (vh < 820) evi.classList.add('is-tight');
      if (vh < 640) evi.classList.add('is-tighter');
      const h = track.clientHeight;
      const win = bags[0].querySelector('.evb__win');
      const chrome = bags[0].offsetHeight - win.offsetHeight;
      const w = Math.round(Math.max(210, Math.min(400, innerWidth * 0.235, (h - chrome) / 0.9)));
      track.style.setProperty('--evw', `${w}px`);
    };
    // the board: a pushpin through the top of every bag, and red string running pin to pin
    const pinBox = track.querySelector('.evi__pins');
    const string = track.querySelector('.evi__string');
    const cards = [...track.querySelectorAll('.evb, .evl')];
    pinBox.innerHTML = cards.map(() => '<i class="evi__tack"></i>').join('');
    const pins = [...pinBox.children];
    const placePins = () => {
      const pts = cards.map((c) => [c.offsetLeft + c.offsetWidth / 2, c.offsetTop + 13]);
      pts.forEach(([x, y], i) => { pins[i].style.transform = `translate(${x}px, ${y}px)`; });
      string.setAttribute('width', track.scrollWidth);
      string.setAttribute('height', track.clientHeight);
      // each stretch of string sags a little between its two pins
      const d = pts.map(([x, y], i) => {
        if (!i) return `M${x} ${y}`;
        const [px, py] = pts[i - 1];
        return `Q${(px + x) / 2} ${Math.max(py, y) + (x - px) * 0.07} ${x} ${y}`;
      }).join(' ');
      string.firstElementChild.setAttribute('d', d);
    };
    const pinRo = new ResizeObserver(placePins);
    pinRo.observe(track);
    cards.forEach((c) => pinRo.observe(c));
    cleanups.push(() => pinRo.disconnect());

    const mm = gsap.matchMedia();
    mm.add('(min-width: 900px) and (hover: hover) and (prefers-reduced-motion: no-preference)', () => {
      evi.classList.add('is-pinned');
      fitBags();
      ScrollTrigger.addEventListener('refreshInit', fitBags);
      gsap.ticker.add(swayTick);
      const dist = () => Math.max(0, track.scrollWidth - innerWidth);
      gsap.to(track, {
        x: () => -dist(),
        ease: 'none',
        scrollTrigger: {
          trigger: evi,
          start: 'top top',
          end: () => `+=${dist()}`,
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
          onUpdate: (s) => { setProg(s.progress); sway = s.getVelocity(); },
        },
      });
      return () => {
        evi.classList.remove('is-pinned', 'is-tight', 'is-tighter');
        track.style.removeProperty('--evw');
        ScrollTrigger.removeEventListener('refreshInit', fitBags);
        gsap.ticker.remove(swayTick);
      };
    });
    cleanups.push(() => mm.revert());
    if (touch || innerWidth < 900) {
      const onTrack = () => setProg(track.scrollLeft / Math.max(1, track.scrollWidth - track.clientWidth));
      track.addEventListener('scroll', onTrack, { passive: true });
    }

    /* lineup: the suspects stand side by side; one steps forward at a time */
    const lu = root.querySelector('[data-lineup]');
    // the moving gradient only starts (and compiles its shader) once the lineup is near the screen
    let stopFlow = () => {};
    const flowIo = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      flowIo.disconnect();
      stopFlow = flow(lu.querySelector('.lineup__flow'), lu);
    }, { rootMargin: '60% 0px' });
    flowIo.observe(lu);
    cleanups.push(() => { flowIo.disconnect(); stopFlow(); });
    const wall = lu.querySelector('[data-wall]');
    cleanups.push(loadAhead(wall, '150% 0px'));
    const strips = [...wall.querySelectorAll('.lus')];
    const lCount = lu.querySelector('[data-l-i]');
    const stacked = () => innerWidth <= 860;
    let lActive = -1;
    let lTimer;
    let hovering = false;
    let lInView = false;
    let started = false;
    let userTook = false;

    const setActive = (i) => {
      if (i === lActive) return;
      lActive = i;
      strips.forEach((s, n) => s.classList.toggle('is-on', n === i));
      lCount.textContent = String(i + 1).padStart(2, '0');
      if (reduced) return;
      const s = strips[i];
      gsap.fromTo(s.querySelector('.lus__flash'), { opacity: 0.75 }, { opacity: 0, duration: 0.7, ease: 'power2.out' });
      gsap.fromTo(s.querySelectorAll('.lus__card > *'), { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', stagger: 0.06, delay: 0.35, overwrite: true });
      gsap.fromTo(lCount, { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.45, ease: 'power3.out' });
    };
    const schedule = () => {
      clearTimeout(lTimer);
      if (hovering || !lInView || !started || reduced || userTook) return;
      lTimer = setTimeout(() => { setActive((lActive + 1) % strips.length); schedule(); }, LINEUP_DUR);
    };
    const pause = (on) => {
      hovering = on;
      wall.classList.toggle('is-paused', on || userTook);
      schedule();
    };

    strips.forEach((s, i) => {
      s.addEventListener('mouseenter', () => { if (!stacked() && !touch) setActive(i); });
      s.addEventListener('click', (e) => {
        if (e.target.closest('a')) return;
        if (touch || stacked()) { userTook = true; wall.classList.add('is-paused'); clearTimeout(lTimer); }
        setActive(i);
      });
      s.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActive(i); } });
    });
    wall.addEventListener('mouseenter', () => !touch && pause(true));
    wall.addEventListener('mouseleave', () => !touch && pause(false));

    const lio = new IntersectionObserver(([e]) => { lInView = e.isIntersecting; schedule(); }, { threshold: 0.35 });
    lio.observe(wall);
    cleanups.push(() => { lio.disconnect(); clearTimeout(lTimer); });

    // entrance: the suspects step in one after another, each with a camera flash, then the first is booked
    if (reduced) { started = true; setActive(0); }
    else {
      gsap.set(strips, stacked() ? { xPercent: -105 } : { yPercent: -105 });
      ScrollTrigger.create({
        trigger: wall,
        start: 'top 72%',
        once: true,
        onEnter: () => {
          gsap.to(strips, { xPercent: 0, yPercent: 0, duration: 1, ease: 'power4.out', stagger: 0.07 });
          strips.forEach((s, n) => gsap.fromTo(s.querySelector('.lus__flash'), { opacity: 0.9 }, { opacity: 0, duration: 0.5, delay: 0.25 + n * 0.07 }));
          gsap.delayedCall(0.95, () => { started = true; setActive(0); schedule(); });
        },
      });
    }

    /* rated: halftone print proof that resolves into the photograph */
    const rated = root.querySelector('[data-rated]');
    const canvas = rated.querySelector('canvas');
    const photo = rated.querySelector('img');
    const ht = halftone(canvas, srcOf('/lineup/5', 800), { color: '#0a0a0b', cell: 7 });
    cleanups.push(() => ht.destroy());
    if (reduced) canvas.style.display = 'none';
    else {
      ScrollTrigger.create({
        trigger: rated,
        start: 'top 85%',
        end: 'center 40%',
        scrub: true,
        onUpdate: ({ progress: p }) => {
          ht.set(Math.min(1, p / 0.72));
          const fade = Math.max(0, Math.min(1, (p - 0.62) / 0.38));
          photo.style.opacity = fade;
          canvas.style.opacity = 1 - fade * fade;
        },
      });
      photo.style.opacity = 0;
    }

    return () => {
      cleanups.forEach((fn) => fn());
      killRail?.();
      killRail = null;
    };
  },
};
