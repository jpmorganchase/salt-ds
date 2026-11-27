---
"@salt-ds/core": minor
---

Added `SystemStatus`, `SystemStatusContent` and `SystemStatusActions`. Use a system status at the top of the page for platform-wide messages, such as scheduled maintenance or service outages. It supports `info`, `success`, `warning` and `error` statuses, each with its own icon and background color. Add actions, such as dismiss, to `SystemStatusActions` using `OnSolidButton`.

```tsx
import {
  OnSolidButton,
  SystemStatus,
  SystemStatusActions,
  SystemStatusContent,
  Text,
} from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";

<SystemStatus status="warning">
  <SystemStatusContent>
    <Text color="inherit">
      Scheduled maintenance starts Friday at 11:00PM EST.
    </Text>
  </SystemStatusContent>
  <SystemStatusActions>
    <OnSolidButton aria-label="Dismiss system status">
      <CloseIcon aria-hidden />
    </OnSolidButton>
  </SystemStatusActions>
</SystemStatus>;
```
