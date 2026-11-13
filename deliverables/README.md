# Deliverables – Container GTM e istruzioni

Questa cartella contiene i file che vengono consegnati automaticamente ai clienti dopo l’acquisto.

## Struttura

```
deliverables/
├── tracking-click-telefono/
│   ├── container.json          ← da esportare da GTM
│   └── istruzioni.html
├── tracking-social-6in1/
│   ├── container.json
│   └── istruzioni.html
├── tracker-ecommerce/
│   ├── container.json
│   └── istruzioni.html
├── dynamic-remarketing/
│   ├── container.json
│   └── istruzioni.html
└── README.md                   ← questo file
```

## Prodotti collegati

| Cartella | Prodotto | Prezzo |
|----------|----------|--------|
| `tracking-click-telefono` | Tracking Click sul Numero di Telefono con GTM | €150 |
| `tracking-social-6in1` | Tracking Unificato Icone Social (6-in-1) | €450 |
| `tracker-ecommerce` | Tracker Completo Conversioni E-commerce | €800 |
| `dynamic-remarketing` | Dynamic Remarketing completo via GTM | €400 |

I pacchetti ore (5 / 10 / 20 ore) **non** hanno file in questa cartella. Dopo l’acquisto viene inviata solo un’email di benvenuto.

## Come preparare un container

1. Crea / finalizza il container di riferimento nel tuo account GTM.
2. Vai in **Admin → Container → Export**.
3. Scarica il file JSON.
4. Rinominalo in `container.json` e mettilo nella cartella corrispondente.
5. Aggiorna il file `istruzioni.html` con le indicazioni specifiche (variabili da modificare, ID da inserire, ecc.).

## Note importanti

- I file JSON non devono contenere dati sensibili del tuo account (se possibile).
- Nelle istruzioni indica chiaramente cosa il cliente deve personalizzare (Measurement ID GA4, Conversion ID Google Ads, ecc.).
- Dopo ogni aggiornamento di un container, riesporta il JSON e sostituisci il file.

## Flusso di consegna (Fase 1)

1. Cliente paga su Stripe.
2. Webhook attiva la funzione serverless.
3. Viene inviata un’email con i link diretti ai file di questa cartella.
4. Il cliente scarica e importa il container nel proprio GTM.
