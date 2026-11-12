// Safaricom Daraja (M-Pesa) helpers. Credentials come from environment variables, never from the browser.
const REQUIRED = ['MPESA_CONSUMER_KEY', 'MPESA_CONSUMER_SECRET', 'MPESA_SHORTCODE', 'MPESA_PASSKEY', 'MPESA_CALLBACK_URL'];

export const configured = () => REQUIRED.every((k) => !!process.env[k]);
export const isLive = () => process.env.MPESA_ENV === 'production';
const base = () => (isLive() ? 'https://api.safaricom.co.ke' : 'https://sandbox.safaricom.co.ke');

/** Accepts 07XXXXXXXX, 01XXXXXXXX, +2547..., 2547... and returns 2547XXXXXXXX / 2541XXXXXXXX. */
export function normalisePhone(input) {
  const d = String(input || '').replace(/\D/g, '');
  let n = d;
  if (d.startsWith('254')) n = d.slice(3);
  else if (d.startsWith('0')) n = d.slice(1);
  return /^[17]\d{8}$/.test(n) ? `254${n}` : null;
}

// Daraja expects East Africa Time, formatted YYYYMMDDHHmmss
const timestamp = () => new Date(Date.now() + 3 * 3600 * 1000).toISOString().replace(/\D/g, '').slice(0, 14);

async function token() {
  const auth = Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString('base64');
  const r = await fetch(`${base()}/oauth/v1/generate?grant_type=client_credentials`, { headers: { Authorization: `Basic ${auth}` } });
  if (!r.ok) throw new Error(`Daraja auth failed (${r.status})`);
  return (await r.json()).access_token;
}

async function call(path, payload) {
  const r = await fetch(`${base()}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${await token()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return r.json().catch(() => ({}));
}

function signed() {
  const ts = timestamp();
  const code = process.env.MPESA_SHORTCODE;
  return {
    BusinessShortCode: code,
    Password: Buffer.from(`${code}${process.env.MPESA_PASSKEY}${ts}`).toString('base64'),
    Timestamp: ts,
  };
}

export function stkPush({ phone, amount, reference }) {
  return call('/mpesa/stkpush/v1/processrequest', {
    ...signed(),
    // Paybill: CustomerPayBillOnline. Till (Buy Goods): CustomerBuyGoodsOnline + MPESA_PARTY_B = till number.
    TransactionType: process.env.MPESA_TRANSACTION_TYPE || 'CustomerPayBillOnline',
    Amount: Math.round(amount),
    PartyA: phone,
    PartyB: process.env.MPESA_PARTY_B || process.env.MPESA_SHORTCODE,
    PhoneNumber: phone,
    CallBackURL: process.env.MPESA_CALLBACK_URL,
    AccountReference: String(reference).slice(0, 12),
    TransactionDesc: 'Flaw Enforcement',
  });
}

export function stkQuery(checkoutRequestId) {
  return call('/mpesa/stkpushquery/v1/query', { ...signed(), CheckoutRequestID: checkoutRequestId });
}
