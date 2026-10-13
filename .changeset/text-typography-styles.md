---
"@salt-ds/core": minor
---

Added editorial, eyebrow, body large and label large text styles for expressive content such as mastheads and hero banners.

- `Editorial1` to `Editorial4` components, and `editorial1` to `editorial4` `styleAs` values, for large headlines.
- `Eyebrow` component and `eyebrow` `styleAs` value, for a short line of text that introduces a heading.
- `bodyLarge` and `labelLarge` `styleAs` values, for introductory paragraphs and larger labels.

```tsx
<Eyebrow>Market insights</Eyebrow>
<H1 styleAs="editorial4">The year ahead</H1>
<Text styleAs="bodyLarge">Introductory paragraph.</Text>
<Label styleAs="labelLarge">Account name</Label>
```

See [editorial content](https://www.saltdesignsystem.com/salt/components/text/examples#editorial-content) for how to use them together.
