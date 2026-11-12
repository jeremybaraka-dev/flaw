// Header, mobile menu and footer.
import { cart } from '../store/cart.js';
import { config, waLink } from '../config.js';
import { gsap, lenis, lockScroll, reduced } from '../fx/scroll.js';
import { openDrawer } from './drawer.js';

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
    const h = ftr.offsetHeight;
    const on = !ftr.hidden && innerWidth >= 900 && h < innerHeight - 80 && !reduced;
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
    <div class="ftr__lights" aria-hidden="true"><i></i><i></i></div>
    <div class="ftr__status mono">
      <span><b class="ftr__dot"></b>Case 001 · Still open</span>
      <span>Dispatching across Kenya · all 47 counties</span>
      <span>EAT <span data-fclock>${nairobiTime()}</span></span>
    </div>
    <div class="ftr__lead">
      <p class="ftr__creed d"><span>We don't hide flaws.</span> <span class="red">We enforce them.</span></p>
      <div class="ftr__cta">
        <a class="btn btn--red" href="/shop">Open the locker <span>→</span></a>
        <a class="btn btn--ghost" href="${waLink('Hi, I would like to place an order from FLAW ENFORCEMENT.')}" target="_blank" rel="noopener">Order on WhatsApp ↗</a>
      </div>
    </div>
    <div class="ftr__top">
      <div class="ftr__col">
        <h4>Files</h4>
        <ul>
          <li><a class="ftr__a" href="/shop">Shop all</a></li>
          <li><a class="ftr__a" href="/#lineup">The lineup</a></li>
          <li><a class="ftr__a" href="/about">About</a></li>
          <li><a class="ftr__a" href="/support">Support and FAQ</a></li>
        </ul>
      </div>
      <div class="ftr__col">
        <h4>Contact</h4>
        <ul>
          <li><a class="ftr__a" href="${config.instagram}" target="_blank" rel="noopener">Instagram ↗</a></li>
          <li><a class="ftr__a" href="${waLink('Hi, I have a question about FLAW ENFORCEMENT.')}" target="_blank" rel="noopener">WhatsApp ↗</a></li>
          <li><span>Kenya, countrywide</span></li>
        </ul>
      </div>
      <div class="ftr__col">
        <h4>The rules</h4>
        <ul>
          <li><span>Limited pieces</span></li>
          <li><span>No restocks, ever</span></li>
          <li><span>No two the same</span></li>
        </ul>
      </div>
      <div class="ftr__col ftr__col--wide">
        <h4>We accept</h4>
        <div class="ftr__pay">
          <span class="paymark paymark--mpesa">M-PESA</span>
          <span class="paymark">PAYPAL</span>
          <span class="paymark">VISA</span>
          <span class="paymark">MASTERCARD</span>
        </div>
        <p class="ftr__fine mono">Prices in KSh. Secure checkout.</p>
      </div>
    </div>
    <div class="ftr__giant d" aria-hidden="true">${glyphs('FLAW', 'LAW')}${glyphs('ENFORCEMENT')}</div>
    <div class="ftr__bar mono">
      <span>© ${new Date().getFullYear()} Flaw Enforcement™. All flaws reserved.</span>
      <span>Case 001: "Scars built this."</span>
      <button class="ftr__up" type="button" data-top>Back to the top <i aria-hidden="true">↑</i></button>
    </div>`;
  ftr.querySelector('[data-top]').addEventListener('click', () => lenis.scrollTo(0, { duration: reduced ? 0 : 1.6 }));
  const fclock = ftr.querySelector('[data-fclock]');
  setInterval(() => { fclock.textContent = nairobiTime(); }, 1000);
}

export function setActiveNav(path) {
  document.querySelectorAll('[data-nav]').forEach((a) => {
    const href = a.dataset.nav;
    a.classList.toggle('is-active', href === path || (href === '/shop' && path.startsWith('/product')));
  });
}
