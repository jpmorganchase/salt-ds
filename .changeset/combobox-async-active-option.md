---
"@salt-ds/core": patch
---

Fixed which option `ComboBox` highlights when its options load after typing, including when the input value is uncontrolled. If the highlighted option is removed, or no option is highlighted, the first option is now highlighted, so pressing Enter or Tab selects an option that's shown. Options the user navigates to with the keyboard are kept.

When a single-select `ComboBox` opens with the selected option's text in the input, it waits for that option to load before highlighting it. Pressing Enter while the option is loading leaves the current selection in place.
