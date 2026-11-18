# src/services

The only layer that reads data. One facade per domain over a swappable adapter (ADR-017).

- `types.ts` - domain types: StorefrontProduct, Category, Cart, Order, Customer, Address, Settings, Money.
- `contracts.ts` - interfaces every adapter implements.
- `products.ts`, `categories.ts`, `cart.ts`, `checkout.ts`, `customers.ts`, `orders.ts`, `wishlist.ts`, `search.ts`, `settings.ts` - facade modules.
- `errors.ts` - typed errors.
- `adapters/bagisto/` - the real backend: API client, queries, normalizers (raw API -> domain types).
- `adapters/mock/` - demo data and handlers implementing the same contracts.

Rules: presets never see raw API shapes; contract tests prove both adapters return the same shapes.
