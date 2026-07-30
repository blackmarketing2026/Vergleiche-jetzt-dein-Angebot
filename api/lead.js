const nodemailer = require("nodemailer");
const { buildLeadMailHtml, buildLeadMailText } = require("./_leadMailTemplate");

const PHONE_PATTERN = /^[+0-9 ()/-]{6,20}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateLead(body) {
  const errors = {};

  if (!body.name || String(body.name).trim().length < 2) {
    errors.name = "Name ist ungültig.";
  }
  if (!body.location || String(body.location).trim().length < 2) {
    errors.location = "Ort ist ungültig.";
  }
  if (!body.phone || !PHONE_PATTERN.test(String(body.phone).trim())) {
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

  const lead = {
    name: String(body.name).trim(),
    company: body.company ? String(body.company).trim() : "",
    location: String(body.location).trim(),
    phone: String(body.phone).trim(),
    email: String(body.email).trim(),
  };

  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    LEAD_TO_EMAIL,
    LEAD_FROM_EMAIL,
  } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !LEAD_TO_EMAIL) {
    console.error("Lead-Mailversand nicht konfiguriert: SMTP_HOST/SMTP_USER/SMTP_PASS/LEAD_TO_EMAIL fehlen.");
    return res.status(500).json({ error: "mail_not_configured" });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: Number(SMTP_PORT) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    await transporter.sendMail({
      from: LEAD_FROM_EMAIL || SMTP_USER,
      to: LEAD_TO_EMAIL,
      replyTo: lead.email,
      subject: "Neue Anfrage: " + lead.name + " (" + lead.location + ")",
      text: buildLeadMailText(lead),
      html: buildLeadMailHtml(lead),
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Fehler beim Versand der Lead-E-Mail:", err);
    return res.status(500).json({ error: "send_failed" });
  }
};
