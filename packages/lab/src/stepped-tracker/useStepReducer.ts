import { useMemo, useReducer } from "react";

import stepReducer from "./stepReducer";
import { initStepReducerState } from "./utils";

import type { Step } from "./Step";
import type { StepReducer } from "./stepReducer";

export function useStepReducer(
  initialSteps: Step.Record[],
  options?: StepReducer.Options,
) {
  const state = useMemo(
    () => initStepReducerState(initialSteps, options),
    [initialSteps, options],
  );

  return useReducer(stepReducer, state);
}
