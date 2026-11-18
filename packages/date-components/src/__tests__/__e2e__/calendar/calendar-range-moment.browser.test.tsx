import { AdapterMoment } from "@salt-ds/date-adapters/moment";
import { describe } from "vitest";
import {
  registerMultiselectTests,
  registerRangeTests,
} from "./calendar-range.suite";

describe('GIVEN a Calendar with selectionVariant="range"', () => {
  registerRangeTests(new AdapterMoment());
});

describe('GIVEN a Calendar with selectionVariant="range" and multiselect', () => {
  registerMultiselectTests(new AdapterMoment());
});
