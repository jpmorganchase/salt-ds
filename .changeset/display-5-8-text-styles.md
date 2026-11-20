---
"@salt-ds/core": minor
---

Added `Display5` to `Display8` components, and `display5` to `display8` `styleAs` values on `Text`. They're smaller display text styles that work with the `fontWeight` prop and nested `<b>` and `<strong>` elements, like `Display1` to `Display4`.

```tsx
<Display5>$1.2M</Display5>
<H2 styleAs="display6">Portfolio summary</H2>
```

Compare their sizes in each theme and density with the [text styles preview](https://www.saltdesignsystem.com/salt/foundations/typography#hierarchy).
