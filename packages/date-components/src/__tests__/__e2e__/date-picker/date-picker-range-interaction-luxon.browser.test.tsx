import { AdapterLuxon } from "@salt-ds/date-adapters/luxon";
import { describe } from "vitest";
import { registerInteractionTests } from "./date-picker-range.suite";

describe("GIVEN a DatePicker where selectionVariant is range", () => {
  registerInteractionTests(new AdapterLuxon());
});
