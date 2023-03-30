import { composeStories } from "@storybook/testing-react";
import * as countrySymbolStory from "../../../stories/LazyCountrySymbol.stories";
import { checkAccessibility } from "../../../../../cypress/tests/checkAccessibility";

const composedStories = composeStories(countrySymbolStory);

describe("Given an LazyCountrySymbol", () => {
  checkAccessibility(composedStories);
});
