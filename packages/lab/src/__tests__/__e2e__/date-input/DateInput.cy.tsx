import { composeStories } from "@storybook/react";
import * as dateInputStories from "@stories/date-input/date-input.stories";
import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";

const composedStories = composeStories(dateInputStories);

describe("GIVEN a DateInput", () => {
  checkAccessibility(composedStories);
});
