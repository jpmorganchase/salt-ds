import { AdapterDayjs } from "@salt-ds/date-adapters/dayjs";
import { describe } from "vitest";
import { registerAdapterTests } from "./calendar-a11y.suite";

describe("GIVEN a Calendar", () => {
  registerAdapterTests(new AdapterDayjs());
});
