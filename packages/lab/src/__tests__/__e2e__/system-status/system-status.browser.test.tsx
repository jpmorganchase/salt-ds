import { SystemStatus, SystemStatusContent } from "@salt-ds/lab";
import { composeStories } from "@storybook/react-vite";
import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { checkAccessibility } from "~browser-test-utils/accessibility";
import { renderWithSalt } from "~browser-test-utils/render";
import * as systemStatusStories from "~stories/system-status/system-status.stories";

const composedStories = composeStories(systemStatusStories);
// biome-ignore lint/suspicious/noShadowRestrictedNames: Error is the story name.
const { Info, Success, Error, Warning } = composedStories;

describe("GIVEN a System status", () => {
  checkAccessibility(composedStories);

  it.each([
    [Info, "InfoSolidIcon"],
    [Success, "SuccessCircleSolidIcon"],
    [Warning, "WarningSolidIcon"],
    [Error, "ErrorSolidIcon"],
  ] as const)("renders the story status", async (Story, testId) => {
    await renderWithSalt(<Story />);
    await expect.element(page.getByTestId(testId)).toBeInTheDocument();
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
