---
"@salt-ds/lab": patch
---

A new package has been created for date components and related utilities: `@salt-ds/date-components`. This package is intended to be a long-term/stable home for these components, which will shortly be moved to a non-alpha/stable state.
To avoid a breaking change, `@salt-ds/lab` still re-exports these components for now (and logs a deprecation warning in development). 
New code should import from `@salt-ds/date-components`.
