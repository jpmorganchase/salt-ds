import { describe } from "vitest";
import { adapterMoment, registerAdapterTests } from "./calendar.suite";

describe("GIVEN a Calendar", () => {
  registerAdapterTests(adapterMoment);
});
