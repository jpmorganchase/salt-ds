import { describe, it, expect } from "vitest";
import {
  isValidHex,
  hexValueWithoutAlpha,
  getColorNameByHexValue,
  convertColorMapValueToHex,
} from "../../color-chooser";

describe("Color chooser helpers", () => {
  describe("isValidHex", () => {
    it("should determine whether the hex value is valid or not", () => {
      expect(isValidHex("#D1F4C7")).toEqual(true);
      expect(isValidHex("#D1F4C780")).toEqual(true);
      expect(isValidHex("D1F4C7")).toEqual(false);
      expect(isValidHex("#D1F4C78&")).toEqual(false);
      expect(isValidHex("#D1F4C7801")).toEqual(false);
      expect(isValidHex("#D1F4C")).toEqual(false);
      expect(isValidHex(undefined)).toEqual(false);
      expect(isValidHex("")).toEqual(false);
    });
  });
  describe("hexValueWithoutAlpha", () => {
    it("should take the alpha channel off the hex value", () => {
      expect(hexValueWithoutAlpha("#D1F4C780")).toEqual("#D1F4C7");
    });
    it("should not take characters off a 6 digit hex", () => {
      expect(hexValueWithoutAlpha("#D1F4C7")).toEqual("#D1F4C7");
    });
    it("should return undefined with an invalid hex", () => {
      expect(hexValueWithoutAlpha("#D1F4C")).toEqual(undefined);
    });
    it("should return undefined if passed undefined", () => {
      expect(hexValueWithoutAlpha(undefined)).toEqual(undefined);
    });
  });
  describe("getColorNameByHexValue", () => {
    it("should get the correct Salt color name if passed 6 digit hex", () => {
      expect(getColorNameByHexValue("#D1F4C9", false)).toEqual("Green10");
    });
    it("should get the correct Salt color name if passed 8 digit hex", () => {
      expect(getColorNameByHexValue("#D1F4C980", false)).toEqual("Green10");
    });
    it("should format White and Black hex values correctly", () => {
      expect(getColorNameByHexValue("WHITE", false)).toEqual("White");
      expect(getColorNameByHexValue("BLACK", false)).toEqual("Black");
    });
    it("should just return the hex value if it is not a Salt color", () => {
      expect(getColorNameByHexValue("#D1F4C7", false)).toEqual("#D1F4C7");

      expect(getColorNameByHexValue("#D1F4C780", false)).toEqual("#D1F4C780");
    });
    it("should just return the hex value with no alpha if it is not a Salt color and alpha slider is disabled", () => {
      expect(getColorNameByHexValue("#D1F4C780", true)).toEqual("#D1F4C7");
    });

    describe("WHEN disableFallBackToHex", () => {
      it("should get the correct Salt color name if passed 6 digit hex", () => {
        expect(
          getColorNameByHexValue("#D1F4C9", false, undefined, true)
        ).toEqual("Green10");
      });
      it("should get the correct Salt color name if passed 8 digit hex", () => {
        expect(
          getColorNameByHexValue("#D1F4C980", false, undefined, true)
        ).toEqual("Green10");
      });
      it("should just return undefined if it is not a Salt color and alpha slider is disabled", () => {
        expect(
          getColorNameByHexValue("#D1F4C780", true, undefined, true)
        ).toBeUndefined();
      });
    });
  });
  describe("convertColorMapValueToHex", () => {
    it("Should convert rgb string into hex value", () => {
      expect(convertColorMapValueToHex("rgb(217, 221, 227)")).toEqual(
        "#d9dde3"
      );
      expect(convertColorMapValueToHex("rgb(162, 217, 218)")).toEqual(
        "#a2d9da"
      );
      expect(convertColorMapValueToHex("rgb(0, 0, 0)")).toEqual("#000000");
      expect(convertColorMapValueToHex("rgba(0, 34, 67, 0.9)")).toEqual(
        "#002243e6"
      );
    });
    it("should not convert a string that does not start with rgb/rgba to hex", () => {
      expect(convertColorMapValueToHex("abcdef")).toEqual("abcdef");
    });
  });
});
