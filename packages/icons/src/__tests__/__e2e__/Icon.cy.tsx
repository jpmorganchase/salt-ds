import { composeStories } from "@storybook/react";
import { checkAccessibility } from "../../../../../cypress/tests/checkAccessibility";
import * as iconStory from "../../../stories/icon.stories";

const composedStories = composeStories(iconStory);

describe("Given an icon", () => {
  checkAccessibility(composedStories);
});
