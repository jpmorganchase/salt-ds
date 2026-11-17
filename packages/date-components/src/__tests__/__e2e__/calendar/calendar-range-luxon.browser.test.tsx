import { AdapterLuxon } from "@salt-ds/date-adapters/luxon";
import { describe } from "vitest";
import {
  registerMultiselectTests,
  registerRangeTests,
} from "./calendar-range.suite";

describe('GIVEN a Calendar with selectionVariant="range"', () => {
  registerRangeTests(new AdapterLuxon());
});

describe('GIVEN a Calendar with selectionVariant="range" and multiselect', () => {
  registerMultiselectTests(new AdapterLuxon());
});
