import { describe, expect, it } from "vitest";
import { VALIDATION_NAMED_STATUS, ValidationStatusValues } from "../index";

describe("ValidationStatus public exports", () => {
  it("exports the supported values and deprecated alias through the Core root", () => {
    expect(ValidationStatusValues).toEqual([
      "error",
      "warning",
      "success",
      "info",
    ]);
    expect(VALIDATION_NAMED_STATUS).toBe(ValidationStatusValues);
  });
});
