import { composeStories } from "@storybook/react";
import * as countrySymbolStory from "../../../stories/CountrySymbol.stories";
import { checkAccessibility } from "../../../../../cypress/tests/checkAccessibility";

const composedStories = composeStories(countrySymbolStory);

describe("Given a CountrySymbol", () => {
  checkAccessibility(composedStories);
});
