---
"@salt-ds/core": patch
---

Refactored type definitions to support extended types for experimental features. These changes are non-breaking and aim to improve type safety and flexibility.

**Details**:

- Refactored `FormFieldValidationStatus` type to omit `"info"` from `ValidationStatuses`.
- Refactored `ValidationStatusValues` for consistency.
