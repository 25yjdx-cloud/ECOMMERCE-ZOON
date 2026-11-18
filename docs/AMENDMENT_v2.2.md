# Amendment v2.2 (approved by the owner, 2026-11-15)

This amendment changes the master specification in the following points. Where it conflicts with an earlier section, this amendment wins. The earlier text is kept for history.

1. **Templates:** four separate theme folders are replaced by one family `lifestyle` with four presets: fashion, furniture, electronics, grocery (ADR-020). The first two presets are the featured ones on the gallery home page.
2. **Gallery:** the home page of the gallery shows two featured presets. `/gallery` lists all presets. `/preview/[preset]` previews one on demo data (`storefront/src/app/gallery/`, ADR-016).
3. **Finance dashboard:** moved from a root `business-dashboard/` folder into `backend/packages/CommerceForge/Finance/` (ADR-021).
4. **Clients:** a `clients/` folder with `_template/`. Real client folders are ignored by Git (ADR-022).
5. **Region data:** kept inside each client's `store.config.json`; `storefront/src/config/regions/` only if defaults are needed in code.
6. **Backups:** dumps are kept in `backups/`, outside Git; the policy lives in `deployment/backup-policy.md`.
7. **Agent rule:** no existing instruction or documentation may be deleted or shortened. Changes are added as dated amendments (AGENTS.md rule 0.1).

The folder structure is defined in `docs/architecture/FILE_STRUCTURE.md`.
