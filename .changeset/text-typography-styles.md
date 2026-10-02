---
"@salt-ds/core": minor
---

Added editorial, eyebrow, body large and label large typography styles to `Text`.

- Added `Editorial1`, `Editorial2`, `Editorial3` and `Editorial4` components, and the matching `editorial1` to `editorial4` `styleAs` values.
- Added the `Eyebrow` component and the `eyebrow` `styleAs` value.
- Added the `bodyLarge` and `labelLarge` `styleAs` values.

```tsx
<Eyebrow>Market insights</Eyebrow>
<H1 styleAs="editorial4">The year ahead</H1>
<Text styleAs="bodyLarge">Introductory paragraph.</Text>
<Label styleAs="labelLarge">Account name</Label>
```
