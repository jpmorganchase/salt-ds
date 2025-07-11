---
"@salt-ds/date-adapters": patch
---

- Upgrade peer dependencies for `@salt-ds/date-adapters/date-fns` and its type definitions to the version 4.

```diff
  "peerDependencies": {
-   "date-fns": "^3.6.0",
+   "date-fns": "^4.1.0",
  }
```

This upgrade is a breaking change for `date-fns`, mostly around inner types and ESM support.
https://github.com/date-fns/date-fns/releases/tag/v4.0.0

Ensure compatibility with your codebase by reviewing any changes in the `date-fns` API and type definitions.

As these are peer dependencies, make sure that the consuming projects are also updated to these versions to avoid potential conflicts.

- Added new `@salt-ds/date-adapters/date-fns-tz` adapter, a`date-fns` adapter with timezone support.

```diff package.json
  "peerDependencies": {
-   "date-fns": "^3.6.0",
+   "date-fns": "^4.1.0",
    }
```

If you DO NOT require timezone support use `@salt-ds/date-adapters/date-fns`.  
If you DO require timezone support use `@salt-ds/date-adapters/date-fns-tz`.

To use:

```
import { AdapterDateFnsTZ } from "../date-fns-tz-adapter";
import { enUS } from "date-fns/locale";

    <LocalizationProvider
      DateAdapter={AdapterDateFnsTZ}
      locale={enUS}
    >
    </LocalizationProvider>
```

Creates a peer dependency on `@date-fns/tz`.
