---
"@salt-ds/core": minor
---

Added a `fontWeight` prop to `Text` and the components built on it (`H1`–`H4`, `Display1`–`Display4`, `Label`, `TextNotation` and `TextAction`). Set it to `lighter` or `bolder` to apply the text style's small or strong weight without using `<small>` or `<strong>`, which carry meaning for assistive technologies. Omit it to keep the default weight.

```tsx
<Text fontWeight="bolder">Bolder text</Text>
<H2 fontWeight="lighter">Lighter heading</H2>
```

Added `inherit` to the `styleAs` prop of `Text`. A `Text` with `styleAs="inherit"` matches the font and color of its parent element, so you can change the weight of part of the content and keep the parent's style. `fontWeight` then uses the weights of the closest parent `Text`.

```tsx
<H2>
  Quarterly results{" "}
  <Text as="span" styleAs="inherit" fontWeight="lighter">
    (unaudited)
  </Text>
</H2>
```

`<b>` elements nested in `Text` now use the same weight as `<strong>`, so you can make part of the text bold without implying importance. `<strong>`, `<b>` and `<small>` now use the weights of the closest `Text`, so a `<strong>` inside a body `Text` nested in a heading uses the body weight rather than the heading weight.

Deprecated the lighter weight styling of `<small>` elements nested in `Text`. `<small>` marks fine print, so it shouldn't be used only to change the weight. The styling still works but will be removed in a future major version. Use `fontWeight="lighter"` instead.

```diff
- <Text><small>Lighter text</small></Text>
+ <Text fontWeight="lighter">Lighter text</Text>
```

For part of the text, nest `<Text as="span" styleAs="inherit" fontWeight="lighter">`.

