import { AdapterDateFnsTZ } from "@salt-ds/date-adapters/date-fns-tz";
import { describe } from "vitest";
import {
  registerMultiselectTests,
  registerRangeTests,
} from "./calendar-range.suite";

describe('GIVEN a Calendar with selectionVariant="range"', () => {
  registerRangeTests(new AdapterDateFnsTZ());
});

describe('GIVEN a Calendar with selectionVariant="range" and multiselect', () => {
  registerMultiselectTests(new AdapterDateFnsTZ());
});
