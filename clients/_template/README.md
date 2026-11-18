# Client template

Copy this folder to `clients/SLUG/`. Contents:

- `store.config.json` - everything that differs per client (no secrets).
- `.env.example` - secrets and endpoints. Copy to `.env`; never commit `.env`.
- `assets/` - logo, favicon, share image, banners.
- `content/` - content pages in Arabic and English (used when Bagisto CMS pages are not).

Field guide for `store.config.json`:
- `client`: internal name (for your records only).
- `store`: names (ar and en), `preset` (fashion, furniture, electronics or grocery), default locale, supported locales, currency.
- `branding`: logos, favicon, colors (primary, secondary, background, text, accent), heading and body fonts.
- `contact`, `social`: phone, WhatsApp, email, address, social links.
- `navigation`: header and footer links.
- `home.sections`: which sections are on, and their order.
- `seo`: title template, description, share image.
