import { AdapterLuxon } from "@salt-ds/date-adapters/luxon";
import { describe } from "vitest";
import { registerAdapterTests } from "./calendar-a11y.suite";

describe("GIVEN a Calendar", () => {
  registerAdapterTests(new AdapterLuxon());
});
