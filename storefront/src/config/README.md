# src/config

Validated configuration (planned): the environment reader (server and public values kept apart), the schema for `clients/SLUG/store.config.json`, the loader that reads the client selected by `STORE_CLIENT`, and safe defaults. The app refuses to start when the configuration is invalid.

Regions: `regions/` holds Egypt and Gulf defaults if they are needed in code. Australia waits until a client asks for it. Most regional details (currency, language, shipping) live in each client's `store.config.json`.
