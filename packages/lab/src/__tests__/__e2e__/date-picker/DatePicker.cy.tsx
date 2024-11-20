import {
  AdapterDateFns,
  AdapterDayjs,
  AdapterLuxon,
  AdapterMoment,
} from "@salt-ds/lab";
import * as datePickerStories from "@stories/date-picker/date-picker.stories";
import { composeStories } from "@storybook/react";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";

const composedStories = composeStories(datePickerStories);

const adapters: [AdapterDateFns, AdapterDayjs, AdapterLuxon, AdapterMoment] = [
  new AdapterDateFns(),
  new AdapterDayjs(),
  new AdapterLuxon(),
  new AdapterMoment(),
];

describe("GIVEN a DatePicker", () => {
  adapters.forEach((adapter) => {
    describe(`Tests with ${adapter.lib}`, () => {
      beforeEach(() => {
        cy.setDateAdapter(adapter);
      });

      checkAccessibility(composedStories);
    });
  });
});
