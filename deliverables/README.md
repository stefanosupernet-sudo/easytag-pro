# Deliverables – Container GTM e istruzioni

Questa cartella contiene i file che vengono consegnati automaticamente ai clienti dopo l’acquisto.

## Struttura attuale

```
deliverables/
├── tracking-click-telefono/
│   ├── container.json          ✅ CARICATO (Tag Chiamate)
│   └── istruzioni.html
├── tracking-social-6in1/
│   ├── container.json          ✅ CARICATO (Pacchetto Social 6in1)
│   └── istruzioni.html
├── contatti-3in1/
│   └── container.json          ✅ CARICATO (Telefono + Email + WhatsApp)
├── tracker-ecommerce/
│   └── istruzioni.html         ⏳ container.json mancante
├── dynamic-remarketing/
│   └── istruzioni.html         ⏳ container.json mancante
└── README.md
```

## Prodotti collegati

| Cartella | Prodotto | Prezzo | Stato JSON |
|----------|----------|--------|------------|
| `tracking-click-telefono` | Tracking Click sul Numero di Telefono con GTM | €150 | ✅ Pronto |
| `tracking-social-6in1` | Tracking Unificato Icone Social (6-in-1) | €450 | ✅ Pronto |
| `contatti-3in1` | Pacchetto Contatti 3in1 (Tel + Mail + WhatsApp) | da definire | ✅ Pronto |
| `tracker-ecommerce` | Tracker Completo Conversioni E-commerce | €800 | ⏳ Da esportare |
| `dynamic-remarketing` | Dynamic Remarketing completo via GTM | €400 | ⏳ Da esportare |

I pacchetti ore (5 / 10 / 20 ore) **non** hanno file in questa cartella. Dopo l’acquisto viene inviata solo un’email di benvenuto.

## Variabile da personalizzare dal cliente

In tutti i container è presente la variabile:

**`ID Conversione - EasyTag`** (valore placeholder `0000000000`)

Il cliente deve sostituirla con il proprio Conversion ID di Google Ads.

Anche le **Conversion Label** sono impostate su `ETICHETTA_QUI` e vanno aggiornate.

## Note importanti

- I file JSON contengono ancora riferimenti all’account di origine (accountId, containerId). In fase di import GTM li riassegna al container del cliente.
- Dopo ogni aggiornamento di un container, riesporta il JSON e sostituisci il file.

## Flusso di consegna (Fase 1)

1. Cliente paga su Stripe.
2. Webhook attiva la funzione serverless.
3. Viene inviata un’email con i link diretti ai file di questa cartella.
4. Il cliente scarica e importa il container nel proprio GTM.
