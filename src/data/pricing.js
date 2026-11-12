// Shared by the browser and the payment API so totals are always computed the same way.
import { byHandle } from './products.js';

// Delivery fees are placeholders: confirm the real rates with the brand.
export const DELIVERY = [
  { id: 'nairobi', label: 'Nairobi', note: '1 to 2 days', fee: 300 },
  { id: 'kenya', label: 'Countrywide', note: 'Anywhere in Kenya, 3 to 7 business days', fee: 500 },
  { id: 'pickup', label: 'Pick-up (Nairobi)', note: 'We confirm the spot on WhatsApp', fee: 0 },
  { id: 'intl', label: 'International', note: '7 to 21 business days', fee: 3500 },
];

export function priceCart(items = [], deliveryId = 'nairobi') {
  const lines = [];
  for (const it of items) {
    const p = byHandle[it.handle];
    const qty = Math.max(1, Math.min(20, Math.floor(Number(it.qty) || 0)));
    if (!p) continue;
    lines.push({ handle: p.handle, title: p.title, variant: it.variant, size: it.size, qty, unit: p.price, total: p.price * qty });
  }
  const subtotal = lines.reduce((s, l) => s + l.total, 0);
  const delivery = DELIVERY.find((d) => d.id === deliveryId) || DELIVERY[0];
  return { lines, subtotal, delivery, total: subtotal + (lines.length ? delivery.fee : 0) };
}

export const kes = (n) => `KSh ${Math.round(n).toLocaleString('en-KE')}`;
