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

  function buildBanner() {
    var wrap = document.createElement("div");
    wrap.id = "cookieBanner";
    wrap.className = "cookie-banner";
    wrap.setAttribute("role", "dialog");
    wrap.setAttribute("aria-label", "Cookie-Einstellungen");
    wrap.innerHTML =
      '<div class="cookie-banner-inner">' +
      '<div class="cookie-banner-text">' +
      "<strong>Cookie-Einstellungen</strong>" +
      '<p>Wir nutzen technisch notwendige Cookies immer. Optionale Analyse- und Marketing-Cookies setzen wir erst mit Ihrer Zustimmung. Details in unserer <a href="https://cleanteam-solingen.de/datenschutz/" target="_blank" rel="noopener">Datenschutzerkl&auml;rung</a>.</p>' +
      "</div>" +
      '<div class="cookie-banner-actions">' +
      '<button type="button" class="btn btn-secondary" id="cookieOpenSettings">Einstellungen</button>' +
      '<button type="button" class="btn btn-secondary" id="cookieRejectAll">Alle ablehnen</button>' +
      '<button type="button" class="btn btn-primary" id="cookieAcceptAll">Alle akzeptieren</button>' +
      "</div>" +
      '<div class="cookie-settings" id="cookieSettings" hidden>' +
      '<label class="cookie-toggle">' +
      "<span><strong>Notwendig</strong><br />Für den Betrieb der Website erforderlich.</span>" +
      '<input type="checkbox" checked disabled />' +
      "</label>" +
      '<label class="cookie-toggle">' +
      "<span><strong>Analyse</strong><br />Hilft uns, die Nutzung der Website zu verstehen (z. B. Google Analytics).</span>" +
      '<input type="checkbox" id="cookieAnalytics" />' +
      "</label>" +
      '<label class="cookie-toggle">' +
      "<span><strong>Marketing</strong><br />Für Anzeigen und Reichweitenmessung (z. B. Google Ads).</span>" +
      '<input type="checkbox" id="cookieMarketing" />' +
      "</label>" +
      '<button type="button" class="btn btn-primary btn-block" id="cookieSaveSettings">Auswahl speichern</button>' +
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
      var panel = document.getElementById("cookieSettings");
      panel.hidden = !panel.hidden;
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
    var panel = document.getElementById("cookieSettings");
    if (panel) panel.hidden = false;
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
