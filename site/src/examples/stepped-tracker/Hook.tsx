import { Button, FlexLayout } from "@salt-ds/core";
import { StackLayout } from "@salt-ds/core";
import { Step, SteppedTracker, useStepReducer } from "@salt-ds/lab";

const initialSteps = [
  { id: "step-1", label: "Step 1" },
  { id: "step-2", label: "Step 2" },
  { id: "step-3", label: "Step 3" },
] as Step.Record[];

export function Hook() {
  const [state, dispatch] = useStepReducer(initialSteps);

  console.log(state);

  return (
    <StackLayout style={{ minWidth: "240px" }}>
      <SteppedTracker>
        {state.steps.map((step) => (
          <Step key={step.key || step.id} {...step} />
        ))}
      </SteppedTracker>
      <FlexLayout justify="space-between">
        <Button onClick={() => dispatch({ type: "previous" })}>Previous</Button>
        <Button onClick={() => dispatch({ type: "next" })}>Next</Button>
      </FlexLayout>
    </StackLayout>
  );
}
