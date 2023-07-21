---
"@salt-ds/lab": patch
---

SteppedTracker

- Added `SteppedTracker` component
- Includes the `TrackerStep` and `StepLabel` subcomponents

Usage:

```jsx
<SteppedTracker activeStep={1}>
  <TrackerStep>
    <StepLabel state="completed">Step 1</StepLabel>
  <TrackerStep>
  <TrackerStep>
    <StepLabel>Step 2</StepLabel>
  <TrackerStep>
  <TrackerStep>
    <StepLabel>Step 3</StepLabel>
  <TrackerStep>
</SteppedTracker>
```
