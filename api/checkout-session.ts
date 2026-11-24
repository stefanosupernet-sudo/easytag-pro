/**
 * Public purchase details for the GA4 purchase event.
 * Returns amount and product name only after Stripe confirms payment.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sessionId = typeof req.query.session_id === 'string' ? req.query.session_id : '';
  if (!/^cs_(test_|live_)?[A-Za-z0-9]+$/.test(sessionId)) {
    return res.status(400).json({ error: 'Invalid session' });
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: 'Not configured' });
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['line_items'],
  });
  if (session.payment_status !== 'paid') {
    return res.status(409).json({ error: 'Not paid' });
  }

  const item = session.line_items?.data?.[0];
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({
    transaction_id: session.id,
    value: (session.amount_total || 0) / 100,
    currency: (session.currency || 'eur').toUpperCase(),
    item_id: item?.price?.id || 'item',
    item_name: item?.description || 'Easy Tag',
  });
}
