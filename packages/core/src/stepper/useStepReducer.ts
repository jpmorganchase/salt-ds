import { type Reducer, useCallback, useReducer } from "react";
import type { StepRecord } from "./Step";
import {
  StepReducer,
  type StepReducerAction,
  type StepReducerState,
} from "./internal/StepReducer";
import type { StepReducerOptions } from "./internal/StepReducer";
import { initStepReducerState } from "./internal/utils";

/**
 * @experimental
 * This hook is experimental and may change in future releases.
 */
export function useStepReducer(
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
    StepReducer,
    initialSteps,
    initializer,
  );
}
