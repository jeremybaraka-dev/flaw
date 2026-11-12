// Safaricom calls this URL (MPESA_CALLBACK_URL) with the final result of every STK push.
// This is the place to save the paid order to a database or send yourself a notification.
export default function handler(req, res) {
  const cb = req.body?.Body?.stkCallback;
  if (cb) {
    const meta = Object.fromEntries((cb.CallbackMetadata?.Item || []).map((i) => [i.Name, i.Value]));
    console.log('[mpesa callback]', cb.CheckoutRequestID, cb.ResultCode, cb.ResultDesc, meta.MpesaReceiptNumber || '');
  }
  res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
}
