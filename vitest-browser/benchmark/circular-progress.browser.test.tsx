import { composeStories } from "@storybook/react-vite";
import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import * as circularProgressStories from "~stories/progress/circular-progress.stories";
import { renderWithSalt } from "../render";

const composedStories = composeStories(circularProgressStories);
const { Default } = composedStories;

describe("GIVEN a CircularProgress", () => {
  it("renders the correct value and percentage", async () => {
    await renderWithSalt(<Default value={50} />);
    const progressbar = page.getByRole("progressbar");

    await expect.element(progressbar).toHaveAttribute("aria-valuemax", "100");
    await expect.element(progressbar).toHaveAttribute("aria-valuemin", "0");
    await expect.element(progressbar).toHaveAttribute("aria-valuenow", "50");
  });

  it("renders custom min and max values", async () => {
    await renderWithSalt(<Default min={20} max={40} value={35} />);
    const progressbar = page.getByRole("progressbar");

    await expect.element(progressbar).toHaveAttribute("aria-valuemax", "40");
    await expect.element(progressbar).toHaveAttribute("aria-valuemin", "20");
    await expect.element(progressbar).toHaveTextContent("75 %");
    await expect.element(progressbar).not.toHaveTextContent("0");
  });
});
