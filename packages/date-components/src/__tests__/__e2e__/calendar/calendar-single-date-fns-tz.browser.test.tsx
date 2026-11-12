import { AdapterDateFnsTZ } from "@salt-ds/date-adapters/date-fns-tz";
import { describe } from "vitest";
import {
  registerMultiselectTests,
  registerSingleTests,
} from "./calendar-single.suite";

describe('GIVEN a Calendar with selectionVariant="single"', () => {
  registerSingleTests(new AdapterDateFnsTZ());
});

describe('GIVEN a Calendar with selectionVariant="single" and multiselect', () => {
  registerMultiselectTests(new AdapterDateFnsTZ());
});
