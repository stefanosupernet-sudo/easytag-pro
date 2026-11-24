/**
 * Consent Mode v2. Default is denied.
 * GA4 loads with the measurement ID below. Ads stays empty until an AW- ID is set.
 */
window.ET_TAGS = {
  ga4: "G-PJ35QJZZKL",
  ads: (window.ET_TAGS && window.ET_TAGS.ads) || ""
};

(function () {
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };

  window.gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
    functionality_storage: "denied",
    personalization_storage: "denied",
    security_storage: "granted",
    wait_for_update: 500
  });
  window.gtag("set", "ads_data_redaction", true);
  window.gtag("set", "url_passthrough", true);

  function prefs(value) {
    if (value === "all" || value === "a1m1") return { a: true, m: true };
    if (value === "a1m0") return { a: true, m: false };
    if (value === "a0m1") return { a: false, m: true };
    return { a: false, m: false };
  }

  window.etConsentUpdate = function (value) {
    var choice = prefs(value);
    window.gtag("consent", "update", {
      analytics_storage: choice.a ? "granted" : "denied",
      ad_storage: choice.m ? "granted" : "denied",
      ad_user_data: choice.m ? "granted" : "denied",
      ad_personalization: choice.m ? "granted" : "denied",
      personalization_storage: choice.m ? "granted" : "denied"
    });
  };

  window.etGaEvent = function (name, params) {
    window.gtag("event", name, params || {});
  };

  var saved = document.cookie.match(/(?:^|; )et_consent=([^;]*)/);
  if (saved) window.etConsentUpdate(decodeURIComponent(saved[1]));

  var ids = [window.ET_TAGS.ga4, window.ET_TAGS.ads].filter(function (id) {
    return typeof id === "string" && /^(G|AW)-[A-Z0-9]+$/i.test(id);
  });
  if (ids.length) {
    var loader = document.createElement("script");
    loader.async = true;
    loader.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(ids[0]);
    document.head.appendChild(loader);
    window.gtag("js", new Date());
    ids.forEach(function (id) {
      window.gtag("config", id);
    });
  }

  function once(key) {
    try {
      if (sessionStorage.getItem(key)) return false;
      sessionStorage.setItem(key, "1");
    } catch (e) {}
    return true;
  }

  function trackForm() {
    if (location.search.indexOf("inviato=1") === -1) return;
    if (!once("et_form_" + location.pathname)) return;
    var parts = location.pathname.split("/").filter(Boolean);
    window.etGaEvent("form_submit", {
      form_id: "quote",
      form_name: "preventivo",
      product: parts[parts.length - 1] || "quote"
    });
  }

  function trackPurchase() {
    var path = location.pathname.replace(/\.html$/, "").replace(/\/$/, "") || "/";
    if (path !== "/success" && path !== "/en/success") return;
    var id = new URLSearchParams(location.search).get("session_id") || "";
    if (!/^cs_(test_|live_)?[A-Za-z0-9]+$/.test(id)) return;
    var key = "et_purchase_" + id;
    try { if (sessionStorage.getItem(key)) return; } catch (e) {}
    fetch("/api/checkout-session?session_id=" + encodeURIComponent(id))
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (order) {
        if (!order || !order.transaction_id || typeof order.value !== "number") return;
        try { sessionStorage.setItem(key, "1"); } catch (e) {}
        window.etGaEvent("purchase", {
          transaction_id: order.transaction_id,
          value: order.value,
          currency: order.currency || "EUR",
          items: [{
            item_id: order.item_id,
            item_name: order.item_name,
            price: order.value,
            quantity: 1
          }]
        });
      })
      .catch(function () {});
  }

  document.addEventListener("submit", function (e) {
    var form = e.target;
    if (!form || form.nodeName !== "FORM") return;
    var action = form.getAttribute("action") || "";
    if (action.indexOf("mailto:") !== 0) return;
    window.etGaEvent("form_submit", { form_id: "contact", form_name: "contatti" });
  }, true);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { trackForm(); trackPurchase(); });
  } else {
    trackForm();
    trackPurchase();
  }
})();
