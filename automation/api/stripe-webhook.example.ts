/**
 * Esempio handler Vercel – Stripe webhook → email consegna
 *
 * Deploy: copia in /api/stripe-webhook.ts sul progetto Vercel.
 * Dipendenze: stripe, resend
 *
 * Env:
 *   STRIPE_SECRET_KEY
 *   STRIPE_WEBHOOK_SECRET
 *   RESEND_API_KEY
 *   FROM_EMAIL=consegne@easytag.pro
 *   SUPPORT_BCC=info@easytag.pro
 *   DELIVERABLES_BASE_URL=https://easytag-pro.vercel.app/deliverables
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { Resend } from 'resend';
import productMap from '../product-map.json';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const resend = new Resend(process.env.RESEND_API_KEY!);

const BASE = process.env.DELIVERABLES_BASE_URL!;
const FROM = process.env.FROM_EMAIL || 'consegne@easytag.pro';
const BCC = 'info@easytag.pro';

type ProductConfig = {
  slug: string;
  name: string;
  type: 'container' | 'hours';
  folder?: string;
  files?: string[];
  hours?: number;
};

function getProduct(priceId: string): ProductConfig | null {
  const products = (productMap as any).products;
  return products[priceId] || null;
}

function buildContainerEmail(opts: {
  customerName: string;
  productName: string;
  folder: string;
  orderId: string;
}) {
  const linkContainer = `${BASE}/${opts.folder}/container.json`;
  const linkIstruzioni = `${BASE}/${opts.folder}/istruzioni.html`;

  // In produzione: carica il template HTML e sostituisci i placeholder
  return `
    <p>Ciao ${opts.customerName},</p>
    <p>Grazie per l'acquisto di <strong>${opts.productName}</strong>.</p>
    <p><strong>I tuoi file:</strong></p>
    <ul>
      <li><a href="${linkContainer}">container.json</a> — da importare in GTM</li>
      <li><a href="${linkIstruzioni}">istruzioni.html</a> — guida passo-passo</li>
    </ul>
    <p>1. Scarica container.json<br>
    2. GTM → Admin → Import Container<br>
    3. Sostituisci ID Conversione e Label<br>
    4. Testa e pubblica</p>
    <p>Supporto: info@easytag.pro · Ordine ${opts.orderId}</p>
  `;
}

function buildHoursEmail(opts: {
  customerName: string;
  productName: string;
  hours: number;
  orderId: string;
}) {
  return `
    <p>Ciao ${opts.customerName},</p>
    <p>Grazie per l'acquisto di <strong>${opts.productName}</strong> (${opts.hours} ore).</p>
    <p><strong>Prossimo passo:</strong> scrivi a info@easytag.pro indicando priorità e accessi (GTM, GA4, Ads). Partiamo entro 1 giorno lavorativo.</p>
    <p>Ordine ${opts.orderId} · Team Easy Tag</p>
  `;
}

export const config = {
  api: { bodyParser: false },
};

async function buffer(req: VercelRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req as any) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed');
  }

  const sig = req.headers['stripe-signature'] as string;
  const buf = await buffer(req);

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error('Webhook signature error', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const email = session.customer_details?.email || session.customer_email;
    const name = session.customer_details?.name || 'Cliente';
    const orderId = session.id;

    if (!email) {
      console.error('No customer email on session', orderId);
      return res.status(200).json({ received: true, skipped: 'no_email' });
    }

    // Recupera line items per ottenere il price ID
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 5 });
    const priceId = lineItems.data[0]?.price?.id;

    if (!priceId) {
      console.error('No price ID', orderId);
      return res.status(200).json({ received: true, skipped: 'no_price' });
    }

    const product = getProduct(priceId);
    if (!product) {
      console.warn('Unknown price ID – update product-map.json', priceId);
      // Fallback: email generica di conferma
      await resend.emails.send({
        from: FROM,
        to: email,
        bcc: BCC,
        subject: `Conferma ordine Easy Tag – ${orderId}`,
        html: `<p>Ciao ${name}, grazie per l'acquisto. Ti contatteremo a breve a info@easytag.pro.</p><p>Ordine: ${orderId}</p>`,
      });
      return res.status(200).json({ received: true, fallback: true });
    }

    let html: string;
    let subject: string;

    if (product.type === 'container' && product.folder) {
      subject = `I tuoi file GTM – ${product.name} | Easy Tag`;
      html = buildContainerEmail({
        customerName: name,
        productName: product.name,
        folder: product.folder,
        orderId,
      });
    } else {
      subject = `Pacchetto ore attivato – ${product.name} | Easy Tag`;
      html = buildHoursEmail({
        customerName: name,
        productName: product.name,
        hours: product.hours || 0,
        orderId,
      });
    }

    await resend.emails.send({
      from: FROM,
      to: email,
      bcc: BCC,
      subject,
      html,
    });

    console.log('Delivery email sent', { orderId, priceId, email, type: product.type });
  }

  return res.status(200).json({ received: true });
}
