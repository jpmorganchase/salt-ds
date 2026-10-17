---
"@salt-ds/theme": minor
---

Added an experimental rem units stylesheet, available at `@salt-ds/theme/css/experimental/rem-units.css`.

It redefines the density-based text, size and spacing tokens for the legacy, J.P. Morgan and J.P. Morgan (Interim) themes in rem instead of px. The interface then scales with the user's browser font size setting as well as with page zoom, in the same proportions as page zoom. Tokens named `fixed`, such as `--salt-size-fixed-100` and `--salt-spacing-fixed-100`, stay in px. At the default browser font size of 16px, every value resolves to the same pixel size as before.

Import it after your theme stylesheets. If you also use `mobile-interim.css`, import it after this file so its mobile values take precedence.

```tsx
import "@salt-ds/theme/index.css";
import "@salt-ds/theme/css/experimental/rem-units.css";
```

The stylesheet also sets the root element's font size to `100%` when `SaltProvider` applies its classes to `<html>`, so `1rem` resolves to the user's browser default font size rather than the density's body text size. Rem values in your own CSS will resolve against that size too.

Custom properties now hold rem values, so any code that reads them with `getComputedStyle` and parses them as pixel numbers needs to convert rem to px first.

This stylesheet is experimental. Its tokens and values may change, or it may be removed, in any release without a major version bump. It isn't recommended for production use.
