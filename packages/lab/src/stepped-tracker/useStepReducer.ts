import { useMemo, useReducer } from "react";

import stepReducer from "./stepReducer";
import { initStepReducerState } from "./utils";

import type { StepRecord } from "./Step.types";
import type { StepReducerOptions } from "./stepReducer.types";

export function useStepReducer(
  initialSteps: StepRecord[],
  options?: StepReducerOptions,
) {
  const state = useMemo(
    () => initStepReducerState(initialSteps, options),
    [initialSteps, options],
  );

  return useReducer(stepReducer, state);
}
