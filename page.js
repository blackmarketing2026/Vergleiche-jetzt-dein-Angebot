// Site-weites JS: Lead-Formular-Handling für index.html

(function () {
  const form = document.getElementById("lead-form");
  if (!form) return;

  const hatAngebotRadios = form.querySelectorAll('input[name="hat_angebot"]');
  const angebotFeld = document.getElementById("bestehendes-angebot-feld");

  hatAngebotRadios.forEach(function (radio) {
    radio.addEventListener("change", function () {
      angebotFeld.style.display = radio.value === "ja" && radio.checked ? "block" : "none";
    });
  });

  const submitBtn = document.getElementById("submit-btn");
  const messageBox = document.getElementById("form-message");

  function showMessage(text, type) {
    messageBox.textContent = text;
    messageBox.className = "form-message visible " + type;
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const formData = new FormData(form);
    const payload = {
      kundentyp: formData.get("kundentyp"),
      leistungen: formData.getAll("leistung"),
      hatAngebot: formData.get("hat_angebot") || null,
      angebotDetails: formData.get("angebot_details") || "",
      plz: formData.get("plz"),
      name: formData.get("name"),
      email: formData.get("email"),
      telefon: formData.get("telefon") || "",
      nachricht: formData.get("nachricht") || "",
      datenschutzAkzeptiert: formData.get("datenschutz") === "on"
    };

    submitBtn.disabled = true;
    submitBtn.textContent = "Wird gesendet ...";

    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Anfrage fehlgeschlagen");
      }

      showMessage(
        "Danke! Deine Anfrage wurde übermittelt. Wir melden uns bzw. passende Anbieter melden sich in Kürze bei dir.",
        "success"
      );
      form.reset();
      angebotFeld.style.display = "none";
    } catch (error) {
      showMessage(
        "Da ist leider etwas schiefgelaufen. Bitte versuche es später erneut oder schreib uns direkt.",
        "error"
      );
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Angebote kostenlos anfordern";
    }
  });
})();
