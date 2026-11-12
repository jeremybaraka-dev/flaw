import { configured, normalisePhone, stkPush } from '../_daraja.js';
import { priceCart } from '../../src/data/pricing.js';

// POST { phone, items:[{handle,qty,variant,size}], delivery, reference }
// Sends the "enter your PIN" prompt to the customer's phone.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  if (!configured()) return res.status(503).json({ error: 'M-Pesa is not configured yet' });

  const { phone, items, delivery, reference } = req.body || {};
  const msisdn = normalisePhone(phone);
  if (!msisdn) return res.status(400).json({ error: 'Enter a valid Safaricom number' });

  // Never trust an amount from the browser: re-price the cart from the catalogue.
  const { total, lines } = priceCart(items, delivery);
  if (!lines.length || total <= 0) return res.status(400).json({ error: 'Your bag is empty' });

  const out = await stkPush({ phone: msisdn, amount: total, reference: reference || 'FLAW' });
  if (out.ResponseCode === '0') {
    return res.status(200).json({ ok: true, checkoutRequestId: out.CheckoutRequestID, amount: total });
  }
  return res.status(502).json({ error: out.errorMessage || out.ResponseDescription || 'M-Pesa did not accept the request' });
}
