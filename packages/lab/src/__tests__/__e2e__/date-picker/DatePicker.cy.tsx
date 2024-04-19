import { composeStories } from "@storybook/react";
import { ChangeEvent } from "react";
import * as datePickerStories from "@stories/date-picker/date-picker.stories";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";
const composedStories = composeStories(datePickerStories);
const { Default, Range } = composedStories;

describe("GIVEN a DatePicker", () => {
  checkAccessibility(composedStories);

  // TEST:
  // SINGLE:
  // - single renders with the calendar button and placeholder
  // - you can type a date into the field
  // - check disabled works fine
  // - click on the button opens the panel
  // - focus opens the panel
  // TODO: there is a problem with clicking the button renders.
  // - check that button and unfocus closes the pannel
  // - check dismiss closes the panel TODO: currently not working
  // - check that blur/enter submits the date and updates the calendar
  // - check that updates in the calendar update the input
  // - check the date is right for edge cases? (diff locales, diff date formats ... times could affect if the parsing is wrong)
  // RANGE:
});
