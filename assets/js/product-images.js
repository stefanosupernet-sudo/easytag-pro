/** Load /assets/products/{slug}.webp.b64 into img[data-product="slug"] */
(function () {
  const imgs = document.querySelectorAll('img[data-product]');
  imgs.forEach(async (img) => {
    const slug = img.getAttribute('data-product');
    if (!slug) return;
    try {
      const res = await fetch('/assets/products/' + slug + '.webp.b64');
      if (!res.ok) return;
      const b64 = (await res.text()).trim();
      img.src = 'data:image/webp;base64,' + b64;
      img.loading = 'lazy';
    } catch (e) {
      console.warn('product image', slug, e);
    }
  });
})();
