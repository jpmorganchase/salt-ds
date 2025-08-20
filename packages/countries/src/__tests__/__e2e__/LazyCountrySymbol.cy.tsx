import { composeStories } from "@storybook/react-vite";
import { checkAccessibility } from "../../../../../cypress/tests/checkAccessibility";
import * as countrySymbolStory from "../../../stories/LazyCountrySymbol.stories";

const composedStories = composeStories(countrySymbolStory);

describe("Given an LazyCountrySymbol", () => {
  checkAccessibility(composedStories);

  it("should not crash if passed in invalid code", () => {
    const { LazyCountrySymbol } = composedStories;
    cy.mount(
      // @ts-expect-error
      <LazyCountrySymbol code="invalid" />,
    );
  });
});
