---
"@salt-ds/core": minor
---

Removed the `FormFieldControlWrapper` component and `useControlWrapper` hook.
To replace usages of the wrapper for Form Fields with multiple children, use the `StackLayout` component with a `gap` of `1` to get the recommended layout and set the `role` to `"group"` for accessibility. The `variant` on each child should be set directly or with shared props.
