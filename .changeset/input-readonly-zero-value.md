---
"@salt-ds/core": patch
"@salt-ds/lab": patch
---

Fixed read-only inputs so empty controlled values, empty default values, and empty selections consistently display the `emptyReadOnlyMarker` (`—` by default), while non-empty values such as numeric `0` continue to display the real value.
