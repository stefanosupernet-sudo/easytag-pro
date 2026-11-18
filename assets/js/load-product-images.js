/** img[data-product="slug"] → loads /assets/products/{slug}.webp.b64 */
(function () {
  document.querySelectorAll("img[data-product]").forEach(async function (img) {
    var slug = img.getAttribute("data-product");
    if (!slug) return;
    try {
      var res = await fetch("/assets/products/" + slug + ".webp.b64");
      if (!res.ok) return;
      var b64 = (await res.text()).replace(/\s+/g, "");
      img.src = "data:image/webp;base64," + b64;
    } catch (e) {
      console.warn("ET image", slug, e);
    }
  });
})();
