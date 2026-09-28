---
"@salt-ds/core": minor
---

Added selection to `Menu`. Set `selectionVariant` on `MenuGroup` to "single" or "multiple" to render its items as radio or checkbox menu items, and give each `MenuItem` a `value`. Control the selection with `selected` and `onSelectionChange`, or use `defaultSelected` with a `name` to keep an uncontrolled selection while the menu is closed.

Clicking an item closes the menu for single selection and keeps it open for multiple selection. Enter always closes the menu and Space keeps it open.

```tsx
<MenuGroup
  label="Sort by"
  name="sortBy"
  selectionVariant="single"
  defaultSelected={["name"]}
>
  <MenuItem value="name">Name</MenuItem>
  <MenuItem value="size">Size</MenuItem>
</MenuGroup>
```

Disabled `MenuItem` components can now be focused with the arrow keys so they can be discovered, but they still can't be activated.

- Fixed disabled submenu triggers opening their submenu from the keyboard.
- Fixed a submenu staying open when hovering another item in the parent menu if the submenu's last item was disabled.
- Fixed holding Enter on a menu trigger activating the first item once the menu opened.
