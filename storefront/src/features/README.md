# src/features

Behavior shared by every preset, grouped by domain: `catalog`, `product`, `cart`, `checkout`, `account`, `wishlist`, `search`, `content`. Each holds hooks, server actions and validation schemas. No visual design here.

Rule: presets call features; features call services. Validation schemas are shared between forms and server actions.
