import { configured, isLive } from '../_daraja.js';

// Tells the checkout whether real M-Pesa credentials are installed.
export default function handler(req, res) {
  res.status(200).json({ configured: configured(), live: configured() && isLive() });
}
