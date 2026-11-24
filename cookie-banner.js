(function () {
  var CHOICE = "et_consent";
  var path = location.pathname;
  var en = path === "/en" || path.indexOf("/en/") === 0;
  var policy = en ? "/en/cookies" : "/cookie";
  var onPolicy = path === "/cookie" || path === "/en/cookies" || path === "/termini" || path === "/en/terms";

  var copy = en
    ? {
        title: "Cookies",
        body: "Controller: Analytics 4 Sp. z o.o., Kraków. One necessary cookie remembers your choice. Measurement and marketing stay off unless you turn them on.",
        note: "You can refuse and keep browsing: the catalogue, quotes and contact page stay available.",
        policy: "Cookie notice",
        accept: "Accept",
        reject: "Reject",
        customize: "Customize",
        customTitle: "Choose the cookies",
        save: "Save choice",
        back: "Back",
        necessary: "Necessary",
        necessaryText: "Always on. et_consent, 6 months, remembers this choice. The chat text stays in this tab only and is not a tracking cookie.",
        analytics: "Measurement",
        analyticsText: "Off by default. No statistics cookie is set today. If you turn this on, we store consent for a visit measurement (for example Google Analytics), for 6 months.",
        marketing: "Marketing",
        marketingText: "Off by default. No advertising cookie is set today. If you turn this on, we store consent for Google Ads: ad storage, ad user data and ad personalisation, for 6 months.",
        reopen: "Cookies"
      }
    : {
        title: "Cookie",
        body: "Titolare: Analytics 4 Sp. z o.o., Cracovia. Un solo cookie tecnico ricorda la scelta. Misura e marketing restano spenti se non li attivi.",
        note: "Puoi rifiutare e navigare comunque: catalogo, preventivi e contatti restano disponibili.",
        policy: "Informativa cookie",
        accept: "Accetta",
        reject: "Rifiuta",
        customize: "Personalizza",
        customTitle: "Scegli i cookie",
        save: "Salva scelta",
        back: "Indietro",
        necessary: "Necessari",
        necessaryText: "Sempre attivi. et_consent, 6 mesi, ricorda questa scelta. Il testo della chat resta solo in questa scheda e non è un cookie di tracciamento.",
        analytics: "Misura",
        analyticsText: "Spenti se non li attivi. Oggi non impostiamo un cookie di statistica. Se li attivi, registriamo il consenso a una misura di visita (per esempio Google Analytics), per 6 mesi.",
        marketing: "Marketing",
        marketingText: "Spenti se non li attivi. Oggi non impostiamo un cookie pubblicitario. Se li attivi, registriamo il consenso a Google Ads: archiviazione annunci, dati utente e personalizzazione, per 6 mesi.",
        reopen: "Cookie"
      };

  function read() {
    var match = document.cookie.match(/(?:^|; )et_consent=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : "";
  }

  function prefs(value) {
    if (value === "all" || value === "a1m1") return { a: true, m: true };
    if (value === "a1m0") return { a: true, m: false };
    if (value === "a0m1") return { a: false, m: true };
    return { a: false, m: false };
  }

  function encode(a, m) {
    if (a && m) return "all";
    if (!a && !m) return "necessary";
    return "a" + (a ? "1" : "0") + "m" + (m ? "1" : "0");
  }

  function write(value) {
    var secure = location.protocol === "https:" ? "; Secure" : "";
    document.cookie = CHOICE + "=" + value + "; Path=/; Max-Age=15552000; SameSite=Lax" + secure;
    if (window.etConsentUpdate) window.etConsentUpdate(value);
    window.dataLayer = window.dataLayer || [];
    var choice = prefs(value);
    window.dataLayer.push({
      event: "cookie_consent_update",
      analytics_storage: choice.a ? "granted" : "denied",
      ad_storage: choice.m ? "granted" : "denied",
      ad_user_data: choice.m ? "granted" : "denied",
      ad_personalization: choice.m ? "granted" : "denied"
    });
  }

  function lock(on) {
    document.documentElement.classList.toggle("et-cookie-lock", on);
  }

  var css = document.createElement("style");
  css.textContent =
    "html.et-cookie-lock,html.et-cookie-lock body{overflow:hidden}" +
    ".et-cookie-wall{position:fixed;inset:0;z-index:10000;background:rgba(26,26,26,.62);display:flex;align-items:center;justify-content:center;padding:20px}" +
    ".et-cookie-dialog{width:min(560px,100%);max-height:min(640px,calc(100vh - 40px));overflow:auto;background:#fff;color:#202124;border-radius:16px;padding:28px 24px 22px;box-shadow:0 24px 60px rgba(0,0,0,.22);font-family:Inter,-apple-system,sans-serif}" +
    ".et-cookie-dialog h2{font-size:22px;line-height:1.25;margin:0 0 10px}" +
    ".et-cookie-dialog p{margin:0 0 12px;font-size:15px;line-height:1.55;color:#3c4043}" +
    ".et-cookie-note{background:#F8F9FA;border-radius:10px;padding:10px 12px}" +
    ".et-cookie-dialog a{color:#0B5CAD}" +
    ".et-cookie-actions{display:flex;gap:10px;margin-top:18px}" +
    ".et-cookie-actions button{flex:1;appearance:none;border-radius:10px;padding:12px 14px;font:600 15px Inter,-apple-system,sans-serif;text-align:center;cursor:pointer}" +
    ".et-cookie-reject,.et-cookie-custom{background:#fff;color:#202124;border:1.5px solid #202124}" +
    ".et-cookie-accept{background:#1182DE;color:#fff;border:1.5px solid #1182DE}" +
    ".et-cookie-row{display:flex;gap:14px;align-items:flex-start;justify-content:space-between;padding:12px 0;border-top:1px solid #E8EAED}" +
    ".et-cookie-row strong{display:block;font-size:15px}" +
    ".et-cookie-row p{margin:4px 0 0;font-size:13px;line-height:1.45}" +
    ".et-switch{flex:0 0 auto;width:46px;height:28px;margin-top:2px;border-radius:99px;border:1.5px solid #202124;background:#fff;position:relative;cursor:pointer;padding:0}" +
    ".et-switch[aria-checked=true]{background:#1182DE;border-color:#1182DE}" +
    ".et-switch[aria-disabled=true]{cursor:not-allowed}" +
    ".et-switch i{position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.25)}" +
    ".et-switch[aria-checked=true] i{left:21px}" +
    ".et-cookie-reopen{position:fixed;left:16px;bottom:16px;z-index:9000;background:#fff;color:#202124;border:1px solid #E8EAED;border-radius:999px;padding:8px 12px;font:600 13px Inter,-apple-system,sans-serif;cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,.08)}" +
    "@media(max-width:560px){.et-cookie-actions{flex-direction:column}}";
  document.head.appendChild(css);

  function field(className, text) {
    var el = document.createElement("button");
    el.type = "button";
    el.className = className;
    el.textContent = text;
    return el;
  }

  function row(name, text, on, locked) {
    var wrap = document.createElement("div");
    wrap.className = "et-cookie-row";
    var info = document.createElement("div");
    var strong = document.createElement("strong");
    strong.textContent = name;
    var p = document.createElement("p");
    p.textContent = text;
    info.appendChild(strong);
    info.appendChild(p);
    var toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "et-switch";
    toggle.setAttribute("role", "switch");
    toggle.setAttribute("aria-checked", on ? "true" : "false");
    toggle.setAttribute("aria-label", name);
    toggle.appendChild(document.createElement("i"));
    if (locked) {
      toggle.setAttribute("aria-disabled", "true");
      toggle.disabled = true;
    } else {
      toggle.addEventListener("click", function () {
        var next = toggle.getAttribute("aria-checked") !== "true";
        toggle.setAttribute("aria-checked", next ? "true" : "false");
      });
    }
    wrap.appendChild(info);
    wrap.appendChild(toggle);
    return { wrap: wrap, toggle: toggle };
  }

  function close(wall) {
    wall.remove();
    lock(false);
    showReopen();
  }

  function trap(dialog) {
    dialog.addEventListener("keydown", function (e) {
      if (e.key !== "Tab") return;
      var items = dialog.querySelectorAll("button:not([disabled]), a");
      if (!items.length) return;
      var first = items[0];
      var last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  }

  function open(mode) {
    var existing = document.querySelector(".et-cookie-wall");
    if (existing) existing.remove();
    lock(true);
    var wall = document.createElement("div");
    wall.className = "et-cookie-wall";
    var dialog = document.createElement("div");
    dialog.className = "et-cookie-dialog";
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-labelledby", "et-cookie-title");
    var title = document.createElement("h2");
    title.id = "et-cookie-title";
    var actions = document.createElement("div");
    actions.className = "et-cookie-actions";

    if (mode === "custom") {
      var current = prefs(read());
      title.textContent = copy.customTitle;
      var necessary = row(copy.necessary, copy.necessaryText, true, true);
      var analytics = row(copy.analytics, copy.analyticsText, current.a, false);
      var marketing = row(copy.marketing, copy.marketingText, current.m, false);
      var back = field("et-cookie-reject", copy.back);
      var save = field("et-cookie-custom", copy.save);
      var accept = field("et-cookie-accept", copy.accept);
      back.addEventListener("click", function () { open("ask"); });
      save.addEventListener("click", function () {
        var a = analytics.toggle.getAttribute("aria-checked") === "true";
        var m = marketing.toggle.getAttribute("aria-checked") === "true";
        write(encode(a, m));
        close(wall);
      });
      accept.addEventListener("click", function () {
        write("all");
        close(wall);
      });
      actions.appendChild(back);
      actions.appendChild(save);
      actions.appendChild(accept);
      dialog.appendChild(title);
      dialog.appendChild(necessary.wrap);
      dialog.appendChild(analytics.wrap);
      dialog.appendChild(marketing.wrap);
      dialog.appendChild(actions);
    } else {
      title.textContent = copy.title;
      var body = document.createElement("p");
      body.textContent = copy.body;
      var note = document.createElement("p");
      note.className = "et-cookie-note";
      note.textContent = copy.note;
      var policyLink = document.createElement("p");
      var link = document.createElement("a");
      link.href = policy;
      link.textContent = copy.policy;
      policyLink.appendChild(link);
      var reject = field("et-cookie-reject", copy.reject);
      var customize = field("et-cookie-custom", copy.customize);
      var accept = field("et-cookie-accept", copy.accept);
      reject.addEventListener("click", function () {
        write("necessary");
        close(wall);
      });
      customize.addEventListener("click", function () { open("custom"); });
      accept.addEventListener("click", function () {
        write("all");
        close(wall);
      });
      actions.appendChild(reject);
      actions.appendChild(customize);
      actions.appendChild(accept);
      dialog.appendChild(title);
      dialog.appendChild(body);
      dialog.appendChild(note);
      dialog.appendChild(policyLink);
      dialog.appendChild(actions);
    }

    wall.appendChild(dialog);
    document.body.appendChild(wall);
    trap(dialog);
    var focusable = dialog.querySelector("button:not([disabled]), a");
    if (focusable) focusable.focus();
  }

  function showReopen() {
    if (document.querySelector(".et-cookie-reopen")) return;
    var btn = field("et-cookie-reopen", copy.reopen);
    btn.addEventListener("click", function () {
      btn.remove();
      open("ask");
    });
    document.body.appendChild(btn);
  }

  if (read()) {
    showReopen();
    return;
  }
  if (onPolicy) {
    showReopen();
    return;
  }
  if (document.body) open("ask");
  else document.addEventListener("DOMContentLoaded", function () { open("ask"); });
})();
