---
"@salt-ds/lab": minor
---

Added `CompactStepper`, a horizontal stepper for smaller viewports such as mobile. It shows progress through a process as a single track, with the current step as text, for example "Step 2 of 4: Payment details". Compose it with the same `Step` used in `Stepper`.

```tsx
import { Step } from "@salt-ds/core";
import { CompactStepper } from "@salt-ds/lab";

<CompactStepper>
  <Step label="Personal details" stage="completed" />
  <Step label="Payment details" stage="active" />
  <Step label="Review" />
  <Step label="Confirmation" />
</CompactStepper>;
```
