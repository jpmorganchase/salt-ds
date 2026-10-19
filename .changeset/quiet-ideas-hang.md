---
"@salt-ds/core": minor
---

Updated `MenuItem` so labels align within a `MenuGroup`. If any item in a group has a leading icon, or a radio or checkbox indicator from a selectable `MenuGroup`, the other items in that group reserve the same space. Items outside a group align with each other, and each submenu aligns its own items.

When a menu contains a radio or checkbox, leading icons in groups without one sit in a column as wide as a radio or checkbox. Labels after an icon then line up with labels after a radio or checkbox that has no icon beside it.

Existing menus that mix items with and without icons will now show the labels of items without icons indented to line up with the others in the same group.
