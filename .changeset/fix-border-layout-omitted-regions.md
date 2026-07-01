---
"@salt-ds/core": patch
---

Fixed `BorderLayout` leaving empty rows or columns when the `north`, `south`, `west`, or `east` regions were omitted. The grid template now only includes tracks for the regions that are present, so omitted regions no longer leave gaps.
