import { composeStories } from "@storybook/react-vite";
import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import * as dividerStories from "~stories/divider/divider.stories";
import { renderWithSalt } from "../render";
import { checkAccessibility } from "./accessibility";

const composedStories = composeStories(dividerStories);
const { Variants, Vertical } = composedStories;

describe("GIVEN a Divider", () => {
  checkAccessibility(composedStories);

  it("has horizontal aria-orientation", async () => {
    await renderWithSalt(<Variants />);
    const separators = page.getByRole("separator");

    for (const separator of await separators.elements()) {
      expect(separator).toHaveAttribute("aria-orientation", "horizontal");
    }
  });

  it("has vertical aria-orientation", async () => {
    await renderWithSalt(<Vertical />);
    const separators = page.getByRole("separator");

    for (const separator of await separators.elements()) {
      expect(separator).toHaveAttribute("aria-orientation", "vertical");
    }
  });
});
