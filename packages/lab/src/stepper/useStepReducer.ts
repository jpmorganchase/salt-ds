import { useReducer } from "react";

import stepReducer from "./stepReducer";
import { initStepReducerState } from "./utils";

import type { Step } from "./Step";
import type { StepReducer } from "./stepReducer";

export function useStepReducer(
  initialSteps: Step.Props[],
  options?: StepReducer.Options,
) {
  const state = initStepReducerState(initialSteps, options);

  return useReducer(stepReducer, state);
}
