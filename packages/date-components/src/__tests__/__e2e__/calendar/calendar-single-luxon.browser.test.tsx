import { AdapterLuxon } from "@salt-ds/date-adapters/luxon";
import { describe } from "vitest";
import {
  registerMultiselectTests,
  registerSingleTests,
} from "./calendar-single.suite";

describe('GIVEN a Calendar with selectionVariant="single"', () => {
  registerSingleTests(new AdapterLuxon());
});

describe('GIVEN a Calendar with selectionVariant="single" and multiselect', () => {
  registerMultiselectTests(new AdapterLuxon());
});
