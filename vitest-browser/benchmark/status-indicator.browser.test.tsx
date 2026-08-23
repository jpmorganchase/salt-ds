import { composeStories } from "@storybook/react-vite";
import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import * as statusIndicatorStories from "~stories/status-indicator/status-indicator.stories";
import { renderWithSalt } from "../render";
import { checkAccessibility } from "./accessibility";

const composedStories = composeStories(statusIndicatorStories);
const { Default } = composedStories;

describe("Given a Status Indicator", () => {
  checkAccessibility(composedStories);

  it.each(["error", "success", "warning", "info"] as const)(
    "renders the %s status",
    async (status) => {
      await renderWithSalt(<Default status={status} />);
      const indicator = page.getByLabelText(status);

      await expect
        .element(indicator)
        .toHaveClass(`saltStatusIndicator-${status}`);
      await expect.element(indicator).toHaveAttribute("aria-label", status);
    },
  );

  it("does not crash for an invalid status", async () => {
    // @ts-expect-error testing runtime handling of an invalid status
    await renderWithSalt(<Default status="invalid" />);
    await expect.element(page.getByLabelText("invalid")).not.toBeInTheDocument();
  });
});
