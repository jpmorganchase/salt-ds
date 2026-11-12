import { AdapterLuxon } from "@salt-ds/date-adapters/luxon";
import { describe } from "vitest";
import { registerAdapterTests } from "./date-picker-single.suite";

describe("GIVEN a DatePicker where selectionVariant is single", () => {
  registerAdapterTests(new AdapterLuxon());
});
