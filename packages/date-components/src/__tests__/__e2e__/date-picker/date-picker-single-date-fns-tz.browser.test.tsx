import { AdapterDateFnsTZ } from "@salt-ds/date-adapters/date-fns-tz";
import { describe } from "vitest";
import { registerAdapterTests } from "./date-picker-single.suite";

describe("GIVEN a DatePicker where selectionVariant is single", () => {
  registerAdapterTests(new AdapterDateFnsTZ());
});
