import { composeStories } from "@storybook/react";
import * as carouselStories from "~stories/carousel.stories";
import { checkAccessibility } from "~test-utils/checkAccessibility";

const composedStories = composeStories(carouselStories);

describe("GIVEN a carousel", () => {
  checkAccessibility(composedStories);
});
