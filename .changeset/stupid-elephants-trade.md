---
"@salt-ds/core": minor
---

Deprecated `interactable` and `disabled` props in Card
Created `InteractableCard` component for Cards which can perform an action, e.g. linking to a different page or content

To migrate from the previous to new implementation:

```diff
-    import { Card } from "@salt-ds/core";
-
-    const MyInteractableCard = () => (
-        <Card interactable />
-    );

-    const MyInteractableDisabledCard = () => (
-        <Card interactable disabled />
-    );

+  import { InteractableCard } from "@salt-ds/core";
+
+   const MyInteractableCard = () => (
+       <InteractableCard />
+   );
+
+   const MyInteractableDisabledCard = () => (
+       <InteractableCard disabled />
+   );
```
