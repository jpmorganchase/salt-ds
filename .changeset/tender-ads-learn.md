---
"@salt-ds/lab": patch
---

SteppedTracker, Step and useStepReducer

The `SteppedTracker` is a component that helps you manage a series of steps in a process. It provides a way to navigate between steps, and to track the progress of the process.

The `<SteppedTracker />` is meant to be used in conjunction with it's buddies, the `<Step />` component and the `useStepReducer()` hook.

In it's simples form the `SteppedTracker` can be used like so:

```tsx
import { SteppedTracker, Step } from "@salt-ds/lab";

function Example() {
  return (
    <SteppedTracker>
      <Step title="Step 1" stage="completed" />
      <Step title="Step 2" stage="active" />
      <Step title="Step 3" stage="pending" />
    </SteppedTracker>
  );
}
```

The SteppedTracker component supports nested steps, which can be used to represent sub-steps within a step. This can be done by nesting `<Step />` components within another `<Step />` component. We advise you not to go above 2 levels deep, as it becomes hard to follow for the user.

```tsx
import { StackLayout } from "@salt-ds/core";
import { Step, SteppedTracker } from "@salt-ds/lab";

export const NestedSteps = () => {
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
};
```

The `SteppedTracker` component is a purely presentational component, meaning that you need to manage the state of the steps yourself. That however becomes tricky when dealing with nested steps. This is where the `useStepReducer()` hook comes in. It is a custom hook that helps you manage the state of a SteppedTracker component with nested steps with ease. It has a built-in algorithm that determine the stage of all steps above and below the active step. All you need to do is add `stage: 'active'` to the desired step (see `step-1-3-1`), the hook will figure out the rest. This is what we call `autoStage`.

The `useStepReducer()` is used like so:

```tsx
import { StackLayout, SegmentedButtonGroup, Button } from "@salt-ds/core";
import { Step, SteppedTracker, useStepReducer } from "@salt-ds/lab";

const initialSteps = [
  {
    id: "step-1",
    label: "Step 1",
    defaultExpanded: true,
    substeps: [
      { id: "step-1-1", label: "Step 1.1" },
      { id: "step-1-2", label: "Step 1.2" },
      {
        id: "step-1-3",
        label: "Step 1.3",
        defaultExpanded: true,
        substeps: [
          {
            id: "step-1-3-1",
            label: "Step 1.3.1",
            stage: "active",
          },
          { id: "step-1-3-2", label: "Step 1.3.2" },
          {
            id: "step-1-3-3",
            label: "Step 1.3.3",
            description: "This is just a description text",
          },
        ],
      },
      { id: "step-1-4", label: "Step 1.4" },
    ],
  },
  { id: "step-2", label: "Step 2" },
  { id: "step-3", label: "Step 3" },
] satisfies Step.Props[];

export const Example = () => {
  const [state, dispatch] = useStepReducer(initialSteps);

  return (
    <StackLayout style={{ width: 240 }}>
      <SteppedTracker orientation="vertical">
        {state.steps.map((step) => (
          <Step key={step.id} {...step} />
        ))}
      </SteppedTracker>
      <SegmentedButtonGroup>
        {state.started && (
          <Button
            onClick={() => {
              dispatch({ type: "previous" });
            }}
          >
            Previous
          </Button>
        )}
        {!state.ended && (
          <Button
            onClick={() => {
              dispatch({ type: "next" });
            }}
          >
            Next
          </Button>
        )}
      </SegmentedButtonGroup>
      <SegmentedButtonGroup>
        {state.started && !state.ended && (
          <>
            <Button
              onClick={() => {
                dispatch({ type: "error" });
              }}
            >
              Error
            </Button>
            <Button
              onClick={() => {
                dispatch({ type: "warning" });
              }}
            >
              Warning
            </Button>
            <Button
              onClick={() => {
                dispatch({ type: "clear" });
              }}
            >
              Clear
            </Button>
          </>
        )}
      </SegmentedButtonGroup>
    </StackLayout>
  );
};
```
