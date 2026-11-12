import { configured, stkQuery } from '../_daraja.js';

// POST { checkoutRequestId } -> { status: 'pending' | 'paid' | 'failed', message }
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  if (!configured()) return res.status(503).json({ error: 'M-Pesa is not configured yet' });

  const id = String(req.body?.checkoutRequestId || '');
  if (!/^[\w-]{10,80}$/.test(id)) return res.status(400).json({ error: 'Bad request id' });

  const out = await stkQuery(id);
  if (out.ResultCode === '0' || out.ResultCode === 0) return res.status(200).json({ status: 'paid' });
  // Still waiting for the customer to enter their PIN
  if (out.errorCode === '500.001.1001' || out.ResultCode === undefined) return res.status(200).json({ status: 'pending' });

  const reasons = { 1032: 'You cancelled the request on your phone.', 1037: 'The prompt timed out. Try again.', 1: 'Insufficient M-Pesa balance.', 2001: 'Wrong M-Pesa PIN.' };
  return res.status(200).json({ status: 'failed', message: reasons[out.ResultCode] || out.ResultDesc || 'Payment was not completed.' });
}
