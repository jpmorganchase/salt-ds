---
"@salt-ds/core": patch
---

Fixed `Toolbar` losing focus when an overflow change moved the focused control or overflow button. Focus now returns to the control, or to its overflow button when the control overflows. When an overflow button is removed, focus moves to the first control that returned. `Toolbar` no longer moves focus back into itself when its overflow changes after focus has left it.
