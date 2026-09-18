---
"@salt-ds/core": minor
"@salt-ds/theme": patch
"@salt-ds/date-adapters": patch
"@salt-ds/icons": patch
---

Exported `ValidationStatusValues` from `@salt-ds/core` as the supported
replacement for the deprecated `VALIDATION_NAMED_STATUS` constant and added
standard typed replacement links across deprecated Core APIs.

Corrected published Theme token aliases and deprecated-token replacement
metadata.

Corrected Date Adapters declaration generation, removed duplicate declaration
sources, kept source-only entrypoint metadata out of the published manifest,
removed workspace-only publish scripts and directory metadata, made
adapter-specific peers optional, and finalized the published README and
LICENSE, dual ESM/CommonJS module boundaries, derived export map, and isolated
packed-consumer verification.

Added resolvable replacement links to deprecated Icon declarations.
