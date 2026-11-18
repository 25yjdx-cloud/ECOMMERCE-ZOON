# themes/lifestyle - one theme family, many presets

One family of presentation components, shared by all presets. A preset only sets defaults and layout choices. This is ADR-020.

## Contents

- `components/` - shared family components: product card, hero, category card, cart drawer, filters.
- `layouts/` - header, footer, mobile navigation, page shell.
- `sections/` - home sections: hero, featured categories, best sellers, new arrivals, promo banners, newsletter.
- `pages/` - the 20 required pages in one shared form.
- `styles/` - family styles built on design tokens.
- `presets/` - one folder per industry (see its README).

## When to add a new family

Only when a new industry cannot be expressed as a preset (for example, a fundamentally different layout). Otherwise add a preset.

## Readiness

A preset is `ready` only when the checklist in `docs/architecture/FILE_STRUCTURE.md` passes.
