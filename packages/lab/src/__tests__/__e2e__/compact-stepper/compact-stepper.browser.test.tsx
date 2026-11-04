import { composeStories } from "@storybook/react-vite";
import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { renderWithSalt } from "~browser-test-utils/render";
import * as compactStepperStories from "~stories/compact-stepper/compact-stepper.stories";

const { Default, Statuses } = composeStories(compactStepperStories);

describe("GIVEN a CompactStepper", () => {
  it("shows the position and label of the active step", async () => {
    await renderWithSalt(<Default />);

    await expect.element(page.getByText(/^Step 2 of 4:/)).toBeVisible();
    await expect.element(page.getByText("Payment details")).toBeVisible();
  });

  it("shows an icon when the current step has an error", async () => {
    await renderWithSalt(<Statuses />);

    await expect
      .element(page.getByTestId("ErrorSolidIcon"))
      .toBeInTheDocument();
  });
});
