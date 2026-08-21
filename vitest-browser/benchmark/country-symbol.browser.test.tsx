import { composeStories } from "@storybook/react-vite";
import { describe } from "vitest";
import * as countrySymbolStories from "../../packages/countries/stories/CountrySymbol.stories";
import { checkAccessibility } from "./accessibility";

const composedStories = composeStories(countrySymbolStories);

describe("Given a CountrySymbol", () => {
  checkAccessibility(composedStories);
});
