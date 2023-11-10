---
"@salt-ds/core": minor
---

**_Theming and CSS updates_** with visual changes to Salt components:

1. Minor changes in `Button` component width. `CTA` and `Primary` button text font weight changed from bold to semibold. Expect components containing Salt `Button` to have similar change.

```diff
- --salt-actionable-cta-fontWeight
- --salt-actionable-primary-fontWeight
- --salt-actionable-secondary-fontWeight
+ --salt-text-action-fontWeight
```

![Button before and after](packages/core/stories/assets/buttonsOldAndNew.png)

2. Disabled `InteractableCard` component has default border color updated from blue to grey.

```diff
- --salt-accent-borderColor-disabled
+ --salt-container-primary-borderColor-disabled
```

![Interactable Card before and after](packages/core/stories/assets/cardOldAndNew.png)

3. `Avatar` component line height in HD updated from `11px` to `10px`.

**_Theming and CSS updates_** with no visual change to Salt components, useful for teams overriding theme locally:

- `Avatar` component CSS token name updated

```diff
- --salt-icon-size-base
+ --salt-size-icon
```
