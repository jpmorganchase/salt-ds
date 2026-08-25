import { composeStories } from "@storybook/react-vite";
import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { renderWithSalt } from "~browser-test-utils/render";
import * as linearProgressStories from "~stories/progress/linear-progress.stories";

const composedStories = composeStories(linearProgressStories);
const { Default, Indeterminate } = composedStories;

describe("GIVEN a LinearProgress", () => {
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

  it("renders a provided buffer value", async () => {
    await renderWithSalt(<Default bufferValue={50} />);

    expect(
      page
        .getByRole("progressbar")
        .element()
        .querySelector(".saltLinearProgress-buffer"),
    ).toBeInTheDocument();
  });

  it("renders an indeterminate progress bar", async () => {
    await renderWithSalt(<Indeterminate />);
    const progressbar = page.getByRole("progressbar");

    await expect.element(progressbar).toHaveAttribute("aria-valuemax", "100");
    await expect.element(progressbar).toHaveAttribute("aria-valuemin", "0");
    await expect.element(progressbar).not.toHaveAttribute("aria-valuenow");
  });
});
