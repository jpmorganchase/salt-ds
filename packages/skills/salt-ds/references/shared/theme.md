# Theme Bootstrap

Use this file only when the task needs provider or theme bootstrap guidance.

## Preferred new-work path

For new Salt-native work, prefer the current default Salt bootstrap only when both of the following are true:

- repo policy does not override the theme choice
- required fonts, theme assets, and package support are actually available in the consumer repo

```tsx
import { SaltProviderNext } from "@salt-ds/core";
import "@salt-ds/theme/index.css";
import "@salt-ds/theme/css/theme-next.css";

<SaltProviderNext
  accent="teal"
  corner="rounded"
  headingFont="Amplitude"
  actionFont="Amplitude"
>
  <App />
</SaltProviderNext>;
```

Do not silently inject this bootstrap into an existing app if the repo already has a managed theme path, a legacy provider path, missing brand assets, or explicit local policy.

## Compatibility path

Use the compatibility path when migration compatibility or explicit repo policy requires it.

```tsx
import { SaltProvider } from "@salt-ds/core";
import "@salt-ds/theme/index.css";

<SaltProvider>
  <App />
</SaltProvider>;
```

## Reporting Rule

When you recommend a theme bootstrap, say why:

- `preferred new-work path because the repo does not override it and the required theme assets are available`
- `compatibility path because the repo is migrating incrementally or policy still requires the legacy provider`
- `theme decision left pending because repo policy or asset availability is still unknown`
