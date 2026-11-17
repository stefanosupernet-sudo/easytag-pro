/**
 * Stripe webhook → email consegna (container o pacchetto ore)
 * Endpoint: POST /api/stripe-webhook
 * Evento: checkout.session.completed
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { Resend } from 'resend';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const resend = new Resend(process.env.RESEND_API_KEY!);

const BASE = process.env.DELIVERABLES_BASE_URL!;
const FROM = process.env.FROM_EMAIL || 'consegne@easytag.pro';
const BCC = process.env.SUPPORT_BCC || 'support@easytag.com';

/** price ID → consegna (allineato a automation/product-map.json) */
const MAP: Record<
  string,
  | { type: 'container'; name: string; folder: string }
  | { type: 'hours'; name: string; hours: number }
> = {
  price_1UciBdFVaAsOPXA76PiEj3tN: {
    type: 'container',
    name: 'Tracking Click sul Numero di Telefono',
    folder: 'tracking-click-telefono',
  },
  price_1UciBeFVaAsOPXA7ssnlkCi7: {
    type: 'container',
    name: 'Tracking Social 6-in-1',
    folder: 'tracking-social-6in1',
  },
  price_1UciBfFVaAsOPXA7MKDPBnCl: {
    type: 'container',
    name: 'Pacchetto Contatti 3-in-1',
    folder: 'contatti-3in1',
  },
  price_1UciBgFVaAsOPXA7QW3Gfilb: {
    type: 'hours',
    name: 'Supporto Tecnico – 5 ore',
    hours: 5,
  },
  price_1UciBhFVaAsOPXA76qaSyaa7: {
    type: 'hours',
    name: 'Supporto Tecnico – 10 ore',
    hours: 10,
  },
  price_1UciBiFVaAsOPXA7JVjj8s4o: {
    type: 'hours',
    name: 'Supporto Tecnico – 20 ore',
    hours: 20,
  },
};

export const config = { api: { bodyParser: false } };

async function buffer(req: VercelRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req as any) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

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
      console.error('No email', orderId);
      return res.status(200).json({ received: true, skipped: 'no_email' });
    }

    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 5 });
    const priceId = lineItems.data[0]?.price?.id;
    const product = priceId ? MAP[priceId] : null;

    let subject: string;
    let html: string;

    if (product?.type === 'container') {
      const linkC = `${BASE}/${product.folder}/container.json`;
      const linkI = `${BASE}/${product.folder}/istruzioni.html`;
      subject = `I tuoi file GTM – ${product.name} | Easy Tag`;
      html = `<p>Ciao ${name},</p>
        <p>Grazie per l'acquisto di <strong>${product.name}</strong>.</p>
        <p><strong>I tuoi file:</strong></p>
        <ul>
          <li><a href="${linkC}">container.json</a></li>
          <li><a href="${linkI}">istruzioni.html</a></li>
        </ul>
        <p>1. Scarica container.json<br>2. GTM → Admin → Import Container<br>3. Sostituisci ID Conversione e Label<br>4. Testa e pubblica</p>
        <p>Supporto: support@easytag.com · Ordine ${orderId}</p>`;
    } else if (product?.type === 'hours') {
      subject = `Pacchetto ore attivato – ${product.name} | Easy Tag`;
      html = `<p>Ciao ${name},</p>
        <p>Grazie per l'acquisto di <strong>${product.name}</strong> (${product.hours} ore).</p>
        <p>Scrivi a <a href="mailto:support@easytag.com">support@easytag.com</a> con priorità e accessi (GTM, GA4, Ads). Partiamo entro 1 giorno lavorativo.</p>
        <p>Ordine ${orderId}</p>`;
    } else {
      subject = `Conferma ordine Easy Tag – ${orderId}`;
      html = `<p>Ciao ${name}, grazie per l'acquisto. Ti contatteremo a breve.</p><p>Ordine: ${orderId}</p>`;
    }

    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({ from: FROM, to: email, bcc: BCC, subject, html });
      console.log('Email sent', { orderId, priceId, email });
    } else {
      console.warn('RESEND_API_KEY missing – email not sent', { orderId, email });
    }
  }

  return res.status(200).json({ received: true });
}
