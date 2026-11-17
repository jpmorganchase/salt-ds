import { AdapterDayjs } from "@salt-ds/date-adapters/dayjs";
import { describe } from "vitest";
import { registerAdapterTests } from "./date-picker-single.suite";

describe("GIVEN a DatePicker where selectionVariant is single", () => {
  registerAdapterTests(new AdapterDayjs());
});
