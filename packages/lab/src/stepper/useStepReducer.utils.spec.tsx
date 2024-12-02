import { describe, expect, it } from "vitest";

import {
  autoStageSteps,
  assignSteps,
  resetSteps,
  flattenSteps,
} from "./useStepReducer.utils";

import type { Step } from "./Step";

describe("Stepper > utils.ts", () => {
  describe("resetSteps", () => {
    it("should set the stage of all steps to undefined", () => {
      const steps: Step.Props[] = [
        { id: "1", stage: "completed" },
        { id: "2", stage: "active" },
        { id: "3", stage: "pending" },
      ];

      const result = resetSteps(steps);

      expect(result).toEqual([{ id: "1" }, { id: "2" }, { id: "3" }]);
    });
    it("should set the stage of nested steps to undefined", () => {
      const steps: Step.Props[] = [
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
  describe("assignSteps", () => {
    it("should assign an array of steps to a stage (completed)", () => {
      const steps: Step.Props[] = [{ id: "1" }, { id: "2" }, { id: "3" }];

      const result = assignSteps(steps, "completed");

      expect(result).toEqual([
        { id: "1", stage: "completed" },
        { id: "2", stage: "completed" },
        { id: "3", stage: "completed" },
      ]);
    });
    it("should assign an array of steps to a stage (pending)", () => {
      const steps: Step.Props[] = [{ id: "1" }, { id: "2" }, { id: "3" }];

      const result = assignSteps(steps, "pending");

      expect(result).toEqual([
        { id: "1", stage: "pending" },
        { id: "2", stage: "pending" },
        { id: "3", stage: "pending" },
      ]);
    });
    it("should assign an array of nested steps to a stage", () => {
      const steps: Step.Props[] = [
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

      const result = assignSteps(steps, "completed");

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
    it("should return a fresh instance of the object config", () => {
      const config: Step.Props[] = [{ id: "1" }, { id: "2" }, { id: "3" }];

      expect(autoStageSteps(config)).not.toBe(config);
      expect(autoStageSteps(config)).toEqual([
        { id: "1" },
        { id: "2" },
        { id: "3" },
      ]);
    });
    it("should set steps before active step to completed", () => {
      const config: Step.Props[] = [
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
      const config: Step.Props[] = [
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
      const config: Step.Props[] = [
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

      const expected: Step.Props[] = [
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
      const config: Step.Props[] = [
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

      const expected: Step.Props[] = [
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
      const config: Step.Props[] = [
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

      const expected: Step.Props[] = [
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
      const config: Step.Props[] = [
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

      const expected: Step.Props[] = [
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
      const steps: Step.Props[] = [{ id: "1" }, { id: "2" }, { id: "3" }];

      expect(flattenSteps(steps)).toEqual(steps);
    });
    it("should return flattenSteps array of steps (depth 1)", () => {
      const steps: Step.Props[] = [
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
      const steps: Step.Props[] = [
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
});
