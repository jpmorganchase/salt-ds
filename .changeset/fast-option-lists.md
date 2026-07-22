---
"@salt-ds/core": patch
---

Improve Dropdown, ComboBox, and ListBox performance for large non-virtualized
option lists. Registration and typeahead work now scale linearly, Option state
updates are isolated to affected items, and the shared Option stylesheet is
injected once per list. Active styling now follows the aria-active Option id
while duplicate-valued Options retain value-based selection.
