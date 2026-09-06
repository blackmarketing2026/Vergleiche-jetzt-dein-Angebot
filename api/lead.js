const nodemailer = require("nodemailer");
const { buildLeadMailHtml, buildLeadMailText } = require("./_leadMailTemplate");

const POSTAL_CODE_PATTERN = /^\d{5}$/;
const PHONE_PATTERN = /^[+\d\s()/.-]+$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_SERVICES = [
  "Büro- und Gewerbereinigung",
  "Treppenhausreinigung",
  "Fensterreinigung",
  "Praxisreinigung",
  "Bauendreinigung",
  "Sonstige Reinigung",
];

function parsePositiveDecimal(value) {
  if (value === null || value === undefined || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) && num > 0 ? num : null;
}

function validateLead(body) {
  const errors = {};

  const services = Array.isArray(body.services)
    ? body.services.map((v) => String(v)).filter((v) => ALLOWED_SERVICES.includes(v))
    : [];
  if (!services.length) {
    errors.services = "Bitte wählen Sie mindestens eine Reinigungsleistung aus.";
  }
  if (!body.postalCode || !POSTAL_CODE_PATTERN.test(String(body.postalCode).trim())) {
    errors.postalCode = "PLZ ist ungültig.";
  }
  if (parsePositiveDecimal(body.size) === null) {
    errors.size = "Objektgröße ist ungültig.";
  }
  if (!body.frequency || !String(body.frequency).trim()) {
    errors.frequency = "Häufigkeit fehlt.";
  }
  if (!body.fullName || String(body.fullName).trim().length < 2) {
    errors.fullName = "Name ist ungültig.";
  }
  const digits = String(body.phone || "").replace(/\D/g, "");
  if (!body.phone || !PHONE_PATTERN.test(String(body.phone).trim()) || digits.length < 6 || digits.length > 15) {
    errors.phone = "Telefonnummer ist ungültig.";
  }
  if (!body.email || !EMAIL_PATTERN.test(String(body.email).trim())) {
    errors.email = "E-Mail-Adresse ist ungültig.";
  }
  if (!body.consent) {
    errors.consent = "Einwilligung fehlt.";
  }

  return errors;
}

function createTransporter() {
  const { stmp_server, stmp_user, smtp_passwort, smtp_port, smtp_secure } = process.env;
  const port = smtp_port ? Number(smtp_port) : 587;
  const secure = smtp_secure ? smtp_secure === "true" : port === 465;

  return nodemailer.createTransport({
    host: stmp_server,
    port,
    secure,
    auth: { user: stmp_user, pass: smtp_passwort },
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "method_not_allowed" });
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch (err) {
      return res.status(400).json({ error: "invalid_json" });
    }
  }

  if (!body || typeof body !== "object") {
    return res.status(400).json({ error: "invalid_body" });
  }

  const errors = validateLead(body);
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ error: "validation_failed", fields: errors });
  }

  const services = body.services
    .map((v) => String(v).trim())
    .filter((v) => ALLOWED_SERVICES.includes(v));

  const lead = {
    services: services,
    postalCode: String(body.postalCode).trim(),
    size: parsePositiveDecimal(body.size),
    frequency: String(body.frequency).trim(),
    currentCost: body.currentCost ? String(body.currentCost).trim() : "",
    currentAmount: parsePositiveDecimal(body.currentAmount),
    fullName: String(body.fullName).trim(),
    phone: String(body.phone).trim(),
    email: String(body.email).trim(),
    company: body.company ? String(body.company).trim() : "",
  };

  const { smtp_empfaenger, stmp_server, stmp_user, smtp_passwort } = process.env;

  if (!smtp_empfaenger || !stmp_server || !stmp_user || !smtp_passwort) {
    console.error(
      "Lead-Mailversand nicht konfiguriert: smtp_empfaenger/stmp_server/stmp_user/smtp_passwort fehlen."
    );
    return res.status(500).json({ error: "mail_not_configured" });
  }

  try {
    const transporter = createTransporter();

    await transporter.sendMail({
      from: stmp_user.includes("@") ? `"Vergleiche jetzt dein Angebot" <${stmp_user}>` : stmp_user,
      to: smtp_empfaenger,
      replyTo: lead.email,
      subject: "Neue Angebotsanfrage: " + lead.fullName + " (" + lead.postalCode + ")",
      text: buildLeadMailText(lead),
      html: buildLeadMailHtml(lead),
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Fehler beim SMTP-Versand der Lead-E-Mail:", err);
    return res.status(500).json({ error: "send_failed" });
  }
};
