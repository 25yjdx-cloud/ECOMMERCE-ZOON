# Backup policy (to be finalized in Phase 8)

Draft:
- Database: daily dump per client, kept 14 days, plus a weekly dump kept 8 weeks.
- Media: the client's uploaded images and assets, copied with the same schedule.
- Configuration: `clients/SLUG/` backed up separately, encrypted, outside this repository.
- Restore: tested on a copy at least once before the first client goes live, and once per quarter after that.
- Dumps and archives never enter Git.
