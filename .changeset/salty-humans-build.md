---
"@salt-ds/date-adapters": minor
---

- fixed type to allow for date framework based types in userland
- added default generics, to simplify usage with Salt's default `DateFrameworkType`
- removed unused `getDayOfWeek`, if required, use the date framework directly
