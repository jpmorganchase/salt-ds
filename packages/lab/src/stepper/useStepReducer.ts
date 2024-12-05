import { useReducer } from "react";

import { initStepReducerState } from "./utils";
import stepReducer from "./stepReducer";

import type { StepReducer } from "./stepReducer";
import type { Step } from "./Step";

export function useStepReducer(
  initialSteps: Step.Props[],
  options?: StepReducer.Options,
) {
  const state = initStepReducerState(initialSteps, options);

  return useReducer(stepReducer, state);
}
