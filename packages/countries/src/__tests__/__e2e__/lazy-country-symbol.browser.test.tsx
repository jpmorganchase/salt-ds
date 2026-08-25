import { composeStories } from "@storybook/react-vite";
import { describe, it } from "vitest";
import { checkAccessibility } from "~browser-test-utils/accessibility";
import { renderWithSalt } from "~browser-test-utils/render";
import * as lazyCountrySymbolStories from "~stories/LazyCountrySymbol.stories";

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
