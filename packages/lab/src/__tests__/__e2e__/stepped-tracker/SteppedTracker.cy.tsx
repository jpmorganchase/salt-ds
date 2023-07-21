import {
  SteppedTracker,
  TrackerStep,
  StepLabel,
} from "../../../stepped-tracker";
import * as steppedTrackerStories from "@stories/stepped-tracker/stepped-tracker.stories";
import { composeStories } from "@storybook/testing-react";

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
            state={key === completedStep ? "completed" : undefined}
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

  it("should show completed icon if a state is completed and active", () => {
    const labels = ["Step 1", "Step 2", "Step 3"];

    const stepNum = 1;

    const TestComponent = (
      <SteppedTracker activeStep={stepNum} style={{ width: 300 }}>
        {labels.map((label, key) => (
          <TrackerStep
            key={key}
            state={key === stepNum ? "completed" : undefined}
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

  it("should have focusable steps when a label is truncated", () => {
    const labels = [
      "Step 1",
      `Step 2: ${"very ".repeat(30)} long label`,
      "Step 3",
    ];
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

    // Need to wait for truncation to be detected and steps to be made focusable before next step
    cy.get('li[tabindex="0"]');

    cy.realPress("Tab");
    let focusedIndex = 0;

    cy.findAllByRole("listitem")
      .filter(`:nth-child(${focusedIndex + 1})`)
      .should("be.focused");
    cy.findAllByRole("listitem")
      .not(`:nth-child(${focusedIndex + 1})`)
      .should("not.be.focused");
    cy.findByRole("tooltip").should("contain.text", labels[focusedIndex]);

    cy.realPress("Tab");
    focusedIndex = focusedIndex + 1;

    cy.findAllByRole("listitem")
      .filter(`:nth-child(${focusedIndex + 1})`)
      .should("be.focused");
    cy.findAllByRole("listitem")
      .not(`:nth-child(${focusedIndex + 1})`)
      .should("not.be.focused");
    cy.findByRole("tooltip").should("have.text", labels[focusedIndex]);
  });
});
