# Stripe setup – Easy Tag (TEST mode)

## Sicurezza

Hai condiviso le API key in chat. **Rotazione consigliata** dopo i test:
Dashboard Stripe → Developers → API keys → Roll key.

Non committare mai `sk_...` nel repo. Usa solo variabili d’ambiente.

## Prodotti creati (test)

| Prodotto | Price ID | EUR | Payment Link |
|----------|----------|-----|--------------|
| Tracking Click Telefono | `price_1UciBdFVaAsOPXA76PiEj3tN` | 150 | https://buy.stripe.com/test_5kQbJ13KL4Ld9yT01CbV600 |
| Tracking Social 6-in-1 | `price_1UciBeFVaAsOPXA7ssnlkCi7` | 450 | https://buy.stripe.com/test_dRm14ngxx6TldP929KbV601 |
| Contatti 3-in-1 | `price_1UciBfFVaAsOPXA7MKDPBnCl` | 350 | https://buy.stripe.com/test_28E6oHgxx4Ld5iDbKkbV602 |
| Supporto 5 ore | `price_1UciBgFVaAsOPXA7QW3Gfilb` | 500 | https://buy.stripe.com/test_eVq6oHdll5PhaCX5lWbV603 |
| Supporto 10 ore | `price_1UciBhFVaAsOPXA76qaSyaa7` | 900 | https://buy.stripe.com/test_9B600jftt3H99yT29KbV604 |
| Supporto 20 ore | `price_1UciBiFVaAsOPXA7JVjj8s4o` | 1600 | https://buy.stripe.com/test_bJedR9a99dhJh1l6q0bV605 |

Mappatura completa: `automation/product-map.json`

## Come procedere ora

### 1. Collega i bottoni Acquista del sito

Sulle schede prodotto (container e ore), sostituisci l’href del CTA con il Payment Link corrispondente.

Esempio:
```html
<a href="https://buy.stripe.com/test_5kQbJ13KL4Ld9yT01CbV600" class="btn btn-primary">Acquista</a>
```

### 2. Email automatiche (webhook)

1. Crea account [Resend](https://resend.com) e verifica il dominio `easytag.pro` (o usa un dominio sandbox).
2. Deploy su Vercel del progetto (o di una cartella `api/` separata).
3. Copia `automation/api/stripe-webhook.example.ts` → `api/stripe-webhook.ts`.
4. Env su Vercel:
   - `STRIPE_SECRET_KEY` = sk_test_...
   - `STRIPE_WEBHOOK_SECRET` = (dopo step 5)
   - `RESEND_API_KEY`
   - `FROM_EMAIL` = consegne@easytag.pro (o onboarding@resend.dev in test)
   - `SUPPORT_BCC` = info@easytag.pro
   - `DELIVERABLES_BASE_URL` = https://raw.githubusercontent.com/stefanosupernet-sudo/easytag-pro/main/deliverables
5. Stripe Dashboard → Developers → Webhooks → Add endpoint:
   - URL: `https://TUO-DOMINIO.vercel.app/api/stripe-webhook`
   - Evento: `checkout.session.completed`
   - Copia il **Signing secret** in `STRIPE_WEBHOOK_SECRET`

### 3. Test pagamento

Carta test Stripe: `4242 4242 4242 4242` · data futura · CVC qualsiasi.

Dopo il pagamento, il webhook deve inviare l’email con i link ai file.

### 4. Tax / Invoicing (opzionale, dopo)

- **Tax**: Stripe Tax → attiva e configura paese IT se vendi B2B/B2C con IVA.
- **Invoicing**: utile per i pacchetti ore e preventivi; i Payment Link già generano ricevuta.

### 5. Live mode

Quando sei pronto:
1. Attiva account live Stripe
2. Ricrea prodotti/price in live (o usa il Dashboard)
3. Aggiorna `product-map.json` e Payment Link sul sito
4. Webhook su endpoint live + chiavi `sk_live_` / `pk_live_`

## Publishable key (test)

Usala solo lato client se in futuro passi a Embedded Checkout:
`pk_test_51UaFr8FVaAsOPXA7...` (vedi Dashboard, non hardcodare la secret).
