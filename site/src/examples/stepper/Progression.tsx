import { useState } from 'react';
import { Button } from '@salt-ds/core';
import { Stepper, Step } from '@salt-ds/lab';
import { StackLayout } from '@salt-ds/core';

const steps = [
  { id: 'step-1', label: 'Step 1', description: 'Description text' },
  { id: 'step-2', label: 'Step 2', description: 'Description text' },
  { id: 'step-3', label: 'Step 3', description: 'Description text' }
] as const;

type StepID = typeof steps[number]['id'];

export function Progression() {
  const [stepper, dispatch] = useStepper()

  return (
    <StackLayout>
      <Stepper>
        {steps.map((step) => (
          <Step
            key={step.id}
            stage={getStage(step.id)}
            {...step}
          />
        ))}
      </Stepper>
      <Button onClick={() => handleNext()}>
        Previous
      </Button>
      <Button onClick={() => handlePrevious()}>
        Next
      </Button>
    </StackLayout>
  )
}