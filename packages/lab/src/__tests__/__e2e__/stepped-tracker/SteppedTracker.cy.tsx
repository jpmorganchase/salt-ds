import * as steppedTrackerStories from "@stories/stepped-tracker/stepped-tracker.stories";
import { composeStories } from "@storybook/react";
import {
  StepLabel,
  SteppedTracker,
  TrackerStep,
} from "../../../stepped-tracker";

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
            stage={key === completedStep ? "completed" : undefined}
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

  it("should show completed icon if stage prop is completed and step is active", () => {
    const labels = ["Step 1", "Step 2", "Step 3"];

    const stepNum = 1;

    const TestComponent = (
      <SteppedTracker activeStep={stepNum} style={{ width: 300 }}>
        {labels.map((label, key) => (
          <TrackerStep
            key={key}
            stage={key === stepNum ? "completed" : undefined}
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

  it("should show warning icon if status prop is warning", () => {
    const labels = ["Step 1", "Step 2", "Step 3"];

    const TestComponent = (
      <SteppedTracker activeStep={0} style={{ width: 300 }}>
        {labels.map((label, key) => (
          <TrackerStep key={key} status={key === 1 ? "warning" : undefined}>
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

  it("should show completed icon if status prop is warning but stage prop is completed", () => {
    const labels = ["Step 1", "Step 2", "Step 3"];

    const TestComponent = (
      <SteppedTracker activeStep={0} style={{ width: 300 }}>
        {labels.map((label, key) => (
          <TrackerStep
            key={key}
            stage={key <= 1 ? "completed" : undefined}
            status={key === 1 ? "warning" : undefined}
          >
            <StepLabel>{label}</StepLabel>
          </TrackerStep>
        ))}
      </SteppedTracker>
    );

    cy.mount(TestComponent);

    cy.findAllByRole("listitem")
      .filter(`:nth-child(${2})`)
      .findByTestId("StepSuccessIcon")
      .should("exist");
  });

  it("should show active icon if status prop is warning but step is active", () => {
    const labels = ["Step 1", "Step 2", "Step 3"];

    const TestComponent = (
      <SteppedTracker activeStep={1} style={{ width: 300 }}>
        {labels.map((label, key) => (
          <TrackerStep key={key} status={key === 1 ? "warning" : undefined}>
            <StepLabel>{label}</StepLabel>
          </TrackerStep>
        ))}
      </SteppedTracker>
    );

    cy.mount(TestComponent);

    cy.findAllByRole("listitem")
      .filter(`:nth-child(${2})`)
      .findByTestId("StepActiveIcon")
      .should("exist");
  });

  it("should show error icon if status prop is error", () => {
    const labels = ["Step 1", "Step 2", "Step 3"];

    const TestComponent = (
      <SteppedTracker activeStep={0} style={{ width: 300 }}>
        {labels.map((label, key) => (
          <TrackerStep key={key} status={key === 1 ? "error" : undefined}>
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

  it("should show in-progress icon for parent steps with only some completed steps", () => {
    const TestComponent = (
      <SteppedTracker
        orientation="vertical"
        activeStep={2}
        style={{ width: "100%", minWidth: 300, maxWidth: 400 }}
      >
        <TrackerStep stage="inprogress">
          <StepLabel>Step 1</StepLabel>
        </TrackerStep>
        <TrackerStep depth={1} stage="completed">
          <StepLabel>Step 1.1</StepLabel>
        </TrackerStep>
        <TrackerStep depth={1}>
          <StepLabel>Step 1.2</StepLabel>
        </TrackerStep>
        <TrackerStep depth={1}>
          <StepLabel>Step 1.3</StepLabel>
        </TrackerStep>
        <TrackerStep>
          <StepLabel>Step 2</StepLabel>
        </TrackerStep>
      </SteppedTracker>
    );

    cy.mount(TestComponent);

    cy.findAllByRole("listitem")
      .filter(`:nth-child(${1})`)
      .findByTestId("ProgressInprogressIcon")
      .should("exist");
  });
});
