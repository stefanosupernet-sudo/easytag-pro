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

const DOMAIN = process.env.DOMAIN || 'http://localhost:3000';

/** Allowed Price IDs (test). Keep in sync with automation/product-map.json */
const ALLOWED_PRICES = new Set([
  'price_1UciBdFVaAsOPXA76PiEj3tN', // Tracking Click Telefono €150
  'price_1UciBeFVaAsOPXA7ssnlkCi7', // Tracking Social 6-in-1 €450
  'price_1UciBfFVaAsOPXA7MKDPBnCl', // Contatti 3-in-1 €350
  'price_1UciBgFVaAsOPXA7QW3Gfilb', // Supporto 5 ore €500
  'price_1UciBhFVaAsOPXA76qaSyaa7', // Supporto 10 ore €900
  'price_1UciBiFVaAsOPXA7JVjj8s4o', // Supporto 20 ore €1600
  'price_1UdVs4FVaAsOPXA7Ei2Vv1yA', // TAG Email €150
  'price_1UdVsfFVaAsOPXA7FkgKsj3N', // TAG Facebook €150
  'price_1UdVtIFVaAsOPXA7bWltM0i5', // TAG Instagram €150
  'price_1UdVtqFVaAsOPXA79ktKlFts', // TAG LinkedIn €150
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
    success_url: `${DOMAIN}/success.html?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${DOMAIN}/shop/`,
    line_items: [{ price: priceId, quantity: 1 }],
  });

  // Prefer redirect for HTML forms; JSON for fetch clients
  const accept = req.headers.accept || '';
  if (accept.includes('application/json')) {
    return res.status(200).json({ url: session.url, id: session.id });
  }
  return res.redirect(303, session.url!);
}
