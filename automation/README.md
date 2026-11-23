# Automazione consegna post-acquisto

## Flusso (Fase 1)

1. Cliente completa il pagamento (Stripe Checkout o Payment Link).
2. Stripe invia webhook `checkout.session.completed` (o `payment_intent.succeeded`).
3. La funzione serverless (Vercel / Netlify) riceve l’evento.
4. In base al **price ID** o **product ID** Stripe, seleziona i file da consegnare.
5. Invia un’email al cliente con i **link diretti** ai file nel repo (o su CDN).
6. Copia nascosta (BCC) a `info@easytag.pro` per tracciamento.

## Cosa non fa (ancora)

- Nessun download autenticato / token temporaneo (i link sono pubblici ma non indicizzati).
- Nessun portale cliente.
- I pacchetti “preventivo” (e-commerce, remarketing) **non** passano da questo flusso: restano form → email manuale.

## Prodotti con consegna automatica

| Stripe Price ID (da configurare) | Cartella deliverables | File |
|----------------------------------|----------------------|------|
| `price_telefono` | `tracking-click-telefono/` | `container.json` + `istruzioni.html` |
| `price_social_6in1` | `tracking-social-6in1/` | `container.json` + `istruzioni.html` |
| `price_contatti_3in1` | `contatti-3in1/` | `container.json` + `istruzioni.html` |
| `price_supporto_5h` | — | solo email di benvenuto (niente JSON) |
| `price_supporto_10h` | — | solo email di benvenuto |
| `price_supporto_20h` | — | solo email di benvenuto |

## Stack consigliato

- **Pagamenti:** Stripe Checkout / Payment Links
- **Webhook + funzione:** Vercel Serverless (`api/stripe-webhook.ts`)
- **Email:** [Resend](https://resend.com) (semplice, API chiara) oppure Postmark
- **Host file:** GitHub raw / GitHub Pages / Cloudflare R2 (poi)

## Variabili d’ambiente

```
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
RESEND_API_KEY=
FROM_EMAIL=consegne@easytag.pro
SUPPORT_BCC=info@easytag.pro
DELIVERABLES_BASE_URL=https://easytag-pro.vercel.app/deliverables
```

## Prossimi file in questa cartella

- `product-map.json` – mappatura price → cartella
- `emails/` – template HTML delle email
- `api/stripe-webhook.example.ts` – esempio handler Vercel
