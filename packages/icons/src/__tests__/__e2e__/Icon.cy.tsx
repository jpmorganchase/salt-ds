import { composeStories } from "@storybook/testing-react";
import * as iconStory from "../../../stories/icon.stories";
import { checkAccessibility } from "../../../../../cypress/tests/checkAccessibility";

const composedStories = composeStories(iconStory);

describe("Given an icon", () => {
  checkAccessibility(composedStories);
});
