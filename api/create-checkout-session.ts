/**
 * Stripe Checkout Session – Hosted page
 * Deploy on Vercel as /api/create-checkout-session
 *
 * POST body: { "priceId": "price_..." }
 * or form field priceId
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const DOMAIN = process.env.DOMAIN || 'https://www.easytag.pro';

/** Allowed Price IDs (live, account Easytag). */
const ALLOWED_PRICES = new Set([
  'price_1UetjCFM9KfnnbcxQDbxcVOu', // Tracking Click Telefono €150
  'price_1UetjFFM9Kfnnbcx8gX5jNLO', // Tracking Social 6-in-1 €450
  'price_1UetjGFM9KfnnbcxeTiLH49j', // Contatti 3-in-1 €350
  'price_1UetjHFM9KfnnbcxWpTZVDdC', // Supporto 5 ore €500
  'price_1UetjJFM9KfnnbcxmlvcZJwP', // Supporto 10 ore €900
  'price_1UetjKFM9KfnnbcxLM3Ml6ak', // Supporto 20 ore €1600
  'price_1UetjLFM9Kfnnbcxk7dYXWiN', // TAG Email €150
  'price_1UetjMFM9KfnnbcxGhsHFhqf', // TAG Facebook €150
  'price_1UetjNFM9KfnnbcxwTdNAD7y', // TAG Instagram €150
  'price_1UetjOFM9KfnnbcxWF88n4u4', // TAG LinkedIn €150
]);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: 'STRIPE_SECRET_KEY not configured' });
  }

  const priceId =
    (typeof req.body?.priceId === 'string' && req.body.priceId) ||
    (typeof req.body?.price_id === 'string' && req.body.price_id) ||
    '';

  if (!priceId || !ALLOWED_PRICES.has(priceId)) {
    return res.status(400).json({
      error: 'Invalid or missing priceId',
      allowed: Array.from(ALLOWED_PRICES),
    });
  }

  // One-time products only → mode "payment"
  // payment_method_collection is only for subscription mode (omitted here)
  const locale = req.body?.locale === 'en' ? 'en' : 'it';
  const successPath = locale === 'en' ? '/en/success.html' : '/success.html';
  const cancelPath = locale === 'en' ? '/en/shop/' : '/shop/';

  const session = await stripe.checkout.sessions.create({
    // fixed_by_ui (Checkout Studio)
    ui_mode: 'hosted',
    billing_address_collection: 'auto',
    phone_number_collection: { enabled: false },
    automatic_tax: { enabled: false },
    allow_promotion_codes: false,
    submit_type: 'auto',
   

    // sample_only – replace DOMAIN before production
    mode: 'payment',
    success_url: `${DOMAIN}${successPath}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${DOMAIN}${cancelPath}`,
    line_items: [{ price: priceId, quantity: 1 }],
  });

  // Prefer redirect for HTML forms; JSON for fetch clients
  const accept = req.headers.accept || '';
  if (accept.includes('application/json')) {
    return res.status(200).json({ url: session.url, id: session.id });
  }
  return res.redirect(303, session.url!);
}
