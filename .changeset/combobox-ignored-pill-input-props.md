---
"@salt-ds/core": patch
---

Removed `hidePillClose` and `pills` from `ComboBoxProps`. `ComboBox` sets both itself and ignored any values passed to them, so they no longer appear in editors or the props table.
