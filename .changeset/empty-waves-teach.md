---
"@jpmorganchase/uitk-core": minor
---

change applyClassesToChild prop to applyClassesToBody prop in ToolkitProvider, if this prop is set to "root" on a root level Toolkitprovider, then the provider will apply the theme classes to the html element instead of creating a uitk-theme element. Setting the prop to "child" will make the ToolkitProvider apply the classes to the child element as before
