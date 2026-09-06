function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatDecimal(value) {
  return Number(value).toLocaleString("de-DE", { maximumFractionDigits: 2 });
}

function buildRows(lead) {
  var rows = [
    ["Leistungsart", lead.services && lead.services.length ? lead.services.join(", ") : "-"],
    ["PLZ", lead.postalCode],
    ["Objektgröße", lead.size !== null ? formatDecimal(lead.size) + " m²" : "-"],
    ["Häufigkeit", lead.frequency],
    ["Aktuelle Reinigung", lead.currentCost || "-"],
  ];

  if (lead.currentAmount !== null) {
    rows.push(["Aktueller Betrag", formatDecimal(lead.currentAmount) + " €"]);
  }

  rows.push(
    ["Name", lead.fullName],
    ["Telefon", lead.phone],
    ["E-Mail", lead.email],
    ["Firma", lead.company || "-"]
  );

  return rows;
}

function buildLeadMailHtml(lead) {
  var rowsHtml = buildRows(lead)
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
    '<h2 style="color:#1d4e89;">Neue Angebotsanfrage über das Vergleichsformular</h2>' +
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
  var lines = ["Neue Angebotsanfrage über das Vergleichsformular"];
  buildRows(lead).forEach(function (row) {
    lines.push(row[0] + ": " + row[1]);
  });
  lines.push("Eingegangen am " + new Date().toLocaleString("de-DE"));
  return lines.join("\n");
}

module.exports = { buildLeadMailHtml: buildLeadMailHtml, buildLeadMailText: buildLeadMailText };
