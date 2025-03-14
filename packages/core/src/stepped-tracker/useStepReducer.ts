import { useCallback, useReducer, Reducer } from "react";
import {
  stepReducer,
  type StepReducerState,
  type StepReducerAction,
} from "./internal/stepReducer";
import type { StepRecord } from "./Step";
import type { StepReducerOptions } from "./internal/stepReducer";
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

  return useReducer<
    Reducer<StepReducerState, StepReducerAction>,
    StepRecord[]
  >(stepReducer, initialSteps, initializer);
}
