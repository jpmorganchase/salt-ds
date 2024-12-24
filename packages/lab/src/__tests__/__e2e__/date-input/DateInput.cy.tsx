import {
  AdapterDateFns,
  AdapterDayjs,
  AdapterLuxon,
  AdapterMoment,
} from "@salt-ds/date-adapters";
import * as dateInputStories from "@stories/date-input/date-input.stories";
import { composeStories } from "@storybook/react";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";

const composedStories = composeStories(dateInputStories);

const adapters: [AdapterDateFns, AdapterDayjs, AdapterLuxon, AdapterMoment] = [
  new AdapterDateFns(),
  new AdapterDayjs(),
  new AdapterLuxon(),
  new AdapterMoment(),
];

describe("GIVEN a DateInput", () => {
  adapters.forEach((adapter) => {
    describe(`Tests with ${adapter.lib}`, () => {
      beforeEach(() => {
        cy.setDateAdapter(adapter);
      });
      checkAccessibility(composedStories);
    });
  });
});
