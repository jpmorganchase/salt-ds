---
"@jpmorganchase/uitk-core": minor
---

Added `"scope"` as an option for `applyClassesTo` prop which causes classes to be applied to a div element created by the `ToolkitProvider`.  

**BREAKING CHANGE:**  
The default value of `applyClassesTo` is now `"root"` for root level `ToolkitProviders` and `"scope"` for nested `ToolkitProviders`.
