import { describe, expect, it } from "vitest";
import { formatPropType } from "../formatPropType.mjs";

describe("formatPropType", () => {
  it("preserves ordinary type expressions", () => {
    expect(formatPropType({ name: "(value: string) => void" })).toBe(
      "(value: string) => void",
    );
  });

  it("shows the allowed string literals instead of an enum label", () => {
    expect(
      formatPropType({
        name: "enum",
        raw: "Appearance",
        value: [
          { value: '"solid"' },
          { value: '"bordered"' },
          { value: '"transparent"' },
        ],
      }),
    ).toBe('"solid" | "bordered" | "transparent"');
  });

  it("preserves numeric and boolean literal values", () => {
    expect(
      formatPropType({
        name: "enum",
        value: [{ value: "0" }, { value: "1" }, { value: "false" }],
      }),
    ).toBe("0 | 1 | false");
  });

  it("keeps the raw type for a union too long to list", () => {
    expect(
      formatPropType({
        name: "enum",
        raw: "ManyValues",
        value: Array.from({ length: 20 }, (_, index) => ({ value: index })),
      }),
    ).toBe("ManyValues");
  });

  it("uses the raw type when extracted enum values are unavailable", () => {
    expect(formatPropType({ name: "enum", raw: "Appearance" })).toBe(
      "Appearance",
    );
    expect(formatPropType({ name: "enum", raw: "Appearance", value: [] })).toBe(
      "Appearance",
    );
  });

  it("handles incomplete docgen metadata", () => {
    expect(formatPropType({ name: "enum", value: [] })).toBe("enum");
    expect(formatPropType(undefined)).toBe("");
  });
});
