import { Step, type StepStage, type StepStatus } from "@salt-ds/core";
import { CompactStepper } from "@salt-ds/lab";
import { composeStories } from "@storybook/react-vite";
import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { checkAccessibility } from "~browser-test-utils/accessibility";
import { renderWithSalt } from "~browser-test-utils/render";
import * as compactStepperStories from "~stories/compact-stepper/compact-stepper.stories";

const composedStories = composeStories(compactStepperStories);
const { Default } = composedStories;

function getText() {
  return document
    .querySelector(".saltCompactStepper-text")
    ?.textContent?.replace(/\s+/g, " ");
}

describe("GIVEN a CompactStepper", () => {
  checkAccessibility(composedStories);

  it("THEN shows the position and label of the active step", async () => {
    await renderWithSalt(<Default />);

    expect(getText()).toBe("Step 2 of 4: Payment details, active");
  });

  it("THEN renders a group named by aria-label", async () => {
    await renderWithSalt(<Default aria-label="Checkout progress" />);

    await expect
      .element(page.getByRole("group"))
      .toHaveAccessibleName("Checkout progress");
  });

  it("THEN hides the progress bar from assistive technology", async () => {
    await renderWithSalt(<Default />);

    expect(
      document.querySelector(".saltCompactStepper-barContainer"),
    ).toHaveAttribute("aria-hidden", "true");
  });

  it.each<[StepStage, StepStatus | undefined, string]>([
    ["active", "error", "Step 2 of 3: Two, error"],
    ["active", "warning", "Step 2 of 3: Two, warning"],
    ["locked", undefined, "Step 2 of 3: Two, locked"],
    ["locked", "error", "Step 2 of 3: Two, error"],
  ])(
    "THEN reads the state WHEN the current step is %s with status %s",
    async (stage, status, expected) => {
      await renderWithSalt(
        <CompactStepper>
          <Step label="One" stage="completed" />
          <Step label="Two" stage={stage} status={status} />
          <Step label="Three" />
        </CompactStepper>,
      );

      expect(getText()).toBe(expected);
    },
  );

  it("THEN fills the whole bar WHEN every step is completed", async () => {
    await renderWithSalt(
      <CompactStepper>
        <Step label="One" stage="completed" />
        <Step label="Two" stage="completed" />
        <Step label="Three" stage="completed" />
      </CompactStepper>,
    );

    const bar = document.querySelector(".saltCompactStepper-bar");
    const track = document.querySelector(".saltCompactStepper-barContainer");
    expect(bar?.clientWidth).toBe(track?.clientWidth);
    expect(getText()).toBe("Step 3 of 3: Three, completed");
  });

  it.each<[string, StepStage, StepStage, number]>([
    ["the first", "active", "pending", 0],
    ["the last", "completed", "active", 0.5],
  ])(
    "THEN fills only the completed steps WHEN %s step is active",
    async (_, firstStage, secondStage, ratio) => {
      await renderWithSalt(
        <div style={{ width: 200 }}>
          <CompactStepper>
            <Step label="One" stage={firstStage} />
            <Step label="Two" stage={secondStage} />
          </CompactStepper>
        </div>,
      );

      const bar = document.querySelector(".saltCompactStepper-bar");
      expect(bar?.clientWidth).toBe(200 * ratio);
    },
  );

  it("THEN renders no text or bar WHEN no step is active or locked and not every step is completed", async () => {
    await renderWithSalt(
      <CompactStepper>
        <Step label="One" stage="completed" />
        <Step label="Two" />
      </CompactStepper>,
    );

    expect(getText()).toBeUndefined();
    expect(document.querySelector(".saltCompactStepper-bar")).toBeNull();
  });

  it("THEN shows the status icon instead of the lock WHEN a locked step has a status", async () => {
    await renderWithSalt(
      <CompactStepper>
        <Step label="One" stage="completed" />
        <Step label="Two" stage="locked" status="error" />
      </CompactStepper>,
    );

    await expect
      .element(page.getByTestId("ErrorSolidIcon"))
      .toBeInTheDocument();
    await expect
      .element(page.getByTestId("LockedIcon"))
      .not.toBeInTheDocument();
  });

  it("THEN renders no text or bar WHEN there are no steps", async () => {
    await renderWithSalt(<CompactStepper data-testid="compact-stepper" />);

    await expect
      .element(page.getByTestId("compact-stepper"))
      .toBeInTheDocument();
    expect(getText()).toBeUndefined();
    expect(document.querySelector(".saltCompactStepper-bar")).toBeNull();
  });
});
