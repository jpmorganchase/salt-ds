---
"@salt-ds/core": patch
"@salt-ds/lab": patch
"@salt-ds/date-components": patch
---

Fixed form validation errors to reach the accessible input or group across participating controls, including inherited FormField errors. Explicit native ARIA overrides remain authoritative, and warning/success do not mark controls invalid. Explicit NumberInput errors now apply to empty and read-only values; date inputs also expose explicitly supplied read-only errors. Added guidance for form-library bindings, composite values and application-owned reset.
