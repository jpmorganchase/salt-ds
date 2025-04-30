import {
  Button,
  FlexLayout,
  StackLayout,
  Step,
  type StepId,
  type StepProps,
  Stepper,
} from "@salt-ds/core";

import { type Dispatch, useCallback, useReducer } from "react";
import {
  assignStepStatus,
  assignStepsStage,
  autoStageSteps,
  flattenSteps,
  initStepperReducerState,
  resetSteps,
} from "./utils";

type StepRecord = StepProps & { id: string };

const initialSteps = [
  { id: "step-1", label: "Step 1" },
  { id: "step-2", label: "Step 2" },
  { id: "step-3", label: "Step 3" },
] as StepRecord[];

/**
 * An example of a custom hook to control the stepper state, or write your own.
 */
interface StepperReducerState {
  steps: StepRecord[]; // The list of all steps.
  flatSteps: StepRecord[]; // A flattened version of the steps.
  activeStepIndex: number;
  activeStep: StepRecord | null; // The currently active step.
  previousStep: StepRecord | null; // The step immediately before the active step.
  nextStep: StepRecord | null; // The step immediately after the active step.
  started: boolean; // A boolean indicating if the process has started.
  ended: boolean; // A boolean indicating if the process has ended.
}

type StepperReducerAction =
  | { type: "next" } // Move to the next step.
  | { type: "previous" } // Move to the previous step.
  | { type: "reset" }
  | { type: "status/error" } // Set the status of the active step to `'error'`.
  | { type: "status/warning" } // Set the status of the active step to `'warning'`.
  | { type: "status/clear" } // Set the status of the active step to `undefined`.
  | { type: "move"; payload: StepId };

type StepperReducerDispatch = Dispatch<StepperReducerAction>;

interface StepperReducerOptions {
  activeStepId?: string;
}

function StepperReducer(
  state: StepperReducerState,
  action: StepperReducerAction,
): StepperReducerState {
  switch (action.type) {
    case "next": {
      if (state.activeStep?.status === "error") {
        return state;
      }

      const activeStepIndex = state.activeStepIndex + 1;
      const lastStepIndex = state.flatSteps.length - 1;

      if (activeStepIndex > lastStepIndex) {
        const steps = assignStepsStage(state.steps, "completed");
        const flatSteps = flattenSteps(steps);

        return {
          steps,
          flatSteps,
          activeStepIndex: lastStepIndex + 1,
          activeStep: null,
          previousStep: flatSteps[lastStepIndex],
          nextStep: null,
          started: true,
          ended: true,
        };
      }

      const activeStepId = state.flatSteps[activeStepIndex].id;
      const steps = autoStageSteps(resetSteps(state.steps), { activeStepId });
      const flatSteps = flattenSteps(steps);

      return {
        steps,
        flatSteps,
        activeStepIndex,
        activeStep: flatSteps[activeStepIndex],
        previousStep: flatSteps[activeStepIndex - 1],
        nextStep: flatSteps[activeStepIndex + 1] ?? null,
        started: true,
        ended: false,
      };
    }

    case "previous": {
      if (state.activeStep?.status === "error") {
        return state;
      }

      const activeStepIndex = state.activeStepIndex - 1;

      if (activeStepIndex < 0) {
        const steps = assignStepsStage(state.steps, "pending");
        const flatSteps = flattenSteps(steps);

        return {
          steps,
          flatSteps,
          activeStepIndex: -1,
          activeStep: null,
          previousStep: null,
          nextStep: flatSteps[0],
          started: false,
          ended: false,
        };
      }

      const activeStepId = state.flatSteps[activeStepIndex].id;
      const steps = autoStageSteps(resetSteps(state.steps), { activeStepId });
      const flatSteps = flattenSteps(steps);

      return {
        steps,
        flatSteps,
        activeStepIndex,
        activeStep: flatSteps[activeStepIndex],
        previousStep: flatSteps[activeStepIndex - 1] ?? null,
        nextStep: flatSteps[activeStepIndex + 1],
        started: true,
        ended: false,
      };
    }

    case "move": {
      const activeStepId = action.payload;
      const steps = autoStageSteps(resetSteps(state.steps), { activeStepId });
      const flatSteps = flattenSteps(steps);
      const lastStepIndex = state.flatSteps.length - 1;
      const activeStepIndex = flatSteps.findIndex(
        (step) => step.stage === "active",
      );

      return {
        steps,
        flatSteps,
        activeStepIndex,
        activeStep: flatSteps[activeStepIndex],
        previousStep: flatSteps[activeStepIndex - 1] ?? null,
        nextStep: flatSteps[activeStepIndex + 1] ?? null,
        started: true,
        ended: activeStepIndex === lastStepIndex,
      };
    }

    case "status/error": {
      const { activeStep, activeStepIndex } = state;

      if (!activeStep) {
        return state;
      }

      const activeStepId = activeStep.id;

      const steps = assignStepStatus(state.steps, activeStepId, "error");
      const flatSteps = flattenSteps(steps);

      return {
        ...state,
        steps,
        flatSteps,
        activeStepIndex,
        activeStep: flatSteps[activeStepIndex],
        previousStep: flatSteps[activeStepIndex - 1] ?? null,
        nextStep: flatSteps[activeStepIndex + 1],
      };
    }

    case "status/warning": {
      const { activeStep, activeStepIndex } = state;

      if (!activeStep) {
        return state;
      }

      const activeStepId = activeStep.id;

      const steps = assignStepStatus(state.steps, activeStepId, "warning");
      const flatSteps = flattenSteps(steps);

      return {
        ...state,
        steps,
        flatSteps,
        activeStepIndex,
        activeStep: flatSteps[activeStepIndex],
        previousStep: flatSteps[activeStepIndex - 1] ?? null,
        nextStep: flatSteps[activeStepIndex + 1],
      };
    }

    case "status/clear": {
      const { activeStep, activeStepIndex } = state;

      if (!activeStep) {
        return state;
      }

      const activeStepId = activeStep.id;

      const steps = assignStepStatus(state.steps, activeStepId, undefined);
      const flatSteps = flattenSteps(steps);

      return {
        ...state,
        steps,
        flatSteps,
        activeStepIndex,
        activeStep: flatSteps[activeStepIndex],
        previousStep: flatSteps[activeStepIndex - 1] ?? null,
        nextStep: flatSteps[activeStepIndex + 1],
      };
    }

    case "reset": {
      const firstStepId = state.flatSteps[0].id;

      const steps = autoStageSteps(
        resetSteps(state.steps, { resetStatus: true }),
        { activeStepId: firstStepId },
      );
      const flatSteps = flattenSteps(steps);

      return {
        steps,
        flatSteps,
        activeStepIndex: 0,
        activeStep: flatSteps[0],
        previousStep: null,
        nextStep: flatSteps[1],
        started: true,
        ended: false,
      };
    }

    default: {
      const exhaustiveCheck: never = action;
      throw new Error(`Unhandled StepperReducer Action: ${exhaustiveCheck}`);
    }
  }
}

function useStepperReducer(
  initialSteps: StepRecord[],
  options?: StepperReducerOptions,
): [StepperReducerState, StepperReducerDispatch] {
  const initializer = useCallback(
    (initialSteps: StepRecord[]) => {
      return initStepperReducerState(initialSteps, options);
    },
    [options],
  );

  return useReducer(StepperReducer, initialSteps, initializer);
}

export function Reducer() {
  const [state, dispatch] = useStepperReducer(initialSteps);

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
