import { AdapterDateFnsTZ } from "@salt-ds/date-adapters/date-fns-tz";
import { describe } from "vitest";
import { registerInteractionTests } from "./date-picker-range.suite";

describe("GIVEN a DatePicker where selectionVariant is range", () => {
  registerInteractionTests(new AdapterDateFnsTZ());
});
