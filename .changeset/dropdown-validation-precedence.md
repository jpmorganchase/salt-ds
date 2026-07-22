---
"@salt-ds/core": patch
---

Fixed `Dropdown` validation status precedence to align with the other form controls, so the `FormField` validation status now takes precedence over the `Dropdown`'s own `validationStatus` prop.
