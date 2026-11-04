import { Step } from "@salt-ds/core";
import { CompactStepper } from "@salt-ds/lab";
import { composeStories } from "@storybook/react-vite";
import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { renderWithSalt } from "~browser-test-utils/render";
import * as compactStepperStories from "~stories/compact-stepper/compact-stepper.stories";

const { Default } = composeStories(compactStepperStories);

function getText() {
  return document.querySelector(".saltCompactStepper-text")?.textContent;
}

describe("GIVEN a CompactStepper", () => {
  it("THEN shows the position and label of the active step", async () => {
    await renderWithSalt(<Default />);

    expect(getText()).toBe("Step 2 of 4: Payment details");
  });

  it("THEN shows the last step with a full bar WHEN every step is completed", async () => {
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
    expect(getText()).toBe("Step 3 of 3: Three");
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
