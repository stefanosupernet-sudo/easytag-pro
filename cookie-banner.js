(function () {
  var CHOICE = "et_consent";
  var path = location.pathname;
  var en = path === "/en" || path.indexOf("/en/") === 0;
  var policy = en ? "/en/cookies" : "/cookie";
  var onPolicy = path === "/cookie" || path === "/en/cookies";

  var copy = en
    ? {
        title: "Cookies",
        body: "This site uses necessary cookies so the page and the chat memory work. Measurement cookies run only if you accept. Controller: Easy Tag Solutions, info@easytag.pro.",
        note: "You can refuse and keep browsing: the catalogue, quotes and contact page stay available.",
        policy: "Cookie notice",
        accept: "Accept",
        reject: "Reject",
        reopen: "Cookies"
      }
    : {
        title: "Cookie",
        body: "Questo sito usa cookie tecnici necessari al funzionamento della pagina e alla memoria della chat. I cookie di misura partono solo se accetti. Titolare: Easy Tag Solutions, info@easytag.pro.",
        note: "Puoi rifiutare e navigare comunque: catalogo, preventivi e contatti restano disponibili.",
        policy: "Informativa cookie",
        accept: "Accetta",
        reject: "Rifiuta",
        reopen: "Cookie"
      };

  function read() {
    var match = document.cookie.match(/(?:^|; )et_consent=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : "";
  }

  function write(value) {
    var secure = location.protocol === "https:" ? "; Secure" : "";
    document.cookie = CHOICE + "=" + value + "; Path=/; Max-Age=15552000; SameSite=Lax" + secure;
    window.dataLayer = window.dataLayer || [];
    var granted = value === "all" ? "granted" : "denied";
    window.dataLayer.push({
      event: "cookie_consent_update",
      analytics_storage: granted,
      ad_storage: granted,
      ad_user_data: granted,
      ad_personalization: granted
    });
  }

  function lock(on) {
    document.documentElement.classList.toggle("et-cookie-lock", on);
  }

  var css = document.createElement("style");
  css.textContent =
    "html.et-cookie-lock,html.et-cookie-lock body{overflow:hidden}" +
    ".et-cookie-wall{position:fixed;inset:0;z-index:10000;background:rgba(26,26,26,.62);display:flex;align-items:center;justify-content:center;padding:20px}" +
    ".et-cookie-dialog{width:min(560px,100%);background:#fff;color:#202124;border-radius:16px;padding:28px 24px 22px;box-shadow:0 24px 60px rgba(0,0,0,.22);font-family:Inter,-apple-system,sans-serif}" +
    ".et-cookie-dialog h2{font-size:22px;line-height:1.25;margin:0 0 10px}" +
    ".et-cookie-dialog p{margin:0 0 12px;font-size:15px;line-height:1.55;color:#3c4043}" +
    ".et-cookie-note{background:#F8F9FA;border-radius:10px;padding:10px 12px}" +
    ".et-cookie-dialog a{color:#0B5CAD}" +
    ".et-cookie-actions{display:flex;gap:10px;margin-top:18px}" +
    ".et-cookie-actions button,.et-cookie-actions a.et-cookie-btn{flex:1;appearance:none;border-radius:10px;padding:12px 14px;font:600 15px Inter,-apple-system,sans-serif;text-align:center;cursor:pointer;text-decoration:none}" +
    ".et-cookie-reject,.et-cookie-stay{background:#fff;color:#202124;border:1.5px solid #202124}" +
    ".et-cookie-accept,.et-cookie-home{background:#1182DE;color:#fff;border:1.5px solid #1182DE}" +
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

    title.textContent = copy.title;
      var body = document.createElement("p");
      body.textContent = copy.body;
      var note = document.createElement("p");
      note.className = "et-cookie-note";
      note.textContent = copy.note;
      var policyLink = document.createElement("p");
      var a = document.createElement("a");
      a.href = policy;
      a.textContent = copy.policy;
      policyLink.appendChild(a);
      var reject = field("et-cookie-reject", copy.reject);
      var accept = field("et-cookie-accept", copy.accept);
      reject.addEventListener("click", function () {
        write("necessary");
        wall.remove();
        lock(false);
        showReopen();
      });
      accept.addEventListener("click", function () {
        write("all");
        wall.remove();
        lock(false);
        showReopen();
      });
      actions.appendChild(reject);
      actions.appendChild(accept);
      dialog.appendChild(title);
      dialog.appendChild(body);
      dialog.appendChild(note);
      dialog.appendChild(policyLink);
      dialog.appendChild(actions);

    wall.appendChild(dialog);
    document.body.appendChild(wall);
    var focusable = dialog.querySelector("button, a");
    if (focusable) focusable.focus();
    dialog.addEventListener("keydown", function (e) {
      if (e.key !== "Tab") return;
      var items = dialog.querySelectorAll("button, a");
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
