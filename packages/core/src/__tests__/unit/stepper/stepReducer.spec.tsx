import { describe, expect, it } from "vitest";

import type { StepRecord } from "../../../stepper";
import { stepReducer } from "../../../stepper/internal/StepReducer";
import { initStepReducerState } from "../../../stepper/internal/utils";

describe("stepReducer", () => {
  describe("next", () => {
    it("should move to next step if there is one", () => {
      const steps: StepRecord[] = [
        { id: "1", label: "Step 1", stage: "active" },
        { id: "2", label: "Step 2" },
        { id: "3", label: "Step 3" },
      ];

      let state = initStepReducerState(steps);
      state = stepReducer(state, { type: "next" });

      expect(state.started).toBe(true);
      expect(state.ended).toBe(false);
      expect(state.activeStepIndex).toBe(1);
      expect(state.activeStep).toHaveProperty("id", "2");
      expect(state.previousStep).toHaveProperty("id", "1");
      expect(state.nextStep).toHaveProperty("id", "3");

      state = stepReducer(state, { type: "next" });

      expect(state.started).toBe(true);
      expect(state.ended).toBe(false);
      expect(state.activeStepIndex).toBe(2);
      expect(state.activeStep).toHaveProperty("id", "3");
      expect(state.previousStep).toHaveProperty("id", "2");

      expect(state.nextStep).toBe(null);

      state = stepReducer(state, { type: "next" });

      expect(state.started).toBe(true);
      expect(state.ended).toBe(true);
      expect(state.activeStepIndex).toBe(3);
      expect(state.activeStep).toBe(null);
      expect(state.previousStep).toHaveProperty("id", "3");
      expect(state.nextStep).toBe(null);

      state = stepReducer(state, { type: "next" });

      expect(state.started).toBe(true);
      expect(state.ended).toBe(true);
      expect(state.activeStepIndex).toBe(3);
      expect(state.activeStep).toBe(null);
      expect(state.previousStep).toHaveProperty("id", "3");
      expect(state.nextStep).toBe(null);
    });
  });

  describe("previous", () => {
    it("should move to previous step if there is one", () => {
      const steps: StepRecord[] = [
        { id: "1" },
        { id: "2" },
        { id: "3", stage: "active" },
      ];

      let state = initStepReducerState(steps);
      state = stepReducer(state, { type: "previous" });

      expect(state.started).toBe(true);
      expect(state.ended).toBe(false);
      expect(state.activeStepIndex).toBe(1);
      expect(state.activeStep).toHaveProperty("id", "2");
      expect(state.previousStep).toHaveProperty("id", "1");
      expect(state.nextStep).toHaveProperty("id", "3");

      state = stepReducer(state, { type: "previous" });

      expect(state.started).toBe(true);
      expect(state.ended).toBe(false);
      expect(state.activeStepIndex).toBe(0);
      expect(state.activeStep).toHaveProperty("id", "1");
      expect(state.previousStep).toBe(null);
      expect(state.nextStep).toHaveProperty("id", "2");

      state = stepReducer(state, { type: "previous" });

      expect(state.started).toBe(false);
      expect(state.ended).toBe(false);
      expect(state.activeStepIndex).toBe(-1);
      expect(state.activeStep).toBe(null);
      expect(state.previousStep).toBe(null);
      expect(state.nextStep).toHaveProperty("id", "1");

      state = stepReducer(state, { type: "previous" });
    });
  });

  describe("error", () => {
    it("should set active step status to error", () => {
      const steps: StepRecord[] = [
        { id: "1" },
        { id: "2", stage: "active" },
        { id: "3" },
      ];

      let state = initStepReducerState(steps);
      state = stepReducer(state, { type: "status/error" });

      expect(state.started).toBe(true);
      expect(state.ended).toBe(false);
      expect(state.activeStepIndex).toBe(1);
      expect(state.activeStep).toHaveProperty("id", "2");
      expect(state.activeStep).toHaveProperty("status", "error");
      expect(state.previousStep).toHaveProperty("id", "1");
      expect(state.nextStep).toHaveProperty("id", "3");

      expect(stepReducer(state, { type: "next" })).toBe(state);
      expect(stepReducer(state, { type: "previous" })).toBe(state);
    });
  });

  describe("clear", () => {
    it("should clear active step status", () => {
      const steps: StepRecord[] = [
        { id: "1" },
        { id: "2", stage: "active", status: "error" },
        { id: "3" },
      ];

      const state = stepReducer(initStepReducerState(steps), {
        type: "status/clear",
      });

      expect(state.started).toBe(true);
      expect(state.ended).toBe(false);
      expect(state.activeStepIndex).toBe(1);
      expect(state.activeStep).toHaveProperty("id", "2");
      expect(state.activeStep).toHaveProperty("status", undefined);
      expect(state.previousStep).toHaveProperty("id", "1");
      expect(state.nextStep).toHaveProperty("id", "3");
    });
  });

  describe("reset", () => {
    it("should reset to first step", () => {
      const steps: StepRecord[] = [
        { id: "1", stage: "completed" },
        { id: "2", stage: "active" },
        { id: "3" },
      ];

      const state = stepReducer(initStepReducerState(steps), { type: "reset" });

      expect(state.started).toBe(true);
      expect(state.ended).toBe(false);
      expect(state.activeStepIndex).toBe(0);
      expect(state.activeStep).toHaveProperty("id", "1");
      expect(state.previousStep).toBe(null);
      expect(state.nextStep).toHaveProperty("id", "2");
    });
  });

  describe("goto", () => {
    it("should go to the specified step by stepId", () => {
      const steps: StepRecord[] = [
        { id: "1", label: "Step 1" },
        { id: "2", label: "Step 2" },
        { id: "3", label: "Step 3" },
      ];

      let state = initStepReducerState(steps);

      // Use the "goto" action to jump to step with id "2"
      state = stepReducer(state, { type: "goto", stepId: "2" });

      expect(state.started).toBe(true);
      expect(state.ended).toBe(false);
      expect(state.activeStepIndex).toBe(1);
      expect(state.activeStep).toHaveProperty("id", "2");
      expect(state.previousStep).toHaveProperty("id", "1");
      expect(state.nextStep).toHaveProperty("id", "3");

      // Use the "goto" action to jump to the last step with id "3"
      state = stepReducer(state, { type: "goto", stepId: "3" });

      expect(state.started).toBe(true);
      expect(state.ended).toBe(true);
      expect(state.activeStepIndex).toBe(2);
      expect(state.activeStep).toHaveProperty("id", "3");
      expect(state.previousStep).toHaveProperty("id", "2");
      expect(state.nextStep).toBe(null);

      // Use the "goto" action to jump to the first step with id "1"
      state = stepReducer(state, { type: "goto", stepId: "1" });

      expect(state.started).toBe(true);
      expect(state.ended).toBe(false);
      expect(state.activeStepIndex).toBe(0);
      expect(state.activeStep).toHaveProperty("id", "1");
      expect(state.previousStep).toBe(null);
      expect(state.nextStep).toHaveProperty("id", "2");
    });
  });
});
