import { AdapterDateFnsTZ } from "@salt-ds/date-adapters/date-fns-tz";
import { describe } from "vitest";
import { registerAdapterTests } from "./calendar-a11y.suite";

describe("GIVEN a Calendar", () => {
  registerAdapterTests(new AdapterDateFnsTZ());
});
