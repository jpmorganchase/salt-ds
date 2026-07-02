---
"@salt-ds/core": patch
---

Fixed background content remaining interactive while a modal floating element (`Dialog`, `Drawer`, `Overlay`) was open. Outside elements are now marked inert for the duration the floating element is shown.
