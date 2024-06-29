import { composeStories } from "@storybook/react";
import { checkAccessibility } from "../../../../../cypress/tests/checkAccessibility";
import * as countrySymbolStory from "../../../stories/LazyCountrySymbol.stories";

const composedStories = composeStories(countrySymbolStory);

describe("Given an LazyCountrySymbol", () => {
  checkAccessibility(composedStories);
});
