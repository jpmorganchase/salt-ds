---
"@salt-ds/lab": minor
---

Added `AvatarGroup` to the lab package.

`AvatarGroup` displays a collection of avatars in a compact, overlapping stack. Compose the avatars you want to display and, when members are hidden, add an `AvatarGroupCount` as the last child to indicate the remaining members.

```tsx
import { Avatar } from "@salt-ds/core";
import { AvatarGroup, AvatarGroupCount } from "@salt-ds/lab";

<AvatarGroup aria-label="Team members">
  <Avatar name="Alex Brailescu" />
  <Avatar name="Peter Piper" />
  <Avatar name="John Doe" />
  <AvatarGroupCount count={1} />
</AvatarGroup>;
```
