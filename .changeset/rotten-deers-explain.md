---
"@jpmorganchase/uitk-core": minor
"@jpmorganchase/uitk-lab": minor
---

ToolkitProvider

The `theme` prop has be renamed to `mode` so terminology is consistent between designers and developers.

```diff
- <ToolkitProvider theme="light" density="medium" />
+ <ToolkitProvider mode="light" density="medium" />
```

The implementation of this has changed from using a class for the mode to a data attribute

```diff
- <div class="uitk-theme uitk-light uitk-density-medium">
+ <div class="uitk-theme uitk-density-medium" data-mode="light">
```

CSS rules which used `uitk-theme-light` and `uitk-theme-dark`, will need to be updated e.g.

```diff
- .uitk-light {}
+ [data-mode="light"] {}

- .uitk-dark {}
+ [data-mode="dark"] {}
```

The `theme` prop can still be used to provide a custom theme name to help add specificity when creating custom themes.
