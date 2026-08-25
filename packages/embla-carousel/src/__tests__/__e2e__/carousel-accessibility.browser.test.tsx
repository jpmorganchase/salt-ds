import { composeStories } from "@storybook/react-vite";
import { describe } from "vitest";
import { checkAccessibility } from "~browser-test-utils/accessibility";
import * as carouselStories from "~stories/carousel.stories";

const composedStories = composeStories(carouselStories);

describe("GIVEN a carousel", () => {
  checkAccessibility(composedStories);
});
