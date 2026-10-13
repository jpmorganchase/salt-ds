---
"@salt-ds/core": minor
---

Added a `fontWeight` prop to `Text` and the components built on it, so you can make text `lighter` or `bolder` without using `<small>` or `<strong>`, which carry meaning for assistive technologies.

```tsx
<H2 fontWeight="lighter">Lighter heading</H2>
```

To change the weight of part of the text, nest a `Text` with the new `styleAs="inherit"` value, which keeps the parent's style, or use `<b>`, which now has the same weight as `<strong>`.

```tsx
<H2>
  Quarterly results{" "}
  <Text as="span" styleAs="inherit" fontWeight="lighter">
    (unaudited)
  </Text>
</H2>
```

`<strong>`, `<b>` and `<small>` now use the weights of the closest `Text`, so a `<strong>` in a body `Text` nested in a heading uses the body weight rather than the heading weight.

Deprecated the lighter weight styling of `<small>` in `Text`. It still works but will be removed in a future major version.

```diff
- <Text><small>Lighter text</small></Text>
+ <Text fontWeight="lighter">Lighter text</Text>
```

See [font weight](https://www.saltdesignsystem.com/salt/components/text/examples#font-weight) for more examples.
