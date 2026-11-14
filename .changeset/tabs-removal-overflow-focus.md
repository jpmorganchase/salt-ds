---
"@salt-ds/core": patch
---

Fixed `Tabs` selection and focus when tabs are removed or navigated in the overflow menu.

- Removing the selected tab from outside the tabs now selects the neighbouring tab and calls `onChange` with a `null` event, without moving focus. This also applies while the overflow menu is open, as long as the tab list keeps its width (for example, when it fills its container), so the menu stays open. Otherwise, the menu closes and focus moves to the newly selected tab, as before.
- Dismissing a tab in the open overflow menu now focuses the neighbouring overflow tab instead of the first one.
- Shift+Tab from a tab action in the overflow menu now moves focus back to its tab on all React versions.
- Shift+Tab from an overflow tab now closes the menu and focuses the overflow button of the same `Tabs`, not the first overflow button on the page.
