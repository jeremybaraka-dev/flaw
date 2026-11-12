# FLAW ENFORCEMENT: website

Custom storefront for Flaw Enforcement (Nairobi). Vite + vanilla JS, GSAP and Lenis for motion.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:5173. `npm run build` produces the production site in `dist/`.

## Where things live

| What | Where |
| --- | --- |
| Products, prices, colourways, sizes | `src/data/products.js` |
| Delivery fees | `src/data/pricing.js` |
| Lineup photos and their "charges" | `src/data/lineup.js` (photos in `influencers/`) |
| WhatsApp number, PayPal, till | `.env` (see `.env.example`) and `src/config.js` |
| Pages | `src/pages/` |
| Animations | `src/fx/` |

After adding photos to `influencers/` or `raw/products/`, run `npm run images` to make the web-sized versions.
Those two source folders hold the full-size PNGs and are kept out of git to keep the repo small; the web-sized copies in `public/` are committed.

## Deploy

The site deploys on Vercel as a Vite project (`vercel.json` sets the build and the routing). The `/api` folder deploys as serverless functions for M-Pesa.

## Payments: going live

Until the keys below are added, checkout runs in **test mode** and says so on screen. No money moves.

Copy `.env.example` to `.env` and fill it in. On Vercel, add the same names under Project → Settings → Environment Variables.

### Card + PayPal

1. Create a PayPal **Business** account.
2. Go to developer.paypal.com → Apps & Credentials → switch to **Live** → Create App.
3. Copy the **Client ID** into `VITE_PAYPAL_CLIENT_ID`.

Customers can pay with a PayPal balance or any Visa / Mastercard without a PayPal account. PayPal does not settle in KSh, so the charge is in USD at the rate in `VITE_KES_PER_USD`. Keep that rate current.

### M-Pesa (STK push)

1. Get a Paybill or Till with **Lipa na M-Pesa Online** enabled from Safaricom.
2. Create an app on developer.safaricom.co.ke and apply to go live to receive the production keys and passkey.
3. Fill in the `MPESA_*` values in `.env`. For a till, set `MPESA_TRANSACTION_TYPE=CustomerBuyGoodsOnline` and `MPESA_PARTY_B` to the till number.
4. `MPESA_CALLBACK_URL` must be the live site address followed by `/api/mpesa/callback`.

The M-Pesa code is in `api/mpesa/`. It runs as serverless functions, so host on Vercel (or any host that supports `/api` functions). The server re-prices the bag itself, so a customer cannot change the amount.

### Orders

After paying, the customer is asked to send their receipt to the brand's WhatsApp, which is how orders arrive today. To store orders automatically, save them inside `api/mpesa/callback.js` (database or email).

## Before launch

- Confirm the delivery fees in `src/data/pricing.js` (placeholders).
- Confirm sizes: the live store had none, so every piece currently offers S, M, L, XL.
- Review the copy for Broken Angel, Broken Angel Sweats, Camo-Flawge Pants and the three tees (the live store had no descriptions for them).
