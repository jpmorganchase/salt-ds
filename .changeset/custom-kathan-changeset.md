---
"@jpmorganchase/uitk-core": patch
---

Fixes a bug in ToolkitContext which had previously set the default breakpoints to an empty object. Now it is set to a valid Breakpoints object, specifically the default Breakpoints.
