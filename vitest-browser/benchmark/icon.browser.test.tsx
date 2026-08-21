import { composeStories } from "@storybook/react-vite";
import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import * as iconStories from "../../packages/icons/stories/icon.stories";
import { renderWithSalt } from "../render";
import { checkAccessibility } from "./accessibility";

const composedStories = composeStories(iconStories);
const { SaltIcon } = composedStories;

describe("Given an icon", () => {
  checkAccessibility(composedStories);

  it("has no image role or aria-label when aria-hidden", async () => {
    await renderWithSalt(<SaltIcon data-testid="SaltIcon" aria-hidden />);

    await expect.element(page.getByRole("img")).not.toBeInTheDocument();
    await expect
      .element(page.getByTestId("SaltIcon"))
      .not.toHaveAttribute("aria-label");
  });
});
