---
"@salt-ds/lab": patch
---

Updated `SystemStatus` to match the design, sizing the status icon to the line height of the content, increasing the gap between the icon and the content, and removing the border. This removes the `--saltSystemStatus-borderColor`, `--saltSystemStatus-borderWidth` and `--saltSystemStatus-borderStyle` CSS variables.

Fixed the status indicator in `SystemStatus` being visible to screen readers, matching `Banner`.
