# /gallery - the template gallery (leaf)

Shows every preset as a card: thumbnail, Arabic and English names, industry tags, status badge (planned, preview, ready), **Preview** (opens `/preview/[preset]`) and **Choose** (opens WhatsApp or email with the preset name prefilled).

Data comes from `storefront/src/gallery/content/presets.json`. A preset is never shown as ready before its readiness checklist passes (see `docs/architecture/FILE_STRUCTURE.md`).
