import { Button, FlexLayout } from '@salt-ds/core';
import { Stepper, Step, useStepReducer } from '@salt-ds/lab';
import { StackLayout } from '@salt-ds/core';

const initialSteps = [
  { id: 'step-1', label: 'Step 1' },
  { id: 'step-2', label: 'Step 2' },
  { id: 'step-3', label: 'Step 3' }
] as Step.Step[];

export function Hook() {
  const [state, dispatch] = useStepReducer(initialSteps);

  return (
    <StackLayout style={{ minWidth: '240px' }}>
      <Stepper>
        {state.steps.map((step) => (
          <Step
            key={step.id}
            {...step}
          />
        ))}
      </Stepper>
      <FlexLayout justify="space-between">
        <Button
          onClick={() => dispatch({ type: 'previous'})}
        >
          Previous
        </Button>
        <Button
          onClick={() => dispatch({ type: 'next'})}
        >
          Next
        </Button>
      </FlexLayout>
    </StackLayout>
  )
}