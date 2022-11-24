---
"@jpmorganchase/uitk-core": patch
---

Added "scope" as an option for "applyClassesTo" prop, if this is passed into the `ToolkitProvider`, the provider will create a div element and apply the classes to that. The root level toolkit provider now applies the classes to the html element while nested toolkit providers will behave as if "scope" was passed as a prop to "applyClassesTo"
