---
"@salt-ds/core": minor
---

Added editorial, eyebrow, Body 2 and Label 2 text styles for expressive content such as mastheads and hero banners.

- `Editorial1` to `Editorial8` components, and `editorial1` to `editorial8` `styleAs` values, for large headlines. `Editorial5` to `Editorial8` use the font sizes of `Display1` to `Display4`.
- `Eyebrow` component and `eyebrow` `styleAs` value, for a short line of text that introduces a heading.
- `body2` and `label2` `styleAs` values, for introductory paragraphs and larger labels.

The new styles work with the `fontWeight` prop and nested `<b>` and `<strong>` elements. Eyebrow text can be lighter but not bolder, and editorial text always uses a light weight in the J.P. Morgan theme.

```tsx
<Eyebrow>Market insights</Eyebrow>
<H1 styleAs="editorial4">The year ahead</H1>
<Text styleAs="body2">Introductory paragraph.</Text>
<Label styleAs="label2">Account name</Label>
```

See [editorial content](https://www.saltdesignsystem.com/salt/components/text/examples#editorial-content) for how to use them together.
