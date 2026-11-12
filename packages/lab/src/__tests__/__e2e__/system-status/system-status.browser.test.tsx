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

  it("does not have a role by default", async () => {
    await renderWithSalt(
      <SystemStatus data-testid="system-status">
        <SystemStatusContent>
          New feature updates are available.
        </SystemStatusContent>
      </SystemStatus>,
    );

    await expect
      .element(page.getByTestId("system-status"))
      .not.toHaveAttribute("role");
  });
});
