---
"@salt-ds/core": minor
---

Added `Breadcrumbs`, `Breadcrumb`, `BreadcrumbTrigger`, and `BreadcrumbLabel` for secondary navigation trails with collapse, wrapping, and router compatible link rendering.

Renamed from `BreadcrumbsNext`, `BreadcrumbNext`, `BreadcrumbNextTrigger`, and `BreadcrumbNextLabel` in lab.

```tsx
import { Breadcrumb, Breadcrumbs } from "@salt-ds/core";

<Breadcrumbs aria-label="Breadcrumb">
  <Breadcrumb href="#">Home</Breadcrumb>
  <Breadcrumb href="#">Level 2</Breadcrumb>
  <Breadcrumb>Current level</Breadcrumb>
</Breadcrumbs>;
```
