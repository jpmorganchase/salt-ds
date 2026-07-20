---
"@salt-ds/lab": minor
---

Added `AvatarGroup` to the lab package.

`AvatarGroup` displays a collection of avatars in a compact, overlapping stack. Use the `max` prop to limit the number of visible avatars and collapse the remainder into a surplus indicator, and `renderSurplus` to customize how that surplus is shown.

```tsx
import { Avatar } from "@salt-ds/core";
import { AvatarGroup } from "@salt-ds/lab";

<AvatarGroup max={3}>
  <Avatar name="Alex Brailescu" />
  <Avatar name="Peter Piper" />
  <Avatar name="John Doe" />
  <Avatar name="Jane Doe" />
</AvatarGroup>;
```
