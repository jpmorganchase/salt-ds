---
"@salt-ds/core": minor
---

Deprecated `AriaAnnounce` and `AriaAnnounceProps` in favor of `useAriaAnnouncer`. The hook lets applications announce when an action completes, including repeated actions with the same message, without tying announcements to mounting the wrapper or changing its props.

The component and its props type remain exported, and runtime behavior is unchanged.

For action results, call `announce` after the action succeeds:

```diff
-import { AriaAnnounce, Button } from "@salt-ds/core";
-import { useState } from "react";
+import { Button, useAriaAnnouncer } from "@salt-ds/core";

 function SaveButton() {
-  const [announcement, setAnnouncement] = useState("");
+  const { announce } = useAriaAnnouncer();

   async function handleSave() {
     await saveDraft();
-    setAnnouncement("Draft saved");
+    announce("Draft saved");
   }

-  return (
-    <>
-      <Button onClick={handleSave}>Save draft</Button>
-      <AriaAnnounce announcement={announcement} />
-    </>
-  );
+  return <Button onClick={handleSave}>Save draft</Button>;
 }
```

Pass the existing `ariaLive`, `duration`, and `target` options as the second argument to `announce`. For announcements driven by external state, use the hook in an effect and explicitly decide whether to announce the initial state and repeated outcomes. Keep persistent status information visible on the page as well.
