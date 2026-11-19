import { AdapterDateFnsTZ } from "@salt-ds/date-adapters/date-fns-tz";
import { describe } from "vitest";
import { registerAdapterTests } from "./calendar.suite";

describe("GIVEN a Calendar", () => {
  registerAdapterTests(new AdapterDateFnsTZ());
});
