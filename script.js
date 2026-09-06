'use strict';

/**
 * VERSAND-SCHNITTSTELLE / PLATZHALTER
 * Hier später PHP, Make, Zapier oder eine eigene API anbinden.
 * Aktuell: ausschließlich Arbeitsspeicher + Browser-Konsole, kein Netzwerk,
 * keine Cookies, kein localStorage. Keine API-Schlüssel im Browser hinterlegen.
 * Bei echter Integration: auf bestätigten Server-Erfolg warten, bei Fehler werfen
 * und { demo: false } zurückgeben. Den Prüfschritt zum Einsatzgebiet dann nur
 * nach tatsächlicher Prüfung anzeigen oder entsprechend umbenennen.
 */
async function sendLead(data) {
  console.info('Angebotsanfrage (lokale Demo, nicht versendet):', data);
  return { demo: true };
}

(() => {
  const form = document.querySelector('#lead-form');
  const steps = [...document.querySelectorAll('.lf-step')];
  const progress = [...document.querySelectorAll('.lf-progress li')];
  const nextButton = document.querySelector('#next-button');
  const backButton = document.querySelector('#back-button');
  const formView = document.querySelector('#form-view');
  const processingView = document.querySelector('#processing-view');
  const successView = document.querySelector('#success-view');
  const processItems = [...document.querySelectorAll('.lf-processing-list li')];
  const stepNames = ['Reinigungsbedarf', 'Eckdaten', 'Kontaktdaten'];
  let currentStep = 1;
  let submitting = false;
  let leadData = {};

  function collectData() {
    const fields = new FormData(form);
    leadData = {
      services: fields.getAll('services'),
      postalCode: String(fields.get('postalCode') || '').trim(),
      size: fields.get('size'),
      frequency: fields.get('frequency'),
      currentCost: fields.get('currentCost') || 'Möchte ich nicht angeben',
      fullName: String(fields.get('fullName') || '').trim(),
      phone: String(fields.get('phone') || '').trim(),
      email: String(fields.get('email') || '').trim(),
      company: String(fields.get('company') || '').trim(),
      consent: fields.get('consent') === 'on'
    };
    return leadData;
  }

  function setError(name, message) {
    const error = document.getElementById(`${name}-error`);
    error.textContent = message;
    error.hidden = !message;
    const inputs = name === 'services' ? form.querySelectorAll('[name="services"]') : [form.elements[name]];
    for (const input of inputs) {
      if (message) input.setAttribute('aria-invalid', 'true');
      else input.removeAttribute('aria-invalid');
    }
  }

  function validate(step, moveFocus = true) {
    const data = collectData();
    const errors = {};
    if (step === 1) errors.services = data.services.length ? '' : 'Bitte wählen Sie mindestens eine Reinigungsleistung aus.';
    if (step === 2) {
      errors.postalCode = /^\d{5}$/.test(data.postalCode) ? '' : 'Bitte geben Sie eine fünfstellige deutsche PLZ ein.';
      errors.size = data.size ? '' : 'Bitte wählen Sie die Objektgröße aus.';
      errors.frequency = data.frequency ? '' : 'Bitte wählen Sie die gewünschte Häufigkeit aus.';
    }
    if (step === 3) {
      errors.fullName = data.fullName.length >= 2 && /\p{L}/u.test(data.fullName) ? '' : 'Bitte geben Sie Ihren Vor- und Nachnamen ein.';
      const digits = data.phone.replace(/\D/g, '');
      errors.phone = /^[+\d\s()\/.\-]+$/.test(data.phone) && digits.length >= 6 && digits.length <= 15 ? '' : 'Bitte geben Sie eine gültige Telefonnummer mit Vorwahl ein.';
      errors.email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) && !form.elements.email.validity.typeMismatch ? '' : 'Bitte geben Sie eine gültige E-Mail-Adresse ein.';
      errors.consent = data.consent ? '' : 'Bitte stimmen Sie der Verarbeitung und Kontaktaufnahme zu, um Ihre Anfrage abzusenden.';
    }
    Object.entries(errors).forEach(([name, message]) => setError(name, message));
    const firstError = steps[step - 1].querySelector('[aria-invalid="true"]');
    if (firstError && moveFocus) firstError.focus();
    return !firstError;
  }

  function showStep(step, focus = true) {
    currentStep = step;
    steps.forEach((section, index) => { section.hidden = index !== step - 1; });
    progress.forEach((item, index) => {
      item.classList.toggle('is-complete', index < step - 1);
      if (index === step - 1) item.setAttribute('aria-current', 'step');
      else item.removeAttribute('aria-current');
    });
    document.querySelector('#step-label').textContent = `Schritt ${step} von 3`;
    document.querySelector('#step-name').textContent = stepNames[step - 1];
    backButton.hidden = step === 1;
    nextButton.querySelector('span').textContent = step === 3 ? 'Individuelles Angebot kostenlos anfordern' : 'Weiter';
    if (focus) document.getElementById(`heading-${step}`).focus();
  }

  const delay = ms => new Promise(resolve => window.setTimeout(resolve, ms));

  function renderSummary(data) {
    const summary = document.querySelector('#lead-summary');
    summary.replaceChildren();
    for (const [label, value] of [['Leistungsart', data.services.join(', ')], ['PLZ', data.postalCode], ['Objektgröße', data.size], ['Häufigkeit', data.frequency]]) {
      const row = document.createElement('div');
      const term = document.createElement('dt');
      const description = document.createElement('dd');
      term.textContent = label;
      description.textContent = value;
      row.append(term, description);
      summary.append(row);
    }
  }

  async function showProcessing(data, result) {
    document.querySelectorAll('.lf-demo').forEach(note => { note.hidden = !result.demo; });
    formView.hidden = true;
    processingView.hidden = false;
    document.querySelector('#processing-heading').focus();
    for (const item of processItems) {
      item.classList.add('is-active');
      await delay(900);
      item.classList.replace('is-active', 'is-done');
      document.querySelector('#process-status').textContent = `${result.demo ? 'Demo: ' : ''}${item.textContent}`;
    }
    await delay(500);
    renderSummary(data);
    processingView.hidden = true;
    successView.hidden = false;
    document.querySelector('#success-heading').focus();
  }

  form.addEventListener('input', event => {
    collectData();
    if (event.target.hasAttribute('aria-invalid')) validate(currentStep, false);
  });
  form.addEventListener('change', collectData);
  backButton.addEventListener('click', () => {
    if (!submitting && currentStep > 1) showStep(currentStep - 1);
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (submitting || !validate(currentStep)) return;
    if (currentStep < 3) { showStep(currentStep + 1); return; }
    // Auch die vorherigen Schritte nochmals prüfen, bevor Daten übergeben werden.
    for (let step = 1; step <= 3; step++) {
      if (!validate(step, false)) { showStep(step); validate(step); return; }
    }
    submitting = true;
    nextButton.disabled = true;
    backButton.disabled = true;
    form.setAttribute('aria-busy', 'true');
    document.querySelector('#send-error').hidden = true;
    try {
      const data = { ...collectData(), services: [...leadData.services], submittedAt: new Date().toISOString() };
      const result = await sendLead(data);
      await showProcessing(data, result);
    } catch (error) {
      processingView.hidden = true;
      formView.hidden = false;
      const message = document.querySelector('#send-error');
      message.textContent = 'Ihre Anfrage konnte nicht übermittelt werden. Ihre Angaben sind noch vorhanden. Bitte versuchen Sie es erneut.';
      message.hidden = false;
      processItems.forEach(item => item.classList.remove('is-active', 'is-done'));
      nextButton.focus();
    } finally {
      submitting = false;
      nextButton.disabled = false;
      backButton.disabled = false;
      form.removeAttribute('aria-busy');
    }
  });
  document.querySelector('#restart-button').addEventListener('click', () => {
    form.reset();
    leadData = {};
    form.querySelectorAll('[aria-invalid]').forEach(input => input.removeAttribute('aria-invalid'));
    form.querySelectorAll('.lf-error').forEach(error => { error.hidden = true; error.textContent = ''; });
    processItems.forEach(item => item.classList.remove('is-active', 'is-done'));
    document.querySelector('#process-status').textContent = '';
    document.querySelector('#lead-summary').replaceChildren();
    successView.hidden = true;
    processingView.hidden = true;
    formView.hidden = false;
    showStep(1);
  });
  showStep(1, false);
})();
