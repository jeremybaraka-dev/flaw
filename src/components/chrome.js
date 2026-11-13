// Header, mobile menu and footer.
import { cart } from '../store/cart.js';
import { config, waLink } from '../config.js';
import { gsap, lenis, lockScroll, reduced } from '../fx/scroll.js';
import { openDrawer } from './drawer.js';
import { flow } from '../fx/flow.js';

const NAV = [
  ['/shop', 'Shop'],
  ['/#lineup', 'Lineup'],
  ['/about', 'About'],
  ['/support', 'Support'],
];

const eat = new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Nairobi', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
/** Current East Africa Time, HH:MM:SS */
export const nairobiTime = () => eat.format(new Date());

let revealSync = () => {};
/** Re-measure the footer reveal (call after the page content changes). */
export const syncFooterReveal = () => revealSync();

export function initChrome() {
  const hdr = document.getElementById('header');

  // The logo sits outside the blended header so it keeps its real colours.
  const logo = document.createElement('a');
  logo.className = 'logo-fix';
  logo.href = '/';
  logo.setAttribute('aria-label', 'Flaw Enforcement, home');
  logo.innerHTML = '<img src="/brand/logo.webp" alt="Flaw Enforcement" width="700" height="252" />';
  document.body.appendChild(logo);

  hdr.innerHTML = `
    <nav class="hdr__nav" aria-label="Main">
      ${NAV.map(([href, label], i) => `<a href="${href}" data-nav="${href}"><sup>0${i + 1}</sup>${label}</a>`).join('')}
    </nav>
    <div class="hdr__meta">
      <span class="hdr__clock mono">EAT <span data-clock>${nairobiTime()}</span></span>
      <button class="burger" data-menu aria-expanded="false" aria-label="Open menu"><i></i><i></i></button>
      <button class="hdr__bag" data-bag aria-label="Open evidence bag">Bag <b data-bag-count>0</b></button>
    </div>`;

  const menu = document.createElement('div');
  menu.className = 'menu';
  menu.setAttribute('aria-hidden', 'true');
  menu.innerHTML = `
    <div class="aura" aria-hidden="true"></div>
    <div class="menu__in">
      <div class="menu__top mono"><span>Index</span><span>EAT <span data-mclock>${nairobiTime()}</span></span></div>
      <nav class="menu__links" aria-label="Mobile">
        ${[['/', 'Home'], ...NAV].map(([href, label], i) => `
          <a href="${href}" class="menu__a">
            <span class="menu__n mono">0${i}</span>
            <span class="menu__w d"><span>${label}</span></span>
            <span class="menu__arr" aria-hidden="true">→</span>
          </a>`).join('')}
      </nav>
      <div class="menu__foot">
        <div class="menu__col mono">
          <span class="menu__k">Talk to us</span>
          <a href="${waLink('Hi, I have a question about FLAW ENFORCEMENT.')}" target="_blank" rel="noopener">WhatsApp ↗</a>
          <a href="${config.instagram}" target="_blank" rel="noopener">Instagram ↗</a>
        </div>
        <div class="menu__col mono">
          <span class="menu__k">We accept</span>
          <span class="menu__pay"><b class="paymark paymark--mpesa">M-PESA</b><b class="paymark">CARD</b><b class="paymark">PAYPAL</b></span>
        </div>
        <p class="menu__creed mono">Kenya · countrywide. We don't hide flaws, we enforce them.</p>
      </div>
    </div>`;
  document.body.appendChild(menu);

  const menuBtn = hdr.querySelector('[data-menu]');
  const menuItems = () => [
    ...menu.querySelectorAll('.menu__top, .menu__w > span, .menu__n, .menu__arr, .menu__a, .menu__foot > *'),
  ];
  let menuTl;
  const setMenu = (open) => {
    if (open === menu.classList.contains('is-open')) return;
    menu.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    lockScroll(open);
    menuTl?.kill();
    if (!open || reduced) return;
    gsap.set(menuItems(), { clearProps: 'all' });
    menuTl = gsap.timeline({ delay: 0.18 })
      .from(menu.querySelector('.menu__top'), { opacity: 0, y: -10, duration: 0.5, ease: 'power3.out' })
      .from(menu.querySelectorAll('.menu__w > span'), { yPercent: 110, rotation: 4, duration: 0.8, ease: 'power4.out', stagger: 0.06 }, 0.05)
      .from(menu.querySelectorAll('.menu__a'), { '--line': 0, duration: 0.9, ease: 'power3.inOut', stagger: 0.06 }, 0.1)
      .from(menu.querySelectorAll('.menu__n, .menu__arr'), { opacity: 0, x: -10, duration: 0.5, ease: 'power3.out', stagger: 0.04 }, 0.3)
      .from(menu.querySelectorAll('.menu__foot > *'), { opacity: 0, y: 18, duration: 0.6, ease: 'power3.out', stagger: 0.07 }, 0.45);
  };
  menuBtn.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
  menu.addEventListener('click', (e) => e.target.closest('a') && setMenu(false));
  logo.addEventListener('click', () => setMenu(false));
  addEventListener('keydown', (e) => e.key === 'Escape' && setMenu(false));
  addEventListener('resize', () => innerWidth > 860 && setMenu(false));
  hdr.querySelector('[data-bag]').addEventListener('click', () => { setMenu(false); openDrawer(); });

  const clock = hdr.querySelector('[data-clock]');
  const mclock = menu.querySelector('[data-mclock]');
  setInterval(() => { clock.textContent = mclock.textContent = nairobiTime(); }, 1000);

  const count = hdr.querySelector('[data-bag-count]');
  const bag = hdr.querySelector('[data-bag]');
  const paint = () => {
    count.textContent = cart.count();
    bag.classList.toggle('has-items', cart.count() > 0);
  };
  cart.subscribe(paint);
  paint();

  // footer reveal: on wide screens the footer sits fixed underneath and the page slides off it
  const ftr = document.getElementById('footer');
  const syncReveal = () => {
    document.body.classList.remove('has-reveal');
    const wide = innerWidth >= 900;
    const natural = ftr.offsetHeight;
    const on = !ftr.hidden && !reduced && (wide || natural <= innerHeight);
    document.body.classList.toggle('is-wide-reveal', on && wide);
    const h = on && wide ? innerHeight : natural;
    document.body.classList.toggle('has-reveal', on);
    document.body.style.setProperty('--ftr-h', on ? `${h}px` : '0px');
    paintReveal();
  };
  const paintReveal = () => {
    const h = ftr.offsetHeight || 1;
    const max = document.documentElement.scrollHeight - innerHeight;
    const p = Math.max(0, Math.min(1, 1 - (max - window.scrollY) / h));
    ftr.style.setProperty('--rv', p.toFixed(3));
  };
  revealSync = syncReveal;
  new ResizeObserver(syncReveal).observe(ftr);
  addEventListener('resize', syncReveal);

  // hide on scroll down, show on scroll up
  lenis.on('scroll', ({ scroll, direction }) => {
    paintReveal();
    const hide = direction === 1 && scroll > 400 && !menu.classList.contains('is-open');
    hdr.classList.toggle('is-hidden', hide);
    logo.classList.toggle('is-hidden', hide);
  });

  // the wordmark, one letter at a time: F + ENFORCEMENT solid, LAW hollow (LAW becomes FLAW)
  let gi = 0;
  const glyphs = (word, hollow = '') => `<span>${word.split('').map((c) => `<b style="--i:${gi++}"${hollow.includes(c) ? ' class="is-hollow"' : ''}>${c}</b>`).join('')}</span>`;

  ftr.innerHTML = `
    <canvas class="ftr__glow" aria-hidden="true"></canvas>
    <div class="ftr__fire" aria-hidden="true">
      <svg class="ftr__sky" viewBox="0 0 1440 240" preserveAspectRatio="none">
        <defs><mask id="ftrFlames"><rect width="1440" height="240" fill="#fff" /><path d="M0 240 L0 236 C6 183.5 45.6 153.5 74 86 C72 138.5 117.6 191 120 236 C127.5 164.25 177 123.25 213 31 C210 102.75 267 174.5 270 236 C276 194 315.6 170 344 116 C342 158 387.6 200 390 236 C398.5 157.25 454.6 112.25 495 11 C492 89.75 556.6 168.5 560 236 C565.5 187 601.8 159 628 96 C626 145 667.8 194 670 236 C681.5 202.75 757.4 183.75 813 141 C808 174.25 895.4 207.5 900 236 C905.5 187 941.8 159 968 96 C966 145 1007.8 194 1010 236 C1018.5 157.25 1074.6 112.25 1115 11 C1112 89.75 1176.6 168.5 1180 236 C1186 194 1225.6 170 1254 116 C1252 158 1297.6 200 1300 236 C1307 166 1353.2 126 1387 36 C1384 106 1437.2 176 1440 236 L1440 236 L1440 240 Z" fill="#000" /></mask></defs>
        <g mask="url(#ftrFlames)">
          <rect width="1440" height="240" fill="#0a0a0b" />
          <g class="ftr__siren" fill="none" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" transform="translate(720 0)">
            <path class="ftr__dome" d="M-78 205 V128 C-78 78 -44 52 0 52 C44 52 78 78 78 128 V205" />
            <path d="M-104 205 H104 V232 H-104 Z" />
            <path class="ftr__shine" d="M-40 120 C-40 96 -26 82 -6 78" />
            <path class="ftr__ray" d="M0 30 V4 M-62 44 L-80 22 M62 44 L80 22 M-104 92 L-132 80 M104 92 L132 80" />
          </g>
        </g>
      </svg>
    </div>
    <div class="ftr__badge" aria-hidden="true">
      <i class="ftr__strap"></i><i class="ftr__clip"></i>
      <div class="ftr__card">
        <div class="ftr__card-top mono"><b>FE</b><span>Case 001 · Pass</span></div>
        <img src="/lineup/2-480.webp" alt="" loading="lazy" />
        <div class="ftr__card-bot mono"><span>Suspect №047</span><span>Kenya · 254</span></div>
      </div>
    </div>
    <div class="ftr__body">
      <nav class="ftr__nav" aria-label="Footer">
        <h4>Navigation</h4>
        <a class="ftr__a" href="/shop">Shop all</a>
        <a class="ftr__a" href="/#lineup">The lineup</a>
        <a class="ftr__a" href="/about">About</a>
        <a class="ftr__a" href="/support">Support and FAQ</a>
      </nav>
      <div class="ftr__mid">
        <h4 class="ftr__say">Got flaws?</h4>
        <p>Orders, sizes, collabs. Talk to us.</p>
        <a class="ftr__pill" href="${waLink('Hi, I would like to place an order from FLAW ENFORCEMENT.')}" target="_blank" rel="noopener">Order on WhatsApp</a>
        <a class="ftr__pill ftr__pill--ghost" href="/shop">Open the locker →</a>
      </div>
      <div class="ftr__side">
        <div class="ftr__socials">
          <a href="${config.instagram}" target="_blank" rel="noopener" aria-label="Instagram"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2.2"/><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="2.2"/><circle cx="17.4" cy="6.6" r="1.4"/></svg></a>
          <a href="https://www.tiktok.com/@flawenforcement" target="_blank" rel="noopener" aria-label="TikTok"><svg viewBox="0 0 24 24"><path d="M14 3h3c.3 2.2 1.7 3.6 4 3.8v3.1c-1.5 0-2.9-.4-4-1.2V15a6 6 0 1 1-6-6v3.2a2.9 2.9 0 1 0 3 2.8V3z"/></svg></a>
          <a href="${waLink('Hi FLAW ENFORCEMENT!')}" target="_blank" rel="noopener" aria-label="WhatsApp"><svg viewBox="0 0 24 24"><path d="M12 2.5A9.5 9.5 0 0 0 3.8 16.8L2.6 21.4l4.7-1.2A9.5 9.5 0 1 0 12 2.5zm5.3 13.4c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.5-3.9-4.7-4.1-.1-.2-1.1-1.5-1.1-2.8 0-1.4.7-2 1-2.3.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .6l-.4.6-.4.4c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.7-.1l1.9.9c.3.1.5.2.5.4.1.1.1.7-.1 1.2z"/></svg></a>
        </div>
        <p class="ftr__copy">© ${new Date().getFullYear()} Flaw Enforcement™</p>
        <div class="ftr__pay mono"><span>M-PESA</span><span>PAYPAL</span><span>VISA</span><span>MASTERCARD</span></div>
      </div>
    </div>
    <div class="ftr__giant d" aria-hidden="true">${glyphs('FLAW', 'LAW')}${glyphs('ENFORCEMENT')}</div>
    <div class="ftr__bar mono">
      <span>All flaws reserved · Kenya, countrywide · EAT <span data-fclock>${nairobiTime()}</span></span>
      <button class="ftr__up" type="button" data-top>Back to the top <i aria-hidden="true">↑</i></button>
    </div>`;
  ftr.querySelector('[data-top]').addEventListener('click', () => lenis.scrollTo(0, { duration: reduced ? 0 : 1.6 }));
  // red light drifting behind the footer and through the flames, bending around the pointer
  flow(ftr.querySelector('.ftr__glow'), ftr, { mode: 'glow', colors: ['#2a0204', '#6e0910', '#b8141b', '#e8222c', '#ff7a80'], visible: () => !document.body.classList.contains('has-reveal') || parseFloat(ftr.style.getPropertyValue('--rv')) > 0.01 });
  const fclock = ftr.querySelector('[data-fclock]');
  setInterval(() => { fclock.textContent = nairobiTime(); }, 1000);
}

export function setActiveNav(path) {
  document.querySelectorAll('[data-nav]').forEach((a) => {
    const href = a.dataset.nav;
    a.classList.toggle('is-active', href === path || (href === '/shop' && path.startsWith('/product')));
  });
}
