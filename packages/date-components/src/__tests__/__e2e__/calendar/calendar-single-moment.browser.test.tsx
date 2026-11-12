import { AdapterMoment } from "@salt-ds/date-adapters/moment";
import { describe } from "vitest";
import {
  registerMultiselectTests,
  registerSingleTests,
} from "./calendar-single.suite";

describe('GIVEN a Calendar with selectionVariant="single"', () => {
  registerSingleTests(new AdapterMoment());
});

describe('GIVEN a Calendar with selectionVariant="single" and multiselect', () => {
  registerMultiselectTests(new AdapterMoment());
});
