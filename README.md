# Maru Online — Client Briefing Forms (v2)

This repo contains two client-facing briefing forms:

- **Web Development Briefing:** `maru-web-dev-briefing-v2.html`
- **AI Solution Briefing:** `ai-solution-briefing-v2.html`

Shared assets:
- `styles.css`
- `assets/maru-logo.png`
- `thank-you.html` (redirect target after successful submission)

## 1) Host on GitHub Pages
1. Create a new public repository (e.g., `maru-briefing-forms`).
2. Copy these files to the repo root, preserving folders:
   ```
   /
   ├── maru-web-dev-briefing-v2.html
   ├── ai-solution-briefing-v2.html
   ├── thank-you.html
   ├── styles.css
   └── assets/
       └── maru-logo.png
   ```
3. In **Settings → Pages**, choose **Deploy from branch** (e.g., `main`, root).
4. Your forms will be reachable at:
   - `https://<username>.github.io/<repo>/maru-web-dev-briefing-v2.html`
   - `https://<username>.github.io/<repo>/ai-solution-briefing-v2.html`

> GitHub Pages alone does not capture submissions. Use Netlify for form handling.

## 2) Enable Form Handling on Netlify (recommended)
1. Connect the repository to **Netlify** and deploy.
2. The forms already include:
   - `data-netlify="true"`
   - `netlify-honeypot="bot-field"` (spam protection)
   - Hidden input: `<input type="hidden" name="form-name" ...>`
   - `action="/thank-you.html"` redirect after success
3. In **Netlify → Forms**, you’ll see two forms by their `name` attributes:
   - `maru-web-dev-brief-v2`
   - `maru-ai-solution-brief-v2`
4. Optional: Set up **Notifications** → email or Slack.
5. Optional: Add **Zapier / n8n** integration to pipe submissions into:
   - HubSpot (create contact + deal)
   - Google Sheets (archive)
   - Monday.com (create item)
   - Slack (notify channel)

## 3) POPIA Compliance
- Each form includes a **required consent checkbox** and a link to the Privacy Policy (`https://maruonline.com/privacy`). Update the URL as needed.
- Suggested data retention: archive submissions for 12 months, then delete. Honour deletion requests promptly.
- Limit access to form submissions to authorised staff only.

## 4) Access & Distribution Best Practices
- Link the forms from your website nav: **/Briefing Forms**.
- Create a **CTA button** on your contact page: “Start Your Project Brief”.
- Generate **QR codes** that link to each form for proposals, PDFs, and events.
- Share direct links via **email and WhatsApp** for prospects.

## 5) Mobile Experience
The forms are **responsive** by default. For best mobile UX, consider evolving to a multi-step wizard (fewer fields per view). Suggested enhancements:
- Chunk into steps (Current Systems → Overview → Functionality → Content → Design → Tech → Budget → Review).
- Persist progress (localStorage) for long forms.
- Add inline validation and clearer helper text for mobile users.

## 6) Local Development
Open `.html` files in your browser. No build step required.

## 7) Customisation
- Update colours in `styles.css`.
- Replace `assets/maru-logo.png` with your latest logo.
- Add new fields by cloning existing `<label> + <input>` patterns.

---

© 2025 Maru Online
