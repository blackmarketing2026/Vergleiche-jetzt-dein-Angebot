// Vercel Serverless Function: POST /api/lead
// Nimmt Formular-Daten von index.html entgegen und verschickt sie per E-Mail.
// Benötigte Environment-Variablen (im Vercel-Dashboard setzen, nicht im Repo):
//   RESEND_API_KEY       API-Key des E-Mail-Versanddienstes (resend.com)
//   LEAD_RECIPIENT_EMAIL Empfänger-Adresse für neue Leads
//   LEAD_SENDER_EMAIL    Verifizierte Absender-Adresse (z.B. anfrage@deine-domain.de)

const { renderLeadEmailHtml } = require("./_leadMailTemplate");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const lead = req.body || {};

  if (!lead.name || !lead.email || !lead.plz || !lead.datenschutzAkzeptiert) {
    return res.status(400).json({ error: "Pflichtfelder fehlen" });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const recipient = process.env.LEAD_RECIPIENT_EMAIL;
  const sender = process.env.LEAD_SENDER_EMAIL;

  if (!apiKey || !recipient || !sender) {
    console.error("E-Mail-Versand nicht konfiguriert: fehlende Environment-Variablen");
    return res.status(500).json({ error: "Serverkonfiguration unvollständig" });
  }

  try {
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        from: sender,
        to: recipient,
        reply_to: lead.email,
        subject: `Neue Reinigungs-Anfrage von ${lead.name} (${lead.plz})`,
        html: renderLeadEmailHtml(lead)
      })
    });

    if (!emailResponse.ok) {
      const errorBody = await emailResponse.text();
      console.error("Fehler beim E-Mail-Versand:", errorBody);
      return res.status(502).json({ error: "E-Mail konnte nicht versendet werden" });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Unerwarteter Fehler beim Lead-Versand:", error);
    return res.status(500).json({ error: "Interner Fehler" });
  }
};
