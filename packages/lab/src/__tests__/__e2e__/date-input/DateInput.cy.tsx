import * as dateInputStories from "@stories/date-input/date-input.stories";
import { composeStories } from "@storybook/react";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";

const composedStories = composeStories(dateInputStories);

describe("GIVEN a DateInput", () => {
  checkAccessibility(composedStories);
});
