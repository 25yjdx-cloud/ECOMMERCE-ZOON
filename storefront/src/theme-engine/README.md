# src/theme-engine

Chooses and wires the active preset.

- Registry: the ONLY whitelist of preset ids (fashion, furniture, electronics, grocery). Never import a path built from user input.
- Resolution: store mode reads the preset id from the client's `store.config.json`; gallery mode reads it from the route. Every value is validated against the registry.
- Provider: exposes the preset id, the store configuration and a link helper so components never hardcode URLs.
- Tokens: turns branding from `store.config.json` into CSS variables, in layers: global styles, shared tokens, preset styles, client overrides.
- Sections registry: maps home section ids (hero, featuredCategories, bestSellers, newArrivals, promoBanners, newsletter) to components.
