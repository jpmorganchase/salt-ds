---
"@salt-ds/date-components": patch
---

Fixed `DatePicker` browser API usage to respect the `WindowProvider` target and element owner documents. Overlays now resolve timers, focus, input selection, outside press handling, and active elements from the appropriate window when rendered in secondary windows such as iframes.
