import { gsap, ScrollTrigger, reduced } from '../fx/scroll.js';
import { words } from '../fx/text.js';
import { products, categories } from '../data/products.js';
import { card } from '../components/card.js';

export default {
  title: () => 'Evidence locker',

  render(_, url) {
    const active = url.searchParams.get('cat') || 'all';
    return `
    <div class="page shop t-paper">
      <header class="phead">
        <div class="phead__kick mono"><span>Case 001</span><span>"Scars built this."</span><span>${products.length} exhibits on file</span></div>
        <h1 class="d" data-split>${words('Evidence locker')}</h1>
        <p data-reveal>Limited pieces. No restocks. Every exhibit below is admissible proof that flaws were always the design.</p>
      </header>

      <div class="shop__bar">
        <div class="shop__filters mono" role="tablist" aria-label="Filter by category">
          ${categories.map(([id, label]) => `<button role="tab" data-cat="${id}" aria-selected="${id === active}" class="${id === active ? 'is-on' : ''}">${label}<sup>${id === 'all' ? products.length : products.filter((p) => p.category === id).length}</sup></button>`).join('')}
        </div>
      </div>

      <div class="shop__grid" data-grid>
        ${products.map((p, i) => card(p, { eager: i < 4 })).join('')}
      </div>

      <div class="tape tape--ink" data-shop-tape aria-hidden="true">
        <div class="tape__in">${'<span class="d">No restocks</span><span class="d">No two the same</span>'.repeat(5)}</div>
        <div class="tape__in">${'<span class="d">No restocks</span><span class="d">No two the same</span>'.repeat(5)}</div>
      </div>
    </div>`;
  },

  mount(root, _, url) {
    const grid = root.querySelector('[data-grid]');
    const cards = [...grid.children];
    const buttons = [...root.querySelectorAll('[data-cat]')].filter((b) => b.tagName === 'BUTTON');

    const apply = (cat, animate = true) => {
      buttons.forEach((b) => { const on = b.dataset.cat === cat; b.classList.toggle('is-on', on); b.setAttribute('aria-selected', String(on)); });
      const show = cards.filter((c) => cat === 'all' || c.dataset.cat === cat);
      cards.forEach((c) => { c.hidden = !show.includes(c); });
      if (animate && !reduced) gsap.fromTo(show, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.04, overwrite: true });
      ScrollTrigger.refresh();
    };
    buttons.forEach((b) => b.addEventListener('click', () => {
      apply(b.dataset.cat);
      history.replaceState({}, '', b.dataset.cat === 'all' ? '/shop' : `/shop?cat=${b.dataset.cat}`);
    }));
    apply(url.searchParams.get('cat') || 'all', false);

    if (!reduced) {
      gsap.from(cards.filter((c) => !c.hidden), { opacity: 0, y: 50, duration: 0.9, ease: 'power3.out', stagger: 0.05, delay: 0.25 });
      const ins = root.querySelectorAll('[data-shop-tape] .tape__in');
      gsap.to(ins, { xPercent: -100, duration: 26, ease: 'none', repeat: -1 });
    }
  },
};
