import { composeStories } from "@storybook/react";
import { checkAccessibility } from "../../../../../cypress/tests/checkAccessibility";
import * as countrySymbolStory from "../../../stories/CountrySymbol.stories";

const composedStories = composeStories(countrySymbolStory);

describe("Given a CountrySymbol", () => {
  checkAccessibility(composedStories);
});
