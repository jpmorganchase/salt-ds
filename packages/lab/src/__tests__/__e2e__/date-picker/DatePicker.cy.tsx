import { composeStories } from "@storybook/react";
import * as datePickerStories from "@stories/date-picker/date-picker.stories";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";

const composedStories = composeStories(datePickerStories);

describe("GIVEN a DatePicker where selectionVariant is single", () => {
  checkAccessibility(composedStories);
});
