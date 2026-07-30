function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildLeadMailHtml(lead) {
  var rows = [
    ["Name", lead.name],
    ["Firma", lead.company || "-"],
    ["Ort", lead.location],
    ["Telefon", lead.phone],
    ["E-Mail", lead.email],
    ["Reinigungsart", lead.cleaningType && lead.cleaningType.length ? lead.cleaningType.join(", ") : "-"],
    ["Anzahl Räume", lead.rooms || "-"],
    ["Fläche", lead.squareMeters ? lead.squareMeters + " m²" : "-"],
  ];

  var rowsHtml = rows
    .map(function (row) {
      return (
        '<tr><td style="padding:8px 12px;font-weight:600;color:#16212b;border-bottom:1px solid #dce3ea;">' +
        escapeHtml(row[0]) +
        '</td><td style="padding:8px 12px;color:#16212b;border-bottom:1px solid #dce3ea;">' +
        escapeHtml(row[1]) +
        "</td></tr>"
      );
    })
    .join("");

  return (
    '<div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;max-width:560px;margin:0 auto;">' +
    '<h2 style="color:#1d4e89;">Neue Anfrage über das Vergleichsformular</h2>' +
    '<table style="width:100%;border-collapse:collapse;margin-top:12px;">' +
    rowsHtml +
    "</table>" +
    '<p style="color:#5c6b77;font-size:13px;margin-top:16px;">Eingegangen am ' +
    new Date().toLocaleString("de-DE") +
    " über vergleiche-jetzt-dein-angebot.</p>" +
    "</div>"
  );
}

function buildLeadMailText(lead) {
  return [
    "Neue Anfrage über das Vergleichsformular",
    "Name: " + lead.name,
    "Firma: " + (lead.company || "-"),
    "Ort: " + lead.location,
    "Telefon: " + lead.phone,
    "E-Mail: " + lead.email,
    "Reinigungsart: " + (lead.cleaningType && lead.cleaningType.length ? lead.cleaningType.join(", ") : "-"),
    "Anzahl Räume: " + (lead.rooms || "-"),
    "Fläche: " + (lead.squareMeters ? lead.squareMeters + " m²" : "-"),
    "Eingegangen am " + new Date().toLocaleString("de-DE"),
  ].join("\n");
}

module.exports = { buildLeadMailHtml: buildLeadMailHtml, buildLeadMailText: buildLeadMailText };
