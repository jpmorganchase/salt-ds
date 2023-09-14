import { test, describe, expect } from "vitest";
import { isTransparent } from "../../color-chooser/color-utils";

describe("isTransparent", () => {
  test("should be false WHEN given 6 digits hex", () => {
    expect(isTransparent("#123123")).toBe(false);
  });
  test("should be false WHEN given nothing", () => {
    expect(isTransparent()).toBe(false);
  });
  test("should be false WHEN given 8 digits hex and alpha not 0", () => {
    expect(isTransparent("#12312308")).toBe(false);
  });
  test("should be true WHEN given 8 digits hex and alpha is 0", () => {
    expect(isTransparent("#00000000")).toBe(true);
    expect(isTransparent("#12345600")).toBe(true);
  });
});
