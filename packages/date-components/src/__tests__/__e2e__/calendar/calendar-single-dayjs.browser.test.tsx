import { AdapterDayjs } from "@salt-ds/date-adapters/dayjs";
import { describe } from "vitest";
import {
  registerMultiselectTests,
  registerSingleTests,
} from "./calendar-single.suite";

describe('GIVEN a Calendar with selectionVariant="single"', () => {
  registerSingleTests(new AdapterDayjs());
});

describe('GIVEN a Calendar with selectionVariant="single" and multiselect', () => {
  registerMultiselectTests(new AdapterDayjs());
});
