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
It only processes pictures that are new or changed, so it takes a few seconds (`npm run images -- --all` rebuilds everything).
It writes each picture in up to three widths as AVIF and WebP and records them in `src/data/images.json`;
`src/img.js` turns that into `<picture>` tags so each phone or screen downloads only the size it needs.
Those two source folders hold the full-size PNGs and are kept out of git to keep the repo small; the web-sized copies in `public/` are committed.

### Adding a lineup photo

1. Save it in `influencers/` named with the next number (`12.png`, `13.png`, ...).
2. Run `npm run images`.
3. Add a line for it in `src/data/lineup.js` (its number, a suspect number, a charge, and the product it is wearing). That puts it on the lineup wall.
4. Optional: add the number to `STRIP` in `src/pages/about.js` and to `EXHIBITS` in `src/pages/home.js` (the polaroid), and a face position in `FOCAL` in `src/pages/home.js` if the crop cuts the head off.

## Speed

```bash
npm run speed
```

Runs Google's Lighthouse against the live site as a mid-range phone on slow 4G and as a desktop, and prints the score and the timings. Pass another address to test something else, for example `npm run speed -- http://localhost:4173` after `npm run build` and `npm run preview`.

The numbers come from this computer pretending to be a phone, so treat them as a guide. For real phones on real networks use https://pagespeed.web.dev, and try the site on an actual low-end Android on mobile data before a big drop.

The first visit plays a 5 second intro, which lab tests count against the score (they see a covered page). The site is built so the heavy start-up work happens before the intro animation begins, not during it.

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
