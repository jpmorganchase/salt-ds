import { getRefFromChildren } from "@salt-ds/core";
import { describe, expect, it } from "vitest";

describe("getRefFromChildren", () => {
  it("should return null if child is not a valid element", () => {
    expect(getRefFromChildren(null)).toBeNull();
    expect(getRefFromChildren(undefined)).toBeNull();
    expect(getRefFromChildren("string")).toBeNull();
    expect(getRefFromChildren(123)).toBeNull();
    // biome-ignore lint/complexity/noUselessFragments: test file
    expect(getRefFromChildren(<></>)).toBeNull();
    expect(getRefFromChildren([])).toBeNull();
  });

  it("should return null if ref is not defined", () => {
    const child = <button />;
    expect(getRefFromChildren(child)).toBeNull();
  });

  it("should return ref from child", () => {
    const ref = () => {};
    const child = <button ref={ref} />;
    expect(getRefFromChildren(child)).toBe(ref);
  });
});
