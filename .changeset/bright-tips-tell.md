---
"@salt-ds/icons": minor
---

Add a `color` prop to Icon.

This can be used to specify the color used by Icon and supports: primary, secondary and inherit. The default value is "inherit".

```tsx
<HomeIcon color="primary" />
<UserIcon color="secondary" />
<CloseIcon color="inherit" />
```
*Note:* This changes the default icon color from secondary to primary due to it inheriting the default text style. The previous default of secondary was an error.
