# Theme Bootstrap

## Default new work

Default new-work visual style aligned to the JPMorgan brand and long-term Salt direction. Use this for new Salt-native work unless migration compatibility or explicit repo policy requires the legacy path.

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

Ensure the host app loads Amplitude when using headingFont="Amplitude" and actionFont="Amplitude".

## Compatibility path

Compatibility theme for UITK migration work and staged transitions. Use this only when migration compatibility or explicit repo policy requires it.

```tsx
import { SaltProvider } from "@salt-ds/core";
import "@salt-ds/theme/index.css";

<SaltProvider>
  <App />
</SaltProvider>;
```
