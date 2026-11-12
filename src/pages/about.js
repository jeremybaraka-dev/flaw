import { gsap, reduced } from '../fx/scroll.js';
import { words } from '../fx/text.js';

const STRIP = [9, 2, 7, 1, 3, 10, 5, 8, 6, 4];
const VALUES = [
  ['Authenticity', 'image'],
  ['Self-awareness', 'validation'],
  ['Expression', 'conformity'],
  ['Community', 'exclusivity'],
];

export default {
  title: () => 'About',

  render() {
    return `
    <div class="page about t-ink">
      <header class="phead">
        <div class="phead__kick mono"><span>File 000</span><span>Origin statement</span><span>Kenya · 254</span></div>
        <h1 class="d" data-split>${words("We don't hide flaws.")} <span class="red">${words('We enforce them.')}</span></h1>
      </header>

      <div class="strip" data-strip>
        ${STRIP.map((n) => `<figure><img src="/lineup/${n}.webp" alt="Flaw Enforcement campaign photo" loading="lazy" /></figure>`).join('')}
      </div>

      <section class="about__sec">
        <div class="mono about__n">01 · The brand</div>
        <div>
          <p class="about__lead" data-reveal>Started in Nairobi and built for the whole country, Flaw Enforcement is more than a streetwear label. It is a movement rooted in authenticity, identity and real human experience.</p>
          <p data-reveal>Built on the belief that imperfections are not weaknesses but proof of growth, struggle and individuality, the brand exists to challenge the obsession with perfection and replace it with ownership of who we truly are.</p>
          <p data-reveal>Every scar, mistake, setback and flaw tells a story. We don't hide those stories. We wear them. What others see as imperfections, we turn into power, expression and confidence.</p>
        </div>
      </section>

      <section class="about__sec">
        <div class="mono about__n">02 · What makes it different</div>
        <div>
          <p class="about__lead" data-reveal>We're not just creating clothes. We're creating experiences that bring people together through shared energy and identity.</p>
          <p data-reveal>Fashion drops, creative collaborations, pop-ups, fashion shows, charity initiatives, runs, car meets and cultural events. Everything we do is designed to build connection, rooted in Kenyan creativity, influence and street culture.</p>
          <ul class="about__creed d" data-reveal><li>Own your flaws.</li><li>Embrace your story.</li><li class="red">Wear your truth.</li></ul>
        </div>
      </section>

      <section class="about__sec">
        <div class="mono about__n">03 · What we stand for</div>
        <ul class="about__vals">
          ${VALUES.map(([a, b], i) => `<li data-reveal><span class="mono">0${i + 1}</span><b class="d">${a}</b><i class="mono">over</i><s class="d">${b}</s></li>`).join('')}
        </ul>
      </section>

      <section class="about__sec">
        <div class="mono about__n">04 · The vision</div>
        <div>
          <p class="about__lead" data-reveal>In a generation disconnected from genuine connection and identity, Flaw Enforcement aims to create a sense of belonging through fashion, culture and shared experiences.</p>
          <p data-reveal>Kenya is filled with talent, energy and untold stories, from Nairobi to every one of the 47 counties. Flaw Enforcement exists to represent those stories honestly and unapologetically.</p>
          <a class="btn btn--red" href="/shop" data-reveal>Open the evidence locker <span>→</span></a>
        </div>
      </section>
    </div>`;
  },

  mount(root) {
    if (reduced) return;
    gsap.from(root.querySelectorAll('[data-strip] figure'), { yPercent: 40, opacity: 0, duration: 1, ease: 'power4.out', stagger: 0.05, delay: 0.45 });
  },
};
