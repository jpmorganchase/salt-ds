---
"@salt-ds/lab": minor
---

Added `CompactStepper`, a compact way to show progress through a process. Instead of listing every step, it shows a single track and the current step as text, for example "Step 2 of 4: Payment details". Compose it with `CompactStep`, which takes a `label`, a `stage` (`pending`, `active`, `locked` or `completed`) and an optional `status` (`error` or `warning`).

```tsx
import { CompactStep, CompactStepper } from "@salt-ds/lab";

<CompactStepper aria-label="Checkout progress">
  <CompactStep label="Personal details" stage="completed" />
  <CompactStep label="Payment details" stage="active" />
  <CompactStep label="Review" />
  <CompactStep label="Confirmation" />
</CompactStepper>;
```
