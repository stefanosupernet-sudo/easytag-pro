# Stripe Integration TODO – Easy Tag

Single source of truth for remaining setup after Checkout Session integration (Scenario B).

## Values to Replace

**Files containing placeholders / config to set:**
- [api/create-checkout-session.ts](api/create-checkout-session.ts)
- [.env.example](.env.example)

| Field | Current Value | What to Set |
|-------|---------------|-------------|
| `DOMAIN` | `http://localhost:3000` | URL pubblico del sito (es. `https://easytag.pro`) senza slash finale. Usato in `success_url` e `cancel_url`. |
| `success_url` | `${DOMAIN}/success.html?session_id={CHECKOUT_SESSION_ID}` | OK dopo aver impostato `DOMAIN`. Mantieni `{CHECKOUT_SESSION_ID}`. |
| `cancel_url` | `${DOMAIN}/shop/` | OK dopo `DOMAIN`, oppure cambia path se preferisci. |
| `line_items[].price` | price ID reali (test) | Già valorizzati con i price creati in test. In **live** sostituisci con i price ID live. |
| `STRIPE_SECRET_KEY` | — | Dashboard → API keys (test o live). Non in codice. |
| `STRIPE_WEBHOOK_SECRET` | — | Dopo aver creato l’endpoint webhook. |
| `RESEND_API_KEY` | — | Per email post-acquisto. |

### ui_mode / SDK version

Parametro impostato: `ui_mode: "hosted_page"` (Stripe SDK ≥ 21).
Dipendenza in [package.json](package.json): `"stripe": "^17.0.0"`.

Se al deploy la create session fallisce su `ui_mode`, prova `"hosted"` (SDK più vecchi) oppure aggiorna a `stripe@^21`.

---

## Configured Parameters

Questi parametri arrivano dal Checkout Studio e sono già nel codice.

**File:** [api/create-checkout-session.ts](api/create-checkout-session.ts)

| Parameter | Value |
|-----------|-------|
| `ui_mode` | `hosted_page` |
| `billing_address_collection` | `auto` |
| `phone_number_collection.enabled` | `false` |
| `automatic_tax.enabled` | `false` |
| `allow_promotion_codes` | `false` |
| `submit_type` | `auto` |
| `integration_identifier` | `hosted_web_0001` |
| `origin_context` | `web` |
| `mode` | `payment` (prodotti one-time) |

`payment_method_collection` **non** è incluso: vale solo per `mode: subscription`.

---

## Project structure (nuovi file)

```
api/
  create-checkout-session.ts   # crea Checkout Session → redirect Stripe
  stripe-webhook.ts            # checkout.session.completed → email
success.html                   # pagina post-pagamento
package.json
.env.example
automation/product-map.json    # price ID + Payment Link (alternativa)
STRIPE_INTEGRATION_TODO.md     # questo file
```

---

## How the integration works

1. Il cliente sulla scheda prodotto invia `POST /api/create-checkout-session` con `{ "priceId": "price_..." }`.
2. Il server crea una Checkout Session (Hosted) e fa redirect 303 a `session.url`.
3. Il cliente paga sulla pagina Stripe.
4. Stripe reindirizza a `/success.html?session_id=...`.
5. Stripe invia `checkout.session.completed` a `/api/stripe-webhook`.
6. Il webhook invia email con link a `container.json` + istruzioni (o welcome ore).

**Alternativa senza server:** i [Payment Link](automation/STRIPE-SETUP.md) già creati funzionano subito; il webhook resta necessario per l’email automatica.

### Esempio form HTML (scheda prodotto)

```html
<form action="/api/create-checkout-session" method="POST">
  <input type="hidden" name="priceId" value="price_1UciBdFVaAsOPXA76PiEj3tN">
  <button type="submit">Acquista – €150</button>
</form>
```

O con `fetch` + `Accept: application/json` per ricevere `{ url }` e fare `location.href = url`.

---

## Setup steps

1. **Rotazione chiavi** se le hai incollate in chat (Dashboard → Roll key).
2. Copia `.env.example` → env su **Vercel** (non commitare `.env`).
3. `npm install` e deploy su Vercel collegato a questo repo.
4. Imposta `DOMAIN` = URL di produzione (o preview).
5. Stripe Dashboard → **Webhooks** → endpoint  
   `https://TUO-DOMINIO/api/stripe-webhook`  
   evento: `checkout.session.completed`  
   copia il signing secret in `STRIPE_WEBHOOK_SECRET`.
6. Account [Resend](https://resend.com) + `RESEND_API_KEY` (+ dominio mittente verificato).
7. Sulle pagine prodotto: form o fetch verso `/api/create-checkout-session` con il price ID corretto (vedi tabella sotto).

### Price ID (test)

| Prodotto | Price ID |
|----------|----------|
| Tracking Click Telefono | `price_1UciBdFVaAsOPXA76PiEj3tN` |
| Social 6-in-1 | `price_1UciBeFVaAsOPXA7ssnlkCi7` |
| Contatti 3-in-1 | `price_1UciBfFVaAsOPXA7MKDPBnCl` |
| Supporto 5 ore | `price_1UciBgFVaAsOPXA7QW3Gfilb` |
| Supporto 10 ore | `price_1UciBhFVaAsOPXA76qaSyaa7` |
| Supporto 20 ore | `price_1UciBiFVaAsOPXA7JVjj8s4o` |

---

## Testing

- Carta test: `4242 4242 4242 4242` · scadenza futura · CVC qualsiasi
- Local webhook: `stripe listen --forward-to localhost:3000/api/stripe-webhook`
- Docs: https://docs.stripe.com/testing

---

## Next steps

- [ ] Collegare i CTA delle schede prodotto all’endpoint (o ai Payment Link)
- [ ] Deploy Vercel + env
- [ ] Webhook + Resend e test end-to-end
- [ ] (Opzionale) Stripe Tax / Invoicing
- [ ] Live mode: ricreare prodotti/price, aggiornare map e env `sk_live_` / `pk_live_`

**Resources:** https://docs.stripe.com · https://support.stripe.com · https://docs.stripe.com/mcp
