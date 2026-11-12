import { words } from '../fx/text.js';
import { config, waLink } from '../config.js';

const FAQ = [
  ['What countries do you ship to?', 'We deliver countrywide, anywhere in Kenya, and to select international destinations. Delivery is worked out at checkout.'],
  ['How long does delivery take?', 'Orders within Kenya take 3 to 7 business days, and Nairobi orders usually land in 1 to 2. International orders take 7 to 21 business days depending on where you are.'],
  ['How can I pay?', 'M-Pesa (you get a prompt on your phone and approve with your PIN), or any Visa / Mastercard and PayPal. Card and PayPal payments are charged in US dollars.'],
  ['Is paying here safe?', 'Yes. M-Pesa payments are approved on your own phone and we never see your PIN. Card details go straight to PayPal over an encrypted connection and never touch this site.'],
  ['How can I track my order?', 'Once your order ships we send you a tracking update on WhatsApp or email.'],
  ['What is your return and refund policy?', 'We accept returns within a set period of you receiving your order, as long as the piece is unworn. Message us and we will walk you through it.'],
  ['Will sold-out pieces come back?', 'No. Limited pieces, no restocks. When a case closes, it stays closed.'],
  ['How do I cancel or change my order?', 'Message us as soon as possible. Once an order has been processed or shipped, changes may not be possible.'],
];

export default {
  title: () => 'Support',

  render() {
    return `
    <div class="page sup t-paper">
      <header class="phead">
        <div class="phead__kick mono"><span>Help desk</span><span>Open case</span></div>
        <h1 class="d" data-split>${words('Support')}</h1>
        <p data-reveal>Questions, sizing, an order gone quiet. Start here, or go straight to a human.</p>
      </header>

      <div class="sup__grid">
        <div class="acc acc--lg">
          ${FAQ.map(([q, a], i) => `<details ${i ? '' : 'open'} data-reveal><summary class="c"><span class="mono">Q${String(i + 1).padStart(2, '0')}</span>${q}</summary><p>${a}</p></details>`).join('')}
        </div>
        <aside class="sup__side">
          <a class="sup__card" target="_blank" rel="noopener" href="${waLink('Hi, I have a question about FLAW ENFORCEMENT.')}" data-cursor="CHAT" data-reveal>
            <span class="mono">Fastest</span><b class="d">WhatsApp</b><span class="mono">Order, sizing and delivery ↗</span>
          </a>
          <a class="sup__card sup__card--ink" target="_blank" rel="noopener" href="${config.instagram}" data-cursor="DM" data-reveal>
            <span class="mono">DMs open</span><b class="d">Instagram</b><span class="mono">@flawenforcement ↗</span>
          </a>
          <div class="sup__note mono" data-reveal>We aim to reply within 1 to 2 business days. East Africa Time.</div>
        </aside>
      </div>
    </div>`;
  },
};
