/**
 * Richiesta preventivo dai 3 prodotti su misura.
 * POST form: nome, cognome, email, telefono, cms, datalayer, url, note, prodotto
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);
const FROM = process.env.FROM_EMAIL || 'consegne@easytag.pro';
const TO = 'info@easytag.pro';

const PRODUCTS: Record<string, string> = {
  'tracker-ecommerce': 'Tracker E-commerce',
  'dynamic-remarketing': 'Dynamic Remarketing',
  'consent-mode-v2': 'Consent Mode v2',
};

function field(body: Record<string, unknown>, key: string, max = 500): string {
  const raw = body[key];
  const value = typeof raw === 'string' ? raw.trim() : '';
  return value.slice(0, max).replace(/[\r\n]+/g, ' ');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).send('Metodo non consentito');
  }

  const body = (req.body || {}) as Record<string, unknown>;
  const prodotto = field(body, 'prodotto', 40);
  const nome = field(body, 'nome', 80);
  const cognome = field(body, 'cognome', 80);
  const email = field(body, 'email', 120);
  const telefono = field(body, 'telefono', 40);
  const cms = field(body, 'cms', 80);
  const datalayer = field(body, 'datalayer', 40);
  const url = field(body, 'url', 300);
  const note = typeof body.note === 'string' ? body.note.trim().slice(0, 2000) : '';

  const name = PRODUCTS[prodotto];
  if (!name || !nome || !cognome || !telefono || !cms || !datalayer || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).send('Compila nome, cognome, email, telefono, CMS e data layer.');
  }

  const text = [
    `Prodotto: ${name}`,
    `Nome: ${nome} ${cognome}`,
    `Email: ${email}`,
    `Telefono: ${telefono}`,
    `CMS: ${cms}`,
    `Data layer personalizzato: ${datalayer}`,
    `URL: ${url || '—'}`,
    '',
    note || '—',
  ].join('\n');

  await resend.emails.send({
    from: FROM,
    to: TO,
    replyTo: email,
    subject: `Preventivo ${name} – ${nome} ${cognome}`,
    text,
  });

  res.writeHead(303, { Location: `/shop/${prodotto}?inviato=1#preventivo` });
  res.end();
}
