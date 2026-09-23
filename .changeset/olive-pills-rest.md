---
"@salt-ds/core": patch
---

Fixed `NumberInput` increment and decrement buttons staying enabled when the surrounding `FormField` was disabled. They now respect the inherited disabled state, matching the input itself.

Fixed a multiselect `ComboBox` initially exposing each pill as a separate tab stop. The pill list now has a single entry tab stop, so Tab moves past the whole list and the arrow keys move between pills, matching the behavior described in the documentation.
