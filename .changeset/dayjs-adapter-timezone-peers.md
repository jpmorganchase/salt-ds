---
"@salt-ds/date-adapters": minor
---

## Peer dependency updates

Updated date library dependency version ranges used by date components and `@salt-ds/date-adapters`.

Changes applied across the repo (root, `@salt-ds/lab` devDependencies, site dependencies, and `@salt-ds/date-adapters` peer dependencies):

- `@date-fns/tz`: `^1.2.0` → `^1.4.1`
- `dayjs`: `^1.11.13` → `^1.11.20`
- `luxon`: `^3.6.1` → `^3.7.2`
- `moment-timezone`: `^0.5.46` → `^0.6.1`
- `@types/luxon`: `^3.6.2` → `^3.7.1`

These dependency updates do not introduce any Salt component API changes.

## Adapter API

- Added `toJSDate` to the date adapter API.
- Fixed dayjs timezone handling for date input/picker workflows so that user-entered dates are correctly interpreted as midnight in the selected IANA timezone when serializing to ISO (e.g. `America/New_York`, `Asia/Shanghai`).
- Fixed adapter types to allow for date framework based types in userland
- Added default generics, to simplify usage with Salt's default `DateFrameworkType`
- Removed unused `getDayOfWeek`, if required, use the date framework directly
- Correct default format for luxon and date-fns to DD/MM/YYYY
- Fixed dayjs day of week name should return a single character for `narrow`
- Fixed moment adapter `setTimezone` for UTC to preserve wall-clock time, consistent with all other adapters. Previously, converting a local date to UTC would shift the instant instead of reinterpreting the wall-clock time in UTC.
