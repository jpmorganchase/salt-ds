---
"@salt-ds/styles": minor
---

This feature is in-development, for exploration and feedback only.

Introduce a context‑driven API for injecting CSS class names into Salt components based on their props, and optionally stripping implementation‑only props before forwarding.

_Status_  
Non‑breaking for existing Salt consumers
Experimental and incomplete — interfaces and behavior may change without notice

**Note to JPM employees**
Use only in non‑production codebases, or with prior permission from the Salt engineering team
What’s included

- `ClassNameInjectionProvider` — supplies a registry of class injectors via React context
- `useClassNameInjection(component, props)`
  - computes additional classes via registered injectors
  - merges them with any className provided at the call site
  - removes internal/derived props (declared by each injector) before forwarding
- `registerClassInjector(registry, component, keys, injector)` — registers per‑component injection rules

_Documentation_  
Full documentation will follow once the API is stabilized; for now, consider this API private and subject to change.
