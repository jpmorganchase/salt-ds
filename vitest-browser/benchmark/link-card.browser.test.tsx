import { composeStories } from "@storybook/react-vite";
import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import * as linkCardStories from "~stories/link-card/link-card.stories";
import { renderWithSalt } from "../render";
import { checkAccessibility } from "./accessibility";

const composedStories = composeStories(linkCardStories);
const { Default } = composedStories;

describe("Given a Link Card", () => {
  checkAccessibility(composedStories);

  it("renders children", async () => {
    await renderWithSalt(<Default />);
    await expect
      .element(page.getByText("Sustainable investing products"))
      .toBeVisible();
    await expect
      .element(
        page.getByText(
          "We have a commitment to provide a wide range of investment solutions to enable you to align your financial goals to your values.",
        ),
      )
      .toBeVisible();
  });

  it("applies the correct href", async () => {
    await renderWithSalt(<Default />);
    await expect.element(page.getByRole("link")).toHaveAttribute("href", "#");
  });
});
