import { AdapterDayjs } from "@salt-ds/date-adapters/dayjs";
import { describe } from "vitest";
import {
  registerMultiselectTests,
  registerRangeTests,
} from "./calendar-range.suite";

describe('GIVEN a Calendar with selectionVariant="range"', () => {
  registerRangeTests(new AdapterDayjs());
});

describe('GIVEN a Calendar with selectionVariant="range" and multiselect', () => {
  registerMultiselectTests(new AdapterDayjs());
});
