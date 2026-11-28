---
"@salt-ds/core": minor
"@salt-ds/styles": minor
---

Added a new component defaults API to support curated, provider-driven default props and root-level `data-*` attributes.

- Added `ComponentDefaultsProvider` and `useComponentDefaults` in `@salt-ds/styles`.
- Added curated `ComponentDefaultablePropsMap` registrations in `@salt-ds/core`.
- Integrated defaults support across the core component set, while preserving existing component fallback defaults.

Simple one-component example:

```tsx
import { Input } from "@salt-ds/core";
import {
  ComponentDefaultsProvider,
  type ComponentDefaultsRegistry,
} from "@salt-ds/styles";

const defaults: ComponentDefaultsRegistry = {
  saltInput: { props: { bordered: true } },
};

<ComponentDefaultsProvider value={defaults}>
  <Input placeholder="Search" />
</ComponentDefaultsProvider>;
```
