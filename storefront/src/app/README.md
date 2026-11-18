# storefront/src/app

Next.js routes. Keep files thin: each route picks the right page from the active preset (or the gallery) and passes data from `services`.

Routes planned:
- `/` - gallery home (two featured presets) in gallery mode; preset home in store mode.
- `/gallery` - all presets. Leaf folder: `gallery/`.
- `/preview/[preset]/[[...path]]` - live preview (gallery mode only).
- `(store)/...` - the store pages (store mode only): products, category, product, search, cart, checkout, account, wishlist, content pages.
- `api/...` - server-side proxy to Bagisto (adds the key on the server), authentication, health check, revalidation.
- `robots.ts` and `sitemap.ts` - public pages only; never the admin path.
