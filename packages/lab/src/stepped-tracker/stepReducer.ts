import type { StepReducerAction, StepReducerState } from "./stepReducer.types";
import {
  assignStepStatus,
  assignStepsStage,
  autoStageSteps,
  flattenSteps,
  resetSteps,
} from "./utils";

export default function stepReducer(
  state: StepReducerState,
  action: StepReducerAction,
): StepReducerState {
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
      throw new Error(`Unhandled action: ${exhaustiveCheck}`);
    }
  }
}
