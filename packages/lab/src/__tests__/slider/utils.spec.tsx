import { describe, expect, it } from "vitest";
import {
  clampValue,
  getMarkStyles,
  getNearestIndex,
  getPercentage,
  getPercentageDifference,
  getPercentageOffset,
  roundToStep,
} from "../../slider/internal/utils";

describe("Slider utils", () => {
  describe("roundToStep", () => {
    it("should round values to the nearest step", () => {
      expect(roundToStep(10.1, 5)).toEqual(10);
      expect(roundToStep(5.5, 2)).toEqual(6);
      expect(roundToStep(0.1115, 1)).toEqual(0);
    });
  });

  describe("clampValue", () => {
    it("should clamp values between min and max", () => {
      expect(clampValue(10, [0, 5])).toEqual(5);
      expect(clampValue(-5, [0, 5])).toEqual(0);
      expect(clampValue(2, [0, 5])).toEqual(2);
    });
  });

  describe("getPercentage", () => {
    it("should return the percentage of a value between min and max", () => {
      expect(getPercentage(0, 10, 5)).toEqual(50);
    });
  });

  describe("getPercentageDifference", () => {
    it("should return the percentage difference between two values", () => {
      expect(getPercentageDifference(0, 10, [0, 5])).toEqual("50%");
    });
  });

  describe("getPercentageOffset", () => {
    it("should return the percentage offset of a range value", () => {
      expect(getPercentageOffset(0, 10, [0, 5])).toEqual("0%");
    });
  });

  describe("getMarkStyles", () => {
    it("should return an array of marks with their position", () => {
      expect(getMarkStyles(0, 10, 5)).toEqual([
        { label: "0", value: 0, position: "0%" },
        { label: "5", value: 5, position: "50%" },
        { label: "10", value: 10, position: "100%" },
      ]);
    });
  });

  describe("getNearestIndex", () => {
    it("should return the index of the nearest value in an array", () => {
      expect(getNearestIndex([0, 5], 2)).toEqual(0);
      expect(getNearestIndex([0, 5], 4)).toEqual(1);
      expect(getNearestIndex([100, 120], 101)).toEqual(0);
      expect(getNearestIndex([100, 120], 199)).toEqual(1);
      expect(getNearestIndex([100, 120], 119)).toEqual(1);
    });
  });
});
