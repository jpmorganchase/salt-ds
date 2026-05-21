---
"@salt-ds/lab": minor
---

Removed `MegaMenuItemContent`. Pass the label directly to `MegaMenuItem`.

```diff
- <MegaMenuItem>
-   <Icon aria-hidden />
-   <MegaMenuItemContent>Digital banking</MegaMenuItemContent>
- </MegaMenuItem>
+ <MegaMenuItem>
+   <Icon aria-hidden />
+   Digital banking
+ </MegaMenuItem>
```
