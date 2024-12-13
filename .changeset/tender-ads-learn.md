---
"@salt-ds/lab": patch
---

Refactored SteppedTracker, added Step and useStepReducer

The `SteppedTracker` is a component that helps you manage a series of steps in a process. It provides a way to navigate between steps, and to track the progress of the process.

The `<SteppedTracker />` is meant to be used in conjunction with the `<Step />` component and potentially the `useStepReducer()` hook.

In it's simplest form the `SteppedTracker` can be used like so:

```tsx
import { SteppedTracker, Step } from "@salt-ds/lab";

function Example() {
  return (
    <SteppedTracker>
      <Step label="Step 1" stage="completed" />
      <Step label="Step 2" stage="active" />
      <Step label="Step 3" stage="pending" />
    </SteppedTracker>
  );
}
```

The SteppedTracker component supports nested steps, which can be used to represent sub-steps within a step. This can be done by nesting `<Step />` components within another `<Step />` component. We advise you not to go above 2 levels deep, as it becomes hard to follow for the user.

```tsx
import { StackLayout } from "@salt-ds/core";
import { Step, SteppedTracker } from "@salt-ds/lab";

export function NestedSteps() {
  return (
    <StackLayout style={{ minWidth: "240px" }}>
      <SteppedTracker orientation="vertical">
        <Step label="Step 1" stage="completed">
          <Step label="Step 1.1" stage="completed" />
        </Step>
        <Step label="Step 2" stage="inprogress">
          <Step label="Step 2.1" stage="active" />
          <Step label="Step 2.2" stage="pending">
            <Step label="Step 2.2.1" stage="pending" />
            <Step label="Step 2.2.2" stage="pending" />
            <Step label="Step 2.2.3" stage="pending" />
          </Step>
        </Step>
        <Step label="Step 3">
          <Step label="Step 3.1" stage="pending" />
          <Step label="Step 3.2" stage="pending" />
          <Step label="Step 3.3" stage="pending">
            <Step label="Step 3.3.1" stage="pending" />
            <Step label="Step 3.3.2" stage="pending" />
            <Step label="Step 3.3.3" stage="pending" />
          </Step>
        </Step>
      </SteppedTracker>
    </StackLayout>
  );
}
```

The `SteppedTracker` component is a purely presentational component, meaning that you need to manage the state of the steps yourself. That however becomes tricky when dealing with nested steps. This is where the `useStepReducer()` hook comes in. It is a custom hook that helps you manage the state of a `SteppedTracker` component with nested steps with ease. It has a built-in algorithm that determines the stage of all steps above and below the active step. All you need to do is add `stage: 'active'` to the desired step (see `step-3-3` in the hook example below), the hook will figure out the rest. This is what we call `autoStage`.

Migrating from the previous SteppedTracker API

Before:

```tsx
function Before() {
  return (
    <SteppedTracker activeStep={0}>
      <TrackerStep>
        <StepLabel>Step One</StepLabel>
      </TrackerStep>
      <TrackerStep>
        <StepLabel>Step Two</StepLabel>
      </TrackerStep>
      <TrackerStep>
        <StepLabel>Step Three</StepLabel>
      </TrackerStep>
      <TrackerStep>
        <StepLabel>Step Four</StepLabel>
      </TrackerStep>
    </SteppedTracker>
  );
}
```

After:

```tsx
function After() {
  return (
    <SteppedTracker>
      <Step label="Step One" stage="active" />
      <Step label="Step Two" />
      <Step label="Step Three" />
      <Step label="Step Four" />
    </SteppedTracker>
  );
}
```

Before:

```tsx
function Before() {
  return (
    <SteppedTracker orientation="vertical" activeStep={8}>
      <TrackerStep stage="completed">
        <StepLabel>Step 1</StepLabel>
      </TrackerStep>
      <TrackerStep depth={1} stage="completed">
        <StepLabel>Step 1.1</StepLabel>
      </TrackerStep>
      <TrackerStep depth={1} stage="completed">
        <StepLabel>Step 1.2</StepLabel>
      </TrackerStep>
      <TrackerStep depth={1} stage="completed">
        <StepLabel>Step 1.3</StepLabel>
      </TrackerStep>
      <TrackerStep stage="completed">
        <StepLabel>Step 2</StepLabel>
      </TrackerStep>
      <TrackerStep stage="inprogress">
        <StepLabel>Step 3</StepLabel>
      </TrackerStep>
      <TrackerStep depth={1} stage="completed">
        <StepLabel>Step 3.1</StepLabel>
      </TrackerStep>
      <TrackerStep depth={1} stage="completed">
        <StepLabel>Step 3.2</StepLabel>
      </TrackerStep>
      <TrackerStep depth={1} stage="inprogress">
        <StepLabel>Step 3.3</StepLabel>
      </TrackerStep>
      <TrackerStep depth={1}>
        <StepLabel>Step 3.4</StepLabel>
      </TrackerStep>
      <TrackerStep>
        <StepLabel>Step 4</StepLabel>
      </TrackerStep>
    </SteppedTracker>
  );
}
```

After

```tsx
function After() {
  return (
    <SteppedTracker orientation="vertical">
      <Step label="Step 1" stage="completed">
        <Step label="Step 1.1" stage="completed" />
        <Step label="Step 1.2" stage="completed" />
        <Step label="Step 1.3" stage="completed" />
      </Step>
      <Step label="Step 2" stage="completed" />
      <Step label="Step 3" stage="inprogress">
        <Step label="Step 3.1" stage="completed" />
        <Step label="Step 3.2" stage="completed" />
        <Step label="Step 3.3" stage="active" />
        <Step label="Step 3.3" />
      </Step>
      <Step label="Step 4" />
    </SteppedTracker>
  );
}
```

or you can utilize the hook for nested scenarios, such as the one above

```tsx
import { Step, SteppedTracker, useStepReducer } from "@salt-ds/lab";

export function AfterWithHook() {
  const [state, dispatch] = useStepReducer([
    {
      key: "step-1",
      label: "Step 1",
      substeps: [
        { key: "step-1-1", label: "Step 1.1" },
        { key: "step-1-2", label: "Step 1.2" },
        { key: "step-1-3", label: "Step 1.3" },
      ],
    },
    { key: "step-2", label: "Step 2" },
    {
      key: "step-3",
      label: "Step 3",
      substeps: [
        { key: "step-3-1", label: "Step 3.1" },
        { key: "step-3-2", label: "Step 3.2" },
        { key: "step-3-3", label: "Step 3.3", stage: "active" },
        { key: "step-3-4", label: "Step 3.4" },
      ],
    },
    { key: "step-4", label: "Step 4" },
  ]);

  return (
    <StackLayout style={{ width: 240 }}>
      <SteppedTracker orientation="vertical">
        {state.steps.map((step) => (
          <Step key={step.key || step.id} {...step} />
        ))}
      </SteppedTracker>
    </StackLayout>
  );
}
```
