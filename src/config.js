// Everything the owner may need to change lives here or in the .env file.
const env = import.meta.env || {};

export const config = {
  brand: 'Flaw Enforcement',
  whatsapp: env.VITE_WHATSAPP || '447883387789', // digits only, country code first
  instagram: 'https://www.instagram.com/flawenforcement/',

  paypal: {
    // "test" loads PayPal's sandbox. Replace with the live Client ID from developer.paypal.com
    clientId: env.VITE_PAYPAL_CLIENT_ID || 'test',
    currency: 'USD', // PayPal does not settle in KES, so cards are charged in USD
    kesPerUsd: Number(env.VITE_KES_PER_USD) || 129,
  },

  mpesa: {
    // Shown for the manual "pay to till" option. Leave empty to hide it.
    till: env.VITE_MPESA_TILL || '',
    tillName: env.VITE_MPESA_TILL_NAME || 'FLAW ENFORCEMENT',
  },
};

export const waLink = (text) => `https://wa.me/${config.whatsapp}?text=${encodeURIComponent(text)}`;
