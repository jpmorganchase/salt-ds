import {
  SteppedTracker,
  TrackerStep,
  StepLabel,
} from "../../../stepped-tracker";
import * as steppedTrackerStories from "@stories/stepped-tracker/stepped-tracker.stories";
import { composeStories } from "@storybook/react";

import { checkAccessibility } from "../../../../../../cypress/tests/checkAccessibility";

const composedStories = composeStories(steppedTrackerStories);

describe("GIVEN a SteppedTracker", () => {
  checkAccessibility(composedStories);

  it("should render TrackerStep components as children", () => {
    const labels = ["Step 1", "Step 2", "Step 3"];
    const activeStep = 1;

    const TestComponent = (
      <SteppedTracker activeStep={activeStep} style={{ width: 300 }}>
        {labels.map((label, key) => (
          <TrackerStep key={key}>
            <StepLabel>{label}</StepLabel>
          </TrackerStep>
        ))}
      </SteppedTracker>
    );

    cy.mount(TestComponent);
    labels.forEach((label) => {
      cy.findByText(label).should("be.visible");
    });
  });

  it("should indicate the active step with aria-current", () => {
    const labels = ["Step 1", "Step 2", "Step 3"];
    const activeStep = 1;

    const TestComponent = (
      <SteppedTracker activeStep={activeStep} style={{ width: 300 }}>
        {labels.map((label, key) => (
          <TrackerStep key={key}>
            <StepLabel>{label}</StepLabel>
          </TrackerStep>
        ))}
      </SteppedTracker>
    );

    cy.mount(TestComponent);

    cy.findAllByRole("listitem")
      .filter(`:nth-child(${activeStep + 1})`)
      .should("have.attr", "aria-current", "step");

    cy.findAllByRole("listitem")
      .not(`:nth-child(${activeStep + 1})`)
      .should("not.have.attr", "aria-current");
  });

  it("should indicate the active step with an active icon", () => {
    const labels = ["Step 1", "Step 2", "Step 3"];
    const activeStep = 1;

    const TestComponent = (
      <SteppedTracker activeStep={activeStep} style={{ width: 300 }}>
        {labels.map((label, key) => (
          <TrackerStep key={key}>
            <StepLabel>{label}</StepLabel>
          </TrackerStep>
        ))}
      </SteppedTracker>
    );

    cy.mount(TestComponent);

    cy.findAllByRole("listitem")
      .filter(`:nth-child(${activeStep + 1})`)
      .findByTestId("StepActiveIcon")
      .should("exist");
    cy.findAllByRole("listitem")
      .not(`:nth-child(${activeStep + 1})`)
      .findByTestId("StepActiveIcon")
      .should("not.exist");
  });

  it("should indicate the completed step with a completed icon", () => {
    const labels = ["Step 1", "Step 2", "Step 3"];
    const activeStep = 1;
    const completedStep = 2;

    const TestComponent = (
      <SteppedTracker activeStep={activeStep} style={{ width: 300 }}>
        {labels.map((label, key) => (
          <TrackerStep
            key={key}
            TBC_PROP_NAME={key === completedStep ? "completed" : undefined}
          >
            <StepLabel>{label}</StepLabel>
          </TrackerStep>
        ))}
      </SteppedTracker>
    );

    cy.mount(TestComponent);

    cy.findAllByRole("listitem")
      .filter(`:nth-child(${completedStep + 1})`)
      .findByTestId("StepSuccessIcon")
      .should("exist");
    cy.findAllByRole("listitem")
      .not(`:nth-child(${completedStep + 1})`)
      .findByTestId("StepSuccessIcon")
      .should("not.exist");
  });

  it("should show completed icon if icon prop is completed and active", () => {
    const labels = ["Step 1", "Step 2", "Step 3"];

    const stepNum = 1;

    const TestComponent = (
      <SteppedTracker activeStep={stepNum} style={{ width: 300 }}>
        {labels.map((label, key) => (
          <TrackerStep
            key={key}
            TBC_PROP_NAME={key === stepNum ? "completed" : undefined}
          >
            <StepLabel>{label}</StepLabel>
          </TrackerStep>
        ))}
      </SteppedTracker>
    );

    cy.mount(TestComponent);

    cy.findAllByRole("listitem")
      .filter(`:nth-child(${stepNum + 1})`)
      .findByTestId("StepSuccessIcon")
      .should("exist");
    cy.findAllByRole("listitem")
      .not(`:nth-child(${stepNum + 1})`)
      .findByTestId("StepActiveIcon")
      .should("not.exist");
  });

  it("should show warning icon if icon prop is warning", () => {
    const labels = ["Step 1", "Step 2", "Step 3"];

    const TestComponent = (
      <SteppedTracker activeStep={0} style={{ width: 300 }}>
        {labels.map((label, key) => (
          <TrackerStep
            key={key}
            TBC_PROP_NAME={key === 1 ? "warning" : undefined}
          >
            <StepLabel>{label}</StepLabel>
          </TrackerStep>
        ))}
      </SteppedTracker>
    );

    cy.mount(TestComponent);

    cy.findAllByRole("listitem")
      .filter(`:nth-child(${2})`)
      .findByTestId("WarningSolidIcon")
      .should("exist");
  });

  it("should show error icon if icon prop is error", () => {
    const labels = ["Step 1", "Step 2", "Step 3"];

    const TestComponent = (
      <SteppedTracker activeStep={0} style={{ width: 300 }}>
        {labels.map((label, key) => (
          <TrackerStep
            key={key}
            TBC_PROP_NAME={key === 1 ? "error" : undefined}
          >
            <StepLabel>{label}</StepLabel>
          </TrackerStep>
        ))}
      </SteppedTracker>
    );

    cy.mount(TestComponent);

    cy.findAllByRole("listitem")
      .filter(`:nth-child(${2})`)
      .findByTestId("ErrorSolidIcon")
      .should("exist");
  });
});
