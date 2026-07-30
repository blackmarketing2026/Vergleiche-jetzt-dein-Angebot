(function () {
  "use strict";

  /* Footer year */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* Mobile navigation toggle */
  var navToggle = document.getElementById("navToggle");
  var mobileNav = document.getElementById("mobileNav");

  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", function () {
      var isOpen = mobileNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    mobileNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mobileNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* Lead form handling */
  var form = document.getElementById("leadForm");
  if (!form) return;

  var submitBtn = document.getElementById("submitBtn");
  var statusEl = document.getElementById("formStatus");

  var PHONE_PATTERN = /^[+0-9 ()/-]{6,20}$/;
  var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  var validators = {
    name: function (value) {
      return value.trim().length >= 2 ? "" : "Bitte geben Sie Ihren Namen ein.";
    },
    location: function (value) {
      return value.trim().length >= 2 ? "" : "Bitte geben Sie Ihren Ort ein.";
    },
    phone: function (value) {
      return PHONE_PATTERN.test(value.trim())
        ? ""
        : "Bitte geben Sie eine gültige Telefonnummer ein.";
    },
    email: function (value) {
      return EMAIL_PATTERN.test(value.trim())
        ? ""
        : "Bitte geben Sie eine gültige E-Mail-Adresse ein.";
    },
    consent: function (checked) {
      return checked ? "" : "Bitte stimmen Sie der Datenverarbeitung zu.";
    },
  };

  function showFieldError(field, message) {
    var el = form.querySelector('[data-error-for="' + field + '"]');
    if (el) el.textContent = message;
  }

  function validateField(name) {
    var el = form.elements[name];
    if (!el || !validators[name]) return true;

    var value = el.type === "checkbox" ? el.checked : el.value;
    var message = validators[name](value);
    el.setAttribute("data-touched", "true");
    showFieldError(name, message);
    return message === "";
  }

  ["name", "location", "phone", "email"].forEach(function (field) {
    var el = form.elements[field];
    if (!el) return;
    el.addEventListener("blur", function () {
      validateField(field);
    });
  });

  var consentEl = form.elements["consent"];
  if (consentEl) {
    consentEl.addEventListener("change", function () {
      validateField("consent");
    });
  }

  function setStatus(type, message) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.className = "form-status is-visible " + type;
  }

  function clearStatus() {
    if (!statusEl) return;
    statusEl.textContent = "";
    statusEl.className = "form-status";
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    clearStatus();

    var fields = ["name", "location", "phone", "email", "consent"];
    var isValid = fields
      .map(validateField)
      .every(function (ok) {
        return ok;
      });

    if (!isValid) {
      setStatus("error", "Bitte prüfen Sie Ihre Eingaben.");
      return;
    }

    var payload = {
      name: form.elements["name"].value.trim(),
      company: form.elements["company"].value.trim(),
      location: form.elements["location"].value.trim(),
      phone: form.elements["phone"].value.trim(),
      email: form.elements["email"].value.trim(),
      consent: form.elements["consent"].checked,
    };

    submitBtn.disabled = true;
    submitBtn.textContent = "Wird gesendet...";

    fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(function (response) {
        if (!response.ok) throw new Error("request_failed");
        return response.json();
      })
      .then(function () {
        setStatus(
          "success",
          "Vielen Dank! Ihre Anfrage wurde erfolgreich übermittelt. Wir melden uns in Kürze."
        );
        form.reset();
      })
      .catch(function () {
        setStatus(
          "error",
          "Beim Senden ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut oder kontaktieren Sie uns direkt."
        );
      })
      .finally(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = "Jetzt unverbindlich Angebote anfordern";
      });
  });
})();
