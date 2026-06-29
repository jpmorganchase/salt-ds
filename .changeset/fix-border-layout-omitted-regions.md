---
"@salt-ds/core": patch
---

Fixed `BorderLayout` reserving empty rows and columns when the `north`, `south`, `west`, or `east` regions are omitted. The grid template now only includes tracks for the regions that are present, so omitted regions no longer leave gaps in the layout.
