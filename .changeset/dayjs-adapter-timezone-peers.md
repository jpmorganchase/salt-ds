---
"@salt-ds/date-components": patch
"@salt-ds/date-adapters": minor
---

Update date library dependency versions used by date components and date-adapters.

Package.json dependency range updates:

- `@date-fns/tz` `^1.2.0` -> `^1.4.1` (root, `@salt-ds/lab` devDeps, site deps, and `@salt-ds/date-adapters` peers)
- `dayjs` `^1.11.13` -> `^1.11.20` (lab devDeps, site deps, and date-adapters peers)
- `luxon` `^3.6.1` -> `^3.7.2` (lab devDeps, site deps, and date-adapters peers)
- `moment-timezone` `^0.5.46` -> `^0.6.1` (lab devDeps, site deps, and date-adapters peers)
- `@types/luxon` `^3.6.2` -> `^3.7.1` (lab devDeps, site devDeps, and date-adapters peers)

These changes are dependency-only (no Salt public API changes).
