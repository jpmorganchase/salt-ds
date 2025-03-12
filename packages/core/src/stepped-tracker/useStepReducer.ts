import { useCallback, useReducer } from "react";

import stepReducer from "./internal/stepReducer";

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
) {
  const initializer = useCallback(
    (initialSteps: StepRecord[]) => {
      return initStepReducerState(initialSteps, options);
    },
    [options],
  );

  return useReducer(stepReducer, initialSteps, initializer);
}
