import { describe, it, expect } from "vitest";
import { Color } from "../../color-chooser";

describe("Color", () => {
  describe("get hex", () => {
    it("should get the hex value as 6 digit hex if alpha is 1", () => {
      const newColor = Color.makeColorFromRGB(255, 255, 255, 1);
      expect(newColor.hex).toEqual("#ffffff");
    });
    it("should get the hex value as 8 digit hex if alpha is not 1", () => {
      const newColor = Color.makeColorFromRGB(255, 255, 255, 0.5);
      expect(newColor.hex).toEqual("#ffffff80");
    });
  });
  describe("get rgba", () => {
    it("should get the rgba value", () => {
      const newColor = Color.makeColorFromRGB(255, 255, 255, 1);
      expect(newColor.rgba).toEqual({ a: 1, b: 255, g: 255, r: 255 });
    });
  });
  describe("get colorName", () => {
    it("should get white value", () => {
      const newColor = Color.makeColorFromRGB(255, 255, 255, 1);
      expect(newColor.colorName).toEqual("White");
    });
    it("should get transparent value", () => {
      const newColor = Color.makeColorFromRGB(12, 34, 56, 0);
      expect(newColor.colorName).toEqual("Transparent");
    });
    it("should get the salt palette name", () => {
      const newColor = Color.makeColorFromRGB(214, 85, 19, 1);
      expect(newColor.colorName).toEqual("Orange700");
    });
    it("should get undefined with unknown color", () => {
      const newColor = Color.makeColorFromRGB(1, 2, 3, 1);
      expect(newColor.colorName).toBeUndefined();
    });
  });
  describe("makeColorFromHex", () => {
    it("should make the correct color object with 6 digit hex", () => {
      const newColor = Color.makeColorFromHex("#4E8FC0");
      expect(newColor).toEqual({
        color: expect.objectContaining({
          _a: 1,
          _b: 192,
          _g: 143,
          _r: 78,
        }),
      });
    });
    it("should make the correct color object with 8 digit hex", () => {
      const newColor = Color.makeColorFromHex("#4E8FC080");
      expect(newColor).toEqual({
        color: expect.objectContaining({
          _a: 0.5019607843137255,
          _b: 192,
          _g: 143,
          _r: 78,
        }),
      });
    });
    it("should return undefined if invalid hex is passed in", () => {
      const newColor = Color.makeColorFromHex("#4E8FC0FFABC");
      expect(newColor).toEqual(undefined);

      const anotherColor = Color.makeColorFromHex("#4E8F&080");
      expect(anotherColor).toEqual(undefined);
    });
  });
  describe("makeColorFromRGB", () => {
    it("should make the correct color from rgb values and default a to 1", () => {
      const newColor = Color.makeColorFromRGB(70, 14, 19);
      expect(newColor).toEqual({
        color: expect.objectContaining({
          _a: 1,
          _b: 19,
          _g: 14,
          _r: 70,
        }),
      });
      expect(newColor.hex).toEqual("#460e13");
    });
    it("should make the correct color from rgba values", () => {
      const newColor = Color.makeColorFromRGB(70, 14, 19, 0.5);
      expect(newColor).toEqual({
        color: expect.objectContaining({
          _a: 0.5,
          _b: 19,
          _g: 14,
          _r: 70,
        }),
      });
      expect(newColor.hex).toEqual("#460e1380");
    });
  });

  describe("setAlpha", () => {
    it("should override the alpha value in a color created from rgba", () => {
      let newColor = Color.makeColorFromRGB(70, 14, 19, 0.7).setAlpha(0.3);
      expect(newColor).toEqual({
        color: expect.objectContaining({
          _a: 0.3,
          _b: 19,
          _g: 14,
          _r: 70,
        }),
      });
      expect(newColor.hex).toEqual("#460e134d");
    });
    it("should add an alpha value to a color created from rgb", () => {
      const newColor = Color.makeColorFromRGB(70, 14, 19).setAlpha(0.8);
      expect(newColor).toEqual({
        color: expect.objectContaining({
          _a: 0.8,
          _b: 19,
          _g: 14,
          _r: 70,
        }),
      });
      expect(newColor.hex).toEqual("#460e13cc");
    });
    it("should ignore incorrect alpha values", () => {
      const newColor = Color.makeColorFromRGB(70, 14, 19).setAlpha(-3);
      expect(newColor).toEqual({
        color: expect.objectContaining({
          _a: 1,
          _b: 19,
          _g: 14,
          _r: 70,
        }),
      });
      const anotherNewColor = Color.makeColorFromRGB(70, 14, 19).setAlpha(57);
      expect(anotherNewColor.hex).toEqual("#460e13");
    });
    it("should add an alpha value to a color created from hex", () => {
      const newColor = Color.makeColorFromHex("#460e13")?.setAlpha(0.4);
      expect(newColor).toEqual({
        color: expect.objectContaining({
          _a: 0.4,
          _b: 19,
          _g: 14,
          _r: 70,
        }),
      });
      expect(newColor?.hex).toEqual("#460e1366");
    });
  });
});
