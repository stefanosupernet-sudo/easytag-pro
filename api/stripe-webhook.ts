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

const SITE_DELIVERABLES = 'https://www.easytag.pro/deliverables';
const configured = process.env.DELIVERABLES_BASE_URL || '';
const BASE =
  !configured || configured.includes('raw.githubusercontent.com')
    ? SITE_DELIVERABLES
    : configured.replace(/\/$/, '');
const FROM = process.env.FROM_EMAIL || 'consegne@easytag.pro';
const BCC = 'info@easytag.pro';

/** price ID → consegna (allineato a automation/product-map.json) */
const MAP: Record<
  string,
  | { type: 'container'; name: string; enName: string; folder: string }
  | { type: 'hours'; name: string; hours: number }
  | { type: 'manual'; name: string; enName: string; folder: string }
> = {
  price_1UetjCFM9KfnnbcxQDbxcVOu: {
    type: 'container',
    name: 'Tracking Click sul Numero di Telefono',
    enName: 'Phone click tracking',
    folder: 'tracking-click-telefono',
  },
  price_1UetjFFM9Kfnnbcx8gX5jNLO: {
    type: 'container',
    name: 'Tracking Social 6-in-1',
    enName: 'Social tracking 6-in-1',
    folder: 'tracking-social-6in1',
  },
  price_1UetjGFM9KfnnbcxeTiLH49j: {
    type: 'container',
    name: 'Pacchetto Contatti 3-in-1',
    enName: 'Contact links 3-in-1',
    folder: 'contatti-3in1',
  },
  price_1UetjHFM9KfnnbcxWpTZVDdC: {
    type: 'hours',
    name: 'Supporto Tecnico – 5 ore',
    hours: 5,
  },
  price_1UetjJFM9KfnnbcxmlvcZJwP: {
    type: 'hours',
    name: 'Supporto Tecnico – 10 ore',
    hours: 10,
  },
  price_1UetjKFM9KfnnbcxLM3Ml6ak: {
    type: 'hours',
    name: 'Supporto Tecnico – 20 ore',
    hours: 20,
  },
  price_1UetjLFM9Kfnnbcxk7dYXWiN: {
    type: 'manual',
    name: 'TAG Email',
    enName: 'Email tag',
    folder: 'tag-email',
  },
  price_1UetjMFM9KfnnbcxGhsHFhqf: {
    type: 'manual',
    name: 'TAG Facebook',
    enName: 'Facebook tag',
    folder: 'tag-facebook',
  },
  price_1UetjNFM9KfnnbcxwTdNAD7y: {
    type: 'manual',
    name: 'TAG Instagram',
    enName: 'Instagram tag',
    folder: 'tag-instagram',
  },
  price_1UetjOFM9KfnnbcxWF88n4u4: {
    type: 'manual',
    name: 'TAG LinkedIn',
    enName: 'LinkedIn tag',
    folder: 'tag-linkedin',
  },
};

export const config = { api: { bodyParser: false } };

async function buffer(req: VercelRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req as any) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks.map((chunk) => new Uint8Array(chunk)));
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

    const english = (session.success_url || '').includes('/en/');
    const guideFile = english ? 'instructions.html' : 'istruzioni.html';
    const hello = english ? `Hi ${name},` : `Ciao ${name},`;

    if (product?.type === 'container') {
      const linkC = `${BASE}/${product.folder}/container.json`;
      const linkI = `${BASE}/${product.folder}/${guideFile}`;
      const title = english ? product.enName : product.name;
      subject = english
        ? `Your GTM files – ${title} | Easy Tag`
        : `I tuoi file GTM – ${title} | Easy Tag`;
      html = english
        ? `<p>${hello}</p>
        <p>Thanks for buying <strong>${title}</strong>.</p>
        <p><strong>Your files:</strong></p>
        <ul>
          <li><a href="${linkC}">container.json</a></li>
          <li><a href="${linkI}">Installation manual</a></li>
        </ul>
        <p>1. Download container.json<br>2. GTM → Admin → Import container<br>3. Replace the Conversion ID and Label<br>4. Test, then publish</p>
        <p>Support: info@easytag.pro · Order ${orderId}</p>`
        : `<p>${hello}</p>
        <p>Grazie per l'acquisto di <strong>${title}</strong>.</p>
        <p><strong>I tuoi file:</strong></p>
        <ul>
          <li><a href="${linkC}">container.json</a></li>
          <li><a href="${linkI}">Manuale di installazione</a></li>
        </ul>
        <p>1. Scarica container.json<br>2. GTM → Admin → Importa container<br>3. Sostituisci ID Conversione e Label<br>4. Testa e pubblica</p>
        <p>Supporto: info@easytag.pro · Ordine ${orderId}</p>`;
    } else if (product?.type === 'manual') {
      const title = english ? product.enName : product.name;
      const linkI = `${BASE}/${product.folder}/${guideFile}`;
      subject = english
        ? `Order received – ${title} | Easy Tag`
        : `Ordine ricevuto – ${title} | Easy Tag`;
      html = english
        ? `<p>${hello}</p>
        <p>Thanks for buying <strong>${title}</strong>.</p>
        <p>The container file arrives from info@easytag.pro within one working day.</p>
        <p>The manual is already available: <a href="${linkI}">Installation manual</a>.</p>
        <p>Order ${orderId}</p>`
        : `<p>${hello}</p>
        <p>Grazie per l'acquisto di <strong>${title}</strong>.</p>
        <p>Il file del container ti arriva da info@easytag.pro entro un giorno lavorativo.</p>
        <p>Ordine ${orderId}</p>`;
    } else if (product?.type === 'hours') {
      subject = english
        ? `Hour pack active – ${product.hours} hours | Easy Tag`
        : `Pacchetto ore attivato – ${product.name} | Easy Tag`;
      html = english
        ? `<p>${hello}</p>
        <p>Thanks for buying <strong>${product.hours} hours</strong> of technical support.</p>
        <p>Write to <a href="mailto:info@easytag.pro">info@easytag.pro</a> with priority and access (GTM, GA4, Ads). We start within one working day.</p>
        <p>Order ${orderId}</p>`
        : `<p>${hello}</p>
        <p>Grazie per l'acquisto di <strong>${product.name}</strong> (${product.hours} ore).</p>
        <p>Scrivi a <a href="mailto:info@easytag.pro">info@easytag.pro</a> con priorità e accessi (GTM, GA4, Ads). Partiamo entro 1 giorno lavorativo.</p>
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
