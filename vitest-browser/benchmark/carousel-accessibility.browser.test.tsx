import { composeStories } from "@storybook/react-vite";
import { describe } from "vitest";
import * as carouselStories from "~stories/carousel.stories";
import { checkAccessibility } from "./accessibility";

const composedStories = composeStories(carouselStories);

describe("GIVEN a carousel", () => {
  checkAccessibility(composedStories);
});
