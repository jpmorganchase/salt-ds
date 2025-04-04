import { useCallback, useReducer } from "react";
import type { StepRecord } from "./Step";
import {
  StepperReducer,
  type StepperReducerDispatch,
  type StepperReducerState,
} from "./internal/StepperReducer";
import type { StepperReducerOptions } from "./internal/StepperReducer";
import { initStepperReducerState } from "./internal/utils";

/**
 * @experimental
 * This hook is experimental and may change in future releases.
 */
export function useStepperReducer(
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
