(function () {
  "use strict";

  var CONSENT_KEY = "cookieConsent";
  var CONSENT_VERSION = 1;
  var CONSENT_MAX_AGE_DAYS = 365;

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = window.gtag || gtag;

  function readConsent() {
    try {
      var raw = localStorage.getItem(CONSENT_KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (data.version !== CONSENT_VERSION) return null;
      var ageDays = (Date.now() - data.timestamp) / (1000 * 60 * 60 * 24);
      if (ageDays > CONSENT_MAX_AGE_DAYS) return null;
      return data;
    } catch (e) {
      return null;
    }
  }

  function writeConsent(categories) {
    localStorage.setItem(
      CONSENT_KEY,
      JSON.stringify({ version: CONSENT_VERSION, timestamp: Date.now(), categories: categories })
    );
  }

  function applyConsent(categories) {
    gtag("consent", "update", {
      analytics_storage: categories.analytics ? "granted" : "denied",
      ad_storage: categories.marketing ? "granted" : "denied",
      ad_user_data: categories.marketing ? "granted" : "denied",
      ad_personalization: categories.marketing ? "granted" : "denied",
    });
  }

  function toggleRow(id, label, description, opts) {
    opts = opts || {};
    var disabledAttr = opts.locked ? " checked disabled" : "";
    var checkedAttr = opts.checked ? " checked" : "";
    return (
      '<div class="cookie-toggle-row">' +
      '<div class="cookie-toggle-icon">' + opts.icon + "</div>" +
      '<div class="cookie-toggle-info">' +
      "<strong>" + label + "</strong>" +
      "<span>" + description + "</span>" +
      "</div>" +
      '<label class="toggle-switch' + (opts.locked ? " is-locked" : "") + '">' +
      '<input type="checkbox"' + (opts.locked ? disabledAttr : ' id="' + id + '"' + checkedAttr) + " />" +
      '<span class="toggle-track"><span class="toggle-thumb"></span></span>' +
      "</label>" +
      "</div>"
    );
  }

  var ICON_LOCK =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>';
  var ICON_CHART =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V10M12 20V4M20 20v-7"/></svg>';
  var ICON_MEGAPHONE =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11v2a2 2 0 0 0 2 2h1l3 6 2-1-2.5-5H12l7 4V5l-7 4H6a2 2 0 0 0-2 2Z"/><path d="M15 9v6"/></svg>';

  function buildBanner() {
    var wrap = document.createElement("div");
    wrap.id = "cookieBanner";
    wrap.className = "cookie-banner";
    wrap.setAttribute("role", "dialog");
    wrap.setAttribute("aria-label", "Cookie-Einstellungen");
    wrap.innerHTML =
      '<div class="cookie-banner-inner">' +
      '<div class="cookie-banner-text">' +
      "<strong>Wir respektieren Ihre Privatsph&auml;re</strong>" +
      '<p>Notwendige Cookies laufen immer. Analyse- und Marketing-Cookies setzen wir nur mit Ihrer Zustimmung. Details in unserer <a href="https://cleanteam-solingen.de/datenschutz/" target="_blank" rel="noopener">Datenschutzerkl&auml;rung</a>.</p>' +
      "</div>" +
      '<div class="cookie-banner-actions">' +
      '<button type="button" class="cookie-link-btn" id="cookieOpenSettings" aria-expanded="false" aria-controls="cookieSettings">' +
      "Einstellungen" +
      '<svg class="cookie-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>' +
      "</button>" +
      '<button type="button" class="btn btn-secondary" id="cookieRejectAll">Ablehnen, nur die Notwendigsten</button>' +
      '<button type="button" class="btn btn-primary" id="cookieAcceptAll">Alles erlauben</button>' +
      "</div>" +
      '<div class="cookie-settings" id="cookieSettings">' +
      '<div class="cookie-settings-inner">' +
      toggleRow(null, "Notwendig", "Für den Betrieb der Website erforderlich.", { locked: true, icon: ICON_LOCK }) +
      toggleRow("cookieAnalytics", "Analyse", "Hilft uns, die Nutzung der Website zu verstehen (z. B. Google Analytics).", { icon: ICON_CHART }) +
      toggleRow("cookieMarketing", "Marketing", "Für Anzeigen und Reichweitenmessung (z. B. Google Ads).", { icon: ICON_MEGAPHONE }) +
      '<button type="button" class="btn btn-primary btn-block" id="cookieSaveSettings">Auswahl speichern</button>' +
      "</div>" +
      "</div>" +
      "</div>";
    document.body.appendChild(wrap);

    document.getElementById("cookieAcceptAll").addEventListener("click", function () {
      var categories = { analytics: true, marketing: true };
      writeConsent(categories);
      applyConsent(categories);
      hideBanner();
    });

    document.getElementById("cookieRejectAll").addEventListener("click", function () {
      var categories = { analytics: false, marketing: false };
      writeConsent(categories);
      applyConsent(categories);
      hideBanner();
    });

    document.getElementById("cookieOpenSettings").addEventListener("click", function () {
      toggleSettingsPanel();
    });

    document.getElementById("cookieSaveSettings").addEventListener("click", function () {
      var categories = {
        analytics: document.getElementById("cookieAnalytics").checked,
        marketing: document.getElementById("cookieMarketing").checked,
      };
      writeConsent(categories);
      applyConsent(categories);
      hideBanner();
    });
  }

  function toggleSettingsPanel(forceOpen) {
    var panel = document.getElementById("cookieSettings");
    var trigger = document.getElementById("cookieOpenSettings");
    if (!panel) return;
    var willOpen = typeof forceOpen === "boolean" ? forceOpen : !panel.classList.contains("is-open");
    panel.classList.toggle("is-open", willOpen);
    if (trigger) trigger.setAttribute("aria-expanded", String(willOpen));
  }

  function showBanner() {
    var existing = document.getElementById("cookieBanner");
    if (existing) {
      existing.classList.add("is-visible");
      return;
    }
    buildBanner();
    requestAnimationFrame(function () {
      document.getElementById("cookieBanner").classList.add("is-visible");
    });
  }

  function hideBanner() {
    var el = document.getElementById("cookieBanner");
    if (el) el.classList.remove("is-visible");
  }

  window.openCookieSettings = function () {
    showBanner();
    toggleSettingsPanel(true);
    var stored = readConsent();
    if (stored) {
      document.getElementById("cookieAnalytics").checked = !!stored.categories.analytics;
      document.getElementById("cookieMarketing").checked = !!stored.categories.marketing;
    }
  };

  document.addEventListener("DOMContentLoaded", function () {
    var stored = readConsent();
    if (stored) {
      applyConsent(stored.categories);
    } else {
      showBanner();
    }

    var footerLink = document.getElementById("cookieSettingsLink");
    if (footerLink) {
      footerLink.addEventListener("click", function (e) {
        e.preventDefault();
        window.openCookieSettings();
      });
    }
  });
})();
