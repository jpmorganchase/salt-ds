import { composeStories } from "@storybook/react";
import * as countrySymbolStory from "../../../stories/LazyCountrySymbol.stories";
import { checkAccessibility } from "../../../../../cypress/tests/checkAccessibility";

const composedStories = composeStories(countrySymbolStory);

describe("Given an LazyCountrySymbol", () => {
  checkAccessibility(composedStories);
});
