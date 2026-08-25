import { composeStories } from "@storybook/react-vite";
import { describe } from "vitest";
import { checkAccessibility } from "~browser-test-utils/accessibility";
import * as countrySymbolStories from "~stories/CountrySymbol.stories";

const composedStories = composeStories(countrySymbolStories);

describe("Given a CountrySymbol", () => {
  checkAccessibility(composedStories);
});
