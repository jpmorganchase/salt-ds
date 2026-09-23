---
"@salt-ds/core": patch
---

Improved Dropdown, ComboBox, and ListBox performance for large, non-virtualized option lists. Fixed active/highlighted styling to track the active Option by id instead of value, so Options that share the same value no longer all appear active together; selection is unaffected and remains value-based.
