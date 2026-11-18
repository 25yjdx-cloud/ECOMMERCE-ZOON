# Reviewer prompt (paste to a second agent, together with the master document)

Read `README.md`, `docs/MASTER_PROMPT.md` Section 18 and `docs/AMENDMENT_v2.2.md`. Follow Section 18 exactly. Implement nothing and rewrite nothing.

Return a table with the columns: Finding, Severity (blocker, high, medium, low), Evidence or source, Recommendation. Then answer these questions:

1. Is one storefront app with two modes (gallery and store) cleaner than two apps?
2. Is one theme family with presets right, or will it force awkward compromises for furniture and grocery?
3. Is the mock adapter plus contract tests worth the upkeep for one developer?
4. Is the `clients/` design with Git ignoring real client folders safe enough, given backup risk?
5. Will any path collide with the official Bagisto storefront starter or with Bagisto's Docker setup?
6. Is the no-deletion rule in AGENTS.md enforceable, and what would you add?

State explicitly what you could not verify.
