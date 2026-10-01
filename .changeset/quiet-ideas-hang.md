---
"@salt-ds/core": minor
---

Updated `MenuItem` so labels align within a menu. If any item in a menu has a leading icon, or a radio or checkbox indicator from a selectable `MenuGroup`, items without one reserve the same space. Each submenu aligns its own items, and `MenuGroup` labels keep their current position.

Existing menus that mix items with and without icons will now show the labels of items without icons indented to line up with the others.
