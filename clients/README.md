# clients - one folder per client

## What this folder is

Each real client has ONE folder here: `clients/SLUG/`, where SLUG is a short lowercase name such as `acme`. The folder holds everything that makes that client's store different from the template: the preset chosen, the store configuration, the logo and images, the content pages, and the client's secrets.

## What is committed to Git

- `clients/README.md` (this file)
- `clients/_template/` (the blank template)

Everything else under `clients/` is **ignored by Git** on purpose. Real client folders contain private data and secrets. Back them up separately (see `deployment/backup-policy.md`).

## How to create a client store

1. Copy `clients/_template/` to `clients/SLUG/`.
2. Put the client's files in `clients/SLUG/assets/` (logo, favicon, share image, banners). Use only files the client owns or has licensed.
3. Edit `clients/SLUG/store.config.json`: preset, store names in Arabic and English, currency, colors, fonts, contact details, social links, navigation, home sections and their order, SEO text. No code is edited.
4. Write the content pages in `clients/SLUG/content/` (or use Bagisto CMS pages; Phase 2 decides).
5. Copy `.env.example` to `.env` and fill it in. Never commit `.env`.
6. Run the storefront with `STORE_CLIENT=SLUG` and check Arabic, English, mobile and desktop.

Later, `tools/new-client/` will automate steps 1 and 5 with a dry run first.

## Rules

- One client, one Bagisto instance, one database (ADR-005). Never share credentials between clients.
- Never copy data from one client to another.
- The template never contains real data.
