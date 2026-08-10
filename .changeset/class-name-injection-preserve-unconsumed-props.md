---
"@salt-ds/styles": patch
---

Fixed `ClassNameInjectionProvider` stripping registered props from components that do not opt into an extension.

Previously, every key registered via `registerClassInjector` was removed from the props of all matching components under the provider, even when the injector returned `undefined` for that instance. This meant an unrelated component (for example a standard `Button`) rendered under the provider could silently lose props such as `sentiment` or `appearance`. Now a key is only withheld when its injector actually returns a class for the current props, so components that the injector opts out of keep their props (and styling) intact.
