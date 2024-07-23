import { describe, expect, it } from "vitest";
import {
  roundToTwoDp,
  roundToStep,
  clampValue,
  getPercentage,
  getPercentageDifference,
  getPercentageOffset,
  getMarkStyles,
  getNearestIndex,
} from "../../slider/internal/utils";

describe("Slider utils", () => {
  describe("roundToTwoDp", () => {
    it("should round values to two decimal places", () => {
      expect(roundToTwoDp(1000.0001)).toEqual(1000);
    });
  });
  describe("roundToStep", () => {
    it("should round values to the nearest step", () => {
      expect(roundToStep(10.1, 5)).toEqual(10);
    });
  });
  describe("clampValue", () => {
    it("should clamp values between min and max", () => {
      expect(clampValue(10, 0, 5)).toEqual(5);
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
        { index: 0, position: "0%" },
        { index: 5, position: "50%" },
        { index: 10, position: "100%" },
      ]);
    });
  });
  describe("getNearestIndex", () => {
    it("should return the index of the nearest value in an array", () => {
      expect(getNearestIndex([0, 5], 2)).toEqual(0);
    });
  });
});
