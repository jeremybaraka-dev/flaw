// Checkout: contact + delivery, then M-Pesa (STK push) or card / PayPal. Ends with a printed receipt.
import { gsap, reduced } from '../fx/scroll.js';
import { esc } from '../fx/text.js';
import { byHandle } from '../data/products.js';
import { DELIVERY, priceCart, kes } from '../data/pricing.js';
import { cart, lineImage } from '../store/cart.js';
import { srcOf } from '../img.js';
import { config, waLink } from '../config.js';
import { toast } from '../components/drawer.js';

const toUsd = (n) => (n / config.paypal.kesPerUsd).toFixed(2);
const makeRef = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `FE-${pad(d.getFullYear() % 100)}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
};
const localPhone = (v) => {
  const d = String(v).replace(/\D/g, '');
  const n = d.startsWith('254') ? d.slice(3) : d.startsWith('0') ? d.slice(1) : d;
  return /^[17]\d{8}$/.test(n) ? n : null;
};
const mask = (n) => `0${n.slice(0, 2)}• •••${n.slice(-3)}`;

let paypalLoading;
function loadPayPal() {
  if (window.paypal) return Promise.resolve(window.paypal);
  if (paypalLoading) return paypalLoading;
  paypalLoading = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    const q = new URLSearchParams({ 'client-id': config.paypal.clientId, currency: config.paypal.currency, intent: 'capture', components: 'buttons', 'enable-funding': 'card', 'disable-funding': 'paylater,venmo' });
    s.src = `https://www.paypal.com/sdk/js?${q}`;
    s.onload = () => (window.paypal ? resolve(window.paypal) : reject(new Error('PayPal unavailable')));
    s.onerror = () => { paypalLoading = null; s.remove(); reject(new Error('PayPal failed to load')); };
    document.head.appendChild(s);
  });
  return paypalLoading;
}

const summary = (deliveryId) => {
  const { lines, subtotal, delivery, total } = priceCart(cart.items, deliveryId);
  return `
    <div class="co__lines">
      ${cart.items.map((it) => {
        const p = byHandle[it.handle];
        return `<div class="co__line"><div class="co__thumb"><img src="${srcOf(lineImage(it), 360)}" alt="" decoding="async" /><b>${it.qty}</b></div><div><div class="c">${esc(p.title)}</div><div class="mono">${esc(it.variant)} / ${esc(it.size)}</div></div><div class="co__amt">${kes(p.price * it.qty)}</div></div>`;
      }).join('')}
    </div>
    <dl class="co__totals">
      <div><dt>Subtotal</dt><dd>${kes(subtotal)}</dd></div>
      <div><dt>Delivery · ${delivery.label}</dt><dd>${delivery.fee ? kes(delivery.fee) : 'Free'}</dd></div>
      <div class="co__total"><dt>Total</dt><dd><b>${kes(total)}</b><span class="mono">approx. $${toUsd(total)} USD</span></dd></div>
    </dl>
    <p class="mono co__count">${lines.reduce((n, l) => n + l.qty, 0)} item(s) in evidence</p>`;
};

const barcode = (seed) => {
  let out = '';
  for (let i = 0; i < 46; i++) out += `<i style="width:${1 + ((seed.charCodeAt(i % seed.length) * (i + 3)) % 4)}px"></i>`;
  return out;
};

function receipt(order) {
  const date = new Date(order.at).toLocaleString('en-GB', { timeZone: 'Africa/Nairobi', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  return `
    <div class="done">
      <div class="done__head">
        <div class="mono red">Payment received${order.test ? ' · test mode' : ''}</div>
        <h1 class="d">Case closed.</h1>
        <p>Thank you, ${esc(order.name.split(' ')[0])}. Your order is booked. Send the receipt to our WhatsApp so we can confirm delivery with you directly.</p>
        <div class="done__actions">
          <a class="btn btn--red" target="_blank" rel="noopener" href="${esc(order.wa)}">Send receipt on WhatsApp ↗</a>
          <a class="btn btn--ghost" href="/shop">Back to the locker</a>
        </div>
        ${order.test ? '<p class="mono done__test">Test mode: live payment keys are not installed yet, so no money moved.</p>' : ''}
      </div>
      <div class="term" data-term>
        <div class="term__card">
          <div class="term__top mono">
            <span class="term__logo"><img src="/brand/logo.webp" alt="" /></span>
            <button type="button" class="term__replay" data-replay aria-label="Print the receipt again">↻ Reprint</button>
          </div>
          <div class="term__row">
            <div>
              <b class="term__t">${order.lines.length === 1 ? esc(order.lines[0].title) : `${order.lines.reduce((n, l) => n + l.qty, 0)} pieces`}</b>
              <span class="term__s mono">Flaw Enforcement · ${esc(order.method)}</span>
            </div>
            <div class="term__amt"><span class="mono">Total</span><b>${kes(order.total)}</b></div>
          </div>
          <div class="term__status mono" data-status>
            <i class="term__spin"></i><i class="term__ok">✓</i><span data-status-t>Confirming payment</span>
          </div>
          <div class="term__slot"></div>
        </div>
        <div class="term__clip">
          <div class="rcpt" data-rcpt>
            <img src="/brand/logo.webp" alt="Flaw Enforcement" />
            <div class="rcpt__c mono">Flaw Enforcement · Kenya<br />Countrywide delivery</div>
            <div class="rcpt__rule"></div>
            <div class="rcpt__row mono"><span>Ref</span><b>${order.ref}</b></div>
            <div class="rcpt__row mono"><span>Date</span><b>${date} EAT</b></div>
            <div class="rcpt__row mono"><span>Paid via</span><b>${esc(order.method)}</b></div>
            ${order.txn ? `<div class="rcpt__row mono"><span>Txn</span><b>${esc(order.txn)}</b></div>` : ''}
            <div class="rcpt__rule"></div>
            ${order.lines.map((l) => `<div class="rcpt__row mono"><span>${l.qty} × ${esc(l.title)}<small>${esc(l.variant)} / ${esc(l.size)}</small></span><b>${kes(l.total)}</b></div>`).join('')}
            <div class="rcpt__rule"></div>
            <div class="rcpt__row mono"><span>Subtotal</span><b>${kes(order.subtotal)}</b></div>
            <div class="rcpt__row mono"><span>Delivery (${esc(order.delivery.label)})</span><b>${order.delivery.fee ? kes(order.delivery.fee) : 'Free'}</b></div>
            <div class="rcpt__row rcpt__total"><span class="c">Total</span><b class="c">${kes(order.total)}</b></div>
            <div class="rcpt__rule"></div>
            <div class="rcpt__stamp stamp">Enforced</div>
            <div class="rcpt__bars">${barcode(order.ref)}</div>
            <div class="rcpt__c mono">${order.ref}<br />We don't hide flaws. We enforce them.</div>
          </div>
        </div>
      </div>
    </div>`;
}

export default {
  title: () => 'Checkout',
  bare: false,

  render() {
    if (!cart.items.length) {
      return `
      <div class="page co t-paper co--empty">
        <div class="mono">Checkout</div>
        <h1 class="d">Nothing<br />on you.</h1>
        <p>Your evidence bag is empty. Go pick something up.</p>
        <a class="btn btn--ink" href="/shop">Open the evidence locker <span>→</span></a>
      </div>`;
    }
    const sandbox = config.paypal.clientId === 'test';
    return `
    <div class="page co t-paper" data-co>
      <header class="co__head">
        <h1 class="d">Checkout</h1>
        <ol class="co__steps mono"><li class="is-on">01 Details</li><li class="is-on">02 Payment</li><li>03 Case closed</li></ol>
      </header>

      <div class="co__grid">
        <form class="co__form" data-form novalidate>
          <section class="co__sec">
            <h2 class="c"><span class="mono">01</span>Who is it for</h2>
            <div class="co__fields">
              <label class="fld"><span class="mono">Full name</span><input name="name" autocomplete="name" required maxlength="80" /></label>
              <label class="fld"><span class="mono">Phone (WhatsApp)</span><input name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="07XX XXX XXX" required maxlength="20" /></label>
              <label class="fld fld--wide"><span class="mono">Email, for your receipt (optional)</span><input name="email" type="email" autocomplete="email" maxlength="120" /></label>
            </div>
          </section>

          <section class="co__sec">
            <h2 class="c"><span class="mono">02</span>Where is it going</h2>
            <div class="co__ship" role="radiogroup" aria-label="Delivery">
              ${DELIVERY.map((d, i) => `
                <label class="opt"><input type="radio" name="delivery" value="${d.id}" ${i ? '' : 'checked'} /><span class="opt__box"><b>${d.label}</b><small class="mono">${d.note}</small><em>${d.fee ? kes(d.fee) : 'Free'}</em></span></label>`).join('')}
            </div>
            <label class="fld fld--wide" data-addr><span class="mono">Delivery address, estate / building / landmark</span><textarea name="address" rows="2" autocomplete="street-address" maxlength="300" required></textarea></label>
          </section>

          <section class="co__sec">
            <h2 class="c"><span class="mono">03</span>Payment</h2>
            <div class="pay__tabs" role="tablist">
              <button type="button" role="tab" class="is-on" data-tab="mpesa" aria-selected="true"><b class="pay__mark pay__mark--mpesa">M-PESA</b><span class="mono">Pay from your phone</span></button>
              <button type="button" role="tab" data-tab="paypal" aria-selected="false"><b class="pay__mark">CARD / PAYPAL</b><span class="mono">Visa, Mastercard, PayPal</span></button>
            </div>

            <div class="pay__panel" data-panel="mpesa">
              <div class="mp" data-mp="idle">
                <div class="mp__idle">
                  <label class="fld"><span class="mono">M-Pesa number to charge</span>
                    <div class="mp__num"><i class="mono">+254</i><input name="mpesa" type="tel" inputmode="numeric" placeholder="7XX XXX XXX" maxlength="14" /></div>
                  </label>
                  <button type="button" class="btn btn--mpesa btn--wide" data-mp-pay>Pay <span data-total></span> with M-Pesa</button>
                  <p class="mono pay__fine">You will get a prompt on your phone. Enter your M-Pesa PIN to approve. We never see your PIN.</p>
                </div>
                <div class="mp__wait" aria-live="polite">
                  <div class="mp__phone" aria-hidden="true"><i></i><i></i><i></i><span class="mono">M-PESA</span></div>
                  <div>
                    <b class="c" data-mp-title>Check your phone</b>
                    <p data-mp-text>We have sent a payment request. Enter your M-Pesa PIN to approve it.</p>
                    <div class="mp__bar"><i></i></div>
                    <button type="button" class="mono link" data-mp-cancel>Cancel and start again</button>
                  </div>
                </div>
                <div class="mp__fail" aria-live="assertive">
                  <b class="c">Payment not completed</b>
                  <p data-mp-err></p>
                  <button type="button" class="btn btn--ink" data-mp-retry>Try again</button>
                </div>
              </div>
              <p class="mono pay__test" data-mp-test hidden>Test mode: M-Pesa keys are not installed yet, so this payment is simulated and no money moves.</p>
              ${config.mpesa.till ? `<p class="pay__till mono">Prefer to pay manually? Lipa na M-Pesa → Buy Goods → Till <b>${esc(config.mpesa.till)}</b> (${esc(config.mpesa.tillName)}), then send us the code on WhatsApp.</p>` : ''}
            </div>

            <div class="pay__panel" data-panel="paypal" hidden>
              <p class="pay__usd">Cards and PayPal are charged in US dollars: <b>$<span data-usd></span> USD</b> <span class="mono">(<span data-total></span> at KSh ${config.paypal.kesPerUsd} / $1)</span></p>
              <div class="pp" data-pp><div class="pp__load mono">Loading secure payment…</div></div>
              <p class="mono pay__fine">Card details go straight to PayPal over an encrypted connection. They never touch this site.</p>
              ${sandbox ? '<p class="mono pay__test">Sandbox mode: the live PayPal Client ID is not installed yet, so no real charge is made.</p>' : ''}
            </div>
          </section>
        </form>

        <aside class="co__sum">
          <div class="co__sumin">
            <h2 class="c">Evidence bag</h2>
            <div data-sum></div>
            <ul class="co__trust mono">
              <li>Secure payment · M-Pesa, Visa, Mastercard, PayPal</li>
              <li>Questions? <a class="link" target="_blank" rel="noopener" href="${waLink('Hi, I need help with my FLAW ENFORCEMENT checkout.')}">WhatsApp us ↗</a></li>
            </ul>
          </div>
        </aside>
      </div>
    </div>`;
  },

  mount(root) {
    const form = root.querySelector('[data-form]');
    if (!form) return;
    const ref = makeRef();
    const sumEl = root.querySelector('[data-sum]');
    const addr = root.querySelector('[data-addr]');
    const mp = root.querySelector('[data-mp]');
    let mpMode = 'demo'; // demo | live
    let pollTimer;
    let alive = true;
    let finished = false;

    const delivery = () => form.delivery.value;
    const totals = () => priceCart(cart.items, delivery());

    const paint = () => {
      const t = totals();
      sumEl.innerHTML = summary(delivery());
      root.querySelectorAll('[data-total]').forEach((el) => { el.textContent = kes(t.total); });
      root.querySelectorAll('[data-usd]').forEach((el) => { el.textContent = toUsd(t.total); });
      addr.hidden = delivery() === 'pickup';
    };
    paint();
    form.addEventListener('change', paint);
    const unsub = cart.subscribe(() => { if (alive && !finished && cart.items.length) paint(); });

    // copy the contact phone into the M-Pesa field until the customer edits it
    let mpesaTouched = false;
    form.mpesa.addEventListener('input', () => { mpesaTouched = true; });
    form.phone.addEventListener('input', () => { if (!mpesaTouched) { const n = localPhone(form.phone.value); form.mpesa.value = n || ''; } });

    const flag = (input, bad) => input.closest('.fld')?.classList.toggle('is-bad', bad);
    const validate = () => {
      const checks = [
        [form.name, form.name.value.trim().length < 2, 'Add your full name'],
        [form.phone, form.phone.value.replace(/\D/g, '').length < 9, 'Add a phone number we can reach you on'],
        [form.email, !!form.email.value && !/^\S+@\S+\.\S+$/.test(form.email.value), 'That email does not look right'],
        [form.address, delivery() !== 'pickup' && form.address.value.trim().length < 5, 'Add a delivery address'],
      ];
      let first;
      for (const [input, bad, msg] of checks) {
        flag(input, bad);
        if (bad && !first) first = [input, msg];
      }
      if (first) {
        toast(first[1]);
        first[0].focus({ preventScroll: true });
        first[0].scrollIntoView({ block: 'center', behavior: 'smooth' });
        return false;
      }
      return true;
    };
    form.addEventListener('input', (e) => flag(e.target, false));
    form.addEventListener('submit', (e) => e.preventDefault());

    /* ── finish: build the order, clear the bag, print the receipt ── */
    const finish = ({ method, txn = '', test = false }) => {
      if (finished) return;
      finished = true;
      const t = totals();
      const order = {
        ref, at: Date.now(), method, txn, test,
        name: form.name.value.trim(), phone: form.phone.value.trim(), email: form.email.value.trim(),
        address: delivery() === 'pickup' ? 'Pick-up' : form.address.value.trim(),
        lines: t.lines, subtotal: t.subtotal, delivery: t.delivery, total: t.total,
      };
      order.wa = waLink([
        `ORDER ${order.ref}${test ? ' (TEST)' : ''}`,
        `Name: ${order.name}`,
        `Phone: ${order.phone}`,
        `Delivery: ${order.delivery.label} / ${order.address}`,
        '',
        ...order.lines.map((l) => `${l.qty} x ${l.title} (${l.variant}, ${l.size}) ${kes(l.total)}`),
        '',
        `Total: ${kes(order.total)}`,
        `Paid via: ${method}${txn ? ` (${txn})` : ''}`,
      ].join('\n'));
      try { localStorage.setItem('fe_last_order', JSON.stringify(order)); } catch { /* ignore */ }
      cart.clear();

      const shell = root.querySelector('[data-co]');
      shell.innerHTML = receipt(order);
      shell.classList.add('co--done');
      window.scrollTo(0, 0);
      const term = shell.querySelector('[data-term]');
      const paper = term.querySelector('[data-rcpt]');
      const status = term.querySelector('[data-status]');
      const statusT = term.querySelector('[data-status-t]');
      const setStatus = (text, state) => { statusT.textContent = text; status.dataset.state = state || ''; };
      // Payment terminal: confirming, printing, then the receipt slides out from under the card.
      let printTl;
      const print = () => {
        printTl?.kill();
        if (reduced) { setStatus('Order enforced', 'ok'); gsap.set(paper, { yPercent: 0 }); return; }
        setStatus('Confirming payment', 'busy');
        gsap.set(paper, { yPercent: -101 });
        gsap.set(term.querySelector('.rcpt__stamp'), { opacity: 0, scale: 3, rotation: -24 });
        printTl = gsap.timeline({ delay: 0.5 })
          .add(() => setStatus('Printing your receipt', 'busy'), 1.1)
          .to(paper, { yPercent: -78, duration: 0.5, ease: 'power2.out' }, 1.25)
          .to(paper, { yPercent: 0, duration: 1.9, ease: 'power3.inOut' }, 1.85)
          .add(() => setStatus('Order enforced', 'ok'), 3.6)
          .to(term.querySelector('.rcpt__stamp'), { opacity: 1, scale: 1, rotation: -10, duration: 0.3, ease: 'power4.in' }, 3.75)
          .fromTo(paper, { rotation: 0 }, { rotation: 0.6, duration: 0.6, ease: 'elastic.out(1.2, 0.3)' }, 4.05);
      };
      print();
      term.querySelector('[data-replay]').addEventListener('click', print);
      if (!reduced) gsap.from(shell.querySelectorAll('.done__head > *'), { opacity: 0, y: 24, duration: 0.8, stagger: 0.07, ease: 'power3.out', delay: 0.2 });
    };

    /* ── tabs ── */
    let ppRendered = false;
    const tabs = [...root.querySelectorAll('[data-tab]')];
    const showTab = (name) => {
      tabs.forEach((b) => { const on = b.dataset.tab === name; b.classList.toggle('is-on', on); b.setAttribute('aria-selected', String(on)); });
      root.querySelectorAll('[data-panel]').forEach((p) => { p.hidden = p.dataset.panel !== name; });
      if (name === 'paypal' && !ppRendered) renderPayPal();
    };
    tabs.forEach((b) => b.addEventListener('click', () => showTab(b.dataset.tab)));

    /* ── M-Pesa ── */
    fetch('/api/mpesa/config').then((r) => (r.ok ? r.json() : null)).then((c) => { mpMode = c?.configured ? 'live' : 'demo'; }).catch(() => { mpMode = 'demo'; })
      .finally(() => { if (alive) root.querySelector('[data-mp-test]').hidden = mpMode === 'live'; });

    const mpState = (s) => { mp.dataset.mp = s; };
    const mpFail = (msg) => { clearTimeout(pollTimer); root.querySelector('[data-mp-err]').textContent = msg; mpState('fail'); };
    const post = (url, body) => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(async (r) => ({ ok: r.ok, data: await r.json().catch(() => ({})) }));

    root.querySelector('[data-mp-pay]').addEventListener('click', async () => {
      if (!validate()) return;
      const n = localPhone(form.mpesa.value);
      flag(form.mpesa, !n);
      if (!n) { toast('Enter a valid Safaricom number'); form.mpesa.focus(); return; }
      root.querySelector('[data-mp-text]').textContent = `We have sent a payment request for ${kes(totals().total)} to ${mask(n)}. Enter your M-Pesa PIN to approve it.`;
      mpState('wait');

      if (mpMode === 'demo') {
        pollTimer = setTimeout(() => alive && finish({ method: 'M-Pesa', txn: 'SIMULATED', test: true }), 5200);
        return;
      }
      try {
        const push = await post('/api/mpesa/stkpush', { phone: `254${n}`, items: cart.items, delivery: delivery(), reference: ref });
        if (!push.ok) return mpFail(push.data.error || 'M-Pesa did not accept the request. Try again.');
        const started = Date.now();
        const poll = async () => {
          if (!alive || mp.dataset.mp !== 'wait') return;
          if (Date.now() - started > 100000) return mpFail('We did not get a confirmation in time. If you were charged, message us on WhatsApp with your M-Pesa code.');
          const s = await post('/api/mpesa/status', { checkoutRequestId: push.data.checkoutRequestId }).catch(() => null);
          if (s?.data.status === 'paid') return finish({ method: 'M-Pesa', txn: push.data.checkoutRequestId.slice(-10) });
          if (s?.data.status === 'failed') return mpFail(s.data.message);
          pollTimer = setTimeout(poll, 3500);
        };
        pollTimer = setTimeout(poll, 5000);
      } catch {
        mpFail('Could not reach M-Pesa. Check your connection and try again.');
      }
    });
    root.querySelector('[data-mp-cancel]').addEventListener('click', () => { clearTimeout(pollTimer); mpState('idle'); });
    root.querySelector('[data-mp-retry]').addEventListener('click', () => mpState('idle'));

    /* ── PayPal / card ── */
    async function renderPayPal() {
      ppRendered = true;
      const box = root.querySelector('[data-pp]');
      try {
        const paypal = await loadPayPal();
        if (!alive) return;
        box.innerHTML = '';
        await paypal.Buttons({
          style: { layout: 'vertical', color: 'black', shape: 'rect', label: 'pay', height: 52 },
          onClick: (_, actions) => (validate() ? actions.resolve() : actions.reject()),
          createOrder: (_, actions) => actions.order.create({
            intent: 'CAPTURE',
            purchase_units: [{ reference_id: ref, description: `Flaw Enforcement order ${ref}`, amount: { currency_code: config.paypal.currency, value: toUsd(totals().total) } }],
            application_context: { brand_name: 'Flaw Enforcement', shipping_preference: 'NO_SHIPPING' },
          }),
          onApprove: async (_, actions) => {
            const details = await actions.order.capture();
            finish({ method: 'Card / PayPal', txn: details.id, test: config.paypal.clientId === 'test' });
          },
          onCancel: () => toast('Payment cancelled. Nothing was charged.'),
          onError: () => toast('Payment did not go through. Try again or use M-Pesa.'),
        }).render(box);
      } catch {
        ppRendered = false;
        box.innerHTML = '<div class="pp__load mono">Could not load card payments. Check your connection, or pay with M-Pesa.<br /><button type="button" class="link" data-pp-retry>Retry</button></div>';
        box.querySelector('[data-pp-retry]').addEventListener('click', renderPayPal);
      }
    }

    return () => { alive = false; clearTimeout(pollTimer); unsub(); };
  },
};
