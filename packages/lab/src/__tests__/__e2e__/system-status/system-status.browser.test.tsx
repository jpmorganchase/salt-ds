import { OnSolidButton, SaltProvider } from "@salt-ds/core";
import { CloseIcon } from "@salt-ds/icons";
import {
  SystemStatus,
  SystemStatusActions,
  SystemStatusContent,
} from "@salt-ds/lab";
import { composeStories } from "@storybook/react-vite";
import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { checkAccessibility } from "~browser-test-utils/accessibility";
import { renderWithSalt } from "~browser-test-utils/render";
import * as systemStatusStories from "~stories/system-status/system-status.stories";

const composedStories = composeStories(systemStatusStories);
// biome-ignore lint/suspicious/noShadowRestrictedNames: Error is the story name.
const { Info, Success, Error, Warning, WithActions } = composedStories;

const densities = ["high", "medium", "low", "touch"] as const;

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

  it("renders actions", async () => {
    await renderWithSalt(<WithActions />);

    await expect
      .element(page.getByRole("button", { name: "Refresh" }))
      .toBeInTheDocument();
    await expect
      .element(page.getByRole("button", { name: "Dismiss" }))
      .toBeInTheDocument();
  });

  it.each(densities)(
    "sizes the icon to the line height and centres it on the first line in %s density",
    async (density) => {
      await renderWithSalt(
        <SaltProvider density={density}>
          <SystemStatus>
            <SystemStatusContent data-testid="content">
              example announcement
            </SystemStatusContent>
          </SystemStatus>
        </SaltProvider>,
      );

      const icon = page
        .getByTestId("InfoSolidIcon")
        .element()
        .getBoundingClientRect();
      const content = page.getByTestId("content").element();
      const lineHeight = Number.parseFloat(
        getComputedStyle(content).lineHeight,
      );
      const firstLineCentre =
        content.getBoundingClientRect().top + lineHeight / 2;

      expect(icon.width).toBe(lineHeight);
      expect(icon.top + icon.height / 2).toBeCloseTo(firstLineCentre, 0);
    },
  );

  it.each(densities)(
    "keeps the same height with or without actions in %s density",
    async (density) => {
      await renderWithSalt(
        <SaltProvider density={density}>
          <SystemStatus data-testid="without-actions">
            <SystemStatusContent>example announcement</SystemStatusContent>
          </SystemStatus>
          <SystemStatus data-testid="with-actions">
            <SystemStatusContent>example announcement</SystemStatusContent>
            <SystemStatusActions>
              <OnSolidButton aria-label="Dismiss">
                <CloseIcon aria-hidden />
              </OnSolidButton>
            </SystemStatusActions>
          </SystemStatus>
        </SaltProvider>,
      );

      const heightWithoutActions = page
        .getByTestId("without-actions")
        .element()
        .getBoundingClientRect().height;
      const heightWithActions = page
        .getByTestId("with-actions")
        .element()
        .getBoundingClientRect().height;

      expect(heightWithActions).toBe(heightWithoutActions);
    },
  );
});
