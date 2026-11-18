# tools - developer scripts (not part of the app)

- `check-structure.sh` / `check-structure.ps1` - verify that every path in `docs/architecture/structure.manifest.txt` exists. The PowerShell version was written but not run in the authoring environment; report any error.
- `new-client/` (planned, Phase 3-9) - create `clients/SLUG` from the template. Dry run first.
- `prepare-client/` (planned, Phase 3) - validate `store.config.json` and copy assets to `storefront/public/client-assets/`.

Script rules: dry run first, backup before any change, never delete without typed confirmation, clear logs, never share secrets between clients.
