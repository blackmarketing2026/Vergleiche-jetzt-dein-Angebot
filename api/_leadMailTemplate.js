// Baustein: HTML-Mail-Template für eingehende Leads. Kein eigener Route-Endpunkt
// (Unterstrich-Präfix), wird nur von api/lead.js importiert.

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderLeadEmailHtml(lead) {
  const leistungen = lead.leistungen && lead.leistungen.length
    ? lead.leistungen.map(escapeHtml).join(", ")
    : "keine Angabe";

  return `
    <h2>Neue Reinigungs-Anfrage</h2>
    <table cellpadding="6" cellspacing="0" border="0">
      <tr><td><strong>Kundentyp</strong></td><td>${escapeHtml(lead.kundentyp || "-")}</td></tr>
      <tr><td><strong>Gewünschte Leistungen</strong></td><td>${leistungen}</td></tr>
      <tr><td><strong>Bestehendes Angebot?</strong></td><td>${escapeHtml(lead.hatAngebot || "-")}</td></tr>
      <tr><td><strong>Details zum bestehenden Angebot</strong></td><td>${escapeHtml(lead.angebotDetails || "-")}</td></tr>
      <tr><td><strong>PLZ / Ort</strong></td><td>${escapeHtml(lead.plz || "-")}</td></tr>
      <tr><td><strong>Name</strong></td><td>${escapeHtml(lead.name || "-")}</td></tr>
      <tr><td><strong>E-Mail</strong></td><td>${escapeHtml(lead.email || "-")}</td></tr>
      <tr><td><strong>Telefon</strong></td><td>${escapeHtml(lead.telefon || "-")}</td></tr>
      <tr><td><strong>Nachricht</strong></td><td>${escapeHtml(lead.nachricht || "-")}</td></tr>
    </table>
  `;
}

module.exports = { renderLeadEmailHtml };
