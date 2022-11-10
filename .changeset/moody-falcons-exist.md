---
"@jpmorganchase/uitk-core": patch
---

Separate ToolkitContext into Density, Theme and Breakpoint contexts. This will prevent any component where useTheme is used from re-rendering if density updates in the context and vice versa.
