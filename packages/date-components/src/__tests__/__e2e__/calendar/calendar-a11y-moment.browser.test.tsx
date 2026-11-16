import { AdapterMoment } from "@salt-ds/date-adapters/moment";
import { describe } from "vitest";
import { registerAdapterTests } from "./calendar-a11y.suite";

describe("GIVEN a Calendar", () => {
  registerAdapterTests(new AdapterMoment());
});
