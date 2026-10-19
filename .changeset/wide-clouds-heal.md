---
"@salt-ds/core": minor
---

Added selection to `Menu`. Set `selectionVariant` on `MenuGroup` to "single" or "multiple" to render its items as radio or checkbox menu items, give each `MenuItem` a `value`, and control the selection with `selected` and `onSelectionChange`. The menu's content unmounts when it closes, so keep the selection in state.

Clicking a selectable item keeps the menu open. Enter selects the item and closes the menu, and Space selects it and keeps the menu open.

```tsx
const [sortBy, setSortBy] = useState(["name"]);

<MenuGroup
  label="Sort by"
  selectionVariant="single"
  selected={sortBy}
  onSelectionChange={(_event, newSelected) => setSortBy(newSelected)}
>
  <MenuItem value="name">Name</MenuItem>
  <MenuItem value="size">Size</MenuItem>
</MenuGroup>;
```

Disabled `MenuItem` components can now be focused with the arrow keys so they can be discovered, but they still can't be activated.

- Fixed a submenu staying open when hovering another item in the parent menu if the submenu's last item was disabled.
- Fixed holding Enter on a menu trigger activating the first item once the menu opened.
