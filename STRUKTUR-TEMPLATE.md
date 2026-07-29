# Grundstruktur-Vorlage

Reine Struktur-Referenz ohne Design/CSS/Copy-Texte — dient als Bauplan, um den Grundaufbau
dieses Projekttyps (statische Website + Blog + Kontaktformular, Vercel-Deployment) in andere
Projekte zu übertragen. Namen (Kategorien, Domain, Texte) beim Übertragen selbst anpassen.

## Ordnerbaum

```
/
├── index.html                  Startseite
├── impressum.html
├── agb.html
├── datenschutz.html
├── kontakt.html                Kontaktformular-Seite
├── 401.html                    Error-Seiten, eine Datei pro Statuscode
├── 403.html
├── 404.html
├── 410.html
├── 500.html
├── 503.html
├── style.css                   Ein globales Stylesheet für die ganze Seite
├── script.js                   Seiten-spezifisches JS (z.B. nur für index.html)
├── page.js                     Site-weites JS (Cookie-Consent, Formular-Handling, Tracking)
├── sitemap.xml
├── robots.txt
├── vercel.json                 { "cleanUrls": true, "trailingSlash": false }
├── .htaccess                   Fallback-Rewrite für Apache-Hosting (extensionless URLs)
│
├── blog/
│   ├── index.html               Gesamtübersicht aller Artikel (neueste zuerst)
│   ├── kategorien.html          Kategorie-Kacheln/Übersicht
│   ├── <kategorie-1>/
│   │   ├── index.html           Kategorie-Übersicht (nur Artikel dieser Kategorie)
│   │   └── <artikel-slug>.html  Ein Artikel = eine Datei
│   ├── <kategorie-2>/
│   │   ├── index.html
│   │   └── <artikel-slug>.html
│   └── <kategorie-3>/
│       ├── index.html
│       └── <artikel-slug>.html
│
├── medien/
│   └── blog/
│       ├── <kategorie-1>/       Bild-Assets, spiegelt die Blog-Ordnerstruktur 1:1
│       ├── <kategorie-2>/
│       └── <kategorie-3>/
│
└── api/
    ├── <endpunkt>.js            Vercel Serverless Function (eigene Route, z.B. /api/kontakt)
    └── _<helfer>.js             Unterstrich-Präfix = wird NICHT zur eigenen Route,
                                  nur intern importierbar (z.B. Mail-Template-Bausteine)
```

Konkretes Beispiel für `<kategorie-*>`: `google-ads`, `kundengewinnung`, `webseite`.

## Neuen Blog-Artikel anlegen — Checkliste

Ein Artikel ist erst fertig, wenn er an **allen** folgenden Stellen verlinkt ist, nicht nur
als Datei existiert:

1. Artikel-Datei anlegen: `blog/<kategorie>/<artikel-slug>.html`
2. Verlinken in `blog/<kategorie>/index.html` (Artikel-Liste, neuester zuerst)
3. Verlinken in `blog/index.html` (globale Artikel-Liste, neuester zuerst)
4. Eintrag in `sitemap.xml` (URL ohne `.html`-Endung)
5. Falls neuer Drittdienst/neue Technologie im Artikel erwähnt wird: Abschnitt in
   `datenschutz.html` prüfen/ergänzen

### Zusätzlich bei einer komplett neuen Kategorie

1. Neuen Ordner `blog/<neue-kategorie>/` anlegen
2. `blog/<neue-kategorie>/index.html` als Kategorie-Übersichtsseite anlegen
3. Neue Kachel in `blog/kategorien.html` ergänzen
4. Kategorie-Index zusätzlich zum Artikel in `sitemap.xml` eintragen

## Namenskonventionen

- Kategorie-Ordner: lowercase, keine Leerzeichen, ein Wort oder mit Bindestrich
- Artikel-Dateinamen: kebab-case (z.B. `wie-funktioniert-x.html`)
- Interne Links **ohne** `.html`-Endung (z.B. `href="/blog/index"`), Dateien behalten aber die
  `.html`-Endung — funktioniert dank `cleanUrls` in `vercel.json` bzw. Rewrite-Regeln in
  `.htaccess`

## Formular- / API-Pattern

Für jede Funktion, die Daten serverseitig verarbeitet (Formular-Versand, o.ä.):

```
<seite>.html  →  <form> mit fetch() in page.js  →  api/<endpunkt>.js (Serverless Function)
                                                          │
                                                          └─→ externe API per HTTP
                                                              (kein npm-Package/package.json
                                                              nötig, direkter fetch() Aufruf)
```

- Secrets (API-Keys, Absender-/Empfänger-Adressen) ausschließlich als Environment-Variablen
  im Hosting-Dashboard (Vercel), **niemals** im Repo oder Client-JS
- Größere/wiederverwendbare Bausteine (z.B. HTML-Mail-Templates) in eigene Datei mit
  Unterstrich-Präfix im `api/`-Ordner auslagern, damit sie keine eigene Route werden

## Rechtsseiten-Pflicht

Jeder neue Drittdienst (E-Mail-Versand, Tracking-Skript, Formular-Anbieter, o.ä.) braucht
einen eigenen Absatz in `datenschutz.html` mit: Zweck der Verarbeitung, verarbeitete
Datenkategorien, Rechtsgrundlage, ggf. Empfänger/Drittland. Tracking über mehrere Besuche
hinweg (z.B. localStorage-Verlauf, Analytics) ist grundsätzlich einwilligungspflichtig
(§ 25 TDDDG) — nicht "unbedingt erforderlich" und daher niemals ohne Cookie-Consent aktiv.

## Root-Config-Dateien — Zweck

| Datei | Zweck |
|---|---|
| `sitemap.xml` | Kanonische URL-Liste für Suchmaschinen, extensionless URLs |
| `robots.txt` | Crawler-Freigabe, Verweis auf Sitemap |
| `vercel.json` | Clean-URLs, keine trailing slash |
| `.htaccess` | Apache-Rewrite-Fallback für extensionless URLs (falls nicht auf Vercel gehostet) |
