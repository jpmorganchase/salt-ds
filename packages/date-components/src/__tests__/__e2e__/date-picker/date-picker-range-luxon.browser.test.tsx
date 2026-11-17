import { AdapterLuxon } from "@salt-ds/date-adapters/luxon";
import { describe } from "vitest";
import { registerAdapterTests } from "./date-picker-range.suite";

describe("GIVEN a DatePicker where selectionVariant is range", () => {
  registerAdapterTests(new AdapterLuxon());
});
