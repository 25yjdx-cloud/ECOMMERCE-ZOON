# Skeleton kickoff prompt (paste to the implementation agent)

## Who you are and what you do in this session

You are the implementation agent for **CommerceForge**. In this session you verify and complete the folder skeleton and its documentation. You do not write application code, you do not install software, and you do not delete any existing instruction.

## The project, in plain terms

CommerceForge is a factory that lets one freelance web developer deliver many Arabic e-commerce stores quickly.

- **Storefront (`storefront/`)**: ONE Next.js app with two modes. In `gallery` mode its home page shows two featured templates (presets), `/gallery` lists all four, and `/preview/[preset]` shows a live demo on mock data. This is the owner's sales page. In `store` mode it shows one client's real store with the chosen preset.
- **Presets**: four presets in one family `themes/lifestyle/`: fashion, furniture, electronics, grocery. A preset sets colors, fonts, home sections and card layout. It never owns data.
- **Backend (`backend/`)**: one independent Bagisto (Laravel/PHP + MySQL) installation per client, run in Docker. Not created yet (Phase 1). Our finance dashboard is a package inside it.
- **Clients (`clients/`)**: each client has one folder, copied from `clients/_template`. The owner adds the logo and information through `store.config.json` and `assets/`. Real client folders are ignored by Git.
- **Budget**: zero cash until the first paying client.

Read `README.md` for the full picture.

## Your task

1. Read, in order: `README.md`, `AGENTS.md`, `docs/MASTER_PROMPT.md` (if it is a placeholder, ask the owner to paste the full document; do not invent it), `docs/AMENDMENT_v2.2.md`, `docs/architecture/FILE_STRUCTURE.md`, `PROJECT_STATUS.md`, `TASKS.md`.
2. List what exists in the target folder. **Do not overwrite, rewrite, shorten or delete any existing file.** If a file differs from the plan, report the difference and wait for the owner's decision.
3. Create any missing folder or file listed in `docs/architecture/structure.manifest.txt`. Empty folders get a `.gitkeep`. Do not create anything marked as planned.
4. Do NOT create `backend/bagisto/`. Do NOT run create-next-app, composer, npm, docker, or any installer.
5. Run `bash tools/check-structure.sh` (inside Ubuntu, or Git Bash). Report the result truthfully. If bash is unavailable, check the manifest by hand and say so.
6. If Git is available: `git init -b main` and one commit, `chore: initial project skeleton v2.2 (no application code)`. No remote.
7. Update `PROJECT_STATUS.md`, `TASKS.md` and `CHANGELOG.md` with facts only. Append, do not replace, existing sections.
8. Report in simple Arabic: what exists, what you created, deviations, verification result, and the next step. Then stop and wait for the owner.

## Rules

- Never delete or shorten an existing instruction, document, ADR or prompt. Amend by appending a dated section.
- No secrets. No Arabic characters or spaces in paths. Code and file names in English.
- Do not write any application code.
- Ask before any destructive action, dependency change, or architecture change.
