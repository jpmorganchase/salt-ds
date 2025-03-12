import { describe, expect, it } from "vitest";

import {
  assignStepsStage,
  autoStageSteps,
  flattenSteps,
  initStepReducerState,
  resetSteps,
} from "../../stepped-tracker/utils";

import type { StepRecord } from "../../stepped-tracker/Step";

describe("SteppedTracker > utils", () => {
  describe("resetSteps", () => {
    it("should set the stage of all steps to undefined", () => {
      const steps: StepRecord[] = [
        { id: "1", stage: "completed" },
        { id: "2", stage: "active" },
        { id: "3", stage: "pending" },
      ];

      const result = resetSteps(steps);

      expect(result).toEqual([{ id: "1" }, { id: "2" }, { id: "3" }]);
    });
    it("should set the stage of nested steps to undefined", () => {
      const steps: StepRecord[] = [
        {
          id: "1",
          stage: "completed",
          substeps: [
            {
              id: "1.1",
              stage: "completed",
              substeps: [
                { id: "1.1.1", stage: "completed" },
                { id: "1.1.2", stage: "completed" },
              ],
            },
            {
              id: "1.2",
              stage: "inprogress",
              substeps: [
                { id: "1.2.1", stage: "completed" },
                { id: "1.2.2", stage: "active" },
                { id: "1.2.3", stage: "pending" },
              ],
            },
            { id: "1.3", stage: "pending" },
          ],
        },
        { id: "2", stage: "pending" },
        { id: "3", stage: "pending" },
      ];

      const result = resetSteps(steps);

      expect(result).toEqual([
        {
          id: "1",
          substeps: [
            {
              id: "1.1",
              substeps: [{ id: "1.1.1" }, { id: "1.1.2" }],
            },
            {
              id: "1.2",
              substeps: [{ id: "1.2.1" }, { id: "1.2.2" }, { id: "1.2.3" }],
            },
            { id: "1.3" },
          ],
        },
        { id: "2" },
        { id: "3" },
      ]);
    });
  });
  describe("assignStepsStage", () => {
    it("should assign an array of steps to a stage (completed)", () => {
      const steps: StepRecord[] = [{ id: "1" }, { id: "2" }, { id: "3" }];

      const result = assignStepsStage(steps, "completed");

      expect(result).toEqual([
        { id: "1", stage: "completed" },
        { id: "2", stage: "completed" },
        { id: "3", stage: "completed" },
      ]);
    });
    it("should assign an array of steps to a stage (pending)", () => {
      const steps: StepRecord[] = [{ id: "1" }, { id: "2" }, { id: "3" }];

      const result = assignStepsStage(steps, "pending");

      expect(result).toEqual([
        { id: "1", stage: "pending" },
        { id: "2", stage: "pending" },
        { id: "3", stage: "pending" },
      ]);
    });
    it("should assign an array of nested steps to a stage", () => {
      const steps: StepRecord[] = [
        { id: "1" },
        {
          id: "2",
          substeps: [{ id: "2.1" }, { id: "2.2" }],
        },
        {
          id: "3",
          substeps: [
            {
              id: "3.1",
              substeps: [{ id: "3.1.1" }],
            },
          ],
        },
      ];

      const result = assignStepsStage(steps, "completed");

      expect(result).toEqual([
        { id: "1", stage: "completed" },
        {
          id: "2",
          stage: "completed",
          substeps: [
            { id: "2.1", stage: "completed" },
            { id: "2.2", stage: "completed" },
          ],
        },
        {
          id: "3",
          stage: "completed",
          substeps: [
            {
              id: "3.1",
              stage: "completed",
              substeps: [{ id: "3.1.1", stage: "completed" }],
            },
          ],
        },
      ]);
    });
  });
  describe("autoStageSteps", () => {
    it("should return pending if no active, nor completed step", () => {
      const config: StepRecord[] = [{ id: "1" }, { id: "2" }, { id: "3" }];

      expect(autoStageSteps(config)).toEqual([
        { id: "1", stage: "pending" },
        { id: "2", stage: "pending" },
        { id: "3", stage: "pending" },
      ]);
    });
    it("should set steps before active step to completed", () => {
      const config: StepRecord[] = [
        { id: "1" },
        { id: "2" },
        { id: "3", stage: "active" },
      ];

      const result = autoStageSteps(config);

      expect(result[0]).toHaveProperty("stage", "completed");
      expect(result[1]).toHaveProperty("stage", "completed");
      expect(result[2]).toHaveProperty("stage", "active");
    });
    it("should set steps after active step to pending", () => {
      const config: StepRecord[] = [
        { id: "1", stage: "active" },
        { id: "2" },
        { id: "3" },
      ];

      const result = autoStageSteps(config);

      expect(result[0]).toHaveProperty("stage", "active");
      expect(result[1]).toHaveProperty("stage", "pending");
      expect(result[2]).toHaveProperty("stage", "pending");
    });
    it("should set steps with active substeps to inprogress on top step", () => {
      const config: StepRecord[] = [
        {
          id: "1",
          substeps: [
            { id: "1.1" },
            { id: "1.2", stage: "active" },
            { id: "1.3" },
          ],
        },
        { id: "2" },
        { id: "3" },
      ];

      const result = autoStageSteps(config);

      const expected: StepRecord[] = [
        {
          id: "1",
          stage: "inprogress",
          substeps: [
            { id: "1.1", stage: "completed" },
            { id: "1.2", stage: "active" },
            { id: "1.3", stage: "pending" },
          ],
        },
        { id: "2", stage: "pending" },
        { id: "3", stage: "pending" },
      ];

      expect(result).toEqual(expected);
    });
    it("should set steps with active substeps to inprogress on middle step", () => {
      const config: StepRecord[] = [
        { id: "1" },
        {
          id: "2",
          substeps: [
            { id: "2.1" },
            { id: "2.2" },
            { id: "2.3", stage: "active" },
          ],
        },
        { id: "3" },
      ];

      const result = autoStageSteps(config);

      const expected: StepRecord[] = [
        { id: "1", stage: "completed" },
        {
          id: "2",
          stage: "inprogress",
          substeps: [
            { id: "2.1", stage: "completed" },
            { id: "2.2", stage: "completed" },
            { id: "2.3", stage: "active" },
          ],
        },
        { id: "3", stage: "pending" },
      ];

      expect(result).toEqual(expected);
    });
    it("should set steps with active substeps to inprogress on middle step with substeps above", () => {
      const config: StepRecord[] = [
        {
          id: "1",
          substeps: [{ id: "1.1" }, { id: "1.2" }, { id: "1.3" }],
        },
        {
          id: "2",
          substeps: [
            { id: "2.1" },
            { id: "2.2", stage: "active" },
            { id: "2.3" },
          ],
        },
        { id: "3" },
      ];

      const expected: StepRecord[] = [
        {
          id: "1",
          stage: "completed",
          substeps: [
            { id: "1.1", stage: "completed" },
            { id: "1.2", stage: "completed" },
            { id: "1.3", stage: "completed" },
          ],
        },
        {
          id: "2",
          stage: "inprogress",
          substeps: [
            { id: "2.1", stage: "completed" },
            { id: "2.2", stage: "active" },
            { id: "2.3", stage: "pending" },
          ],
        },
        { id: "3", stage: "pending" },
      ];

      expect(autoStageSteps(config)).toEqual(expected);
    });
    it("should set steps with active substeps to inprogress on middle step with substeps above", () => {
      const config: StepRecord[] = [
        {
          id: "1",
          substeps: [{ id: "1.1" }, { id: "1.2" }, { id: "1.3" }],
        },
        {
          id: "2",
          substeps: [
            { id: "2.1" },
            {
              id: "2.2",
              substeps: [
                { id: "2.2.1" },
                { id: "2.2.2", stage: "active" },
                { id: "2.2.3" },
              ],
            },
            { id: "2.3" },
          ],
        },
        { id: "3" },
      ];

      const expected: StepRecord[] = [
        {
          id: "1",
          stage: "completed",
          substeps: [
            { id: "1.1", stage: "completed" },
            { id: "1.2", stage: "completed" },
            { id: "1.3", stage: "completed" },
          ],
        },
        {
          id: "2",
          stage: "inprogress",
          substeps: [
            { id: "2.1", stage: "completed" },
            {
              id: "2.2",
              stage: "inprogress",
              substeps: [
                { id: "2.2.1", stage: "completed" },
                { id: "2.2.2", stage: "active" },
                { id: "2.2.3", stage: "pending" },
              ],
            },
            { id: "2.3", stage: "pending" },
          ],
        },
        { id: "3", stage: "pending" },
      ];

      expect(autoStageSteps(config)).toEqual(expected);
    });
  });
  describe("flattenSteps", () => {
    it("should return a the same array if no substeps", () => {
      const steps: StepRecord[] = [{ id: "1" }, { id: "2" }, { id: "3" }];

      expect(flattenSteps(steps)).toEqual(steps);
    });
    it("should return flattenSteps array of steps (depth 1)", () => {
      const steps: StepRecord[] = [
        { id: "1" },
        {
          id: "2",
          substeps: [{ id: "2.1" }, { id: "2.2", stage: "active" }],
        },
        { id: "3" },
      ];

      expect(flattenSteps(steps)).toEqual([
        { id: "1" },
        { id: "2.1" },
        { id: "2.2", stage: "active" },
        { id: "3" },
      ]);
    });
    it("should return flattenSteps array of steps (depth 2)", () => {
      const steps: StepRecord[] = [
        { id: "1" },
        {
          id: "2",
          substeps: [
            { id: "2.1" },
            {
              id: "2.2",
              substeps: [{ id: "2.2.1" }, { id: "2.2.2", stage: "active" }],
            },
          ],
        },
        { id: "3" },
      ];

      expect(flattenSteps(steps)).toEqual([
        { id: "1" },
        { id: "2.1" },
        { id: "2.2.1" },
        { id: "2.2.2", stage: "active" },
        { id: "3" },
      ]);
    });
  });
  describe("initStepReducerState", () => {
    it("should work when active stage is in the beginning of initialSteps ", () => {
      const initialSteps: StepRecord[] = [
        { id: "1", stage: "active" },
        { id: "2" },
        { id: "3" },
      ];

      const state = initStepReducerState(initialSteps);

      expect(state.activeStepIndex).toEqual(0);
      expect(state.activeStep).toEqual(state.steps[0]);
      expect(state.nextStep).toEqual(state.steps[1]);
      expect(state.previousStep).toEqual(null);

      expect(state.steps[0]).toHaveProperty("stage", "active");
      expect(state.steps[1]).toHaveProperty("stage", "pending");
      expect(state.steps[2]).toHaveProperty("stage", "pending");

      expect(state.started).toEqual(true);
      expect(state.ended).toEqual(false);
    });

    it("should work when active stage is in the middle of initialSteps ", () => {
      const initialSteps: StepRecord[] = [
        { id: "1" },
        { id: "2", stage: "active" },
        { id: "3" },
      ];

      const state = initStepReducerState(initialSteps);

      expect(state.activeStepIndex).toEqual(1);
      expect(state.activeStep).toEqual(state.steps[1]);
      expect(state.nextStep).toEqual(state.steps[2]);
      expect(state.previousStep).toEqual(state.steps[0]);

      expect(state.steps[0]).toHaveProperty("stage", "completed");
      expect(state.steps[1]).toHaveProperty("stage", "active");
      expect(state.steps[2]).toHaveProperty("stage", "pending");

      expect(state.started).toEqual(true);
      expect(state.ended).toEqual(false);
    });

    it("should work when active stage is in the middle of initialSteps ", () => {
      const initialSteps: StepRecord[] = [
        { id: "1" },
        { id: "2" },
        { id: "3", stage: "active" },
      ];

      const state = initStepReducerState(initialSteps);

      expect(state.activeStepIndex).toEqual(2);
      expect(state.activeStep).toEqual(state.steps[2]);
      expect(state.nextStep).toEqual(null);
      expect(state.previousStep).toEqual(state.steps[1]);

      expect(state.steps[0]).toHaveProperty("stage", "completed");
      expect(state.steps[1]).toHaveProperty("stage", "completed");
      expect(state.steps[2]).toHaveProperty("stage", "active");

      expect(state.started).toEqual(true);
      expect(state.ended).toEqual(false);
    });

    it("should work when no active stage set", () => {
      const initialSteps: StepRecord[] = [
        { id: "1" },
        { id: "2" },
        { id: "3" },
      ];

      const state = initStepReducerState(initialSteps);

      expect(state.activeStepIndex).toEqual(-1);
      expect(state.activeStep).toEqual(null);
      expect(state.nextStep).toEqual(state.steps[0]);
      expect(state.previousStep).toEqual(null);

      expect(state.steps[0]).toHaveProperty("stage", "pending");
      expect(state.steps[1]).toHaveProperty("stage", "pending");
      expect(state.steps[2]).toHaveProperty("stage", "pending");

      expect(state.started).toEqual(false);
      expect(state.ended).toEqual(false);
    });

    it("should work when no active stage set, but first is completed ", () => {
      const initialSteps: StepRecord[] = [
        { id: "1", stage: "completed" },
        { id: "2", stage: "completed" },
        { id: "3", stage: "completed" },
      ];

      const state = initStepReducerState(initialSteps);

      expect(state.activeStepIndex).toEqual(state.flatSteps.length);
      expect(state.activeStep).toEqual(null);
      expect(state.nextStep).toEqual(null);
      expect(state.previousStep).toEqual(state.steps[2]);

      expect(state.steps[0]).toHaveProperty("stage", "completed");
      expect(state.steps[1]).toHaveProperty("stage", "completed");
      expect(state.steps[2]).toHaveProperty("stage", "completed");

      expect(state.started).toEqual(true);
      expect(state.ended).toEqual(true);
    });
  });
});
