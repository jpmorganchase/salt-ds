import { type Reducer, useCallback, useReducer } from "react";
import type { StepRecord } from "./Step";
import {
  type StepReducerAction,
  type StepReducerState,
  stepReducer,
} from "./internal/stepReducer";
import type { StepReducerOptions } from "./internal/stepReducer";
import { initStepReducerState } from "./internal/utils";

/**
 * @experimental
 * This hook is experimental and may change in future releases.
 */
export function useStepperReducer(
  initialSteps: StepRecord[],
  options?: StepReducerOptions,
): [StepReducerState, React.Dispatch<StepReducerAction>] {
  const initializer = useCallback(
    (initialSteps: StepRecord[]) => {
      return initStepReducerState(initialSteps, options);
    },
    [options],
  );

  return useReducer<Reducer<StepReducerState, StepReducerAction>, StepRecord[]>(
    stepReducer,
    initialSteps,
    initializer,
  );
}
