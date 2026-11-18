# Product images (EasyTAG box renders)

Each `{slug}.webp.b64` is a base64-encoded WebP of the official product packaging.

Pages use `/assets/js/product-images.js` which looks for `img[data-product="slug"]` and sets:
`src = "data:image/webp;base64," + content of /assets/products/{slug}.webp.b64`

Slugs currently available:
- tracking-click-telefono
- tracking-social-6in1
- contatti-3in1
- supporto-5-ore / supporto-10-ore / supporto-20-ore
- tracker-ecommerce
- dynamic-remarketing
- consent-mode-v2
- tag-facebook / tag-instagram / tag-linkedin / tag-email
- supporto-generico
