---
"@salt-ds/core": patch
---

Fixed which option `ComboBox` highlights when its options load after typing, such as server-side results. If the highlighted option is removed, or no option is highlighted, the first option is now highlighted, so pressing Enter or Tab selects an option that's shown. Options the user navigates to with the keyboard are kept.

When `ComboBox` opens with the selected option's text in the input, the selected option is now highlighted instead of the first option, including when the options load after it opens. Previously, pressing Enter could replace the selection with the first option.
