// Syntix Premium — EDIT THIS FILE.
// monthly.link / yearly.link: payment page URLs from your payment provider
// (e.g. a Stripe "Payment Link" for a recurring price). Leave '' until you have them:
// the buy button then shows a "not configured" note instead of breaking.
// The site appends ?client_reference_id=<uid>&prefilled_email=<email> to the link (Stripe format),
// so every payment can be matched to a user.
// Prices below are PLACEHOLDERS shown on the page — they must match the prices you set at the provider.
window.SYNTIX_PREMIUM = {
  currency: '€',
  monthly: { price: '4.99', link: '' },
  yearly: { price: '39.99', link: '' },
  contact: '' // support e-mail or URL shown on the pricing page, e.g. 'support@yourdomain.com'
};
