import { composeStories } from "@storybook/react-vite";
import { describe, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import * as skipLinkStories from "~stories/skip-link/skip-link.stories";
import { renderWithSalt } from "../render";
import { checkAccessibility } from "./accessibility";

const composedStories = composeStories(skipLinkStories);
const { Default } = composedStories;
const instructions = "Click here and press the Tab key to see the Skip Link";
const skipLink = () => page.getByRole("link", { name: "Skip to main content" });
const expectSkipLinkOpacity = async (opacity: "0" | "1") => {
  await expect
    .poll(() => getComputedStyle(skipLink().element()).opacity)
    .toBe(opacity);
};

describe("GIVEN a SkipLink", () => {
  checkAccessibility(composedStories);

  it("moves focus to the target when clicked", async () => {
    await renderWithSalt(<Default />);
    await page.getByText(instructions).click();
    await expectSkipLinkOpacity("0");
    await userEvent.tab();
    await expectSkipLinkOpacity("1");
    await expect.element(skipLink()).toHaveFocus();
    await skipLink().click();

    const target = document.querySelector("#main");
    if (!target) throw new Error("SkipLink story did not render #main");
    await expect.element(page.elementLocator(target)).toHaveFocus();
    await expectSkipLinkOpacity("0");
  });

  it("moves focus to the target with keyboard navigation", async () => {
    await renderWithSalt(<Default />);
    await page.getByText(instructions).click();
    await expectSkipLinkOpacity("0");
    await userEvent.tab();
    await expectSkipLinkOpacity("1");
    await expect.element(skipLink()).toHaveFocus();
    await userEvent.keyboard(" ");

    const target = document.querySelector("#main");
    if (!target) throw new Error("SkipLink story did not render #main");
    await expect.element(page.elementLocator(target)).toHaveFocus();
    await expectSkipLinkOpacity("0");
  });

  it("hides the skip link when its target is broken", async () => {
    await renderWithSalt(<Default targetId="" />);
    await page.getByText(instructions).click();
    await userEvent.tab();
    await expect.element(skipLink()).not.toBeInTheDocument();
  });
});
