---
"@salt-ds/date-adapters": patch
---

## Adapter fixes

- Fixed `AdapterDayjs#setTimezone` so `"default"` no longer behaves as a no-op and is handled consistently with adapter timezone resolution.
- Updated `AdapterLuxon#clone` to preserve the source date locale when cloning (with a safe fallback), while still preserving instant and zone.
- Removed Luxon global locale mutation from the adapter constructor to avoid cross-instance locale side effects.
- Fixed `AdapterMoment#getDayOfWeekName` so `"short"` returns abbreviated weekday names (for example `Wed`) instead of long-form names.

## Consumer impact

- Potentially breaking (RC): `AdapterLuxon` no longer mutates Luxon global locale defaults during adapter construction. If an app relied on that side effect to localize non-adapter Luxon usage, locale behavior may change.
- Recommended migration: set Luxon global defaults explicitly in app bootstrap when global behavior is required, or set locale per Luxon `DateTime` instance where needed.
