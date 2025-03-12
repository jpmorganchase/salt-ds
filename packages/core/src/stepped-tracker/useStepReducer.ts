import { useCallback, useReducer } from "react";

import stepReducer from "./stepReducer";

import type { StepRecord } from "./Step";
import type { StepReducerOptions } from "./stepReducer";
import { initStepReducerState } from "./utils";

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
