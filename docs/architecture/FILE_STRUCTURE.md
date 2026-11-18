# File structure - CommerceForge skeleton v2.2

Status key: everything in the tree below EXISTS in the skeleton (folders and documentation only). Planned items are described in the purpose table and must NOT be created before their phase.

## Tree (generated from the skeleton on disk)

```
commerceforge/
├── .github/
│   └── workflows/
├── backend/
│   ├── docker/
│   │   └── README.md
│   ├── packages/
│   │   ├── CommerceForge/
│   │   │   └── Finance/
│   │   │       └── README.md
│   │   └── README.md
│   ├── scripts/
│   │   └── README.md
│   └── README.md
├── backups/
│   └── README.md
├── clients/
│   ├── _template/
│   │   ├── assets/
│   │   │   ├── banners/
│   │   │   └── README.md
│   │   ├── content/
│   │   │   └── README.md
│   │   ├── .env.example
│   │   ├── README.md
│   │   └── store.config.json
│   └── README.md
├── deployment/
│   ├── docker/
│   │   └── README.md
│   ├── env-templates/
│   │   └── README.md
│   ├── scripts/
│   │   └── README.md
│   ├── backup-policy.md
│   └── README.md
├── docs/
│   ├── api/
│   │   └── README.md
│   ├── architecture/
│   │   ├── FILE_STRUCTURE.md
│   │   ├── README.md
│   │   └── structure.manifest.txt
│   ├── client-guide/
│   │   └── README.md
│   ├── deployment/
│   │   └── README.md
│   ├── installation/
│   │   └── environment.md
│   ├── prompts/
│   │   ├── 00-skeleton-kickoff.md
│   │   ├── 01-reviewer.md
│   │   └── README.md
│   ├── research/
│   │   └── competitors.md
│   ├── security/
│   │   └── README.md
│   ├── AMENDMENT_v2.2.md
│   ├── MASTER_PROMPT.md
│   └── README.md
├── storefront/
│   ├── public/
│   │   ├── client-assets/
│   │   ├── fonts/
│   │   ├── gallery/
│   │   └── README.md
│   ├── src/
│   │   ├── app/
│   │   │   ├── (store)/
│   │   │   │   └── README.md
│   │   │   ├── api/
│   │   │   ├── gallery/
│   │   │   │   └── README.md
│   │   │   ├── preview/
│   │   │   │   └── [preset]/
│   │   │   │       └── README.md
│   │   │   └── README.md
│   │   ├── components/
│   │   │   ├── feedback/
│   │   │   ├── forms/
│   │   │   ├── seo/
│   │   │   ├── ui/
│   │   │   └── README.md
│   │   ├── config/
│   │   │   ├── regions/
│   │   │   │   └── README.md
│   │   │   └── README.md
│   │   ├── features/
│   │   │   ├── account/
│   │   │   ├── cart/
│   │   │   ├── catalog/
│   │   │   ├── checkout/
│   │   │   ├── content/
│   │   │   ├── product/
│   │   │   ├── search/
│   │   │   ├── wishlist/
│   │   │   └── README.md
│   │   ├── gallery/
│   │   │   ├── components/
│   │   │   ├── content/
│   │   │   │   └── presets.json
│   │   │   └── README.md
│   │   ├── hooks/
│   │   │   └── README.md
│   │   ├── i18n/
│   │   │   ├── messages/
│   │   │   └── README.md
│   │   ├── lib/
│   │   │   └── README.md
│   │   ├── services/
│   │   │   ├── adapters/
│   │   │   │   ├── bagisto/
│   │   │   │   │   ├── normalizers/
│   │   │   │   │   ├── queries/
│   │   │   │   │   └── README.md
│   │   │   │   └── mock/
│   │   │   │       ├── data/
│   │   │   │       │   ├── electronics/
│   │   │   │       │   ├── fashion/
│   │   │   │       │   ├── furniture/
│   │   │   │       │   └── grocery/
│   │   │   │       └── README.md
│   │   │   └── README.md
│   │   ├── styles/
│   │   │   └── README.md
│   │   ├── theme-engine/
│   │   │   └── README.md
│   │   ├── themes/
│   │   │   └── lifestyle/
│   │   │       ├── components/
│   │   │       ├── layouts/
│   │   │       ├── pages/
│   │   │       ├── presets/
│   │   │       │   ├── electronics/
│   │   │       │   │   └── README.md
│   │   │       │   ├── fashion/
│   │   │       │   │   └── README.md
│   │   │       │   ├── furniture/
│   │   │       │   │   └── README.md
│   │   │       │   ├── grocery/
│   │   │       │   │   └── README.md
│   │   │       │   └── README.md
│   │   │       ├── sections/
│   │   │       ├── styles/
│   │   │       └── README.md
│   │   └── types/
│   │       └── README.md
│   ├── tests/
│   │   ├── contract/
│   │   ├── e2e/
│   │   ├── fixtures/
│   │   ├── unit/
│   │   └── README.md
│   └── README.md
├── tools/
│   ├── new-client/
│   │   └── README.md
│   ├── prepare-client/
│   │   └── README.md
│   ├── check-structure.ps1
│   ├── check-structure.sh
│   └── README.md
├── .editorconfig
├── .env.example
├── .gitattributes
├── .gitignore
├── ACCEPTANCE_TESTS.md
├── AGENTS.md
├── API_DOCUMENTATION.md
├── ARCHITECTURE.md
├── ARCHITECTURE_DECISIONS.md
├── CHANGELOG.md
├── CLAUDE.md
├── DEVELOPMENT_ROADMAP.md
├── INSTALLATION_GUIDE.md
├── Makefile
├── PROJECT_STATUS.md
├── README.md
├── SECURITY_CHECKLIST.md
└── TASKS.md
```

## Purpose of each top-level folder

| Folder | Purpose | Phase that fills it |
|---|---|---|
| `backend/` | Bagisto (Laravel/PHP + MySQL), Docker files, our packages (Finance), scripts | 1 (Bagisto), 6 (Finance) |
| `storefront/` | ONE Next.js app: gallery mode, store mode, presets, services, tests | 3 |
| `clients/` | One folder per client; only `_template/` is committed | per client |
| `tools/` | Developer scripts: structure check now; new-client and prepare-client later | 0 (check), 3 (client tools) |
| `deployment/` | Hosting templates and the backup policy | 8 |
| `backups/` | Local dumps, never committed | 1 onward |
| `docs/` | Specification, amendment, architecture, prompts, research, environment record | all |

## Planned items (do NOT create yet)

- `backend/bagisto/` - Phase 1, created only by the official installer.
- `backend/docker/docker-compose.yml` and the Docker files - Phase 1.
- `backend/packages/CommerceForge/Finance/src/` - Phase 6.
- `storefront/package.json`, `next.config.ts`, `tsconfig.json`, `vitest.config.ts`, `playwright.config.ts`, `.env.example` - Phase 3 scaffolding (merged, not overwritten).
- `storefront/src/app/page.tsx`, `layout.tsx`, `gallery/page.tsx`, `preview/[preset]/...` pages - Phase 3.
- `storefront/src/proxy.ts` (request guard; the file name depends on the Next.js version - verify) - Phase 3.
- `storefront/src/config/*.ts` and `storefront/src/services/*.ts` code - Phases 2-3.
- `storefront/src/themes/lifestyle/presets/*/preset.config.ts` - Phase 3 (fashion), Phase 5 (furniture).
- `.github/workflows/ci.yml` - Phase 3.
- `tools/new-client/` and `tools/prepare-client/` code - Phase 3 and later.
- `clients/SLUG/` - per real client, local only.
- `docs/api/openapi.json` - Phase 2.

## Scaffolding rules

- `backend/bagisto/` must not exist until Phase 1.
- Storefront: scaffold in a temporary folder, review, then merge into `storefront/` without deleting folders that already exist. Record name collisions in an ADR.
- Nothing in this skeleton installs software or contains application code.

## Theme readiness checklist (a preset is `ready` only when ALL pass)

- [ ] The 20 required pages exist: home, listing, category, product, search, cart, checkout, login, register, profile, addresses, orders, order details, wishlist, about, contact, privacy, terms, returns, FAQ
- [ ] Arabic RTL and English LTR both verified
- [ ] Phone, tablet and desktop layouts verified
- [ ] Colors and fonts come only from tokens; a client rebrand needs no code change
- [ ] Loading, empty and error states on every data page
- [ ] Renders with the mock adapter AND the Bagisto adapter
- [ ] Accessibility basics pass (keyboard, contrast, labels, semantic headings)
- [ ] Core Web Vitals measured and recorded
- [ ] Gallery thumbnail and card exist
- [ ] Home sections documented and configurable from `store.config.json`

## Verify at any time

`bash tools/check-structure.sh` must print `OK`.
