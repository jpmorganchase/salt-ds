import { AdapterMoment } from "@salt-ds/date-adapters/moment";
import { describe } from "vitest";
import { registerAdapterTests } from "./date-picker-single.suite";

describe("GIVEN a DatePicker where selectionVariant is single", () => {
  registerAdapterTests(new AdapterMoment());
});
