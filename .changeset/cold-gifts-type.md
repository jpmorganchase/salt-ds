---
"@salt-ds/date-adapters": patch
---

Timezone support and simplified use of locale.

- new `Timezone` type
  - "default", the default timezone of the date library will be used.
  - "system", the local system's timezone will be applied.
  - "UTC", the time will be returned in UTC.
  - string, a valid IANA timezone identifier, the time will be returned for that specific timezone.
- `getTimezone` added to adapters, to return the timezone for the date (excluding date-fns, as v3 does not support timezones).
- `setTimezone` added to adapters to set the timezone for the date (excluding date-fns, as v3 does not support timezones).
- remove the need to pass a locale for `date`, `format`, `compare`, `parse`, `isValid`, `startOf`, `endOf`, `today`, `now`, `getDayOfWeekName`.
  If you previously passed locales to these functions, then remove the `locale` as `locale` is passed in to the adapter's constructor and treated as the default for allfunction calls.

For `date-fns` we recommend v3, `date-fns` v4 requires Typescript v5, which will require a larger Salt upgrade. Our intention is to upgrade to support `date-fns` v4 before we move `DatePicker`, `Calendar`, `DateInput` components to core. Until the upgrade, if you require timezone support then use a date framework, that does support timezones, such as `luxon` or manage the timezone updates within your own code.
