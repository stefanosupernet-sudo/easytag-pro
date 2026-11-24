/**
 * Consent Mode v2. Default is denied.
 * When the Google IDs exist, paste them here. Until then no Google tag is loaded.
 * ga4: "G-XXXXXXXX"   ads: "AW-XXXXXXXX"
 */
window.ET_TAGS = window.ET_TAGS || { ga4: "", ads: "" };

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

  var saved = document.cookie.match(/(?:^|; )et_consent=([^;]*)/);
  if (saved) window.etConsentUpdate(decodeURIComponent(saved[1]));

  var ids = [window.ET_TAGS.ga4, window.ET_TAGS.ads].filter(function (id) {
    return typeof id === "string" && /^(G|AW)-[A-Z0-9]+$/i.test(id);
  });
  if (!ids.length) return;

  var loader = document.createElement("script");
  loader.async = true;
  loader.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(ids[0]);
  document.head.appendChild(loader);
  window.gtag("js", new Date());
  ids.forEach(function (id) {
    window.gtag("config", id);
  });
})();
