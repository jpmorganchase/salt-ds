import { Button, FlexLayout } from "@salt-ds/core";
import { StackLayout } from "@salt-ds/core";
import { Step, Stepper, useSteppedReducer } from "@salt-ds/lab";

const initialSteps = [
  { id: "step-1", label: "Step 1" },
  { id: "step-2", label: "Step 2" },
  { id: "step-3", label: "Step 3" },
] as Step.Props[];

export function Hook() {
  const [state, dispatch] = useSteppedReducer(initialSteps);

  return (
    <StackLayout style={{ minWidth: "240px" }}>
      <Stepper>
        {state.steps.map((step) => (
          <Step key={step.id} {...step} />
        ))}
      </Stepper>
      <FlexLayout justify="space-between">
        <Button onClick={() => dispatch({ type: "previous" })}>Previous</Button>
        <Button onClick={() => dispatch({ type: "next" })}>Next</Button>
      </FlexLayout>
    </StackLayout>
  );
}
