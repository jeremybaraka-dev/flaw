// Evidence bag (cart). Persists in localStorage.
import { byHandle } from '../data/products.js';

const KEY = 'fe_bag_v1';
const subs = new Set();

const load = () => {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(raw) ? raw.filter((i) => byHandle[i.handle]) : [];
  } catch {
    return [];
  }
};

let items = load();
const save = () => {
  try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* private mode */ }
  subs.forEach((fn) => fn(items));
};

export const cart = {
  get items() { return items; },
  count: () => items.reduce((n, i) => n + i.qty, 0),
  subtotal: () => items.reduce((n, i) => n + byHandle[i.handle].price * i.qty, 0),
  add({ handle, variant, size, qty = 1 }) {
    const found = items.find((i) => i.handle === handle && i.variant === variant && i.size === size);
    if (found) found.qty = Math.min(20, found.qty + qty);
    else items = [...items, { handle, variant, size, qty }];
    save();
  },
  setQty(index, qty) {
    if (!items[index]) return;
    if (qty <= 0) items = items.filter((_, i) => i !== index);
    else items[index].qty = Math.min(20, qty);
    save();
  },
  remove(index) { items = items.filter((_, i) => i !== index); save(); },
  clear() { items = []; save(); },
  subscribe(fn) { subs.add(fn); return () => subs.delete(fn); },
};

export const lineImage = (item) => {
  const p = byHandle[item.handle];
  const v = p.variants.find((x) => x.name === item.variant) || p.variants[0];
  return v.images[0];
};
