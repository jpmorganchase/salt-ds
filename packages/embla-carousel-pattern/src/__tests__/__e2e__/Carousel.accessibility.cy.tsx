import * as carouselStories from "@stories/carousel.stories";
import { composeStories } from "@storybook/react";
import { checkAccessibility } from "../../../../../cypress/tests/checkAccessibility";

const composedStories = composeStories(carouselStories);

describe("GIVEN a carousel", () => {
  checkAccessibility(composedStories);
});
