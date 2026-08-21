import { composeStories } from "@storybook/react-vite";
import { describe, it } from "vitest";
import * as lazyCountrySymbolStories from "../../packages/countries/stories/LazyCountrySymbol.stories";
import { renderWithSalt } from "../render";
import { checkAccessibility } from "./accessibility";

const composedStories = composeStories(lazyCountrySymbolStories);
const { LazyCountrySymbol } = composedStories;

describe("Given a LazyCountrySymbol", () => {
  checkAccessibility(composedStories);

  it("does not crash for an invalid code", async () => {
    await renderWithSalt(
      // @ts-expect-error testing runtime handling of an invalid country code
      <LazyCountrySymbol code="invalid" />,
    );
  });
});
