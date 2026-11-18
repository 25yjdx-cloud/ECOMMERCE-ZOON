# backend/docker

Compose files and service settings from the official Bagisto setup (chosen in Phase 1). Planned contents: the app service (PHP and web server), a MySQL service with a named volume, and Mailpit. No Elasticsearch or Kibana by default.

Rules: pinned image tags (never `latest`); ports published on 127.0.0.1 only; database data kept in a named volume and proven to survive `docker compose down` and `up`.
