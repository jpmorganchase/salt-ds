import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type MockInstance,
  vi,
} from "vitest";
import {
  deprecatedComponent,
  deprecatedFunction,
} from "../../utils/deprecatedExport";

describe("deprecatedExport", () => {
  let warnSpy: MockInstance;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  describe("deprecatedFunction", () => {
    it("should warn on first call", () => {
      const original = vi.fn((x: number) => x + 1);
      const wrapped = deprecatedFunction(
        original,
        "test-hook",
        "hook is deprecated",
      );

      const result = wrapped(1);

      expect(result).toBe(2);
      expect(original).toHaveBeenCalledWith(1);
      expect(warnSpy).toHaveBeenCalledWith("hook is deprecated");
    });

    it("should only warn once for the same key", () => {
      const original = vi.fn((x: number) => x + 1);
      const wrapped = deprecatedFunction(
        original,
        "test-hook-once",
        "hook is deprecated",
      );

      wrapped(1);
      wrapped(2);
      wrapped(3);

      expect(original).toHaveBeenCalledTimes(3);
      expect(warnSpy).toHaveBeenCalledTimes(1);
    });

    it("should preserve the return value", () => {
      const original = () => ({ data: [1, 2, 3] });
      const wrapped = deprecatedFunction(
        original,
        "test-hook-return",
        "deprecated",
      );

      expect(wrapped()).toEqual({ data: [1, 2, 3] });
    });

    it("should forward all arguments", () => {
      const original = vi.fn(
        (a: string, b: number, c: boolean) => `${a}-${b}-${c}`,
      );
      const wrapped = deprecatedFunction(
        original,
        "test-hook-args",
        "deprecated",
      );

      const result = wrapped("hello", 42, true);

      expect(result).toBe("hello-42-true");
      expect(original).toHaveBeenCalledWith("hello", 42, true);
    });
  });

  describe("deprecatedComponent", () => {
    it("should set the displayName", () => {
      const FakeComponent = () => null;
      const wrapped = deprecatedComponent(
        FakeComponent,
        "FakeComponent",
        "test-component",
        "component is deprecated",
      );

      expect(wrapped.displayName).toBe("FakeComponent");
    });

    it("should not warn at wrap time", () => {
      const FakeComponent = () => null;
      deprecatedComponent(
        FakeComponent,
        "FakeComponent",
        "test-component-no-warn",
        "component is deprecated",
      );

      expect(warnSpy).not.toHaveBeenCalled();
    });
  });
});
