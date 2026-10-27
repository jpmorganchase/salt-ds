import { SystemStatus, SystemStatusContent } from "@salt-ds/lab";
import { composeStories } from "@storybook/react-vite";
import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { checkAccessibility } from "~browser-test-utils/accessibility";
import { renderWithSalt } from "~browser-test-utils/render";
import * as systemStatusStories from "~stories/system-status/system-status.stories";

const composedStories = composeStories(systemStatusStories);
const { Statuses } = composedStories;

describe("GIVEN a System status", () => {
  checkAccessibility(composedStories);

  it.each([
    "InfoSolidIcon",
    "SuccessCircleSolidIcon",
    "WarningSolidIcon",
    "ErrorSolidIcon",
  ])("hides the %s status icon from screen readers", async (testId) => {
    await renderWithSalt(<Statuses />);
    await expect
      .element(page.getByTestId(testId))
      .toHaveAttribute("aria-hidden", "true");
  });

  it("has a default status role", async () => {
    const message = "example announcement";
    await renderWithSalt(
      <SystemStatus>
        <SystemStatusContent>{message}</SystemStatusContent>
      </SystemStatus>,
    );

    await expect.element(page.getByRole("status")).toHaveTextContent(message);
  });
});
