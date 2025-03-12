---
"@salt-ds/core": minor
---

Moved `SteppedTracker` component to core. `Stepped Tracker` visually communicates a user’s progress through a linear process. It gives the user context about where they are, which steps have they completed, how many steps are left and if any errors or warnings have occurred.

```tsx
import { SteppedTracker, Step } from "@salt-ds/core";

function Example() {
  return (
    <SteppedTracker orientation="horizontal">
      <Step label="Step 1" stage="completed" />
      <Step label="Step 2" stage="active" />
      <Step label="Step 3" stage="pending" />
    </SteppedTracker>
  );
}
```
